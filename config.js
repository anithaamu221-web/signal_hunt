const HUNT_CONFIG = {

    title: "Coding QR Treasure Hunt",

    qrs: [

        // =========================
        // QR 1
        // =========================
        {
            id: 1,

            question: `What is the output?

x = 3
y = 2

for i in range(2):
    x = x + y
    y = y + 1

print(x)`,

            choices: [
                "7",
                "8",
                "9",
                "10"
            ],

            answer: 2,

            clue: "💡 Clue 1: Follow the clue to find your next QR.",

            clueImage: ""
        },


        // =========================
        // QR 2
        // =========================
        {
            id: 2,

            question: `🐞 DEBUGGING CHALLENGE

The following program should print the numbers 1, 2, 3, 4, 5.

for i in range(1, 5):
    print(i)

What should be changed?`,

            choices: [
                "range(0, 5)",
                "range(1, 6)",
                "range(1, 4)",
                "print(i + 1)"
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

            question: `🔍 FIND THE MISSING STATEMENT

Complete the code so that it prints:

Even

number = 12

if __________________:
    print("Even")
else:
    print("Odd")`,

            choices: [
                "number / 2 == 0",
                "number % 2 == 0",
                "number % 2 == 1",
                "number / 2 == 1"
            ],

            answer: 1,

            clue: "💡 Clue 3: You found the missing statement! Follow the clue to your next QR.",

            clueImage: ""
        },


        // =========================
        // QR 4
        // =========================
        {
            id: 4,

            question: `What is the output?

a = 10
b = 3
print(a % b)`,

            choices: [
                "1",
                "3",
                "0",
                "10"
            ],

            answer: 0,

            clue: "💡 Clue 4: Excellent! Follow the clue to your next QR.",

            clueImage: ""
        },


        // =========================
        // QR 5
        // =========================
        {
            id: 5,

            question: `Which function is used to display something on the screen in Python?`,

            choices: [
                "show()",
                "display()",
                "print()",
                "output()"
            ],

            answer: 2,

            clue: `🎉 Congratulations!

You have successfully completed all 5 coding questions!

Go to the final treasure location given by the organizer.`,

            clueImage: ""
        }

    ]

};
