import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import FormData from "form-data";
import { Buffer } from "buffer";

// 🔑 Your API credentials
const API_KEY = "acc_9d482513c806b70";
const API_SECRET = "3506d0334791d7a5cde5953741eb681c";
const AUTH_HEADER = "Basic " + Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64");

const DATASET_DIR = "./dataset"; // folder with images
const OUTPUT_FILE = "./src/data/products.json"; // output file with metadata

async function uploadImage(filePath) {
  const form = new FormData();
  form.append("image", fs.createReadStream(filePath));

  const response = await fetch("https://api.imagga.com/v2/uploads", {
    method: "POST",
    headers: {
      Authorization: AUTH_HEADER,
    },
    body: form,
  });

  const data = await response.json();

  if (data.status.type === "success") {
    return data.result.upload_id;
  } else {
    console.error("❌ Upload failed for", filePath, data);
    return null;
  }
}

async function main() {
  const files = fs.readdirSync(DATASET_DIR).filter((f) => /\.(jpg|jpeg|png)$/i.test(f));

  const products = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(DATASET_DIR, file);

    console.log(`⬆️ Uploading ${file}...`);

    const upload_id = await uploadImage(filePath);

    if (upload_id) {
      products.push({
        id: i + 1,
        name: file.replace(/\.[^/.]+$/, ""), // file name as product name
        category: "Unknown", // you can edit later
        price: "N/A", // can enrich manually
        rating: "N/A",
        upload_id,
      });

      console.log(`✅ Uploaded ${file} → ${upload_id}`);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(products, null, 2));
  console.log(`\n🎉 Done! Saved product metadata to ${OUTPUT_FILE}`);
}

main().catch((err) => console.error("❌ Error:", err));