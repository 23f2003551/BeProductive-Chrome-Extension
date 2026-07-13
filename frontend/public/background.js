async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

function handleTabLogic(tab) {
    if (!tab?.url || !tab.url.startsWith("http")) {
        return null;
    }
    
    const url = new URL(tab.url);
    let domain = url.hostname;
    
    if (domain.startsWith("www.")) {
        domain = domain.slice(4);
    }
    
    return {
        tabId: tab.id,
        domain
    };
}

let lastDomain = null;
let laststartTime = null;
let currentSessionId = null;

async function handleTracking(tab) {
    const storage = await chrome.storage.local.get(["sessionId"]);
    currentSessionId = storage.sessionId;

    const result = handleTabLogic(tab);
    if (!result) return null;
    
    const { tabId, domain } = result;

    if (!lastDomain) {
        lastDomain = domain;
        laststartTime = Date.now();  
        return null;
    }
    
    if (lastDomain !== domain) {
        let endTime = Date.now();
        const data = {
            "sessionId": currentSessionId,
            "domain": lastDomain,
            "startTime": laststartTime,
            "endTime": endTime
        };
        laststartTime = endTime;
        lastDomain = domain;
        return data;
    }
    
    return null;
}

function sendtoBackend(data) {
    fetch('http://127.0.0.1:3000/session/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then((res) => console.log(res.status))
    .catch((err) => console.error(err));
}

function stopTracking() {
    if (lastDomain && laststartTime && currentSessionId) {
        let endTime = Date.now();
        const data = {
            "sessionId": currentSessionId,
            "domain": lastDomain,
            "startTime": laststartTime,
            "endTime": endTime
        };
        sendtoBackend(data);
        lastDomain = null;
        laststartTime = null;
    }
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status !== "complete") return;
    
    const result = await handleTracking(tab);
    if (!result) return;
    
    sendtoBackend(result);
    console.log("Updated:", result.domain);
});

chrome.tabs.onActivated.addListener(async () => {
    const tab = await getCurrentTab();
    
    if (!tab?.url || !tab.url.startsWith("http")) {
        stopTracking();
        return;
    }
    
    const result = await handleTracking(tab);
    if (!result) return;
    
    sendtoBackend(result);
    console.log("Activated:", result.domain);
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    stopTracking();
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
    if (windowId === -1) {
        console.log("Left Chrome");
        stopTracking();
    } else {
        console.log('Returned to Chrome');
        
        const tab = await getCurrentTab();
        const result = await handleTracking(tab);
        
        if (result) {
            sendtoBackend(result);
        }
    }
});

