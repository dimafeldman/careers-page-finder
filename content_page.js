function harvestPage(callback = () => {}) {
    let allLinks = document.querySelectorAll('a');

    chrome.storage.sync.get(['keywords', 'matchedUrls'], function(data) {

        let keywords   = data.keywords;
        let matchFound = false;
        let counter    = 0;

        while (counter < allLinks.length && !matchFound) {
            let currLink     = allLinks[counter];
            let matchKeyword = currLink.innerText.toLowerCase();
            let matchUrl     = currLink.href;
            counter++;

            if (keywords[matchKeyword]) {
                matchFound = true;

                chrome.extension.sendRequest({
                    matchFound: {
                        keyword: matchKeyword,
                        url: matchUrl,
                        tabUrl: document.URL
                    }
                });
            }
        }

        if (!matchFound) {
            chrome.extension.sendRequest({matchFound: false})
        }
    });
}

chrome.runtime.onMessage.addListener(function(message) {
    if (message.action == 'harvest') {
        harvestPage();
    }
});

harvestPage();
