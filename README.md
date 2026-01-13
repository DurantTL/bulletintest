📋 Church Bulletin Automator
This system automatically updates the church website bulletin by reading a Word Document sent via email.

🚀 Quick Start (For Church Secretaries)
How to update the website:

Open your email.

Attach your bulletin file (Must be named boletin.docx).

Send the email to: [INSERT_YOUR_GMAIL_FORWARDER_HERE]

Wait 2 minutes. The website will update automatically.

⚙️ Technical Setup (For Administrators)
If you are setting this up for a new church, follow these 3 steps.

Step 1: The Repository
Fork this repository (create a copy for the specific church).

Go to Settings > Pages and enable GitHub Pages on the gh-pages branch.

Copy the GitHub Pages URL. You will use this in the church website iframe.

Step 2: The "Brain" (Make.com)
We use Make.com to catch the email and send the file to GitHub.

Create a Make.com account (Free tier is sufficient).

Create a Scenario: Webhooks (Custom Mailhook) -> GitHub (Update a File).

Webhook: Copy the generated email address (e.g., xyz@hook.make.com).

GitHub Node: * Repo: Select this church's repo.

Branch: main.

File Path: boletin.docx.

File Content: Select the Data from the email attachment.

Step 3: The "Bodyguard" (Gmail)
To prevent spam and save credits, do not give the Make.com address to people. Use Gmail as a filter.

Create a dedicated Gmail (e.g., church.bulletin.update@gmail.com).

Add the Make.com address as a Forwarding Address.

Create a Filter in Gmail:

From: pastor@church.org OR secretary@church.org

Has Attachment: Yes

Action: Forward to Make.com address.

📝 Document Formatting Guide
The system is designed to be flexible, but it relies on Keywords to find information.

Standard Sections: Ensure your Word document has clear headers (in English or Spanish):

Sabbath School (or Escuela Sabática)

Worship Service (or Culto Divino)

Announcements (or Anuncios)

Standard Fields: The system looks for these words in a line to extract the text next to them:

Date, Pastor, Welcome, Hymn, Offering, Children's Story, Sermon, Sunset.

Example of a good layout:

Worship Service Welcome: Elder John Hymn: #500 Sermon: Pastor Smith

🎨 Customizing the Design
To change how the bulletin looks (colors, fonts, logo):

Edit template.html in this repository.

It uses standard HTML/CSS.

Variables are marked with double brackets, e.g., {{pastor}}. Do not remove these variables, or the data will not appear.

🛠 Troubleshooting
Website shows 404: Go to Repo Settings > Pages and ensure "Deploy from Branch" is set to gh-pages.

Old bulletin shows: Clear browser cache. Check the "Actions" tab in GitHub to see if the build failed.

Data missing: Check the Word doc. Did you spell "Sermon" correctly? Is the file named boletin.docx?

graph LR
    A[Secretary] -- Email w/ docx --> B(Gmail Bodyguard);
    B -- Validated Forward --> C(Make.com Robot);
    C -- Upload File --> D{GitHub Repo};
    D -- Auto-Build --> E[Church Website];
    
    style B fill:#ffcccc,stroke:#333,stroke-width:2px;
    style C fill:#ccffcc,stroke:#333,stroke-width:2px;
    style E fill:#ccccff,stroke:#333,stroke-width:4px;
