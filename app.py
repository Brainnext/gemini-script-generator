import os
import google.generativeai as genai
from flask import Flask, render_template, request, jsonify

# Configure the Flask application
app = Flask(__name__)

# Configure Gemini API
# The API key should be set as an environment variable
try:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
except KeyError:
    print("WARNING: GEMINI_API_KEY environment variable not set. The API will not work.")
    print("Please set your API key using `export GEMINI_API_KEY='YOUR_API_KEY'`")
    genai.configure(api_key="DEMO_KEY") # Use a placeholder for the demo

@app.route("/")
def home():
    """Serves the main HTML page from the templates folder."""
    return render_template("index.html")

@app.route("/generate", methods=["POST"])
def generate_script():
    """
    Receives a prompt from the frontend and uses Gemini to generate a script.
    """
    data = request.get_json()
    prompt = data.get("prompt")

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400
    
    # Check if the API key is valid before making the request
    if os.environ.get("GEMINI_API_KEY", "DEMO_KEY") == "DEMO_KEY":
        return jsonify({"error": "Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable."}), 500

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # Add a system instruction to guide the model's behavior
        system_instruction = ("You are a world-class code and script generator. "
                              "Respond with only the requested script, formatted with proper syntax highlighting. "
                              "Do not include any conversational text, explanations, or introductory phrases. "
                              "For example, if asked for a Python script, provide only the Python code block.")
        
        # Combine the user prompt with the system instruction
        full_prompt = (f"System Instruction: {system_instruction}\n\n"
                       f"User Prompt: {prompt}")

        response = model.generate_content(full_prompt)
        
        # Extract the generated text, ensuring it handles potential errors
        script_text = response.text if response and response.text else "Error: No script generated. Please try a different prompt."
        
        return jsonify({"script": script_text})
    except Exception as e:
        print(f"Error generating content: {e}")
        return jsonify({"error": f"Failed to generate script: {str(e)}"}), 500

if __name__ == "__main__":
    # Use a port that is typically available for web servers
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
