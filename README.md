
# AutoFill AI: Intelligent Job Application Filler

**AutoFill AI** is a powerful Chrome extension designed to streamline the tedious process of filling out job applications. By leveraging the Google Gemini API, this tool intelligently detects form fields, parses your resume for context, and generates high-quality, relevant answers for both simple and complex questions, saving you hours of repetitive work.

---

## ✨ Key Features

- **🧠 Intelligent Field Detection:** Automatically scans and identifies common application fields (name, email, phone, etc.) on various platforms like Workday, Greenhouse, and Lever.
- **✍️ AI-Powered Long-Form Answers:** Uses Gemini to craft professional, context-aware responses for behavioral and open-ended questions ("Describe a time...", "Why do you want to work here?").
- **📄 Resume-Aware Context:** Parses your pasted resume text to accurately fill out work history, skills, and education sections.
- **🔘 Robust Radio & Select Handling:** Intelligently selects the correct option for multiple-choice questions, including EEO (Equal Employment Opportunity) forms.
- **👤 Comprehensive User Profile:** Manage your personal info, work experience, education, skills, and multiple resumes all in one place.
- **⚙️ Configurable AI Settings:** Choose your preferred Gemini model, set the tone of voice (professional, enthusiastic), and define the desired response length.
- **🔒 Secure & Local:** All your profile data and your API key are stored securely in your browser's local storage, never leaving your machine.

---

## 🚀 Getting Started

Follow these instructions to set up and run the extension on your local machine for development or personal use.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or newer) and npm.
- A modern web browser that supports Chrome extensions (e.g., Google Chrome, Brave, Microsoft Edge).
- A valid **Google Gemini API Key**. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Build

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/ParthShethia25/automatic-job-application-filler-extension.git
    cd automatic-job-application-filler-extension
    ```

2.  **Install Dependencies:**
    This command installs all the necessary packages defined in `package.json`.
    ```bash
    npm install
    ```

3.  **Build the Extension:**
    This command compiles the TypeScript/React code and bundles all assets into a `build/` directory, ready for the browser.
    ```bash
    npm run build
    ```

4.  **Load the Extension in Chrome:**
    - Open your browser and navigate to `chrome://extensions`.
    - Enable the **"Developer mode"** toggle, usually found in the top-right corner.
    - Click the **"Load unpacked"** button.
    - Select the `build` folder that was created in the previous step.

The **AutoFill AI** icon should now appear in your browser's extension toolbar!

---

## 📖 How to Use

### 1. Initial Configuration

Before you start, you need to configure your profile and API key.

- **Open the Settings Page:** Right-click the extension icon in your toolbar and select **"Options"**. This will open the full settings dashboard in a new tab.
- **Set Your API Key:**
    - Navigate to the **"AI & Model"** tab.
    - Enter your Gemini API key and click "Validate" to ensure it's working correctly.
    - Select the Gemini model you'd like to use. *Gemini 2.5 Flash is recommended for a balance of speed and cost.*
- **Build Your Profile:**
    - Go to the **"My Profile"** tab.
    - Fill out your **Basic Info**.
    - Click the **"Resumes"** sub-tab, add a new resume, and **paste the full text content** of your resume. This is crucial for the AI to answer questions accurately. Set one resume as active.
    - (Optional) Add structured **Experience** and **Custom Data** for even more precise filling.

### 2. Filling an Application

Once configured, the extension is ready to use.

1.  **Navigate to a Job Application Page.**
2.  **Click the AutoFill AI icon** in your browser toolbar to open the popup.
3.  The extension will automatically **scan the page** for fillable fields.
4.  Fields that can be filled from your profile (like your name and email) will be pre-filled. For other fields, you'll see "Waiting to generate...".
5.  Click the **✨ Generate Answers** button. The AI will process the remaining selected fields and generate responses.
6.  **Review the generated answers.** You can edit any field directly in the popup.
7.  Click **▶️ Fill Selected** to instantly populate the form on the webpage.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript
- **AI:** Google Gemini API (`@google/genai`)
- **Platform:** Chrome Extension Manifest V3
- **Styling:** Tailwind CSS
- **Bundler:** Vite
- **Icons:** Lucide React

## 📂 Project Structure

```
/
├── public/
│   ├── content.js        # Script injected into web pages to scan and fill forms
│   ├── manifest.json       # Core Chrome Extension configuration
│   └── ...                 # Static assets (icons)
├── build/                  # (Generated) The final, bundled extension code
├── components/             # React components
├── services/               # Gemini API and storage logic
├── App.tsx                 # Main React component
├── index.html              # Vite entry point
├── index.tsx               # React root entry
├── package.json            # Project dependencies and scripts
└── vite.config.ts          # Build configuration
```

---

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features, bug fixes, or improvements, please feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## YT LINK
[View Project Demo]{https://youtu.be/tLii4nKZ0X8}
