// Function to load questions from the backend
function loadQuestions() {
  fetch('/getQuestions') // Replace with your backend endpoint to fetch questions
    .then(response => response.json())
    .then(data => {
      const questionsList = document.getElementById('questions-list');
      questionsList.innerHTML = '';  // Clear the current list
      data.questions.forEach((question, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${question.question}</strong><br>
          Options: ${question.options.join(', ')}
        `;
        questionsList.appendChild(li);
      });
    })
    .catch(error => {
      console.error('Error loading questions:', error);
      // alert('Failed to load questions');
    });
}

// Function to handle form submission
document.getElementById('question-form').addEventListener('submit', function(e) {
  e.preventDefault();

  // Get form data
  const questionText = document.getElementById('question').value;
  const options = Array.from(document.querySelectorAll('.option')).map(o => o.value);
  const correctAnswer = parseInt(document.getElementById('correct-answer').value);

  // Log form data for debugging
  console.log('Form Data:', { questionText, options, correctAnswer });

  // Create the question object
  const question = {
    question: questionText,
    options: options,
    correctAnswer: correctAnswer,
  };

  // Send the new question to the backend
  fetch('/addQuestion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(question),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Clear the form
        document.getElementById('question-form').reset();
        // Reload the questions list
        loadQuestions();
        alert('Question added successfully!');
      } else {
        alert('Failed to add question');
      }
    })
    .catch(error => {
      console.error('Error adding question:', error);
      alert('An error occurred while adding the question');
    });
});

// Load questions when the page loads
window.onload = loadQuestions;

// Quiz logic
document.getElementById('start-quiz').addEventListener('click', function() {
  fetch('/getQuestions') // Replace with your backend endpoint to fetch questions
    .then(response => response.json())
    .then(data => {
      console.log('Quiz Questions:', data);  // Debugging log
      const questions = data.questions;
      let currentQuestionIndex = 0;
      let answers = []; // Store answers
      let score = 0; // Track score

      // Show the first question
      showQuestion(questions[currentQuestionIndex]);

      // Function to display a question
      function showQuestion(question) {
        document.getElementById('quiz-question').textContent = question.question;
        const optionsDiv = document.getElementById('quiz-options');
        optionsDiv.innerHTML = ''; // Clear previous options
        question.options.forEach((option, index) => {
          const label = document.createElement('label');
          label.innerHTML = `
            <input type="radio" name="option" value="${index + 1}"> ${option}
          `;
          optionsDiv.appendChild(label);
          optionsDiv.appendChild(document.createElement('br'));
        });
      }

      // Handle submit answer
      document.getElementById('submit-answer').addEventListener('click', function() {
        const selectedOption = document.querySelector('input[name="option"]:checked');
        if (selectedOption) {
          // Save the selected option without evaluating
          const isCorrect = selectedOption.value === questions[currentQuestionIndex].correctAnswer.toString();
          if (isCorrect) score++;

          answers.push({
            questionId: questions[currentQuestionIndex].question_id, // Assuming question_id is available
            selectedOption: selectedOption.value,
            isCorrect: isCorrect
          });

          // Move to the next question
          currentQuestionIndex++;
          if (currentQuestionIndex < questions.length) {
            showQuestion(questions[currentQuestionIndex]);
          } else {
            // After the last question, change button text to "Check Answers"
            document.getElementById('submit-answer').textContent = 'Check Answers';
            document.getElementById('quiz-feedback').textContent = 'Quiz completed!';
            document.getElementById('quiz-score').textContent = `Your Score: ${score} / ${questions.length}`;
            // Disable the option inputs for final submission
            disableOptions();
            // Save quiz attempt and answers
            saveQuizAttempt(score, questions.length, answers);
          }
        } else {
          alert('Please select an option!');
        }
      });

      // Disable options after the quiz is completed (to prevent further changes)
      function disableOptions() {
        const options = document.querySelectorAll('input[name="option"]');
        options.forEach(option => {
          option.disabled = true;
        });
      }

      function saveQuizAttempt(score, totalQuestions, answers) {
        const userId = 1;  // Replace with the actual user ID (should be dynamically set)
      
        // Send the quiz attempt data
        fetch('/saveQuizAttempt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            score: score,
            totalQuestions: totalQuestions
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            const attemptId = data.attemptId;  // Get the attempt ID from the response
      
            // Save each answer
            answers.forEach(answer => {
              fetch('/saveAnswer', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  attemptId: attemptId,
                  questionId: answer.questionId,
                  selectedAnswer: answer.selectedOption,
                  isCorrect: answer.isCorrect ? 1 : 0
                })
              });
            });
      
            console.log('Quiz attempt and answers saved successfully!');
          } else {
            console.error('Failed to save quiz attempt');
          }
        })
        .catch(error => {
          console.error('Error saving quiz attempt:', error);
          alert('Failed to save quiz attempt');
        });
      }
        
      // Show the quiz container and hide the start button
      document.getElementById('quiz-container').style.display = 'block';
      document.getElementById('start-quiz').style.display = 'none';
    })
    .catch(error => {
      console.error('Error loading questions for quiz:', error);
      alert('Failed to load questions for quiz');
    });
});

// Quiz end logic (optional)
function endQuiz() {
  alert('Quiz completed!');
  document.getElementById('quiz-container').style.display = 'none'; // Hide quiz container
  document.getElementById('start-quiz').style.display = 'block'; // Show the start quiz button
  console.log('Quiz ended');
}
