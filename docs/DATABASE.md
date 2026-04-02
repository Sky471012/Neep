# NEEP Database Schema Documentation

## Overview

NEEP uses **MongoDB Atlas** as its database with **Mongoose 8** as the ODM (Object-Document Mapper). The system follows a multi-tenant architecture where each institute branch maps to a separate database.

### Databases

| Database         | Purpose                    |
| ---------------- | -------------------------- |
| `realDataBase`   | Branch A (primary)         |
| `realDataBaseOne`| Branch B                   |
| `realDataBaseTwo`| Branch C                   |
| `userDataBase`   | Default / development      |

Each database contains identical collections with branch-specific data.

---

## Collections & Schemas

### 1. Student

**File:** `backend/models/Student.js`

Stores student profiles.

| Field           | Type     | Required | Constraints / Notes                                                  |
| --------------- | -------- | -------- | -------------------------------------------------------------------- |
| `name`          | String   | Yes      |                                                                      |
| `phone`         | String   | Yes      |                                                                      |
| `dob`           | String   | Yes      | Format: DD-MM-YYYY                                                   |
| `address`       | String   | No       |                                                                      |
| `class`         | String   | Yes      | Enum: `Kids`, `English Spoken`, `9`, `10`, `11`, `12`, `Entrance Exams`, `Graduation` |
| `dateOfJoining` | String   | No       | Format: DD-MM-YYYY                                                   |
| `guardianName`  | String   | No       |                                                                      |
| `schoolType`    | String   | No       | Enum: `Government`, `Private`, `NA`                                  |

**Indexes:** Default `_id`

---

### 2. Admins_Teacher

**File:** `backend/models/Admins_teachers.js`

Stores admin and teacher profiles.

| Field           | Type     | Required | Constraints / Notes                |
| --------------- | -------- | -------- | ---------------------------------- |
| `name`          | String   | Yes      |                                    |
| `email`         | String   | Yes      | Used for OTP login                 |
| `phone`         | String   | Yes      |                                    |
| `role`          | String   | Yes      | Enum: `Admin`, `Teacher`           |
| `dob`           | String   | No       | Format: DD-MM-YYYY                 |
| `address`       | String   | No       |                                    |
| `qualification` | String   | No       |                                    |
| `aadhar`        | String   | No       | 12-digit Aadhaar number            |
| `experience`    | Number   | No       | Years of experience                |

---

### 3. Batch

**File:** `backend/models/Batch.js`

Represents a class/course batch.

| Field       | Type     | Required | Constraints / Notes                                                  |
| ----------- | -------- | -------- | -------------------------------------------------------------------- |
| `name`      | String   | Yes      | E.g., "Mathematics Grade 10 - Morning"                              |
| `code`      | String   | Yes      | Short identifier, e.g., "MATH10-M"                                  |
| `class`     | String   | Yes      | Enum: same as Student.class                                         |
| `startDate` | String   | No       | Format: DD-MM-YYYY                                                   |
| `archive`   | Boolean  | No       | Default: `false`. Set to `true` to archive                          |

---

### 4. Batch_Student (Join Table)

**File:** `backend/models/Batch_students.js`

Many-to-many relationship between batches and students.

| Field       | Type     | Required | Constraints / Notes              |
| ----------- | -------- | -------- | -------------------------------- |
| `batchId`   | ObjectId | Yes      | References `Batch`               |
| `batchName` | String   | Yes      | Denormalized for display         |
| `studentId` | ObjectId | Yes      | References `Student`             |

---

### 5. Batch_Teacher (Join Table)

**File:** `backend/models/Batch_teachers.js`

One-to-one relationship: each batch has one assigned teacher.

| Field       | Type     | Required | Constraints / Notes              |
| ----------- | -------- | -------- | -------------------------------- |
| `batchId`   | ObjectId | Yes      | **Unique** - one teacher/batch   |
| `batchName` | String   | Yes      | Denormalized for display         |
| `teacherId` | ObjectId | Yes      | References `Admins_Teacher`      |

---

### 6. Attendance

**File:** `backend/models/Attendance.js`

Daily student attendance records.

| Field       | Type     | Required | Constraints / Notes              |
| ----------- | -------- | -------- | -------------------------------- |
| `studentId` | ObjectId | Yes      | References `Student`             |
| `batchId`   | ObjectId | Yes      | References `Batch`               |
| `date`      | Date     | Yes      |                                  |
| `status`    | String   | Yes      | Enum: `present`, `absent`        |
| `markedBy`  | ObjectId | No       | References `Admins_Teacher`      |

---

### 7. Attendance_Teacher

**File:** `backend/models/Attendance_Teacher.js`

Daily teacher attendance records.

| Field       | Type     | Required | Constraints / Notes              |
| ----------- | -------- | -------- | -------------------------------- |
| `teacherId` | ObjectId | Yes      | References `Admins_Teacher`      |
| `batchId`   | ObjectId | Yes      | References `Batch`               |
| `date`      | Date     | Yes      |                                  |
| `status`    | String   | Yes      | Enum: `present`, `absent`        |
| `markedBy`  | ObjectId | No       | References `Admins_Teacher`      |

---

### 8. TimeTable

**File:** `backend/models/TimeTable.js`

Weekly class schedule per batch.

| Field          | Type     | Required | Constraints / Notes                         |
| -------------- | -------- | -------- | ------------------------------------------- |
| `weekday`      | String   | Yes      | Enum: `Monday` through `Sunday`             |
| `classTimings` | Array    | Yes      | Array of `{ startTime, endTime }` strings   |
| `batchId`      | ObjectId | Yes      | References `Batch`                          |

**`classTimings` sub-document:**

| Field       | Type   | Description              |
| ----------- | ------ | ------------------------ |
| `startTime` | String | E.g., "09:00"           |
| `endTime`   | String | E.g., "10:30"           |

---

### 9. Test

**File:** `backend/models/Test.js`

Test/exam scores per student.

| Field         | Type     | Required | Constraints / Notes              |
| ------------- | -------- | -------- | -------------------------------- |
| `name`        | String   | Yes      | E.g., "Unit Test 1"             |
| `maxMarks`    | Number   | Yes      |                                  |
| `marksScored` | Number   | No       | Default: 0                       |
| `studentId`   | ObjectId | Yes      | References `Student`             |
| `batchId`     | ObjectId | Yes      | References `Batch`               |
| `date`        | String   | Yes      | Format: DD-MM-YYYY               |
| `absent`      | Boolean  | No       | Default: `false`                 |

---

### 10. Fee

**File:** `backend/models/Fee.js`

Fee structure per student. One record per student.

| Field         | Type     | Required | Constraints / Notes              |
| ------------- | -------- | -------- | -------------------------------- |
| `studentId`   | ObjectId | Yes      | **Unique** - one fee per student |
| `totalAmount` | Number   | Yes      | Total fee for the academic year  |

---

### 11. Installment

**File:** `backend/models/Installment.js`

Individual payment installments linked to a fee record.

| Field           | Type     | Required | Constraints / Notes               |
| --------------- | -------- | -------- | --------------------------------- |
| `feeId`         | ObjectId | Yes      | References `Fee`                  |
| `studentId`     | ObjectId | Yes      | References `Student`              |
| `installmentNo` | Number   | Yes      | Sequential number (1, 2, 3...)    |
| `dueDate`       | Date     | Yes      | When the payment is due           |
| `paidDate`      | Date     | No       | `null` if unpaid                  |
| `method`        | String   | No       | Enum: `Online`, `Cash`            |
| `amount`        | Number   | Yes      | Installment amount                |

---

### 12. Enquiry

**File:** `backend/models/Enquiry.js`

Tracks prospective student enquiries.

| Field          | Type     | Required | Constraints / Notes                          |
| -------------- | -------- | -------- | -------------------------------------------- |
| `studentName`  | String   | Yes      |                                              |
| `phone`        | String   | Yes      |                                              |
| `enquiryDate`  | String   | Yes      | Format: DD-MM-YYYY                           |
| `followupDate` | String   | No       | Format: DD-MM-YYYY                           |
| `classSubject` | String   | No       | E.g., "Maths-10"                             |
| `followupType` | String   | No       | Enum: `demo`, `call`                         |
| `notes`        | String   | No       | Free-text notes about the enquiry            |
| `status`       | String   | No       | Enum: `lost`, `converted`, or `null` (open)  |

**TTL Index:** Documents auto-delete after **1 year** from creation.

---

### 13. OTP

**File:** `backend/models/Otp.js`

Stores one-time passwords for admin/teacher login.

| Field       | Type     | Required | Constraints / Notes                |
| ----------- | -------- | -------- | ---------------------------------- |
| `email`     | String   | Yes      | Admin/teacher email                |
| `otp`       | String   | Yes      | 6-digit OTP code                   |
| `expiresAt` | Date     | Yes      | Auto-delete via TTL after 1 hour   |

**TTL Index:** Documents auto-delete at `expiresAt`.

---

### 14. Birthday_wish

**File:** `backend/models/Birthday_wish.js`

Records that a student has been wished happy birthday.

| Field       | Type     | Required | Constraints / Notes              |
| ----------- | -------- | -------- | -------------------------------- |
| `studentId` | ObjectId | Yes      | References `Student`             |
| `wishedOn`  | Date     | Yes      | When the wish was recorded       |

**TTL Index:** Documents auto-delete **24 hours** after `wishedOn`.

---

### 15. Birthday_Teacher_wish

**File:** `backend/models/Birthday_Teacher_wish.js`

Records that a teacher has been wished happy birthday.

| Field       | Type     | Required | Constraints / Notes              |
| ----------- | -------- | -------- | -------------------------------- |
| `teacherId` | ObjectId | Yes      | References `Admins_Teacher`      |
| `wishedOn`  | Date     | Yes      | When the wish was recorded       |

**TTL Index:** Documents auto-delete **24 hours** after `wishedOn`.

---

### 16. Popup

**File:** `backend/models/Popup.js`

Admin-managed announcements/advertisements.

| Field         | Type   | Required | Constraints / Notes                |
| ------------- | ------ | -------- | ---------------------------------- |
| `imageUrl`    | String | No       | Path to uploaded image             |
| `description` | String | No       | Announcement text                  |

---

## Entity Relationship Diagram

```
                         ┌────────────────────┐
                         │   Admins_Teacher    │
                         │                    │
                         │  _id               │
                         │  name, email       │
                         │  role (Admin/      │
                         │       Teacher)     │
                         └──────┬─────────────┘
                                │
                    ┌───────────┼────────────────┐
                    │           │                │
                    ▼           ▼                ▼
          ┌─────────────┐ ┌──────────┐  ┌────────────────┐
          │Batch_Teacher│ │Attendance│  │Birthday_Teacher│
          │             │ │_Teacher  │  │_wish           │
          │ batchId ────┼─┤teacherId │  │ teacherId      │
          │ teacherId   │ │ batchId  │  │ wishedOn (TTL) │
          └──────┬──────┘ │ date     │  └────────────────┘
                 │        │ status   │
                 ▼        └──────────┘
          ┌────────────┐
          │   Batch    │
          │            │
          │  _id       │
          │  name, code│◄──────────────────┐
          │  class     │                   │
          │  archive   │                   │
          └──────┬─────┘                   │
                 │                         │
                 ▼                         │
          ┌──────────────┐          ┌──────┴──────┐
          │Batch_Student │          │  TimeTable  │
          │              │          │             │
          │ batchId      │          │ batchId     │
          │ studentId ───┼──┐       │ weekday     │
          └──────────────┘  │       │ classTimings│
                            │       └─────────────┘
                            ▼
                    ┌──────────────┐
                    │   Student    │
                    │              │
                    │  _id         │
                    │  name, phone │
                    │  dob, class  │
                    └──────┬───────┘
                           │
          ┌────────────────┼──────────────────┐──────────────┐
          ▼                ▼                  ▼              ▼
   ┌────────────┐   ┌───────────┐     ┌────────────┐ ┌──────────────┐
   │ Attendance │   │   Test    │     │    Fee     │ │Birthday_wish │
   │            │   │           │     │            │ │              │
   │ studentId  │   │ studentId │     │ studentId  │ │ studentId    │
   │ batchId    │   │ batchId   │     │ totalAmount│ │ wishedOn     │
   │ date       │   │ name      │     └─────┬──────┘ │ (TTL: 24h)  │
   │ status     │   │ maxMarks  │           │        └──────────────┘
   └────────────┘   │ marks     │           ▼
                    │ date      │    ┌──────────────┐
                    │ absent    │    │ Installment  │
                    └───────────┘    │              │
                                     │ feeId        │
                                     │ studentId    │
                                     │ installmentNo│
                                     │ dueDate      │
                                     │ paidDate     │
                                     │ method       │
                                     │ amount       │
                                     └──────────────┘

  Standalone:
  ┌──────────────┐    ┌──────────┐
  │   Enquiry    │    │   OTP    │    ┌──────────┐
  │              │    │          │    │  Popup   │
  │ studentName  │    │ email    │    │          │
  │ phone        │    │ otp      │    │ imageUrl │
  │ enquiryDate  │    │ expiresAt│    │ desc     │
  │ followupDate │    │ (TTL:1h) │    └──────────┘
  │ status       │    └──────────┘
  │ (TTL: 1yr)   │
  └──────────────┘
```

---

## TTL (Time-To-Live) Indexes

MongoDB TTL indexes automatically delete expired documents:

| Collection            | TTL Field    | Duration | Purpose                              |
| --------------------- | ------------ | -------- | ------------------------------------ |
| `otps`                | `expiresAt`  | At time  | Clean up expired OTP codes           |
| `enquiries`           | `createdAt`  | 1 year   | Remove old enquiries automatically   |
| `birthday_wishes`     | `wishedOn`   | 24 hours | Reset daily so wishes can be re-sent |
| `birthday_teacher_wishes`| `wishedOn`| 24 hours | Reset daily so wishes can be re-sent |

---

## Data Conventions

- **Date strings** use `DD-MM-YYYY` format (Indian standard)
- **Date objects** use native JavaScript `Date` / MongoDB `ISODate`
- **Phone numbers** are stored as strings to preserve leading zeros and formatting
- **ObjectId references** are stored as Mongoose `Schema.Types.ObjectId`
- **Denormalized fields** (e.g., `batchName` in join tables) are used for display performance
- **Soft delete** is not used; deletions are permanent and cascade to related records
