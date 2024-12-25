const questions = [
    {
        question: "The sky is blue.",
        correctAnswer: true
    },
    {
        question: "The capital of France is Berlin.",
        correctAnswer: false
    },
    {
        question: "JavaScript is the same as Java.",
        correctAnswer: false
    },
    {
        question: "2 + 2 equals 4.",
        correctAnswer: true
    },
    {
        question: "The Earth is flat.",
        correctAnswer: false
    }
];

function generateQuiz() {
    const quizContainer = document.getElementById('quiz');
    const output = [];

    questions.forEach((currentQuestion, questionNumber) => {
        output.push(
            `<div class="question">
                <p>${currentQuestion.question}</p>
                <label>
                    <input type="radio" name="question${questionNumber}" value="true">
                    True
                </label>
                <label>
                    <input type="radio" name="question${questionNumber}" value="false">
                    False
                </label>
            </div>`
        );
    });

    quizContainer.innerHTML = output.join('');
}

function showResults() {
    const answerContainers = document.querySelectorAll('.question');
    let score = 0;

    questions.forEach((currentQuestion, questionNumber) => {
        const answerContainer = answerContainers[questionNumber];
        const selector = `input[name=question${questionNumber}]:checked`;
        const userAnswer = (answerContainer.querySelector(selector) || {}).value;
        if (userAnswer === String(currentQuestion.correctAnswer)) {
            score++;
            answerContainer.style.color = 'green';
        } else {
            answerContainer.style.color = 'red';
        }
    });

    document.getElementById('results').innerText = `You scored ${score} out of ${questions.length}`;
}

document.getElementById('submit').addEventListener('click', showResults);

generateQuiz();
