
import subprocess
import logging
from moviepy.editor import ImageClip, AudioFileClip
from PIL import Image, ImageDraw, ImageFont
import cv2

import io
import json


def mix_audio_files( tts_audio, music_audio, output_audio):
    """Mixes the TTS and music audio files using ffmpeg."""
    ffmpeg_command = f"ffmpeg -i {tts_audio} -i {music_audio} -filter_complex amix=inputs=2:duration=first:dropout_transition=2 -c:a libmp3lame {output_audio} -y"
    subprocess.call(ffmpeg_command, shell=True)


def save_audio( audio_file, content):
        """Save the audio content to a file."""
        with open(audio_file, 'wb') as aud_file:
            aud_file.write(content)


def process_audio_with_ffmpeg( input_audio, output_audio):
        """Process the audio using FFmpeg."""
        try:
            subprocess.run([
                'ffmpeg', '-i', input_audio, '-vn', '-ar', '44100', '-ac', '2', '-b:a', '192k', output_audio,"-y"
            ], check=True)
            logging.info(f"Audio processed successfully: {output_audio}")
        except subprocess.CalledProcessError as e:
            logging.error(f"Audio processing failed: {e}")

def download_image( content, filename):
        """Download and save image from the content."""
        try:
            image = Image.open(io.BytesIO(content))
            image.save(filename)
            logging.info(f"Image saved as {filename}")
        except Exception as e:
            logging.error(f"Failed to save image: {e}")


def combine_image_and_audio( image_file, audio_file, output_file):
        """Combine image and audio to create a video."""
        try:
            image_clip = ImageClip(image_file).set_duration(AudioFileClip(audio_file).duration)
            audio_clip = AudioFileClip(audio_file)
            video_clip = image_clip.set_audio(audio_clip)
            video_clip.write_videofile(output_file, codec="libx264", fps=24)
            logging.info(f"Video successfully created: {output_file}")
        except Exception as e:
            logging.error(f"Failed to create video: {e}")








def add_text_to_image(image_file, text, styles_json):
    """
    Add text to an image using OpenCV with customizable styles
    Parameters:
    image_file (str): Path to the image file
    text (str): Text to add to the image
    styles_json (str): JSON string containing style parameters
    """
    try:
        # Parse styles
        styles = json.loads(styles_json) if isinstance(styles_json, str) else styles_json
        
        # Read the image
        image = cv2.imread(image_file)
        if image is None:
            raise Exception("Could not load image")
        
        # Get image dimensions
        img_h, img_w = image.shape[:2]
        print(f"Image dimensions: {img_w}x{img_h}")
        
        # Get style parameters with explicit type conversion
        font_size = float(styles.get('fontScale', 30))  # Convert to float
        thickness = int(styles.get('thickness', 2))
        line_spacing = float(styles.get('lineSpacing', 1.5))
        
        # Convert colors from hex to BGR
        def hex_to_bgr(hex_color):
            hex_color = str(hex_color).lstrip('#')
            rgb = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
            return (rgb[2], rgb[1], rgb[0])  # Convert to BGR
        
        font_color = hex_to_bgr(styles.get('fontColor', '#FFFFFF'))
        outline_color = hex_to_bgr(styles.get('outlineColor', '#000000'))
        
        # Calculate font scale based on desired height in pixels
        base_font_size = 30.0  # This is what scale=1.0 corresponds to
        font_scale = font_size / base_font_size
        print(f"Initial font scale: {font_scale}")
        
        # Use cv2's font
        font = cv2.FONT_HERSHEY_SIMPLEX
        
        # Calculate text size and adjust scale if needed
        test_scale = font_scale
        while True:
            # Get text size for current scale
            (test_width, test_height), _ = cv2.getTextSize("Test", font, test_scale, thickness)
            if test_height <= img_h / 3:  # Limit text height to 1/3 of image height
                break
            test_scale *= 0.9
        
        font_scale = test_scale
        print(f"Adjusted font scale: {font_scale}")
        
        # Split text into lines that fit the image width
        words = text.split()
        lines = []
        current_line = []
        
        for word in words:
            current_line.append(word)
            test_line = ' '.join(current_line)
            (line_width, line_height), _ = cv2.getTextSize(test_line, font, font_scale, thickness)
            
            if line_width > img_w - 40:  # Leave 20px padding on each side
                if len(current_line) > 1:
                    lines.append(' '.join(current_line[:-1]))
                    current_line = [word]
                else:
                    lines.append(word)
                    current_line = []
        
        if current_line:
            lines.append(' '.join(current_line))
        
        # Calculate total text block height
        _, line_height = cv2.getTextSize("Test", font, font_scale, thickness)[0]
        line_height_pixels = int(line_height * line_spacing)
        total_height = line_height_pixels * len(lines)
        
        # Calculate starting Y position to center text block
        current_y = (img_h - total_height) // 2 + line_height
        
        # Draw each line of text
        for line in lines:
            # Get size for centering
            (line_width, _), _ = cv2.getTextSize(line, font, font_scale, thickness)
            
            # Calculate x position based on alignment
            alignment = str(styles.get('alignment', 'center')).lower()
            if alignment == 'center':
                x = (img_w - line_width) // 2
            elif alignment == 'left':
                x = 20
            else:  # right
                x = img_w - line_width - 20
            
            # Draw outline with increased thickness for better visibility
            if thickness > 0:
                outline_thickness = max(thickness + 2, 3)  # Ensure minimum outline thickness
                cv2.putText(image, line, (x, current_y), font, font_scale, outline_color, 
                           outline_thickness, cv2.LINE_AA)
            
            # Draw main text with original thickness
            cv2.putText(image, line, (x, current_y), font, font_scale, font_color, 
                       max(thickness, 1), cv2.LINE_AA)  # Ensure minimum text thickness
            
            # Move to next line
            current_y += line_height_pixels
        
        # Save the image
        cv2.imwrite(image_file, image)
        print("Image saved successfully")
        
    except Exception as e:
        print(f"Error in add_text_to_image: {str(e)}")
        raise