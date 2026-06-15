# NEEP - New Era Education Point

A full-stack educational institute management system built with the MERN stack. NEEP provides multi-branch support with role-based dashboards for administrators, teachers, and students to manage batches, attendance, tests, fees, enquiries, and more.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [Multi-Branch Architecture](#multi-branch-architecture)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Admin Dashboard
- **Batch Management** - Create, edit, archive, and delete batches; assign teachers and enroll students
- **Student Management** - CRUD operations, bulk import via Excel, per-student profile and controls
- **Teacher Management** - CRUD operations, batch assignments, profile management
- **Fee Tracking** - Create fee structures, manage installments, track paid/unpaid/upcoming payments
- **Attendance** - Mark and review student and teacher attendance records
- **Test Management** - Create tests, record marks, edit scores across batches
- **Enquiry Management** - Track prospective students, schedule follow-ups, mark conversions or losses
- **Birthday Celebrations** - View today's and upcoming birthdays for students and teachers
- **Announcements** - Upload pop-up advertisements/notices displayed to all users
- **Timetable Management** - Configure weekly class schedules per batch

### Teacher Dashboard
- View assigned batches and enrolled students
- Mark daily student attendance
- Create and manage tests with score entry
- View batch timetables and today's classes

### Student Dashboard
- View personal attendance records
- Check test scores and performance
- Track fee status and installment history
- View class timetable and enrolled batches
- Download reports as PDF

### Public Pages
- Landing page with course listings, topper highlights, and student reviews
- Contact form with email notifications to admin

---

## Tech Stack

| Layer        | Technology                                                 |
| ------------ | -----------------------------------------------------------|
| **Frontend** | React 19, React Router 7, Vite 7, Bootstrap 5              |
| **Backend**  | Node.js, Express 5                                         |
| **Database** | MongoDB Atlas, Mongoose 8                                  |
| **Auth**     | JWT (JSON Web Tokens), OTP via email                       |
| **Email**    | Brevo SMTP (via Nodemailer)                                |
| **File I/O** | Multer (uploads), XLSX (Excel parsing), jsPDF (PDF export) |
| **Hosting**  | Vercel (frontend), Render (backend)                        |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client (React/Vite)                  │
│   Pages ─── Components ─── Modals ─── CSS/Assets        │
└──────────────────────┬──────────────────────────────────┘
                       │  Axios HTTP (JWT in headers)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend (Express API)                  │
│                                                         │
│   Routes ──► Middleware ──► Controllers ──► Models      │
│              (auth, branch)                             │
│                                                         │
│   Utilities: sendMail, file upload (Multer)             │
└──────────────────────┬──────────────────────────────────┘
                       │  Mongoose ODM
                       ▼
┌─────────────────────────────────────────────────────────┐
│               MongoDB Atlas (Multi-Tenant)              │
│                                                         │
│   realDataBase │ realDataBaseOne │ realDataBaseTwo │ ...│
│   (Branch A)   │ (Branch B)     │ (Branch C)     │      │
└─────────────────────────────────────────────────────────┘
```

The system follows a **multi-tenant architecture** where each institute branch maps to a separate MongoDB database. The `branchMiddleware` extracts the branch identifier from the JWT and attaches the correct database connection to each request.

---

## Project Structure

```
neep/
├── backend/
│   ├── config/
│   │   └── dbManager.js            # Multi-tenant DB connection pool
│   ├── controllers/
│   │   ├── adminController.js       # Admin business logic (2300+ lines)
│   │   ├── authController.js        # Login, OTP, branch switching
│   │   ├── contactController.js     # Contact form handler
│   │   ├── popupController.js       # Announcement management
│   │   ├── studentController.js     # Student data queries
│   │   └── teacherController.js     # Teacher operations
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification + role guards
│   │   ├── branchMiddleware.js      # Multi-branch DB routing
│   │   └── upload.js                # Multer file upload config
│   ├── models/                      # 16 Mongoose schemas (see Database Schema)
│   ├── routes/
│   │   ├── admin.js                 # Admin endpoints
│   │   ├── auth.js                  # Authentication endpoints
│   │   ├── contactus.js             # Contact form endpoint
│   │   ├── popup.js                 # Popup/announcement endpoints
│   │   ├── student.js               # Student endpoints
│   │   └── teacher.js               # Teacher endpoints
│   ├── utils/
│   │   └── sendMail.js              # Email via Brevo SMTP + API
│   ├── uploads/                     # Uploaded files (Excel, images)
│   ├── db.js                        # MongoDB connection setup
│   ├── server.js                    # Express app entry point
│   ├── package.json
│   └── .env
│
├── client/
│   ├── public/
│   │   ├── avatars/                 # Student/teacher avatar images
│   │   └── toppers/                 # Topper photos
│   ├── src/
│   │   ├── assets/                  # Images, fonts, static assets
│   │   ├── components/              # 16 reusable UI components
│   │   ├── css/                     # Stylesheets
│   │   ├── modals/                  # 10 modal dialog components
│   │   ├── pages/                   # 18 page-level components
│   │   ├── App.jsx                  # Root component with routing
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global styles
│   ├── index.html                   # HTML template (includes modal roots)
│   ├── vite.config.js               # Vite build configuration
│   ├── vercel.json                  # Vercel SPA routing config
│   ├── package.json
│   └── .env
│
├── README.md                        # This file
├── docs/
│   ├── API.md                       # Full API reference
│   └── DATABASE.md                  # Database schema documentation
└── .gitignore
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB Atlas** account (or a local MongoDB instance)
- **Brevo** account for transactional email (OTP delivery)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-org>/neep.git
cd neep

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Environment Variables

#### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<default-db>

# Multi-branch database names
DB_BRANCH_A=realDataBase
DB_BRANCH_B=realDataBaseOne
DB_BRANCH_C=realDataBaseTwo
DB_DEFAULT=userDataBase

# Authentication
JWT_SECRET=<your-jwt-secret>

# Email (Brevo SMTP)
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=<brevo-smtp-login>
EMAIL_PASS=<brevo-smtp-password>
BREVO_API_KEY=<brevo-api-key>
```

#### Frontend (`client/.env`)

```env
VITE_BACKEND_URL=http://localhost:5000
```

### Running Locally

```bash
# Terminal 1 - Start the backend
cd backend
node server.js
# Server runs on http://localhost:5000

# Terminal 2 - Start the frontend
cd client
npm run dev
# App runs on http://localhost:5173
```

---

## API Reference

Base URL: `http://localhost:5000/api`

All protected endpoints require a `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint                              | Description                       | Auth     |
| ------ | ------------------------------------- | --------------------------------- | -------- |
| POST   | `/auth/login/student`                 | Student login (phone + DOB)       | Public   |
| POST   | `/auth/login/admin-teacher/send-otp`  | Send OTP to admin/teacher email   | Public   |
| POST   | `/auth/login/admin-teacher/verify-otp`| Verify OTP, receive JWT           | Public   |
| POST   | `/auth/switch-branch`                 | Switch active branch              | Token    |

### Student Endpoints

| Method | Endpoint              | Description                    | Auth    |
| ------ | --------------------- | ------------------------------ | ------- |
| GET    | `/student/attendance` | Fetch attendance records       | Student |
| GET    | `/student/test`       | Get test scores                | Student |
| POST   | `/student/timetable`  | Get timetable for batches      | Student |
| GET    | `/student/fee-status` | Fetch fee & installment info   | Student |
| GET    | `/student/batches`    | Get enrolled batches           | Student |
| GET    | `/student/profile`    | Get student profile            | Student |

### Teacher Endpoints

| Method | Endpoint                          | Description                   | Auth    |
| ------ | --------------------------------- | ----------------------------- | ------- |
| GET    | `/teacher/batches`                | Get assigned batches          | Teacher |
| GET    | `/teacher/batchStudents/:batchId` | List batch students           | Teacher |
| GET    | `/teacher/attendance/:studentId`  | Get student attendance        | Teacher |
| POST   | `/teacher/attendance/mark`        | Mark student attendance       | Teacher |
| GET    | `/teacher/timetable/:batchId`     | Get batch timetable           | Teacher |
| POST   | `/teacher/test/add`               | Create a test                 | Teacher |
| GET    | `/teacher/getTest/:batchId`       | Get tests for a batch         | Teacher |
| GET    | `/teacher/today/timetable`        | Get today's scheduled classes | Teacher |
| PATCH  | `/teacher/editMarks/:testId`      | Update test scores            | Teacher |
| DELETE | `/teacher/deleteTest`             | Delete a test                 | Teacher |

### Admin Endpoints

<details>
<summary><strong>Batch Management</strong></summary>

| Method | Endpoint                          | Description                  |
| ------ | --------------------------------- | ---------------------------- |
| GET    | `/admin/batches`                  | List active batches          |
| GET    | `/admin/archivedBatches`          | List archived batches        |
| GET    | `/admin/getBatchDetails/:batchId` | Get batch details            |
| GET    | `/admin/batchStudents/:batchId`   | List students in a batch     |
| POST   | `/admin/batchCreate`              | Create a new batch           |
| POST   | `/admin/updateTimetable/:batchId` | Update batch timetable       |
| DELETE | `/admin/batchDelete/:batchId`     | Delete a batch               |
| PUT    | `/admin/:batchId/archive`         | Toggle batch archive status  |
| PUT    | `/admin/editBatchProfile/:batchId`| Edit batch details           |

</details>

<details>
<summary><strong>Student Management</strong></summary>

| Method | Endpoint                                    | Description                     |
| ------ | ------------------------------------------- | ------------------------------- |
| GET    | `/admin/students`                           | List all students               |
| GET    | `/admin/getStudentDetails/:studentId`       | Get student profile             |
| GET    | `/admin/studentBatches/:studentId`          | Get student's enrolled batches  |
| POST   | `/admin/studentCreate`                      | Create a new student            |
| DELETE | `/admin/studentDelete/:studentId`           | Delete a student                |
| POST   | `/admin/addStudent/:studentId/:batchId`     | Enroll student in a batch       |
| PUT    | `/admin/editStudntProfile/:studentId`       | Update student profile          |
| POST   | `/admin/upload`                             | Bulk import students via Excel  |

</details>

<details>
<summary><strong>Teacher Management</strong></summary>

| Method | Endpoint                                    | Description                 |
| ------ | ------------------------------------------- | --------------------------- |
| GET    | `/admin/teachers`                           | List all teachers           |
| GET    | `/admin/getTeacherDetails/:teacherId`       | Get teacher profile         |
| POST   | `/admin/teacherCreate`                      | Create a new teacher        |
| DELETE | `/admin/teacherDelete/:teacherId`           | Delete a teacher            |
| PUT    | `/admin/editTeacherProfile/:teacherId`      | Update teacher profile      |
| POST   | `/admin/addTeacherToBatches`                | Assign teacher to batches   |

</details>

<details>
<summary><strong>Fee Management</strong></summary>

| Method | Endpoint                                     | Description                     |
| ------ | -------------------------------------------- | ------------------------------- |
| GET    | `/admin/fee/:studentId`                      | Get fee record                  |
| GET    | `/admin/installments/:studentId`             | Get student's installments      |
| PATCH  | `/admin/fee/update-fee/:studentId`           | Update total fee amount         |
| POST   | `/admin/fee/addInstallment`                  | Add an installment              |
| DELETE | `/admin/fee/removeInstallment/:installmentId`| Remove an installment           |
| PATCH  | `/admin/fee/mark-paid/:id`                   | Mark installment as paid        |
| POST   | `/admin/fee/createFeeWithInstallments`       | Create fee + installments       |
| GET    | `/admin/fee/installments/unpaid`             | List unpaid installments        |
| GET    | `/admin/fee/installments/upcoming`           | List upcoming due dates         |
| GET    | `/admin/fee/installments/paid`               | List paid installments          |

</details>

<details>
<summary><strong>Test Management</strong></summary>

| Method | Endpoint                       | Description             |
| ------ | ------------------------------ | ----------------------- |
| POST   | `/admin/test/addEdit`          | Create or update a test |
| GET    | `/admin/getTest/:batchId`      | Get tests for a batch   |
| PATCH  | `/admin/editMarks/:testId`     | Edit test marks         |
| DELETE | `/admin/deleteTest`            | Delete a test           |

</details>

<details>
<summary><strong>Birthday Management</strong></summary>

| Method | Endpoint                           | Description                    |
| ------ | ---------------------------------- | ------------------------------ |
| GET    | `/admin/birthday/today`            | Today's student birthdays      |
| POST   | `/admin/birthday/wish`             | Mark student as wished         |
| GET    | `/admin/birthdayTeacher/today`     | Today's teacher birthdays      |
| POST   | `/admin/birthdayTeacher/wish`      | Mark teacher as wished         |
| GET    | `/admin/birthday/upcoming`         | Upcoming student birthdays     |
| GET    | `/admin/birthdayTeacher/upcoming`  | Upcoming teacher birthdays     |

</details>

<details>
<summary><strong>Enquiry Management</strong></summary>

| Method | Endpoint                              | Description              |
| ------ | ------------------------------------- | ------------------------ |
| GET    | `/admin/allEnquiries`                 | List all enquiries       |
| POST   | `/admin/enquiryCreate`                | Create an enquiry        |
| GET    | `/admin/getEnquiry/:enquiryId`        | Get enquiry details      |
| PUT    | `/admin/editEnquiry/:enquiryId`       | Update an enquiry        |
| POST   | `/admin/enquiryStatus/:enquiryId`     | Update enquiry status    |
| DELETE | `/admin/enquiryDelete/:enquiryId`     | Delete an enquiry        |

</details>

### Public Endpoints

| Method | Endpoint           | Description                   | Auth   |
| ------ | ------------------ | ----------------------------- | ------ |
| POST   | `/contactus/`      | Submit contact form           | Public |
| GET    | `/getPopup`        | Get current announcement      | Public |
| POST   | `/uploadPopup`     | Upload announcement (image)   | Admin  |

---

## Database Schema

The application uses **16 MongoDB collections** via Mongoose. Below is the entity-relationship overview:

```
┌──────────┐    ┌───────────────┐    ┌──────────┐
│ Student  │◄───│ Batch_Student │───►│  Batch   │
└────┬─────┘    └───────────────┘    └────┬─────┘
     │                                    │
     │          ┌───────────────┐         │
     │          │ Batch_Teacher │─────────┘
     │          └───────┬───────┘
     │                  │
     │          ┌───────▼───────┐
     │          │Admin_Teacher  │
     │          └───────────────┘
     │
     ├──► Attendance        (studentId, batchId, date, status)
     ├──► Test              (studentId, batchId, marks)
     ├──► Fee               (studentId, totalAmount)  1:1
     │     └──► Installment  (feeId, studentId, amount, dueDate, paidDate)
     └──► Birthday_wish     (studentId, TTL: 24h)

Other standalone collections:
  - Enquiry            (prospective student tracking, TTL: 1 year)
  - OTP                (email OTP for login, TTL: 1 hour)
  - Popup              (announcement image + description)
  - TimeTable          (weekday, batchId, classTimings[])
  - Attendance_Teacher (teacherId, batchId, date, status)
  - Birthday_Teacher_wish (teacherId, TTL: 24h)
```

### Key Models

| Model              | Key Fields                                                                 | Notes                             |
| ------------------ | -------------------------------------------------------------------------- | --------------------------------- |
| **Student**        | name, phone, dob, address, class, dateOfJoining, guardianName, schoolType  | Class enum: Kids, English Spoken, 9-12, Entrance Exams, Graduation |
| **Admins_Teacher** | name, email, phone, role, dob, address, qualification, aadhar, experience  | Role: Admin or Teacher            |
| **Batch**          | name, code, class, startDate, archive                                      | Archivable; class matches Student enum |
| **Batch_Student**  | batchId, batchName, studentId                                              | Many-to-many join                 |
| **Batch_Teacher**  | batchId (unique), batchName, teacherId                                     | One teacher per batch             |
| **Attendance**     | studentId, batchId, date, status, markedBy                                 | Status: present/absent            |
| **Test**           | name, maxMarks, marksScored, studentId, batchId, date, absent              | Date format: DD-MM-YYYY           |
| **Fee**            | studentId (unique), totalAmount                                            | One fee record per student        |
| **Installment**    | feeId, studentId, installmentNo, dueDate, paidDate, method, amount         | Method: Online/Cash               |
| **Enquiry**        | studentName, phone, enquiryDate, followupDate, classSubject, followupType, status | Status: lost/converted; TTL: 1 year |
| **TimeTable**      | weekday, classTimings[], batchId                                           | Weekday: Monday-Sunday            |
| **OTP**            | email, otp, expiresAt                                                      | TTL: 1 hour                       |
| **Popup**          | imageUrl, description                                                      | Admin-uploaded announcements      |

---

## Authentication & Authorization

### Auth Flow

```
Students:                          Admins / Teachers:
┌─────────────┐                     ┌──────────────────┐
│ Phone + DOB │                     │ Email + Send OTP │
└─────┬───────┘                     └────────┬─────────┘
      │                                     │
      ▼                                     ▼
┌────────────┐                     ┌──────────────────┐
│ Verify in  │                     │ OTP stored in DB │
│ Student DB │                     │ (1hr TTL)        │
└─────┬──────┘                     └────────┬─────────┘
      │                                     │
      ▼                                     ▼
┌────────────────────────────────────────────────────┐
│           JWT Issued: { id, role, branch }         │
└────────────────────────────────────────────────────┘
```

### Role-Based Access Control

| Role        | Access Level                                         |
| ----------- | ---------------------------------------------------- |
| **Admin**   | Full access to all endpoints                         |
| **Teacher** | Access to teacher endpoints + some admin-level reads |
| **Student** | Read-only access to own data                         |

### Middleware Chain

Every protected request passes through:
1. **`verifyToken`** - Validates JWT from `Authorization: Bearer <token>` header
2. **Role guard** (`isAdmin`, `isTeacher`, `isStudent`) - Checks `req.user.role`
3. **`branchMiddleware`** - Extracts branch from JWT, attaches correct DB connection

---

## Multi-Branch Architecture

NEEP supports multiple institute branches, each with its own isolated database:

```
JWT payload: { id: "...", role: "Admin", branch: "realDataBase" }
                                               │
                  branchMiddleware extracts ───┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
  realDataBase         realDataBaseOne        realDataBaseTwo
  (Branch A)           (Branch B)            (Branch C)
```

- **Connection pooling** via `dbManager.js` - maintains one connection per branch
- **Branch switching** - Users with multi-branch access can call `/auth/switch-branch` to get a new JWT for a different branch
- **Complete data isolation** - Each branch has its own students, teachers, batches, fees, etc.

---

## Deployment

### Frontend (Vercel)

The frontend is configured for Vercel with SPA routing via `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

```bash
# Build for production
cd client
npm run build    # Output: client/dist/
```

### Backend (Render)

The backend is deployed as a Node.js web service on Render:

```bash
# Start command
node server.js
```

**Environment variables** must be configured in the Render dashboard (see [Environment Variables](#environment-variables)).

### Production URLs

| Service  | URL                            |
| -------- | ------------------------------ |
| Backend  | `https://neep.onrender.com`    |
| Frontend | Deployed on Vercel             |

---

## Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m "Add my feature"`
4. **Push** to the branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

### Code Conventions

- Backend uses **CommonJS** (`require`/`module.exports`)
- Frontend uses **ES Modules** (`import`/`export`)
- Date format across the app: **DD-MM-YYYY**
- API responses follow `{ success: true/false, data/message }` pattern
- Mongoose models use **singular PascalCase** naming

---

## License

This project is proprietary software developed for New Era Education Point.
