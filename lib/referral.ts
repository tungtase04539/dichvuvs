import prisma from "./prisma";
import { randomUUID } from "crypto";

// Type cho ReferralLink (match với Prisma schema)
interface ReferralLinkData {
  id: string;
  code: string;
  userId: string;
  isActive: boolean;
  clickCount: number;
  orderCount: number;
  revenue: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generate unique referral code
 */
function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "REF-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Tự động tạo referral link cho user
 * Gọi khi user được tạo/approve với vai trò CTV/Đại lý/NPP
 * 
 * @param userId - ID của user cần tạo referral link
 * @returns ReferralLink object hoặc null nếu đã tồn tại
 */
export async function createReferralLinkForUser(userId: string): Promise<ReferralLinkData | null> {
  try {
    // Kiểm tra user có tồn tại và có vai trò phù hợp không
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, name: true, email: true }
    });

    if (!user) {
      console.log(`[Referral] User ${userId} không tồn tại`);
      return null;
    }

    // Chỉ tạo cho các vai trò: admin, master_agent/distributor, agent, collaborator/ctv
    const eligibleRoles = ['admin', 'master_agent', 'distributor', 'agent', 'collaborator', 'ctv'];
    if (!eligibleRoles.includes(user.role)) {
      console.log(`[Referral] User ${user.email} có vai trò ${user.role} không đủ điều kiện tạo referral link`);
      return null;
    }

    // Kiểm tra đã có referral link chưa
    const existingLink = await prisma.referralLink.findFirst({
      where: { userId, isActive: true }
    });

    if (existingLink) {
      console.log(`[Referral] User ${user.email} đã có referral link: ${existingLink.code}`);
      return existingLink;
    }

    // Generate unique code
    let code: string = "";
    let attempts = 0;
    do {
      code = generateReferralCode();
      const exists = await prisma.referralLink.findUnique({ where: { code } });
      if (!exists) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      console.error(`[Referral] Không thể tạo mã unique cho user ${user.email}`);
      return null;
    }

    // Tạo referral link
    const referralLink = await prisma.referralLink.create({
      data: {
        id: randomUUID(),
        code,
        userId
      }
    });

    console.log(`[Referral] Đã tạo referral link ${code} cho user ${user.email} (${user.role})`);
    return referralLink;
  } catch (error) {
    console.error('[Referral] Error creating referral link:', error);
    return null;
  }
}

/**
 * Tạo referral link cho nhiều users cùng lúc
 * Hữu ích khi cần migrate/seed data
 */
export async function createReferralLinksForUsers(userIds: string[]): Promise<ReferralLinkData[]> {
  const created: ReferralLinkData[] = [];
  
  for (const userId of userIds) {
    const link = await createReferralLinkForUser(userId);
    if (link) {
      created.push(link);
    }
  }
  
  console.log(`[Referral] Đã tạo ${created.length}/${userIds.length} referral links`);
  return created;
}

/**
 * Tạo referral link cho tất cả users có vai trò CTV/Đại lý/NPP mà chưa có link
 */
export async function createReferralLinksForAllEligibleUsers() {
  const eligibleRoles = ['admin', 'master_agent', 'distributor', 'agent', 'collaborator', 'ctv'];
  
  // Lấy tất cả users có vai trò phù hợp
  const users = await prisma.user.findMany({
    where: { role: { in: eligibleRoles } },
    select: { id: true, email: true, role: true }
  });

  // Lấy danh sách users đã có referral link
  const userIds = users.map((u: { id: string }) => u.id);
  const existingLinks = await prisma.referralLink.findMany({
    where: { userId: { in: userIds }, isActive: true },
    select: { userId: true }
  });
  
  const usersWithLinksSet = new Set(existingLinks.map((l: { userId: string }) => l.userId));
  
  // Lọc ra users chưa có link
  const usersWithoutLinks = users.filter((u: { id: string }) => !usersWithLinksSet.has(u.id));
  
  console.log(`[Referral] Tìm thấy ${usersWithoutLinks.length} users chưa có referral link`);
  
  // Tạo link cho từng user
  const created: ReferralLinkData[] = [];
  for (const user of usersWithoutLinks) {
    const link = await createReferralLinkForUser(user.id);
    if (link) {
      created.push(link);
    }
  }
  
  console.log(`[Referral] Đã tạo ${created.length} referral links mới`);
  
  return {
    total: users.length,
    alreadyHadLinks: usersWithLinksSet.size,
    created: created.length,
    links: created
  };
}
