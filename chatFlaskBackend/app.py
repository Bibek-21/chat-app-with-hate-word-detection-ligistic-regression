from flask import Flask, request, jsonify
import pickle  # Used to load the pre-trained model
import numpy as np

app = Flask(__name__)

import os

curr_dir = os.getcwd()

model_dir = f"{curr_dir}/models/model"
vector_dir = f"{curr_dir}/models/vector"

# Load the pre-trained linear regression model
with open(os.path.relpath(model_dir), "rb") as model_file:
    model = pickle.load(model_file)

# Load the pre-trained word vector (if needed)
with open(os.path.relpath(vector_dir), "rb") as vector_file:
    vector = pickle.load(vector_file)


@app.route("/detect-hate-word", methods=["POST"])
def detect_hate_word():
    data = request.get_json()
    text = data.get("text", "")

    # Preprocess the input text and convert it to a numerical feature vector
    # If you have a word vector model, you can use it here
    # For simplicity, we'll just use the length of the text as a feature
    input_vector = vector.transform([text])

    # Use the pre-trained linear regression model to predict
    prediction = model.predict(input_vector)

    # Decide a threshold for classification (e.g., 0.5)
    is_hate_word = prediction > 0.5

    result = {
        "text": text if not is_hate_word else "*****",
        "is_hate_word": bool(is_hate_word),
    }

    return jsonify(result)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
