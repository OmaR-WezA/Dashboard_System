# System Architecture

## Overview

This is a full-stack web application for managing student material distribution. The system consists of a Laravel backend API and a React frontend.

## Architecture Diagram

```
┌─────────────────┐
│   React Frontend│
│   (Port 3000)   │
└────────┬────────┘
         │ HTTP/REST API
         │
┌────────▼────────┐
│ Laravel Backend │
│  (Port 8000)   │
└────────┬────────┘
         │
┌────────▼────────┐
│   MySQL/PostgreSQL│
│    Database      │
└─────────────────┘
```

## Backend Architecture

### Directory Structure
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── AuthController.php
│   │   │       ├── MaterialController.php
│   │   │       └── ExcelUploadController.php
│   │   └── Middleware/
│   │       └── EnsureAdmin.php
│   └── Models/
│       ├── Material.php
│       └── User.php
├── database/
│   └── migrations/
│       ├── create_materials_table.php
│       └── create_users_table.php
└── routes/
    └── api.php
```

### Key Components

#### 1. Models
- **Material**: Represents a material record with seat number, subject, material name, hall, seat, and optional stage
- **User**: Represents admin users with authentication

#### 2. Controllers
- **AuthController**: Handles login, logout, and user info
- **MaterialController**: CRUD operations for materials and search
- **ExcelUploadController**: Handles Excel file parsing and import

#### 3. Middleware
- **EnsureAdmin**: Protects admin routes, ensures user is authenticated and is admin

#### 4. Database
- **Indexes**: `seat_number` is indexed for fast search queries
- **Relationships**: Currently no relationships (can be extended)

## Frontend Architecture

### Directory Structure
```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   └── Search.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

### Key Components

#### 1. Pages
- **Login**: Admin authentication page
- **Dashboard**: Admin panel for managing materials
- **Search**: Public search interface

#### 2. Contexts
- **AuthContext**: Manages authentication state and token

#### 3. Services
- **api.js**: Axios instance configured for API calls

## Data Flow

### Excel Upload Flow
```
1. Admin selects Excel file
2. Admin selects stage (optional)
3. Admin chooses append/replace mode
4. Frontend sends file to /api/excel/upload
5. Backend validates file format
6. Backend parses Excel using PhpSpreadsheet
7. Backend validates each row
8. Backend stores valid records in database
9. Backend returns success with processed/skipped counts
10. Frontend refreshes material list
```

### Search Flow
```
1. User enters seat number
2. Frontend sends POST /api/materials/search
3. Backend queries database (indexed search)
4. Backend returns all materials for that seat number
5. Frontend displays each material in a separate card
```

### CRUD Flow
```
1. Admin performs action (create/update/delete)
2. Frontend sends request to appropriate API endpoint
3. Backend validates request
4. Backend performs database operation
5. Backend returns success/error
6. Frontend updates UI
```

## Security

### Authentication
- **Method**: Laravel Sanctum (Token-based)
- **Flow**: 
  1. Admin logs in with email/password
  2. Backend validates credentials
  3. Backend generates token
  4. Frontend stores token in localStorage
  5. Token sent in Authorization header for protected routes

### Authorization
- **Admin Routes**: Protected by `auth:sanctum` and `admin` middleware
- **Public Routes**: Search endpoint is public (can be made protected if needed)

### Validation
- **Backend**: All inputs validated using Laravel Validator
- **Frontend**: Basic HTML5 validation + API error handling

## Performance Optimizations

1. **Database Indexing**: `seat_number` column is indexed
2. **Pagination**: Material list is paginated (15 per page)
3. **Efficient Queries**: Direct indexed lookups for search
4. **Transaction Management**: Excel upload uses database transactions

## Scalability Considerations

1. **Database**: Can handle large datasets with proper indexing
2. **Caching**: Can add Redis for frequently searched seat numbers
3. **File Upload**: Can add queue jobs for large Excel files
4. **API Rate Limiting**: Can add rate limiting middleware

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... }
}
```

## Future Enhancements

1. **Bulk Operations**: Delete multiple materials at once
2. **Export**: Export materials to Excel/PDF
3. **Advanced Search**: Search by subject, hall, stage, etc.
4. **Audit Log**: Track who made what changes
5. **Notifications**: Email notifications for uploads
6. **Role Management**: Multiple admin roles with different permissions

