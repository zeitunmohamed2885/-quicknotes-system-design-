# QuickNotes API Design

## 1. Overview

QuickNotes is a notes application that allows users to create, view, update, and delete notes. This document defines a proposed REST API for a production version of the system.

**Base URL:** `https://api.quicknotes.example/v1`

**Data format:** JSON

**Authentication:** Bearer token for protected endpoints.

> The API described here is a proposed design for the future backend. The current browser application uses JSONPlaceholder for practice and does not connect to a real QuickNotes backend.

## 2. Endpoints

| Method | Endpoint | Description | Success status |
|---|---|---|---|
| GET | `/notes` | List the authenticated user's notes | `200 OK` |
| GET | `/notes/{id}` | Retrieve one note by ID | `200 OK` |
| POST | `/notes` | Create a note | `201 Created` |
| PUT | `/notes/{id}` | Replace an existing note | `200 OK` |
| PATCH | `/notes/{id}` | Update selected note fields | `200 OK` |
| DELETE | `/notes/{id}` | Delete a note | `204 No Content` |
| GET | `/tags` | List the user's tags | `200 OK` |

All note endpoints require authentication. The server must verify that a requested note belongs to the authenticated user before returning, changing, or deleting it.

## 3. Request and Response Examples

### Create a note

**Request**

`POST /v1/notes`

```json
{
  "title": "My first note",
  "body": "Ideas for the QuickNotes project."
}
```

**Response — `201 Created`**

```json
{
  "id": "note_123",
  "userId": "user_456",
  "title": "My first note",
  "body": "Ideas for the QuickNotes project.",
  "createdAt": "2026-10-26T12:00:00Z",
  "updatedAt": "2026-10-26T12:00:00Z"
}
```

The IDs and timestamps above are illustrative examples.

### List notes

**Request**

`GET /v1/notes?limit=10&offset=0`

**Response — `200 OK`**

```json
{
  "items": [
    {
      "id": "note_123",
      "title": "My first note",
      "body": "Ideas for the QuickNotes project.",
      "createdAt": "2026-10-26T12:00:00Z",
      "updatedAt": "2026-10-26T12:00:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 1
  }
}
```

The server should enforce a maximum page size and return only notes belonging to the authenticated user.

## 4. Error Handling

Errors use a consistent JSON response structure.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The title must not exceed 100 characters."
  }
}
```

| HTTP status | Meaning | Example code |
|---|---|---|
| `400 Bad Request` | Invalid input or malformed request | `VALIDATION_ERROR` |
| `401 Unauthorized` | Missing or invalid authentication | `UNAUTHENTICATED` |
| `403 Forbidden` | Authenticated user is not permitted to perform an action | `FORBIDDEN` |
| `404 Not Found` | Requested resource does not exist or is not accessible | `NOT_FOUND` |
| `500 Internal Server Error` | Unexpected server failure | `INTERNAL_ERROR` |

### Example validation error — `400 Bad Request`

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The title must not exceed 100 characters."
  }
}
```

### Example authentication error — `401 Unauthorized`

```json
{
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "A valid access token is required."
  }
}
```

### Example permission error — `403 Forbidden`

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action."
  }
}
```

### Example missing resource — `404 Not Found`

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested note was not found."
  }
}
```

### Example server error — `500 Internal Server Error`

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

## 5. Validation and Security

- A note title is required and must contain between 1 and 100 characters after trimming whitespace.
- A note body is optional.
- The API accepts and returns JSON.
- Protected endpoints require a valid bearer token.
- Users can access only their own notes and tags.
- Inputs must be validated on the server; browser validation alone is not sufficient.
- The API must use HTTPS in production.
- Error responses must not expose passwords, tokens, database credentials, or internal stack traces.

## 6. Current Implementation Limitations

The current frontend uses `https://jsonplaceholder.typicode.com/posts` to practice GET, POST, and DELETE requests. JSONPlaceholder simulates writes but does not persist created or deleted records. The endpoints documented above describe the intended QuickNotes backend and are not implemented by the current frontend.