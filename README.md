# QuickNotes — Notes Manager & System Design

QuickNotes is a simple notes application built to practise frontend API integration and backend system design. The browser application supports loading, creating, and deleting notes through HTTP requests, while the accompanying documentation describes a proposed production-ready architecture.

## Project Overview

The project combines a working API client with system design documentation covering REST API design, relational data modelling, capacity estimation, scalability, and reliability.

### Current Features

- Load and display notes from a practice REST API.
- Create notes using HTTP `POST`.
- Delete notes using HTTP `DELETE`.
- Validate required titles and enforce a 100-character title limit.
- Display loading, success, empty, and error states.
- Disable action buttons while requests are in progress.
- Safely display note content using `textContent`.
- Use responsive CSS for desktop and mobile screens.

## Technology Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API
- JSONPlaceholder practice API
- PostgreSQL for the proposed production data model
- Mermaid for the system architecture diagram

## Project Structure

```text
quicknotes-system-design/
├── index.html
├── style.css
├── api.js
├── README.md
└── docs/
    ├── api-design.md
    ├── data-model.md
    └── architecture.md
```

## Run the Application

1. Clone or download this repository.
2. Open the project folder.
3. Open `index.html` in a browser, or use a local development server such as the VS Code Live Server extension.
4. Click **Load notes** to retrieve notes.
5. Use the form to create a note, or click **Delete note** to remove one from the displayed list.

An internet connection is required to reach the JSONPlaceholder API.

### Important API Limitation

The application uses `https://jsonplaceholder.typicode.com/posts` as a practice API. It simulates POST and DELETE operations but does not persist these changes on the server. Notes created or deleted during a session may not remain changed after reloading the page.

The production API described in the documentation is a proposed design and is not yet implemented or connected to this frontend.

## System Design Documentation

Read the accompanying documents:

1. [API Design](docs/api-design.md) — REST endpoints, request and response examples, HTTP status codes, error handling, and security.
2. [Data Model](docs/data-model.md) — users, notes, tags, relationships, PostgreSQL table definitions, SQL queries, indexes, and database selection.
3. [System Architecture](docs/architecture.md) — functional and non-functional requirements, architecture diagram, load and storage estimates, request flows, trade-offs, and resilience.

## Scalability Assumptions

The architecture document estimates capacity for one million registered users using an assumed 10% daily active user rate.

| Metric | Estimated average |
|---|---:|
| Daily active users | 100,000 |
| Note reads per second | Approximately 23 |
| Note writes per second | Approximately 2.3 |
| Raw new-note storage per year | Approximately 146 GB |

These are planning estimates based on documented assumptions, not measured production traffic. The architecture also considers a 5× peak traffic factor.

## What I Learned

- How to use the Fetch API for asynchronous GET, POST, and DELETE requests, including error handling and request-state management.
- Why client-side validation, safe text rendering, and clear user feedback matter when building web applications.
- How relational database tables, primary keys, foreign keys, joins, and indexes support structured application data.
- How to estimate request rates and storage needs using explicit assumptions.
- How load balancing, caching, read replicas, queues, and background workers contribute to scalability and resilience.
- How to document API contracts and architectural trade-offs before implementing a production backend.

## Future Improvements

- Build a persistent backend API connected to PostgreSQL.
- Add authentication and enforce user-level authorization.
- Persist notes across sessions and devices.
- Implement tags, editing, pagination, and search.
- Add automated tests and continuous integration.
- Deploy the frontend and backend to suitable hosting services.

## Project Status

The browser API client has been tested for GET, POST, DELETE, title validation, and network error handling. System design documentation is included for a future production implementation.

This project is an educational system design exercise and does not yet provide a persistent production backend.