let currentSubjectQuiz = [];
let currentQuestion = 0;
let score = 0;
let quizStarted = false;
let quizInProgress = false;
let isPaused = false;

let TIME_LIMIT = 15; // Time limit for each question in seconds
let pauseTimer;
let pauseTimeLeft = 15;


document.getElementById('start-button').onclick = async function () {
    quizStarted = true;
    quizInProgress = true;

    const selectedSubject = document.getElementById('subject-selector').value;
    
    try {
        // Load quiz data asynchronously
        await loadQuizData(selectedSubject); 

        document.getElementById('instructions').style.display = 'none';
        document.getElementById('quiz').style.display = 'block';
        loadQuestion();
        enterFullScreen(); // Enter full-screen mode
    } catch (error) {
        console.error('Error loading quiz data:', error);
        alert('Failed to load quiz data. Please try again.');
    }
};

// async function loadQuizData(subject) {
//     try {
//         // Change the request to use GET instead of POST
//         const response = await fetch(`/quiz/${subject}`);

//         if (!response.ok) {
//             throw new Error('Failed to fetch quiz data');
//         }

//         const data = await response.json();
//         currentSubjectQuiz = data;
//         console.log('Quiz Data:', currentSubjectQuiz[0].correct_answer);
//     } catch (error) {
//         console.error('Error fetching quiz data:', error);
//         throw error; // Rethrow the error to be handled in the start button logic
//     }
// }


document.getElementById('next-button').onclick = function () {
    checkAnswer();
    loadNextQuestion();
};

document.getElementById('restart-button').onclick = function () {
    currentQuestion = 0;
    score = 0;
    quizStarted = false;
    quizInProgress = false;
    isPaused = false;
    document.getElementById('result').style.display = 'none';
    document.getElementById('instructions').style.display = 'block';
    exitFullScreen(); // Exit full-screen mode when restarting
};

document.getElementById('unpause-button').onclick = function () {
    clearInterval(pauseTimer);
    isPaused = false;
    document.getElementById('unpause-button').style.display = 'none';
    startTimer(); // Resume quiz
    enterFullScreen(); // Re-enter full-screen mode
};

document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement && quizInProgress) { // Only if the quiz is in progress
        isPaused = true; // Pause the quiz
        clearInterval(timer); // Clear the question timer
        startPauseTimer(); // Start the 15-second global pause timer
        document.getElementById('unpause-button').style.display = 'block'; // Show unpause button
    }
});

// Function to start the 15-second global pause timer
function startPauseTimer() {
    clearInterval(pauseTimer);
    const update_pause = document.getElementById('unpause-button');
    update_pause.textContent = `Unpause: ${pauseTimeLeft}s remaining`;

    pauseTimer = setInterval(() => {
        pauseTimeLeft--;
        document.getElementById('unpause-button').textContent = `Unpause: ${pauseTimeLeft}s remaining`;

        if (pauseTimeLeft <= 0) {
            clearInterval(pauseTimer);
            endQuizDueToPause();
            update_pause.style.display = 'none';
            return;
        }
    }, 1000);
}

// Function to end the quiz and show result if pause timer runs out
function endQuizDueToPause() {
    quizInProgress = false;
    clearInterval(timer);
    showResult();
    alert("Time's up! The quiz has ended due to inactivity.");
}

async function loadQuizData(subject) {
    try {
        const response = await fetch(`/quiz/${subject}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ subject: subject }),
        });

        if (response.ok) {
            const data = await response.json();
            currentSubjectQuiz = data;}
        else{
            try {
                const response = await fetch('/quiz/extract');
                if(response.ok){
                    const data = response.json()
                    console.log(response)
                }
            }
            catch (error){
                throw new Error('Failed to fetch quiz data');
            }
        }        
        
    } catch (error) {
        console.error('Error fetching quiz data:', error);
        throw error; // Rethrow the error to be handled in the start button logic
    }
}
function checkAnswer() {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (selectedAnswer) {
        answer = selectedAnswer.value;
        if ( answer === currentSubjectQuiz[currentQuestion].correct_answer) {
            score++;
        }
    }
}

function loadQuestion() {
    const question = currentSubjectQuiz[currentQuestion];
    document.getElementById('question').innerText = question.question;
    const answersDiv = document.getElementById('answers');
    answersDiv.innerHTML = '';
    question.options.forEach((answer, index) => {
        answersDiv.innerHTML += `
            <div>
                <input type="radio" name="answer" value="${answer}" id="answer${index}">
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

function loadNextQuestion() {
    if (!isPaused) {
        currentQuestion++;
        clearInterval(timer);
        if (currentQuestion < currentSubjectQuiz.length) {
            loadQuestion();
        } else {
            showResult();
        }
    }
}

function showResult() {
    quizInProgress = false;
    exitFullScreen();
    document.getElementById('quiz').style.display = 'none';
    document.getElementById('result').style.display = 'block';
    document.getElementById('score').innerText = score + "/" + currentSubjectQuiz.length;
    
    // Show the "Show Answer" button only after the quiz ends
    // document.getElementById('show-answer-button').style.display = 'inline-block'; // Ensure the button is displayed
}

document.getElementById('show-answer-button').onclick = function() {
    showAnswers();
};

function showAnswers() {
    let answersHtml = '';
    currentSubjectQuiz.forEach((question, index) => {
        answersHtml += `<p><strong>Question ${index + 1}:</strong> ${question.question}<br>`;
        answersHtml += `<strong>Correct Answer:</strong> ${question.correct_answer}</p>`;
    });
    // Append the answers in a dedicated area or modify existing content
    document.getElementById('answersp').innerHTML = answersHtml;

    // Optionally, hide the "Show Answer" button after showing answers
    document.getElementById('show-answer-button').style.display = 'none'; // Hide the button after showing answers
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
