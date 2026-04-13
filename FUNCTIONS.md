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

## 🛡️ Admin Flow

### Manage Platform

* View users and role distribution
* Disable abusive accounts
* Monitor system-level reports

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

* Token validation
* Role verification
* Query restrictions

---

## 🚀 Future Extensions

* AI recommendations
* Leaderboard system
* Live quizzes
* Gamification
