# API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication

Most endpoints require authentication using Bearer token. Include the token in the Authorization header:

```
Authorization: Bearer {token}
```

## Endpoints

### 1. Login

**POST** `/login`

Authenticate admin user and receive access token.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin@example.com"
    },
    "token": "1|xxxxxxxxxxxxx"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 2. Logout

**POST** `/logout`

Logout current user (requires authentication).

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 3. Get Current User

**GET** `/me`

Get authenticated user information (requires authentication).

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin@example.com",
      "is_admin": true
    }
  }
}
```

---

### 4. Search Materials

**POST** `/materials/search`

Search materials by seat number (public endpoint).

**Request Body:**
```json
{
  "seat_number": "12345"
}
```

**Response:**
```json
{
  "success": true,
  "exists": true,
  "total_count": 3,
  "materials": [
    {
      "id": 1,
      "seat_number": "12345",
      "subject_name": "Mathematics",
      "material_name": "Final Exam",
      "hall": "A",
      "seat": "10",
      "stage": "Stage 1",
      "created_at": "2024-01-01T00:00:00.000000Z",
      "updated_at": "2024-01-01T00:00:00.000000Z"
    }
  ]
}
```

---

### 5. List Materials

**GET** `/materials`

Get paginated list of all materials (requires admin authentication).

**Query Parameters:**
- `per_page` (optional): Items per page (default: 15)
- `page` (optional): Page number (default: 1)
- `search` (optional): Search term

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "seat_number": "12345",
        "subject_name": "Mathematics",
        "material_name": "Final Exam",
        "hall": "A",
        "seat": "10",
        "stage": "Stage 1",
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z"
      }
    ],
    "last_page": 5,
    "per_page": 15,
    "total": 75
  }
}
```

---

### 6. Get Single Material

**GET** `/materials/{id}`

Get a single material by ID (requires admin authentication).

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "seat_number": "12345",
    "subject_name": "Mathematics",
    "material_name": "Final Exam",
    "hall": "A",
    "seat": "10",
    "stage": "Stage 1",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

---

### 7. Create Material

**POST** `/materials`

Create a new material (requires admin authentication).

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "seat_number": "12345",
  "subject_name": "Mathematics",
  "material_name": "Final Exam",
  "hall": "A",
  "seat": "10",
  "stage": "Stage 1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Material created successfully",
  "data": {
    "id": 1,
    "seat_number": "12345",
    "subject_name": "Mathematics",
    "material_name": "Final Exam",
    "hall": "A",
    "seat": "10",
    "stage": "Stage 1",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

**Validation Errors:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "seat_number": ["The seat number field is required."],
    "subject_name": ["The subject name field is required."]
  }
}
```

---

### 8. Update Material

**PUT** `/materials/{id}`

Update an existing material (requires admin authentication).

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "seat_number": "12345",
  "subject_name": "Mathematics",
  "material_name": "Midterm Exam",
  "hall": "B",
  "seat": "15",
  "stage": "Stage 1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Material updated successfully",
  "data": {
    "id": 1,
    "seat_number": "12345",
    "subject_name": "Mathematics",
    "material_name": "Midterm Exam",
    "hall": "B",
    "seat": "15",
    "stage": "Stage 1",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

---

### 9. Delete Material

**DELETE** `/materials/{id}`

Delete a material (requires admin authentication).

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Material deleted successfully"
}
```

---

### 10. Upload Excel File

**POST** `/excel/upload`

Upload and process Excel file (requires admin authentication).

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
- `file` (required): Excel file (.xlsx or .xls)
- `stage` (optional): Stage name
- `replace_mode` (required): Boolean - true to replace existing data for stage, false to append

**Response:**
```json
{
  "success": true,
  "message": "Excel file processed successfully",
  "data": {
    "processed": 100,
    "skipped": 5,
    "errors": [
      "Row 10: Missing required fields",
      "Row 25: Missing required fields"
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid Excel format",
  "errors": [
    "Missing required column: SeatNumber",
    "Missing required column: SubjectName"
  ]
}
```

---

## Error Codes

- `200` - Success
- `201` - Created
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (not admin)
- `422` - Validation Error
- `500` - Server Error

## Rate Limiting

Currently, there is no rate limiting implemented. For production, consider adding rate limiting middleware.

