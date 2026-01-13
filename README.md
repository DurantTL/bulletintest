
# 📋 Generador Automático de Boletín (Church Bulletin Automation)

This system automatically converts a Word Document (`.docx`) into a web-ready HTML page for the church website. It runs entirely on GitHub, requiring no manual coding or copy-pasting each week.

## 🚀 How to Update the Bulletin (Weekly Workflow)

1. **Prepare your Word Doc:**
* Ensure your file is named **`boletin.docx`**.
* Make sure it follows the standard format (see *Word Document Formatting* below).


2. **Upload to GitHub:**
* Go to the **Code** tab of this repository.
* Click **Add file** > **Upload files**.
* Drag and drop your new `boletin.docx` file.
* Click **Commit changes**.


3. **Wait ~60 Seconds:**
* GitHub Actions will automatically detect the change, convert the text, build the HTML, and deploy it.
* Your church website (via the iFrame) will update automatically.



---

## 🛠️ Initial Setup (One-Time)

If you are setting this up for the first time, ensure the following files exist in the repository:

1. **`package.json`**: Defines the software dependencies.
2. **`build.js`**: The logic that reads the Word doc and fills the template.
3. **`template.html`**: The HTML design/layout of the bulletin.
4. **`.github/workflows/deploy.yml`**: The automation script.

### Enable GitHub Pages

1. Go to **Settings** > **Pages**.
2. Under **Build and deployment**, select **Source**: `Deploy from a branch`.
3. Select Branch: **`gh-pages`** (This branch is created automatically after your first successful run).
4. Click **Save**.
5. Copy the URL provided (e.g., `https://youruser.github.io/bulletin-repo/`).

---

## 💻 Website Integration

To display this bulletin on your church website (WordPress, Wix, Squarespace, etc.), add an **HTML Code** block and paste the following.

*Replace `YOUR_GITHUB_PAGES_URL` with the link you copied in the setup step.*

```html
<iframe 
    src="YOUR_GITHUB_PAGES_URL" 
    style="width: 100%; border: none; height: 1400px; overflow: hidden;" 
    title="Boletin Semanal"
    scrolling="no">
</iframe>

```

---

## 📝 Word Document Formatting Rules

For the automation to work, the system looks for specific "Keywords" in your Word document.

1. **Section Headers:** Do not change these exact phrases (though capitalization doesn't matter):
* `ESCUELA SABATICA`
* `CULTO DIVINO`
* `ANUNCIOS`


2. **Tables:** Keep the program parts (Hymns, Scripture, etc.) inside the tables as they are currently.
3. **Keywords:** The system finds data by looking for these words:
* *Fecha, Pastor, Bienvenida, Himno, Lectura, Oración, Misionero, Lección, Sermón, Diezmo, Especial.*
* *Example:* If you change "Himno Inicial" to "Canto de Entrada", the system might miss it. Try to keep the labels consistent.



---

## 📂 Project Structure

* `boletin.docx` - The source file you upload every week.
* `index.html` - The generated file (do not edit this manually; it gets overwritten).
* `template.html` - Edit this file if you want to change colors, fonts, or the layout structure.
* `build.js` - The brain of the operation (Node.js script).

## 🆘 Troubleshooting

* **The website shows an old bulletin:**
* Check the **Actions** tab in GitHub to see if the build failed.
* Clear your browser cache (Ctrl+F5).


* **A name is missing:**
* Check the Word doc. Did you accidentally delete a label like "Invocación:"?


* **The formatting looks weird:**
* Did someone upload a PDF instead of a DOCX? This system only accepts `.docx`.
