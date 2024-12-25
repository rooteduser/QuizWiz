document.addEventListener("DOMContentLoaded", () => {
    const categorySelect = document.getElementById("category");
    const difficultySelect = document.getElementById("difficulty");
    const questionCountInput = document.getElementById("question-count");
    const fetchQuestionsButton = document.getElementById("fetch-questions");
    const quizSection = document.getElementById("quiz-section");
    const getAnswersButton = document.getElementById("get-answers");
  
    let questionsData = []; // Store fetched questions data
  
    // Fetch categories directly from OpenTDB
    fetch('https://opentdb.com/api_category.php')
      .then(response => response.json())
      .then(data => {
        data.trivia_categories.forEach(category => {
          const option = document.createElement("option");
          option.value = category.id;
          option.textContent = category.name;
          categorySelect.appendChild(option);
        });
      })
      .catch(error => console.error("Error fetching categories:", error));
  
    // Decode HTML entities (needed for question text and answers)
    function decodeHtmlEntities(text) {
      const textArea = document.createElement("textarea");
      textArea.innerHTML = text;
      return textArea.value;
    }
  
    // Fetch and display questions from OpenTDB
    fetchQuestionsButton.addEventListener("click", () => {
      const category = categorySelect.value;
      const difficulty = difficultySelect.value;
      const count = questionCountInput.value;
  
      const url = new URL("https://opentdb.com/api.php");
      const params = {
        amount: count,
        category: category || undefined, // Include category only if selected
        difficulty: difficulty || undefined, // Include difficulty only if selected
        type: "multiple", // Multiple-choice questions
      };
  
      // Add parameters to the URL
      Object.keys(params).forEach(key => {
        if (params[key]) url.searchParams.append(key, params[key]);
      });
  
      fetch(url.toString())
        .then(response => response.json())
        .then(data => {
          questionsData = data.results; // Store the questions data
          quizSection.innerHTML = ""; // Clear previous quiz
          getAnswersButton.style.display = "block"; // Show the "Get Answers" button
  
          if (!questionsData.length) {
            quizSection.textContent = "No questions available for the selected parameters.";
            return;
          }
  
          questionsData.forEach((q, index) => {
            const questionDiv = document.createElement("div");
            questionDiv.classList.add("quiz-question");
            questionDiv.dataset.index = index; // Store question index
  
            // Decode question text
            const questionText = document.createElement("p");
            questionText.textContent = `Q${index + 1}: ${decodeHtmlEntities(q.question)}`;
            questionDiv.appendChild(questionText);
  
            const optionsDiv = document.createElement("div");
            optionsDiv.classList.add("options");
  
            // Combine correct and incorrect answers
            const options = [...q.incorrect_answers, q.correct_answer];
            options.sort(() => Math.random() - 0.5); // Shuffle options
  
            // Decode and display options
            options.forEach((option, idx) => {
              const optionKey = String.fromCharCode(65 + idx); // Generate A, B, C, D
              const optionDiv = document.createElement("div");
              optionDiv.textContent = `${optionKey}. ${decodeHtmlEntities(option)}`;
              optionsDiv.appendChild(optionDiv);
            });
  
            questionDiv.appendChild(optionsDiv);
            quizSection.appendChild(questionDiv);
          });
        })
        .catch(error => console.error("Error fetching questions:", error));
    });
  
    // Display answers when "Get Answers" button is clicked
    getAnswersButton.addEventListener("click", () => {
      const allQuestions = document.querySelectorAll(".quiz-question");
      allQuestions.forEach((questionDiv, index) => {
        const correctAnswer = questionsData[index].correct_answer;
        const answerDiv = document.createElement("div");
        answerDiv.textContent = `Answer: ${decodeHtmlEntities(correctAnswer)}`;
        answerDiv.classList.add("correct-answer");
        questionDiv.appendChild(answerDiv);
      });
    });
  });
  