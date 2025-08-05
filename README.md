# Reqline Parser

A specialized HTTP request parser that parses reqline statements and executes them using axios. Built with Node.js and Express.

## Features

- **Manual String Parsing**: No regex used - implements custom parsing logic
- **Strict Syntax Validation**: Enforces exact spacing and keyword requirements
- **HTTP Request Execution**: Executes parsed requests using axios
- **Comprehensive Error Handling**: Returns specific error messages for various failure cases
- **Timing Information**: Records precise timestamps and duration for requests
- **Query Parameter Support**: Automatically constructs full URLs with query parameters

## Installation

```bash
npm install
```

## Usage

### Start the server

```bash
node server.js
```

Or for development with auto-restart:

```bash
npm run dev
```

The server will start on port 8000 (or the PORT environment variable).

## API Endpoint

### POST /

Accepts reqline statements and executes them.

**Request Format:**

```json
{
  "reqline": "HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {\"refid\": 1920933}"
}
```

**Success Response (HTTP 200):**

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

**Error Response (HTTP 400):**

```json
{
  "error": true,
  "message": "Specific reason for the error"
}
```

## Reqline Syntax

### Format

```
HTTP [method] | URL [URL value] | HEADERS [header json value] | QUERY [query value json] | BODY [body value json]
```

### Rules -> Follow the rule

- All keywords must be UPPERCASE: `HTTP`, `HEADERS`, `QUERY`, `BODY`
- Single delimiter: pipe `|`
- Exactly one space on each side of keywords and delimiters
- HTTP methods: `GET` or `POST` only (uppercase)
- `HTTP` and `URL` are required and must be in fixed order
- Other keywords (`HEADERS`, `QUERY`, `BODY`) can appear in any order or be omitted

### Valid Examples

```bash
# Basic GET request
HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {"refid": 1920933}

# GET request with headers
HTTP GET | URL https://dummyjson.com/quotes/3 | HEADERS {"Content-Type": "application/json"} | QUERY {"refid": 1920933}

# POST request with body
HTTP POST | URL https://api.example.com/users | HEADERS {"Authorization": "Bearer token"} | BODY {"name": "John", "email": "john@example.com"}

# POST request with all sections
HTTP POST | URL https://api.example.com/data | HEADERS {"Content-Type": "application/json"} | QUERY {"page": 1} | BODY {"data": "value"}
```

## Error Messages

The parser returns specific error messages for various validation failures:

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

## Testing

### Using curl

```bash
# Test basic GET request
curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{"reqline": "HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {\"refid\": 1920933}"}'

# Test POST request
curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{"reqline": "HTTP POST | URL https://jsonplaceholder.typicode.com/posts | HEADERS {\"Content-Type\": \"application/json\"} | BODY {\"title\": \"Test Post\", \"body\": \"This is a test\", \"userId\": 1}"}'
```


```

## Health Check

```bash
curl http://localhost:3000/health
```

Returns:

```json
{
  "status": "OK",
  "message": "Reqline parser is running",
  "timestamp": 1691234567890
}
```

## Project Structure

```
/
├── package.json
├── server.js
├── routes/
│   └── reqline.js
├── utils/
│   └── parser.js
├── middleware/
│   └── errorHandler.js
└── README.md
```

## Dependencies

- `express`: Web framework
- `axios`: HTTP client for making requests
- `cors`: Cross-origin resource sharing middleware

