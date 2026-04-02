# NEEP API Reference

**Base URL**: `http://localhost:5000/api` (dev) | `https://neep.onrender.com/api` (prod)

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 1. Authentication (`/api/auth`)

### POST `/auth/login/student`
Login as a student using phone number and date of birth.

**Request Body:**
```json
{
  "phone": "9876543210",
  "dob": "15-03-2005"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "64f...",
    "name": "Rahul Sharma",
    "phone": "9876543210",
    "role": "student"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### POST `/auth/login/admin-teacher/send-otp`
Send a one-time password to an admin or teacher's registered email.

**Request Body:**
```json
{
  "email": "admin@neep.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

---

### POST `/auth/login/admin-teacher/verify-otp`
Verify the OTP and receive a JWT token.

**Request Body:**
```json
{
  "email": "admin@neep.com",
  "otp": "482913"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "64f...",
    "name": "Admin User",
    "email": "admin@neep.com",
    "role": "Admin"
  }
}
```

---

### POST `/auth/switch-branch`
Switch to a different institute branch. Returns a new JWT with the updated branch.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "branch": "realDataBaseOne"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 2. Student Endpoints (`/api/student`)

> **Auth Required:** `verifyToken` + `isStudent`

### GET `/student/profile`
Get the logged-in student's profile.

**Response:**
```json
{
  "success": true,
  "student": {
    "_id": "64f...",
    "name": "Rahul Sharma",
    "phone": "9876543210",
    "dob": "15-03-2005",
    "address": "123 Main St",
    "class": "Maths-10",
    "dateOfJoining": "01-04-2025",
    "guardianName": "Mr. Sharma",
    "schoolType": "Private"
  }
}
```

### GET `/student/batches`
Get all batches the student is enrolled in.

### GET `/student/attendance`
Get the student's attendance records across all batches.

### GET `/student/test`
Get the student's test scores across all batches.

### POST `/student/timetable`
Get timetable for the student's enrolled batches.

**Request Body:**
```json
{
  "batchIds": ["64f...", "64f..."]
}
```

### GET `/student/fee-status`
Get the student's fee record and installment history.

---

## 3. Teacher Endpoints (`/api/teacher`)

> **Auth Required:** `verifyToken` + `isTeacher`

### GET `/teacher/batches`
Get all batches assigned to the logged-in teacher.

### GET `/teacher/batchStudents/:batchId`
List all students in a specific batch.

| Param     | Type   | Description |
| --------- | ------ | ----------- |
| `batchId` | String | Batch ObjectId |

### POST `/teacher/attendance/mark`
Mark attendance for students in a batch.

**Request Body:**
```json
{
  "batchId": "64f...",
  "date": "2025-11-15",
  "attendance": [
    { "studentId": "64f...", "status": "present" },
    { "studentId": "64f...", "status": "absent" }
  ]
}
```

### GET `/teacher/attendance/:studentId`
Get attendance records for a specific student.

### GET `/teacher/timetable/:batchId`
Get the weekly timetable for a batch.

### GET `/teacher/today/timetable`
Get the teacher's classes scheduled for today.

### POST `/teacher/test/add`
Create a new test for a batch.

**Request Body:**
```json
{
  "name": "Unit Test 1",
  "maxMarks": 100,
  "batchId": "64f...",
  "date": "15-11-2025",
  "students": [
    { "studentId": "64f...", "marksScored": 85, "absent": false },
    { "studentId": "64f...", "marksScored": 0, "absent": true }
  ]
}
```

### GET `/teacher/getTest/:batchId`
Get all tests for a batch.

### PATCH `/teacher/editMarks/:testId`
Update marks for a specific test.

### DELETE `/teacher/deleteTest`
Delete a test.

**Request Body:**
```json
{
  "testId": "64f..."
}
```

---

## 4. Admin Endpoints (`/api/admin`)

> **Auth Required:** `verifyToken` + `isAdmin`

### 4.1 Batch Management

#### GET `/admin/batches`
List all active (non-archived) batches.

#### GET `/admin/archivedBatches`
List all archived batches.

#### GET `/admin/getBatchDetails/:batchId`
Get full details of a batch including assigned teacher.

#### GET `/admin/batchStudents/:batchId`
List all students enrolled in a batch.

#### POST `/admin/batchCreate`
Create a new batch.

**Request Body:**
```json
{
  "name": "Mathematics Grade 10 - Morning",
  "code": "MATH10-M",
  "class": "Maths-10",
  "startDate": "01-04-2025"
}
```

#### POST `/admin/updateTimetable/:batchId`
Set or update the weekly timetable for a batch.

**Request Body:**
```json
{
  "timetable": [
    {
      "weekday": "Monday",
      "classTimings": [
        { "startTime": "09:00", "endTime": "10:30" }
      ]
    },
    {
      "weekday": "Wednesday",
      "classTimings": [
        { "startTime": "09:00", "endTime": "10:30" }
      ]
    }
  ]
}
```

#### DELETE `/admin/batchDelete/:batchId`
Delete a batch and all associated records (enrollments, timetable).

#### PUT `/admin/:batchId/archive`
Toggle a batch's archived status.

#### PUT `/admin/editBatchProfile/:batchId`
Update batch name, code, class, or start date.

---

### 4.2 Student Management

#### GET `/admin/students`
List all students.

#### GET `/admin/getStudentDetails/:studentId`
Get a student's full profile.

#### GET `/admin/studentBatches/:studentId`
Get all batches a student is enrolled in.

#### POST `/admin/studentCreate`
Create a new student.

**Request Body:**
```json
{
  "name": "Priya Verma",
  "phone": "9876543210",
  "dob": "22-08-2007",
  "address": "456 Park Avenue",
  "class": "Maths-10",
  "dateOfJoining": "01-04-2025",
  "guardianName": "Mrs. Verma",
  "schoolType": "Private"
}
```

#### POST `/admin/addStudent/:studentId/:batchId`
Enroll an existing student in a batch.

#### PUT `/admin/editStudntProfile/:studentId`
Update a student's profile fields.

#### DELETE `/admin/studentDelete/:studentId`
Delete a student and all associated records.

#### POST `/admin/upload`
Bulk import students from an Excel file.

**Request:** `multipart/form-data` with a `.xlsx` file in the `file` field.

---

### 4.3 Teacher Management

#### GET `/admin/teachers`
List all teachers.

#### GET `/admin/getTeacherDetails/:teacherId`
Get a teacher's full profile.

#### POST `/admin/teacherCreate`
Create a new teacher.

**Request Body:**
```json
{
  "name": "Dr. Rakesh Kumar",
  "email": "rakesh@neep.com",
  "phone": "9876543210",
  "role": "Teacher",
  "dob": "15-06-1985",
  "address": "789 School Lane",
  "qualification": "M.Sc Mathematics",
  "aadhar": "123456789012",
  "experience": 8
}
```

#### PUT `/admin/editTeacherProfile/:teacherId`
Update a teacher's profile.

#### DELETE `/admin/teacherDelete/:teacherId`
Delete a teacher.

#### POST `/admin/addTeacherToBatches`
Assign a teacher to one or more batches.

**Request Body:**
```json
{
  "teacherId": "64f...",
  "batchIds": ["64f...", "64f..."]
}
```

---

### 4.4 Fee Management

#### GET `/admin/fee/:studentId`
Get the fee record for a student.

**Response:**
```json
{
  "success": true,
  "fee": {
    "_id": "64f...",
    "studentId": "64f...",
    "totalAmount": 25000
  }
}
```

#### GET `/admin/installments/:studentId`
Get all installments for a student.

**Response:**
```json
{
  "success": true,
  "installments": [
    {
      "_id": "64f...",
      "feeId": "64f...",
      "studentId": "64f...",
      "installmentNo": 1,
      "amount": 10000,
      "dueDate": "2025-04-15T00:00:00.000Z",
      "paidDate": "2025-04-14T00:00:00.000Z",
      "method": "Online"
    }
  ]
}
```

#### POST `/admin/fee/createFeeWithInstallments`
Create a fee record with installments in one request.

**Request Body:**
```json
{
  "studentId": "64f...",
  "totalAmount": 25000,
  "installments": [
    { "installmentNo": 1, "amount": 10000, "dueDate": "2025-04-15" },
    { "installmentNo": 2, "amount": 10000, "dueDate": "2025-07-15" },
    { "installmentNo": 3, "amount": 5000, "dueDate": "2025-10-15" }
  ]
}
```

#### PATCH `/admin/fee/update-fee/:studentId`
Update the total fee amount.

#### POST `/admin/fee/addInstallment`
Add a new installment to an existing fee.

#### DELETE `/admin/fee/removeInstallment/:installmentId`
Remove an installment.

#### PATCH `/admin/fee/mark-paid/:id`
Mark an installment as paid.

**Request Body:**
```json
{
  "paidDate": "2025-04-14",
  "method": "Cash"
}
```

#### GET `/admin/fee/installments/unpaid`
List all unpaid installments across all students.

#### GET `/admin/fee/installments/upcoming`
List installments with upcoming due dates.

#### GET `/admin/fee/installments/paid`
List all paid installments.

---

### 4.5 Test Management

#### POST `/admin/test/addEdit`
Create a new test or update an existing one.

#### GET `/admin/getTest/:batchId`
Get all tests for a batch with student scores.

#### PATCH `/admin/editMarks/:testId`
Edit marks for a specific test entry.

#### DELETE `/admin/deleteTest`
Delete a test.

---

### 4.6 Birthday Management

#### GET `/admin/birthday/today`
Get students whose birthday is today.

#### POST `/admin/birthday/wish`
Record that a student has been wished.

**Request Body:**
```json
{
  "studentId": "64f..."
}
```

#### GET `/admin/birthday/upcoming`
Get students with upcoming birthdays (next 7 days).

#### GET `/admin/birthdayTeacher/today`
Get teachers whose birthday is today.

#### POST `/admin/birthdayTeacher/wish`
Record that a teacher has been wished.

#### GET `/admin/birthdayTeacher/upcoming`
Get teachers with upcoming birthdays.

---

### 4.7 Enquiry Management

#### GET `/admin/allEnquiries`
List all enquiries.

**Response:**
```json
{
  "success": true,
  "enquiries": [
    {
      "_id": "64f...",
      "studentName": "Ankit Sharma",
      "phone": "8929676776",
      "enquiryDate": "05-09-2025",
      "followupDate": "12-11-2025",
      "classSubject": "Maths-10",
      "followupType": "demo",
      "notes": "Interested in demo class",
      "status": "lost"
    }
  ]
}
```

#### POST `/admin/enquiryCreate`
Create a new enquiry.

**Request Body:**
```json
{
  "studentName": "New Student",
  "phone": "9876543210",
  "enquiryDate": "01-11-2025",
  "followupDate": "05-11-2025",
  "classSubject": "Maths-10",
  "followupType": "demo",
  "notes": "Parent called, interested in demo"
}
```

#### GET `/admin/getEnquiry/:enquiryId`
Get details of a specific enquiry.

#### PUT `/admin/editEnquiry/:enquiryId`
Update enquiry details (name, phone, dates, notes).

#### POST `/admin/enquiryStatus/:enquiryId`
Update enquiry status to "converted" or "lost".

**Request Body:**
```json
{
  "status": "converted"
}
```

#### DELETE `/admin/enquiryDelete/:enquiryId`
Delete an enquiry.

---

### 4.8 Timetable

#### GET `/admin/today/timetable`
Get all classes scheduled for today across all batches.

---

## 5. Public Endpoints

### POST `/contactus/`
Submit a contact form. Sends an email notification to the admin.

**Request Body:**
```json
{
  "name": "Parent Name",
  "email": "parent@email.com",
  "message": "I would like to enquire about admission."
}
```

### GET `/getPopup`
Get the current active pop-up announcement.

**Response:**
```json
{
  "success": true,
  "popup": {
    "imageUrl": "/uploads/popup-banner.jpg",
    "description": "Admissions open for 2025-26!"
  }
}
```

### POST `/uploadPopup`
Upload a new announcement popup (admin only).

**Request:** `multipart/form-data` with `image` file and `description` text field.

---

## Error Responses

All endpoints return errors in a consistent format:

```json
{
  "success": false,
  "message": "Description of the error"
}
```

### Common HTTP Status Codes

| Code | Meaning                                            |
| ---- | -------------------------------------------------- |
| 200  | Success                                            |
| 201  | Resource created                                   |
| 400  | Bad request (missing/invalid fields)               |
| 401  | Unauthorized (missing or invalid token)            |
| 403  | Forbidden (insufficient role permissions)          |
| 404  | Resource not found                                 |
| 500  | Internal server error                              |

---

## Rate Limits & Notes

- OTP codes expire after **1 hour** and are single-use
- Enquiry records auto-delete after **1 year** (MongoDB TTL index)
- Birthday wish records auto-delete after **24 hours**
- File uploads are stored in the `backend/uploads/` directory
- Excel imports support `.xlsx` format only
- All date fields use **DD-MM-YYYY** format unless otherwise noted
