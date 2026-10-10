async function loadLeaderboard() {
    const list = document.getElementById("leaderboard-list");

    try {
        const response = await fetch("/api/leaderboard");

        if (!response.ok) {
            throw new Error("Unable to load the leaderboard.");
        }

        const scores = await response.json();

        list.innerHTML = "";

        if (scores.length === 0) {
            list.innerHTML = `
                <p class="empty-message">
                    No scores yet. Complete a mission to become the first astronaut on the leaderboard!
                </p>
            `;

            return;
        }

        scores.forEach((entry, index) => {
            const row = document.createElement("div");

            row.className = "leaderboard-row";

            const rank = document.createElement("span");
            const name = document.createElement("span");
            const level = document.createElement("span");
            const score = document.createElement("span");

            if (index === 0) {
                rank.textContent = "🥇 1";
            } else if (index === 1) {
                rank.textContent = "🥈 2";
            } else if (index === 2) {
                rank.textContent = "🥉 3";
            } else {
                rank.textContent = `#${index + 1}`;
            }

            name.textContent = entry.name;
            level.textContent = `Level ${entry.level}`;
            score.textContent = `${entry.score} pts`;

            row.append(rank, name, level, score);

            list.appendChild(row);
        });
    } catch (error) {
        list.innerHTML = "";

        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent = error.message;

        list.appendChild(message);
    }
}

loadLeaderboard();