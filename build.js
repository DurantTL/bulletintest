const fs = require('fs');
const mammoth = require('mammoth');

const INPUT_FILE = 'boletin.docx';
const TEMPLATE_FILE = 'template.html';
const OUTPUT_FILE = 'index.html';

// ... (Use the same Helper functions clean/findValue/findHymn/findVerse from the previous response here) ...
// For brevity, assume those helper functions are pasted here.

mammoth.extractRawText({ path: INPUT_FILE }).then(result => {
    const text = result.value;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // 1. EXTRACT DATA (Same logic as before)
    let d = {
        date: "Sábado", pastor: "", verse_text: "", verse_ref: "",
        ss_welcome: "", ss_hymn: "", ss_read_ref: "", ss_read_who: "", ss_mission: "", ss_lesson: "", ss_mins: "",
        cd_invocation: "", cd_welcome: "", cd_hymn: "", cd_read_ref: "", cd_read_who: "", cd_prayer: "", cd_tithe: "", cd_kids: "", cd_special: "", cd_sermon: "",
        elder: "", sunset: "", youth: "", announcements_html: ""
    };

    let section = 'header';
    let ann_list = [];

    lines.forEach((line, index) => {
        const lower = line.toLowerCase();
        if (lower.includes('escuela sabatica') || lower.includes('escuela sabática')) { section = 'ss'; return; }
        if (lower.includes('culto divino')) { section = 'cd'; return; }
        if (lower.includes('anuncios')) { section = 'announcements'; return; }

        if (section === 'header') {
            if (lower.includes('202') && !lower.includes('boletin')) d.date = line;
            if (line.includes('"') && line.length > 20) {
                 d.verse_text = line.replace(/"/g, '');
                 if (lines[index + 1] && lines[index + 1].match(/\d+:\d+/)) d.verse_ref = lines[index + 1];
            }
        }
        // ... (Paste the SS and CD extraction logic from previous response here, mapping to d.variables) ...
        // Example mapping: 
        // if (v_wel) d.ss_welcome = v_wel; 
        
        if (section === 'announcements') {
            if (lower.includes('puesta') && lower.includes('sol')) {
                const time = line.match(/\d{1,2}:\d{2}\s?(am|pm)?/i);
                if (time) d.sunset = time[0];
            } else if (lower.includes('sociedad') && lower.includes('jóvenes')) {
                const time = line.match(/\d{1,2}:\d{2}\s?(am|pm)?/i);
                if (time) d.youth = time[0];
            } else if (line.length > 5 && !lower.includes('anuncios')) {
                ann_list.push(`<li>${line.replace(/^- /, '')}</li>`);
            }
        }
    });
    d.announcements = ann_list.join('');

    // 2. READ TEMPLATE
    let html = fs.readFileSync(TEMPLATE_FILE, 'utf8');

    // 3. REPLACE PLACEHOLDERS
    for (const [key, value] of Object.entries(d)) {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
    }

    // 4. WRITE FINAL HTML
    fs.writeFileSync(OUTPUT_FILE, html);
    console.log("Webpage generated successfully.");
});