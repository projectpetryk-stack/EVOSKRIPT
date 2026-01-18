
# 🚀 SalesFlow Pro - Deployment Guide / Інструкція з розгортання

SalesFlow Pro is a dynamic sales script builder. Follow these steps to host it on **GitHub Pages**.

## 📋 Detailed Deployment Steps / Покрокова інструкція

### 1. Change Visibility to Public / Зробити репозиторій публічним
GitHub Pages requires your repository to be **Public**. 

1.  **Open Settings**: Click the **Settings** (Налаштування ⚙️) tab at the top.
2.  **General Tab**: Ensure you are in the **General** (Загальне) section in the left sidebar.
3.  **Find Danger Zone**: Scroll to the bottom to the **"Danger Zone"** (Зона небезпеки).
4.  **Click Change Visibility**: Click **Change visibility** (Змінити видимість).
5.  **Select Make Public**: Choose **Make public** (Зробити публічним).
6.  **Confirm**: Follow the prompts to type your repo name and confirm.

### 2. Enable GitHub Pages / Увімкнути GitHub Pages
**Do not use "Deploy keys" (Розгортання ключів)**. Use the steps below:

1.  In **Settings** (Налаштування), click on **Pages** (Сторінки) in the left sidebar.
2.  Under **Build and deployment** > **Branch**:
    - Select `main` (or `master`) from the dropdown.
    - Ensure folder is set to `/(root)`.
3.  Click **Save** (Зберегти).
4.  Wait 1-2 minutes. A link will appear: **"Your site is live at..."**. Click it to open your app!

## ⚠️ Important: API Key Security
- This app uses `process.env.API_KEY`.
- **Note**: Since the site is public, anyone can see the source code. For real production, use a proxy. For personal testing, you can temporarily add your key to `services/geminiService.ts`.

## 🛠 Features
- **Dynamic Switching**: Change scripts instantly.
- **AI-Powered Hints**: Real-time sales advice.
- **Note Taking**: Record key points and export to `.txt`.

## 💻 Local Development
1. Run `npx serve .`
2. Open `http://localhost:3000`.
