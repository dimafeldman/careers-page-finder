function getCurrentTabUrl(callback) {
    let queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function(tabs) {

        let tab = tabs[0];
        let url = tab.url;
        callback(url);
    });
}

function populatePopup(matchFound, matchObj) {
    let res;

    if (matchFound && matchObj) {
        res = `
            <h1>Oh Wow! <br> a Careers page</h1>
            <a href="${matchObj.careersUrl}" target="_blank" id="action-btn">Go There!</a>
        `;

    } else {
        res = `<h1>Sorry no career pages found here ;(</h1>`;
    }

    document.getElementById('container').innerHTML = res;
    document.getElementById('action-btn').addEventListener('click', trackButtonClick, false);
}

function trackButtonClick(e) {
    _gaq.push(['_trackEvent', e.target.href, 'clicked']);
    console.log(e.target.href);
}

window.onload = function() {

    getCurrentTabUrl((url) => {

        chrome.storage.sync.get(['keywords', 'matchedUrls'], function(data) {

            let matchFound = false;
            let matchObj = false;

            if (data.matchedUrls && data.matchedUrls[url]) {
                matchFound = true;
                matchObj = data.matchedUrls[url];
            }

            populatePopup(matchFound, matchObj);
        });
    });
};

var _gaq = _gaq || [];

_gaq.push(['_setAccount', 'UA-89097475-1']);
_gaq.push(['_trackPageview']);

(function() {
    var ga   = document.createElement('script');
    ga.type  = 'text/javascript';
    ga.async = true;
    ga.src   = 'https://ssl.google-analytics.com/ga.js';
    var s    = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();
