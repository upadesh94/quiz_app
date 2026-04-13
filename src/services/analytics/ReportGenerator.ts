export class ReportGenerator {
  static generateStudentReport(data: { averageScore: number; attemptsCount: number }) {
    return {
      summary: `Attempts: ${data.attemptsCount}, Average Score: ${data.averageScore}%`,
      generatedAt: new Date().toISOString(),
    };
  }
}
