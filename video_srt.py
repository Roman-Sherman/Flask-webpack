import json
import ffmpeg
import whisper
from moviepy.config import change_settings
from moviepy.editor import (
    TextClip, 
    CompositeVideoClip, 
    VideoFileClip, 
    ColorClip,
)

# Configure ImageMagick
change_settings({
    "IMAGEMAGICK_BINARY": r"C:\Program Files\ImageMagick-7.1.1-Q16-HDRI\magick.exe"
})

def extract_audio(video_filename):
    """Extract audio from video file and save as MP3."""
    audio_filename = video_filename.replace(".mp4", '.mp3')
    
    input_stream = ffmpeg.input(video_filename)
    audio = input_stream.audio
    output_stream = ffmpeg.output(audio, audio_filename)
    output_stream = ffmpeg.overwrite_output(output_stream)
    ffmpeg.run(output_stream)
    
    return audio_filename

def transcribe_audio(audio_filename):
    """Transcribe audio file using Whisper model."""
    model = whisper.load_model("base")
    result = model.transcribe(audio_filename, word_timestamps=True)
    
    wordlevel_info = []
    for segment in result['segments']:
        for word in segment['words']:
            wordlevel_info.append({
                'word': word['word'],
                'start': word['start'],
                'end': word['end']
            })
    
    return wordlevel_info

def split_text_into_lines(data, max_chars=30, max_duration=2.5, max_gap=1.5):
    """Split transcribed text into lines based on constraints."""
    subtitles = []
    line = []
    line_duration = 0
    
    for idx, word_data in enumerate(data):
        start = word_data["start"]
        end = word_data["end"]
        
        line.append(word_data)
        line_duration += end - start
        temp = " ".join(item["word"] for item in line)
        
        # Check constraints
        duration_exceeded = line_duration > max_duration
        chars_exceeded = len(temp) > max_chars
        if idx > 0:
            gap = word_data['start'] - data[idx-1]['end']
            maxgap_exceeded = gap > max_gap
        else:
            maxgap_exceeded = False
            
        if duration_exceeded or chars_exceeded or maxgap_exceeded:
            if line:
                subtitle_line = {
                    "word": " ".join(item["word"] for item in line),
                    "start": line[0]["start"],
                    "end": line[-1]["end"],
                    "textcontents": line
                }
                subtitles.append(subtitle_line)
                line = []
                line_duration = 0
    
    # Add remaining line if exists
    if line:
        subtitle_line = {
            "word": " ".join(item["word"] for item in line),
            "start": line[0]["start"],
            "end": line[-1]["end"],
            "textcontents": line
        }
        subtitles.append(subtitle_line)
    
    return subtitles

def create_caption(text_json, framesize, font="Arial", color='white', 
                  highlight_color='yellow', stroke_color='black', stroke_width=1,
                  position='bottom',fontsize=24):
    """Create caption clips with highlighting effect."""
    word_clips = []
    xy_textclips_positions = []
    
    x_pos = 0
    y_pos = 0
    line_width = 0
    frame_width, frame_height = framesize
    x_buffer = frame_width * 0.1
    max_line_width = frame_width - 2 * x_buffer
    print(fontsize)

    
    full_duration = text_json['end'] - text_json['start']
    
    for word_json in text_json['textcontents']:
        duration = word_json['end'] - word_json['start']
        
        # Create word clip and space clip
        word_clip = TextClip(
            word_json['word'],
            font=font,
            fontsize=fontsize,
            color=color,
            stroke_color=stroke_color,
            stroke_width=stroke_width
        ).set_start(text_json['start']).set_duration(full_duration)
        
        word_clip_space = TextClip(
            " ",
            font=font,
            fontsize=fontsize,
            color=color
        ).set_start(text_json['start']).set_duration(full_duration)
        
        word_width, word_height = word_clip.size
        space_width, space_height = word_clip_space.size
        
        # Check if word fits on current line
        if line_width + word_width + space_width <= max_line_width:
            new_x_pos = x_pos
            new_y_pos = y_pos
            x_pos += word_width + space_width
            line_width += word_width + space_width
        else:
            # Move to next line
            new_x_pos = 0
            new_y_pos = y_pos + word_height + 10
            x_pos = word_width + space_width
            line_width = word_width + space_width
            y_pos = new_y_pos
        
        # Store position information
        xy_textclips_positions.append({
            "x_pos": new_x_pos,
            "y_pos": new_y_pos,
            "width": word_width,
            "height": word_height,
            "word": word_json['word'],
            "start": word_json['start'],
            "end": word_json['end'],
            "duration": duration
        })
        
        # Position and append clips
        word_clip = word_clip.set_position((new_x_pos, new_y_pos))
        word_clip_space = word_clip_space.set_position((new_x_pos + word_width, new_y_pos))
        word_clips.extend([word_clip, word_clip_space])
    
    # Add highlighted words
    for highlight_word in xy_textclips_positions:
        word_clip_highlight = TextClip(
            highlight_word['word'],
            font=font,
            fontsize=fontsize,
            color=highlight_color,
            stroke_color=stroke_color,
            stroke_width=stroke_width
        ).set_start(highlight_word['start']).set_duration(highlight_word['duration'])
        
        word_clip_highlight = word_clip_highlight.set_position(
            (highlight_word['x_pos'], highlight_word['y_pos'])
        )
        word_clips.append(word_clip_highlight)
    
    return word_clips, xy_textclips_positions

def get_position_coordinates(clip_size, frame_size, position='bottom'):
    """Calculate coordinates for positioning the subtitle clip."""
    clip_width, clip_height = clip_size
    frame_width, frame_height = frame_size
    
    # Calculate x position (centered horizontally)
    x = (frame_width - clip_width) // 2
    
    # Calculate y position based on position parameter
    if position == 'top':
        y = int(frame_height * 0.1)  # 10% from top
    elif position == 'center':
        y = (frame_height - clip_height) // 2
    else:  # bottom (default)
        y = int(frame_height * 0.8)  # 20% from bottom
    
    return (x, y)

def srt_gen(video_filename, outputfile_name,style):
    """Main function to process video and add subtitles."""

    
    style=json.loads(style)

    



    # Extract audio and transcribe
    position=style['subtitlealignment']
    audio_filename = extract_audio(video_filename)
    wordlevel_info = transcribe_audio(audio_filename)
    
    # Save word-level info
    with open('data.json', 'w') as f:
        json.dump(wordlevel_info, f, indent=4)
    
    # Split into lines and create video
    linelevel_subtitles = split_text_into_lines(wordlevel_info)
    input_video = VideoFileClip(video_filename)
    frame_size = input_video.size
    
    all_linelevel_splits = []
    # Process each line
    for line in linelevel_subtitles:
        out_clips, positions = create_caption(line, frame_size,font=style['subtitlefontFamily'],color=style['subtitlefontColor'],highlight_color=style['subtitleHighlightColor'],stroke_color=style['subtitleOutlineColor'],stroke_width=float(style["strokethickness"]), position=style['subtitlealignment'],fontsize=float(style['subtitlefontScale']))
        
        # Calculate maximum dimensions
        max_width = max(pos['x_pos'] + pos['width'] for pos in positions)
        max_height = max(pos['y_pos'] + pos['height'] for pos in positions)
        
        # Create background color clip
        color_clip = ColorClip(
            size=(int(max_width * 1.1), int(max_height * 1.1)),
            color=(64, 64, 64)
        ).set_opacity(0.6)
        
        color_clip = color_clip.set_start(line['start']).set_duration(line['end'] - line['start'])
        
        # Create composite clip
        clip_to_overlay = CompositeVideoClip([color_clip] + out_clips)
        
        # Calculate position based on parameter
        clip_position = get_position_coordinates(
            clip_to_overlay.size, 
            frame_size, 
            position
        )
        clip_to_overlay = clip_to_overlay.set_position(clip_position)
        
        all_linelevel_splits.append(clip_to_overlay)
    
    # Create final video
    final_video = CompositeVideoClip([input_video] + all_linelevel_splits)
    final_video = final_video.set_audio(input_video.audio)
    
    # Write output
    final_video.write_videofile(
        outputfile_name,
        fps=24,
        codec="libx264",
        audio_codec="aac"
    )

