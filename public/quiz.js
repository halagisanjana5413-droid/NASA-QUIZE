document.addEventListener("DOMContentLoaded", () => {
    const questionElement = document.getElementById("question");
    const optionsElement = document.getElementById("options");
    const nextButton = document.getElementById("next-btn");
    const scoreElement = document.getElementById("score");
    const countElement = document.getElementById("question-count");
    const progressBar = document.getElementById("progress-bar");
    const feedbackElement = document.getElementById("feedback");

    if (!questionElement || !optionsElement || !nextButton) return;

    let questions = [];
    let currentQuestion = 0;
    let score = 0;
    let answered = false;

    async function startQuiz() {
        try {
            const response = await fetch("/api/questions");

            if (!response.ok) {
                throw new Error("Questions could not be loaded.");
            }

            questions = await response.json();
            currentQuestion = 0;
            score = 0;

            scoreElement.textContent = "Score: 0";
            nextButton.style.display = "inline-block";

            showQuestion();
        } catch (error) {
            questionElement.textContent =
                "Unable to load questions. Please start the backend server.";
        }
    }

    function showQuestion() {
        answered = false;

        const question = questions[currentQuestion];

        questionElement.textContent = question.question;
        countElement.textContent =
            `Question ${currentQuestion + 1} of ${questions.length}`;

        progressBar.style.width =
            `${(currentQuestion / questions.length) * 100}%`;

        feedbackElement.textContent = "";
        optionsElement.innerHTML = "";

        question.options.forEach((option, index) => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "option";
            button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;

            button.addEventListener("click", () => {
                checkAnswer(button, option, question);
            });

            optionsElement.appendChild(button);
        });

        nextButton.disabled = true;

        nextButton.textContent =
            currentQuestion === questions.length - 1
                ? "Finish Quiz →"
                : "Next Question →";
    }

    function checkAnswer(selectedButton, selectedOption, question) {
        if (answered) return;

        answered = true;

        const correct = selectedOption === question.answer;

        if (correct) {
            score++;
        }

        optionsElement.querySelectorAll("button").forEach((button) => {
            button.disabled = true;

            const answerText = button.textContent.slice(3);

            if (answerText === question.answer) {
                button.classList.add("correct");
            }
        });

        if (!correct) {
            selectedButton.classList.add("wrong");
        }

        scoreElement.textContent = `Score: ${score}`;

        feedbackElement.textContent = correct
            ? "Correct! 🚀 " + question.explanation
            : "Not quite. " + question.explanation;

        feedbackElement.className = correct ? "good" : "wrong-text";

        progressBar.style.width =
            `${((currentQuestion + 1) / questions.length) * 100}%`;

        nextButton.disabled = false;
    }

    nextButton.addEventListener("click", () => {
        if (!answered) return;

        currentQuestion++;

        if (currentQuestion < questions.length) {
            showQuestion();
        } else {
            showResult();
        }
    });

    function showResult() {
        questionElement.textContent = "Mission Complete! 🚀";

        countElement.textContent = "YOUR RESULTS";

        optionsElement.innerHTML = `
            <div>
                <h2>${score} / ${questions.length}</h2>
                <p>Enter your name to save your score.</p>

                <input
                    id="player-name"
                    type="text"
                    maxlength="24"
                    placeholder="Your astronaut name"
                    required
                >

                <button id="save-score" class="button">
                    Save Score
                </button>

                <p id="save-message"></p>

                <a href="leaderboard.html" class="button">
                    View Leaderboard
                </a>

                <button id="restart-btn" class="button">
                    Try Again
                </button>
            </div>
        `;

        feedbackElement.textContent =
            score === questions.length
                ? "Perfect! You are a Moon expert!"
                : score >= 4
                ? "Great work, astronaut!"
                : "Good attempt! Keep learning about space!";

        nextButton.style.display = "none";

        document.getElementById("save-score").addEventListener("click", saveScore);
        document.getElementById("restart-btn").addEventListener("click", startQuiz);
    }

    async function saveScore() {
        const nameInput = document.getElementById("player-name");
        const message = document.getElementById("save-message");

        const name = nameInput.value.trim();

        if (!name) {
            message.textContent = "Please enter your name.";
            return;
        }

        try {
            const response = await fetch("/api/scores", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    score: score,
                    total: questions.length
                })
            });

            if (!response.ok) {
                throw new Error("Could not save score.");
            }

            message.textContent = "Score saved successfully! 🏆";
        } catch (error) {
            message.textContent =
                "Could not save the score. Check that your backend is running.";
        }
    }

    startQuiz();
});