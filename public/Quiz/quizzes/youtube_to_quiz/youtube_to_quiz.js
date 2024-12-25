document.getElementById("process-video").addEventListener("click", async () => {
    const youtubeUrl = document.getElementById("youtube-url").value;

    if (!youtubeUrl) {
        alert("Please enter a valid YouTube URL.");
        return;
    }

    try {
        // Sending the URL to the backend
        const response = await fetch("http://127.0.0.1:5000/process-video", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: youtubeUrl }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch quiz questions.");
        }

        const data = await response.json();

        // Display the questions in the frontend
        const quizSection = document.getElementById("quiz-section");
        const quizQuestionsDiv = document.getElementById("quiz-questions");

        quizQuestionsDiv.innerHTML = ""; // Clear previous content

        data.questions.forEach((q, index) => {
            const questionDiv = document.createElement("div");
            questionDiv.className = "question";

            questionDiv.innerHTML = `
                <h3>Q${index + 1}: ${q.question}</h3>
                <ul>
                    ${q.options.map((opt, i) => `<li><input type="radio" name="q${index}" id="q${index}_opt${i}">
                        <label for="q${index}_opt${i}">${opt}</label></li>`).join("")}
                </ul>
            `;

            quizQuestionsDiv.appendChild(questionDiv);
        });

        quizSection.style.display = "block";
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while processing the video.");
    }
});
console.log("Quiz section is now visible.");
quizSection.style.display = "block";



function copyLink(videoLink) {
    const youtubeInput = document.getElementById("youtube-url");
    youtubeInput.value = videoLink;
};
{
    "questions";console.log("Questions added to the DOM:", data.questions);
 [
        {
            "question": "Sample question?",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "answer": "Option 1"
        },
        // More questions...
    ]
}
data.questions.forEach((q, index) => {
    const questionDiv = document.createElement("div");
    questionDiv.className = "question";

    questionDiv.innerHTML = `
        <h3>Q${index + 1}: ${q.question}</h3>
        <ul>
            ${q.options.map((opt, i) => `<li><input type="radio" name="q${index}" id="q${index}_opt${i}">
                <label for="q${index}_opt${i}">${opt}</label></li>`).join("")}
        </ul>
    `;

    quizQuestionsDiv.appendChild(questionDiv);
});
data.questions.forEach((q, index) => {
    const questionDiv = document.createElement("div");
    questionDiv.className = "question";

    questionDiv.innerHTML = `
        <h3>Q${index + 1}: ${q.question}</h3>
        <ul>
            ${q.options.map((opt, i) => `<li><input type="radio" name="q${index}" id="q${index}_opt${i}">
                <label for="q${index}_opt${i}">${opt}</label></li>`).join("")}
        </ul>
    `;

    quizQuestionsDiv.appendChild(questionDiv);
});
console.log("Questions added to the DOM:", data.questions);
document.getElementById("process-video").addEventListener("click", () => {
    const mockData = {
        "questions": [
            {
                "question": "What is 2+2?",
                "options": ["1", "2", "3", "4"],
                "answer": "4"
            },
            {
                "question": "What is the capital of France?",
                "options": ["Berlin", "Paris", "Rome", "Madrid"],
                "answer": "Paris"
            }
        ]
    };

    const quizSection = document.getElementById("quiz-section");
    const quizQuestionsDiv = document.getElementById("quiz-questions");

    quizQuestionsDiv.innerHTML = ""; // Clear previous content

    mockData.questions.forEach((q, index) => {
        const questionDiv = document.createElement("div");
        questionDiv.className = "question";

        questionDiv.innerHTML = `
            <h3>Q${index + 1}: ${q.question}</h3>
            <ul>
                ${q.options.map((opt, i) => `<li><input type="radio" name="q${index}" id="q${index}_opt${i}">
                    <label for="q${index}_opt${i}">${opt}</label></li>`).join("")}
            </ul>
        `;

        quizQuestionsDiv.appendChild(questionDiv);
    });

    quizSection.style.display = "block"; // Make the section visible
});