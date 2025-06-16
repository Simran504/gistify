 document.addEventListener("DOMContentLoaded", ()=>{
    chrome.storage.sync.get(["geminiApiKey"], ({geminiApikey})=>{
        if(geminiApikey) 
            document.getElementById("api-key").value = geminiApikey;
    });

    document.getElementById("save-btn").addEventListener("click", ()=>{
        const apiKey = document.getElementById("api-key").value.trim();
        if(!apiKey) return;

        chrome.storage.sync.set({geminiApikey: apiKey}, ()=>{
            document.getElementById("success-msg").style.display = "block";
            setTimeout(()=> window.close(), 1000);
        })
    })
 });

