# 🏗️ Full System Architecture

This file defines the technical architecture consistent with `README.md`, `FUNCTIONS.md`, and `sql_shema.txt`.

---

## 🧱 Database Design (SQL Model)

### USERS TABLE

| Field    | Type    | Description     |
| -------- | ------- | --------------- |
| id       | UUID    | Primary key     |
| username | VARCHAR | Unique          |
| password | VARCHAR | Hashed          |
| role     | VARCHAR | student/teacher/admin |
| class    | VARCHAR | Student class   |

---

### QUIZZES TABLE

| Field      | Type    |
| ---------- | ------- |
| id         | UUID    |
| title      | VARCHAR |
| subject    | VARCHAR |
| created_by | UUID    |

---

### QUESTIONS TABLE

| Field          | Type    |
| -------------- | ------- |
| id             | UUID    |
| quiz_id        | UUID    |
| question       | TEXT    |
| options        | JSON    |
| correct_answer | VARCHAR |

---

### ATTEMPTS TABLE

| Field      | Type      |
| ---------- | --------- |
| id         | UUID      |
| student_id | UUID      |
| quiz_id    | UUID      |
| score      | INT       |
| percentage | FLOAT     |
| created_at | TIMESTAMP |

---

## 🧾 SQL Queries

### Create Tables

CREATE TABLE users (...);
CREATE TABLE quizzes (...);
CREATE TABLE questions (...);
CREATE TABLE attempts (...);

---

### Insert Attempt

INSERT INTO attempts (student_id, quiz_id, score, percentage)
VALUES (?, ?, ?, ?);

---

### Fetch Student Attempts

SELECT * FROM attempts
WHERE student_id = ?;

---

### Analytics Query

SELECT q.subject, AVG(a.score)
FROM attempts a
JOIN quizzes q ON q.id = a.quiz_id
GROUP BY q.subject;

---

## 🔄 Data Flow Diagram (DFD)

Level 0:
User → App → Backend → Database

Level 1:
User → Auth → Quiz Service → Attempt Service → Analytics

---

## 🧠 High-Level Diagram (HLD)

[Mobile App]
↓
[API Layer]
↓
[Services Layer]
(Auth, Quiz, Attempt, Analytics)
↓
[Database]

---

## 🔬 Low-Level Diagram (LLD)

Modules:

* Auth Service
* Quiz Service
* Attempt Service
* Analytics Engine

Each module:

* Controller
* Service
* Data Layer

---

## ⚙️ System Design Principles

* Separation of concerns
* Modular architecture
* Scalable services
* Stateless backend

---

## 🚀 Performance Optimization

* Indexing on student_id
* Pagination for queries
* Caching (future)

---

## 🔐 Security Architecture

* JWT Authentication
* Role-based access
* Input validation
* Database access rules/policies

---

## 📊 Data Aggregation Strategy

* Pre-compute scores
* Store percentage
* Use aggregation queries

---

## 🔮 Future Scalability

* Move to microservices
* Use PostgreSQL + Redis
* Add load balancer
* Deploy on Kubernetes

---

## ⚡ Production Considerations

* Logging system
* Monitoring (Firebase / Sentry)
* CI/CD pipeline
* Backup strategy

---

## 🎯 Final Architecture Goal

A system that is:

* Scalable
* Secure
* Maintainable
* Production-ready
