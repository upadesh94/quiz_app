# QuizMaster Web App

QuizMaster is a React Native + React Native Web app for school quizzes with separate student and teacher flows.

## Tech Stack

- Frontend: Expo + React Native Web
- Language: TypeScript
- Navigation: React Navigation (Native Stack + Bottom Tabs)
- State Management: Redux Toolkit + React Redux
- Backend/Database: Firebase Auth + Cloud Firestore (service layer ready)
- Charts/Visuals: Custom chart components in React Native
- Tooling: Babel + tsconfig + Expo CLI

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Start in web mode

```bash
npm run start
```

This opens the app in your browser (default Expo web target).

You can also run directly:

```bash
npm run web
```

3. Build for web deployment

```bash
npm run build:web
```

Static files are generated in `dist/`.

4. Preview production build locally

```bash
npm run preview:web
```

5. Optional mobile commands (if needed later)

```bash
npm run start:mobile
npm run android
npm run ios
```

## Available Scripts

- `npm run start` -> `expo start --web`
- `npm run start:mobile` -> `expo start`
- `npm run android` -> `expo run:android`
- `npm run ios` -> `expo run:ios`
- `npm run web` -> `expo start --web`
- `npm run build:web` -> `expo export --platform web`
- `npm run preview:web` -> `npx serve dist`
- `npm run typecheck` -> TypeScript type checking

## Implemented Features

- Role-based app entry and navigation (student and teacher)
- Authentication screens (login/register/forgot password/role selection)
- Student flow:
  - Dashboard
  - Available quizzes
  - Quiz attempt
  - Quiz result
  - Performance analytics
- Teacher flow:
  - Dashboard
  - Create quiz
  - Add questions
  - Manage students
  - Class analytics
- Shared UI components (cards, inputs, buttons, quiz components, charts)

## Quiz Attempt UX Rules

- Submit button appears only on the last question.
- Before final submission, the app shows a confirmation popup.
- If confirmed, answers are submitted and user is navigated to result screen.

## Project Structure

- `src/components` reusable UI and chart components
- `src/screens` student, teacher, auth, and common screens
- `src/navigation` app and role-based navigators
- `src/services` domain services (auth, quiz, attempts, analytics, teacher)
- `src/store` Redux store and slices
- `src/firebase` Firebase config and integration helpers
- `src/types` shared TypeScript models

## Documentation

- `ARCHITECTURE.md` overall system architecture and data model
- `FUNCTIONS.md` feature and function-level references
- `TABLET_UI_QUICK_START.md` tablet UI quick usage notes
- `TABLET_UI_UX.md` tablet UX guidelines

## Next Steps

1. Connect all services to real Firebase Auth and Firestore data.
2. Add automated tests for services and critical screens.
3. Harden role-based authorization and security rules.
4. Improve analytics dashboards with production data and filtering.
