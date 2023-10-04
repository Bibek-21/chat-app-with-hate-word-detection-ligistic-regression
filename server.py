import joblib
import numpy as np

# Load the pre-trained model and vectorizer
model = joblib.load('./models/model')  # Change the path accordingly
vectorizer = joblib.load('./models/vector')  # Change the path accordingly

# Function to preprocess and predict hate speech
def predict_hate_speech(input_word):
    # Vectorize the input word using the same vectorizer used during training
    input_vector = vectorizer.transform([input_word])

    # Make a prediction
    prediction = model.predict(input_vector)

    return prediction[0]

# Test the model
word_to_check = "hoe"
is_hate_word = predict_hate_speech(word_to_check)

if is_hate_word:
    print(f"'{word_to_check}' is classified as a hate word.")
else:
    print(f"'{word_to_check}' is not classified as a hate word.")
