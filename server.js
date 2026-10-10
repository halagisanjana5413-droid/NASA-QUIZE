const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const dataDirectory = path.join(__dirname, "data");
const leaderboardFile = path.join(dataDirectory, "leaderboard.json");

if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
}

if (!fs.existsSync(leaderboardFile)) {
    fs.writeFileSync(leaderboardFile, "[]");
}

const questions = [
    {
        id: 1,
        level: 1,
        question: "Which celestial body does Earth orbit?",
        options: ["The Moon", "The Sun", "Mars", "Jupiter"],
        answer: 1,
        explanation: "Earth revolves around the Sun."
    },
    {
        id: 2,
        level: 1,
        question: "What is Earth's natural satellite?",
        options: ["Venus", "Mars", "The Moon", "The Sun"],
        answer: 2,
        explanation: "The Moon is Earth's natural satellite."
    },
    {
        id: 3,
        level: 1,
        question: "Which planet is known as the Red Planet?",
        options: ["Mars", "Saturn", "Neptune", "Mercury"],
        answer: 0,
        explanation: "Iron-rich dust gives Mars its reddish appearance."
    },
    {
        id: 4,
        level: 1,
        question: "What do astronauts wear in space?",
        options: [
            "Raincoat",
            "Spacesuit",
            "School uniform",
            "Lab coat"
        ],
        answer: 1,
        explanation: "Spacesuits help astronauts survive in space."
    },
    {
        id: 5,
        level: 1,
        question: "What is the name of our galaxy?",
        options: [
            "Andromeda",
            "Whirlpool",
            "Milky Way",
            "Sombrero"
        ],
        answer: 2,
        explanation: "Our Solar System is part of the Milky Way galaxy."
    },

    {
        id: 6,
        level: 2,
        question: "Who was the first human to walk on the Moon?",
        options: [
            "Yuri Gagarin",
            "Neil Armstrong",
            "Buzz Aldrin",
            "Rakesh Sharma"
        ],
        answer: 1,
        explanation: "Neil Armstrong walked on the Moon in 1969."
    },
    {
        id: 7,
        level: 2,
        question: "Which country operates the Chandrayaan missions?",
        options: ["Japan", "India", "Canada", "Brazil"],
        answer: 1,
        explanation: "Chandrayaan is India's lunar exploration programme."
    },
    {
        id: 8,
        level: 2,
        question: "What force keeps planets in orbit around the Sun?",
        options: ["Friction", "Magnetism only", "Gravity", "Sound"],
        answer: 2,
        explanation: "Gravity helps keep planets in their orbits."
    },
    {
        id: 9,
        level: 2,
        question: "Which instrument helps us observe distant objects in space?",
        options: ["Telescope", "Microscope", "Thermometer", "Compass"],
        answer: 0,
        explanation: "Telescopes collect light to observe distant objects."
    },
    {
        id: 10,
        level: 2,
        question: "What is a lunar rover used for?",
        options: [
            "Swimming on the Moon",
            "Exploring the lunar surface",
            "Producing rain",
            "Flying inside Earth"
        ],
        answer: 1,
        explanation: "A lunar rover helps explore the Moon's surface."
    },

    {
        id: 11,
        level: 3,
        question: "What is the main reason the Moon has phases?",
        options: [
            "Earth's shadow always covers it",
            "The Moon changes shape",
            "We see different portions of its sunlit side",
            "The Sun switches off"
        ],
        answer: 2,
        explanation: "The Moon's phases depend on its position relative to Earth and the Sun."
    },
    {
        id: 12,
        level: 3,
        question: "What is the Moon's surface covered with?",
        options: [
            "Thick forests",
            "Regolith, dust and rocks",
            "Liquid oceans everywhere",
            "Green grass"
        ],
        answer: 1,
        explanation: "The lunar surface has a layer of loose dust, soil-like material and broken rocks called regolith."
    },
    {
        id: 13,
        level: 3,
        question: "Why do astronauts need oxygen supplies on the Moon?",
        options: [
            "The Moon has no breathable atmosphere",
            "The Moon is too bright",
            "The Moon has too much rain",
            "The Moon has many trees"
        ],
        answer: 0,
        explanation: "The Moon does not have a breathable atmosphere for humans."
    },
    {
        id: 14,
        level: 3,
        question: "What is a lunar eclipse?",
        options: [
            "The Sun passes behind Mars",
            "The Moon enters Earth's shadow",
            "Earth enters the Sun",
            "The Moon disappears forever"
        ],
        answer: 1,
        explanation: "A lunar eclipse happens when the Moon passes into Earth's shadow."
    },
    {
        id: 15,
        level: 3,
        question: "What is one major goal of lunar exploration?",
        options: [
            "To study the Moon and prepare for future exploration",
            "To stop Earth's rotation",
            "To remove the Sun",
            "To change the Moon into a star"
        ],
        answer: 0,
        explanation: "Lunar missions help scientists study the Moon and develop future exploration capabilities."
    }
];

// Read leaderboard data safely.
function readLeaderboard() {
    try {
        const data = fs.readFileSync(leaderboardFile, "utf8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Return questions without revealing the answers.
app.get("/api/questions", (req, res) => {
    const level = Number(req.query.level || 1);

    if (![1, 2, 3].includes(level)) {
        return res.status(400).json({
            error: "Choose a level from 1 to 3."
        });
    }

    const selectedQuestions = questions
        .filter(question => question.level === level)
        .map(({ id, level, question, options }) => ({
            id,
            level,
            question,
            options
        }));

    res.json(selectedQuestions);
});

// Check one answer.
app.post("/api/answer", (req, res) => {
    const { questionId, answerIndex } = req.body;

    const question = questions.find(
        item => item.id === Number(questionId)
    );

    if (
        !question ||
        !Number.isInteger(answerIndex) ||
        answerIndex < 0 ||
        answerIndex >= question.options.length
    ) {
        return res.status(400).json({
            error: "Invalid question or answer."
        });
    }

    res.json({
        correct: answerIndex === question.answer,
        correctAnswer: question.options[question.answer],
        explanation: question.explanation
    });
});

// Save a score.
app.post("/api/scores", (req, res) => {
    const { name, score, level } = req.body;

    if (
        typeof name !== "string" ||
        name.trim().length === 0 ||
        name.trim().length > 30 ||
        !Number.isInteger(score) ||
        score < 0 ||
        score > 100 ||
        ![1, 2, 3].includes(Number(level))
    ) {
        return res.status(400).json({
            error: "Please provide valid score details."
        });
    }

    const leaderboard = readLeaderboard();

    leaderboard.push({
        name: name.trim(),
        score,
        level: Number(level),
        date: new Date().toISOString()
    });

    leaderboard.sort((a, b) => b.score - a.score);

    // Keep the top 100 entries.
    const topScores = leaderboard.slice(0, 100);

    fs.writeFileSync(
        leaderboardFile,
        JSON.stringify(topScores, null, 2)
    );

    res.json({
        message: "Score saved successfully!",
        score
    });
});

// Return the leaderboard.
app.get("/api/leaderboard", (req, res) => {
    res.json(readLeaderboard());
});

// Serve the home page.
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Moon Quiz is running at http://localhost:${PORT}`);
});