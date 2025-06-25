from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

load_dotenv()  # Loads .env with your GROQ_API_KEY

app = Flask(__name__)
CORS(app)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

@app.route("/review", methods=["POST"])
def review():
    data = request.get_json()
    title = data.get("title", "Untitled Problem")
    code = data.get("code", "")
    language = data.get("language", "cpp")

    prompt = [
        {
            "role": "system",
            "content": f"You are a helpful assistant that reviews {language.upper()} code for LeetCode problems."
        },
        {
            "role": "user",
            "content": f"Here's my {language.upper()} solution to \"{title}\". Please give a detailed review covering correctness, time/space complexity, and suggestions to improve the code."
        },
        {
            "role": "user",
            "content": f"```{language}\n{code}\n```"
        }
    ]

    try:
        res = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama3-8b-8192",
                "messages": prompt
            }
        )
        res.raise_for_status()
        return jsonify(res.json())
    except Exception as e:
        return jsonify({ "error": str(e) }), 500

if __name__ == "__main__":
    app.run(debug=True)
