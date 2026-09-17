// ==========================================
// ASISTENTE UNAMAN — lógica principal
// ==========================================

// ---------- Estado global ----------
let vozAutomatica = false;
let reconocimiento = null;
let reconociendo = false;
let perfil = { voz: null, ocupacion: null };
let flujo = null;          // flujo de llenado activo
let modoEnLinea = false;   // guia en línea activa

const CLAVE_PRIMER_USO = "unaman_privacidad_aceptada";
const CLAVE_PERFIL = "unaman_perfil";
const CLAVE_SOLICITUDES = "unaman_solicitudes";

// ---------- Utilidades ----------
function normalizar(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function escapar(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}

function hoyISO() {
    return new Date().toISOString().slice(0, 10);
}

function formatearFecha(iso) {
    const f = new Date(iso + "T12:00:00");
    return f.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

function generarFolio() {
    const anio = new Date().getFullYear();
    const azar = Math.floor(1000 + Math.random() * 9000);
    return "UN-" + anio + "-" + azar;
}

function guardarLocal(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* almacenamiento no disponible */ }
}

function leerLocal(clave, def) {
    try { return JSON.parse(localStorage.getItem(clave)) ?? def; } catch (e) { return def; }
}

// ---------- Voz: pronunciación correcta de siglas ----------
const PRONUNCIACION = [
    { ver: /SEMAR[- ]?UNAMAN|SEMAR\s*·\s*UNAMAN/gi, decir: "Secretaría de Marina, Unidad de la Autoridad Marítima Nacional" },
    { ver: /SEMAR/gi, decir: "Secretaría de Marina" },
    { ver: /UNAMAN/gi, decir: "Unidad de la Autoridad Marítima Nacional" },
    { ver: /CURP/gi, decir: "curpe" },
    { ver: /RFC/gi, decir: "erre efe ce" },
    { ver: /INE/gi, decir: "ene" },
    { ver: /STCW/gi, decir: "este ce doble uve" },
    { ver: /ISPS/gi, decir: "i ese pe ese" },
    { ver: /PDF/gi, decir: "pede efe" }
];

function textoParaVoz(texto) {
    let t = texto.replace(/[•📔🔄📄🚢⛵🏠💰🕐📍⚠️✅🩺📸🤝💡❌🔍💬⚓🤖🔒🗑️⚙️🎤➤🔊🏗️🛢️🎣👨👩📜🛡️]/gu, "");
    for (const p of PRONUNCIACION) t = t.replace(p.ver, " " + p.decir + " ");
    return t.replace(/\s+/g, " ").trim();
}

let vocesEspanol = [];
function cargarVoces() {
    if (!("speechSynthesis" in window)) return;
    vocesEspanol = speechSynthesis.getVoices().filter(v => v.lang && v.lang.toLowerCase().startsWith("es"));
}
if ("speechSynthesis" in window) {
    cargarVoces();
    speechSynthesis.onvoiceschanged = cargarVoces;
}

function elegirVoz() {
    if (!vocesEspanol.length) cargarVoces();
    if (!vocesEspanol.length) return null;
    const buscado = perfil.voz === "masculina" ? ["male", "hombre", "jorge", "carlos", "juan", "diego", "paulina"] : ["female", "mujer", "sabina", "mónica", "monica", "paulina", "helena", "laura"];
    for (const clave of buscado) {
        const v = vocesEspanol.find(x => x.name.toLowerCase().includes(clave));
        if (v) return v;
    }
    // sin coincidencia de nombre, elegir por tono aproximado de la lista
    return vocesEspanol[perfil.voz === "masculina" ? Math.min(1, vocesEspanol.length - 1) : 0];
}

function leerEnVoz(texto, boton) {
    if (!("speechSynthesis" in window)) return;
    if (boton && boton.dataset.leyendo === "si") {
        speechSynthesis.cancel();
        boton.dataset.leyendo = "no";
        boton.classList.remove("leyendo");
        return;
    }
    speechSynthesis.cancel();
    if (boton) {
        boton.dataset.leyendo = "si";
        boton.classList.add("leyendo");
    }
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = textoParaVoz(texto);
    utterance.lang = "es-MX";
    utterance.rate = 0.95;
    utterance.pitch = perfil.voz === "masculina" ? 0.85 : 1.1;
    const v = elegirVoz();
    if (v) utterance.voice = v;
    utterance.onend = () => {
        if (boton) {
            boton.dataset.leyendo = "no";
            boton.classList.remove("leyendo");
        }
    };
    speechSynthesis.speak(utterance);
}

// ---------- Almacenamiento de solicitudes ----------
function cargarSolicitudes() {
    return leerLocal(CLAVE_SOLICITUDES, []);
}

function guardarSolicitud(s) {
    const lista = cargarSolicitudes();
    lista.push(s);
    guardarLocal(CLAVE_SOLICITUDES, lista);
}

function buscarSolicitud(folio, curp) {
    const f = normalizar(folio.trim());
    const c = normalizar(curp.trim());
    return cargarSolicitudes().find(s =>
        normalizar(s.folio) === f && normalizar(s.curp).includes(c) && c.length >= 4
    );
}

// ---------- Chat: render ----------
function agregarMensaje(texto, quien, botones, opcionesExtra) {
    const caja = document.getElementById("cuadro-conversacion");
    const div = document.createElement("div");
    div.className = "mensaje " + quien;

    const opciones = opcionesExtra || {};
    const cuerpo = opciones.html || escapar(texto).replace(/\n/g, "<br>");

    if (quien === "asistente") {
        div.innerHTML = `
            <div class="contenido-mensaje">
                <span class="texto-mensaje">${cuerpo}</span>
                <button class="boton-voz" title="Escuchar en voz alta">🔊</button>
            </div>
        `;
        const btnVoz = div.querySelector(".boton-voz");
        btnVoz.addEventListener("click", () => leerEnVoz(texto, btnVoz));
        if (botones && botones.length) {
            const cont = document.createElement("div");
            cont.className = "botones-mensaje";
            for (const b of botones) {
                const btn = document.createElement("button");
                btn.className = "boton-accion" + (b.estilo ? " " + b.estilo : "");
                btn.innerHTML = escapar(b.etiqueta);
                btn.addEventListener("click", b.accion);
                cont.appendChild(btn);
            }
            div.querySelector(".texto-mensaje").appendChild(cont);
        }
    } else {
        div.innerHTML = `<div class="texto-mensaje">${cuerpo}</div>`;
    }

    caja.appendChild(div);
    caja.scrollTop = caja.scrollHeight;
    return div;
}

function pensarYResponder(fn, ms) {
    const indicador = document.getElementById("indicador");
    indicador.classList.add("visible");
    const caja = document.getElementById("cuadro-conversacion");
    caja.scrollTop = caja.scrollHeight;
    setTimeout(() => {
        indicador.classList.remove("visible");
        fn();
    }, ms || 500);
}

function decir(texto, botones, opciones) {
    agregarMensaje(texto, "asistente", botones, opciones);
    if (vozAutomatica) leerEnVoz(texto, null);
}

// ---------- Botones rápidos (chips) ----------
function chipsPorDefecto() {
    const base = [
        { etiqueta: "📋 Ver todos los trámites", texto: "todos" },
        { etiqueta: "🔄 Renovar libreta", texto: "renovar" },
        { etiqueta: "🚢 Despacho", texto: "despacho" },
        { etiqueta: "💰 Costos", texto: "costos" },
        { etiqueta: "🕐 Horarios", texto: "horario" },
        { etiqueta: "🔎 Mi solicitud", texto: "consultar estatus" }
    ];
    return base;
}

function chipsPersonalizados() {
    const base = chipsPorDefecto();
    if (!perfil.ocupacion) return base;
    const ocup = OCUPACIONES.find(o => o.id === perfil.ocupacion);
    if (!ocup) return base;
    const extra = ocup.recomendados.slice(0, 3).map(id => {
        const t = TRAMITES.find(x => x.id === id);
        return t ? { etiqueta: (t.categoria === "libretas" ? "📔" : "📄") + " " + t.nombre.split("—")[0].trim(), texto: normalizar(t.nombre.split("—")[0].trim()) } : null;
    }).filter(Boolean);
    return extra.concat(base);
}

function renderChips() {
    const zona = document.getElementById("acciones");
    zona.innerHTML = "";
    for (const c of chipsPersonalizados()) {
        const btn = document.createElement("button");
        btn.className = "chip" + (c.principal ? " principal" : "");
        btn.textContent = c.etiqueta;
        btn.addEventListener("click", () => {
            document.getElementById("texto-usuario").value = c.texto;
            enviarMensaje();
        });
        zona.appendChild(btn);
    }
}

// ---------- Menú de trámites por categorías ----------
function menuTramites() {
    let texto = "📋 ESTOS SON TODOS LOS TRÁMITES QUE TE AYUDO A REALIZAR\n\n";
    const botones = [];
    for (const cat of CATEGORIAS) {
        const lista = TRAMITES.filter(t => t.categoria === cat.id);
        texto += cat.emoji + " " + cat.nombre.toUpperCase() + "\n";
        for (const t of lista) {
            texto += "   • " + t.nombre + (t.enLinea ? "  ✅En línea" : "") + "\n";
            botones.push({ etiqueta: t.nombre + (t.enLinea ? " ✅" : ""), accion: () => elegirTramite(t) });
        }
        texto += "\n";
    }
    texto += "¿Cuál te interesa? Toca el trámite y te llevo de la mano.";
    decir(texto, botones.slice(0, 14));
}

// ---------- Elección de trámite: ¿en línea o en papel? ----------
function elegirTramite(tramite) {
    flujo = { tramite, datos: {}, indice: 0, paso: "pregunta-camino" };
    let texto = "¡Muy buena elección! 🤝 " + tramite.nombre + " (" + tramite.clave + ").\n\n";
    texto += tramite.sinopsis + "\n\n";
    if (tramite.enLinea) {
        texto += "Este trámite puedes concluirlo completamente EN LÍNEA desde el portal oficial de SEMAR, o si prefieres, te ayudo a llenar tu solicitud para imprimirla y presentarla en la Capitanía de Puerto.\n\n¿Qué prefieres?";
    } else {
        texto += "Este trámite se presenta en la Capitanía de Puerto, pero te ayudo a llenar tu solicitud ahora mismo para que llegues con todo listo. También puedes ver su guía paso a paso para el portal oficial.\n\n¿Qué prefieres?";
    }
    decir(texto, [
        { etiqueta: "🌐 Ayúdame a hacerlo en línea", accion: () => empezarEnLinea(), estilo: "primario" },
        { etiqueta: "🖨️ Ayúdame a llenar la solicitud para imprimir", accion: () => empezarLlenado() }
    ]);
}

function empezarEnLinea() {
    if (!flujo) return;
    flujo.paso = "guia-linea";
    modoEnLinea = true;
    const t = flujo.tramite;
    let texto = "¡Perfecto! Vamos juntos paso a paso. 🤝\n\n";
    texto += "ANTES DE EMPEZAR, ten a la mano:\n";
    t.requisitos.forEach((r, i) => { texto += (i + 1) + ". " + r + "\n"; });
    texto += "\nCuando los tengas listos, abre el portal oficial de SEMAR. Ahí buscarás la sección de trámites y elegirás \"" + t.nombre + "\".\n\n";
    texto += "Te acompañaré durante todo el proceso: si te atoras en alguna pantalla o campo, escribe \"¿cómo lleno...?\" y te explico.\n\n¿Todo listo para abrir el portal?";
    decir(texto, [
        { etiqueta: "🌐 Sí, abrir el portal oficial de SEMAR", accion: () => abrirPortal(), estilo: "primario" },
        { etiqueta: "🖨️ Mejor lléname la solicitud para imprimir", accion: () => empezarLlenado() }
    ]);
}

function abrirPortal() {
    if (!flujo) return;
    window.open(flujo.tramite.portal, "_blank", "noopener");
    decir(
        "¡Listo, abrí el portal oficial para ti! 🌐\n\nRecuerda:\n• Yo soy solo tu guía de apoyo; el trámite se concluye en el sitio oficial de SEMAR.\n• Si te preguntas algo en el camino, escríbeme: \"¿cómo lleno la CURP?\" y te explico.\n• Al terminar, vuelve aquí y puedes consultar el estatus con tu folio en \"Mi solicitud\". ⚓",
        [{ etiqueta: "✅ Ya terminé mi trámite en línea", accion: () => terminarEnLinea() }]
    );
}

function terminarEnLinea() {
    decir("¡Felicidades! 🎉 Completaste tu trámite en línea.\n\nGuarda tu folio y comprobante que te dio el portal oficial. Si necesitas otro trámite, aquí estoy. ⚓");
    flujo = null;
    modoEnLinea = false;
}

// ---------- Llenado de solicitud (camino en papel) ----------
function empezarLlenado() {
    if (!flujo) return;
    flujo.paso = "llenado";
    flujo.indice = 0;
    decir("¡Va! Te voy a hacer unas preguntas, una por una. 🤝 No te preocupes si te equivocas: puedes escribir \"corregir\" para volver atrás en cualquier momento.\n\n" + flujo.tramite.campos[0].pregunta);
}

function procesarRespuestaLlenado(texto) {
    const t = flujo.tramite;
    const campo = t.campos[flujo.indice];

    if (normalizar(texto).includes("corregir")) {
        if (flujo.indice === 0) {
            decir("Estamos en la primera pregunta. " + campo.pregunta);
        } else {
            flujo.indice--;
            const previo = t.campos[flujo.indice];
            delete flujo.datos[previo.id];
            decir("Sin problema. " + previo.pregunta);
        }
        return;
    }

    const error = validarCampo(campo, texto);
    if (error) {
        decir("⚠️ " + error + "\n\n" + campo.pregunta);
        return;
    }

    flujo.datos[campo.id] = texto;
    flujo.indice++;

    if (flujo.indice < t.campos.length) {
        const siguiente = t.campos[flujo.indice];
        const frases = ["¡Muy bien! ", "¡Excelente! ", "¡Perfecto! ", "¡Gracias! "];
        const frase = frases[(flujo.indice - 1) % frases.length];
        let msg = frase + siguiente.pregunta;
        // Recordatorios contextuales
        if (siguiente.id === "curp") msg += "\n\n💡 La CURP está en tu acta de nacimiento o en tu INE. Mide 18 caracteres.";
        decir(msg);
    } else {
        concluirSolicitud();
    }
}

function validarCampo(campo, valor) {
    const v = valor.trim();
    if (campo.obligatorio && !v) return "Ese dato es necesario para tu solicitud.";
    if (!v) return null;
    if (campo.tipo === "curp") {
        const curp = v.toUpperCase();
        if (!/^[A-Z][AEIOU][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]\d$/.test(curp)) {
            return "Ese CURP no parece correcto. Debe tener 18 caracteres: 4 letras, tu fecha de nacimiento, tu sexo y 3 letras de tu estado. Revisa tu acta de nacimiento o tu INE.";
        }
    }
    if (campo.tipo === "telefono" && !/^\d{10}$/.test(v.replace(/[\s-]/g, ""))) {
        return "El teléfono debe ser de 10 dígitos, por ejemplo: 3221234567.";
    }
    if (campo.tipo === "correo" && v !== "no tengo" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        return "Ese correo no parece válido. Revisa que tenga @ y punto, o escribe \"no tengo\".";
    }
    if (campo.tipo === "numero" && !/^\d+$/.test(v)) return "Escribe solo el número, por favor.";
    return null;
}

function concluirSolicitud() {
    const t = flujo.tramite;
    const curp = (flujo.datos.curp || flujo.datos.curpPatron || "S/D").toUpperCase();
    const solicitud = {
        folio: generarFolio(),
        tramiteId: t.id,
        tramiteNombre: t.nombre,
        clave: t.clave,
        fecha: hoyISO(),
        curp: curp,
        datos: { ...flujo.datos },
        requisitos: t.requisitos,
        estatus: "recibida",
        historial: [{ estatus: "recibida", fecha: hoyISO(), nota: "Solicitud creada en el asistente" }]
    };
    guardarSolicitud(solicitud);

    let resumen = "🎉 ¡LO LOGRAMOS! Tu solicitud está completa.\n\n";
    resumen += "📄 " + t.nombre + " (" + t.clave + ")\n";
    resumen += "🔖 Tu folio de seguimiento: " + solicitud.folio + "\n\n";
    resumen += "Guarda tu folio: con él y tu CURP podrás preguntarme \"¿qué pasó con mi solicitud?\" en cualquier momento.\n\n";
    resumen += "Tu hoja de solicitud ya está lista para descargar e imprimir. ¡Llévala con tu carpeta de documentos a la Capitanía!";

    flujo = null;
    decir(resumen, [
        { etiqueta: "🖨️ Descargar mi hoja de solicitud (PDF)", accion: () => generarPDF(solicitud), estilo: "primario" },
        { etiqueta: "📄 Ver qué más debo llevar en mi carpeta", accion: () => decirCarpeta(t) },
        { etiqueta: "🔎 Ver el estatus de mi solicitud", accion: () => iniciarConsultaEstatus() }
    ]);
}

function decirCarpeta(t) {
    let texto = "📁 TU CARPETA PARA LA VENTANILLA\n\nAdemás de tu hoja de solicitud, lleva:\n";
    t.requisitos.forEach((r, i) => { texto += (i + 1) + ". " + r + " (original y una copia)\n"; });
    texto += "\n📍 Preséntate en la Capitanía de Puerto en horario de Lunes a Viernes, 9:00 a 13:00 h.\n💡 Llega temprano: la atención es por orden de llegada.";
    decir(texto);
}

// ---------- PDF de la hoja de solicitud ----------
function generarPDF(s) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "letter" });
    const M = 22;           // margen izquierdo
    const ancho = 216 - M * 2;
    let y = 20;

    doc.setFont("helvetica", "bold"); doc.setFontSize(14);
    doc.text("SECRETARÍA DE MARINA", 108, y, { align: "center" }); y += 6;
    doc.text("UNIDAD DE LA AUTORIDAD MARÍTIMA NACIONAL", 108, y, { align: "center" }); y += 8;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text("Hoja de solicitud de trámite (documento de apoyo, generada por asistente no oficial)", 108, y, { align: "center" }); y += 4;
    doc.setDrawColor(0, 58, 93); doc.setLineWidth(0.6);
    doc.line(M, y, M + ancho, y); y += 8;

    doc.setFont("helvetica", "bold"); doc.setFontSize(12);
    doc.text("SOLICITUD: " + s.tramiteNombre.toUpperCase(), M, y, { maxWidth: ancho }); y += 7;
    doc.setFontSize(10);
    doc.text("Clave del trámite: " + s.clave + "    |    Folio de seguimiento: " + s.folio, M, y); y += 6;
    doc.text("Fecha de llenado: " + formatearFecha(s.fecha), M, y); y += 8;

    doc.setFont("helvetica", "bold");
    doc.text("DATOS CAPTURADOS", M, y); y += 7;
    doc.setFont("helvetica", "normal");
    const etiquetas = {
        nombre: "Nombre completo", curp: "CURP", domicilio: "Domicilio", ocupacion: "Ocupación / puesto",
        capitania: "Capitanía de Puerto", telefono: "Teléfono", correo: "Correo electrónico",
        tipoLibreta: "Tipo de libreta", folioLibreta: "Folio de libreta actual", motivo: "Motivo",
        nombrePatron: "Nombre del Patrón", nombreEmbarcacion: "Nombre de la embarcación", matricula: "Matrícula",
        puertoSalida: "Puerto de salida", puertoDestino: "Puerto de destino", numTripulantes: "Personas a bordo",
        fechaZarpe: "Fecha tentativa de zarpe", zonaNavegacion: "Zona de navegación", proposito: "Propósito",
        organizacion: "Organización", responsable: "Responsable", nombreEvento: "Nombre del evento",
        fechaEvento: "Fecha del evento", zonaEvento: "Zona del evento", numParticipantes: "Participantes",
        nombrePropietario: "Nombre del propietario", tipoEmbarcacion: "Tipo de embarcación", eslora: "Eslora",
        motor: "Motor", puertoBase: "Puerto base", cambioTipo: "Dato a cambiar", datoNuevo: "Dato nuevo",
        empresa: "Empresa / instalación", tipoTramite: "Tipo de trámite", buque: "Buque o instalación",
        localidad: "Localidad", motivacion: "Motivación", experiencia: "Experiencia marítima",
        curso: "Curso de patrón", numLibreta: "Folio de libreta", periodo: "Periodo", embarcacion: "Embarcación donde faena",
        especie: "Especies que captura"
    };
    for (const [clave, valor] of Object.entries(s.datos)) {
        const etiqueta = etiquetas[clave] || clave;
        doc.setFont("helvetica", "bold");
        doc.text(etiqueta + ":", M, y);
        doc.setFont("helvetica", "normal");
        const lineas = doc.splitTextToSize(String(valor), ancho - 55);
        doc.text(lineas, M + 55, y);
        y += Math.max(6, lineas.length * 5);
        if (y > 240) { doc.addPage(); y = 20; }
    }

    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text("DOCUMENTOS QUE DEBE ADJUNTAR (original y copia)", M, y); y += 7;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    for (const req of s.requisitos) {
        const lineas = doc.splitTextToSize("• " + req, ancho);
        doc.text(lineas, M, y);
        y += lineas.length * 4.2;
        if (y > 250) { doc.addPage(); y = 20; }
    }

    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(120);
    const lineas = doc.splitTextToSize(
        "Este documento es de apoyo y no sustituye el formato oficial. La solicitud se presenta en la Capitanía de Puerto en horario de 9:00 a 13:00 h, lunes a viernes. Información oficial: gob.mx/semar/unaman. Sus datos se protegen conforme al aviso de privacidad de este sitio.",
        ancho
    );
    doc.text(lineas, M, y);

    doc.save("Solicitud_" + s.clave + "_" + s.folio + ".pdf");
}

// ---------- Consulta de estatus ----------
function iniciarConsultaEstatus() {
    decir(
        "¡Claro! Vamos a revisar tu solicitud. 🔎\n\nDame tu folio de seguimiento (empieza con \"UN-\"). Si no lo tienes a la mano, te puedo mostrar las solicitudes guardadas en este dispositivo.",
        [
            { etiqueta: "📋 Ver mis solicitudes guardadas aquí", accion: () => listarSolicitudesLocales() }
        ]
    );
    flujo = { paso: "consultar-folio" };
}

function listarSolicitudesLocales() {
    const lista = cargarSolicitudes();
    if (!lista.length) {
        decir("Todavía no tienes solicitudes guardadas en este dispositivo. Cuando completes una, aparecerá aquí. 🤝");
        flujo = null;
        return;
    }
    const botones = lista.slice(-5).reverse().map(s => ({
        etiqueta: "📄 " + s.folio + " — " + s.tramiteNombre.split("—")[0].trim(),
        accion: () => mostrarEstatus(s)
    }));
    decir("Estas son tus solicitudes guardadas en este dispositivo. Toca la tuya para ver su estatus:", botones);
}

function mostrarEstatus(s) {
    const pasos = ["recibida", "en proceso", "concluida"];
    const indiceActual = pasos.indexOf(s.estatus);
    let html = escapar("🔎 " + s.folio + " — " + s.tramiteNombre + "\n");
    html += escapar("📅 Creada: " + formatearFecha(s.fecha) + " · Estatus: " + s.estatus.toUpperCase() + "\n");
    const ultimo = s.historial && s.historial.length ? s.historial[s.historial.length - 1] : null;
    html += escapar(ultimo ? "📝 Último movimiento: " + ultimo.fecha + (ultimo.nota ? " — " + ultimo.nota : "") : "");

    let barra = '<div class="barra-estatus">';
    pasos.forEach((p, i) => {
        let clase = "";
        if (i < indiceActual) clase = "hecho";
        else if (i === indiceActual) clase = "actual";
        barra += '<div class="paso-estatus ' + clase + '">' + p + "</div>";
    });
    barra += "</div>";

    const botones = [];
    if (s.estatus !== "concluida") {
        botones.push({ etiqueta: "⏩ Simular avance de estatus (demostración)", accion: () => avanzarEstatus(s) });
    }
    botones.push({ etiqueta: "🖨️ Descargar mi hoja de solicitud (PDF)", accion: () => generarPDF(s) });
    flujo = null;

    agregarMensaje(html, "asistente", botones, { html: html + barra });
    if (vozAutomatica) leerEnVoz("Tu solicitud " + s.folio + " está " + s.estatus + ". Último movimiento: " + (ultimo ? ultimo.fecha : s.fecha), null);
}

function avanzarEstatus(s) {
    const pasos = ["recibida", "en proceso", "concluida"];
    const i = pasos.indexOf(s.estatus);
    if (i < 0 || i >= pasos.length - 1) return;
    const nuevo = pasos[i + 1];
    s.estatus = nuevo;
    const notas = { "en proceso": "En revisión en la Capitanía de Puerto", "concluida": "Documento listo para entrega" };
    s.historial.push({ estatus: nuevo, fecha: hoyISO(), nota: notas[nuevo] });
    const lista = cargarSolicitudes();
    const idx = lista.findIndex(x => x.folio === s.folio);
    if (idx >= 0) { lista[idx] = s; guardarLocal(CLAVE_SOLICITUDES, lista); }
    mostrarEstatus(s);
}

// ---------- Respuestas informativas ----------
const RESPUESTAS_INFO = [
    {
        claves: ["costo", "costos", "cuánto", "cuanto", "pago", "precio", "tarifa", "derechos"],
        respuesta: `💰 COSTOS DE LOS TRÁMITES

Los montos de derechos varían según el trámite y se actualizan cada año.

📍 Consulta la tabla oficial de costos en: gob.mx/semar/unaman

💡 Tip: lleva efectivo o verifica los métodos de pago aceptados en tu Capitanía de Puerto.`
    },
    {
        claves: ["horario", "horarios", "atención", "atencion", "abren", "cierran", "sábado", "sabado", "domingo", "días hábiles", "dias habiles"],
        respuesta: `🕐 HORARIOS DE ATENCIÓN

📍 Capitanías de Puerto:
Lunes a Viernes de 9:00 a 13:00 horas

❌ Sábados, domingos y días festivos: cerrado

💡 Llega temprano: la atención es por orden de llegada.`
    },
    {
        claves: ["dónde", "donde", "lugar", "dirección", "direccion", "capitanía", "capitania", "oficina"],
        respuesta: `📍 ¿DÓNDE SE TRAMITA?

Los trámites se realizan en la Capitanía de Puerto que corresponde a tu localidad.

🔍 Encuentra tu Capitanía más cercana en: gob.mx/semar/unaman

🕐 Horario: Lunes a Viernes de 9:00 a 13:00 horas`
    },
    {
        claves: ["examen médico", "examen medico", "médico", "medico", "salud", "certificado médico"],
        respuesta: `🩺 EXAMEN MÉDICO

Para las libretas necesitas un examen médico autorizado por SEMAR.

📍 Se realiza en el servicio médico de la Capitanía de Puerto.
🕐 Acude en horario de atención: Lunes a Viernes de 9:00 a 13:00 h`
    },
    {
        claves: ["fotos", "foto"],
        respuesta: `📸 FOTOGRAFÍAS

• Necesitas 2 fotos tamaño credencial
• Fondo blanco
• Recientes y de frente

💡 Muchas Capitanías tienen estudio de fotos cerca; verifica antes de ir.`
    }
];

// ---------- Motor de conversación ----------
function procesarMensaje(texto) {
    const n = normalizar(texto);

    // Flujo de llenado activo
    if (flujo && flujo.paso === "pregunta-camino") {
        if (/(en l[i]nea|linea|portal|internet)/.test(n)) { empezarEnLinea(); return; }
        if (/(imprimir|papel|llenar|presencial|capitan[i]a)/.test(n)) { empezarLlenado(); return; }
    }
    if (flujo && flujo.paso === "llenado") { procesarRespuestaLlenado(texto); return; }
    if (flujo && flujo.paso === "consultar-folio") { procesarConsultaFolio(texto); return; }
    if (flujo && flujo.paso === "consultar-curp") { procesarConsultaCurp(texto); return; }

    // Intención: consultar estatus
    if (/(estatus|status|consultar|seguimiento|folio|mi solicitud|que paso|qué pasó)/.test(n)) {
        if (/(todos|lista)/.test(n)) { /* dejar pasar a lista */ }
        else { iniciarConsultaEstatus(); return; }
    }

    // Intención: lista de todos los trámites
    if (/(todos|lista|opciones|trámites|tramites|qué puedo|que puedo|ayuda|menú|menu)/.test(n)) {
        menuTramites();
        return;
    }

    // Búsqueda por nombre de trámite: primero sinónimos dedicados, luego nombre general
    let mejor = null, mejorPuntaje = 0;
    for (const t of TRAMITES) {
        const claves = (t.clavesBusqueda || []).map(c => normalizar(c));
        const palabras = normalizar(t.nombre).replace(/[^a-z0-9áéíóúñ ]/g, " ").split(/\s+/).filter(p => p.length > 3);
        claves.push(normalizar(t.nombre), ...palabras);
        for (const c of claves) {
            if (c.length > 3 && n.includes(c) && c.length > mejorPuntaje) { mejor = t; mejorPuntaje = c.length; }
        }
    }
    if (mejor) { elegirTramite(mejor); return; }

    // Respuestas informativas
    for (const entrada of RESPUESTAS_INFO) {
        for (const clave of entrada.claves) {
            if (n.includes(normalizar(clave))) {
                decir(entrada.respuesta);
                return;
            }
        }
    }

    // Gracias / despedida
    if (/(gracias|adiós|adios|bye)/.test(n)) {
        decir("🤝 ¡Con gusto! Si necesitas algo más, aquí estoy. Recuerda: la información oficial la emite SEMAR en gob.mx/semar. ¡Buen viaje! ⚓");
        return;
    }

    // Saludo
    if (/(hola|buenas|buenos días|buenas tardes|buenas noches|buen dia|buen día)/.test(n)) {
        decir(saludoPersonalizado());
        return;
    }

    decir(respuestaGeneral());
}

function procesarConsultaFolio(texto) {
    const f = texto.trim();
    if (/^(un-)?\d{4}/i.test(f) || /^un-/i.test(f)) {
        flujo.paso = "consultar-curp";
        flujo.folioTemp = f.toUpperCase();
        decir("¡Gracias! Ahora, para proteger tus datos, dame los primeros 4 caracteres de tu CURP.");
        return;
    }
    if (/no|nada|no lo tengo|olvidé|olvide/.test(normalizar(f))) {
        listarSolicitudesLocales();
        return;
    }
    decir("Ese folio no tiene el formato esperado. Empieza con \"UN-\", por ejemplo: UN-2026-1234. O escribe \"no lo tengo\" para ver tus solicitudes guardadas aquí.");
}

function procesarConsultaCurp(texto) {
    const curp = texto.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
    const s = buscarSolicitud(flujo.folioTemp, curp);
    flujo = null;
    if (s) { mostrarEstatus(s); return; }
    decir("No encontré una solicitud con ese folio y esos datos en este dispositivo. 🤔\n\nVerifica que estén correctos. Recuerda que en esta versión demostrativa solo se consultan las solicitudes hechas en este mismo navegador.");
    flujo = null;
}

function respuestaGeneral() {
    return `📌 PUEDO AYUDARTE DE ESTAS FORMAS

📋 "todos" — ver la lista completa de trámites
🔎 "consultar estatus" — revisar tu solicitud con folio
💰 Costos · 🕐 Horarios · 📍 Lugares

También pregúntame por cualquier trámite con tus palabras, por ejemplo:
💬 "perdí mi libreta" · "quiero despachar mi embarcación" · "renovar"`;
}

function saludoPersonalizado() {
    let texto = "¡Hola de nuevo! 🤝 Soy tu asistente de trámites de la Secretaría de Marina — Unidad de la Autoridad Marítima Nacional.\n\n";
    if (perfil.ocupacion) {
        const ocup = OCUPACIONES.find(o => o.id === perfil.ocupacion);
        if (ocup) texto += "Como " + ocup.nombre.toLowerCase() + ", estos son los trámites que quizá te interesan:\n";
        if (perfil.ocupacion) {
            const ids = (OCUPACIONES.find(o => o.id === perfil.ocupacion) || {}).recomendados || [];
            ids.slice(0, 3).forEach(id => {
                const t = TRAMITES.find(x => x.id === id);
                if (t) texto += "• " + t.nombre + "\n";
            });
        }
        texto += "\n";
    }
    texto += "¿En qué te ayudo hoy? Toca un botón o pregunta con tus propias palabras.";
    return texto;
}

// ---------- Entrada del usuario ----------
function enviarMensaje() {
    const campo = document.getElementById("texto-usuario");
    const texto = campo.value.trim();
    if (!texto) return;
    agregarMensaje(texto, "usuario");
    campo.value = "";
    pensarYResponder(() => procesarMensaje(texto), 450);
}

// ---------- Micrófono ----------
function configurarMicrofono() {
    const ReconocimientoVoz = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!ReconocimientoVoz) {
        document.getElementById("aviso-micro").classList.add("visible");
        return;
    }
    reconocimiento = new ReconocimientoVoz();
    reconocimiento.lang = "es-MX";
    reconocimiento.continuous = false;
    reconocimiento.onresult = e => {
        document.getElementById("texto-usuario").value = e.results[0][0].transcript;
        enviarMensaje();
    };
    reconocimiento.onend = () => {
        reconociendo = false;
        document.getElementById("boton-micro").classList.remove("escuchando");
    };
    reconocimiento.onerror = () => {
        reconociendo = false;
        document.getElementById("boton-voz-reconocer") && (document.getElementById("boton-voz-reconocer").classList.remove("escuchando"));
        reconociendo = false;
        document.getElementById("boton-micro").classList.remove("escuchando");
    };
}

// ---------- Perfil y modales ----------
function abrirModalPrivacidad() {
    document.getElementById("modal-privacidad").classList.add("visible");
}

function abrirModalConfig(primeraVez) {
    const modal = document.getElementById("modal-config");
    modal.classList.add("visible");
    document.getElementById("boton-cerrar-config").style.display = primeraVez ? "none" : "inline-block";
    document.getElementById("boton-guardar-config").style.display = primeraVez ? "inline-block" : "inline-block";
    document.getElementById("boton-guardar-config").disabled = !(perfil.voz && perfil.ocupacion);
    document.getElementById("fila-borrar").style.display = primeraVez ? "none" : "block";
    const grid = document.getElementById("grid-ocupaciones");
    grid.innerHTML = "";
    for (const o of OCUPACIONES) {
        const btn = document.createElement("button");
        btn.className = "opcion-ocupacion" + (perfil.ocupacion === o.id ? " elegida" : "");
        btn.innerHTML = '<span class="icono">' + o.emoji + '</span>' + escapar(o.nombre);
        btn.addEventListener("click", () => {
            perfil.ocupacion = o.id;
            grid.querySelectorAll(".opcion-ocupacion").forEach(x => x.classList.remove("elegida"));
            btn.classList.add("elegida");
            document.getElementById("boton-guardar-config").disabled = !(perfil.voz && perfil.ocupacion);
        });
        grid.appendChild(btn);
    }
    document.querySelectorAll(".opcion-voz").forEach(btn => {
        btn.classList.toggle("elegida", perfil.voz === btn.dataset.voz);
        btn.onclick = () => {
            perfil.voz = btn.dataset.voz;
            document.querySelectorAll(".opcion-voz").forEach(x => x.classList.remove("elegida"));
            btn.classList.add("elegida");
            document.getElementById("boton-guardar-config").disabled = !(perfil.voz && perfil.ocupacion);
            // dar una muestra de voz
            leerEnVoz(perfil.voz === "masculina" ? "Hola, soy tu asistente. Así suena mi voz." : "Hola, soy tu asistente. Así suena mi voz.");
        };
        // primera vez: hablar del saludo
    });
}

function guardarConfiguracion() {
    guardarLocal(CLAVE_PERFIL, perfil);
    renderChips();
    document.getElementById("modal-config").classList.remove("visible");
    decir("¡Listo! 🎉 Ya te configuré. " + (perfil.ocupacion ? "Te mostraré primero los trámites de tu actividad." : "") + "\n\n" + saludoPersonalizado());
}

function borrarDatos() {
    if (!confirm("¿Seguro que quieres borrar TODOS tus datos guardados en este dispositivo? (solicitudes y preferencias)")) return;
    localStorage.removeItem(CLAVE_SOLICITUDES);
    localStorage.removeItem(CLAVE_PERFIL);
    localStorage.removeItem(CLAVE_PRIMER_USO);
    perfil = { voz: null, ocupacion: null };
    flujo = null;
    renderChips();
    document.getElementById("modal-config").classList.remove("visible");
    document.getElementById("modal-privacidad").classList.add("visible");
}

// ---------- Inicio ----------
function iniciar() {
    const acepto = localStorage.getItem(CLAVE_PRIMER_USO);
    const perfilGuardado = leerLocal(CLAVE_PERFIL, null);
    if (perfilGuardado) perfil = perfilGuardado;

    renderChips();
    configurarMicrofono();

    document.getElementById("boton-enviar").addEventListener("click", enviarMensaje);
    document.getElementById("texto-usuario").addEventListener("keydown", e => {
        if (e.key === "Enter") { e.preventDefault(); enviarMensaje(); }
    });
    document.getElementById("boton-micro").addEventListener("click", () => {
        if (!reconocimiento) return;
        if (!reconociendo) {
            reconocimiento.start();
            reconociendo = true;
            document.getElementById("boton-micro").classList.add("escuchando");
        } else {
            reconocimiento.stop();
        }
    });

    document.getElementById("interruptor-voz").addEventListener("click", function () {
        vozAutomatica = !vozAutomatica;
        this.setAttribute("aria-checked", vozAutomatica ? "true" : "false");
        if (!vozAutomatica && "speechSynthesis" in window) speechSynthesis.cancel();
    });

    document.getElementById("boton-config").addEventListener("click", () => abrirModalConfig(false));
    document.getElementById("boton-aceptar-privacidad").addEventListener("click", () => {
        localStorage.setItem(CLAVE_PRIMER_USO, "si");
        document.getElementById("modal-privacidad").classList.remove("visible");
        abrirModalConfig(true);
    });
    document.getElementById("boton-guardar-config").addEventListener("click", guardarConfiguracion);
    document.getElementById("boton-cerrar-config").addEventListener("click", () => {
        document.getElementById("modal-config").classList.remove("visible");
    });
    document.getElementById("boton-borrar-datos").addEventListener("click", borrarDatos);
    document.getElementById("enlace-privacidad").addEventListener("click", abrirModalPrivacidad);

    if (!acepto) {
        abrirModalPrivacidad();
    } else {
        agregarMensaje(saludoPersonalizado(), "asistente");
    }
}

document.addEventListener("DOMContentLoaded", iniciar);
