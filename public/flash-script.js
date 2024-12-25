// References to DOM elements
const setNameInput = document.getElementById('setName');
const questionInput = document.getElementById('question');
const answerInput = document.getElementById('answer');
const addFlashcardButton = document.getElementById('addFlashcard');
const saveSetButton = document.getElementById('saveSet');
const setsContainer = document.getElementById('setsContainer');
const quizContainer = document.getElementById('quizContainer');
const quizTitle = document.getElementById('quizTitle');
const quizFlashcard = document.getElementById('quizFlashcard');
const nextCardButton = document.getElementById('nextCard');
const formContainer = document.querySelector('.form-container');

// Data structure to store flashcards and saved sets (not used now as we're integrating with DB)
let currentSet = { name: '', flashcards: [] };
let savedSets = [];  // This will be populated with flashcard sets from the server
let quizIndex = 0;  //holds current position of the index in the set

// Add flashcard to current set
addFlashcardButton.addEventListener('click', (e) => {
  e.preventDefault(); // Prevent the default form submit

  const question = questionInput.value.trim();
  const answer = answerInput.value.trim();

  if (question && answer) {
    currentSet.flashcards.push({ question, answer });

    // Send data to the server to save flashcard
    fetch('/addFlashcard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question,
        answer: answer,
        setName: setNameInput.value.trim(),
      }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        questionInput.value = '';
        answerInput.value = '';
        alert('Flashcard added!');
      } else {
        alert('Failed to add flashcard');
      }
    })
    .catch(error => {
      console.error('Error adding flashcard:', error);
      alert('An error occurred while adding the flashcard');
    });

  } else {
    alert('Please enter both question and answer.');
  }
});

// Save current flashcard set
saveSetButton.addEventListener('click', (e) => {
  e.preventDefault(); // Prevent the default form submit

  const setName = setNameInput.value.trim();

  if (setName && currentSet.flashcards.length > 0) {
    currentSet.name = setName;

    // Send the set data to the server to save the set
    fetch('/saveFlashcardSet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        setName: setName,
        flashcards: currentSet.flashcards, // Ensure flashcards are sent here
      }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        savedSets.push({ ...currentSet });  // Make sure you're adding the set with flashcards
        renderSets();
        currentSet = { name: '', flashcards: [] }; // Reset current set
        setNameInput.value = '';
        alert('Set saved!');
      } else {
        alert('Failed to save set');
      }
    })
    .catch(error => {
      console.error('Error saving flashcard set:', error);
      alert('An error occurred while saving the set');
    });
  } else {
    alert('Please provide a name and add at least one flashcard.');
  }
});

// Fetch saved flashcard sets when the page loads
window.addEventListener('DOMContentLoaded', () => {
  fetch('/getFlashcardSets')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        savedSets = data.sets;  // Populate savedSets with the response from the server
        renderSets();  // Render the sets to the UI
      } else {
        console.error('Error fetching flashcard sets');
      }
    })
    .catch(error => {
      console.error('Error fetching flashcard sets:', error);
    });
});

function renderSets() {
  setsContainer.innerHTML = '<h2>Saved Flashcard Sets</h2>';
  
  // Filter to ensure only unique set names are displayed
  const uniqueSets = [];
  const setNameTracker = new Set();

  savedSets.forEach((set, index) => {
    if (!setNameTracker.has(set.name)) {
      setNameTracker.add(set.name);
      uniqueSets.push({ ...set, index }); // Retain index for proper set selection
    }
  });

  // Render only unique sets
  uniqueSets.forEach((set) => {
    const setDiv = document.createElement('div');
    setDiv.classList.add('set');
    setDiv.textContent = set.name;  // Display the set name only
    setDiv.addEventListener('click', () => startQuiz(set.index));  // Use original index to start quiz
    setsContainer.appendChild(setDiv);
    

  });

}


// Fetch saved flashcard sets from the server
async function fetchFlashcardSets() {
  try {
    const response = await fetch('/getFlashcardSets');
    const data = await response.json();

    if (data.success) {
      savedSets = data.sets;

      // Display sets in the setsContainer
      setsContainer.innerHTML = savedSets.map((set, index) => `
        <div class="set">
          <h3>${set.name}</h3>
          <button onclick="startQuiz(${index})">Start Quiz</button>
        </div>
      `).join('');
    } else {
      alert(data.message || 'Failed to fetch flashcard sets.');
    }
  } catch (error) {
    console.error('Error fetching flashcard sets:', error);
    alert('An error occurred while fetching flashcard sets.');
  }
}

// Call the function to populate `savedSets` when the page loads
fetchFlashcardSets();



// Start quiz for selected set
function startQuiz(setIndex) {
  const selectedSet = savedSets[setIndex];
  quizIndex = 0;
  quizTitle.textContent = `Quiz: ${selectedSet.name}`;

  // Hide the form and saved sets, show quiz container
  formContainer.style.display = 'none';
  setsContainer.style.display = 'none';
  quizContainer.style.display = 'block'; // Ensure quiz container is visible

  renderQuizCard(selectedSet.flashcards);
}

// Render quiz card (question or answer toggle)
function renderQuizCard(flashcards) {
  if (quizIndex < flashcards.length) {
    const flashcardData = flashcards[quizIndex];
    quizFlashcard.textContent = flashcardData.question;
    quizFlashcard.classList.remove('flipped');
    quizFlashcard.onclick = () => {
      quizFlashcard.textContent = 
        quizFlashcard.classList.toggle('flipped') ? flashcardData.answer : flashcardData.question;
    };
  } else {
    endQuiz();
  }
}

// Go to next card in quiz
nextCardButton.addEventListener('click', () => {
  quizIndex++;
  const selectedSet = savedSets.find(set => set.name === quizTitle.textContent.replace('Quiz: ', ''));
  renderQuizCard(selectedSet.flashcards);
});

// End the quiz
function endQuiz() {
  alert('Quiz completed!');
  quizContainer.style.display = 'none'; // Hide quiz container
  setsContainer.style.display = 'block'; // Show the sets container
  formContainer.style.display = 'block'; // Show the form for adding new sets and questions
}
