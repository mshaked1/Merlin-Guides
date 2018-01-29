(function callWhenReadyToGo(callback) {
  var requests = [];
  var activeTabId;
  var interval;
  var active = false;
  disableBrowserAction();
  chrome.tabs.onActivated.addListener(activeTabListener);

  function disableBrowserAction() {
    chrome.browserAction.setIcon({ path: 'images/icon-16-off.png'});
  }

  function enableBrowserAction() {
    chrome.browserAction.setIcon({ path: 'images/icon-16.png'});
  }

  // toggle extension on/off
  // toggling on adds listeners
  // toggling off removes all listeners
  function browserActionListener(tab) {
    if (!active) {
      enableBrowserAction();
      chrome.tabs.onActivated.addListener(activeTabListener);
      chrome.webRequest.onBeforeRequest.addListener(requestListener, {urls: ['<all_urls>']});
      chrome.webRequest.onCompleted.addListener(responseListener, {urls: ['<all_urls>']});
      chrome.webNavigation.onBeforeNavigate.addListener(navCompleteListener);
      chrome.webNavigation.onCompleted.addListener(navCompleteListener);
      chrome.webNavigation.onErrorOccurred.addListener(navCompleteListener);
    } else {
      disableBrowserAction();
      clearInterval(interval);
      chrome.tabs.onActivated.removeListener(activeTabListener);
      chrome.webRequest.onBeforeRequest.removeListener(requestListener);
      chrome.webRequest.onCompleted.removeListener(responseListener);
      chrome.webNavigation.onBeforeNavigate.removeListener(navCompleteListener);
      chrome.webNavigation.onCompleted.removeListener(navCompleteListener);
      chrome.webNavigation.onErrorOccurred.removeListener(navCompleteListener);
    }
    active = !active;
  }

  chrome.browserAction.onClicked.addListener(browserActionListener)

  // maintain activeTab id and clear interval when tab changes
  function activeTabListener(tabDetails) {
    clearInterval(interval);
    activeTabId = tabDetails.tabId;
  }

  // listen to all outgoing requests and add all requests from active tab to array
  function requestListener(reqDetails) {
    if (reqDetails.tabId === activeTabId) {
      requests.push({
        id: reqDetails.requestId,
      });
    }   
    return {};
  }

  // listen for successful request completion and remove from array
  function responseListener(resDetails) {
    if (resDetails.tabId === activeTabId) {
      for (var i = 0; i < requests.length; i++) {
        if (requests[i].id === resDetails.requestId) {
          requests.splice(i, 1);
          break;
        }
      }
    }
  }

  // clear array of active requests upon navigation and clear polling interval
  function navListener(navDetails) {
    if (navDetails.tabId === activeTabId && navDetails.frameId === 0) {
      requests = [];
      clearInterval(interval);
    }
  }

  // start interval once navigation is completed
  function navCompleteListener(navDetails) {
    if (navDetails.tabId === activeTabId && navDetails.frameId === 0) {
      setTimeout(function() {
        interval = setInterval(checkAllRequests, 1000, callback, requests);
      }, 1000);
    }
  }

  // loop through array of requests and check for any unfinished requests
  // cancel interval and call callback if all requests are complete
  function checkAllRequests(callback, requestArray) {
    var done = true;
    for (var i = 0; i < requestArray.length; i++) {
      if (requestArray.length > 0) {
        done = false;
        break;
      }
    }
    if (done) {
      clearInterval(interval)
      callback();
    }
  }
})(function() {
  console.log('this is the callback that would run when all requests are done');
})
