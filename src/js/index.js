let selectedStyle = localStorage.getItem('selectedStyle') || 'detailed'; // Ensure it's globally defined with a default

document.addEventListener('DOMContentLoaded', () => {
  const menuIcon = document.getElementById('menu-icon');
  const dropdownMenu = document.getElementById('dropdown-menu');
  const videoFile = document.getElementById('videoFile');
  subtitleCardBtn = document.getElementById('subtitleCardtoggler');

  let detectMaliciousAttack = false;

  const fileInput = document.getElementById('file-input');
  const fileUploadIcon = document.getElementById('file-upload-icon');
  const imageUploadIcon = document.getElementById('image-upload-icon');

  const subtitleCheckboxDiv = document.getElementById('switch');
  const subtitleCheckbox = document.getElementById('subtitlebox');
  const userInput = document.getElementById('user-input');
  const addMusic = document.getElementById('musicbox');

  const outputDiv = document.getElementById('output');
  const searchIcon = document.querySelector('.search-icon');
  const styleIcon2 = document.getElementById('style-icon2');
  const variationsSelect = document.getElementById('variations-select');
  const variationsDropdown = document.querySelector('.variations-dropdown');
  const styleIcon = document.getElementById('style-icon');
  const styleDropdown = document.getElementById('style-dropdown');
  const styleDropdown2 = document.getElementById('style-dropdown2');

  const gen_img_tts_stext = document.getElementById('text-input');

  // Dropdown items for model selection
  const generateImages = document.getElementById('generate-images');
  const generateSummary = document.getElementById('generate-summary');
  const generateSubtitle = document.getElementById('generate-subtitle');

  const generateTTS = document.getElementById('generate-tts');
  const generateVideos = document.getElementById('generate-videos');
  const generateImageWithTTS = document.getElementById('generate-image-tts');
  const generateImageWithMusic = document.getElementById(
    'generate-image-music'
  );
  const texteditorCard = document.getElementById('font-style-edit');
  let selectedStyles = {};
  const imageRemoveCross = document.getElementById('image-remove-cross');
  const subtitleEditorStyle = document.getElementById('subtitle-style-edit');

  // Get values from the inputs and dropdowns
  selectedStyles = {
    fontFamily: document.getElementById('fontFamily').value,
    fontColor: document.getElementById('fontColor').value,
    outlineColor: document.getElementById('outlineColor').value,
    fontScale: document.getElementById('fontScale').value,
    thickness: document.getElementById('thickness').value,
    // lineSpacing: document.getElementById('lineSpacing').value,
    alignment: document.getElementById('alignment').value
  };

  SubtitleselectedStyles = {
    subtitlefontColor: document.getElementById('subtitlefontColor').value,
    subtitleHighlightColor: document.getElementById('subtitleHighlightColor')
      .value,
    subtitleOutlineColor: document.getElementById('subtitleOutlineColor').value,
    subtitlefontScale: document.getElementById('subtitlefontScale').value,
    strokethickness: document.getElementById('thickness').value,
    subtitlefontFamily: document.getElementById('subtitlefontFamily').value,

    // lineSpacing: document.getElementById('lineSpacing').value,
    subtitlealignment: document.getElementById('subtitlealignment').value
  };

  document.getElementById('applyButton').addEventListener('click', (event) => {
    for (let i of Object.keys(selectedStyles)) {
      console.log(i);
      selectedStyles[i] = document.getElementById(i).value;
    }
    texteditorCard.style.display = 'none';
  });
  document
    .getElementById('subtitleapplyButton')
    .addEventListener('click', (event) => {
      for (let i of Object.keys(SubtitleselectedStyles)) {
        console.log(i);
        SubtitleselectedStyles[i] = document.getElementById(i).value;
      }
      subtitleEditorStyle.style.display = 'none';
    });

  subtitleCheckbox.addEventListener('click', () => {
    if (subtitleCheckbox.checked) {
      subtitleCardBtn.style.display = 'block';
    } else {
      subtitleCardBtn.style.display = 'none';
    }
  });
  subtitleCardBtn.addEventListener('click', () => {
    subtitleEditorStyle.style.display = 'block';
  });

  // Retrieve the last selected model type, style, and variations count from localStorage
  let selectedModelType =
    localStorage.getItem('selectedModelType') || 'image_gen';
  let selectedVariations = localStorage.getItem('selectedVariations') || '1'; // Default to 1 variation
  let selectedStyle = localStorage.getItem('selectedStyle') || 'detailed'; // Default style

  variationsSelect.value = selectedVariations;

  // Toggle style dropdown visibility on clicking the style icon
  styleIcon.addEventListener('click', () => {
    styleDropdown.style.display =
      styleDropdown.style.display === 'block' ? 'none' : 'block';
  });
  // Toggle style dropdown visibility on clicking the style icon
  styleIcon2.addEventListener('click', () => {
    styleDropdown2.style.display =
      styleDropdown2.style.display === 'block' ? 'none' : 'block';
  });
  document.getElementById('style-change').addEventListener('click', () => {
    document.getElementById('font-style-edit').style.display = 'block';
  });

  // Close dropdown when clicking outside of it
  document.addEventListener('click', (event) => {
    if (
      !styleIcon.contains(event.target) &&
      !styleDropdown.contains(event.target)
    ) {
      styleDropdown.style.display = 'none';
    }
  });
  document.addEventListener('click', (event) => {
    if (
      !styleIcon2.contains(event.target) &&
      !styleDropdown2.contains(event.target)
    ) {
      styleDropdown2.style.display = 'none';
    }
  });
  document.getElementById('cancelButton').addEventListener('click', (event) => {
    texteditorCard.style.display = 'none';
  });
  document
    .getElementById('subtitlecancelButton')
    .addEventListener('click', (event) => {
      subtitleEditorStyle.style.display = 'none';
    });

  // Apply hover color and selected state to style dropdown items
  const applyHoverColorToSelectedStyle = (element) => {
    document
      .querySelectorAll('#style-dropdown .dropdown-item')
      .forEach((item) => {
        item.classList.remove('selected');
      });
    element.classList.add('selected');

    document
      .querySelectorAll('#style-dropdown2 .dropdown-item2')
      .forEach((item) => {
        item.classList.remove('selected');
      });
    element.classList.add('selected');
  };

  const textCheckbox = document.getElementById('textBox');
  const addTextInputbar = document.getElementById('addtext-bar');
  const addTextInput = document.getElementById('addtext-input');

  // Function to handle the state of the checkboxes
  function handleTextCheckboxChange() {
    // Show/hide the text input based on the textCheckbox state
    if (textCheckbox.checked) {
      addTextInputbar.style.display = 'flex';
    } else {
      addTextInputbar.style.display = 'none'; // Hide the text input
    }
  }

  // Event listener for the text checkbox
  textCheckbox.addEventListener('change', handleTextCheckboxChange);

  // Initial setup
  handleTextCheckboxChange();
  // Handle click on style dropdown items
  document
    .querySelectorAll('#style-dropdown .dropdown-item')
    .forEach((item) => {
      if (item.getAttribute('data-style') === selectedStyle) {
        applyHoverColorToSelectedStyle(item);
      }
      item.addEventListener('click', (event) => {
        selectedStyle = event.target.getAttribute('data-style');
        styleDropdown.style.display = 'none';
        localStorage.setItem('selectedStyle', selectedStyle);
        applyHoverColorToSelectedStyle(event.target);
      });
    });

  document
    .querySelectorAll('#style-dropdown2 .dropdown-item2')
    .forEach((item) => {
      if (item.getAttribute('data-style') === selectedStyle) {
        applyHoverColorToSelectedStyle(item);
      }
      item.addEventListener('click', (event) => {
        selectedStyle = event.target.getAttribute('data-style');
        styleDropdown2.style.display = 'none';
        localStorage.setItem('selectedStyle', selectedStyle);
        applyHoverColorToSelectedStyle(event.target);
      });
    });

  // Toggle file upload icon visibility based on model type
  const toggleFileUploadIcon = (modelType) => {
    if (
      modelType === 'summarization' ||
      modelType === 'tts' ||
      modelType === 'image_tts'
    ) {
      fileUploadIcon.style.display = 'inline-block';
    } else {
      fileUploadIcon.style.display = 'none';
    }
  };
  const toggleSubtitleUpload = (modelType) => {
    if (modelType === 'sub_gen') {
      userInput.style.display = 'none';
      videoFile.style.display = 'inline-block';
      subtitleCardBtn.style.display = 'block';
    } else {
      userInput.style.display = 'inline-block';
      videoFile.style.display = 'none';
      subtitleCardBtn.style.display = 'none';
    }
  };

  // Toggle style icon visibility based on model type
  const toggleStyleIcon = (modelType) => {
    if (modelType === 'image_gen') {
      styleIcon.style.display = 'inline-block';
    } else {
      styleIcon.style.display = 'none';
    }
  };
  const togglespeech = (modelType) => {
    const bar = document.getElementById('speech-bar');

    if (modelType === 'image_tts' || modelType === 'image_music') {
      bar.style.display = 'flex'; // Show the speech bar
    } else {
      bar.style.display = 'none'; // Hide the speech bar
    }
  };
  const toggleOption = (modelType) => {
    if (modelType === 'image_tts') {
      document.getElementById('text-checkbox-div').style.display = 'block';
      document.getElementById('Music-checkbox-div').style.display = 'block';
      document.getElementById('tts-checkbox-div').style.display = 'block';
      document.getElementById('sub-checkbox-div').style.display = 'block';
    } else if (modelType === 'image_gen' || modelType === 'sub_gen') {
      document.getElementById('text-checkbox-div').style.display = 'block';
      document.getElementById('Music-checkbox-div').style.display = 'none';
      document.getElementById('tts-checkbox-div').style.display = 'none';
      document.getElementById('sub-checkbox-div').style.display = 'none';
    } else {
      document.getElementById('text-checkbox-div').style.display = 'none';
      document.getElementById('Music-checkbox-div').style.display = 'none';
      document.getElementById('tts-checkbox-div').style.display = 'none';
      document.getElementById('sub-checkbox-div').style.display = 'none';
    }
  };
  //   const toggleSubtitle = (modelType) => {
  //     const bar = document.getElementById("speech-bar");

  //     if (modelType === "image_tts" ) {
  //         subtitleCheckboxDiv.style.visibility = "visible"; // Show the speech bar
  //     } else {
  //         subtitleCheckboxDiv.style.visibility = "hidden"; // Hide the speech bar
  //     }
  // };

  // Apply changes based on selected model type
  const applySelection = (modelType, element) => {
    if (modelType === 'image_gen') {
      variationsDropdown.style.display = 'block';
    } else {
      variationsDropdown.style.display = 'none';
    }

    toggleFileUploadIcon(modelType);
    toggleStyleIcon(modelType);
    togglespeech(modelType);
    toggleSubtitleUpload(modelType);
    toggleOption(modelType);
    // toggleSubtitle(modelType)

    selectedModelType = modelType;
    localStorage.setItem('selectedModelType', modelType);

    [
      generateImages,
      generateSummary,
      generateTTS,
      generateVideos,
      generateImageWithTTS,
      generateImageWithMusic,
      generateSubtitle
    ].forEach((item) => item.classList.remove('selected'));
    element.classList.add('selected');

    dropdownMenu.style.display = 'none';
  };

  const applyHoverColorToSelectedOption = (element) => {
    [
      generateImages,
      generateSummary,
      generateTTS,
      generateVideos,
      generateImageWithTTS,
      generateImageWithMusic,
      generateSubtitle
    ].forEach((item) => {
      item.style.backgroundColor = '';
      item.style.color = '';
    });
    element.style.backgroundColor = '#f1f3f4';
    element.style.color = '#202124';
  };

  if (selectedModelType === 'image_gen') {
    applySelection(selectedModelType, generateImages);
    applyHoverColorToSelectedOption(generateImages);
  } else if (selectedModelType === 'summarization') {
    applySelection(selectedModelType, generateSummary);
    applyHoverColorToSelectedOption(generateSummary);
  } else if (selectedModelType === 'tts') {
    applySelection(selectedModelType, generateTTS);
    applyHoverColorToSelectedOption(generateTTS);
  } else if (selectedModelType === 'video_gen') {
    applySelection(selectedModelType, generateVideos);
    applyHoverColorToSelectedOption(generateVideos);
    //added
  } else if (selectedModelType === 'image_tts') {
    applySelection(selectedModelType, generateImageWithTTS);
    applyHoverColorToSelectedOption(generateImageWithTTS);
  } else if (selectedModelType === 'sub_gen') {
    applySelection(selectedModelType, generateSubtitle);
    applyHoverColorToSelectedOption(generateSubtitle);
  } else if (selectedModelType === 'image_music') {
    applySelection(selectedModelType, generateImageWithMusic);
    applyHoverColorToSelectedOption(generateImageWithMusic);
  }

  variationsSelect.addEventListener('change', (event) => {
    selectedVariations = event.target.value;
    localStorage.setItem('selectedVariations', selectedVariations);
  });

  menuIcon.addEventListener('click', () => {
    dropdownMenu.style.display =
      dropdownMenu.style.display === 'block' ? 'none' : 'block';
  });

  // Trigger file input when file upload icon is clicked
  fileUploadIcon.addEventListener('click', () => {
    fileInput.click();
  });
  const imageInput = document.getElementById('image-input');
  imageUploadIcon.addEventListener('click', () => {
    imageInput.click();
  });
  imageRemoveCross.addEventListener('click', () => {
    // Clear the file input
    imageInput.value = '';

    // Reset the gen_img_tts_stext field
    gen_img_tts_stext.value = '';
    gen_img_tts_stext.disabled = false;

    // Hide the remove button
    imageRemoveCross.style.display = 'none';
  });
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  imageInput.addEventListener('change', async () => {
    const file = imageInput.files[0];
    if (file && file.type.startsWith('image/')) {
      try {
        // Convert image to base64
        const base64Image = await convertImageToBase64(file);

        // Display the image name in gen_img_tts_stext
        gen_img_tts_stext.value = file.name;
        gen_img_tts_stext.disabled = true;
        imageRemoveCross.style.display = 'block';

        // Store the base64 image data for later use
        window.currentImageData = {
          name: file.name,
          type: file.type,
          base64Data: base64Image
        };

        console.log('Image file loaded:', file.name);
      } catch (error) {
        console.error('Error processing image:', error);
      }
    } else {
      console.log('Please upload a valid image file.');
    }
  });

  // Handle file selection and insert content into input field
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const fileContent = event.target.result;

        // Insert the file content into the input field
        userInput.value = fileContent;

        console.log('File content added to input:', fileContent);
      };

      if (file.type === 'application/pdf') {
        reader.readAsArrayBuffer(file); // For PDFs
      } else {
        reader.readAsText(file); // For text, doc, etc.
      }
    }
  });

  const makeRequest = async () => {
    const text = userInput.value;
    const count = parseInt(variationsSelect.value, 10);
    const loader = document.getElementById('loader');
    const errorLog = document.getElementById('error-log');
    if (!text && selectedModelType != 'sub_gen') {
      errorLog.textContent = 'Please enter some text!';
      errorLog.style.display = 'block';
      return;
    } else {
      errorLog.textContent = '';
      errorLog.style.display = 'none';
    }
    loader.style.display = 'inline-block';
    let requestData;

    if (selectedModelType === 'image_gen') {
      // Pass the current selectedStyle here explicitly
      const enhancedPrompt = enhancePromptImageGen(text, selectedStyle);
      requestData = {
        userText: enhancedPrompt,
        count: count,
        addtext: addTextInput.value,
        textStyle: JSON.stringify(selectedStyles),
        model_type: selectedModelType
      };
    } else if (
      selectedModelType === 'image_tts' ||
      selectedModelType === 'image_music'
    ) {
      requestData = {
        userText: enhancePromptImageGen(gen_img_tts_stext.value, selectedStyle),
        speechText: text,
        textStyle: JSON.stringify(selectedStyles),
        addtext: addTextInput.value,
        subtileStyle: JSON.stringify(SubtitleselectedStyles),
        addMusic: addMusic.checked,
        subtitle: subtitleCheckbox.checked,
        selectedModelType: selectedModelType,
        image: window.currentImageData || null // Include image data if available
      };
    } else if (selectedModelType === 'sub_gen') {
    } else {
      requestData = {
        userText: text,
        subtileStyle: SubtitleselectedStyles,
        count: 1,
        model_type: selectedModelType
      };
    }

    if (
      selectedModelType == 'image_tts' ||
      selectedModelType == 'image_music'
    ) {
      fetch('/api/genimg_tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
        .then((response) => {
          if (!response.ok) {
            errorLog.textContent =
              'Failed to fetch data from the API. Please try again.' +
              response.message;
            errorLog.style.display = 'block';
            loader.style.display = 'none';
            return;
          }

          // Create a blob from the response
          return response.blob();
        })
        .then((videoBlob) => {
          // Create a URL for the video blob
          const videoUrl = URL.createObjectURL(videoBlob);

          // Create a video element to display the video
          const videoElement = document.createElement('video');
          videoElement.src = videoUrl;
          videoElement.controls = true; // Add controls to the video
          videoElement.style.width = '100%';
          videoElement.style.padding = '20px'; // Set width as needed
          videoElement.style.height = 'auto'; // Set height as needed

          // Clear previous content and display the new video
          const videoContainer = document.getElementById('videoContainer'); // Replace with your container ID

          videoContainer.appendChild(videoElement); // Append the video element

          // Hide loader
          loader.style.display = 'none';
        })
        .catch((error) => {
          console.error('Error:', error);
          errorLog.textContent =
            'An error occurred while processing the video.';
          errorLog.style.display = 'block';
          loader.style.display = 'none';
        });
    } else if (selectedModelType === 'sub_gen') {
      // Use files[0] to get the selected file

      // Create a new FormData object
      const formData = new FormData();
      let text_add = addTextInput.value;

      formData.append('video', videoFile.files[0]);
      formData.append('text', text_add);
      formData.append('subtitleStyle', JSON.stringify(SubtitleselectedStyles));

      fetch('/api/sub_gen', {
        method: 'POST',
        body: formData // Send video in FormData
      })
        .then((response) => {
          if (!response.ok) {
            errorLog.textContent =
              'Failed to fetch data from the API. Please try again.';
            errorLog.style.display = 'block';
            loader.style.display = 'none';
            return;
          }

          // Create a blob from the response
          return response.blob();
        })
        .then((videoBlob) => {
          // Create a URL for the video blob
          const videoUrl = URL.createObjectURL(videoBlob);

          // Create a video element to display the video
          const videoElement = document.createElement('video');
          videoElement.src = videoUrl;
          videoElement.controls = true; // Add controls to the video
          videoElement.style.width = '100%';
          videoElement.style.padding = '20px'; // Set width as needed
          videoElement.style.height = 'auto'; // Set height as needed

          // Clear previous content and display the new video
          const videoContainer = document.getElementById('videoContainer');
          videoContainer.innerHTML = ''; // Clear previous content
          videoContainer.appendChild(videoElement); // Append the video element

          // Hide loader
          loader.style.display = 'none';
        })
        .catch((error) => {
          console.error('Error:', error);
          errorLog.textContent =
            'An error occurred while processing the video.';
          errorLog.style.display = 'block';
          loader.style.display = 'none';
        });
    } else {
      fetch('/api/huggingface_call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
        .then((response) => {
          if (!response.ok) {
            errorLog.textContent =
              'Failed to fetch data from the API. Please try again.' +
              response.message;
            errorLog.style.display = 'block';
            loader.style.display = 'none';
            return;
          }
          return response.json();
        })
        .then((data) => {
          if (!data || data.length === 0) {
            errorLog.textContent = 'No data returned from the API.';
            errorLog.style.display = 'block';
            loader.style.display = 'none';
            return;
          }
          loader.style.display = 'none';
          const newImageContainer = document.createElement('div');
          newImageContainer.classList.add('output-images');

          if (selectedModelType === 'image_gen') {
            data.forEach((result) => {
              if (result.type.startsWith('image')) {
                const imgElement = document.createElement('img');
                imgElement.src = result.base64;
                imgElement.alt = 'Generated Image';
                newImageContainer.appendChild(imgElement);
              }
            });
            //added
          } else if (
            selectedModelType === 'image_tts' ||
            selectedModelType === 'image_music'
          ) {
            data.forEach((result) => {
              const videoUrl = URL.createObjectURL(blob);
              const videoElement = document.createElement('video');
              videoElement.src = videoUrl;
              videoElement.controls = true;
              videoElement.autoplay = false;
              newImageContainer.appendChild(videoElement);
            });
          } else {
            data.forEach((result) => {
              if (result.type === 'text') {
                newImageContainer.innerHTML += `<p>${result.content.summary_text}</p>`;
              } else if (result.type.startsWith('audio')) {
                newImageContainer.innerHTML += `<audio controls src="${result.base64}"></audio>`;
              }
            });
          }

          outputDiv.appendChild(newImageContainer);
          errorLog.textContent = '';
          errorLog.style.display = 'none';
        })
        .catch((error) => {
          errorLog.textContent =
            'An unexpected error occurred while fetching data. Please try again. ' +
            error.message;
          errorLog.style.display = 'block';
          loader.style.display = 'none';
        });
    }
  };
  generateImages.addEventListener('click', () => {
    applySelection('image_gen', generateImages);
    applyHoverColorToSelectedOption(generateImages);
  });

  generateSummary.addEventListener('click', () => {
    applySelection('summarization', generateSummary);
    applyHoverColorToSelectedOption(generateSummary);
  });

  generateTTS.addEventListener('click', () => {
    applySelection('tts', generateTTS);
    applyHoverColorToSelectedOption(generateTTS);
  });

  generateVideos.addEventListener('click', () => {
    applySelection('video_gen', generateVideos);
    applyHoverColorToSelectedOption(generateVideos);
  });

  //added
  generateImageWithTTS.addEventListener('click', () => {
    applySelection('image_tts', generateImageWithTTS);
    applyHoverColorToSelectedOption(generateImageWithTTS);
  });
  generateSubtitle.addEventListener('click', () => {
    applySelection('sub_gen', generateSubtitle);
    applyHoverColorToSelectedOption(generateSubtitle);
  });
  generateImageWithMusic.addEventListener('click', () => {
    applySelection('image_music', generateImageWithMusic);
    applyHoverColorToSelectedOption(generateImageWithMusic);
  });

  userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      detectMaliciousAttack = true;
      searchIcon.click();
    }
  });

  // Mark user-initiated click
  searchIcon.addEventListener('mousedown', () => {
    detectMaliciousAttack = true;
  });

  searchIcon.addEventListener('click', () => {
    if (detectMaliciousAttack === false) {
      console.warn('Click event was triggered programmatically and ignored.');
      return;
    }
    detectMaliciousAttack = false;
    // Redirect to Ad
    try {
      tryRedirect();
    } catch (error) {
      console.error('Error redirecting to Ad:', error);

      const errorLog = document.getElementById('error-log');
      errorLog.textContent = error.message;
      errorLog.style.display = 'block';
    }
    makeRequest();
  });

  document.addEventListener('click', (event) => {
    if (!dropdownMenu.contains(event.target) && event.target !== menuIcon) {
      dropdownMenu.style.display = 'none';
    }
  });

  toggleFileUploadIcon(selectedModelType);
  toggleStyleIcon(selectedModelType);
  toggleSubtitleUpload(selectedModelType);
  toggleOption(selectedModelType);
});

// Function to enhance the prompt based on the selected style
function enhancePromptImageGen(userText, selectedStyle) {
  const prompt = `${userText}`;

  switch (selectedStyle) {
    case 'detailed':
      return `An ultra-detailed, high-resolution image of ${prompt}. The image should be sharp, lifelike, with intricate textures, vivid colors, and a perfect representation of every aspect of the subject.`;
    case 'animated':
      return `A vibrant, animated-style illustration of ${prompt}. This image should feature bold, exaggerated elements, playful colors, and a unique flair that captures the subject in a fun, dynamic, and stylized way.`;
    case 'sketch':
      return `A finely detailed, pencil sketch of ${prompt}. This image should emphasize clean lines, intricate shading, and realistic proportions, creating a hand-drawn feel.`;
    case 'abstract':
      return `An abstract interpretation of ${prompt}. Use bold colors, unconventional shapes, and fluid composition to convey the essence of the subject rather than its literal form.`;
    case 'vintage':
      return `A vintage-style image of ${prompt}, with faded tones, sepia or black-and-white coloring, and a nostalgic, retro feel. The subject should evoke an old-time aesthetic with delicate textures.`;
    case 'cyberpunk':
      return `A high-tech, futuristic cyberpunk-style image of ${prompt}. Focus on neon lights, dark urban environments, and a gritty, dystopian aesthetic with technological elements.`;
    case 'minimalist':
      return `A minimalist representation of ${prompt}. Use simple lines, geometric shapes, and limited colors to create a clean and modern look. The image should focus on simplicity and elegance.`;
    case 'watercolor':
      return `A delicate watercolor painting of ${prompt}. The image should have soft edges, fluid blending of colors, and a gentle, organic feel.`;
    case 'low-poly':
      return `A low-poly, geometric representation of ${prompt}. The image should consist of sharp, angular shapes with vibrant color blocks, emphasizing form and structure over fine detail.`;
    default:
      return `A detailed image of ${prompt}.`;
  }
}
