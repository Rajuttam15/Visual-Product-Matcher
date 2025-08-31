import fetch from "node-fetch";

export async function handler(event) {
  const { path, image_url, image_upload_id } = event.queryStringParameters || {};

  const IMAGGA_ENDPOINT = "https://api.imagga.com/v2";
  const AUTH_HEADER =
    "Basic YWNjXzlkNDgyNTEzYzgwNmI3MDozNTA2ZDAzMzQ3OTFkN2E1Y2RlNTk1Mzc0MWViNjgxYw==";

  try {
    let url = "";
    let options = {
      method: "GET",
      headers: { Authorization: AUTH_HEADER },
    };

    if (event.httpMethod === "POST" && path === "uploads") {
      // Handle file upload (binary/FormData)
      url = `${IMAGGA_ENDPOINT}/uploads`;
      options = {
        method: "POST",
        headers: {
          Authorization: AUTH_HEADER,
          "Content-Type": event.headers["content-type"],
        },
        body: event.body,
      };
    } else if (path === "uploads" && image_url) {
      // Handle URL upload
      url = `${IMAGGA_ENDPOINT}/uploads`;
      options = {
        method: "POST",
        headers: {
          Authorization: AUTH_HEADER,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_url }),
      };
    } else if (path === "images-similarity/fingerprints" && image_upload_id) {
      // Similarity search
      url = `${IMAGGA_ENDPOINT}/images-similarity/fingerprints?image_upload_id=${image_upload_id}&limit=50`;
    } else if (path === "tags" && image_url) {
      // Tags API
      url = `${IMAGGA_ENDPOINT}/tags?image_url=${encodeURIComponent(image_url)}`;
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid request" }) };
    }

    const response = await fetch(url, options);
    const data = await response.json();

    return {
      statusCode: response.status,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}