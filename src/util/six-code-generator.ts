export class SixCodeGenerator {
  static generateCode(): string {
    try {
      return Math.floor(100000 + Math.random() * 900000).toString();
    } catch (error) {
      throw new Error('Failed to generate verification code');
    }
  }
}


