import { PrismaClient } from '@prisma/client';

export default abstract class BaseService {
  constructor(
    protected readonly prismaClient: PrismaClient = new PrismaClient(),
  ) {}
}
