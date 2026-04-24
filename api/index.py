import os
import base64
import json
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

AZURE_SPEECH_KEY = os.environ.get("AZURE_SPEECH_KEY", "")
AZURE_SPEECH_REGION = os.environ.get("AZURE_SPEECH_REGION", "")


def _stt_endpoint() -> str:
    return (
        f"https://{AZURE_SPEECH_REGION}.stt.speech.microsoft.com"
        "/speech/recognition/conversation/cognitiveservices/v1"
        "?language=en-PH&format=detailed"
    )


@app.route("/api/azure/assess", methods=["POST"])
def azure_assess():
    if not AZURE_SPEECH_KEY or not AZURE_SPEECH_REGION:
        return jsonify({"error": "Azure Speech not configured on server"}), 503

    audio_file = request.files.get("audio")
    reference_text = request.form.get("referenceText", "")

    if not audio_file:
        return jsonify({"error": "Missing audio file"}), 400

    config_json = json.dumps({
        "ReferenceText": reference_text,
        "GradingSystem": "HundredMark",
        "Granularity": "Phoneme",
        "Dimension": "Comprehensive",
        "EnableMiscue": "True",
    })
    assessment_config = base64.b64encode(config_json.encode("utf-8")).decode("ascii")

    audio_bytes = audio_file.read()
    content_type = audio_file.content_type or "audio/webm; codecs=opus"

    try:
        resp = requests.post(
            _stt_endpoint(),
            headers={
                "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
                "Content-Type": content_type,
                "Accept": "application/json",
                "Pronunciation-Assessment": assessment_config,
            },
            data=audio_bytes,
            timeout=30,
        )
        resp.raise_for_status()
        return jsonify(resp.json())
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 502


@app.route("/api/azure/transcribe", methods=["POST"])
def azure_transcribe():
    if not AZURE_SPEECH_KEY or not AZURE_SPEECH_REGION:
        return jsonify({"error": "Azure Speech not configured on server"}), 503

    audio_file = request.files.get("audio")
    if not audio_file:
        return jsonify({"error": "Missing audio file"}), 400

    audio_bytes = audio_file.read()
    content_type = audio_file.content_type or "audio/webm; codecs=opus"

    try:
        resp = requests.post(
            _stt_endpoint(),
            headers={
                "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
                "Content-Type": content_type,
                "Accept": "application/json",
            },
            data=audio_bytes,
            timeout=30,
        )
        resp.raise_for_status()
        return jsonify(resp.json())
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 502
