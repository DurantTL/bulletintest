```markdown
# 📋 Church Bulletin Automator

This system automatically updates the church website bulletin by reading a Word Document sent via email. It supports both English and Spanish keywords, making it suitable for multiple church styles.

## 📊 How It Works

```text
+-----------+       +-----------+       +----------+       +--------+       +---------+
| Secretary | ----> |   Gmail   | ----> | Make.com | ----> | GitHub | ----> | Website |
+-----------+       | Bodyguard |       |  Robot   |       |  Repo  |       | (Live)  |
   (Email)          +-----------+       +----------+       +--------+       +---------+
                          |                   |                 |
                    (Check Sender)      (Upload File)     (Auto-Build)

```

---

## 🚀 Quick Start (For Church Secretaries)

**How to update the website:**

1. **Write:** Create your bulletin in Word. **Save it as `boletin.docx**`.
2. **Email:** Attach the file to an email.
3. **Send:** Send it to the dedicated update address: **`[INSERT_YOUR_GMAIL_FORWARDER_HERE]`**
4. **Done:** Wait ~2 minutes. The website will update automatically.

---

## ⚙️ Administrator Setup Guide

If you are deploying this for a new church, follow these steps.

### Step 1: Repository Setup

1. **Fork** this repository for the specific church.
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, set the source to **Deploy from a branch**.
4. Select the **`gh-pages`** branch (this branch is created automatically after the first successful run).
5. **Save**. Copy the generated URL (e.g., `https://username.github.io/repo/`).

### Step 2: The "Brain" (Make.com)

We use [Make.com](https://www.make.com) (Free Plan) to bridge Email to GitHub.

1. Create a **New Scenario**.
2. **Module 1:** `Webhooks` -> `Custom mailhook`.
* Copy the generated email address (e.g., `xyz@hook.make.com`).


3. **Module 2:** `GitHub` -> `Update a File`.
* **Connection:** Link your GitHub account.
* **Repo:** Select this church's repository.
* **Branch:** `main`.
* **File Path:** `boletin.docx`.
* **File Content:** Click the map icon and select the `Data` object from the Email attachments list.


4. **Run Once** to test, then toggle **Scheduling to ON**.

### Step 3: The "Bodyguard" (Gmail)

To prevent spam and save Make.com credits, use a dedicated Gmail account as a filter.

1. Create a Gmail account (e.g., `church.bulletin@gmail.com`).
2. Go to **Settings > Forwarding** and add the Make.com address.
3. Create a **Filter**:
* **From:** `secretary@church.org` OR `pastor@church.org`
* **Has Attachment:** Checked.
* **Action:** Forward to Make.com address.



---

## 💻 Website Integration

Copy this code to embed the bulletin on the church website (WordPress, Wix, Squarespace, etc.). Replace the URL with your GitHub Pages URL.

```html
<iframe 
    src="https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/" 
    style="width: 100%; border: none; height: 1600px; overflow: hidden;" 
    title="Weekly Bulletin"
    scrolling="no">
</iframe>

```

---

## 📝 Word Document Formatting

The system uses **Keywords** to find data. It is bilingual (English/Spanish).

### 1. Required Filename

The file **MUST** be named: `boletin.docx`

### 2. Standard Sections

Ensure the document has these headers (case insensitive):

* **Sabbath School** (or *Escuela Sabática*)
* **Worship Service** (or *Culto Divino*)
* **Announcements** (or *Anuncios*)

### 3. Data Keywords

The system looks for these words in a line to extract the text next to them.

| English Keyword | Spanish Keyword |
| --- | --- |
| **Date** (e.g., December 20) | **Fecha** (e.g., Diciembre 20) |
| **Pastor** / Speaker | **Pastor** / Orador |
| **Welcome** | **Bienvenida** |
| **Hymn** / Song | **Himno** |
| **Scripture** / Reading | **Lectura** |
| **Prayer** / Invocation | **Oración** / Invocación |
| **Offering** / Tithe | **Diezmo** / Ofrenda |
| **Sermon** | **Sermón** |
| **Sunset** | **Puesta de Sol** |

**Example of a valid layout:**

> **Worship Service**
> Welcome: Elder James
> Opening Hymn: #100
> Scripture: John 3:16
> Sermon: The Good News
> **Announcements**
> • Potluck next week.

---

## 🛠 Troubleshooting

* **Website shows 404:** Check Repo Settings > Pages. Ensure it points to `gh-pages`.
* **Update didn't happen:**
* Check the **Actions** tab in GitHub. Is the build Red (Failed)?
* Check **Make.com**. Did the scenario run?
* Did the secretary send the email from the correct authorized address?


* **Wrong data displayed:** Check the Word doc. Did they misspell a keyword (e.g., "Serman" instead of "Sermon")?

```

```
