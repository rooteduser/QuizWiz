from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
import openai

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# Set your OpenAI API key
openai.api_key = "your-openai-api-key"

@app.route("/process-video", methods=["POST"])
def process_video():
    try:
        data = request.json
        youtube_url = data.get("url")

        if not youtube_url:
            return jsonify({"error": "No URL provided"}), 400

        # Extract the video ID from the YouTube URL
        video_id = youtube_url.split("v=")[-1].split("&")[0]

        # Fetch transcript using YouTubeTranscriptApi
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        text = " ".join([t["text"] for t in transcript])

        # Generate quiz questions using OpenAI API
        questions = generate_questions(text)

        return jsonify({"questions": questions}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def generate_questions(text):
    """
    Generate quiz questions using OpenAI API from the provided text.
    """
    try:
        # Use OpenAI to generate questions
        prompt = (
            f"Create 10 multiple-choice questions from the following transcript text:\n{text}"
        )
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=prompt,
            max_tokens=1500,
            n=1,
            stop=None,
            temperature=0.7,
        )
        questions = response["choices"][0]["text"].strip().split("\n")
        return questions
    except Exception as e:
        raise RuntimeError(f"Failed to generate questions: {str(e)}")


if __name__ == "__main__":
    app.run(debug=True)
