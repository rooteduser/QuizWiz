document.addEventListener('DOMContentLoaded', () => {
  // Function to fetch the user's dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();

      // Display the fetched data
      displayDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Function to display the fetched data on the dashboard
  const displayDashboardData = (data) => {
    const performanceDataContainer = document.getElementById('performance-data');
    const flashcardListContainer = document.getElementById('flashcard-list');
    const quizListContainer = document.getElementById('quiz-list');

    // Clear existing content
    performanceDataContainer.innerHTML = '';
    flashcardListContainer.innerHTML = '';
    quizListContainer.innerHTML = '';

    // Display performance data (if any)
    if (data.performance) {
      const performanceElement = document.createElement('div');
      performanceElement.innerHTML = `
        <p><strong>Total Quizzes Attempted:</strong> ${data.performance.totalQuizzes || 0}</p>
        <p><strong>Average Score:</strong> ${data.performance.averageScore || 'N/A'}</p>
      `;
      performanceDataContainer.appendChild(performanceElement);
    } else {
      performanceDataContainer.innerHTML = '<p>No performance data available.</p>';
    }

    // Display flashcards
    if (data.flashcardSets && data.flashcardSets.length > 0) {
      data.flashcardSets.forEach(set => {
        const setElement = document.createElement('div');
        setElement.classList.add('flashcard-set');
        setElement.innerHTML = `
          <h3>${set.name}</h3>
          <ul>
            ${set.flashcards.map(flashcard => `
              <li>
                <strong>Question:</strong> ${flashcard.question} <br />
                <strong>Answer:</strong> ${flashcard.answer}
              </li>
            `).join('')}
          </ul>
        `;
        flashcardListContainer.appendChild(setElement);
      });
    } else {
      flashcardListContainer.innerHTML = '<p>No flashcards available.</p>';
    }

    // Display quizzes
    if (data.quizAttempts && data.quizAttempts.length > 0) {
      data.quizAttempts.forEach(attempt => {
        const attemptElement = document.createElement('div');
        attemptElement.classList.add('quiz-attempt');
        attemptElement.innerHTML = `
          <p><strong>Attempt ID:</strong> ${attempt.attempt_id}</p>
          <p><strong>Total Questions:</strong> ${attempt.total_questions}</p>
          <p><strong>Score:</strong> ${attempt.score}</p>
          <p><strong>Attempt Time:</strong> ${new Date(attempt.attempt_time).toLocaleString()}</p>
        `;
        quizListContainer.appendChild(attemptElement);
      });
    } else {
      quizListContainer.innerHTML = '<p>No quiz attempts found.</p>';
    }
  };

  // Fetch and display the dashboard data when the page is loaded
  fetchDashboardData();
});
