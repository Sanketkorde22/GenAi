import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import fs from 'fs/promises';

// Initialize Express app
const app = express();
const token = process.env_TOKEN;
// Initialize GoogleGenerativeAI with the provided API key
const genAI = new GoogleGenerativeAI(token);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Route for project selection
app.get('/select-project', (req, res) => {
    res.send(`
        <html>
            <body>
                <h1>Select Your Project</h1>
                <form action="/upload-code" method="post" enctype="multipart/form-data">
                    <label>Select Project:
                        <select name="project" required>
                            <option value="book-store">Book Store (MERN)</option>
                            <option value="telegram-bot">Telegram Bot (Node)</option>
                        </select>
                    </label><br>
                    <label>Upload Code:
                        <input type="file" name="code" accept=".zip" required>
                    </label><br>
                    <button type="submit">Upload and Select Project</button>
                </form>
            </body>
        </html>
    `);
});

// Route to handle code upload and project selection
app.post('/upload-code', upload.single('code'), async (req, res) => {
    const { project } = req.body;
    const file = req.file;

    if (!project || !file) {
        return res.send("Project and file are required.");
    }

    // Save the project code file path
    const codePath = path.join(__dirname, 'uploads', file.filename);

    // Process and index the code (mock implementation)
    await processAndIndexCode(project, codePath);

    res.send(`
        <html>
            <body>
                <h1>Code Uploaded</h1>
                <form action="/ask-question" method="get">
                    <input type="hidden" name="project" value="${project}">
                    <input type="text" name="question" placeholder="Ask a question" required>
                    <button type="submit">Submit</button>
                </form>
            </body>
        </html>
    `);
});

// Function to process and index code (mock implementation)
async function processAndIndexCode(project, codePath) {
    // In a real application, you would parse and index the code here.
    console.log(`Processing and indexing code for project ${project} at ${codePath}`);
    // For now, this function just logs the action.
}

// Route to handle project and question
app.get('/ask-question', async (req, res) => {
    const project = req.query.project;
    const question = req.query.question;

    if (!project || !question) {
        return res.send("Project and question are required.");
    }

    // Generate content based on project and question
    const response = await generateContent(project, question);

    res.send(`
        <html>
            <body>
                <h1>Response</h1>
                <p>${response}</p>
                <a href="/select-project">Ask another question</a>
            </body>
        </html>
    `);
});

// Function to generate content based on project and question
const generateContent = async (project, question) => {
    let prompt;

    switch (project) {
        case 'book-store':
            prompt = `Answer the following question related to a Book Store project using MERN stack: ${question}`;
            break;
        case 'telegram-bot':
            prompt = `Answer the following question related to a Telegram Bot project using Node.js: ${question}`;
            break;
        default:
            return "Project not recognized.";
    }

    try {
        const res = await model.generateContent(prompt);
        return res.response.text();
    } catch (error) {
        console.error('Error generating content:', error);
        return "Sorry, I couldn't generate content at this time.";
    }
};

// Start the Express server
app.listen(8080, () => {
    console.log("Server is running on port 8080...");
});
