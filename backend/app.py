from flask import Flask, request, jsonify
from flask_cors import CORS
from phi.agent import Agent
from phi.model.google import Gemini
import google.generativeai as genai
import whisper
from googletrans import Translator
import tempfile
import os
import shutil
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)

app = Flask(__name__)
CORS(app)

# Initialize AI Agent
agent = Agent(
    name="Content Caption Generator",
    model=Gemini(id="gemini-2.0-flash-exp"),
    markdown=True,
)

model = whisper.load_model("base")

@app.route("/generate-captions", methods=["POST"])
def generate_captions():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        file_type = request.form.get("fileType", "image")
        tone = request.form.get("tone", "casual")
        length = request.form.get("length", "medium")
        hashtag_count = int(request.form.get("hashtagCount", 5))

        # Save uploaded file
        temp_dir = tempfile.mkdtemp()
        file_path = os.path.join(temp_dir, file.filename)
        file.save(file_path)

        try:
            # Analyze content
            content_description = ""
            if file_type == "video":
                result = model.transcribe(file_path)
                content_description = f"""
                Video Content Analysis:
                Transcription: {result['text']}
                """
            else:
                image = genai.upload_file(file_path)
                description_prompt = """
                Analyze this image in detail. Consider:
                1. Main subjects/people
                2. Actions/activities
                3. Setting/location
                4. Mood/atmosphere
                5. Colors and visual elements
                6. Any text or significant details
                """
                description_response = agent.run(description_prompt, images=[image])
                content_description = f"""
                Image Content Analysis:
                {description_response.content}
                """

            # Define length guides
            length_guides = {
                "short": "Keep captions between 50-80 characters",
                "medium": "Keep captions between 120-150 characters",
                "long": "Keep captions between 200-250 characters"
            }

            # Define tone guides with natural examples
            tone_guides = {
                "formal": {
                    "style": "Polished, respectful, and business-like. Focus on professionalism and clear communication.",
                    "examples": [
                        "This serene landscape showcases the beauty of nature's harmony.",
                        "An extraordinary event that highlights collaboration and shared success.",
                        "A timeless architectural marvel, exemplifying elegance and precision."
                    ]
                },
                "casual": {
                    "style": "Relaxed, conversational, and relatable. Use light emojis and everyday language.",
                    "examples": [
                        "Weekend vibes: A little coffee, a little sunshine, and a lot of good energy! ☀️☕",
                        "Just me, my favorite book, and the sound of rain. Couldn't ask for more 🌧️📚",
                        "When life gives you sunsets, you just sit back and enjoy 🌅"
                    ]
                },
                "professional": {
                    "style": "Inspiring, empowering, and goal-oriented. Focus on achievement and growth.",
                    "examples": [
                        "Breaking barriers and building a legacy – one step at a time. 💼",
                        "Success begins with a vision and grows through persistence and teamwork.",
                        "Shaping the future by embracing challenges and fostering innovation."
                    ]
                },
                "friendly": {
                    "style": "Warm, engaging, and community-oriented. Encourage interaction and build connection.",
                    "examples": [
                        "Sharing this little slice of joy with you all! What's bringing you happiness today? 💛",
                        "This place has a piece of my heart ❤️ What's your favorite escape spot? 🌍",
                        "Moments like these are best enjoyed with friends. Who would you bring here? 👫"
                    ]
                },
                "humorous": {
                    "style": "Playful, witty, and fun. Use creative wordplay and appropriate emojis.",
                    "examples": [
                        "When life gives you lemons, trade them for pizza 🍕✨ Priorities, am I right?",
                        "Caught mid-dance move... The floor wasn't ready for my talent 💃🔥",
                        "If at first you don't succeed, order dessert and call it a win 🍰🎉"
                    ]
                }
            }

            # Generate captions with natural style
            caption_prompt = f"""
            Based on this content:
            {content_description}

            Generate 5 unique {tone.upper()} captions that sound natural and engaging.
            
            Tone Style: {tone_guides[tone]['style']}
            
            Here are examples of the tone to match:
            {tone_guides[tone]['examples']}

            Requirements:
            1. Match the natural style of the example captions above
            2. Include exactly {hashtag_count} relevant hashtags at the end
            3. Keep length {length} ({length_guides[length]})
            4. Use appropriate emojis where they feel natural
            5. Make each caption unique and engaging
            6. For friendly tone, include engaging questions
            7. For humorous tone, include witty observations
            8. For formal tone, maintain professionalism
            
            Format each caption like this:
            • [Natural caption with emojis if appropriate] #Hashtag1 #Hashtag2 ...
            """

            response = agent.run(caption_prompt)
            return jsonify({"captions": response.content})

        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == "__main__":
    app.run(debug=True)
