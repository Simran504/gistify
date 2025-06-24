 document.addEventListener("DOMContentLoaded", ()=>{
    chrome.storage.sync.get(["geminiApiKey"], ({geminiApiKey})=>{
        if(geminiApiKey) 
            document.getElementById("api-key").value = geminiApiKey;
        if (geminiSavedAt) {
            const savedTime = new Date(geminiSavedAt).toLocaleString();
            document.getElementById("saved-at").textContent = `Last saved: ${savedTime}`;
        }

    });

    document.getElementById("save-btn").addEventListener("click", ()=>{
        const apiKey = document.getElementById("api-key").value.trim();
        if(!apiKey) return;

        chrome.storage.sync.set({geminiApiKey: apiKey, geminiSavedAt: Date.now()}, ()=>{
            document.getElementById("success-msg").style.display = "block";

            const savedTime = new Date().toLocaleString();
            document.getElementById("saved-at").textContent = `Last saved: ${savedTime}`;

            setTimeout(()=> window.close(), 1000);
        })
    })
 });

