const HUNT_CONFIG = {

    title: "Coding QR Treasure Hunt",

    qrs: [

        // =========================
        // QR 1
        // =========================
        // QR1 is always the starting QR.
        // Its physical QR code never changes.

        {
            id: 1,

            question: `What is the output?

total = 0

for i in range(1, 6):
    if i % 2 == 0:
        total += i
    else:
        total -= i

print(total)`,

            choices: [
                "-3",
                "3",
                "5",
                "-5"
            ],

            answer: 0,

            clue: "💡 Clue 1: Follow the clue to find your next QR.",

            clueImage: ""
        },


        // =========================
        // QR 2
        // =========================
        // QR2 can be connected from QR1, QR3 or QR4
        // depending on the player's randomized route.

        {
            id: 2,

            question: `What is the output?

numbers = [3, 6, 9, 12]
result = 0

for n in numbers:
    if n % 3 == 0 and n > 6:
        result += n

print(result)`,

            choices: [
                "9",
                "21",
                "27",
                "30"
            ],

            answer: 1,

            clue: "💡 Clue 2: Follow the clue to find your next QR.",

            clueImage: ""
        },


        // =========================
        // QR 3
        // =========================

        {
            id: 3,

            question: `🐞 FIND THE BUG

The following code is intended to print the numbers 1 to 5, but it doesn't work correctly.

for i in range(1, 5):
    print(i)

What should be changed?`,

            choices: [
                "Change range(1, 5) to range(1, 6)",
                "Change i to i + 1",
                "Change print(i) to print(i + 1)",
                "No change is required"
            ],

            answer: 0,

            clue: "💡 Clue 3: You found the bug! Follow the clue to your next QR.",

            clueImage: ""
        },


        // =========================
        // QR 4
        // =========================

        {
            id: 4,

            question: `🐞 FIND THE BUG

The code should print "Even" when the number is even.

num = 8

if num % 2 = 0:
    print("Even")
else:
    print("Odd")

What is the error?`,

            choices: [
                "% should be /",
                "= should be ==",
                "num should be number",
                "if should be for"
            ],

            answer: 1,

            clue: "💡 Clue 4: Excellent! Follow the clue to your next QR.",

            clueImage: ""
        },


        // =========================
        // QR 5
        // =========================
        // QR5 is ALWAYS the final QR.
        // Its question and answer remain unchanged.

        {
            id: 5,

            question: `🔍 FIND THE CORRECT CONDITION

You want to print "Eligible" if a person's age is 18 or above AND below 60.

Which condition is correct?`,

            choices: [
                "if age > 18 and age < 60:",
                "if age >= 18 and age < 60:",
                "if age >= 18 or age < 60:",
                "if age > 18 or age >= 60:"
            ],

            answer: 1,

            clue: `🎉 Congratulations!

You have successfully completed all 5 coding questions!

Go to the final treasure location given by the organizer.`,

            clueImage: ""
        }

    ]

};
