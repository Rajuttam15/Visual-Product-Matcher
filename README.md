Visual Product Matcher
Live Application URL: [YOUR_HOSTED_URL_HERE]

This project is a web application built for a technical assessment. It allows users to upload an image (either by file or URL) and find visually similar images using an AI-powered API.

Project Overview & Approach (Write-up)
The goal was to build a clean, functional, and user-friendly visual search tool within an 8-hour timeframe. My approach prioritized rapid development and a robust user experience by leveraging modern front-end technologies.

I chose React with Vite for its fast development server and optimized build process. For styling, I used Tailwind CSS to create a responsive, modern interface without writing custom CSS.

The core visual search functionality is powered by the Imagga API. Instead of building a complex backend or a custom machine learning model, which would be unfeasible given the time constraints, I integrated Imagga's free-tier "Fingerprints" endpoint. This API takes an uploaded image or URL, generates a unique visual hash, and compares it against its indexed images to return a list of matches based on visual similarity. This decision allowed me to focus on building a polished front-end that effectively handles API states (loading, success, error) and provides a seamless user flow, directly meeting the project's core requirements.

Features
Dual Image Upload: Supports both drag-and-drop file upload and pasting an image URL.

Live AI-Powered Search: Integrates with the Imagga API to find visually similar images in real-time.

Dynamic UI: The interface provides clear feedback for loading, error, and empty states.

Similarity Filtering: Users can filter results based on a minimum similarity score.

Fully Responsive: The design is mobile-friendly and works across various screen sizes.

Error Handling: Displays user-friendly messages if the API call fails or an image URL is invalid.

Tech Stack
Frontend: React.js, Vite

Styling: Tailwind CSS

Icons: Lucide React

API: Imagga Visual AI API

Local Development Setup
Clone the repository:

git clone [YOUR_REPOSITORY_URL]
cd visual-product-matcher

Install dependencies:

npm install

Run the development server:
(The API key has been pre-configured in src/App.jsx)

npm run dev

The application will be running at http://localhost:5173.

