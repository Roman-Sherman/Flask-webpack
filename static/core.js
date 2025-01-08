//// Event listeners ////

const onPageShow = (event) => {
  if ('performance' in window) {
    const navEntry = performance.getEntriesByType('navigation')[0];

    if (navEntry) {
      if (event.persisted || navEntry.type === 'back_forward') {
        clearSearchStateFromStorage();
        return;
      }

      // Only check AdFly return for direct navigation or back/forward navigation
      if (navEntry.type === 'navigate') {
        try {
          handleRedirectionReturn();
        } catch (err) {
          showErrorMessage(err.message);
        }
      }
    }
  }
};

window.addEventListener('pageshow', onPageShow);

function showErrorMessage(message) {
  const errorLog = document.getElementById('error-log');
  errorLog.textContent = message;
  errorLog.style.display = 'block';
}

//// Main logic ////

/**
 * Restores the search state and page elements, then makes a generation request to the server.
 */
function handleGeneration() {
  return new Promise((resolve) => {
    const searchState = retrieveSearchState();
    if (!searchState) return;

    restoreSearchPageElements(searchState);
    restoreGlobals(searchState);

    setTimeout(() => {
      makeRequest();
      resolve();
    }, 10);
  });
}

/**
 * Called when the user successfully returns from an ad redirection.
 *
 * Checks if a redirection URL was pending and consumes it if generation was successful.
 */
function handleRedirectionReturn() {
  const pendingURL = localStorage.getItem('redirect.pending.url');
  const pendingTime = localStorage.getItem('redirect.pending.time');

  if (!pendingURL || !pendingTime) {
    return;
    // throw new Error(
    //   'Error handling redirection: There was no pending redirection'
    // );
  }

  const timeSinceRedirect = Date.now() - parseInt(pendingTime, 10);
  const fiveMinutes = 5 * 60 * 1000;

  if (timeSinceRedirect > fiveMinutes) {
    clearPendingUrl();

    throw new Error(
      'Error handling redirection: Redirection happened more than 5 minutes ago'
    );
  }

  handleGeneration()
    .catch((err) => {
      throw new Error('Error handling generation: ' + err);
    })
    .then(() => {
      consumeRedirectionUrl(pendingURL);
    })
    .finally(() => {
      clearSearchStateFromStorage();
    });
}

/**
 * Tries to redirect to an available URL.
 * If no URL is available, throws an error.
 */
function tryRedirect() {
  const url = pickAvailableUrl();

  if (!url) {
    throw new Error('No available redirection URLs. Please try again later.');
  }

  redirectToUrl(url);
}

//// Redirection URLs management ////

function clearPendingUrl() {
  localStorage.removeItem('redirect.pending.url');
  localStorage.removeItem('redirect.pending.time');
}

/**
 * @returns The list of URLS
 */
function getRedirectionUrls() {
  return [
    'https://adfly.co.il/qSW73dbxU6loTopaRwUO',
    'https://shrinkme.ink/M2ntjJW',
    'https://clk.kim/nJs2wq1G',
  ];
}

/**
 * Register an URL as consumed in the Local Storage. Also removes pending redirects.
 */
function consumeRedirectionUrl(url) {
  localStorage.setItem(
    `redirect.consumed[${btoa(url)}]`,
    Date.now().toString()
  );

  clearPendingUrl();
}

/**
 * @returns an available redirection URL at random
 */
function pickAvailableUrl() {
  const urls = getAvailableUrls();
  if (urls.length === 0) return null;

  const index = Math.floor(Math.random() * urls.length);
  return urls[index];
}

/**
 * Clears expired consumed URLs from Local Storage.
 */
function clearConsumedUrls() {
  getRedirectionUrls().forEach((url) => {
    const key = `redirect.consumed[${btoa(url)}]`;
    const lastConsumed = localStorage.getItem(key);
    if (!lastConsumed) return;

    const timeSinceConsumed = Date.now() - parseInt(lastConsumed, 10);
    const timeout = 24 * 60 * 60 * 1000; // 24 hours

    if (timeSinceConsumed > timeout) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Runs `clearConsumedUrls` and returns URLs available for consumption.
 */
function getAvailableUrls() {
  clearConsumedUrls();

  return getRedirectionUrls().filter((url) => {
    const key = `redirect.consumed[${btoa(url)}]`;
    const lastConsumed = localStorage.getItem(key);

    return lastConsumed === null;
  });
}

/**
 * Redirects to an URL and register it as pending.
 */
function redirectToUrl(url) {
  localStorage.setItem('redirect.pending.url', url);
  localStorage.setItem('redirect.pending.time', Date.now().toString());
  window.location.href = url;
}

//// Search state management ////

/**
 * Clears the search state and video from the Local Storage.
 */
function clearSearchStateFromStorage() {
  localStorage.removeItem('searchState');
  localStorage.removeItem('videoFileData');
}

/**
 * Restores the search page elements from the given search state.
 */
function restoreSearchPageElements(state) {
  restoreFormValues(state);
  restoreVideoFile(state);
}

/**
 * Restores the form values from the given search state.
 */
function restoreFormValues(state) {
  const userInput = document.getElementById('user-input');
  if (userInput) userInput.value = state.userInput;

  const variationsSelect = document.getElementById('variations-select');
  if (variationsSelect) variationsSelect.value = state.variations;
}

/**
 * Restores the video file from the given search state.
 *
 * The video file is stored as a base64 string in the Local Storage.
 * The file is then restored by creating a Blob and a File object.
 * The File object is then added to a DataTransfer object and assigned to the video file input.
 * This is done to avoid security restrictions on file inputs.
 */
function restoreVideoFile(state) {
  if (state.videoFile) {
    const videoFileData = localStorage.getItem('videoFileData');
    if (videoFileData) {
      const byteString = atob(videoFileData.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: 'video/mp4' });
      const file = new File([blob], 'video.mp4', { type: 'video/mp4' });

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const videoFileInput = document.getElementById('videoFile');
      if (videoFileInput) {
        videoFileInput.files = dataTransfer.files;
      }
    }
  }
}

/**
 * @returns The search state from the Local Storage
 */
function retrieveSearchState() {
  const searchState = localStorage.getItem('searchState');
  const state = JSON.parse(searchState);
  return state;
}

/**
 * Restores global variables and subtitle styles from the search state.
 *
 * @param {Object} state The search state
 */
function restoreGlobals(state) {
  // Restore global variables
  window.selectedModelType = state.selectedModelType;
  window.selectedStyle = state.selectedStyle;

  // Restore subtitle styles
  if (state.subtitleStyles) {
    window.SubtitleselectedStyles = state.subtitleStyles;
  }
}
