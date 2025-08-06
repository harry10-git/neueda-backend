// const express = require('express');
// const axios = require('axios');
// const bodyParser = require('body-parser');
// const dotenv = require('dotenv');

// dotenv.config();  // Load environment variables (API keys)

// const app = express();
// const port = 3000;

// // Middleware to parse JSON requests
// app.use(bodyParser.json());

// // Gemini API endpoint
// const geminiApiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// // POST endpoint to handle user messages
// app.post('/ai-chat', async (req, res) => {
//     const userMessage = req.body.message;

//     if (!userMessage) {
//         return res.status(400).send('Message is required.');  // Return plain text for errors
//     }

//     try {
//         // Prepare the request body based on the provided curl example
//         const requestBody = {
//             contents: [
//                 {
//                     parts: [
//                         {
//                             text: userMessage
//                         }
//                     ]
//                 }
//             ]
//         };

//         // Call Gemini API
//         const response = await axios.post(geminiApiEndpoint, requestBody, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-goog-api-key': process.env.GEMINI_API_KEY,  // Use Gemini API key from .env
//             }
//         });

//         // Log the full response for debugging
//         console.log('Full Gemini API response:', response.data);

//         // Check if the expected structure exists before accessing
//         if (response.data && response.data.candidates && response.data.candidates[0]) {
//             const aiResponse = response.data.candidates[0].content;  // Access content inside candidates
//             return res.send(aiResponse);  // Return the raw AI response as plain text
//         } else {
//             return res.status(500).send('Unexpected response structure from Gemini API');
//         }

//     } catch (error) {
//         console.error('Error from Gemini API:', error.response ? error.response.data : error.message);
//         return res.status(500).send('An error occurred while processing the message');
//     }
// });

// // Start the server
// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();  // Load environment variables (API keys)

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Gemini API endpoint
const geminiApiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// POST endpoint to handle user messages
app.post('/ai-chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).send('Message is required.');  // Return plain text for errors
    }

    try {
        // Concatenate the instruction for summarization
        const promptMessage = `Summarize the following in 4 to 5 lines, act like chatbot, ignore and return prompts which are not related to financial queries: ${userMessage}`;

        // Prepare the request body to send to Gemini API
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: promptMessage
                        }
                    ]
                }
            ]
        };

        // Call Gemini API
        const response = await axios.post(geminiApiEndpoint, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': process.env.GEMINI_API_KEY,  // Use Gemini API key from .env
            }
        });

        // Log the full response for debugging (optional)
        console.log('Full Gemini API response:', response.data);

        // Check if the expected structure exists before accessing
        if (response.data && response.data.candidates && response.data.candidates[0]) {
            const aiResponse = response.data.candidates[0].content;  // Access content inside candidates
            return res.send(aiResponse);  // Return the raw AI response as plain text
        } else {
            return res.status(500).send('Unexpected response structure from Gemini API');
        }

    } catch (error) {
        console.error('Error from Gemini API:', error.response ? error.response.data : error.message);
        return res.status(500).send('An error occurred while processing the message');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

