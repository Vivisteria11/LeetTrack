document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get({ reviewEntries: [] }, (data) => {
    const allProblems = data.reviewEntries || [];

    if (!allProblems.length) {
      document.getElementById("problemCards").innerHTML = `<p>No problems solved yet. Go crush some! 💪</p>`;
      return;
    }

    const topicFilter = document.getElementById("topicFilter");
    const dateFilter = document.getElementById("dateFilter");
    const applyBtn = document.getElementById("applyFilter");

    // Populate topics dynamically
    const uniqueTopics = [...new Set(allProblems.map(p => p.topic))];
    uniqueTopics.forEach(topic => {
      const opt = document.createElement("option");
      opt.value = topic;
      opt.textContent = topic;
      topicFilter.appendChild(opt);
    });

    // Reusable render function
    function renderFiltered(problems) {
      // 🧠 Clear previous cards
      const container = document.getElementById("problemCards");
      container.innerHTML = "";

      //Pie Chart Data
      const topicCounts = problems.reduce((acc, prob) => {
        acc[prob.topic] = (acc[prob.topic] || 0) + 1;
        return acc;
      }, {});

      // Update Chart
      const ctx = document.getElementById("progressChart").getContext("2d");
      new Chart(ctx, {
        type: "pie",
        data: {
          labels: Object.keys(topicCounts),
          datasets: [{
            data: Object.values(topicCounts),
            backgroundColor: ["#60a5fa", "#34d399", "#fbbf24", "#f472b6", "#c084fc", "#f87171"]
          }]
        },
        options: {
          plugins: {
            legend: { position: "bottom" }
          }
        }
      });

      // Problem Cards
      problems.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h3>📘 ${p.title}</h3>
          <p><strong>🗂 Topic:</strong> ${p.topic}</p>
          <p><strong>💻 Language:</strong> ${p.language}</p>
          <p><strong>🖊️ Reflection:</strong> ${p.reflection || "Not added"}</p>
          <details><summary>📄 Code</summary><pre>${p.code}</pre></details>
          <details><summary>📩 Feedback</summary><pre>${p.feedback}</pre></details>
          <p><em>📅 Solved on: ${new Date(p.timestamp).toLocaleString()}</em></p>
        `;
        container.appendChild(card);
      });
    }

    //  Initial Render
    renderFiltered(allProblems);

    //  Filter Logic
    applyBtn.addEventListener("click", () => {
      const topicVal = topicFilter.value;
      const days = parseInt(dateFilter.value);
      const now = Date.now();

      let filtered = allProblems;

      if (topicVal !== "all") {
        filtered = filtered.filter(p => p.topic === topicVal);
      }

      if (!isNaN(days)) {
        filtered = filtered.filter(p => {
          const daysAgo = now - days * 24 * 60 * 60 * 1000;
          return new Date(p.timestamp).getTime() >= daysAgo;
        });
      }

      renderFiltered(filtered);
    });
  });
});
