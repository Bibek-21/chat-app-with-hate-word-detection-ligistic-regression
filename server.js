const fs = require('fs');
const pickle = require('node-pickle');

// Function to preprocess and predict hate speech
function predictHateSpeech(inputWord) {
    // Load the pre-trained model and vectorizer from the local 'models' folder
    const modelBuffer = fs.readFileSync('./models/model');
    const vectorizerBuffer = fs.readFileSync('./models/vector');

    const model = pickle.load(modelBuffer);
    const vectorizer = pickle.load(vectorizerBuffer);

    // Vectorize the input word using the same vectorizer used during training
    const inputVector = vectorizer.transform([inputWord]);

    // Make a prediction
    const prediction = model.predict(inputVector);

    return prediction[0];
}

// Test the model
const wordToCheck = "fuck";

const isHateWord = predictHateSpeech(wordToCheck);

if (isHateWord) {
    console.log(`'${wordToCheck}' is classified as a hate word.`);
} else {
    console.log(`'${wordToCheck}' is not classified as a hate word.`);
}
