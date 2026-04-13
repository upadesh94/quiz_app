export class SessionService {
  static async saveToken(token: string) {
    return Promise.resolve(token);
  }

  static async clearToken() {
    return Promise.resolve(true);
  }
}
