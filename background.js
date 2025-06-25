chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("weeklyReview", {
    when: Date.now(),
    periodInMinutes: 10080  // 7 days
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "weeklyReview") {
    chrome.tabs.create({ url: chrome.runtime.getURL("review.html") });
  }
});
