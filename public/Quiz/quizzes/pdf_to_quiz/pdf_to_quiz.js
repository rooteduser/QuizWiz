document.getElementById('pdf-upload').addEventListener('change', function (e) {
    const file = e.target.files[0];

    if (file && file.type === 'application/pdf') {
        document.getElementById('file-name').textContent = file.name;

        document.getElementById('change-file').style.display = 'inline-block'; // Show Change File button
        document.getElementById('generate-quiz').style.display = 'inline-block'; // Show Generate Quiz button
        document.getElementById('generate-quiz').disabled = false; // Enable Generate Quiz button
    } else {
        alert('Please upload a valid PDF file.');
        e.target.value = ''; // Reset file input
        document.getElementById('file-name').textContent = 'No file selected';
        document.getElementById('change-file').style.display = 'none';
        document.getElementById('generate-quiz').style.display = 'none';
        document.getElementById('generate-quiz').disabled = true; // Disable Generate Quiz button
    }
});
fetch('/generate-quiz', {
    method: 'POST',
    body: formData,
})
.then(response => response.json())
.then(data => {
    // Mock data for testing if no backend is available
    const mockData = {
        quiz: {
            questions: [
                {
                    question: 'What is the capital of France?',
                    options: ['Paris', 'London', 'Berlin', 'Madrid'],
                },
                {
                    question: 'Who discovered gravity?',
                    options: ['Newton', 'Einstein', 'Galileo', 'Tesla'],
                },
            ],
        },
    };
    displayQuiz(data.quiz || mockData.quiz); // Use mockData if no response
})
.catch(error => {
    console.error('Error:', error);
    alert('An error occurred while generating the quiz.');
});
function displayQuiz(quiz) {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = ''; // Clear previous quiz content

    quiz.questions.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');

        questionElement.innerHTML = `
            <h3>${index + 1}. ${question.question}</h3>
            <ul>
                ${question.options
                    .map(
                        (option, optionIndex) =>
                            `<li>
                                <label>
                                    <input type="radio" name="question-${index}" value="${optionIndex}">
                                    ${option}
                                </label>
                            </li>`
                    )
                    .join('')}
            </ul>
        `;
        quizContainer.appendChild(questionElement);
    });

    // Add a submit button for the quiz
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit Quiz';
    submitButton.onclick = submitQuiz; // Call a function to handle quiz submission
    quizContainer.appendChild(submitButton);
}
function submitQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    const questions = quizContainer.querySelectorAll('.question');
    let score = 0;

    questions.forEach((question, index) => {
        const selectedOption = question.querySelector(`input[name="question-${index}"]:checked`);
        if (selectedOption && parseInt(selectedOption.value) === 0) {
            // Assuming the correct answer is always the first option (index 0) for testing
            score++;
        }
    });

    alert(`You scored ${score} out of ${questions.length}`);
}
async function extractPdfText(file) {
    const pdfData = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(pdfData).promise;
    let extractedText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        textContent.items.forEach((item) => {
            extractedText += item.str + " ";
        });
    }
    return extractedText;
}
function extractQuestionsFromText(text) {
    const questions = [];
    const questionRegex = /.+\?([\s\S]+?)(?:A\)|1\.)/g; // Question with options pattern
    let match;

    while ((match = questionRegex.exec(text)) !== null) {
        const question = match[0];
        const options = match[1].split(/A\)|B\)|C\)|D\)/).filter((opt) => opt.trim() !== "");
        questions.push({ question: question.trim(), options: options.map((opt) => opt.trim()) });
    }

    return questions;
}
fetch('/generate-ai-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: extractedText })
})
    .then((response) => response.json())
    .then((quizData) => displayQuiz(quizData))
    .catch((error) => console.error('Error:', error));
    function displayQuiz(questions) {
        const quizContainer = document.getElementById('quiz-container');
        quizContainer.innerHTML = ''; // Clear previous content
    
        questions.forEach((question, index) => {
            const questionElement = document.createElement('div');
            questionElement.className = 'question';
            questionElement.innerHTML = `
                <h3>${index + 1}. ${question.question}</h3>
                <ul>
                    ${question.options
                        .map(
                            (option, i) =>
                                `<li><label><input type="radio" name="question${index}" value="${i}"> ${option}</label></li>`
                        )
                        .join("")}
                </ul>
            `;
            quizContainer.appendChild(questionElement);
        });
    }
    