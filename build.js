const fs = require('fs');
const mammoth = require('mammoth');

const INPUT_FILE = 'boletin.docx';
const TEMPLATE_FILE = 'template.html';
const OUTPUT_FILE = 'index.html';

// --- CONFIGURATION ---
// You can toggle this if a church strictly uses one language, 
// but leaving both works for hybrid/all churches.
const KEYWORDS = {
    SECTION_SS: ['escuela sabatica', 'escuela sabática', 'sabbath school', 'bible study'],
    SECTION_WS: ['culto divino', 'divine service', 'worship service', 'divine worship'],
    SECTION_ANN: ['anuncios', 'announcements', 'upcoming events', 'church family'],
    
    // Field Mappings (Look for these words in lines)
    DATE: ['202', 'december', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    PASTOR: ['pastor', 'speaker', 'orador'],
    
    // Sabbath School Fields
    SS_WELCOME: ['bienvenida', 'welcome', 'superintendent'],
    SS_HYMN: ['himno', 'hymn', 'song', 'praise'],
    SS_LESSON: ['repaso', 'lección', 'lesson', 'study'],
    SS_MISSION: ['misionero', 'mission', 'world mission'],
    SS_READING: ['lectura', 'scripture', 'reading'],

    // Worship Service Fields
    WS_CALL: ['call to worship', 'llamado', 'invocación'],
    WS_INVOCATION: ['invocación', 'invocation', 'prayer'],
    WS_HYMN: ['himno', 'hymn', 'songs of praise', 'opening song'],
    WS_OFFERING: ['diezmo', 'tithe', 'offering', 'giving', 'presupuesto'],
    WS_CHILDREN: ['infantil', 'children', 'lambs', 'niños'],
    WS_SCRIPTURE: ['lectura', 'scripture', 'reading', 'responsive'],
    WS_SERMON: ['sermón', 'sermon', 'message', 'homily'],
    WS_SPECIAL: ['especial', 'special music', 'musica especial'],
    WS_CLOSING: ['final', 'closing', 'benediction', 'postlude'],
    
    // Info
    SUNSET: ['puesta', 'sunset', 'sundown'],
    YOUTH: ['sociedad', 'jóvenes', 'youth', 'vespers']
};

// Helper: Check for keywords
const check = (text, keywords) => keywords.some(k => text.toLowerCase().includes(k));

// Helper: Extract value from line (splits by tabs or double spaces)
const findValue = (line, keys) => {
    if (check(line, keys)) {
        // Regex splits by: Tab OR Comma OR 2+ Spaces
        const parts = line.split(/\t|,|\s{2,}/); 
        // Return the last part (usually the name/person)
        return parts.length > 1 ? parts[parts.length - 1].trim() : null;
    }
    return null;
};

// Helper: Extract Hymn Number
const findHymn = (line, keys) => {
    if (check(line, keys)) {
        const match = line.match(/#\d+/); // Looks for #123
        if (match) return "Hymn " + match[0];
        
        // Fallback for "Hymn 123"
        const match2 = line.match(/Hymn \d+/i);
        if(match2) return match2[0];
    }
    return null;
};

mammoth.extractRawText({ path: INPUT_FILE }).then(result => {
    const text = result.value;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Data Object (The content to fill)
    let d = {
        date: "", pastor: "", 
        ss_welcome: "", ss_hymn: "", ss_reading: "", ss_mission: "", ss_lesson: "",
        ws_call: "", ws_invocation: "", ws_hymn: "", ws_scripture: "", ws_offering: "", ws_children: "", ws_special: "", ws_sermon: "", ws_closing: "",
        sunset: "", youth: "", announcements: ""
    };

    let section = 'header';
    let ann_list = [];

    lines.forEach((line, index) => {
        const lower = line.toLowerCase();

        // 1. SECTION DETECTION
        if (check(lower, KEYWORDS.SECTION_SS)) { section = 'ss'; return; }
        if (check(lower, KEYWORDS.SECTION_WS)) { section = 'ws'; return; }
        if (check(lower, KEYWORDS.SECTION_ANN)) { section = 'announcements'; return; }

        // 2. HEADER LOGIC
        if (section === 'header') {
            // Find Date (and ignore the word "Bulletin")
            if (check(lower, KEYWORDS.DATE) && !lower.includes('bulletin')) d.date = line;
            // Find Pastor (in header area)
            if (check(lower, KEYWORDS.PASTOR)) d.pastor = findValue(line, KEYWORDS.PASTOR) || line;
        }

        // 3. SABBATH SCHOOL LOGIC
        if (section === 'ss') {
            const val_wel = findValue(line, KEYWORDS.SS_WELCOME); if(val_wel) d.ss_welcome = val_wel;
            const val_hymn = findHymn(line, KEYWORDS.SS_HYMN); if(val_hymn) d.ss_hymn = val_hymn;
            const val_les = findValue(line, KEYWORDS.SS_LESSON); if(val_les) d.ss_lesson = val_les;
            const val_mis = findValue(line, KEYWORDS.SS_MISSION); if(val_mis) d.ss_mission = val_mis;
        }

        // 4. WORSHIP SERVICE LOGIC
        if (section === 'ws') {
            const val_call = findValue(line, KEYWORDS.WS_CALL); if(val_call) d.ws_call = val_call;
            const val_inv = findValue(line, KEYWORDS.WS_INVOCATION); if(val_inv) d.ws_invocation = val_inv;
            const val_hymn = findHymn(line, KEYWORDS.WS_HYMN); if(val_hymn) d.ws_hymn = val_hymn;
            const val_off = findValue(line, KEYWORDS.WS_OFFERING); if(val_off) d.ws_offering = val_off;
            const val_child = findValue(line, KEYWORDS.WS_CHILDREN); if(val_child) d.ws_children = val_child;
            const val_spec = findValue(line, KEYWORDS.WS_SPECIAL); if(val_spec) d.ws_special = val_spec;
            const val_sermon = findValue(line, KEYWORDS.WS_SERMON); if(val_sermon) d.ws_sermon = val_sermon;
            const val_close = findValue(line, KEYWORDS.WS_CLOSING); if(val_close) d.ws_closing = val_close;

            // Scripture often has "Text - Person". Try to split it.
            if (check(lower, KEYWORDS.WS_SCRIPTURE)) {
                // Logic: Grab the part that looks like numbers (23:4)
                if(line.match(/\d+:\d+/)) d.ws_scripture = line.replace(/scripture|reading|lectura/i, '').trim();
                else d.ws_scripture = findValue(line, KEYWORDS.WS_SCRIPTURE);
            }
        }

        // 5. ANNOUNCEMENTS
        if (section === 'announcements') {
            if (check(lower, KEYWORDS.SUNSET)) {
                const time = line.match(/\d{1,2}:\d{2}\s?(am|pm)?/i);
                if (time) d.sunset = time[0];
            } 
            else if (check(lower, KEYWORDS.YOUTH)) {
                 // Try to find a time
                 const time = line.match(/\d{1,2}:\d{2}\s?(am|pm)?/i);
                 d.youth = time ? time[0] : line;
            } 
            else if (line.length > 5 && !check(lower, KEYWORDS.SECTION_ANN)) {
                // Remove bullets like "•"
                const cleanLine = line.replace(/^[•\-\*]\s*/, '');
                ann_list.push(`<li>${cleanLine}</li>`);
            }
        }
    });

    d.announcements = ann_list.join('');

    // Write HTML
    let html = fs.readFileSync(TEMPLATE_FILE, 'utf8');
    for (const [key, value] of Object.entries(d)) {
        // If value is empty, we can choose to leave it blank or put "---"
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
    }
    fs.writeFileSync(OUTPUT_FILE, html);
    console.log("Bulletin built successfully.");
});
