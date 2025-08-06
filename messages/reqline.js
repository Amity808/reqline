const ReqlineMessages = {
  // Input validation messages
  INVALID_INPUT_FORMAT: "Invalid input format",
  MISSING_REQLINE_PARAMETER: "Missing or invalid reqline parameter",
  
  // Parsing error messages
  PARSING_ERROR: "Parsing error occurred",
  MISSING_HTTP_KEYWORD: "Missing required HTTP keyword",
  MISSING_URL_KEYWORD: "Missing required URL keyword",
  INVALID_HTTP_METHOD: "Invalid HTTP method. Only GET and POST are supported",
  HTTP_METHOD_MUST_BE_UPPERCASE: "HTTP method must be uppercase",
  HTTP_MUST_BE_FIRST: "HTTP keyword must be first",
  URL_MUST_BE_SECOND: "URL keyword must be second",
  MISSING_HTTP_METHOD: "Missing HTTP method",
  MISSING_URL_VALUE: "Missing URL value",
  INVALID_URL_FORMAT: "Invalid URL format",
  
  // Spacing and format validation messages
  INVALID_PIPE_SPACING: "Invalid spacing around pipe delimiter",
  MULTIPLE_SPACES: "Multiple spaces found where single space expected",
  KEYWORDS_MUST_BE_UPPERCASE: "Keywords must be uppercase",
  MISSING_SPACE_AFTER_KEYWORD: "Missing space after keyword",
  
  // JSON validation messages
  INVALID_JSON_HEADERS: "Invalid JSON format in HEADERS section",
  INVALID_JSON_QUERY: "Invalid JSON format in QUERY section",
  INVALID_JSON_BODY: "Invalid JSON format in BODY section",
  
  // Network and execution error messages
  NO_RESPONSE_RECEIVED: "No response received from server",
  REQUEST_SETUP_ERROR: "Request setup error",
  NETWORK_ERROR: "Network error occurred",
  
  // Success messages
  REQUEST_COMPLETED: "Request completed successfully",
};

module.exports = ReqlineMessages; 