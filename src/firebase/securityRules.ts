export const firestoreSecurityRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }

    match /quizzes/{quizId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role == 'teacher';
    }

    match /attempts/{attemptId} {
      allow read, write: if request.auth != null;
    }
  }
}
`;
