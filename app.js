const game = document.getElementById("game");

const MAX_ATTEMPTS = 2;

// =====================================
// GET QR NUMBER
// =====================================

function getQRNumber() {
    const params = new URLSearchParams(window.location.search);
    const qr = Number(params.get("qr"));
    return Number.isInteger(qr) ? qr : null;
}

// =====================================
// PLAYER STORAGE
// =====================================
// localStorage belongs to the individual browser/device.
// The QR codes themselves do NOT change.
// Each player gets their own randomized route.

function getJSON(key, fallback) {
    try {
        return JSON.parse(
            localStorage.getItem(key) || JSON.stringify(fallback)
        );
    } catch {
        return fallback;
    }
}

function setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// =====================================
// COMPLETED QR STORAGE
// =====================================

function getCompletedQRs() {
    return getJSON("completedQRs", []);
}

function saveCompletedQRs(list) {
    setJSON("completedQRs", list);
}

function isCompleted(qrNumber) {
    return getCompletedQRs().includes(qrNumber);
}

function completeQR(qrNumber) {
    const completed = getCompletedQRs();

    if (!completed.includes(qrNumber)) {
        completed.push(qrNumber);
        saveCompletedQRs(completed);
    }
}

// =====================================
// ATTEMPT STORAGE
// =====================================

function getAttempts() {
    return getJSON("qrAttempts", {});
}

function saveAttempts(attempts) {
    setJSON("qrAttempts", attempts);
}

function getAttemptsUsed(qrNumber) {
    return getAttempts()[qrNumber] || 0;
}

function addAttempt(qrNumber) {
    const attempts = getAttempts();

    attempts[qrNumber] = (attempts[qrNumber] || 0) + 1;

    saveAttempts(attempts);

    return attempts[qrNumber];
}

// =====================================
// LOCKED QUESTIONS
// =====================================

function getLockedQuestions() {
    return getJSON("lockedQuestions", []);
}

function lockQuestion(qrNumber) {
    const locked = getLockedQuestions();

    if (!locked.includes(qrNumber)) {
        locked.push(qrNumber);
        setJSON("lockedQuestions", locked);
    }
}

function isQuestionLocked(qrNumber) {
    return getLockedQuestions().includes(qrNumber);
}

// =====================================
// RANDOM PLAYER ROUTE
// =====================================
// QR1, QR2, QR3 and QR4 can connect to each other.
// QR5 is ALWAYS the final QR.
//
// Example player A:
// 1 -> 3 -> 2 -> 4 -> 5
//
// Example player B:
// 1 -> 4 -> 2 -> 3 -> 5
//
// The physical QR images/URLs never change.

function getPlayerRoute() {
    return getJSON("playerRoute", null);
}

function createRandomRoute() {
    // Keep QR1 as the fixed starting QR.
    // Randomize only QR2, QR3 and QR4.
    const middle = [2, 3, 4];

    // Fisher-Yates shuffle.
    for (let i = middle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [middle[i], middle[j]] = [middle[j], middle[i]];
    }

    // QR5 is always last.
    const route = [1, ...middle, 5];

    setJSON("playerRoute", route);

    return route;
}

function ensurePlayerRoute() {
    let route = getPlayerRoute();

    // Create the route only once for this browser/device.
    // Refreshing the page will not change the player's route.
    if (!Array.isArray(route) || route.length !== 5) {
        route = createRandomRoute();
    }

    return route;
}

function getNextQR(currentQR) {
    const route = ensurePlayerRoute();
    const index = route.indexOf(currentQR);

    if (index === -1 || index >= route.length - 1) {
        return null;
    }

    return HUNT_CONFIG.qrs.find(
        qr => qr.id === route[index + 1]
    ) || null;
}

function canAccessQR(qrNumber) {
    const route = ensurePlayerRoute();
    const index = route.indexOf(qrNumber);

    if (index === -1) {
        return false;
    }

    // QR1 is always available as the starting QR.
    if (qrNumber === 1) {
        return true;
    }

    // Every other QR requires the previous QR in this player's
    // randomized route to have been completed.
    const previousQR = route[index - 1];

    return isCompleted(previousQR);
}

// =====================================
// HOME
// =====================================

function showHome() {
    game.innerHTML = `
        <div class="icon">🔎</div>

        <h1>${HUNT_CONFIG.title}</h1>

        <p>
            Scan a QR code to start.
        </p>

        <p class="small">
            You have only ${MAX_ATTEMPTS} attempts for each question.
        </p>
    `;
}

// =====================================
// LOCKED QR
// =====================================

function showLocked(qrNumber) {
    game.innerHTML = `
        <div class="icon">🔒</div>

        <h1>
            QR ${qrNumber} Locked
        </h1>

        <p>
            You have used both attempts.
        </p>

        <p>
            You cannot continue from this question.
        </p>
    `;
}

// =====================================
// WRONG QR / NOT NEXT
// =====================================

function showWrongQR(qrNumber) {
    const route = ensurePlayerRoute();
    const index = route.indexOf(qrNumber);

    let expected = null;

    if (index > 0) {
        const previous = route[index - 1];

        if (!isCompleted(previous)) {
            expected = previous;
        }
    }

    game.innerHTML = `
        <div class="icon">🧭</div>

        <h1>
            QR ${qrNumber} is not your next QR
        </h1>

        ${
            expected
            ? `
                <p>
                    Complete QR ${expected} first.
                </p>
            `
            : `
                <p>
                    Follow the clue from your previous question.
                </p>
            `
        }
    `;
}

// =====================================
// QUESTION
// =====================================

function showQuestion(qr) {
    const used = getAttemptsUsed(qr.id);
    const remaining = MAX_ATTEMPTS - used;

    game.innerHTML = `
        <div class="badge">
            QR ${qr.id}
        </div>

        <h1 class="question">
            ${qr.question}
        </h1>

        <div class="attempts">
            ❤️ Attempts remaining:
            <strong>${remaining}</strong>
        </div>

        <div class="choices">
            ${qr.choices.map(
                (choice, index) => `
                    <button
                        class="choice"
                        onclick="checkAnswer(${qr.id}, ${index})"
                        ${used >= MAX_ATTEMPTS ? "disabled" : ""}
                    >
                        <span class="letter">
                            ${String.fromCharCode(65 + index)}
                        </span>

                        ${choice}
                    </button>
                `
            ).join("")}
        </div>

        <div id="message"></div>
    `;
}

// =====================================
// CHECK ANSWER
// =====================================

function checkAnswer(qrNumber, selectedAnswer) {
    const qr = HUNT_CONFIG.qrs.find(
        item => item.id === qrNumber
    );

    if (!qr) return;

    if (isQuestionLocked(qrNumber)) {
        showLocked(qrNumber);
        return;
    }

    if (isCompleted(qrNumber)) {
        showQuestion(qr);
        return;
    }

    const attemptsUsed = addAttempt(qrNumber);
    const message = document.getElementById("message");

    // =================================
    // CORRECT ANSWER
    // =================================

    if (selectedAnswer === qr.answer) {
        completeQR(qrNumber);

        const nextQR = getNextQR(qrNumber);

        message.className = "success";

        message.innerHTML = `
            <div class="correct">
                ✅ Correct Answer!
            </div>

            <div class="clue">
                <h2>💡 Clue</h2>

                <p>
                    ${qr.clue}
                </p>

                ${
                    qr.clueImage
                    ? `
                        <img
                            src="${qr.clueImage}"
                            alt="Clue"
                        >
                    `
                    : ""
                }

                ${
                    nextQR
                    ? `
                        <div class="next-route">
                            <strong>
                                Your next QR is QR ${nextQR.id}.
                            </strong>

                            <p>
                                Follow the clue to find it.
                            </p>
                        </div>
                    `
                    : `
                        <h2>
                            🎉 Hunt Completed!
                        </h2>
                    `
                }
            </div>
        `;

        disableChoices();

        return;
    }

    // =================================
    // WRONG ANSWER
    // =================================

    const remaining = MAX_ATTEMPTS - attemptsUsed;

    if (attemptsUsed >= MAX_ATTEMPTS) {
        lockQuestion(qrNumber);

        message.className = "wrong";

        message.innerHTML = `
            ❌ <strong>Wrong answer!</strong>

            <br><br>

            You have used both attempts.

            <br>

            🔒 This question is now locked.
        `;

        disableChoices();

        return;
    }

    message.className = "wrong";

    message.innerHTML = `
        ❌ <strong>Wrong answer!</strong>

        <br><br>

        You have
        <strong>${remaining}</strong>
        attempt remaining.
    `;
}

// =====================================
// DISABLE CHOICES
// =====================================

function disableChoices() {
    document
        .querySelectorAll(".choice")
        .forEach(button => {
            button.disabled = true;
        });
}

// =====================================
// START GAME
// =====================================

function startGame() {
    const qrNumber = getQRNumber();

    if (qrNumber === null) {
        showHome();
        return;
    }

    const qr = HUNT_CONFIG.qrs.find(
        item => item.id === qrNumber
    );

    if (!qr) {
        game.innerHTML = `
            <div class="icon">❌</div>

            <h1>
                QR Not Found
            </h1>

            <p>
                This QR code does not exist.
            </p>
        `;

        return;
    }

    // Create the player's route when they first use the app.
    ensurePlayerRoute();

    // Only QR1 starts the hunt.
    // QR2-QR5 must be reached through that player's route.
    if (!canAccessQR(qrNumber)) {
        showWrongQR(qrNumber);
        return;
    }

    if (isQuestionLocked(qrNumber)) {
        showLocked(qrNumber);
        return;
    }

    showQuestion(qr);
}

startGame();
