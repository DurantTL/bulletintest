const fs = require('fs');
const mammoth = require('mammoth');

const INPUT_FILE = 'boletin.docx';
const TEMPLATE_FILE = 'template.html';
const OUTPUT_FILE = 'index.html';

// ============================================================
// VAN BUREN SPANISH BULLETIN PARSER 123
// Extracts all fields for the church bulletin website
// ============================================================

// Normalize text for comparison (remove accents, lowercase)
const normalize = (text) => text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Check if line contains any keyword
const hasKeyword = (line, keywords) => 
    keywords.some(k => normalize(line).includes(normalize(k)));

// Extract hymn number from text
const extractHymn = (text) => {
    const match = text.match(/#\s*(\d{1,3})/);
    if (match) return `Himno #${match[1]}`;
    const match2 = text.match(/himno\s*#?\s*(\d{1,3})/i);
    if (match2) return `Himno #${match2[1]}`;
    return null;
};

// Extract time from text
const extractTime = (text) => {
    const match = text.match(/(\d{1,2}:\d{2})\s*(am|pm)?/i);
    return match ? match[0] : null;
};

// Extract scripture reference
const extractScripture = (text) => {
    const match = text.match(/([A-Za-záéíóúñ]+\.?\s*\d+:\d+(-\d+)?)/i);
    return match ? match[0].trim() : null;
};

// Look ahead to find value after keyword line
const lookahead = (lines, index, maxLines = 3) => {
    for (let j = 1; j <= maxLines; j++) {
        const next = lines[index + j];
        if (!next || next.length === 0) continue;
        // Skip if it looks like another keyword/section
        if (next.length < 40 && !next.match(/^\d/) && !next.match(/^#/)) {
            // Check if it's a person name or value
            if (next.length > 2) return next;
        }
    }
    return '';
};

// Look ahead specifically for hymn
const lookaheadHymn = (lines, index) => {
    for (let j = 1; j <= 2; j++) {
        const next = lines[index + j];
        if (next) {
            const hymn = extractHymn(next);
            if (hymn) return hymn;
        }
    }
    return '';
};

// Look ahead for person after hymn
const lookaheadPersonAfterHymn = (lines, index) => {
    for (let j = 1; j <= 3; j++) {
        const next = lines[index + j];
        if (next && extractHymn(next)) {
            // Found hymn, now look for person
            const person = lines[index + j + 1];
            if (person && person.length > 2 && person.length < 50) {
                return person;
            }
        }
    }
    return '';
};

// ============================================================
// MAIN PARSER
// ============================================================
mammoth.extractRawText({ path: INPUT_FILE }).then(result => {
    const lines = result.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Complete data object matching template placeholders
    let d = {
        // Header
        date: '',
        pastor: '',
        
        // Verse of the week
        verse_text: '',
        verse_ref: '',
        
        // Elder
        elder: '',
        
        // Escuela Sabática
        ss_welcome_who: '',
        ss_hymn_inicial: '',
        ss_hymn_inicial_who: 'Servicio de Canto',
        ss_lectura_ref: '',
        ss_lectura_who: '',
        ss_oracion_who: '',
        ss_misionero_who: '',
        ss_especial_who: '',
        ss_rumbo_who: '',
        ss_repaso_info: '',
        ss_repaso_who: 'Maestros',
        ss_hymn_final: '#478',
        ss_hymn_final_who: 'Servicio de Canto',
        ss_oracion_final_who: '',
        ss_min_misioneros_who: '',
        
        // Culto Divino
        cd_entrada_hymn: 'Himno #33',
        cd_entrada_who: 'Servicio de Canto',
        cd_doxologia_hymn: 'Himno #32',
        cd_doxologia_who: 'Servicio de Canto',
        cd_invocacion_who: '',
        cd_bienvenida_info: 'Canto de Bienvenida',
        cd_bienvenida_who: '',
        cd_hymn_inicial: '',
        cd_hymn_inicial_who: 'Servicio de Canto',
        cd_lectura_ref: '',
        cd_lectura_who: '',
        cd_oracion_hymn: 'Himno #35',
        cd_oracion_who: '',
        cd_diezmo_hymn: 'Himno #524',
        cd_diezmo_who: '',
        cd_rincon_who: '',
        cd_especial_who: '',
        cd_sermon_who: '',
        cd_hymn_final: 'Himno #267',
        cd_hymn_final_who: 'Servicio de Canto',
        cd_oracion_final_who: '',
        cd_salida_who: 'Diaconos',
        
        // Info
        juventud_time: '',
        sunset_time: '',
        
        // Announcements
        announcements: ''
    };

    let section = 'header';
    let announcements = [];
    let inVerseArea = false;

    // --- PASS 1: Find date ---
    const datePatterns = [
        /^\d{1,2}\s+de\s+[a-záéíóúñ]+\s+(del?\s+)?\d{4}$/i,  // "22 de Noviembre del 2025"
        /^[a-záéíóúñ]+\s+\d{1,2},?\s*\d{4}$/i                // "Enero 3, 2026"
    ];
    
    for (let i = 0; i < Math.min(30, lines.length); i++) {
        for (const pattern of datePatterns) {
            if (pattern.test(lines[i])) {
                d.date = lines[i];
                break;
            }
        }
        if (d.date) break;
    }

    // --- PASS 2: Find pastor in header ---
    for (let i = 0; i < Math.min(15, lines.length); i++) {
        if (hasKeyword(lines[i], ['pastor'])) {
            // Check if name is on same line or next line
            const parts = lines[i].split(/[:\t]/);
            if (parts.length > 1 && parts[1].trim().length > 3) {
                d.pastor = parts[1].trim();
            } else {
                const next = lines[i + 1];
                if (next && next.length > 3 && next.length < 50) {
                    d.pastor = next;
                }
            }
            break;
        }
    }

    // --- PASS 3: Find verse ---
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Look for quoted text
        if ((line.startsWith('"') || line.startsWith('"') || line.startsWith('«')) && !d.verse_text) {
            d.verse_text = line;
            // Look for reference on next few lines
            for (let j = 1; j <= 3; j++) {
                const ref = lines[i + j];
                if (ref && extractScripture(ref) && ref.length < 30) {
                    d.verse_ref = ref;
                    break;
                }
            }
            break;
        }
        
        // Stop looking after reaching sections
        if (hasKeyword(line, ['escuela sabática', 'escuela sabatica'])) break;
    }

    // --- PASS 4: Main section parsing ---
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lower = normalize(line);

        // Section detection (only short lines)
        if (line.length < 30) {
            if (hasKeyword(lower, ['escuela sabática', 'escuela sabatica'])) { 
                section = 'ss'; 
                continue; 
            }
            if (hasKeyword(lower, ['culto divino'])) { 
                section = 'cd'; 
                continue; 
            }
            if (hasKeyword(lower, ['anuncios'])) { 
                section = 'ann'; 
                continue; 
            }
        }

        // ========== ESCUELA SABÁTICA ==========
        if (section === 'ss') {
            // Anciano de turno (appears in SS section usually)
            if (hasKeyword(line, ['anciano de turno']) && !d.elder) {
                d.elder = lookahead(lines, i);
            }
            
            // Bienvenida
            if (hasKeyword(line, ['bienvenida']) && !d.ss_welcome_who) {
                d.ss_welcome_who = lookahead(lines, i);
            }
            
            // Himno Inicial
            if (hasKeyword(line, ['himno inicial']) && !d.ss_hymn_inicial) {
                d.ss_hymn_inicial = lookaheadHymn(lines, i);
            }
            
            // Lectura Bíblica
            if (hasKeyword(line, ['lectura bíblica', 'lectura biblica']) && !d.ss_lectura_ref) {
                for (let j = 1; j <= 3; j++) {
                    const next = lines[i + j];
                    if (next) {
                        const scripture = extractScripture(next);
                        if (scripture) {
                            d.ss_lectura_ref = scripture;
                            const person = lines[i + j + 1];
                            if (person && person.length > 2 && person.length < 40) {
                                d.ss_lectura_who = person;
                            }
                            break;
                        }
                    }
                }
            }
            
            // Oración (not final)
            if (hasKeyword(line, ['oración', 'oracion']) && !hasKeyword(line, ['final']) && !d.ss_oracion_who) {
                d.ss_oracion_who = lookahead(lines, i);
            }
            
            // Misionero
            if (hasKeyword(line, ['misionero']) && !hasKeyword(line, ['min.']) && !d.ss_misionero_who) {
                d.ss_misionero_who = lookahead(lines, i);
            }
            
            // Especial (SS)
            if (hasKeyword(line, ['especial']) && !d.ss_especial_who) {
                d.ss_especial_who = lookahead(lines, i);
            }
            
            // Rumbo
            if (hasKeyword(line, ['rumbo']) && !d.ss_rumbo_who) {
                d.ss_rumbo_who = lookahead(lines, i);
            }
            
            // Repaso de la Lección
            if (hasKeyword(line, ['repaso']) && !d.ss_repaso_info) {
                const next = lookahead(lines, i);
                if (next) d.ss_repaso_info = next;
            }
            
            // Himno Final (SS)
            if (hasKeyword(line, ['himno final']) && !d.ss_hymn_final) {
                const hymn = lookaheadHymn(lines, i);
                if (hymn) d.ss_hymn_final = hymn;
            }
            
            // Oración Final (SS)
            if (hasKeyword(line, ['oración final', 'oracion final']) && !d.ss_oracion_final_who) {
                d.ss_oracion_final_who = lookahead(lines, i);
            }
            
            // Min. Misioneros
            if (hasKeyword(line, ['min. misioneros', 'minutos misioneros']) && !d.ss_min_misioneros_who) {
                d.ss_min_misioneros_who = lookahead(lines, i);
            }
        }

        // ========== CULTO DIVINO ==========
        if (section === 'cd') {
            // Entrada de Oficiante
            if (hasKeyword(line, ['entrada de oficiante', 'entrada']) && !d.cd_entrada_hymn) {
                const hymn = lookaheadHymn(lines, i);
                if (hymn) d.cd_entrada_hymn = hymn;
            }
            
            // Doxología
            if (hasKeyword(line, ['doxología', 'doxologia']) && !d.cd_doxologia_hymn) {
                const hymn = lookaheadHymn(lines, i);
                if (hymn) d.cd_doxologia_hymn = hymn;
            }
            
            // Invocación
            if (hasKeyword(line, ['invocación', 'invocacion']) && !d.cd_invocacion_who) {
                d.cd_invocacion_who = lookahead(lines, i);
            }
            
            // Bienvenida (CD)
            if (hasKeyword(line, ['bienvenida']) && !d.cd_bienvenida_who) {
                d.cd_bienvenida_who = lookahead(lines, i);
            }
            
            // Himno Inicial (CD)
            if (hasKeyword(line, ['himno inicial']) && !d.cd_hymn_inicial) {
                d.cd_hymn_inicial = lookaheadHymn(lines, i);
            }
            
            // Lectura Bíblica (CD)
            if (hasKeyword(line, ['lectura bíblica', 'lectura biblica']) && !d.cd_lectura_ref) {
                for (let j = 1; j <= 3; j++) {
                    const next = lines[i + j];
                    if (next) {
                        const scripture = extractScripture(next);
                        if (scripture) {
                            d.cd_lectura_ref = scripture;
                            const person = lines[i + j + 1];
                            if (person && person.length > 2 && person.length < 40) {
                                d.cd_lectura_who = person;
                            }
                            break;
                        }
                    }
                }
            }
            
            // Oración (CD) - with hymn
            if (hasKeyword(line, ['oración', 'oracion']) && !hasKeyword(line, ['final']) && !d.cd_oracion_who) {
                const hymn = lookaheadHymn(lines, i);
                if (hymn) d.cd_oracion_hymn = hymn;
                d.cd_oracion_who = lookaheadPersonAfterHymn(lines, i) || lookahead(lines, i);
            }
            
            // Diezmos y Ofrendas
            if (hasKeyword(line, ['diezmo', 'ofrenda']) && !d.cd_diezmo_who) {
                const hymn = lookaheadHymn(lines, i);
                if (hymn) d.cd_diezmo_hymn = hymn;
                d.cd_diezmo_who = lookaheadPersonAfterHymn(lines, i) || lookahead(lines, i);
            }
            
            // Rincón Infantil
            if (hasKeyword(line, ['rincón infantil', 'rincon infantil']) && !d.cd_rincon_who) {
                d.cd_rincon_who = lookahead(lines, i);
            }
            
            // Especial (CD)
            if (hasKeyword(line, ['especial']) && !d.cd_especial_who) {
                d.cd_especial_who = lookahead(lines, i);
            }
            
            // Sermón
            if (hasKeyword(line, ['sermón', 'sermon']) && !d.cd_sermon_who) {
                d.cd_sermon_who = lookahead(lines, i);
            }
            
            // Himno Final (CD)
            if (hasKeyword(line, ['himno final']) && !d.cd_hymn_final) {
                const hymn = lookaheadHymn(lines, i);
                if (hymn) d.cd_hymn_final = hymn;
            }
            
            // Canto Tema (alternative name for closing hymn)
            if (hasKeyword(line, ['canto tema']) && !d.cd_hymn_final) {
                const hymn = lookaheadHymn(lines, i);
                if (hymn) d.cd_hymn_final = hymn;
            }
            
            // Oración Final (CD)
            if (hasKeyword(line, ['oración final', 'oracion final']) && !d.cd_oracion_final_who) {
                d.cd_oracion_final_who = lookahead(lines, i);
            }
            
            // Salida en Orden
            if (hasKeyword(line, ['salida']) && !d.cd_salida_who) {
                const who = lookahead(lines, i);
                if (who) d.cd_salida_who = who;
            }
        }

        // ========== ANUNCIOS ==========
        if (section === 'ann') {
            // Sunset time
            if (hasKeyword(line, ['puesta de sol', 'puesta del sol'])) {
                const time = extractTime(line);
                if (time) d.sunset_time = time;
            }
            // Youth meeting time
            else if (hasKeyword(line, ['sociedad de jóvenes', 'sociedad de jovenes', 'juventud'])) {
                const time = extractTime(line);
                if (time) d.juventud_time = time;
            }
            // Regular announcements
            else if (line.length > 20) {
                // Skip social media links and footer quotes
                if (!hasKeyword(line, ['facebook', 'youtube', 'instagram', 'siguenos', 'síguenos', 
                                        'le esperamos', 'dios le bendiga', 'tome tiempo', 
                                        'efesios', 'estad, pues'])) {
                    const cleanLine = line.replace(/^[•\-\*]\s*/, '');
                    announcements.push(`<li>${cleanLine}</li>`);
                }
            }
        }
    }

    d.announcements = announcements.join('\n          ');

    // --- OUTPUT ---
    try {
        let html = fs.readFileSync(TEMPLATE_FILE, 'utf8');
        for (const [key, value] of Object.entries(d)) {
            html = html.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
        }
        fs.writeFileSync(OUTPUT_FILE, html);
        console.log('✅ Bulletin generated: ' + OUTPUT_FILE);
    } catch (err) {
        console.error('❌ Template error:', err.message);
    }

    // --- DISPLAY RESULTS ---
    console.log('\n📊 Extracted Data:\n');
    console.log('─── HEADER ───');
    console.log(`  Date:    ${d.date || '(not found)'}`);
    console.log(`  Pastor:  ${d.pastor || '(not found)'}`);
    console.log(`  Elder:   ${d.elder || '(not found)'}`);
    console.log(`  Verse:   ${d.verse_text ? d.verse_text.substring(0, 50) + '...' : '(not found)'}`);
    
    console.log('\n─── ESCUELA SABÁTICA ───');
    console.log(`  Bienvenida:      ${d.ss_welcome_who || '-'}`);
    console.log(`  Himno Inicial:   ${d.ss_hymn_inicial || '-'}`);
    console.log(`  Lectura:         ${d.ss_lectura_ref || '-'} → ${d.ss_lectura_who || '-'}`);
    console.log(`  Misionero:       ${d.ss_misionero_who || '-'}`);
    console.log(`  Min. Misioneros: ${d.ss_min_misioneros_who || '-'}`);
    
    console.log('\n─── CULTO DIVINO ───');
    console.log(`  Invocación:      ${d.cd_invocacion_who || '-'}`);
    console.log(`  Bienvenida:      ${d.cd_bienvenida_who || '-'}`);
    console.log(`  Himno Inicial:   ${d.cd_hymn_inicial || '-'}`);
    console.log(`  Lectura:         ${d.cd_lectura_ref || '-'} → ${d.cd_lectura_who || '-'}`);
    console.log(`  Oración:         ${d.cd_oracion_hymn || '-'} → ${d.cd_oracion_who || '-'}`);
    console.log(`  Diezmo:          ${d.cd_diezmo_hymn || '-'} → ${d.cd_diezmo_who || '-'}`);
    console.log(`  Rincón Infantil: ${d.cd_rincon_who || '-'}`);
    console.log(`  Especial:        ${d.cd_especial_who || '-'}`);
    console.log(`  Sermón:          ${d.cd_sermon_who || '-'}`);
    
    console.log('\n─── INFO ───');
    console.log(`  Sunset:    ${d.sunset_time || '(not found)'}`);
    console.log(`  Juventud:  ${d.juventud_time || '(not found)'}`);
    console.log(`  Anuncios:  ${announcements.length} items`);

}).catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
