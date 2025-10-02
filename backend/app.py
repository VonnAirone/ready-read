# backend/app.py
from faster_whisper import WhisperModel
from flask import Flask, request, jsonify
import os

app = Flask(__name__)
model = WhisperModel("small", device="cpu", compute_type="int8")

@app.route("/transcribe", methods=["POST"])
def transcribe():
    file = request.files["audio"]
    path = "temp.wav"
    file.save(path)

    segments, _ = model.transcribe(path)
    transcript = " ".join([segment.text for segment in segments])

    return jsonify({"transcript": transcript})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
