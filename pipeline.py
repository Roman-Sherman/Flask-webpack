import os
import string
import datetime
import requests
from utils import *
from video_srt import srt_gen
import time
from dotenv import load_dotenv
import random
import logging

# Configure logging for easy debugging and tracking
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


class ImageAndSpeech:
    def __init__(self):
        load_dotenv()
        self.API_KEY = os.getenv("HUGGINGFACE_API_KEY")
        self.response_times = {}
        self.temp_audio = []

        # Set color codes for logging or terminal output
        self.BLUE = "\033[034m"
        self.GREEN = "\033[92m"
        self.RED = "\033[31m"
        self.RESET = "\033[0m"

    def get_random_char(self):
        """Generate a random character for filenames."""
        return random.choice(string.ascii_letters + string.digits)

    def huggingface_call(self, count, user_text, model_type,textStyle, addtext=None):
        """
        Make calls to Hugging Face API with support for adding text overlay to generated images.
        
        Args:
            count (int): Number of results to generate
            user_text (str): Input text for the model
            model_type (str): Type of model to use (image_gen, tts, etc.)
            addtext (str, optional): Text to overlay on generated images
        """
        models = {
            "image_gen": [
                "CompVis/stable-diffusion-v1-4",
                "stabilityai/stable-diffusion-2",
                "runwayml/stable-diffusion-v1-5"
            ],
            "tts": [
                "espnet/kan-bayashi_ljspeech_vits",  
                "facebook/fastspeech2-en-ljspeech",
                "tts_models/en/ljspeech/tacotron2-DDC",
                "microsoft/speecht5_tts"
            ],
            "summarization": [
                "facebook/bart-large-cnn",
                "sshleifer/distilbart-cnn-12-6",
                "philschmid/bart-large-cnn-samsum"
            ],
            "video_gen": [
                "facebook/musicgen-small",
                "runwayml/stable-diffusion-v1-5-video"
            ]
        }

        selected_models = models.get(model_type, [])
        results = []

        # If model_type is tts, keep input clean, otherwise append datetime and random char
        text_input = user_text if model_type == "tts" else f"{user_text}_{datetime.datetime.now().isoformat()}_{self.get_random_char()}"

        response, model, duration = self.try_models(selected_models, text_input)
        if not model:
            return [None] * count

        # Process the first response
        if model_type == "image_gen" and response and response.status_code == 200:
            # Save the image to a temporary file
            temp_image = f"temp_image_{self.get_random_char()}.png"
            with open(temp_image, 'wb') as img_file:
                img_file.write(response.content)
            
            # Add text if specified
            if addtext:
                
                add_text_to_image(temp_image, addtext,textStyle)
            
            # Read the processed image back
            with open(temp_image, 'rb') as img_file:
                response._content = img_file.read()
            
            # Clean up temporary file
            if os.path.exists(temp_image):
                os.remove(temp_image)

        self.response_times[model_type] = {"current": model, "last": duration}
        results.append(response)

        # Process additional responses if count > 1
        for _ in range(1, count):
            text_input = user_text if model_type == "tts" else f"{user_text}_{datetime.datetime.now().isoformat()}_{self.get_random_char()}"
            response, duration = self.huggingface_request(model, text_input)
            
            if response:
                if model_type == "image_gen" and response.status_code == 200:
                    # Save the image to a temporary file
                    temp_image = f"temp_image_{self.get_random_char()}.png"
                    with open(temp_image, 'wb') as img_file:
                        img_file.write(response.content)
                    
                    # Add text if specified
                    if addtext:
                        add_text_to_image(temp_image, addtext)
                    
                    # Read the processed image back
                    with open(temp_image, 'rb') as img_file:
                        response._content = img_file.read()
                    
                    # Clean up temporary file
                    if os.path.exists(temp_image):
                        os.remove(temp_image)
                        
                self.response_times[model_type] = {"current": model, "last": duration}
            results.append(response)

        return results


    def try_models(self, models, user_text, model_index=0):
        """Try multiple models from Hugging Face, return the first successful response."""
        if model_index >= len(models):
            logging.error("All models failed.")
            return None, None, None

        model = models[model_index]
        response, duration = self.huggingface_request(model, user_text)

        if response and response.status_code == 200:
            return response, model, duration
        else:
            return self.try_models(models, user_text, model_index + 1)

    def huggingface_request(self, model, text, retries=3):
        """Handle the API request to Hugging Face with retry logic."""
        for attempt in range(retries):
            try:
                logging.info(f"Sending request to model: {model}")
                start = time.time()
                res = requests.post(
                    f"https://api-inference.huggingface.co/models/{model}",
                    headers={"Authorization": f"Bearer {self.API_KEY}"},
                    json={"inputs": text}
                )
                duration = time.time() - start

                if res.status_code == 200:
                    logging.info(f"Request succeeded for model: {model}")
                    return res, duration
                else:
                    logging.warning(f"Request failed for model: {model} with status code {res.status_code}")

            except requests.RequestException as e:
                logging.error(f"Request failed for model {model}: {e}")
                if attempt < retries - 1:
                    logging.info(f"Retrying request... (Attempt {attempt + 1}/{retries})")
                    time.sleep(1)  # Delay before retrying

        return None, None
    
    
   
    


    def img_tts_gen(self, prompt, speechText, selectedModelType, subtitle,textStyle,addSpeech=False, addMusic=False,addtext=None,image=None,subtitleStyle=None):
        if selectedModelType == "image_tts":
            type_of = "tts"
        else:
            type_of = "video_gen"
            
        """Generates an image and TTS output, then combines them into a video."""
        logging.info("Generating image...")
        image_file = "generated_image.png"

        if image == None:
            image_result = self.huggingface_call(1, prompt, "image_gen",textStyle)
            if not image_result or image_result[-1].status_code != 200:
                logging.error("Image generation failed.")
                return None

            image_url = image_result[-1].content
            download_image(image_url, image_file)
        if addtext:
            print(textStyle)
            add_text_to_image(image_file,addtext,textStyle)

        # Speech generation (TTS)
        logging.info("Generating speech...")
        tts_result = self.huggingface_call(1, speechText, type_of,textStyle)
        if not tts_result or tts_result[-1].status_code != 200:
            logging.error("Speech generation failed.")
            self.cleanup_files([image_file])
            return None

        audio_content = tts_result[-1].content
        audio_file = "speech_audio.mp3"
        
        save_audio(audio_file, audio_content)

        # Generate music if addMusic is True
        if addMusic:
            logging.info("Generating background music...")
            music_result = self.huggingface_call(1, prompt, "video_gen")  # Assuming "video_gen" can generate music
            if not music_result or music_result[-1].status_code != 200:
                logging.error("Music generation failed.")
                self.cleanup_files([image_file, audio_file])
                return None

            music_content = music_result[-1].content
            music_file = "background_music.mp3"
            save_audio(music_file, music_content)

            # Mix the TTS output with the background music
            logging.info("Mixing speech and music...")
            mixed_audio_file = "mixed_audio.mp3"
            mix_audio_files(tts_audio=audio_file, music_audio=music_file, output_audio=mixed_audio_file)
        else:
            mixed_audio_file = audio_file

        # Process and combine image/audio into video
        output_audio = "processed_audio.mp3"
        process_audio_with_ffmpeg(mixed_audio_file, output_audio)

        logging.info("Combining image and speech/music into video...")
        output_video = "output.mp4"
        combine_image_and_audio(image_file, output_audio, output_video)
        print(subtitle)

        # Generate subtitles
        if subtitle:
            srt_gen(output_video, output_video,subtitleStyle)

        self.cleanup_files([image_file, audio_file, output_audio])
        if addMusic:
            self.cleanup_files([music_file, mixed_audio_file])
            
        return output_video
 

    def cleanup_files(self, files):
        """Remove temporary files."""
        for file in files:
            if os.path.exists(file):
                try:
                    os.remove(file)
                    logging.info(f"Removed temporary file: {file}")
                except Exception as e:
                    logging.error(f"Failed to remove file {file}: {e}")

    