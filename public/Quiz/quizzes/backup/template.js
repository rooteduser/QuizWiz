const questions = [
    {
        question: "What is the largest desert in the world?",
        answers: ["Sahara", "Arabian", "Gobi", "Antarctic"],
        correct: 3
    },
    {
        question: "Which element has the chemical symbol 'Fe'?",
        answers: ["Gold", "Iron", "Silver", "Lead"],
        correct: 1
    },
    {
        question: "Who painted the ceiling of the Sistine Chapel?",
        answers: ["Leonardo da Vinci", "Michelangelo", "Raphael", "Caravaggio"],
        correct: 1
    },
    {
        question: "In which year did the Titanic sink?",
        answers: ["1905", "1912", "1915", "1920"],
        correct: 1
    },
    {
        question: "What is the smallest country in the world?",
        answers: ["Monaco", "Malta", "Vatican City", "Nauru"],
        correct: 2
    },
    {
        question: "Which gas is most abundant in the Earth's atmosphere?",
        answers: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
        correct: 1
    },
    {
        question: "Who discovered penicillin?",
        answers: ["Louis Pasteur", "Alexander Fleming", "Marie Curie", "Thomas Edison"],
        correct: 1
    },
    {
        question: "What is the capital city of Australia?",
        answers: ["Sydney", "Canberra", "Melbourne", "Brisbane"],
        correct: 1
    },
    {
        question: "Which organ is responsible for pumping blood throughout the body?",
        answers: ["Liver", "Kidney", "Heart", "Lung"],
        correct: 2
    },
    {
        question: "Which famous scientist developed the theory of relativity?",
        answers: ["Isaac Newton", "Albert Einstein", "Galileo Galilei", "Stephen Hawking"],
        correct: 1
    }
];


let currentQuestion = 0;
let score = 0;
let quizStarted = false;
let timer;
let quizInProgress = false;
let isPaused = false; 

const TIME_LIMIT = 15; // Time limit for each question in seconds
let pauseTimer;
let pauseTimeLeft = 15;

document.getElementById('start-button').onclick = function() {
    quizStarted = true;
    quizInProgress = true;
    document.getElementById('instructions').style.display = 'none';
    document.getElementById('quiz').style.display = 'block';
    loadQuestion();
    enterFullScreen(); // Enter full-screen mode
};

document.getElementById('next-button').onclick = function() {
    checkAnswer();
    loadNextQuestion();
};

document.getElementById('restart-button').onclick = function() {
    currentQuestion = 0;
    score = 0;
    quizStarted = false;
    quizInProgress = false;
    isPaused = false;
    document.getElementById('result').style.display = 'none';
    document.getElementById('instructions').style.display = 'block';
    exitFullScreen(); // Exit full-screen mode when restarting
};

document.getElementById('unpause-button').onclick = function() {
    clearInterval(pauseTimer);
    isPaused = false;
    document.getElementById('unpause-button').style.display = 'none';
    startTimer(); // Resume quiz
    enterFullScreen(); // Re-enter full-screen mode
};

document.addEventListener('fullscreenchange', function() {
    if (!document.fullscreenElement && quizInProgress) { // Only if the quiz is in progress
        isPaused = true; // Pause the quiz
        clearInterval(timer); // Clear the question timer
        startPauseTimer(); // Start the 15-second global pause timer
        document.getElementById('unpause-button').style.display = 'block'; // Show unpause button
    }
});

// Function to start the 15-second global pause timer
function startPauseTimer() {
    // Clear any existing pause timer before starting a new one
    clearInterval(pauseTimer);
    const update_pause = document.getElementById('unpause-button');
    update_pause.textContent = `Unpause: ${pauseTimeLeft}s remaining`; //initialise
    
    pauseTimer = setInterval(() => {
        pauseTimeLeft--;
        document.getElementById('unpause-button').textContent = `Unpause: ${pauseTimeLeft}s remaining`; //constant-updation

        if (pauseTimeLeft <= 0) {
            clearInterval(pauseTimer);
            endQuizDueToPause(); // End the quiz if time runs out
            update_pause.style.display = 'none';
            return
        }
    }, 1000);
}

// Function to end the quiz and show result if pause timer runs out
function endQuizDueToPause() {
    quizInProgress = false; // Mark the quiz as no longer in progress
    clearInterval(timer); // Ensure the quiz timer is also stopped
    showResult(); // Show the result
    alert("Time's up! The quiz has ended due to inactivity.");
}


function loadQuestion() {
    const question = questions[currentQuestion];
    document.getElementById('question').innerText = question.question;
    const answersDiv = document.getElementById('answers');
    answersDiv.innerHTML = '';
    question.answers.forEach((answer, index) => {
        answersDiv.innerHTML += `
            <div>
                <input type="radio" name="answer" value="${index}" id="answer${index}">
                <label for="answer${index}">${answer}</label>
            </div>
        `;
    });
    timeLeft = TIME_LIMIT;
    startTimer();
}
let timeLeft = TIME_LIMIT;
function startTimer() {
    document.getElementById('timer').innerText = `Time left: ${timeLeft}s`;
    
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = `Time left: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            checkAnswer();
            loadNextQuestion();
        }
    }, 1000);
}

function checkAnswer() {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (selectedAnswer) {
        const answerIndex = parseInt(selectedAnswer.value);
        if (answerIndex === questions[currentQuestion].correct) {
            score++;
        }
    }
}

function loadNextQuestion() {
    if (!isPaused) { // Check if the quiz is paused
        currentQuestion++;
        clearInterval(timer);
        if (currentQuestion < questions.length) {
            loadQuestion();
        } else {
            showResult();
        }
    }
}

function showResult() {
    quizInProgress = false;
    exitFullScreen(); // Exit full-screen mode
    document.getElementById('quiz').style.display = 'none';
    document.getElementById('result').style.display = 'block';
    document.getElementById('score').innerText = score + "/" + questions.length;
}

function enterFullScreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, and Opera
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE/Edge
        elem.msRequestFullscreen();
    }
}

function exitFullScreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { // Chrome, Safari, and Opera
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
    }
}







