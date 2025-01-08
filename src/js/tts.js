let isRateLimited = false;
let isGenerating = false;
let rateLimitTimer;
let promptUniqueIndex = 1;

function debounceAndImmediateExecute(func, wait) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    const callNow = !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      timeout = null;
      if (!callNow) func.apply(context, args);
    }, wait);

    if (callNow) func.apply(context, args);
  };
}

// Convert a Blob to Base64 with error handling
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const errorLog = document.getElementById("error-log");
    try {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject("Failed to convert blob to Base64.");
      reader.readAsDataURL(blob);
    } catch (error) {
      errorLog.textContent = "Error: Failed to convert blob to Base64.";
      errorLog.style.display = "block";
      reject(error);
    }
  });
}

// Resize and convert image based on format and resolution with error handling
function resizeAndConvertImage(base64Image, format, width, height) {
  return new Promise((resolve, reject) => {
    const errorLog = document.getElementById("error-log");
    try {
      const img = new Image();
      img.src = base64Image;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to the desired format and return the new Base64 image
        const newBase64Image = canvas.toDataURL(`image/${format}`);
        resolve(newBase64Image);
      };

      img.onerror = () => reject("Error: Failed to load image for resizing.");
    } catch (error) {
      errorLog.textContent = "Error: Failed to resize and convert image.";
      errorLog.style.display = "block";
      reject(error);
    }
  });
}

function saveToLocalStorage(data) {
  const errorLog = document.getElementById("error-log");
  try {
    let archive = JSON.parse(localStorage.getItem("generationArchive")) || [];
    archive.push(data);
    localStorage.setItem("generationArchive", JSON.stringify(archive));
  } catch (error) {
    errorLog.textContent = "Error: Failed to save data to local storage.";
    errorLog.style.display = "block";
  }
}

function loadFromLocalStorage() {
  const errorLog = document.getElementById("error-log");
  try {
    return JSON.parse(localStorage.getItem("generationArchive")) || [];
  } catch (error) {
    errorLog.textContent = "Error: Failed to load data from local storage.";
    errorLog.style.display = "block";
    return [];
  }
}

function displayArchive() {
  const archiveContainer = document.getElementById("archiveContainer");
  const errorLog = document.getElementById("error-log");
  try {
    const archive = loadFromLocalStorage();
    archiveContainer.innerHTML = ""; // Clear the container before displaying

    archive.forEach((entry, index) => {
      // Clone the template for each archive entry
      const template = document
        .getElementById("archiveEntryTemplate")
        .content.cloneNode(true);

      const entryElement = template.querySelector(".archive-entry");
      const mediaContainer = entryElement.querySelector(".media-container");

      if (entry.mediaType === "audio") {
        const audioElement = document.createElement("audio");
        audioElement.controls = true;
        audioElement.src = entry.mediaUrl;
        mediaContainer.appendChild(audioElement);
      } else if (entry.mediaType === "image") {
        const imgElement = document.createElement("img");
        imgElement.style.maxWidth = "100%";
        imgElement.src = entry.mediaUrl;
        mediaContainer.appendChild(imgElement);

        // Attach format and resolution selection functionality
        const formatSelect = entryElement.querySelector(".formatSelect");
        const resolutionSelect =
          entryElement.querySelector(".resolutionSelect");

        // Add download functionality for the image
        const downloadButton = entryElement.querySelector(".download-btn");
        downloadButton.onclick = async () => {
          try {
            const selectedFormat = formatSelect.value;
            let selectedResolution = resolutionSelect.value;

            if (selectedResolution === "original") {
              selectedResolution = {
                width: imgElement.naturalWidth,
                height: imgElement.naturalHeight,
              };
            } else {
              selectedResolution = JSON.parse(selectedResolution); // Parse the resolution string back to an object
            }

            // Resize and convert the image to the selected format and resolution
            const newBase64Image = await resizeAndConvertImage(
              entry.mediaUrl,
              selectedFormat,
              selectedResolution.width,
              selectedResolution.height
            );

            // Create a download link and trigger the download
            const downloadLink = document.createElement("a");
            downloadLink.href = newBase64Image;
            downloadLink.download = `image_${index + 1}.${selectedFormat}`;
            downloadLink.click();
          } catch (error) {
            errorLog.textContent = "Error: Failed to download the image.";
            errorLog.style.display = "block";
          }
        };
      } else if (entry.mediaType === "text") {
        const textElement = document.createElement("div");
        textElement.textContent = entry.textContent;
        mediaContainer.appendChild(textElement);
      }

      // Attach remove button functionality
      const removeButton = entryElement.querySelector(".removeBtn");
      removeButton.onclick = () => {
        removeFromLocalStorage(index);
        displayArchive(); // Refresh archive display
      };

      // Append the entry to the archive container
      archiveContainer.appendChild(entryElement);
    });
  } catch (error) {
    errorLog.textContent = "Error: Failed to display archive.";
    errorLog.style.display = "block";
  }
}

function removeFromLocalStorage(index) {
  const errorLog = document.getElementById("error-log");
  try {
    let archive = loadFromLocalStorage();
    archive.splice(index, 1); // Remove the entry at the specified index
    localStorage.setItem("generationArchive", JSON.stringify(archive));
  } catch (error) {
    errorLog.textContent = "Error: Failed to remove data from local storage.";
    errorLog.style.display = "block";
  }
}

async function generateImages() {
  const errorLog = document.getElementById("error-log");

  if (isRateLimited || isGenerating) {
    errorLog.textContent = "Please try again.";
    errorLog.style.display = "block";
    return;
  }

  isGenerating = true;
  setGenerateButtonState(false);

  const userPrompt = document.getElementById("prompt").value.trim();
  const imageCount = parseInt(document.getElementById("image-count").value, 10);
  const imageContainer = document.getElementById("image-container");

  errorLog.style.display = "none"; // Hide the error log if generation proceeds
  errorLog.innerHTML = "";
  hideRateLimitMessage();
  imageContainer.innerHTML = "";

  try {
    if (!userPrompt) {
      throw new Error("Prompt cannot be empty. Please provide valid input.");
    }

    if (isNaN(imageCount) || imageCount <= 0) {
      throw new Error("Invalid image count. Please select a valid number.");
    }

    // Your generation logic here...
  } catch (error) {
    errorLog.textContent = error.message;
    errorLog.style.display = "block";
  } finally {
    isGenerating = false;
  }
}

document
  .getElementById("generateTTSBtn")
  .addEventListener("click", async () => {
    const errorLog = document.getElementById("error-log");
    errorLog.style.display = "none";
    errorLog.innerHTML = ""; // Clear previous errors

    let userText = document.getElementById("ttsInput").value;
    const audioCount = document.getElementById("audioCount").value;
    const model_type = document.getElementById("model_type").value;

    // Directly update the error log instead of using throw
    if (!userText) {
      errorLog.textContent = "Please enter some text!";
      errorLog.style.display = "block";
      return;
    }

    if (!audioCount || isNaN(audioCount) || audioCount <= 0) {
      errorLog.textContent = "Please enter a valid number for audio count.";
      errorLog.style.display = "block";
      return;
    }

    if (!model_type) {
      errorLog.textContent = "Please select a model type.";
      errorLog.style.display = "block";
      return;
    }

    try {
      // Enhance the prompt based on model type
      const enhancePrompt = async (userText, model_type) => {
        if (model_type == "image_gen") {
          return await enhancePromptImageGen(userText);
        } else if (model_type == "summarization") {
          return await enhancePromptSummarization(userText);
        } else {
          return userText;
        }
      };

      userText = await enhancePrompt(userText, model_type);

      // Make API request to Hugging Face
      const response = await fetch("/api/huggingface_call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          count: audioCount,
          userText: userText,
          model_type: model_type,
        }),
      });

      if (!response.ok) {
        errorLog.textContent = "Failed to fetch data from Hugging Face API.";
        errorLog.style.display = "block";
        return;
      }
      console.log(response)
      const results = await response.json();
      console.log(results);
      const audioContainer = document.getElementById("audioContainer");

      // Handle different result types
      const handleAudioResult = async (result, index, container) => {
        const mediaElement = document.createElement("audio");
        mediaElement.controls = true;
        mediaElement.src = result.base64;

        saveToLocalStorage({
          mediaType: "audio",
          mediaUrl: result.base64,
          date: new Date().toLocaleString(),
        });

        container.appendChild(mediaElement);
      };

      const handleImageResult = async (result, index, container) => {
        const mediaElement = document.createElement("img");
        mediaElement.style.maxWidth = "100%";
        mediaElement.src = result.base64;

        saveToLocalStorage({
          mediaType: "image",
          mediaUrl: result.base64,
          date: new Date().toLocaleString(),
        });

        container.appendChild(mediaElement);
      };

      const handleTextResult = (result, index, container) => {
        let textContent =
          `Summary ${index + 1}: ` +
          (result.content || JSON.stringify(result.content));

        saveToLocalStorage({
          mediaType: "text",
          textContent: textContent,
          date: new Date().toLocaleString(),
        });

        const textElement = document.createElement("div");
        textElement.textContent = textContent;
        container.appendChild(textElement);
      };

      const handleFallbackResult = (result, index, container) => {
        const fallbackElement = document.createElement("div");
        fallbackElement.textContent = `Result ${index + 1}: ` + String(result);
        container.appendChild(fallbackElement);
      };
      console.log(result)

      results.forEach(async (result, index) => {
        if (result.type.startsWith("audio")) {
            console.log('asd')
          handleAudioResult(result, index, audioContainer);
        } else if (result.type.startsWith("image")) {
            console.log('asd2')
          handleImageResult(result, index, audioContainer);
        } else if (result.type.startsWith("text")) {
            console.log('asd3')
          handleTextResult(result, index, audioContainer);
        } else {
            console.log('asd4')
          handleFallbackResult(result, index, audioContainer);
        }

        audioContainer.appendChild(
          document.createTextNode(`Variation ${index + 1}`)
        );
        audioContainer.appendChild(document.createElement("br"));
      });

      // Display archive
      displayArchive();
      showArchiveDropdown();
    } catch (error) {
      // Any unexpected errors are displayed here
      errorLog.textContent = "An unexpected error occurred.";
      errorLog.style.display = "block";
    }
  });

document.getElementById("toggleArchiveBtn").addEventListener("click", () => {
  const archiveContainer = document.getElementById("archiveContainer");
  const toggleButton = document.getElementById("toggleArchiveBtn");

  if (archiveContainer.style.display === "none") {
    archiveContainer.style.display = "block";
    toggleButton.textContent = "Hide Archive";
  } else {
    archiveContainer.style.display = "none";
    toggleButton.textContent = "Show Archive";
  }
});

function showArchiveDropdown() {
  const archiveContainer = document.getElementById("archiveContainer");
  const toggleButton = document.getElementById("toggleArchiveBtn");

  archiveContainer.style.display = "block";
  toggleButton.textContent = "Hide Archive";
}

window.onload = function () {
  displayArchive();
};
