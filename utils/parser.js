// Constants for the parser
const REQUIRED_KEYWORDS = ["HTTP", "URL"];
const OPTIONAL_KEYWORDS = ["HEADERS", "QUERY", "BODY"];
const VALID_METHODS = ["GET", "POST"];

function parseReqline(reqline) {
  try {
    // Validate input
    if (!reqline || typeof reqline !== "string") {
      return { error: true, message: "Invalid input format" };
    }

    // Validate spacing around pipe delimiters
    if (!validatePipeSpacing(reqline)) {
      return {
        error: true,
        message: "Invalid spacing around pipe delimiter",
      };
    }

    // Split by pipe delimiter
    const parts = reqline.split("|");

    // Validate minimum parts
    if (parts.length < 2) {
      return { error: true, message: "Missing required HTTP keyword" };
    }

    // Parse each part
    const parsed = {};

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;

      const parseResult = parsePart(part, i);
      if (parseResult.error) {
        return parseResult;
      }

      Object.assign(parsed, parseResult);
    }

    // Validate required keywords
    if (!parsed.method) {
      return { error: true, message: "Missing required HTTP keyword" };
    }
    if (!parsed.url) {
      return { error: true, message: "Missing required URL keyword" };
    }

    // Validate HTTP method
    if (!VALID_METHODS.includes(parsed.method)) {
      return {
        error: true,
        message: "Invalid HTTP method. Only GET and POST are supported",
      };
    }

    return {
      method: parsed.method,
      url: parsed.url,
      headers: parsed.headers || {},
      query: parsed.query || {},
      body: parsed.body || {},
    };
  } catch (error) {
    return { error: true, message: "Parsing error: " + error.message };
  }
}

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
    return {
      error: true,
      message: "Multiple spaces found where single space expected",
    };
  }

  return { error: true, message: "Keywords must be uppercase" };
}

function parseKeywordSection(part, keyword, index) {
  // Validate keyword case
  if (keyword !== keyword.toUpperCase()) {
    return { error: true, message: "Keywords must be uppercase" };
  }

  // Check for space after keyword
  if (!part.startsWith(keyword + " ")) {
    return { error: true, message: "Missing space after keyword" };
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
    return { error: true, message: "HTTP keyword must be first" };
  }

  const method = value.trim();

  if (!method) {
    return { error: true, message: "Missing HTTP method" };
  }

  if (method !== method.toUpperCase()) {
    return { error: true, message: "HTTP method must be uppercase" };
  }

  return { method };
}

function parseUrlSection(value, index) {
  // URL must be second
  if (index !== 1) {
    return { error: true, message: "URL keyword must be second" };
  }

  const url = value.trim();

  if (!url) {
    return { error: true, message: "Missing URL value" };
  }

  // Basic URL validation
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return { error: true, message: "Invalid URL format" };
  }

  return { url };
}

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

module.exports = {
  parseReqline,
  validatePipeSpacing,
  parsePart,
  parseKeywordSection,
  parseHttpSection,
  parseUrlSection,
  parseJsonSection,
  REQUIRED_KEYWORDS,
  OPTIONAL_KEYWORDS,
  VALID_METHODS,
};
