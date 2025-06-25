function getLeetCodeData() {
  // Find the div that contains the full problem title (number + name)
  const allDivs = Array.from(document.querySelectorAll("div"));
 
const titleElement = allDivs.find(div =>
  /^\d+\.\s/.test(div.innerText.trim())
);
let title = titleElement ? titleElement.innerText.trim() : "Unknown Problem";

// Only take the first line before any \n (line break)
title = title.split("\n")[0];
  // Extract code from Monaco Editor
  const viewLines = document.querySelectorAll(".view-lines > div");
  let code = "No code found";
  if (viewLines.length > 0) {
    code = Array.from(viewLines).map(line => line.innerText).join("\n").trim();
  }

  return { title, code };
}



chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "getLeetCodeData") {
    setTimeout(() => {
      sendResponse(getLeetCodeData());
    }, 300); // wait 300ms to make sure DOM is ready
    return true; // IMPORTANT: allows async sendResponse
  }
});
