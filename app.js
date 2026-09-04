
const game = document.getElementById("game");

const MAX_ATTEMPTS = 2;

// =====================================================
// GET PHYSICAL QR NUMBER
// =====================================================

function getQRNumber() {
    const params = new URLSearchParams(window.location.search);
    const qr = Number(params.get("qr"));

    return Number.isInteger(qr) ? qr : null;
}

// =====================================================
// LOCAL STORAGE
// =====================================================

function getJSON(key, fallback) {
    try {
        return JSON.parse(
            localStorage.getItem(key) ||
            JSON.stringify(fallback)
        );
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

// =====================================================
// CREATE RANDOM QUESTION ASSIGNMENT
// =====================================================
// All 5 questions are shuffled across the 5 physical QRs.
// No question is repeated.
//
// Example:
// QR1 -> Q3
// QR2 -> Q5
// QR3 -> Q1
// QR4 -> Q4
// QR5 -> Q2
//
// The physical QR codes themselves do not change.

function createQuestionAssignment() {

    let questions = [1, 2, 3, 4, 5];

    // Fisher-Yates shuffle
    for (let i = questions.length - 1; i > 0; i--) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            questions[i],
            questions[j]
        ] = [
            questions[j],
            questions[i]
        ];
    }

    const assignment = {
        1: questions[0],
        2: questions[1],
        3: questions[2],
        4: questions[3],
        5: questions[4]
    };

    setJSON(
        "questionAssignment",
        assignment
    );

    return assignment;
}

// =====================================================
// GET PLAYER ASSIGNMENT
// =====================================================
// The assignment is created only once.
//
// Refreshing the page will NOT reshuffle the questions.

function getQuestionAssignment() {

    let assignment =
        getJSON(
            "questionAssignment",
            null
        );

    if (
        !assignment ||
        !assignment[1] ||
        !assignment[2] ||
        !assignment[3] ||
        !assignment[4] ||
        !assignment[5]
    ) {

        assignment =
            createQuestionAssignment();
    }

    return assignment;
}

// =====================================================
// GET QUESTION ASSIGNED TO PHYSICAL QR
// =====================================================

function getQuestionForQR(qrNumber) {

    const assignment =
        getQuestionAssignment();

    const questionId =
        Number(
            assignment[qrNumber]
        );

    return HUNT_CONFIG.qrs.find(
        qr =>
            qr.id === questionId
    );
}

// =====================================================
// ATTEMPTS
// =====================================================

function getAttempts() {

    return getJSON(
        "qrAttempts",
        {}
    );
}

function getAttemptsUsed(qrNumber) {

    const attempts =
        getAttempts();

    return attempts[qrNumber] || 0;
}

function addAttempt(qrNumber) {

    const attempts =
        getAttempts();

    attempts[qrNumber] =
        (attempts[qrNumber] || 0) + 1;

    setJSON(
        "qrAttempts",
        attempts
    );

    return attempts[qrNumber];
}

// =====================================================
// COMPLETED QR CODES
// =====================================================

function getCompletedQRs() {

    return getJSON(
        "completedQRs",
        []
    );
}

function isCompleted(qrNumber) {

    return getCompletedQRs()
        .includes(qrNumber);
}

function completeQR(qrNumber) {

    const completed =
        getCompletedQRs();

    if (
        !completed.includes(qrNumber)
    ) {

        completed.push(qrNumber);

        setJSON(
            "completedQRs",
            completed
        );
    }
}

// =====================================================
// LOCKED QUESTIONS
// =====================================================

function getLockedQuestions() {

    return getJSON(
        "lockedQuestions",
        []
    );
}

function isQuestionLocked(qrNumber) {

    return getLockedQuestions()
        .includes(qrNumber);
}

function lockQuestion(qrNumber) {

    const locked =
        getLockedQuestions();

    if (
        !locked.includes(qrNumber)
    ) {

        locked.push(qrNumber);

        setJSON(
            "lockedQuestions",
            locked
        );
    }
}

// =====================================================
// HOME
// =====================================================

function showHome() {

    game.innerHTML = `

        <div class="icon">
            🔎
        </div>

        <h1>
            ${HUNT_CONFIG.title}
        </h1>

        <p>
            Scan a QR code to start.
        </p>

        <p class="small">
            You have only
            ${MAX_ATTEMPTS}
            attempts for each question.
        </p>

    `;
}

// =====================================================
// LOCKED QR
// =====================================================

function showLocked(qrNumber) {

    game.innerHTML = `

        <div class="icon">
            🔒
        </div>

        <h1>
            QR ${qrNumber} Locked
        </h1>

        <p>
            You have used both attempts.
        </p>

        <p>
            You cannot continue from this QR.
        </p>

    `;
}

// =====================================================
// SHOW QUESTION
// =====================================================

function showQuestion(qrNumber) {

    const question =
        getQuestionForQR(
            qrNumber
        );

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

    const used =
        getAttemptsUsed(
            qrNumber
        );

    const remaining =
        Math.max(
            0,
            MAX_ATTEMPTS - used
        );

    game.innerHTML = `

        <div class="badge">
            QR ${qrNumber}
        </div>

        <h1 class="question">
            ${question.question}
        </h1>

        <div class="attempts">

            ❤️ Attempts remaining:

            <strong>
                ${remaining}
            </strong>

        </div>

        <!-- =================================================
             VISIBLE CHOICE SECTION
             ================================================= -->

        <div class="choices">

            ${question.choices.map(
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
                        ${
                            used >= MAX_ATTEMPTS
                                ? "disabled"
                                : ""
                        }
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
}

// =====================================================
// CHECK ANSWER
// =====================================================

function checkAnswer(
    physicalQR,
    selectedAnswer
) {

    const question =
        getQuestionForQR(
            physicalQR
        );

    if (!question) return;

    if (
        isQuestionLocked(
            physicalQR
        )
    ) {

        showLocked(
            physicalQR
        );

        return;
    }

    // Do not allow a completed QR
    // to be answered again.

    if (
        isCompleted(
            physicalQR
        )
    ) {

        return;
    }

    const attemptsUsed =
        addAttempt(
            physicalQR
        );

    const message =
        document.getElementById(
            "message"
        );

    // =====================================================
    // CORRECT ANSWER
    // =====================================================

    if (
        selectedAnswer ===
        question.answer
    ) {

        completeQR(
            physicalQR
        );

        // =================================================
        // CLUE LOGIC
        // =================================================
        //
        // QR1-QR4:
        // Show the clue belonging to the
        // randomized question.
        //
        // QR5:
        // ALWAYS show HUNT_CONFIG.finalClue.
        //
        // Therefore, even if a different question
        // is assigned to QR5, the final clue stays fixed.

        let clue;

        if (
            physicalQR === 5
        ) {

            clue =
                HUNT_CONFIG.finalClue;

        } else {

            clue =
                question.clue;
        }

        message.className =
            "success";

        message.innerHTML = `

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
                    question.clueImage
                        ? `
                            <img
                                src="${question.clueImage}"
                                alt="Clue"
                            >
                        `
                        : ""
                }

                ${
                    physicalQR === 5
                        ? `
                            <h2>
                                🎉 Hunt Completed!
                            </h2>
                        `
                        : `
                            <div class="next-route">

                                <strong>
                                    Continue to the next QR.
                                </strong>

                                <p>
                                    Follow the clue above
                                    to find your next QR.
                                </p>

                            </div>
                        `
                }

            </div>

        `;

        disableChoices();

        return;
    }

    // =====================================================
    // WRONG ANSWER
    // =====================================================

    const remaining =
        MAX_ATTEMPTS -
        attemptsUsed;

    if (
        attemptsUsed >=
        MAX_ATTEMPTS
    ) {

        lockQuestion(
            physicalQR
        );

        message.className =
            "wrong";

        message.innerHTML = `

            ❌ <strong>
                Wrong answer!
            </strong>

            <br><br>

            You have used both attempts.

            <br>

            🔒 This question is now locked.

        `;

        disableChoices();

        return;
    }

    message.className =
        "wrong";

    message.innerHTML = `

        ❌ <strong>
            Wrong answer!
        </strong>

        <br><br>

        You have
        <strong>
            ${remaining}
        </strong>
        attempt remaining.

    `;
}

// =====================================================
// DISABLE ANSWER BUTTONS
// =====================================================

function disableChoices() {

    document
        .querySelectorAll(".choice")
        .forEach(button => {

            button.disabled = true;

        });
}

// =====================================================
// START GAME
// =====================================================

function startGame() {

    const qrNumber =
        getQRNumber();

    if (
        qrNumber === null
    ) {

        showHome();

        return;
    }

    // Only QR1-Q5 are valid.

    if (
        qrNumber < 1 ||
        qrNumber > 5
    ) {

        game.innerHTML = `

            <div class="icon">
                ❌
            </div>

            <h1>
                QR Not Found
            </h1>

            <p>
                This QR code does not exist.
            </p>

        `;

        return;
    }

    // Create the random assignment
    // if the player doesn't have one.

    getQuestionAssignment();

    if (
        isQuestionLocked(
            qrNumber
        )
    ) {

        showLocked(
            qrNumber
        );

        return;
    }

    showQuestion(
        qrNumber
    );
}

// =====================================================
// RUN GAME
// =====================================================

startGame();
