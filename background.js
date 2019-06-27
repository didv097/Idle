
var laststate = "";
var oldWindowsState = "";
var homeurl = "";	// URL of the new tab
var waitTime = 0;

function loadData() {
	fetch('https://cors-anywhere.herokuapp.com/https://screendynamics.com/webapp/results.json')
		.then(response => response.json())
		.then(data => {
			homeurl = data["posts"][0]["url"];
			waitTime = parseInt(data["posts"][0]["idle"]);
		})
}

function checkState() {
	waitTime = Math.max(15, waitTime);
	chrome.idle.queryState(waitTime, function(state) {
		if (laststate != state) {
			laststate = state;
			if (state == "idle") {
				loadData();
				chrome.tabs.getSelected(null, function(tab) {
					if (tab.url.indexOf("screendynamics.com") < 0)
						chrome.tabs.create({ url: homeurl })
					else
						chrome.tabs.update(tab.id, { url: homeurl })
				})
				chrome.windows.getCurrent(null, function(window) {
					oldWindowsState = window.state;
					chrome.windows.update(window.id, { state: "fullscreen" });
				})
			}
			else if (state == "active") {
				chrome.windows.getCurrent(null, function(window) {
					if (oldWindowsState != "")
						chrome.windows.update(window.id, { state: oldWindowsState });
				})
			}
		}
	});
};

loadData();
setInterval(checkState, 1000);