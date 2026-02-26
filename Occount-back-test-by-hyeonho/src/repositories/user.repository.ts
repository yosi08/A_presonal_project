import prisma from '../lib/prisma';
import { Role, UserType } from '@prisma/client';

export interface CreateUserData {
  userNumber: string;
  userCode: string;
  userCiNumber?: string;
  userName: string;
  userAddress?: string;
  userPhone?: string;
  userEmail: string;
  userPassword: string;
  userPin?: string;
  userFingerPrint?: string;
  roles?: Role;
  userType?: UserType;
}

export interface UpdateUserData {
  userName?: string;
  userAddress?: string;
  userPhone?: string;
  userEmail?: string;
  userPassword?: string;
  userPin?: string;
  userCiNumber?: string;
  userBirthDay?: string;
  userFingerPrint?: string;
  roles?: Role;
}

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { userEmail: email } });
  },

  async findByUserCode(userCode: string) {
    return prisma.user.findUnique({
      where: { userCode },
      include: { investments: true },
    });
  },

  async findByUserNumber(userNumber: string) {
    return prisma.user.findUnique({
      where: { userNumber },
      include: { investments: true },
    });
  },

  async findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  },

  async findAll() {
    return prisma.user.findMany({
      include: { investments: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(data: CreateUserData) {
    return prisma.user.create({ data });
  },

  async update(userNumber: string, data: UpdateUserData) {
    return prisma.user.update({ where: { userNumber }, data });
  },

  async updateById(id: number, data: UpdateUserData) {
    return prisma.user.update({ where: { id }, data });
  },

  async deleteByUserNumber(userNumber: string) {
    return prisma.user.delete({ where: { userNumber } });
  },

  async deleteManyByUserNumbers(userNumbers: string[]) {
    return prisma.user.deleteMany({ where: { userNumber: { in: userNumbers } } });
  },

  async updateMany(userNumbers: string[], data: UpdateUserData) {
    return prisma.user.updateMany({ where: { userNumber: { in: userNumbers } }, data });
  },

  // ---- Password Reset Token ----
  async createResetToken(userId: number, token: string, expiresAt: Date) {
    return prisma.passwordResetToken.create({ data: { userId, token, expiresAt } });
  },

  async findResetToken(token: string) {
    return prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });
  },

  async markTokenUsed(token: string) {
    return prisma.passwordResetToken.update({ where: { token }, data: { used: true } });
  },

  // ---- Student ----
  async findAllStudents() {
    return prisma.student.findMany({ orderBy: { stuName: 'asc' } });
  },

  async findStudentByStuCode(stuCode: string) {
    return prisma.student.findUnique({ where: { stuCode } });
  },

  async findStudentByEmail(stuEmail: string) {
    return prisma.student.findUnique({ where: { stuEmail } });
  },
};
