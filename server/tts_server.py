"""
Usha TTS Sidecar — Edge TTS Server
Provides high-quality, offline-capable text-to-speech via Microsoft Edge TTS.
Runs on port 5001, proxied by the Express backend.

Voices: en-IN-NeerjaNeural (Indian English), en-US-AriaNeural, en-US-JennyNeural, etc.
"""

import asyncio
import io
import json
import os
from flask import Flask, request, Response, jsonify
import edge_tts

app = Flask(__name__)

PORT = int(os.environ.get("TTS_SERVER_PORT", 8008))

# Available voices with metadata
VOICES = {
    "usha": "en-IN-NeerjaNeural",
    "aria": "en-US-AriaNeural",
    "jenny": "en-US-JennyNeural",
    "sonia": "en-GB-SoniaNeural",
    "natasha": "en-AU-NatashaNeural",
    "neerja": "en-IN-NeerjaNeural",
}

DEFAULT_VOICE = "en-IN-NeerjaNeural"


async def generate_speech(text: str, voice: str, rate: str = "+0%", pitch: str = "+0Hz") -> bytes:
    """Generate speech audio bytes using edge-tts."""
    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    audio_chunks = []
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_chunks.append(chunk["data"])
    return b"".join(audio_chunks)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "engine": "edge-tts", "voices": list(VOICES.keys())})


@app.route("/tts", methods=["POST"])
def tts():
    try:
        data = request.get_json(force=True)
        text = (data.get("text") or "").strip()
        if not text:
            return jsonify({"error": "text is required"}), 400

        # Truncate to reasonable length
        text = text[:3000]

        # Resolve voice name
        voice_key = (data.get("voice") or "usha").lower()
        voice = VOICES.get(voice_key, voice_key if "Neural" in voice_key else DEFAULT_VOICE)

        rate = data.get("rate", "+0%")
        pitch = data.get("pitch", "+0Hz")

        # Run async edge-tts in sync Flask context
        audio_bytes = asyncio.run(generate_speech(text, voice, rate, pitch))

        if not audio_bytes:
            return jsonify({"error": "TTS generation produced no audio"}), 500

        print(f"[EdgeTTS] voice={voice} chars={len(text)} bytes={len(audio_bytes)}")

        return Response(
            audio_bytes,
            mimetype="audio/mpeg",
            headers={
                "Content-Length": str(len(audio_bytes)),
                "Cache-Control": "no-cache",
                "X-TTS-Engine": "edge-tts",
                "X-TTS-Voice": voice,
            }
        )
    except Exception as e:
        print(f"[EdgeTTS] Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/voices", methods=["GET"])
def list_voices():
    """List available named voices."""
    return jsonify({
        "voices": [
            {"id": k, "name": v} for k, v in VOICES.items()
        ],
        "default": "usha"
    })


if __name__ == "__main__":
    print(f"[EdgeTTS] Usha TTS Sidecar starting on port {PORT}")
    print(f"[EdgeTTS] Default voice: {DEFAULT_VOICE}")
    app.run(host="0.0.0.0", port=PORT, debug=False, threaded=True)
