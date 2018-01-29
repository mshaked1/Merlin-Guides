# Merlin Guides Engineering assessment

## To use:

1. Pull repo
2. Go to chrome://extensions/
3. Click Load Unpacked Extension, select App folder within repo
4. Open extension's background page under 'Inspect Views'
5. Click extension to turn on and reload any tab other than the extensions page
6. A statement will log in background console once all requests have finished

## Solution

Based on my understand of the assessment prompt, we need to be able to detect when ALL outstanding HTTP requests on the page have finished
in addition to the actual DOM being loaded.
Using pure ES5 JavaScript (no jQuery) the approach I took is purely from a Chrome extension point of view:

1. attach following listeners in background script:
   1. extension icon is toggled
   2. track the active tab
   3. when requests are started and finished/errored out
   4. when navigation of the active tab is started and finished
2. maintain an array of outstanding requests, removing a request once it has finished or errored
3. poll for the length of the requests array, call callback once array has length 0

### TODO:

There is a cross-browser polyfill that would allow this code to run in both Mozilla and Chrome (although they would both need to be loaded to the individual extension stores separately)

### Potential pitfall:
Some requests may start late due to ads or other browser quirks that would cause them to fire off long after the callback was called (i.e. Youtube)

## Another solution (that I did't code)

Another approach that doesn't depend on the Chrome Extensions API:

1. use a global array to track all outstanding requests
2. hook into the XMLHttpRequest object's open() method
3. add logic to push to global array each time open() is called
4. change array index to true onreadystatechange
5. poll to check that all items in array are true --> call callback

### Chrome extension scaffolded using [Chrome Extension Generator](https://github.com/yeoman/generator-chrome-extension)