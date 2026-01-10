import prisma from "./prisma";

interface CommissionResult {
  userId: string;
  userName: string;
  role: string;
  amount: number;
  percent: number;
  level: number;
  type: 'retail' | 'override';
}

interface CommissionSettingData {
  id: string;
  key: string;
  role: string;
  type: string;
  percent: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: Date;
  _count: {
    referredOrders: number;
    subAgents: number;
  };
}

/**
 * Cấu trúc hoa hồng:
 * - Cấp 1: CTV (collaborator) - X% bán trực tiếp
 * - Cấp 2: Đại lý (agent) - Y% bán trực tiếp + (Y-X)% override từ CTV (cần ≥3 CTV)
 * - Cấp 3: Nhà phân phối (distributor) - Z% bán trực tiếp + (Z-Y)% override từ Đại lý (cần ≥3 Đại lý)
 * 
 * Ví dụ mặc định: CTV=10%, Đại lý=15%, NPP=20%
 * - CTV bán: CTV nhận 10%
 * - CTV bán (có Đại lý cấp trên): CTV nhận 10%, Đại lý nhận 5% override
 * - Đại lý bán trực tiếp: Đại lý nhận 15%
 * - Đại lý bán (có NPP cấp trên): Đại lý nhận 15%, NPP nhận 5% override
 */

/**
 * Tính và tạo commission cho một đơn hàng
 * Gọi khi đơn hàng chuyển sang trạng thái confirmed/completed
 */
export async function calculateAndCreateCommissions(orderId: string): Promise<CommissionResult[]> {
  const results: CommissionResult[] = [];

  try {
    // 1. Lấy thông tin đơn hàng
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        referrer: {
          include: {
            parent: {
              include: {
                parent: {
                  include: {
                    _count: { select: { subAgents: true } } // Đếm số cấp dưới của grandParent (NPP)
                  }
                },
                _count: { select: { subAgents: true } } // Đếm số cấp dưới của parent (Đại lý)
              }
            },
            _count: { select: { subAgents: true } } // Đếm số cấp dưới của referrer
          }
        }
      }
    });

    if (!order || !order.referrerId) {
      console.log(`[Commission] Order ${orderId} không có referrer, bỏ qua`);
      return results;
    }

    // 2. Kiểm tra đã tính commission chưa
    const existingCommissions = await prisma.commission.findMany({
      where: { orderId }
    });

    if (existingCommissions.length > 0) {
      console.log(`[Commission] Order ${orderId} đã có commission, bỏ qua`);
      return results;
    }

    // 3. Lấy cấu hình commission
    const settings = await prisma.commissionSetting.findMany();
    const settingsMap = new Map<string, CommissionSettingData>(
      settings.map((s: CommissionSettingData) => [s.key, s])
    );

    const orderValue = order.totalPrice;
    const referrer = order.referrer;

    if (!referrer) return results;

    // 4. Tính commission cho người giới thiệu trực tiếp (Level 1 - Retail)
    const referrerRole = referrer.role;
    let retailKey = `${referrerRole}_retail`;
    
    // Fallback cho collaborator/ctv
    if (!settingsMap.has(retailKey)) {
      if (referrerRole === 'collaborator' || referrerRole === 'ctv') {
        retailKey = 'ctv_retail';
      }
    }

    const retailSetting = settingsMap.get(retailKey);
    if (retailSetting) {
      const amount = (orderValue * retailSetting.percent) / 100;
      
      await prisma.commission.create({
        data: {
          orderId,
          userId: referrer.id,
          amount,
          percent: retailSetting.percent,
          level: 1,
          status: 'pending'
        }
      });

      // Cập nhật balance của user
      await prisma.user.update({
        where: { id: referrer.id },
        data: { balance: { increment: amount } }
      });

      results.push({
        userId: referrer.id,
        userName: referrer.name,
        role: referrerRole,
        amount,
        percent: retailSetting.percent,
        level: 1,
        type: 'retail'
      });

      console.log(`[Commission] Level 1 (Retail): ${referrer.name} (${referrerRole}) nhận ${amount.toLocaleString()}đ (${retailSetting.percent}%)`);
    }

    // 5. Tính commission override cho cấp trên (Level 2)
    // Chỉ tính nếu cấp trên có đủ số lượng cấp dưới theo yêu cầu
    if (referrer.parent) {
      const parent = referrer.parent;
      const parentRole = parent.role;
      const parentSubCount = parent._count?.subAgents || 0;
      
      // Kiểm tra điều kiện: Đại lý cần ≥3 CTV, NPP cần ≥3 Đại lý
      const minSubAgentsRequired = 3;
      const isEligibleForOverride = parentSubCount >= minSubAgentsRequired;
      
      if (isEligibleForOverride) {
        // Tính override = % của cấp trên - % của cấp dưới
        const parentRetailKey = `${parentRole}_retail`;
        const childRetailKey = retailKey;
        
        const parentRetailSetting = settingsMap.get(parentRetailKey);
        const childRetailSetting = settingsMap.get(childRetailKey);
        
        if (parentRetailSetting && childRetailSetting) {
          const overridePercent = parentRetailSetting.percent - childRetailSetting.percent;
          
          if (overridePercent > 0) {
            const amount = (orderValue * overridePercent) / 100;

            await prisma.commission.create({
              data: {
                orderId,
                userId: parent.id,
                amount,
                percent: overridePercent,
                level: 2,
                status: 'pending'
              }
            });

            await prisma.user.update({
              where: { id: parent.id },
              data: { balance: { increment: amount } }
            });

            results.push({
              userId: parent.id,
              userName: parent.name,
              role: parentRole,
              amount,
              percent: overridePercent,
              level: 2,
              type: 'override'
            });

            console.log(`[Commission] Level 2 (Override): ${parent.name} (${parentRole}) nhận ${amount.toLocaleString()}đ (${overridePercent}%) - có ${parentSubCount} cấp dưới`);
          }
        }
      } else {
        console.log(`[Commission] ${parent.name} (${parentRole}) chưa đủ điều kiện override (có ${parentSubCount}/${minSubAgentsRequired} cấp dưới)`);
      }

      // 6. Tính commission cho NPP (Level 3) nếu có
      if (parent.parent) {
        const grandParent = parent.parent;
        const grandParentRole = grandParent.role;
        const grandParentSubCount = grandParent._count?.subAgents || 0;
        
        // NPP cần ≥3 Đại lý
        if (grandParentSubCount >= minSubAgentsRequired && 
            (grandParentRole === 'distributor' || grandParentRole === 'master_agent')) {
          
          const grandParentRetailKey = `${grandParentRole}_retail`;
          const parentRetailKey = `${parentRole}_retail`;
          
          const grandParentRetailSetting = settingsMap.get(grandParentRetailKey);
          const parentRetailSetting = settingsMap.get(parentRetailKey);
          
          if (grandParentRetailSetting && parentRetailSetting) {
            const overridePercent = grandParentRetailSetting.percent - parentRetailSetting.percent;
            
            if (overridePercent > 0) {
              const amount = (orderValue * overridePercent) / 100;

              await prisma.commission.create({
                data: {
                  orderId,
                  userId: grandParent.id,
                  amount,
                  percent: overridePercent,
                  level: 3,
                  status: 'pending'
                }
              });

              await prisma.user.update({
                where: { id: grandParent.id },
                data: { balance: { increment: amount } }
              });

              results.push({
                userId: grandParent.id,
                userName: grandParent.name,
                role: grandParentRole,
                amount,
                percent: overridePercent,
                level: 3,
                type: 'override'
              });

              console.log(`[Commission] Level 3 (Override): ${grandParent.name} (${grandParentRole}) nhận ${amount.toLocaleString()}đ (${overridePercent}%) - có ${grandParentSubCount} cấp dưới`);
            }
          }
        }
      }
    }

    return results;
  } catch (error) {
    console.error('[Commission] Error calculating commissions:', error);
    throw error;
  }
}

/**
 * Lấy thống kê commission của một user
 */
export async function getCommissionStats(userId: string) {
  const [pending, paid, total] = await Promise.all([
    prisma.commission.aggregate({
      where: { userId, status: 'pending' },
      _sum: { amount: true },
      _count: true
    }),
    prisma.commission.aggregate({
      where: { userId, status: 'paid' },
      _sum: { amount: true },
      _count: true
    }),
    prisma.commission.aggregate({
      where: { userId },
      _sum: { amount: true },
      _count: true
    })
  ]);

  return {
    pending: {
      amount: pending._sum.amount || 0,
      count: pending._count
    },
    paid: {
      amount: paid._sum.amount || 0,
      count: paid._count
    },
    total: {
      amount: total._sum.amount || 0,
      count: total._count
    }
  };
}

/**
 * Lấy danh sách đội nhóm (cấp dưới) của một user
 */
export async function getTeamMembers(userId: string) {
  const members = await prisma.user.findMany({
    where: { parentId: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          referredOrders: true,
          subAgents: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Lấy thêm thống kê doanh số cho từng member
  const membersWithStats = await Promise.all(
    members.map(async (member: TeamMember) => {
      const orderStats = await prisma.order.aggregate({
        where: { 
          referrerId: member.id,
          status: { in: ['confirmed', 'completed'] }
        },
        _sum: { totalPrice: true },
        _count: true
      });

      return {
        ...member,
        totalOrders: orderStats._count,
        totalRevenue: orderStats._sum.totalPrice || 0
      };
    })
  );

  return membersWithStats;
}
