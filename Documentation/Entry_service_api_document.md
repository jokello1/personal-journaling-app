# Entry Service API Documentation

## Overview
This API provides endpoints for managing journal entries, supporting operations like creating, updating, retrieving, and deleting entries with advanced filtering and pagination.

## Authentication
- All endpoints require user authentication
- User ID is automatically associated with entries

## Endpoints

### 1. Create Entry
**Method:** `POST /api/entries`

**Request Body:**
```typescript
interface CreateEntryInput {
  title: string;         // Required
  content: string;       // Required
  mood?: string;         // Optional
  categoryIds?: string[];// Optional
  tagNames?: string[];   // Optional
}
```

**Response:**
- `200 OK`: Returns the created entry with associated categories and tags
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: User not authenticated

**Example Request:**
```json
{
  "title": "My First Journal Entry",
  "content": "Today was an amazing day...",
  "mood": "happy",
  "categoryIds": ["category_id_1"],
  "tagNames": ["personal", "vacation"]
}
```

### 2. Update Entry
**Method:** `PUT /api/entries/:id`

**Request Body:**
```typescript
interface UpdateEntryInput {
  id: string;            // Required
  title?: string;        // Optional
  content?: string;      // Optional
  mood?: string;         // Optional
  categoryIds?: string[];// Optional
  tagNames?: string[];   // Optional
}
```

**Response:**
- `200 OK`: Returns the updated entry
- `404 Not Found`: Entry does not exist
- `401 Unauthorized`: User not authenticated or not the entry owner

### 3. Delete Entry
**Method:** `DELETE /api/entries/:id`

**Response:**
- `200 OK`: Returns the deleted entry ID
- `404 Not Found`: Entry does not exist
- `401 Unauthorized`: User not authenticated or not the entry owner

### 4. Get Single Entry
**Method:** `GET /api/entries/:id`

**Response:**
- `200 OK`: Returns the entry with categories and tags
- `404 Not Found`: Entry does not exist
- `401 Unauthorized`: User not authenticated or not the entry owner

### 5. Get User Entries
**Method:** `GET /api/entries`

**Query Parameters:**
```typescript
interface GetEntriesOptions {
  page?: number;         // Default: 1
  limit?: number;        // Default: 10
  categoryId?: string;   // Optional: Filter by category
  tagId?: string;        // Optional: Filter by tag
  searchTerm?: string;   // Optional: Search in title or content
  startDate?: Date;      // Optional: Entries after this date
  endDate?: Date;        // Optional: Entries before this date
}
```

**Response:**
```typescript
interface EntriesResponse {
  entries: Entry[];
  pagination: {
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}
```

**Example Request:**
`GET /api/entries?page=2&limit=15&searchTerm=vacation&startDate=2023-01-01`

## Error Handling
- All endpoints return standard HTTP status codes
- Error responses include a message explaining the issue

## Notes
- Entries are soft-deleted and can be restored
- Tags and categories are automatically created if they don't exist
- Pagination is built-in for listing entries

## Rate Limiting
- Maximum of 100 requests per minute per user
```
