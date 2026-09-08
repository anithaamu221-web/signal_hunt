const game = document.getElementById("game");

const MAX_ATTEMPTS = 2;

const STORAGE_KEYS = {
    attempts: "signalHunt_attempts",
    completed: "signalHunt_completed",
    disqualified: "signalHunt_disqualified"
};

function getQRNumber() {
    const params = new URLSearchParams(window.location.search);
    const qr = Number(params.get("qr"));

    return Number.isInteger(qr) ? qr : null;
}

function getJSON(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
}

function setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getAttempts() {
    return getJSON(STORAGE_KEYS.attempts, {});
}

function getAttemptsUsed(qrNumber) {
    const attempts = getAttempts();
    return Number(attempts[qrNumber] || 0);
}

function recordAttempt(qrNumber) {
    const attempts = getAttempts();

    attempts[qrNumber] =
        getAttemptsUsed(qrNumber) + 1;

    setJSON(STORAGE_KEYS.attempts, attempts);

    return attempts[qrNumber];
}

function getCompleted() {
    return getJSON(STORAGE_KEYS.completed, []);
}

function isCompleted(qrNumber) {
    return getCompleted().includes(qrNumber);
}

function markCompleted(qrNumber) {
    const completed = getCompleted();

    if (!completed.includes(qrNumber)) {
        completed.push(qrNumber);

        setJSON(
            STORAGE_KEYS.completed,
            completed
        );
    }
}

function getDisqualified() {
    return getJSON(
        STORAGE_KEYS.disqualified,
        []
    );
}

function isDisqualified(qrNumber) {
    return getDisqualified().includes(qrNumber);
}

function disqualify(qrNumber) {
    const disqualified =
        getDisqualified();

    if (!disqualified.includes(qrNumber)) {
        disqualified.push(qrNumber);

        setJSON(
            STORAGE_KEYS.disqualified,
            disqualified
        );
    }
}

function seededShuffle(array, seed) {
    const result = [...array];

    let value = seed;

    function random() {
        value =
            (value * 9301 + 49297) % 233280;

        return value / 233280;
    }

    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {
        const j =
            Math.floor(
                random() * (i + 1)
            );

        [
            result[i],
            result[j]
        ] = [
            result[j],
            result[i]
        ];
    }

    return result;
}

function getQuestionAssignment() {
    const FIXED_QUESTION_SEED = 260907;

    const shuffledQuestions =
        seededShuffle(
            [1, 2, 3, 4],
            FIXED_QUESTION_SEED
        );

    return {
        1: shuffledQuestions[0],
        2: shuffledQuestions[1],
        3: shuffledQuestions[2],
        4: shuffledQuestions[3],
        5: 5
    };
}

function getClueAssignment() {
    const FIXED_CLUE_SEED = 261122;

    const shuffledClues =
        seededShuffle(
            [1, 2, 3, 4],
            FIXED_CLUE_SEED
        );

    return {
        1: shuffledClues[0],
        2: shuffledClues[1],
        3: shuffledClues[2],
        4: shuffledClues[3],
        5: 5
    };
}

function getQuestionForQR(qrNumber) {
    const assignment =
        getQuestionAssignment();

    const questionID =
        assignment[qrNumber];

    return HUNT_CONFIG.qrs.find(
        item =>
            Number(item.id) ===
            Number(questionID)
    );
}

function getClueForQR(qrNumber) {
    if (qrNumber === 5) {
        return HUNT_CONFIG.finalClue;
    }

    const assignment =
        getClueAssignment();

    const clueID =
        assignment[qrNumber];

    const clueQR =
        HUNT_CONFIG.qrs.find(
            item =>
                Number(item.id) ===
                Number(clueID)
        );

    return clueQR
        ? clueQR.clue
        : "";
}

function getClueImageForQR(qrNumber) {
    if (qrNumber === 5) {
        return "";
    }

    const assignment =
        getClueAssignment();

    const clueID =
        assignment[qrNumber];

    const clueQR =
        HUNT_CONFIG.qrs.find(
            item =>
                Number(item.id) ===
                Number(clueID)
        );

    return clueQR &&
        clueQR.clueImage
        ? clueQR.clueImage
        : "";
}

function showHome() {
    game.innerHTML = `
        <div class="icon">🔎</div>

        <h1>
            ${HUNT_CONFIG.title}
        </h1>

        <p>
            Scan a QR code to begin.
        </p>

        <p class="small">
            You have 2 chances for each question.
        </p>
    `;
}

function showDisqualified() {
    game.innerHTML = `
        <div class="icon">🚫</div>

        <h1>
            DISQUALIFIED
        </h1>

        <p>
            You answered the question incorrectly
            twice.
        </p>

        <p>
            No clue is available.
        </p>
    `;
}

function showCompleted(qrNumber) {
    const clue =
        getClueForQR(qrNumber);

    const image =
        getClueImageForQR(qrNumber);

    game.innerHTML = `
        <div class="badge">
            QR ${qrNumber}
        </div>

        <div class="success">
            <div class="correct">
                ✅ Correct Answer!
            </div>

            <div class="clue">
                <h2>
                    💡 Clue
                </h2>

                <p>
                    ${clue}
                </p>

                ${
                    image
                    ? `
                        <img
                            src="${image}"
                            alt="Clue image"
                        >
                    `
                    : ""
                }
            </div>
        </div>
    `;
}

function showQuestion(qrNumber) {
    const question =
        getQuestionForQR(qrNumber);

    if (!question) {
        game.innerHTML = `
            <div class="icon">
                ❌
            </div>

            <h1>
                Question Not Found
            </h1>
        `;

        return;
    }

    const attemptsUsed =
        getAttemptsUsed(qrNumber);

    const attemptsLeft =
        MAX_ATTEMPTS -
        attemptsUsed;

    game.innerHTML = `
        <div class="badge">
            QR ${qrNumber}
        </div>

        <h1 class="question">
            ${question.question}
        </h1>

        <div class="attempts">
            ❤️ Chances remaining:
            <strong>
                ${attemptsLeft}
            </strong>
        </div>

        <div class="choices">
            ${question.choices
                .map(
                    (choice, index) => `
                        <button
                            type="button"
                            class="choice"
                            onclick="
                                checkAnswer(
                                    ${qrNumber},
                                    ${index}
                                )
                            "
                        >
                            <span class="letter">
                                ${String.fromCharCode(
                                    65 + index
                                )}
                            </span>

                            <span class="choice-text">
                                ${choice}
                            </span>
                        </button>
                    `
                )
                .join("")}
        </div>

        <div id="message"></div>
    `;
}

function checkAnswer(
    qrNumber,
    selectedAnswer
) {
    if (isDisqualified(qrNumber)) {
        showDisqualified();
        return;
    }

    if (isCompleted(qrNumber)) {
        showCompleted(qrNumber);
        return;
    }

    const question =
        getQuestionForQR(qrNumber);

    if (!question) {
        return;
    }

    const attemptNumber =
        recordAttempt(qrNumber);

    if (
        Number(selectedAnswer) ===
        Number(question.answer)
    ) {
        markCompleted(qrNumber);
        showCorrectAnswer(qrNumber);
        return;
    }

    if (
        attemptNumber < MAX_ATTEMPTS
    ) {
        showFirstWrong(qrNumber);
        return;
    }

    disqualify(qrNumber);
    showDisqualified();
}

function showFirstWrong(qrNumber) {
    const message =
        document.getElementById("message");

    if (!message) {
        return;
    }

    message.className = "wrong";

    message.innerHTML = `
        ❌ Wrong answer.

        <br><br>

        You have
        <strong>
            1
        </strong>
        chance remaining.

        <br><br>

        ⚠️ The clue is not shown.
    `;
}

function showCorrectAnswer(qrNumber) {
    const clue =
        getClueForQR(qrNumber);

    const image =
        getClueImageForQR(qrNumber);

    game.innerHTML = `
        <div class="badge">
            QR ${qrNumber}
        </div>

        <div class="success">
            <div class="correct">
                ✅ Correct Answer!
            </div>

            <div class="clue">
                <h2>
                    💡 Your Clue
                </h2>

                <p>
                    ${clue}
                </p>

                ${
                    image
                    ? `
                        <img
                            src="${image}"
                            alt="Clue image"
                        >
                    `
                    : ""
                }
            </div>
        </div>
    `;
}

function startGame() {
    const qrNumber =
        getQRNumber();

    if (qrNumber === null) {
        showHome();
        return;
    }

    if (
        qrNumber < 1 ||
        qrNumber > 5
    ) {
        game.innerHTML = `
            <div class="icon">
                ❌
            </div>

            <h1>
                Invalid QR
            </h1>
        `;

        return;
    }

    if (isDisqualified(qrNumber)) {
        showDisqualified();
        return;
    }

    if (isCompleted(qrNumber)) {
        showCompleted(qrNumber);
        return;
    }

    showQuestion(qrNumber);
}

startGame();
