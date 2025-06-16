document.getElementById("summarize-btn").addEventListener("click", ()=>{
    const resultDiv = document.getElementById("result");
    const summaryType = document.getElementById("summary-type").value;
    
    resultDiv.innerHTML = '<div class = "loader"></div>';

    // 1 - Get user's API key
    chrome.storage.sync.get(["geminiApiKey"], ({geminiApiKey}) =>{
        if(!geminiApiKey){
            resultDiv.textContent = "No API key set. Click the gear icon to add one.";
            return;
        }
        // 2 - Ask content.js for the page text
        chrome.tabs.query({active: true, currentWindow: true}, ([tab]) => {
            chrome.tabs.sendMessage(
                tab.id, 
                {type: "GET_ARTICLE_TEXT"}, 
                async ({text}) => {
                    if(!text){
                        resultDiv.textContent = "Couldn't extract text from this page.";
                        return;
                    }

                    // 3 - Send text to Gemini
                    try{
                    const summary = await getGeminiSummary(
                        text, 
                        summaryType, 
                        geminiApiKey
                    );

                    resultDiv.textContent = summary;
                }catch(error){
                        resultDiv.textContent = "Gemini error: " + error.message;
                    }
            });
        });
    });
});

// Gemini API call
async function getGeminiSummary(rawText, type, apiKey) {
    const max = 25000;
    const text = rawText.length > max ? rawText.slice(0, max) + "..." : rawText;

    const promptMap = {
        short: `Summarize in less than 60 words : \n\n${text}`,
        detailed: `Give a detailed summary : \n\n${text}`,
        bullets: `Summarize in bullet points (start each line with "- ") : \n\n${text}`
    };

    const prompt = promptMap[type] || promptMap.short;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{text: prompt}]
                }]                
            }),
        }
    );

    if(!response.ok){
        const{error} = await response.json();
        throw new Error(error?.message || "requesr failed");
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No Summary.";
}
