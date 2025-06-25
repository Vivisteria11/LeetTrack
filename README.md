# 📘 LeetTrack – Reflect on Your LeetCode Progress

**LeetTrack** is a Chrome extension designed to help you track your LeetCode problem-solving journey with reflections, AI feedback, and GitHub integration.

---

## ✅ Features Completed

- 🧠 **Capture LeetCode code** directly from the problem page  
- ✨ **AI-generated feedback** on your code using a local backend  
- 🖋️ **Custom reflections** to deepen your understanding  
- 🏷️ **Topic tagging** (e.g., Arrays, HashMap)  
- 📂 **Push to GitHub** under topic-specific folders in markdown format  
- 🔒 **Secure GitHub Token input**  
- 📅 **Local storage** of all entries for future reflection  
- 📊 **Weekly Review Page** *(in progress)* to visualize progress  

---

## 🚀 How to Use

> ⚠️ **This project is not yet deployed. To try it out, follow the local setup steps below.**

### 1. Install the Extension Locally

- Clone this repository  
- Open `chrome://extensions` in your Chrome browser  
- Enable **Developer Mode**  
- Click **Load Unpacked**  
- Select the root folder of this project  

### 2. Setup Your GitHub Token

- Generate a GitHub **Personal Access Token** with `repo` permissions  
- Paste it into the extension's **🔐 GitHub Token** input field  
- Click **Save Token**  

### 3. Start the Flask Backend

From the project directory:

```bash
pip install -r requirements.txt
python app.py
