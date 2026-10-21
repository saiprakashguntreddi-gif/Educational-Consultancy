# API Contracts & Interface Documentation

Base API URL: `/api/v1`

---

## 1. Authentication Endpoints

### Register User
- **Method**: `POST /auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "student@example.com",
    "password": "SecurePassword123"
  }
  ```
  *(Note: Public registration strictly creates STUDENT accounts; client-provided roles are ignored)*
- **Response** `201 Created`:
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "data": {
      "user": {
        "id": "uuid",
        "email": "student@example.com",
        "role": "STUDENT",
        "hasProfile": false
      },
      "tokens": {
        "accessToken": "jwt_token",
        "refreshToken": "jwt_token",
        "expiresIn": "1d"
      }
    }
  }
  ```

### Login User
- **Method**: `POST /auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "student@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response** `200 OK`: Same data structure as register.

### Get Authenticated User
- **Method**: `GET /auth/me`
- **Access**: Bearer Token (Any authenticated user)

---

## 2. Module 1: Student Profile Intake Endpoints

### Submit Profile Intake
- **Method**: `POST /profile/intake`
- **Access**: Bearer Token (`STUDENT` role)
- **Request Body**:
  ```json
  {
    "fullName": "Aarav Patel",
    "gender": "MALE",
    "grade": "Grade 12",
    "contactEmail": "aarav.patel@example.com",
    "phone": "+91 98765 43210",
    "address": {
      "street": "42 MG Road, Indiranagar",
      "city": "Bengaluru",
      "state": "Karnataka",
      "postalCode": "560038",
      "country": "India"
    },
    "board": "CBSE",
    "citizenship": "Indian",
    "passingOutYear": 2026
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "message": "Profile intake submitted successfully. Verification pending.",
    "data": {
      "id": "profile_uuid",
      "userId": "user_uuid",
      "fullName": "Aarav Patel",
      "gender": "MALE",
      "grade": "Grade 12",
      "contactEmail": "aarav.patel@example.com",
      "phone": "+91 98765 43210",
      "address": { ... },
      "board": "CBSE",
      "citizenship": "Indian",
      "passingOutYear": 2026,
      "verificationStatus": "PENDING",
      "verifiedAt": null,
      "verifiedBy": null,
      "verificationNotes": null,
      "createdAt": "2026-10-17T10:45:00.000Z",
      "updatedAt": "2026-10-17T10:45:00.000Z"
    }
  }
  ```

### Get My Student Record
- **Method**: `GET /profile/me`
- **Access**: Bearer Token (`STUDENT` role)
- **Description**: Returns the student's profile intake record and current verification status (`PENDING`, `VERIFIED`, `REJECTED`). Accessible even while pending or rejected.

### Get Verified Student Record & Guidance Clearance
- **Method**: `GET /profile/me/verified`
- **Access**: Bearer Token (`STUDENT`, `COUNSELLOR`, `ADMIN` roles) + `requireVerifiedStudentProfile`
- **Description**: Accesses the authenticated, locked student record and guidance eligibility clearance.
- **Access Enforcement**:
  - `VERIFIED` students: Returns 200 OK with verified clearance payload.
  - `PENDING` students: Returns 403 Forbidden with `PROFILE_NOT_VERIFIED` error code.
  - `REJECTED` students: Returns 403 Forbidden with `PROFILE_NOT_VERIFIED` error code and counsellor notes.
  - Counsellors and Admins: Bypass verification checks to perform advisory tasks.

### List Verification Queue (Counsellor/Admin)
- **Method**: `GET /profile/review?page=1&limit=20&status=PENDING`
- **Access**: Bearer Token (`COUNSELLOR` or `ADMIN` role)

### Get Specific Profile by ID (Counsellor/Admin)
- **Method**: `GET /profile/:id`
- **Access**: Bearer Token (`COUNSELLOR` or `ADMIN` role)

### Update Verification Status (Counsellor/Admin)
- **Method**: `PATCH /profile/:id/verify`
- **Access**: Bearer Token (`COUNSELLOR` or `ADMIN` role)
- **Request Body**:
  ```json
  {
    "status": "VERIFIED",
    "notes": "Academic documents and identity cross-verified."
  }
  ```

---

## 3. Module 2: Preferences Endpoints

### Save or Update Student Preferences
- **Method**: `POST /preferences/me` or `PUT /preferences/me`
- **Access**: Bearer Token (`STUDENT` role)
- **Pre-requisite**: Student profile intake (Module 1) must be submitted first.
- **Request Body**:
  ```json
  {
    "countries": ["United States", "Canada", "Germany", "Switzerland"],
    "primaryCountry": "Germany",
    "department": "Engineering & Technology",
    "subDepartment": "Artificial Intelligence & Machine Learning"
  }
  ```
- **Validation**:
  - `countries`: Non-empty array of strings (min 1, max 15).
  - `primaryCountry`: Optional string (defaults to first country in array if omitted).
  - `department`: String (min 2, max 100 characters).
  - `subDepartment`: String (min 2, max 100 characters).
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "message": "Student preferences saved successfully",
    "data": {
      "id": "uuid",
      "studentProfileId": "uuid",
      "countries": ["United States", "Canada", "Germany", "Switzerland"],
      "primaryCountry": "Germany",
      "department": "Engineering & Technology",
      "subDepartment": "Artificial Intelligence & Machine Learning",
      "createdAt": "2026-10-17T06:50:00.000Z",
      "updatedAt": "2026-10-17T06:50:00.000Z"
    }
  }
  ```

### Get My Preferences
- **Method**: `GET /preferences/me`
- **Access**: Bearer Token (`STUDENT` role)
- **Description**: Returns the authenticated student's saved preferences, or `null` if not yet configured.

### Get Student Preferences by Profile ID (Staff Review)
- **Method**: `GET /preferences/profile/:studentProfileId`
- **Access**: Bearer Token (`COUNSELLOR` or `ADMIN` role)
- **Description**: Allows counsellors and administrators to review the selected destinations, department, and specialization for any student profile during verification or guidance sessions.

---

## 4. Module 3: Education Details Endpoints

### Save or Update Student Education Details
- **Method**: `POST /education/me` or `PUT /education/me`
- **Access**: Bearer Token (`STUDENT` role)
- **Pre-requisite**: Student profile intake (Module 1) must be submitted first.
- **Request Body**:
  ```json
  {
    "schoolName": "Dumick Educational Academy",
    "board": "CBSE",
    "completionYear": 2026,
    "percentage": 88.5,
    "subjectDetails": [
      { "subject": "Mathematics", "score": 92 },
      { "subject": "Physics", "score": 88 },
      { "subject": "Chemistry", "score": 85 }
    ],
    "tenthSchoolName": "St. Xavier High School",
    "tenthBoard": "CBSE",
    "tenthPassingYear": 2024,
    "tenthPercentage": 91.0
  }
  ```
- **Validation**:
  - `schoolName`: Non-empty string (min 2, max 150 characters).
  - `board`: Required string (e.g. CBSE, ICSE, State Board, IB, Cambridge/IGCSE, NIOS, Other).
  - `completionYear`: Integer (between 2000 and 2035).
  - `percentage`: Number (between 0 and 100).
  - `subjectDetails`: Array of objects (min 1 subject), each with `subject` (min 1 char) and `score` (0 to 100).
  - `tenthSchoolName`: Optional string (min 2, max 150 characters).
  - `tenthBoard`: Optional string.
  - `tenthPassingYear`: Optional integer (between 1990 and 2035).
  - `tenthPercentage`: Optional number (between 0 and 100).
- **Response** `200 OK`:
  ```json
  {
    "success": true,
    "message": "Education details saved successfully",
    "data": {
      "id": "uuid",
      "studentProfileId": "uuid",
      "schoolName": "Dumick Educational Academy",
      "board": "CBSE",
      "completionYear": 2026,
      "percentage": 88.5,
      "subjectDetails": [
        { "subject": "Mathematics", "score": 92 },
        { "subject": "Physics", "score": 88 },
        { "subject": "Chemistry", "score": 85 }
      ],
      "tenthSchoolName": "St. Xavier High School",
      "tenthBoard": "CBSE",
      "tenthPassingYear": 2024,
      "tenthPercentage": 91.0,
      "createdAt": "2026-10-17T11:55:00.000Z",
      "updatedAt": "2026-10-17T11:55:00.000Z"
    }
  }
  ```

### Get My Education Details
- **Method**: `GET /education/me`
- **Access**: Bearer Token (`STUDENT` role)
- **Description**: Returns the authenticated student's saved education details, or `null` if not yet configured.

### Get Student Education Details by Profile ID (Staff Review)
- **Method**: `GET /education/profile/:studentProfileId`
- **Access**: Bearer Token (`COUNSELLOR` or `ADMIN` role)
- **Description**: Allows counsellors and administrators to review academic history, board curriculum, aggregate percentages, dynamic subject marks, and 10th standard summary to formulate course and university recommendations.


