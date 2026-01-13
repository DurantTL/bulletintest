# 📋 Boletín Automático - Iglesia Adventista Van Buren

Sistema automatizado para actualizar el boletín de la iglesia en el sitio web. La secretaria envía un email con el archivo Word y el sitio web se actualiza automáticamente.

## 🚀 Cómo Funciona

```
┌─────────────┐     ┌─────────────┐     ┌──────────┐     ┌────────┐     ┌─────────┐
│ Secretaria  │ ──► │    Gmail    │ ──► │ Make.com │ ──► │ GitHub │ ──► │ Website │
│   (Email)   │     │ (Filtro)    │     │ (Robot)  │     │ (Repo) │     │ (Live)  │
└─────────────┘     └─────────────┘     └──────────┘     └────────┘     └─────────┘
```

---

## 📝 Para la Secretaria

### Cómo actualizar el boletín:

1. **Crear** el boletín en Word usando el formato estándar
2. **Guardar** el archivo como `boletin.docx`
3. **Adjuntar** el archivo a un email
4. **Enviar** a: `[TU_EMAIL_DEDICADO]@gmail.com`
5. **Esperar** ~2 minutos. ¡El sitio web se actualiza solo!

### Formato del Documento Word

El sistema busca estas secciones y palabras clave:

```
ESCUELA SABÁTICA
  Bienvenida          → [nombre]
  Himno Inicial       → #123
  Lectura Bíblica     → Juan 3:16 → [nombre]
  Oración             → [nombre]
  Misionero           → [nombre]
  ...

CULTO DIVINO
  Invocación          → [nombre]
  Bienvenida          → [nombre]
  Himno Inicial       → #456
  Sermón              → [nombre]
  ...

ANUNCIOS
  • Primer anuncio aquí
  • Segundo anuncio aquí
  
  Puesta de Sol: 5:17 pm
  Sociedad de Jóvenes: 5:00 pm
```

---

## ⚙️ Configuración Inicial (Administrador)

### Paso 1: Crear el Repositorio en GitHub

1. Crear un nuevo repositorio en GitHub
2. Subir estos archivos:
   - `build.js`
   - `template.html`
   - `package.json`
   - `.github/workflows/build.yml`
3. Ir a **Settings → Pages**
4. En **Source**, seleccionar **Deploy from a branch**
5. Seleccionar la rama `gh-pages` (se crea automáticamente después del primer build)
6. Guardar y copiar la URL del sitio (ej: `https://usuario.github.io/vanburen-bulletin/`)

### Paso 2: Configurar Make.com

1. Crear cuenta en [Make.com](https://www.make.com) (plan gratuito)
2. Crear un **Nuevo Escenario**

#### Módulo 1: Webhook (Recibir Email)

- Agregar módulo: **Webhooks → Custom mailhook**
- Copiar la dirección de email generada (ej: `abc123@hook.us1.make.com`)

#### Módulo 2: GitHub (Subir Archivo)

- Agregar módulo: **GitHub → Update a File**
- Configurar:
  - **Connection**: Conectar tu cuenta de GitHub
  - **Repository Owner**: Tu usuario de GitHub
  - **Repository Name**: Nombre del repositorio
  - **Branch**: `main`
  - **File Path**: `boletin.docx`
  - **File Content**: Hacer clic en el icono de mapeo y seleccionar `Attachments[] → Data` del módulo anterior
  - **Commit Message**: `Actualización del boletín`

3. Activar el escenario (toggle **Scheduling ON**)

### Paso 3: Configurar Gmail (Filtro de Seguridad)

Para evitar spam y proteger el sistema:

1. Crear una cuenta de Gmail dedicada (ej: `boletin.vanburen@gmail.com`)
2. Ir a **Configuración → Reenvío**
3. Agregar la dirección de Make.com como destino de reenvío
4. Crear un **Filtro**:
   - **De**: `secretaria@iglesia.org` (emails autorizados)
   - **Tiene adjunto**: ✓
   - **Acción**: Reenviar a la dirección de Make.com

---

## 🌐 Integrar en el Sitio Web

Copiar este código HTML donde quieras mostrar el boletín:

```html
<style>
  .bulletin-wrapper {
    position: relative;
    width: 100%;
    overflow: hidden;
  }
  .bulletin-wrapper iframe {
    width: 100%;
    border: none;
    height: 1600px;
  }
  @media (max-width: 768px) {
    .bulletin-wrapper iframe {
      height: 3200px; /* taller for stacked mobile layout */
    }
  }
</style>

<div class="bulletin-wrapper">
  <iframe 
      src="https://duranttl.github.io/bulletintest/" 
      scrolling="no"
      title="Boletín Semanal">
  </iframe>
</div>
```

---

## 🛠 Solución de Problemas

### El sitio muestra error 404
- Verificar que GitHub Pages esté configurado en `gh-pages`
- Esperar unos minutos después del primer push

### El boletín no se actualizó
1. Revisar la pestaña **Actions** en GitHub - ¿Hay un error (rojo)?
2. Revisar el historial de Make.com - ¿Se ejecutó el escenario?
3. ¿Se envió el email desde una dirección autorizada?
4. ¿El archivo se llama exactamente `boletin.docx`?

### Datos incorrectos en el sitio
- Revisar el documento Word
- ¿Están bien escritas las palabras clave? (ej: "Sermón" no "Serman")
- ¿El formato de tabla es correcto?

### Campos vacíos
El sistema espera este patrón:
```
Palabra Clave
[línea vacía o información]
Nombre de la Persona
```

---

## 📁 Archivos del Sistema

| Archivo | Descripción |
|---------|-------------|
| `build.js` | Script que lee el Word y genera el HTML |
| `template.html` | Plantilla HTML con los placeholders |
| `package.json` | Dependencias de Node.js |
| `.github/workflows/build.yml` | Configuración de GitHub Actions |
| `boletin.docx` | El archivo que sube la secretaria |
| `index.html` | El archivo generado (no editar manualmente) |

---

## 📊 Campos Extraídos

### Encabezado
- Fecha
- Pastor
- Versículo de la semana
- Anciano de turno

### Escuela Sabática
- Bienvenida
- Himno Inicial
- Lectura Bíblica
- Oración
- Misionero
- Especial
- Rumbo
- Repaso de la Lección
- Himno Final
- Oración Final
- Min. Misioneros

### Culto Divino
- Entrada de Oficiante
- Doxología
- Invocación
- Bienvenida
- Himno Inicial
- Lectura Bíblica
- Oración
- Diezmos y Ofrendas
- Rincón Infantil
- Especial
- Sermón
- Himno Final
- Oración Final
- Salida en Orden

### Información
- Puesta del Sol
- Sociedad de Jóvenes
- Anuncios (lista)

---

## 🔧 Personalización

### Cambiar colores
En `template.html`, modificar las variables CSS:
```css
:root {
  --brand: #bf630e;     /* Color principal (naranja) */
  --accent: #0b6a53;    /* Color de acento (verde) */
}
```

### Cambiar dirección de la iglesia
En `template.html`, buscar y modificar:
```html
<p>902 Oak Grove Rd, Van Buren, AR 72956</p>
```

### Agregar/quitar redes sociales
En `template.html`, modificar la sección del footer.

---

## 📞 Soporte

Si hay problemas con el sistema, contactar al administrador del sitio web.

---

*Sistema creado para la Iglesia Adventista del Séptimo Día de Van Buren*
