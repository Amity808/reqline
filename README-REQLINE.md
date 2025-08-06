# Reqline Parser - Resilience17 Implementation

This implementation follows the Resilience17 Backend Assessment template and incorporates clean OOP concepts, functional programming paradigms, and JavaScript conventions.

## 🏗️ Architecture Overview

### Data Flow
```
Client Request → Server Function → Endpoint Handler → Reqline Service → HTTP Request Execution
```

### File Structure
```
assessment-profold/
├── endpoints/
│   └── reqline/
│       ├── parse.js          # Main parsing endpoint
│       └── health.js         # Health check endpoint
├── services/
│   └── reqline/
│       └── parse.js          # Core parsing and execution logic
├── messages/
│   └── reqline.js            # Error messages and constants
└── app.js                     # Server configuration with endpoint registration
```

## 🎯 Features

### Core Functionality
- **Manual String Parsing** - No regex used, custom parsing logic
- **Strict Syntax Validation** - Enforces exact spacing and keyword requirements
- **HTTP Request Execution** - Uses @app-core/http-request library
- **Comprehensive Error Handling** - Specific error messages using @app-core/errors
- **Structured Logging** - Uses @app-core/logger for request tracking

### Resilience17 Integration
- **Validator Integration** - Uses @app-core/validator for input validation
- **Error Handling** - Uses @app-core/errors with specific error codes
- **HTTP Requests** - Uses @app-core/http-request for external calls
- **Logging** - Uses @app-core/logger for structured logging
- **Server Functions** - Uses @app-core/server for endpoint creation

## 📝 API Endpoints

### POST /parse
Parses and executes reqline statements.

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

### GET /health
Health check endpoint for the reqline service.

**Response:**
```json
{
  "status": "OK",
  "message": "Reqline parser is running",
  "timestamp": 1691234567890,
  "service": "reqline-parser",
  "version": "1.0.0"
}
```

## 🔧 Technical Implementation

### Service Layer (services/reqline/parse.js)
- **Input Validation** - Uses @app-core/validator
- **Manual String Parsing** - Custom parsing without regex
- **HTTP Request Execution** - Uses @app-core/http-request
- **Error Handling** - Uses @app-core/errors with specific codes
- **Logging** - Uses @app-core/logger for request tracking

### Error Handling
All errors use the Resilience17 error system:
- **Validation Errors** - ERROR_CODE.VALIDATION_ERROR
- **Network Errors** - ERROR_CODE.NETWORK_ERROR
- **Specific Messages** - Defined in messages/reqline.js

### Logging
Structured logging using @app-core/logger:
- **Request Logging** - Tracks parsing and execution
- **Error Logging** - Logs failures with context
- **Performance Logging** - Records duration and timing

## 🧪 Testing

### Valid Examples
```bash
# Basic GET request
HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {"refid": 1920933}

# POST request with headers and body
HTTP POST | URL https://jsonplaceholder.typicode.com/posts | HEADERS {"Content-Type": "application/json"} | BODY {"title": "Test Post", "body": "This is a test", "userId": 1}

# GET request without optional sections
HTTP GET | URL https://dummyjson.com/quotes/3
```

### Error Examples
```bash
# Invalid HTTP method
HTTP PUT | URL https://dummyjson.com/quotes/3

# Invalid JSON in QUERY section
HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {invalid json}

# Missing space around pipe delimiter
HTTP GET|URL https://dummyjson.com/quotes/3
```

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   node app.js
   ```

3. **Test the Endpoint**
   ```bash
   curl -X POST http://localhost:8811/parse \
     -H "Content-Type: application/json" \
     -d '{"reqline": "HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {\"refid\": 1920933}"}'
   ```


### Architecture Patterns
- **MVC Architecture** - Clear separation of concerns
- **Clean OOP Concepts** - Repository and service patterns
- **Functional Programming** - Pure functions and immutability
- **JavaScript Conventions** - Proper naming and structure

### Programming Conventions
- **Verb-based File Names** - parse.js, health.js
- **Kebab-case Filenames** - reqline folder structure
- **Camel-case Functions** - parseReqlineService, executeRequest
- **Snake-case Payloads** - request_meta, response_data

### Core Integration
- **@app-core/validator** - Input validation
- **@app-core/errors** - Error handling
- **@app-core/http-request** - External requests
- **@app-core/logger** - Structured logging
- **@app-core/server** - Endpoint creation

### Error Handling
- **Specific Error Messages** - Defined in messages/reqline.js
- **Error Codes** - Using ERROR_CODE constants
- **Graceful Degradation** - Proper error responses

This implementation demonstrates precision, attention to detail, and robust error handling while following the Resilience17 template architecture. 