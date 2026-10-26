# QuickNotes Data Model

## 1. Overview

QuickNotes uses a relational data model to store users, their notes, tags, and the associations between notes and tags.

The proposed schema uses PostgreSQL. It is designed for a production version of QuickNotes, not the current JSONPlaceholder practice frontend.

## 2. Tables and Columns

### Users

Stores account information for each user.

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT GENERATED ALWAYS AS IDENTITY | Primary key |
| `name` | VARCHAR(100) | NOT NULL |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE |
| `password_hash` | VARCHAR(255) | NOT NULL |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

Passwords must be stored as secure password hashes, never as plaintext.

### Notes

Stores notes owned by users.

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT GENERATED ALWAYS AS IDENTITY | Primary key |
| `user_id` | BIGINT | NOT NULL, foreign key to `users.id` |
| `title` | VARCHAR(100) | NOT NULL |
| `body` | TEXT | NOT NULL, DEFAULT empty string |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

The application must validate that the title contains at least one non-whitespace character. The `updated_at` field should be refreshed whenever a note changes.

### Tags

Stores user-defined labels for organizing notes.

| Column | Type | Constraints |
|---|---|---|
| `id` | BIGINT GENERATED ALWAYS AS IDENTITY | Primary key |
| `user_id` | BIGINT | NOT NULL, foreign key to `users.id` |
| `name` | VARCHAR(50) | NOT NULL |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

A user should not have duplicate tag names, so `(user_id, name)` is unique.

### Note_Tags

Associates notes with tags.

| Column | Type | Constraints |
|---|---|---|
| `note_id` | BIGINT | Primary key component, foreign key to `notes.id` |
| `tag_id` | BIGINT | Primary key component, foreign key to `tags.id` |

The composite primary key `(note_id, tag_id)` prevents the same tag from being assigned to the same note more than once.

## 3. Relationships

- **Users to Notes:** one-to-many. A user can own many notes; each note belongs to one user.
- **Users to Tags:** one-to-many. A user can create many tags; each tag belongs to one user.
- **Notes to Tags:** many-to-many. A note can have many tags, and a tag can be associated with many notes. `note_tags` implements this relationship.

A production implementation must also ensure that a note and its assigned tag belong to the same user. This can be enforced through additional composite foreign keys or application-level validation backed by suitable database constraints.

## 4. SQL Table Definitions

The following statements target PostgreSQL.

```sql
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notes_title_not_blank CHECK (LENGTH(TRIM(title)) > 0)
);

CREATE TABLE tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tags_user_name_unique UNIQUE (user_id, name)
);

CREATE TABLE note_tags (
    note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);
```

## 5. Example SQL Queries

### Query 1: Retrieve a user's notes

```sql
SELECT id, title, body, created_at, updated_at
FROM notes
WHERE user_id = 42
ORDER BY updated_at DESC
LIMIT 20;
```

This returns the 20 most recently updated notes belonging to user 42.

### Query 2: Retrieve one note with its owner's details

```sql
SELECT
    n.id AS note_id,
    n.title,
    n.body,
    u.id AS user_id,
    u.name AS owner_name,
    u.email AS owner_email
FROM notes AS n
JOIN users AS u ON u.id = n.user_id
WHERE n.id = 123
  AND n.user_id = 42;
```

This demonstrates a `JOIN` and checks ownership in the query. In production, the user ID must come from the authenticated session, not from an untrusted client parameter.

### Query 3: List tags assigned to a note

```sql
SELECT t.id, t.name
FROM tags AS t
JOIN note_tags AS nt ON nt.tag_id = t.id
JOIN notes AS n ON n.id = nt.note_id
WHERE n.id = 123
  AND n.user_id = 42
ORDER BY t.name;
```

This joins three tables to retrieve tags for a note owned by user 42.

### Query 4: Count notes per user

```sql
SELECT
    u.id,
    u.name,
    COUNT(n.id) AS note_count
FROM users AS u
LEFT JOIN notes AS n ON n.user_id = u.id
GROUP BY u.id, u.name
ORDER BY note_count DESC;
```

The `LEFT JOIN` includes users who have no notes.

## 6. Indexing Strategy

```sql
CREATE INDEX idx_notes_user_updated
ON notes (user_id, updated_at DESC);
```

**Rationale:** QuickNotes frequently retrieves a user's notes ordered by their most recent update. This composite index helps the database filter by `user_id` and return notes in the requested order with less sorting work.

Indexes improve read performance but require additional storage and add work to inserts, updates, and deletes. The index should be evaluated against actual query patterns and database query plans.

## 7. SQL vs NoSQL

**Recommendation: use a relational SQL database such as PostgreSQL.**

Reasons:

1. **Relationships:** users, notes, and tags have clear relationships and foreign-key constraints.
2. **Data integrity:** primary keys, unique constraints, and foreign keys prevent many invalid records and relationships.
3. **Transactions:** creating or updating notes and their tag associations can be handled atomically.
4. **Query flexibility:** SQL joins support reports and retrieval across users, notes, and tags.

A NoSQL database can be suitable when a system has highly variable document structures or specific horizontal-scaling needs. However, QuickNotes has a relatively structured data model, so PostgreSQL is a practical starting point.

## 8. Design Considerations

- The schema is a proposed production design; it is not connected to the current frontend.
- Authorization must be enforced by the backend for every read and write.
- Cascading deletes remove a user's notes and tags when the user is deleted, and remove note-tag associations when a note or tag is deleted.
- Database migrations should be version-controlled as the schema evolves.
- The `updated_at` field requires application logic or a database trigger to refresh automatically on updates.