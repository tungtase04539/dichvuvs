import prisma from "./prisma";

interface CommissionResult {
  userId: string;
  amount: number;
  percent: number;
  level: number;
}

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
                parent: true // Master agent (nếu có)
              }
            }
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
    const settingsMap = new Map(settings.map(s => [s.key, s]));

    const orderValue = order.totalPrice;
    const referrer = order.referrer;

    if (!referrer) return results;

    // 4. Tính commission cho người giới thiệu trực tiếp (Level 1)
    const referrerRole = referrer.role;
    let retailKey = `${referrerRole}_retail`;
    
    // Fallback cho collaborator/ctv
    if (!settingsMap.has(retailKey)) {
      if (referrerRole === 'collaborator') retailKey = 'ctv_retail';
      else if (referrerRole === 'ctv') retailKey = 'collaborator_retail';
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
        amount,
        percent: retailSetting.percent,
        level: 1
      });

      console.log(`[Commission] Level 1: ${referrer.name} nhận ${amount.toLocaleString()}đ (${retailSetting.percent}%)`);
    }

    // 5. Tính commission cho cấp trên (Level 2 - Override)
    if (referrer.parent) {
      const parent = referrer.parent;
      const parentRole = parent.role;
      let overrideKey = `${parentRole}_override`;

      // Fallback
      if (!settingsMap.has(overrideKey) && parentRole === 'agent') {
        overrideKey = 'agent_override';
      }

      const overrideSetting = settingsMap.get(overrideKey);
      if (overrideSetting) {
        const amount = (orderValue * overrideSetting.percent) / 100;

        await prisma.commission.create({
          data: {
            orderId,
            userId: parent.id,
            amount,
            percent: overrideSetting.percent,
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
          amount,
          percent: overrideSetting.percent,
          level: 2
        });

        console.log(`[Commission] Level 2: ${parent.name} nhận ${amount.toLocaleString()}đ (${overrideSetting.percent}%)`);
      }

      // 6. Tính commission cho Master Agent (Level 3)
      if (parent.parent) {
        const masterAgent = parent.parent;
        const masterOverrideSetting = settingsMap.get('master_agent_override_l2');
        
        if (masterOverrideSetting) {
          const amount = (orderValue * masterOverrideSetting.percent) / 100;

          await prisma.commission.create({
            data: {
              orderId,
              userId: masterAgent.id,
              amount,
              percent: masterOverrideSetting.percent,
              level: 3,
              status: 'pending'
            }
          });

          await prisma.user.update({
            where: { id: masterAgent.id },
            data: { balance: { increment: amount } }
          });

          results.push({
            userId: masterAgent.id,
            amount,
            percent: masterOverrideSetting.percent,
            level: 3
          });

          console.log(`[Commission] Level 3: ${masterAgent.name} nhận ${amount.toLocaleString()}đ (${masterOverrideSetting.percent}%)`);
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
    members.map(async (member) => {
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
