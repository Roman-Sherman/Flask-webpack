import os
# import random
import tempfile
# import string
# import time
import base64
import shutil
from video_srt import srt_gen
# from datetime import datetime
# import requests
from flask import Flask, jsonify, request, send_from_directory,send_file, render_template
from flask_cors import CORS
import logging

import io
from pipeline import ImageAndSpeech
# from dotenv import load_dotenv

# load_dotenv()
# API_KEY = os.getenv("HUGGINGFACE_API_KEY")
app = Flask(__name__, template_folder='templates',
    static_folder='instance/static')

CORS(app, resources={r"/*": {"origins": "*"}})
huggingface_call=ImageAndSpeech().huggingface_call
img_tts_gen=ImageAndSpeech().img_tts_gen


BLUE = "\[\033[0;34m"
Green = "\033[92m"
Red = "\033[31m"
RESET = "\033[0m"



@app.route("/")
def serve_frontend():
    return render_template("index.html")

@app.route("/<path:path>")
def serve_static_files(path):
    return send_from_directory("static", path)

@app.route("/api/genimg_tts", methods=["POST"])
def gen_img_tts():
    data = request.json
    prompt = data.get("userText")
    speech_text = data.get("speechText")
    textStyle=data.get("textStyle")
    selected_model_type = data.get("selectedModelType")
    addMusic=data.get("addMusic")
    addtext=data.get("addtext")
    subtitle=data.get("subtitle")
    subtitleStyle=data.get("subtileStyle")
    image=data.get("image")

    if image and isinstance(image, dict):
        try:
                # Extract base64 data
                base64_data = image.get('base64Data')
                if base64_data:
                    # Remove data URL prefix if present
                    if ',' in base64_data:
                        base64_data = base64_data.split(',')[1]
                    
                    # Decode base64 to binary
                    image_binary = base64.b64decode(base64_data)
                    
                    with open("generated_image.png", 'wb') as f:
                        f.write(image_binary)

                    print("Image saved succesfully")
                    
                    # Create a temporary file for the image
        except Exception as e:
                
                print(f"Error processing image: {e}")
                return jsonify({"error": "Invalid image data"}), 400
                
    
    video_file = img_tts_gen(prompt, speech_text, selected_model_type,subtitle,textStyle,addMusic=addMusic,addtext=addtext,image=image,subtitleStyle=subtitleStyle)
    if video_file:
        try:
            with open(video_file, 'rb') as f:
                video_data = f.read()
            os.remove(video_file)  # Remove the temporary file
            return send_file(
                io.BytesIO(video_data),
                mimetype='video/mp4',
                as_attachment=True,
                download_name='generated_video.mp4'
            )
        except Exception as e:
            print(f"{Red}Error: {e}{RESET}")
            return jsonify({"error": "Failed to send video"}), 500
    else:
        return jsonify({"error": "Failed to generate video"}), 500
            



@app.route("/api/sub_gen", methods=["POST"])
def sub_gen():
    data = request.files
    video = data.get("video")
    text = request.form.get("text")
    subtitle=request.form.get("subtitleStyle")


    if not video or video.filename == '':
        return jsonify({"error": "No selected video"}), 400

    # Use tempfile to create a temporary directory
    temp_dir = tempfile.mkdtemp()  # Create a temporary directory
    try:
        # Save the video temporarily
        video_path = os.path.join(temp_dir, "input_video.mp4")
        video.save(video_path)
        output_video_path = os.path.join(temp_dir, "output.mp4")
        print(text)

        # if text != '':
        #     add_text_to_video(video_path,output_video_path,text)

        # Path for the output video

        # Process the video to add subtitles
        srt_gen(video_path
                , output_video_path,subtitle)
        # output_video_path= addtext(output_video_path,text=text)
        # if text != '':
        #     add_text_to_video(output_video_path,output_video_path,text)

        # Check if the processed video file exists
        if not os.path.exists(output_video_path):
            return jsonify({"error": "Video processing failed"}), 500

        # Return the video with subtitles to the client
        return send_file(
            output_video_path,
            mimetype='video/mp4',
            as_attachment=True,
            download_name='video_with_subtitles.mp4'
        )
    except Exception as e:
        logging.error(f"An error occurred during processing: {str(e)}")
        return jsonify({"error": f"An error occurred during processing: {str(e)}"}), 500
    finally:
        # Cleanup the temporary directory
        shutil.rmtree(temp_dir, ignore_errors=True)


    


@app.route("/api/huggingface_call", methods=["POST"])
def handle_huggingface_call():
    data = request.json
    addtext=data.get("addtext")
    textStyle=data.get("textStyle")

    count, user_text, model_type = data.get("count", 1), data.get("userText", ""), data.get("model_type", "default-model")
    
    try:
       
        

        responses = huggingface_call(count, user_text, model_type,textStyle,addtext=addtext)
        results = [
            {
                "type": "text" if r and r.headers.get("content-type") == "application/json" else r.headers.get("content-type"),
                "content": r.json()[0] if r and r.headers.get("content-type") == "application/json" else (r.content if r else None)
            } for r in responses
        ]
        print("result created ")
        structured_results = [
            {
                "type": res["type"],
                "base64": f"data:{res['type']};base64,{base64.b64encode(res['content']).decode()}"
            } if isinstance(res["content"], bytes) else res
            for res in results if res["content"]
        ]
        return jsonify(structured_results), 200

    except Exception as e:
        print(f"{Red}Error: {e}{RESET}")
        return jsonify({"error": "Something went wrong"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 3000)), debug=True)