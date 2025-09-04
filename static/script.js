// Get references to all the HTML elements
const promptInput = document.getElementById("promptInput");
const languageSelect = document.getElementById("languageSelect");
const generateButton = document.getElementById("generateButton");
const clearButton = document.getElementById("clearButton");
const loadingIndicator = document.getElementById("loadingIndicator");
const responseBox = document.getElementById("responseBox");
const copyButton = document.getElementById("copyButton");

// Function to handle the script generation
generateButton.addEventListener("click", async () => {
    const prompt = promptInput.value.trim();
    const language = languageSelect.value;
    
    // Disable the button and show the loading indicator
    generateButton.disabled = true;
    loadingIndicator.style.display = "block";
    responseBox.innerHTML = "<p>Generating...</p>"; // Display a message while loading
    copyButton.style.display = "none";

    if (prompt === "") {
        responseBox.innerHTML = "<p>Please enter a prompt.</p>";
        loadingIndicator.style.display = "none";
        generateButton.disabled = false;
        return;
    }

    try {
        const response = await fetch("/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: prompt, language: language }),
        });

        const data = await response.json();

        if (data.error) {
            responseBox.innerHTML = `<p class="text-red-400">Error: ${data.error}</p>`;
        } else {
            // Create a <pre><code> block for highlight.js
            const pre = document.createElement("pre");
            const code = document.createElement("code");
            
            // Set the language class for highlight.js
            if (language !== "none") {
                code.className = `language-${language}`;
            }

            // Set the code content
            code.textContent = data.script;

            // Clear the response box and append the new code block
            responseBox.innerHTML = "";
            pre.appendChild(code);
            responseBox.appendChild(pre);

            // Apply syntax highlighting
            hljs.highlightElement(code);
            
            // Show the copy button
            copyButton.style.display = "block";
        }
    } catch (error) {
        responseBox.innerHTML = `<p class="text-red-400">An unexpected error occurred. Please try again.</p>`;
        console.error("Fetch error:", error);
    } finally {
        // Re-enable the button and hide the loading indicator
        generateButton.disabled = false;
        loadingIndicator.style.display = "none";
    }
});

// Function to handle clearing the input and output
clearButton.addEventListener("click", () => {
    promptInput.value = "";
    languageSelect.value = "none";
    responseBox.innerHTML = "<p>Your generated script will appear here.</p>";
    copyButton.style.display = "none";
});

// Function to handle copying the script to the clipboard
copyButton.addEventListener("click", () => {
    const scriptText = responseBox.querySelector("code").textContent;
    navigator.clipboard.writeText(scriptText).then(() => {
        const originalText = copyButton.textContent;
        copyButton.textContent = "Copied!";
        setTimeout(() => {
            copyButton.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Could not copy to clipboard. Please try again.');
    });
});
