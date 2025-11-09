import { prisma } from './prisma';

export async function createAuditLog(data: {
  entityType: string;
  entityId: string;
  action: string;
  userId?: string;
  metadata?: any;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        userId: data.userId,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw - audit logging should not break the main flow
  }
}

