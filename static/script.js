const promptInput = document.getElementById('promptInput');
const generateButton = document.getElementById('generateButton');
const responseBox = document.getElementById('responseBox');
const loadingIndicator = document.getElementById('loadingIndicator');

generateButton.addEventListener('click', async () => {
    const prompt = promptInput.value;
    if (!prompt) {
        // Use a custom message box instead of alert()
        responseBox.innerHTML = '<p class="text-red-400">Please enter a prompt.</p>';
        return;
    }

    // Disable button and show loading indicator
    generateButton.disabled = true;
    loadingIndicator.style.display = 'block';
    responseBox.innerHTML = 'Generating...';

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        if (data.error) {
            responseBox.innerHTML = `<p class="text-red-400">Error: ${data.error}</p>`;
        } else {
            responseBox.innerHTML = `<pre class="text-gray-200">${data.script}</pre>`;
        }

    } catch (error) {
        console.error('Fetch error:', error);
        responseBox.innerHTML = `<p class="text-red-400">An error occurred. Please try again.</p>`;
    } finally {
        // Re-enable button and hide loading indicator
        generateButton.disabled = false;
        loadingIndicator.style.display = 'none';
    }
});
