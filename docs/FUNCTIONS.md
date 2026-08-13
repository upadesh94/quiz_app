# ⚙️ System Functions & Flow

This file is aligned with `README.md`, `ARCHITECTURE.md`, `sql_shema.txt`, and `filestucture.txt`.

## 🔐 Authentication Flow

1. User enters username + password
2. Username converted to internal email format
3. Authentication service validates credentials
4. Token issued
5. Role fetched from database

---

## 👨‍🏫 Teacher Flow

### Create Student

* Input: username, password, class
* Process:

  * Create auth account
  * Store profile + role metadata in DB
* Output: student account created

---

### Create Quiz

* Input: title, subject
* Output: quiz stored in DB with teacher mapping

---

### Add Questions

* Input: question, options, answer
* Output: stored under quiz

---

## 🛡️ Admin Flow (Super Admin)

### System Management & Auditing

* **Access Control**: Authentic login via Firebase Auth (no hardcoded credentials).
* **Live Session Monitoring**: View all active `ONLINE` or `OFFLINE` user sessions.
* **Master User Record Editor**: Modify user privileges (role escalation/de-escalation), change passwords, reassign classes, and toggle active status.
* **Global Content Management**: Publish, unpublish, or delete Quizzes and view system-wide attempts.
* **Data Inspection**: Firestore JSON Explorer to inspect raw document schema.
* **Security Auditing**: Real-Time Security Audit Stream monitoring all sensitive overrides and creation events.

---

## 👨‍🎓 Student Flow

### Attempt Quiz

* Fetch quiz
* Render questions
* Capture answers
* Submit responses

---

### Submit Quiz

Process:

1. Validate answers
2. Calculate score
3. Calculate percentage
4. Store attempt

---

## 📊 Analytics Flow

### Student

* Fetch attempts
* Group by subject
* Generate performance trend

---

### Teacher

* Fetch all students
* Aggregate data
* Compare performance

### Admin

* Fetch platform-wide aggregates
* Track active users and attempt volume
* Monitor pass-rate trends

---

## 🧠 State Flow

Auth Store:

* user
* role
* token

Quiz Store:

* quizzes
* currentQuiz

Attempt Store:

* answers
* results

---

## 🔄 API Flow

Client → API → DB → Response → UI

---

## ⚠️ Error Handling

* Invalid login
* Network failure
* Data validation errors

---

## 🔒 Security Flow

* **Token Validation**: Firebase JWT authentication on all requests.
* **Route Protection**: React Navigation stack strictly isolated by `role` state in Redux. Attempting to bypass forces a redirect to the Login screen.
* **Database Role-Based Access Control (RBAC)**: `firestore.rules` enforces authorization checks natively on the Google infrastructure.
  * *SuperAdmin*: Unrestricted read/write.
  * *Teacher*: Scoped read/write based on assigned classes.
  * *Student*: Scoped to own attempts and read-only published quizzes.

---

## 🚀 Future Extensions

* AI recommendations
* Leaderboard system
* Live quizzes
* Gamification
