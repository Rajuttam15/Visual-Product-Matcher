import fetch from "node-fetch";
import { Buffer } from "buffer";
import process from "process";

export async function handler(event) {
  try {
    const { path, imageUrl, imageBase64 } = JSON.parse(event.body || "{}");

    if (!path) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing path" }),
      };
    }

    // Build API endpoint
    const endpoint = `https://api.imagga.com/v2/${path}`;

    // Prepare request
    let options = {
      method: event.httpMethod === "POST" ? "POST" : "GET",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.IMAGGA_API_KEY + ":" + process.env.IMAGGA_API_SECRET
          ).toString("base64"),
      },
    };

    // Handle image upload (file or URL)
    if (path === "uploads") {
      const formData = new FormData();
      if (imageUrl) {
        formData.append("image_url", imageUrl);
      } else if (imageBase64) {
        // if frontend sends Base64 string
        formData.append("image_base64", imageBase64);
      }
      options.body = formData;
    }

    // Make request to Imagga
    const response = await fetch(endpoint, options);
    const data = await response.json();

    return {
      statusCode: response.status,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}