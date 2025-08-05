const express = require("express");
const axios = require("axios");
const { parseReqline } = require("../utils/parser");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { reqline } = req.body;

    // Validate request body
    if (!reqline || typeof reqline !== "string") {
      return res.status(400).json({
        error: true,
        message: "Missing or invalid reqline parameter",
      });
    }

    const parsed = parseReqline(reqline);

    // Check for parsing errors
    if (parsed.error) {
      return res.status(400).json({
        error: true,
        message: parsed.message,
      });
    }

    const result = await executeRequest(parsed);

    if (result.error) {
      return res.status(400).json({
        error: true,
        message: result.message,
      });
    }

    // Return success response
    res.status(200).json(result);
  } catch (error) {
    console.error("Reqline processing error:", error);
    res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});

async function executeRequest(parsed) {
  const startTimestamp = Date.now();

  try {
    const fullUrl = constructFullUrl(parsed.url, parsed.query);

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

    // Execute the request
    const response = await axios(config);
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

    // Handle axios errors
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
      return {
        error: true,
        message: "No response received from server",
      };
    } else {
      // Error in request setup
      return {
        error: true,
        message: "Request setup error: " + error.message,
      };
    }
  }
}

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

module.exports = router;
