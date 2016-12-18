function onClickHandler(info, tab) {
    let matchedData = {
        keyword: info.selectionText,
        url: info.linkUrl,
        tabUrl: info.pageUrl
    };

    setMatch(matchedData);
}

function setMatch(data, callback = () => {}) {
    // expects {keyword, url, tabUrl} or array of same object

    chrome.storage.sync.get(['keywords', 'matchedUrls'], function(storageItems) {
        let updatedObj = {
            keywords: storageItems.keywords && Object.keys(storageItems.keywords).length ? storageItems.keywords : {},
            matchedUrls: storageItems.matchedUrls && Object.keys(storageItems.matchedUrls).length ? storageItems.matchedUrls : {}
        };

        let setItem = function(item) {
            if (item.keyword) {
                let keyword = updatedObj.keywords[item.keyword.toLowerCase()];

                // if existing keyword - push the url
                if (keyword && keyword.urls.length) {
                    keyword.urls.push(item.url);
                } else {
                    // if new keyword create it

                    updatedObj.keywords[item.keyword.toLowerCase()] = {
                        urls: item.url ? [item.url] : []
                    };
                }

                if (item.tabUrl) {
                    let tabUrl = item.tabUrl;

                    updatedObj.matchedUrls[tabUrl] = {
                        keyword: item.keyword,
                        careersUrl: item.url
                    };
                }
            }
        };
        
        if (typeof data === 'object' && data.length) {
            data.forEach((item) => {
                setItem(item);
            });
        } else {
            setItem(data);
        }

        chrome.storage.sync.set(updatedObj, callback);
    });
}

chrome.contextMenus.onClicked.addListener(onClickHandler);

// Set context menu item
chrome.runtime.onInstalled.addListener(function() {
    let defaultKeywords = [{keyword: 'jobs'}, {keyword: 'careers'}]; // might come from some smart remote origin in the future

    setMatch(defaultKeywords);

    chrome.contextMenus.create({
        'title': 'Teach CareersPageFinder to find similar links', 'contexts': ['link'],
        'type': 'normal',
        'id': 'context-link'
    });
});

// Listen for requests from the content script
chrome.extension.onRequest.addListener(function(request) {

    if (request.matchFound) {
        setMatch(request.matchFound, changeIcon);
    } else {
        changeIcon();
    }

});

// Listen for tab activated & updated and notify the content script
chrome.tabs.onActivated.addListener(function(info) {
    orderBackgroundHarvest(info.tabId);
});

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
    if (info.status == 'complete') {
        orderBackgroundHarvest(tabId);
    }
});

let orderBackgroundHarvest = (tabId) => {
    chrome.tabs.executeScript(tabId, {file: "content_page.js"});
    chrome.tabs.sendMessage(tabId, {action: 'harvest'});
};

let changeIcon = () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let url = tabs[0].url;


        chrome.storage.sync.get('matchedUrls', (data) => {

            let matchFound = false;

            if (data.matchedUrls && data.matchedUrls[url]) {
                matchFound = true;
            }

            matchFound ? chrome.browserAction.setIcon({path: {19: 'icons/icon-19-active.png'}}) : chrome.browserAction.setIcon({path: {19: 'icons/icon-19.png'}});
        });
    });
    
};
