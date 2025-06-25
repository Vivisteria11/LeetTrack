let lastTitle = "";
let lastCode = "";
let lastFeedback = "";
let lastTopic = "";
let lastLanguage = "cpp";
let lastReflection = "";

// Save GitHub token
document.getElementById("saveToken").addEventListener("click", () => {
  const token = document.getElementById("githubToken").value;
  chrome.storage.local.set({ githubToken: token }, () => {
    alert("✅ Token saved!");
  });
});

// Normalize folder name
function normalizeTopic(topic) {
  return topic.replace(/[^a-zA-Z0-9]/g, "_");
}

// Language → File extension mapping
function getFileExtension(lang) {
  const map = {
    cpp: "cpp",
    python: "py",
    java: "java",
    javascript: "js"
  };
  return map[lang] || "txt";
}

// Format LLM Feedback nicely
function formatLLMFeedback(feedbackText) {
  const cleaned = feedbackText
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/```(.*?)```/gs, "<pre>$1</pre>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");

  return `
    <div style="
      border-left: 4px solid #4B9CD3;
      background: #f4faff;
      padding: 14px 18px;
      border-radius: 8px;
      font-family: 'Segoe UI', sans-serif;
      font-size: 14px;
      line-height: 1.7;
      color: #2e2e2e;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      margin-top: 12px;">
      <div style="font-weight: 600; margin-bottom: 8px; font-size: 15px;">💭 Reflection</div>
      ${cleaned}
    </div>
  `;
}

// Capture LeetCode code and GPT feedback
document.getElementById("captureBtn").addEventListener("click", async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.id) return;

    chrome.tabs.sendMessage(tab.id, { action: "getLeetCodeData" }, async (response) => {
      if (chrome.runtime.lastError || !response) {
        document.getElementById("output").innerText = "⚠️ Could not fetch code.";
        return;
      }

      const { title, code } = response;
      lastTitle = title;
      lastCode = code;
      lastLanguage = document.getElementById("langSelect").value;

      document.getElementById("output").innerText = `📘 Problem: ${title}\n\n💻 Code:\n${code}`;

      const feedback = await getCodeFeedback(title, code, lastLanguage);
      lastFeedback = feedback;

      document.getElementById("feedback").innerHTML = formatLLMFeedback(lastFeedback);
      document.getElementById("tagInput").value = "";
      document.getElementById("reflectionInput").value = "";
      document.getElementById("reviewBtn").addEventListener("click", () => {
      chrome.tabs.create({ url: chrome.runtime.getURL("review.html") });
});
 // reset
    });
  });
});

// Upload to GitHub
async function pushToGitHub(title, code, feedback, topic, language, reflection) {
  const { githubToken } = await chrome.storage.local.get("githubToken");

  if (!githubToken) {
    alert("⚠️ No GitHub token found. Please save it first.");
    return;
  }

  const repo = "leetcode-reflect";
  const username = "Vivisteria11";
  const folder = normalizeTopic(topic);
  const extension = getFileExtension(language);
  const filename = `${folder}/${title.replace(/[^a-zA-Z0-9]/g, "_")}.md`;

  const content = `
### Problem: ${title}

🏷 Topic: ${topic}

🧠 LLM Feedback:
${feedback}

💭 Reflection:
${reflection || "_(No reflection written)_"}

💻 Your Code:
\`\`\`${language}
${code}
\`\`\`
`;

  const encodedContent = btoa(unescape(encodeURIComponent(content)));

  const getRes = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${filename}`, {
    headers: {
      "Authorization": `Bearer ${githubToken}`
    }
  });

  let sha = undefined;
  if (getRes.ok) {
    const getData = await getRes.json();
    sha = getData.sha;
  }

  const res = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${filename}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${githubToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: `📝 Add ${title} under ${topic}`,
      content: encodedContent,
      ...(sha && { sha })
    })
  });

  if (res.ok) {
    alert("✅ Pushed to GitHub!");
    // Save reflection entry locally
    const entry = {
      title,
      code,
      feedback,
      topic,
      language,
      reflection: document.getElementById("reflectionInput").value.trim(),
      timestamp: new Date().toISOString()
    };

    chrome.storage.local.get({ reviewEntries: [] }, (result) => {
      const updated = [...result.reviewEntries, entry];
      chrome.storage.local.set({ reviewEntries: updated });
    });

  } else {
    const errText = await res.text();
    console.error("GitHub Push Error:", errText);
    alert("❌ Push failed. Check console for details.");
  }
}

// Push button click
document.getElementById("pushBtn").addEventListener("click", async () => {
  if (!lastTitle || !lastCode || !lastFeedback) {
    alert("❗ Please capture code and feedback first.");
    return;
  }

  const userTags = document.getElementById("tagInput").value.trim();
  const reflectionText = document.getElementById("reflectionInput").value.trim();
  if (!userTags) {
    alert("❗ Please enter at least one tag.");
    return;
  }

  lastTopic = userTags.split(",")[0] || "Uncategorized";
  lastLanguage = document.getElementById("langSelect").value;
  lastReflection = reflectionText;

  await pushToGitHub(lastTitle, lastCode, lastFeedback, lastTopic, lastLanguage, lastReflection);
});

// Call Groq LLM via your Flask backend
async function getCodeFeedback(title, code, lang) {
  try {
    const response = await fetch("http://127.0.0.1:5000/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        code,
        language: lang
      })
    });

    const data = await response.json();
    if (data.error) return "⚠️ Server Error: " + data.error;
    return data.choices?.[0]?.message?.content || "No feedback received.";
  } catch (err) {
    console.error("API error:", err);
    return "⚠️ Could not connect to server.";
  }
}
