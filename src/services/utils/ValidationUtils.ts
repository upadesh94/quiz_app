export class ValidationUtils {
  static isRequired(value: string) {
    return value.trim().length > 0;
  }

  static isPasswordStrong(password: string) {
    return password.length >= 6;
  }
}
