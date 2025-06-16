document.getElementById("summarize-btn").addEventListener("click", ()=>{
    const result = document.getElementById("result");
    result.textContent = "Extracting content....";

    chrome.tabs.query({active: true, currentWindow: true}, ([tab]) => {
        chrome.tabs.sendMessage(
            tab.id, 
            {type: "GET_ARTICLE_TEXT"}, 
            ({text}) => {
                setTimeout(() => {
                    result.textContent = text ? text.slice(0, 300) + " " : "No article text found.";            
                }, 1000);   //1 second delay
        });
    });
});
