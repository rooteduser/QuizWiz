//import environment variables, passwords and other sensitive information from .env file
require('dotenv').config()

//importing requirements
const express = require('express') //import express
const app = express() //creating instance of express
const bcrypt = require('bcrypt') //used to encrypt the user password
const passport = require('passport') //js framework for user authentication
const flash = require('express-flash')  //flash messages, temporary messages displayed to the user
const session = require('express-session')  //session-management
const methodOverride = require('method-override') //used for HTTP Methods like DELETE
const path = require('path');   //to work with file paths
const mysql = require('mysql2')     //for connection to mysql database
const axios = require('axios');
const multer = require('multer'); //for file handling
const pdfParse = require('pdf-parse'); //extracting text from pdf
const fs = require('fs').promises; // filesystem

//static files and views
app.use(express.static(path.join(__dirname, 'public'))); //appends public to current directory name and serves the static files like CSS,HTML, images etc
app.set('views', path.join(__dirname,'views')); //tells express that template files are stored inside the views folder
app.set('view-engine','ejs') //sets the view-engine to ejs

const initializePassport = require('./passport-config') 
const getUserByEmail = async (email) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows.length > 0 ? rows[0] : null;
};

const getUserById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
};

initializePassport(passport, getUserByEmail, getUserById)
app.use(flash())
app.use(session({
    secret :  process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.use(express.json());
app.use(express.urlencoded({ extended:false }))

//connection to the database 
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true
}).promise()

app.get('/', (req,res) => {
    res.render('index.ejs', {name: req.user ? req.user.name : 'Guest'})
})

app.get('/login', checkNotAuthenticated, (req,res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register',checkNotAuthenticated, (req,res) => {
    res.render('register.ejs')
})


app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        
        // Execute the query
        const [results] = await pool.query(query, [req.body.name, req.body.email, hashedPassword]);
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})  

app.delete('/logout', (req, res) => { 
    req.logout(err => {
        if (err) {
            return next(err); 
        }
    res.redirect('/login')  
    })
})

//check if the user is authenticated
function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next()
    } else{
        res.redirect('/login')
    }
}

// check is the user is not authenticated
function checkNotAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return res.redirect('/')
    } 
    next()
}

app.listen(3000)

//flashcard routine

//display the flashcard.ejs
app.get('/flashcards', checkAuthenticated, (req, res) => {
    res.render('flashcards.ejs');
    // console.log(req.user.id);
  });

//add flashcard
app.post('/addFlashcard', checkAuthenticated, async (req, res) => {
    const { question, answer, setName } = req.body;

    // console.log('Received data:', req.body); // Debugging log

    // Ensure all fields are provided
    if (!question || !answer || !setName) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    let setId = null;
    try {
        // Step 1: Check if the set exists or create it
        const [setResults] = await pool.query('SELECT * FROM flashcard_sets WHERE set_name = ? AND user_id = ?', [setName, req.user.id]);

        // If set doesn't exist, create it
        if (setResults.length === 0) {
            const [setInsertResults] = await pool.query('INSERT INTO flashcard_sets (user_id, set_name) VALUES (?, ?)', [req.user.id, setName]);
            setId = setInsertResults.insertId; // Get the ID of the newly created set
        } else {
            setId = setResults[0].set_id; // If set exists, get the set_id from the results
        }

        // Step 2: Insert the flashcard for the logged-in user
        const query = 'INSERT INTO flashcards (user_id, set_id, question, answer) VALUES (?, ?, ?, ?)';
        const [results] = await pool.query(query, [req.user.id, setId, question, answer]);

        // console.log('Flashcard added:', results); // Debugging log

        // Step 3: Return a success response with the flashcard ID
        return res.json({ success: true, flashcardId: results.insertId });

    } catch (error) {
        console.error('Error adding flashcard:', error); // Debugging log
        return res.status(500).json({ success: false, message: 'An error occurred while adding the flashcard' });
    }
});
app.post('/saveFlashcardSet', checkAuthenticated, async (req, res) => {
    const { setName, flashcards } = req.body;
    const userId = req.user.id;  // Assuming `req.user.id` is the logged-in user's ID
  
    try {
      // 1. Insert the flashcard set into flashcard_sets table
      const [setResults] = await pool.query(
        'INSERT INTO flashcard_sets (user_id, set_name) VALUES (?, ?)',
        [userId, setName]
      );
  
      const setId = setResults.insertId;  // Get the ID of the newly inserted set
  
      // 2. Insert each flashcard into flashcards table
      const flashcardPromises = flashcards.map(flashcard => {
        return pool.query(
          'INSERT INTO flashcards (user_id, set_id, question, answer) VALUES (?, ?, ?, ?)',
          [userId, setId, flashcard.question, flashcard.answer]
        );
      });
  
      // Wait for all flashcards to be inserted
      await Promise.all(flashcardPromises);
  
      // 3. Send success response
      res.json({ success: true, message: 'Flashcard set saved successfully' });
    } catch (error) {
      console.error('Error saving flashcard set:', error);  // Log detailed error
      res.status(500).json({ success: false, message: 'Error saving flashcard set' });
    }
  });
  
  app.get('/getFlashcardSets', checkAuthenticated, async (req, res) => {
    const userId = req.user.id; // Assuming `req.user.id` is the logged-in user's ID
  
    try {
      // Query to fetch all flashcards and their associated set details in one go
      const [rows] = await pool.query(
        `SELECT 
           f.set_id AS set_id, 
           fs.set_name AS name, 
           fs.created_at, 
           f.question, 
           f.answer 
         FROM flashcard_sets fs
         LEFT JOIN flashcards f ON fs.set_id = f.set_id
         WHERE fs.user_id = ?
         ORDER BY fs.set_id, f.flashcard_id`, // Order by set and flashcard ID for easier grouping
        [userId]
      );
  
      // Transform the result into the desired structure
      const setsWithFlashcards = rows.reduce((acc, row) => {
        let set = acc.find(s => s.set_id === row.set_id);
        if (!set) {
          set = {
            set_id: row.set_id,
            name: row.name,
            created_at: row.created_at,
            flashcards: []
          };
          acc.push(set);
        }
  
        if (row.question && row.answer) {
          set.flashcards.push({
            question: row.question,
            answer: row.answer
          });
        }
  
        return acc;
      }, []);
  
      // Send the structured data back to the client
      res.json({ success: true, sets: setsWithFlashcards });
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
      res.status(500).json({ success: false, message: 'Error fetching flashcard sets' });
    }
  });
  
// Code for integrating User Curated Quiz With Backend

app.post('/addQuestion', checkAuthenticated, async (req, res) => {
  const { question, options, correctAnswer } = req.body;
  
  if (!question || !options || correctAnswer === undefined || options.length !== 4) {
    return res.status(400).json({ success: false, message: 'All fields are required and there must be exactly 4 options' });
  }

  try {
    const query = 'INSERT INTO questions (question, option1, option2, option3, option4, correct_answer, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const [result] = await pool.query(query, [question, options[0], options[1], options[2], options[3], correctAnswer, req.user.id]);
    res.setHeader('Content-Type','application/json');
    res.json({ success: true, questionId: result.insertId })
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ success: false, message: 'An error occurred while adding the question' });
  }
});
// Endpoint to get all questions
app.get('/getQuestions', checkAuthenticated, async (req, res) => {
  try {
    const query = 'SELECT * FROM questions';
    const [rows] = await pool.query(query);
    // console.log('Fetched questions:', rows); // Log fetched data
    
    // Map the rows to include options as an array
    const questions = rows.map(row => ({
      question: row.question,
      options: [row.option1, row.option2, row.option3, row.option4], // Collecting options into an array
      correctAnswer: row.correct_answer, // Correct answer index (1-4)
    }));

    res.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error); // Log error details
    res.status(500).json({ success: false, message: 'An error occurred while fetching the questions' });
  }
});

// Route to attempt a quiz
app.post('/attemptQuiz', checkAuthenticated, async (req, res) => {
  const { quizId, answers } = req.body;

  // Start a new quiz attempt
  const query = 'INSERT INTO quiz_attempts (user_id, total_questions, score) VALUES (?, ?, ?)';
  const [attemptResult] = await pool.query(query, [req.user.id, answers.length, 0]);
  const attemptId = attemptResult.insertId;

  // Save each answer to quiz_answers table
  for (const answer of answers) {
    await pool.query('INSERT INTO quiz_answers (quiz_attempt_id, question_id, user_answer) VALUES (?, ?, ?)', [
      attemptId, answer.question_id, answer.user_answer
    ]);
  }

  res.json({ success: true, message: 'Quiz attempt saved' });
});

// Route to get quiz results
app.get('/quizResults/:attemptId', checkAuthenticated, async (req, res) => {
  const attemptId = req.params.attemptId;
  try {
    const [quizAnswers] = await pool.query('SELECT * FROM quiz_answers WHERE quiz_attempt_id = ?', [attemptId]);
    res.render('quizResults.ejs', { quizAnswers });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ success: false, message: 'Error fetching quiz results' });
  }
});

// User Dashboard

app.get('/dashboard', checkAuthenticated, async (req, res) => {
  const userId = req.user.id;
  try {
    // Query flashcard sets with flashcards
    const flashcardSetsPromise = pool.query(
      `SELECT 
        fs.set_id, fs.set_name, fs.created_at, f.question, f.answer 
      FROM flashcard_sets fs
      LEFT JOIN flashcards f ON fs.set_id = f.set_id
      WHERE fs.user_id = ?`,
      [userId]
    );

    // Query user's questions
    const questionsPromise = pool.query(
      `SELECT 
        q.question_id, q.question, q.option1, q.option2, q.option3, q.option4, q.correct_answer
      FROM questions q
      WHERE q.user_id = ?`,
      [userId]
    );

    // Query quiz attempts
    const quizAttemptsPromise = pool.query(
      `SELECT 
        qa.attempt_id, qa.total_questions, qa.score, qa.attempt_time
      FROM quiz_attempts qa
      WHERE qa.user_id = ?`,
      [userId]
    );

    // Execute all queries in parallel
    const [flashcardSetsData, questionsData, quizAttemptsData] = await Promise.all([
      flashcardSetsPromise,
      questionsPromise,
      quizAttemptsPromise
    ]);

    // Transform data for the dashboard
    const flashcardSets = flashcardSetsData[0].reduce((acc, row) => {
      // Find the set by set_id
      let set = acc.find(s => s.set_id === row.set_id);
      
      // If the set does not exist, create it
      if (!set) {
        set = {
          set_id: row.set_id,
          name: row.set_name,
          description: row.description || 'No description available.',
          created_at: row.created_at,
          flashcards: []
        };
        acc.push(set);
      }
    
      // Add the flashcard only if it's not already in the flashcards array
      if (row.question && row.answer) {
        const isDuplicate = set.flashcards.some(
          flashcard => flashcard.question === row.question && flashcard.answer === row.answer
        );
    
        if (!isDuplicate) {
          set.flashcards.push({ question: row.question, answer: row.answer });
        }
      }
    
      return acc;
    }, []);
    
    const questions = questionsData[0].map(q => ({
      question_id: q.question_id,
      question: q.question,
      options: [q.option1, q.option2, q.option3, q.option4],
      correct_answer: q.correct_answer
    }));

    const quizAttempts = quizAttemptsData[0].map(attempt => ({
      attempt_id: attempt.attempt_id,
      total_questions: attempt.total_questions,
      score: attempt.score,
      attempt_time: attempt.attempt_time
    }));

    const dashboardData = {
      flashcardSets,
      questions,
      quizAttempts
    };

    res.render('dashboard.ejs', { dashboardData, user: req.user });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard data' });
  }
});


app.post('/saveQuizAttempt', (req, res) => {
  // console.log('Received quiz attempt data:', req.body);  // Log the incoming data

  const { userId, score, totalQuestions } = req.body;

  if (!userId || score === undefined || totalQuestions === undefined) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const query = `
    INSERT INTO quiz_attempts (user_id, score, total_questions)
    VALUES (?, ?, ?)
  `;
  pool.query(query, [userId, score, totalQuestions], (err, result) => {
    if (err) {
      console.error('Error saving quiz attempt:', err);
      return res.status(500).json({ success: false, message: 'Failed to save quiz attempt' });
    }

    res.json({
      success: true,
      attemptId: result.insertId,
    });
  });
});

app.post('/saveAnswer', async (req, res) => {
  const { attemptId, questionId, selectedAnswer, isCorrect } = req.body;

  try {
    // Insert the user's answer into the quiz_answers table
    await promisePool.query(
      'INSERT INTO quiz_answers (attempt_id, question_id, selected_answer, is_correct) VALUES (?, ?, ?, ?)',
      [attemptId, questionId, selectedAnswer, isCorrect]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving quiz answer:', error);
    res.status(500).json({ success: false, message: 'Failed to save quiz answer' });
  }
});


// Trying to integrate model on google collab

app.post('/api/process', async (req, res) => {
  try {
      const userInput = req.body.input;

      // Send the user input to the Flask API
      const response = await axios.post('generated_ngrok_link', {
          input: userInput
      });

      // Return the result from Flask API to the frontend
      // console.log(response.data);
      res.json(response.data);
  } catch (error) {
      console.error('Error communicating with Colab API:', error.message);
      res.status(500).json({ error: 'Failed to process input. Please try again.' });
  }
});

app.get('/input', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Quiz', 'test', 'test.html'));
});



// PDF TO QUIZ SECTION

// handles fileupload in nodejs
const upload = multer({ dest: 'uploads/' }); // Temporary upload directory


// Serves html page at p2q endpoint
app.get('/p2q', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pdf2quiz', 'p2q.html'));
});


// // Endpoint to handle PDF upload
app.post('/upload-pdf', upload.single('pdfFile'), async (req, res) => {
  if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
      const filePath = path.join(__dirname, req.file.path);
      console.log("File Path is: " + filePath); // new log
  
      const dataBuffer = await fs.readFile(filePath); // stores raw binary data of the pdf file
      
      const pdfData = await pdfParse(dataBuffer);   // operates on the binary data and converts it to text and metadata

      // Log extracted text (optional, for debugging)
      // console.log('Extracted PDF Text:', pdfData.text);

      // Get the number of questions from the request body
      const questionCount = parseInt(req.body.questionCount, 10); // 10 is base

      // Send the extracted text to your AI model for question generation
      const quizQuestions = await generateQuizQuestions(pdfData.text, questionCount);

      // Deletes uploaded file after processing
      await fs.unlink(filePath);

      // Send the generated questions back to the client
      res.json(quizQuestions);
  } catch (error) {
      console.error('Error processing PDF:', error);
      res.status(500).json({ error: 'Failed to process the PDF.' });
  }
});

// Function to generate quiz questions using your AI model in Google Colab
async function generateQuizQuestions(text, questionCount) {
  try {
      const response = await axios.post('generated_ngrok_link', {
          input: `${text}`
      });

      if (response.data) {
        // console.log(response.data); // newlog
        return response.data;
          
      } else {
          throw new Error('No result from AI model');
      }
  } catch (error) {
      console.error('Error generating quiz questions:', error);
      throw new Error('Failed to generate quiz questions');
  }
}




// Quiz Centralisation

app.get('/quiz', (req, res) => {
  res.render(path.join(__dirname, 'views', 'template.ejs'));
});


app.post('/quiz/:subject', async (req, res) => {
  const subject = req.params.subject; // Get the subject from the URL
  try {
      // Fetch the quiz data for the subject
      const quizData = await getQuizDataForSubject(subject);

      if (!quizData) {
          return res.status(404).send('Quiz not found');
      }

      // Send the quiz data as JSON response
      res.json(quizData);
  } catch (error) {
      console.error('Error fetching quiz data:', error);
      res.status(500).send('Internal Server Error');
  }
});

// Handle GET request to fetch quiz data
app.get('/quiz/:subject', async (req, res) => {
  const subject = req.params.subject; // Get the subject from the URL
  try {
      const quizData = await getQuizDataForSubject(subject);
      if (!quizData) {
          return res.status(404).send('Quiz not found');
      }
      res.render('template.ejs', { subject, quizData });
  } catch (error) {
      console.error('Error fetching quiz data:', error);
      res.status(500).send('Internal Server Error');
  }
});

// Updated function to fetch quiz data from the JSON file

async function getQuizDataForSubject(subject) {
  const filePath = path.join(__dirname, 'quizzes.json'); // Path to your quizzes.json file

  try {
      // Read the quizzes.json file
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const quizzes = JSON.parse(fileContent); // Parse the file content into a JavaScript object

      // Return the quiz data for the requested subject
      return quizzes[subject] || null;
  } catch (error) {
      console.error('Error reading quiz data:', error);
      return null;
  }
}



//PDF TO QUIZ NEW SEGMENT
// API route to fetch quiz questions
// app.post('/generate-quiz', async (req, res) => {
//   try {
//       // Send the request to the Google Colab API (assuming you're using an API call to your Colab model)
//       const response = await axios.post('generated_ngrok_link', {
//           text: req.body.text,  // The input text or topic
//       });

//       // Log the response for debugging purposes
//       console.log(response.data);

//       // Send the received data (quiz questions) to the frontend
//       res.json(response.data);
//   } catch (error) {
//       console.error('Error generating quiz:', error);
//       res.status(500).send('Failed to generate quiz');
//   }
// });

// PDF TO ATTEMPT Quiz
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.post('/attempt', (req, res) => {
  const quizData = req.body;
  const subject = 'random';
  if (quizData) {
    req.session.storedQuizData = quizData; // Store quiz data in the session
    res.redirect('/quiz'); // Render template
  } else {
    res.status(400).json({ success: false, message: 'No quiz data provided.' });
  }
});

app.get('/quiz/extract', (req, res) => {
  if (req.session.storedQuizData) {
    res.json({ success: true, quizData: req.session.storedQuizData });
  } else {
    res.status(404).json({ success: false, message: 'No quiz data available.' });
  }
});


// Large Text To Questions
app.get('/t2q', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Quiz', 't2q', 't2q.html'));
});