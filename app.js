const game = document.getElementById("game");

const MAX_ATTEMPTS = 2;

const STORAGE_KEYS = {
    attempts: "signalHunt_attempts",
    completed: "signalHunt_completed",
    disqualified: "signalHunt_disqualified"
};

function getQRNumber() {
    const params = new URLSearchParams(window.location.search);

    const qrValue =
        params.get("qr") ||
        params.get("id") ||
        params.get("QR");

    const qr = Number(qrValue);

    return Number.isInteger(qr) && qr >= 1 && qr <= 5
        ? qr
        : null;
}

function getJSON(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value === null
            ? fallback
            : JSON.parse(value);
    } catch {
        return fallback;
    }
}

function setJSON(key, value) {
    localStorage.setItem(
        key,
        JSON.stringify(value)
    );
}

function getAttempts() {
    return getJSON(
        STORAGE_KEYS.attempts,
        {}
    );
}

function getAttemptsUsed(qrNumber) {
    const attempts = getAttempts();

    return Number(
        attempts[qrNumber] || 0
    );
}

function recordAttempt(qrNumber) {
    const attempts = getAttempts();

    attempts[qrNumber] =
        getAttemptsUsed(qrNumber) + 1;

    setJSON(
        STORAGE_KEYS.attempts,
        attempts
    );

    return attempts[qrNumber];
}

function getCompleted() {
    return getJSON(
        STORAGE_KEYS.completed,
        []
    );
}

function isCompleted(qrNumber) {
    return getCompleted().includes(
        qrNumber
    );
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
    return getDisqualified().includes(
        qrNumber
    );
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
    const shuffled =
        seededShuffle(
            [1, 2, 3, 4],
            260907
        );

    return {
        1: shuffled[0],
        2: shuffled[1],
        3: shuffled[2],
        4: shuffled[3],
        5: 5
    };
}

function getClueAssignment() {
    const shuffled =
        seededShuffle(
            [1, 2, 3, 4],
            261122
        );

    return {
        1: shuffled[0],
        2: shuffled[1],
        3: shuffled[2],
        4: shuffled[3],
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

    const clue =
        HUNT_CONFIG.qrs.find(
            item =>
                Number(item.id) ===
                Number(clueID)
        );

    return clue
        ? clue.clue
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

    const clue =
        HUNT_CONFIG.qrs.find(
            item =>
                Number(item.id) ===
                Number(clueID)
        );

    return clue &&
        clue.clueImage
        ? clue.clueImage
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

function showInvalidQR() {
    game.innerHTML = `
        <div class="icon">❌</div>

        <h1>
            Invalid QR Code
        </h1>

        <p>
            Please scan a valid QR code.
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
            You answered the question incorrectly twice.
        </p>

        <p>
            The clue is not available.
        </p>
    `;
}

function showQuestion(qrNumber) {
    const question =
        getQuestionForQR(qrNumber);

    if (
        !question ||
        !Array.isArray(question.choices) ||
        question.choices.length === 0
    ) {
        game.innerHTML = `
            <div class="icon">❌</div>

            <h1>
                Question Not Found
            </h1>
        `;

        return;
    }

    const attemptsUsed =
        getAttemptsUsed(qrNumber);

    const attemptsLeft =
        Math.max(
            0,
            MAX_ATTEMPTS - attemptsUsed
        );

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

        <div
            class="choices"
            id="choices"
        >
            ${question.choices.map(
                (choice, index) => `
                    <button
                        type="button"
                        class="choice"
                        data-answer="${index}"
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
            ).join("")}
        </div>

        <div id="message"></div>
    `;

    document
        .querySelectorAll(".choice")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    const answer =
                        Number(
                            this.dataset.answer
                        );

                    checkAnswer(
                        qrNumber,
                        answer
                    );
                }
            );

        });
}

function showFirstWrong(qrNumber) {
    const message =
        document.getElementById(
            "message"
        );

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
                            alt="Clue"
                        >
                    `
                    : ""
                }

            </div>

        </div>
    `;
}

function showCompleted(qrNumber) {
    showCorrectAnswer(qrNumber);
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

    const attempt =
        recordAttempt(qrNumber);

    if (
        Number(selectedAnswer) ===
        Number(question.answer)
    ) {
        markCompleted(qrNumber);

        showCorrectAnswer(qrNumber);

        return;
    }

    if (attempt === 1) {
        showFirstWrong(qrNumber);
        return;
    }

    disqualify(qrNumber);

    showDisqualified();
}

function startGame() {
    if (!game) {
        return;
    }

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
        showInvalidQR();
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

if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        startGame
    );
} else {
    startGame();
}
