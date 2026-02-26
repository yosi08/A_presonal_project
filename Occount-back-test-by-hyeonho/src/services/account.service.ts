import bcrypt from 'bcryptjs';
import { userRepository, UpdateUserData } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import { UpdateUserInput } from '../validators/auth.validator';

export const accountService = {
  async getAllUsers() {
    const users = await userRepository.findAll();
    return users.map((u) => ({
      userNumber: u.userNumber,
      userCode: u.userCode,
      userName: u.userName,
      userEmail: u.userEmail,
      userPoint: u.userPoint,
      roles: u.roles,
      totalInvestmentAmount: u.investments.reduce((sum, inv) => sum + inv.amount, 0),
      investments: u.investments,
    }));
  },

  async getUserByCode(userCode: string) {
    const user = await userRepository.findByUserCode(userCode);
    if (!user) throw new AppError('사용자를 찾을 수 없습니다.', 404, 'USER_NOT_FOUND');
    const { userPassword, userPin, ...safeUser } = user;
    return safeUser;
  },

  async getMyInfo(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('사용자를 찾을 수 없습니다.', 404, 'USER_NOT_FOUND');
    return {
      userName: user.userName,
      userEmail: user.userEmail,
      userAddress: user.userAddress,
      userPhone: user.userPhone,
      userType: user.userType,
      userBirthDate: user.userBirthDay,
      userPoint: user.userPoint,
      userCode: user.userCode,
      roles: user.roles,
    };
  },

  async updateMyInfo(userNumber: string, data: UpdateUserInput) {
    const user = await userRepository.findByUserNumber(userNumber);
    if (!user) throw new AppError('사용자를 찾을 수 없습니다.', 404, 'USER_NOT_FOUND');

    const updateData: UpdateUserData = {};
    if (data.userName) updateData.userName = data.userName;
    if (data.userAddress) updateData.userAddress = data.userAddress;
    if (data.userPhone) updateData.userPhone = data.userPhone;
    if (data.userEmail) updateData.userEmail = data.userEmail;
    if (data.userBirthDay) updateData.userBirthDay = data.userBirthDay;

    // 보안 업데이트 (비밀번호/PIN 변경)
    if (data.securityUpdate && data.temporaryToken) {
      if (data.newPassword) {
        updateData.userPassword = await bcrypt.hash(data.newPassword, 12);
      }
      if (data.newPin) {
        updateData.userPin = await bcrypt.hash(data.newPin, 12);
      }
    }

    const updated = await userRepository.update(userNumber, updateData);
    const { userPassword: _, userPin: __, ...safeUser } = updated;
    return safeUser;
  },

  async updateUserByAdmin(userNumber: string, data: UpdateUserInput) {
    return this.updateMyInfo(userNumber, data);
  },

  async batchUpdate(userNumbers: string[], data: UpdateUserInput) {
    const result = await userRepository.updateMany(userNumbers, {
      userName: data.userName,
      userAddress: data.userAddress,
      userPhone: data.userPhone,
      userEmail: data.userEmail,
    });
    return result;
  },

  async batchDelete(userNumbers: string[]) {
    return userRepository.deleteManyByUserNumbers(userNumbers);
  },

  // ---- Student ----
  async getAllStudents() {
    const students = await userRepository.findAllStudents();
    return students;
  },

  async getStudentByStuCode(stuCode: string) {
    const student = await userRepository.findStudentByStuCode(stuCode);
    if (!student) throw new AppError('학생을 찾을 수 없습니다.', 404, 'STUDENT_NOT_FOUND');
    return student;
  },

  async getStudentByEmail(stuEmail: string) {
    const student = await userRepository.findStudentByEmail(stuEmail);
    if (!student) throw new AppError('학생을 찾을 수 없습니다.', 404, 'STUDENT_NOT_FOUND');
    return student;
  },
};
