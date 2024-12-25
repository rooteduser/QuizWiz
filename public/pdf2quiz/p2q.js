document.getElementById('pdfFile').addEventListener('change', function (e) {
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

document.getElementById('pdfForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('pdfFile', document.getElementById('pdfFile').files[0]);

    try {
        document.getElementById('output').innerHTML = '';
        const response = await fetch('/upload-pdf', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        console.log(data);

        // Clear previous output
        document.getElementById('output').innerHTML = '';
        document.getElementById('attempt').innerHTML = '';

        if (data && data.questions && data.questions.length > 0) {
            let quizContent = `
                <h2>${data.quiz_title}</h2>
                <ul>
            `;

            data.questions.forEach((question, index) => {
                quizContent += `
                    <li class="question">
                        <strong>Q${index + 1}: ${question.question}</strong>
                        <ul>
                            ${question.options.map(option => `<li>${option}</li>`).join('')}
                        </ul>
                        <div class="correct-answer">
                            Correct Answer: ${question.correct_answer}
                        </div>
                    </li>
                `;
            });

            quizContent += `</ul>`;
            document.getElementById('output').innerHTML = quizContent;

            // Store the quiz data for later use
            document.getElementById('attempt').dataset.quizData = JSON.stringify(data);

            // document.getElementById('attempt-quiz-container').style.display = 'inline-block';
            // document.getElementById('download-quiz-container').style.display = 'inline-block';
            // document.getElementById('view-answers-container').style.display = 'inline-block';
        } else {
            document.getElementById('output').innerHTML = 'Try Again';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('output').textContent = 'An error occurred. Please try again.';
    }
});

// Change the selected file on Change File button click
document.getElementById('change-file').addEventListener('click', function() {
    document.getElementById('pdfFile').click();
});

// Attempt Quiz
document.getElementById('attempt-quiz-button').addEventListener('click', async () => {
    const quizData = document.getElementById('attempt').dataset.quizData;

    if (quizData) {
        try {
            const response = await fetch('/attempt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ questions: JSON.parse(quizData) }),
            });

            const result = await response.json();
            console.log(result);

            alert('Quiz submitted successfully!');
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while submitting the quiz.');
        }
    } else {
        alert('No quiz available to attempt.');
    }
});

// Download Quiz Data
document.getElementById('download-quiz-button').addEventListener('click', () => {
    const quizData = document.getElementById('attempt').dataset.quizData;

    if (quizData) {
        const blob = new Blob([quizData], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'quiz-data.json';
        link.click();
    } else {
        alert('No quiz data available to download.');
    }
});

// Toggle visibility of correct answers
document.getElementById('view-answers-button').addEventListener('click', () => {
    const correctAnswers = document.querySelectorAll('.correct-answer');
    const button = document.getElementById('view-answers-button');

    correctAnswers.forEach(answer => {
        answer.style.display = answer.style.display === 'none' ? 'block' : 'none';
    });

    button.textContent = correctAnswers[0].style.display === 'none' 
        ? 'View Correct Answers' 
        : 'Hide Correct Answers';
});
