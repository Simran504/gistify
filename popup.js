// When user clicks "Summarize" button
document.getElementById("summarize-btn").addEventListener("click", () => {
    const resultDiv = document.getElementById("result");
    const summaryType = document.getElementById("summary-type").value;

    // Show loader while processing
    resultDiv.innerHTML = '<div class="loader"></div>';

    // Step 1: Retrieve user's Gemini API key from Chrome storage
    chrome.storage.sync.get(["geminiApiKey"], ({ geminiApiKey }) => {
        if (!geminiApiKey) {
            resultDiv.textContent = "No API key set. Click the gear icon to add one.";
            return;
        }

        // Step 2: Get text content from the current active tab using content script
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            chrome.tabs.sendMessage(
                tab.id,
                { type: "GET_ARTICLE_TEXT" },
                async ({ text }) => {
                    if (!text) {
                        resultDiv.textContent = "Couldn't extract text from this page.";
                        return;
                    }

                    // Step 3: Call Gemini API to summarize the text
                    try {
                        const summary = await getGeminiSummary(
                            text,
                            summaryType,
                            geminiApiKey
                        );
                        resultDiv.textContent = summary;
                    } catch (error) {
                        resultDiv.textContent = "Gemini error: " + error.message;
                    }
                }
            );
        });
    });
});

// Gemini API call to summarize article content
async function getGeminiSummary(rawText, type, apiKey) {
    const max = 25000; // Gemini input limit
    const text = rawText.length > max ? rawText.slice(0, max) + "..." : rawText;

    // Prompt variations based on summary type
    const promptMap = {
        short: `Summarize in less than 60 words : \n\n${text}`,
        detailed: `Give a detailed summary : \n\n${text}`,
        bullets: `Summarize in bullet points (start each line with "- ") : \n\n${text}`
    };

    const prompt = promptMap[type] || promptMap.short;

    // Make POST request to Gemini API
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            }),
        }
    );

    // Handle API errors
    if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error?.message || "request failed");
    }

    const data = await response.json();

    // Return the first candidate's content
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No Summary.";
}

// Copy to clipboard functionality
document.getElementById("copy-btn").addEventListener("click", () => {
    const text = document.getElementById("result").innerText;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById("copy-btn");
        const old = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = old), 2000); // Reset after 2s
    });
});
