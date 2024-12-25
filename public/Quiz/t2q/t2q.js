// Advanced MCQ Quiz Generation with Quiz Page and Timer
document.getElementById("text-to-quiz-form").addEventListener("submit", function(event) {
    event.preventDefault();

    // Get input values
    const textInput = document.getElementById("text-input").value.trim();
    // const numQuestions = parseInt(document.getElementById("num-questions").value, 10);

    // Validate inputs
    if (!textInput) {
        alert("Please enter some text to generate the quiz.");
        return;
    }
    // if (isNaN(numQuestions) || numQuestions <= 0) {
    //     alert("Please enter a valid number of questions.");
    //     return;
    // }

    // Split text into sentences
    const sentences = textInput.split(/[.!?]\s+/).filter(Boolean);

    // Extract keywords from text
    const keywords = extractKeywords(textInput);

    // Generate MCQ questions
    const questions = generateMCQs(sentences, keywords, Math.min(numQuestions, 10)); // Limit to 10 questions

    // Redirect to quiz page with questions
    loadQuizPage(questions);
});

// Function to extract keywords from text
function extractKeywords(text) {
    const stopWords = ["a", "an", "the", "and", "or", "but", "if", "is", "are", "was", "were", "in", "on", "at", "to", "for", "with", "by", "of", "this", "that", "it", "as", "from"];
    const words = text.toLowerCase().split(/\W+/).filter(word => word && !stopWords.includes(word));
    const wordFrequency = {};

    words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });

    return Object.keys(wordFrequency).sort((a, b) => wordFrequency[b] - wordFrequency[a]).slice(0, 20); // Top 20 keywords
}

// Function to generate MCQ questions
function generateMCQs(sentences, keywords, numQuestions) {
    const questions = [];
    const usedSentences = new Set();

    while (questions.length < numQuestions && sentences.length > 0) {
        // Pick a random sentence
        const randomIndex = Math.floor(Math.random() * sentences.length);
        const sentence = sentences.splice(randomIndex, 1)[0];

        // Find a keyword in the sentence
        const keyword = keywords.find(kw => sentence.toLowerCase().includes(kw));
        if (!keyword || usedSentences.has(sentence)) {
            continue;
        }

        usedSentences.add(sentence);

        // Create a question with a blank for the keyword
        const questionText = sentence.replace(new RegExp(`\b${keyword}\b`, 'gi'), "____");

        // Generate multiple-choice options
        const choices = generateChoices(keyword, keywords);

        // Create question object
        questions.push({
            question: `What word completes the sentence: "${questionText}"?`,
            choices: choices,
            answer: keyword
        });
    }

    return questions;
}

// Function to generate multiple-choice options
function generateChoices(correctAnswer, keywords) {
    const choices = new Set([correctAnswer]);
    while (choices.size < 4) {
        const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
        if (randomKeyword !== correctAnswer) {
            choices.add(randomKeyword);
        }
    }
    return Array.from(choices).sort();
}

// Function to redirect to quiz page and load questions
function loadQuizPage(questions) {
    localStorage.setItem("quizQuestions", JSON.stringify(questions));
    window.location.href = "quiz_page.html"; // Redirect to a new quiz page
}

// Logic for the Quiz Page (quiz_page.html)
if (window.location.pathname.endsWith("quiz_page.html")) {
    const questions = JSON.parse(localStorage.getItem("quizQuestions"));
    const quizContainer = document.getElementById("quiz-container");
    const timerElement = document.getElementById("timer");
    let currentQuestionIndex = 0;
    let score = 0;
    let timer = 600; // 10 minutes in seconds

    function displayQuestion(index) {
        const questionObj = questions[index];
        quizContainer.innerHTML = "";

        const questionText = document.createElement("p");
        questionText.textContent = `${index + 1}. ${questionObj.question}`;

        const optionsList = document.createElement("ul");
        questionObj.choices.forEach(choice => {
            const optionItem = document.createElement("li");
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "answer";
            radio.value = choice;
            optionItem.appendChild(radio);
            optionItem.appendChild(document.createTextNode(choice));
            optionsList.appendChild(optionItem);
        });

        quizContainer.appendChild(questionText);
        quizContainer.appendChild(optionsList);
    }

    function showResults() {
        quizContainer.innerHTML = "";
        questions.forEach((question, index) => {
            const result = document.createElement("p");
            result.textContent = `${index + 1}. ${question.question} - Correct Answer: ${question.answer}`;
            quizContainer.appendChild(result);
        });
        const scoreElement = document.createElement("p");
        scoreElement.textContent = `Your Score: ${score}/${questions.length}`;
        quizContainer.appendChild(scoreElement);
    }

    function updateTimer() {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        timerElement.textContent = `Time Remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        timer--;
        if (timer < 0) {
            clearInterval(timerInterval);
            alert("Time's up! Submitting your answers.");
            showResults();
        }
    }

    const timerInterval = setInterval(updateTimer, 1000);

    displayQuestion(currentQuestionIndex);

    document.getElementById("next-button").addEventListener("click", () => {
        const selectedOption = document.querySelector("input[name='answer']:checked");
        if (!selectedOption) {
            alert("Please select an answer before proceeding.");
            return;
        }

        if (selectedOption.value === questions[currentQuestionIndex].answer) {
            score++;
        }

        currentQuestionIndex++;

        if (currentQuestionIndex < questions.length) {
            displayQuestion(currentQuestionIndex);
        } else {
            clearInterval(timerInterval);
            showResults();
        }
    });
}
