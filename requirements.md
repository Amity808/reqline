# Technical Assessment Requirements

## Project Overview

Build a simple parser for a curl-like tool called `reqline` that can parse HTTP request statements and execute them.

## Core Requirements

### 1. Parser Implementation

- **NO regex allowed** - must implement parsing logic manually
- Parse statements in the format: `HTTP [method] | URL [URL value] | HEADERS [header json value] | QUERY [query value json] | BODY [body value json]`

### 2. Syntax Rules

- All keywords must be UPPERCASE: `HTTP`, `HEADERS`, `QUERY`, `BODY`
- Single delimiter: pipe `|`
- Exactly one space on each side of keywords and delimiters
- HTTP methods: `GET` or `POST` only (uppercase)
- `HTTP` and `URL` are required and must be in fixed order
- Other keywords (`HEADERS`, `QUERY`, `BODY`) can appear in any order or be omitted

### 3. Valid Examples

```
HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {"refid": 1920933}
HTTP GET | URL https://dummyjson.com/quotes/3 | HEADERS {"Content-Type": "application/json"} | QUERY {"refid": 1920933}
```

### 4. API Endpoint Requirements

- Create endpoint at app's base path (e.g., `yourapp.onrender.com/`)
- Accept requests in format: `{"reqline": "[REQLINE STATEMENT]"}`
- Parse and execute the request using axios or similar
- Return appropriate responses based on success or failure

### 5. Success Response Format (HTTP 200)

```json
{
  "request": {
    "query": { "refid": 1920933 },
    "body": {},
    "headers": {},
    "full_url": "https://dummyjson.com/quotes/3?refid=1920933"
  },
  "response": {
    "http_status": 200,
    "duration": 347,
    "request_start_timestamp": 1691234567890,
    "request_stop_timestamp": 1691234568237,
    "response_data": {
      "id": 3,
      "quote": "Thinking is the capital, Enterprise is the way, Hard Work is the solution.",
      "author": "Abdul Kalam"
    }
  }
}
```

### 6. Error Response Format (HTTP 400)

```json
{
  "error": true,
  "message": "Specific reason for the error"
}
```

### 7. Required Error Messages

- "Missing required HTTP keyword"
- "Missing required URL keyword"
- "Invalid HTTP method. Only GET and POST are supported"
- "HTTP method must be uppercase"
- "Invalid spacing around pipe delimiter"
- "Invalid JSON format in HEADERS section"
- "Invalid JSON format in QUERY section"
- "Invalid JSON format in BODY section"
- "Keywords must be uppercase"
- "Missing space after keyword"
- "Multiple spaces found where single space expected"

### 8. Technical Requirements

- Use Node.js (vanilla JavaScript) and Express.js
- Follow the provided backend template structure exactly
- Duration and timestamps in milliseconds (no decimals)
- No authentication required for the endpoint
- Handle all parsing errors gracefully with appropriate error messages

### 9. Deployment Requirements

- Deploy on cloud platform (Heroku, Render, or similar)
- Provide publicly accessible GitHub repository
- Provide deployed, working endpoint that can be tested

## Important Notes

- Duration and timestamps must be in milliseconds (no decimals)
- Following instructions exactly is absolutely required
- Handle all parsing errors gracefully with appropriate error messages
