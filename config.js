const HUNT_CONFIG = {

title: "Signal Hunt",

// =====================================================
// QR 5 FINAL CLUE
// =====================================================
// THIS CLUE NEVER CHANGES.

finalClue: `The admin Name: Madesh F17


The Password: 19112657`,


qrs: [

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

        clue: `I make dirty water clean and safe.


You can find me at many venues.
What am I?`,


        clueImage: ""
    },

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

        clue: `I go up and fill with air.


You see me at parties and celebrations.
What am I?`,


        clueImage: ""
    },

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

        clue: `🔧 Where machines come for repair,


🧪 where experiments take place, and
🚗 where vehicles are fixed — look around the greenery nearby. 🌱`,


        clueImage: ""
    },

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

        clue: `Go and find the coordinator.


And tell him the code "NexOra'26".`,


        clueImage: ""
    },

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

        // This is kept unchanged.
        // app.js uses finalClue for QR5.

        clue: `The admin Name: Madesh F17


The Password: 19112657`,


        clueImage: ""
    }

]


};
