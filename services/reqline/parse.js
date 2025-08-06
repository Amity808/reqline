const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const httpRequest = require('@app-core/http-request');
const { appLogger } = require('@app-core/logger');
const ReqlineMessages = require('../../messages/reqline');

const parsedSpec = validator.parse(`root{
  reqline is a required string
}`);

// Constants for the parser
const REQUIRED_KEYWORDS = ["HTTP", "URL"];
const OPTIONAL_KEYWORDS = ["HEADERS", "QUERY", "BODY"];
const VALID_METHODS = ["GET", "POST"];

/**
 * Parse a reqline statement
 * @param {string} reqline - The reqline statement to parse
 * @returns {object} Parsed result or error
 */
function parseReqline(reqline) {
  try {
    // Validate input
    if (!reqline || typeof reqline !== "string") {
      throwAppError(ReqlineMessages.INVALID_INPUT_FORMAT, ERROR_CODE.VALIDATION_ERROR);
    }

    // Validate spacing around pipe delimiters
    if (!validatePipeSpacing(reqline)) {
      throwAppError(ReqlineMessages.INVALID_PIPE_SPACING, ERROR_CODE.VALIDATION_ERROR);
    }

    // Split by pipe delimiter
    const parts = reqline.split("|");

    // Validate minimum parts
    if (parts.length < 2) {
      throwAppError(ReqlineMessages.MISSING_HTTP_KEYWORD, ERROR_CODE.VALIDATION_ERROR);
    }

    // Parse each part
    const parsed = {};

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;

      const parseResult = parsePart(part, i);
      if (parseResult.error) {
        throwAppError(parseResult.message, ERROR_CODE.VALIDATION_ERROR);
      }

      Object.assign(parsed, parseResult);
    }

    // Validate required keywords
    if (!parsed.method) {
      throwAppError(ReqlineMessages.MISSING_HTTP_KEYWORD, ERROR_CODE.VALIDATION_ERROR);
    }
    if (!parsed.url) {
      throwAppError(ReqlineMessages.MISSING_URL_KEYWORD, ERROR_CODE.VALIDATION_ERROR);
    }

    // Validate HTTP method
    if (!VALID_METHODS.includes(parsed.method)) {
      throwAppError(ReqlineMessages.INVALID_HTTP_METHOD, ERROR_CODE.VALIDATION_ERROR);
    }

    return {
      method: parsed.method,
      url: parsed.url,
      headers: parsed.headers || {},
      query: parsed.query || {},
      body: parsed.body || {},
    };
  } catch (error) {
    if (error.code) {
      throw error;
    }
    throwAppError(ReqlineMessages.PARSING_ERROR, ERROR_CODE.VALIDATION_ERROR);
  }
}

/**
 * Validate spacing around pipe delimiters
 * @param {string} reqline - The reqline statement
 * @returns {boolean} True if spacing is valid
 */
function validatePipeSpacing(reqline) {
  const pipeIndexes = [];
  for (let i = 0; i < reqline.length; i++) {
    if (reqline[i] === "|") {
      pipeIndexes.push(i);
    }
  }

  for (const index of pipeIndexes) {
    // Check space before pipe
    if (index > 0 && reqline[index - 1] !== " ") {
      return false;
    }
    // Check space after pipe
    if (index < reqline.length - 1 && reqline[index + 1] !== " ") {
      return false;
    }
  }

  return true;
}

/**
 * Parse a single part of the reqline statement
 * @param {string} part - The part to parse
 * @param {number} index - The index of the part
 * @returns {object} Parsed result or error
 */
function parsePart(part, index) {
  const trimmedPart = part.trim();

  // Check if it starts with a keyword
  for (const keyword of [...REQUIRED_KEYWORDS, ...OPTIONAL_KEYWORDS]) {
    if (trimmedPart.startsWith(keyword + " ")) {
      return parseKeywordSection(trimmedPart, keyword, index);
    }
  }

  // Check for multiple spaces
  if (trimmedPart.includes("  ")) {
    return { error: true, message: ReqlineMessages.MULTIPLE_SPACES };
  }

  return { error: true, message: ReqlineMessages.KEYWORDS_MUST_BE_UPPERCASE };
}

/**
 * Parse a section that starts with a keyword
 * @param {string} part - The part to parse
 * @param {string} keyword - The keyword found
 * @param {number} index - The index of the part
 * @returns {object} Parsed result or error
 */
function parseKeywordSection(part, keyword, index) {
  // Validate keyword case
  if (keyword !== keyword.toUpperCase()) {
    return { error: true, message: ReqlineMessages.KEYWORDS_MUST_BE_UPPERCASE };
  }

  // Check for space after keyword
  if (!part.startsWith(keyword + " ")) {
    return { error: true, message: ReqlineMessages.MISSING_SPACE_AFTER_KEYWORD };
  }

  const value = part.substring(keyword.length + 1).trim();

  if (!value) {
    return { error: true, message: `Missing value for ${keyword}` };
  }

  // Handle different keyword types
  switch (keyword) {
    case "HTTP":
      return parseHttpSection(value, index);
    case "URL":
      return parseUrlSection(value, index);
    case "HEADERS":
      return parseJsonSection(value, "headers", index);
    case "QUERY":
      return parseJsonSection(value, "query", index);
    case "BODY":
      return parseJsonSection(value, "body", index);
    default:
      return { error: true, message: `Unknown keyword: ${keyword}` };
  }
}

/**
 * Parse HTTP section
 * @param {string} value - The HTTP method value
 * @param {number} index - The index of the part
 * @returns {object} Parsed result or error
 */
function parseHttpSection(value, index) {
  // HTTP must be first
  if (index !== 0) {
    return { error: true, message: ReqlineMessages.HTTP_MUST_BE_FIRST };
  }

  const method = value.trim();

  if (!method) {
    return { error: true, message: ReqlineMessages.MISSING_HTTP_METHOD };
  }

  if (method !== method.toUpperCase()) {
    return { error: true, message: ReqlineMessages.HTTP_METHOD_MUST_BE_UPPERCASE };
  }

  return { method };
}

/**
 * Parse URL section
 * @param {string} value - The URL value
 * @param {number} index - The index of the part
 * @returns {object} Parsed result or error
 */
function parseUrlSection(value, index) {
  // URL must be second
  if (index !== 1) {
    return { error: true, message: ReqlineMessages.URL_MUST_BE_SECOND };
  }

  const url = value.trim();

  if (!url) {
    return { error: true, message: ReqlineMessages.MISSING_URL_VALUE };
  }

  // Basic URL validation
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return { error: true, message: ReqlineMessages.INVALID_URL_FORMAT };
  }

  return { url };
}

/**
 * Parse JSON sections (HEADERS, QUERY, BODY)
 * @param {string} value - The JSON value
 * @param {string} section - The section name
 * @param {number} index - The index of the part
 * @returns {object} Parsed result or error
 */
function parseJsonSection(value, section, index) {
  try {
    const jsonValue = JSON.parse(value);

    if (typeof jsonValue !== "object" || jsonValue === null) {
      return {
        error: true,
        message: `Invalid JSON format in ${section.toUpperCase()} section`,
      };
    }

    return { [section]: jsonValue };
  } catch (error) {
    return {
      error: true,
      message: `Invalid JSON format in ${section.toUpperCase()} section`,
    };
  }
}

/**
 * Execute the parsed HTTP request
 * @param {object} parsed - Parsed reqline data
 * @returns {object} Response with request and response data
 */
async function executeRequest(parsed) {
  const startTimestamp = Date.now();

  try {
    // Construct full URL with query parameters
    const fullUrl = constructFullUrl(parsed.url, parsed.query);

    // Prepare request config
    const config = {
      method: parsed.method.toLowerCase(),
      url: fullUrl,
      headers: parsed.headers,
      timeout: 10000, // 10 second timeout
    };

    // Add body for POST requests
    if (parsed.method === "POST" && Object.keys(parsed.body).length > 0) {
      config.data = parsed.body;
    }

    // Execute the request using the core http-request library
    const response = await httpRequest(config);
    const endTimestamp = Date.now();
    const duration = endTimestamp - startTimestamp;

    // Format response data
    const responseData = response.data;

    return {
      request: {
        query: parsed.query,
        body: parsed.body,
        headers: parsed.headers,
        full_url: fullUrl,
      },
      response: {
        http_status: response.status,
        duration: duration,
        request_start_timestamp: startTimestamp,
        request_stop_timestamp: endTimestamp,
        response_data: responseData,
      },
    };
  } catch (error) {
    const endTimestamp = Date.now();
    const duration = endTimestamp - startTimestamp;

    // Handle http-request errors
    if (error.response) {
      // Server responded with error status
      return {
        request: {
          query: parsed.query,
          body: parsed.body,
          headers: parsed.headers,
          full_url: constructFullUrl(parsed.url, parsed.query),
        },
        response: {
          http_status: error.response.status,
          duration: duration,
          request_start_timestamp: startTimestamp,
          request_stop_timestamp: endTimestamp,
          response_data: error.response.data,
        },
      };
    } else if (error.request) {
      // Request was made but no response received
      throwAppError(ReqlineMessages.NO_RESPONSE_RECEIVED, ERROR_CODE.NETWORK_ERROR);
    } else {
      // Error in request setup
      throwAppError(ReqlineMessages.REQUEST_SETUP_ERROR, ERROR_CODE.NETWORK_ERROR);
    }
  }
}

/**
 * Construct full URL with query parameters
 * @param {string} baseUrl - The base URL
 * @param {object} queryParams - Query parameters object
 * @returns {string} Full URL with query parameters
 */
function constructFullUrl(baseUrl, queryParams) {
  if (!queryParams || Object.keys(queryParams).length === 0) {
    return baseUrl;
  }

  const url = new URL(baseUrl);

  for (const [key, value] of Object.entries(queryParams)) {
    url.searchParams.append(key, value);
  }

  return url.toString();
}

/**
 * Main service function for parsing and executing reqline requests
 * @param {object} serviceData - Service data containing reqline
 * @returns {object} Parsed and executed request response
 */
async function parseReqlineService(serviceData) {
  try {
    // Validate input using the core validator
    const data = validator.validate(serviceData, parsedSpec);

    appLogger.info('Parsing reqline request', { reqline: data.reqline });

    // Parse the reqline statement
    const parsed = parseReqline(data.reqline);

    // Execute the HTTP request
    const result = await executeRequest(parsed);

    appLogger.info('Reqline request completed successfully', { 
      method: parsed.method, 
      url: parsed.url,
      duration: result.response.duration 
    });

    return result;
  } catch (error) {
    appLogger.error('Reqline request failed', { 
      error: error.message,
      reqline: serviceData.reqline 
    });
    throw error;
  }
}

module.exports = parseReqlineService; 