// ==========================================
// ASISTENTE UNAMAN — lógica principal
// Español/inglés, formato de solicitud
// oficial por trámite, chat limpio.
// ==========================================

// ---------- Estado global ----------
let vozAutomatica = false;
let reconocimiento = null;
let reconociendo = false;
let perfil = { voz: null, idioma: "es" };
let flujo = null;          // flujo de llenado activo (idioma fijo al iniciar)
let modoEnLinea = false;

const CLAVE_PRIMER_USO = "unaman_privacidad_aceptada";
const CLAVE_PERFIL = "unaman_perfil";
const CLAVE_SOLICITUDES = "unaman_solicitudes";

const SECCIONES = {
    solicitante: { es: "DATOS DEL SOLICITANTE", en: "APPLICANT DETAILS" },
    embarcacion: { es: "DATOS DE LA EMBARCACIÓN", en: "VESSEL DETAILS" },
    tramite: { es: "DATOS DEL TRÁMITE", en: "PROCEDURE DETAILS" }
};

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

function formatearFecha(iso, idioma) {
    const f = new Date(iso + "T12:00:00");
    return f.toLocaleDateString(idioma === "en" ? "en-US" : "es-MX", { day: "numeric", month: "long", year: "numeric" });
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

// ---------- Idioma ----------
function t(es, en) {
    return perfil.idioma === "en" ? en : es;
}

function idiomaFlujo() {
    return flujo && flujo.idioma ? flujo.idioma : perfil.idioma;
}

function campoPregunta(c, idioma) {
    return idioma === "en" ? (c.preguntaEn || c.pregunta) : c.pregunta;
}

function campoEtiqueta(c, idioma) {
    return idioma === "en" ? (c.etiquetaEn || c.etiqueta) : c.etiqueta;
}

function tramiteNombre(tObj, idioma) {
    return idioma === "en" ? (tObj.nombreEn || tObj.nombre) : tObj.nombre;
}

function tramiteSinopsis(tObj, idioma) {
    return idioma === "en" ? (tObj.sinopsisEn || tObj.sinopsis) : tObj.sinopsis;
}

function listaRequisitos(tObj, idioma) {
    return idioma === "en" ? (tObj.requisitosEn || tObj.requisitos) : tObj.requisitos;
}

function categoriaNombre(cat, idioma) {
    return idioma === "en" ? (cat.nombreEn || cat.nombre) : cat.nombre;
}

// ---------- Voz ----------
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

function textoParaVoz(texto, idioma) {
    let out = texto;
    if (idioma !== "en") {
        for (const p of PRONUNCIACION) out = out.replace(p.ver, " " + p.decir + " ");
    }
    out = out.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu, "");
    return out.replace(/\s+/g, " ").trim();
}

let vocesDisponibles = [];
function cargarVoces() {
    if (!("speechSynthesis" in window)) return;
    vocesDisponibles = speechSynthesis.getVoices();
}
if ("speechSynthesis" in window) {
    cargarVoces();
    speechSynthesis.onvoiceschanged = cargarVoces;
}

function elegirVoz(idioma) {
    if (!vocesDisponibles.length) cargarVoces();
    const esIdioma = idioma === "en" ? "en" : "es";
    const delIdioma = vocesDisponibles.filter(v => v.lang && v.lang.toLowerCase().startsWith(esIdioma));
    const lista = delIdioma.length ? delIdioma : vocesDisponibles;
    if (!lista.length) return null;
    const masculinos = ["male", "jorge", "carlos", "diego", "juan", "paulo", "rishi", "google español 2"];
    const femeninos = ["female", "sabina", "mónica", "monica", "paulina", "helena", "laura", "google español"];
    const buscados = perfil.voz === "masculina" ? masculinos : femeninos;
    for (const clave of buscados) {
        const v = lista.find(x => x.name.toLowerCase().includes(clave));
        if (v) return v;
    }
    if (perfil.voz === "masculina") {
        const alt = lista.find(x => x.name.toLowerCase().includes("español") || x.name.toLowerCase().includes("spanish"));
        return alt || lista[lista.length > 1 ? 1 : 0];
    }
    return lista[0];
}

function leerEnVoz(texto, boton) {
    if (!("speechSynthesis" in window)) return;
    const idioma = idiomaFlujo();
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
    utterance.text = textoParaVoz(texto, idioma);
    utterance.lang = idioma === "en" ? "en-US" : "es-MX";
    // Femenina a ritmo natural; masculina algo más lenta por los.pitch bajo
    utterance.rate = perfil.voz === "masculina" ? 0.92 : 1.05;
    utterance.pitch = perfil.voz === "masculina" ? 0.7 : 1.15;
    const v = elegirVoz(idioma);
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
                btn.textContent = b.etiqueta;
                btn.addEventListener("click", () => {
                    // Al elegir una opción, la pregunta desaparece: chat limpio
                    div.remove();
                    b.accion();
                });
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
    }, ms || 450);
}

function decir(texto, botones, opciones) {
    agregarMensaje(texto, "asistente", botones, opciones);
    if (vozAutomatica) leerEnVoz(texto, null);
}

function actualizarPlaceholder() {
    document.getElementById("texto-usuario").placeholder = t("Escribe tu pregunta...", "Type your question...");
}

// ---------- Botones fijos ----------
function botonesFijos() {
    return [
        { etiqueta: t("📋 Ver trámites", "📋 Procedures"), accion: () => { const x = flujo; flujo = null; menuTramites(); flujo = x; } },
        { etiqueta: t("💰 Costos", "💰 Fees"), accion: () => decir(respuestasInfo().costos) },
        { etiqueta: t("🕐 Horarios", "🕐 Hours"), accion: () => decir(respuestasInfo().horarios) },
        { etiqueta: t("🔎 Mi solicitud", "🔎 My request"), accion: () => iniciarConsultaEstatus() }
    ];
}

function renderBotonesFijos() {
    const zona = document.getElementById("acciones");
    zona.innerHTML = "";
    for (const b of botonesFijos()) {
        const btn = document.createElement("button");
        btn.className = "chip" + (b.fijoPrincipal ? " principal" : "");
        btn.textContent = b.etiqueta;
        btn.addEventListener("click", b.accion);
        zona.appendChild(btn);
    }
}

// ---------- Menú de trámites por categorías oficiales ----------
function menuTramites() {
    const idioma = idiomaFlujo();
    let texto = t("📋 TRÁMITES POR CATEGORÍA (como aparecen en la página oficial de UNAMAN)\n\n",
                  "📋 PROCEDURES BY CATEGORY (as listed on the official UNAMAN page)\n\n");
    const botones = [];
    for (const cat of CATEGORIAS) {
        const lista = TRAMITES.filter(tr => tr.categoria === cat.id);
        if (!lista.length) continue;
        texto += cat.emoji + " " + categoriaNombre(cat, idioma).toUpperCase() + "\n";
        for (const tr of lista) {
            texto += "   • " + tramiteNombre(tr, idioma) + "\n";
            botones.push({ etiqueta: tramiteNombre(tr, idioma), accion: () => elegirTramite(tr) });
        }
        texto += "\n";
    }
    texto += t("¿Cuál trámite necesitas?", "Which procedure do you need?");
    decir(texto, botones);
}

// ---------- Elección de trámite: ¿en línea o con formato para imprimir? ----------
function elegirTramite(tramite) {
    const idioma = idiomaFlujo();
    flujo = { tramite, datos: {}, indice: 0, paso: "pregunta-camino", idioma };
    let texto = tramiteNombre(tramite, idioma) + " (" + tramite.clave + ")\n\n";
    texto += tramiteSinopsis(tramite, idioma) + "\n\n";
    if (tramite.enLinea) {
        texto += t(
            "Puedes iniciar este trámite en línea en el portal oficial de SEMAR, o puedo llenar tu solicitud en el formato oficial para imprimirla y presentarla en la Capitanía de Puerto.\n\n¿Qué prefieres?",
            "You can start this procedure online on the official SEMAR portal, or I can fill your request in the official form to print and submit it at the Harbor Master's Office.\n\nWhat do you prefer?"
        );
    } else {
        texto += t(
            "Este trámite se presenta en la Capitanía de Puerto. Puedo llenar tu solicitud en el formato oficial ahora, para que llegues con todo listo. También puedo mostrarte la guía para hacerlo en el portal oficial.\n\n¿Qué prefieres?",
            "This procedure is submitted at the Harbor Master's Office. I can fill your request in the official form now, so you arrive ready. I can also show you the guide to do it on the official portal.\n\nWhat do you prefer?"
        );
    }
    decir(texto, [
        { etiqueta: t("🌐 Hacerlo en línea", "🌐 Do it online"), accion: () => empezarEnLinea(), estilo: "primario" },
        { etiqueta: t("🖨️ Llenar la solicitud para imprimir", "🖨️ Fill out the request form to print"), accion: () => empezarLlenado() }
    ]);
}

function empezarEnLinea() {
    const idioma = idiomaFlujo();
    const tr = flujo.tramite;
    flujo.paso = "guia-linea";
    modoEnLinea = true;
    let texto = t("Estos son los requisitos. Tenlos a la mano:\n\n", "These are the requirements. Have them ready:\n\n");
    listaRequisitos(tr, idioma).forEach((r, i) => { texto += (i + 1) + ". " + r + "\n"; });
    texto += "\n" + t(
        "Cuando los tengas, abre el portal oficial de SEMAR y busca \"" + tramiteNombre(tr, idioma) + "\". Si te atoras en alguna pantalla, escribe \"¿cómo lleno...?\" y te explico.\n\n¿Abro el portal?",
        "When you have them, open the official SEMAR portal and look for \"" + tramiteNombre(tr, idioma) + "\". If you get stuck on any screen, type \"how do I fill...?\" and I will explain.\n\nOpen the portal?"
    );
    decir(texto, [
        { etiqueta: t("🌐 Abrir el portal oficial", "🌐 Open the official portal"), accion: () => abrirPortal(), estilo: "primario" },
        { etiqueta: t("🖨️ Mejor lléname la solicitud", "🖨️ Fill out the request form instead"), accion: () => empezarLlenado() }
    ]);
}

function abrirPortal() {
    const idioma = idiomaFlujo();
    window.open(flujo.tramite.portal, "_blank", "noopener");
    decir(
        t(
            "Abrí el portal oficial.\n\nRecuerda: soy solo tu guía de apoyo; el trámite se concluye en el sitio oficial de SEMAR. Si tienes dudas en el camino, escríbeme y te explico. Al terminar puedes consultar el estatus con tu folio en \"Mi solicitud\".",
            "I opened the official portal.\n\nRemember: I am only your support guide; the procedure is completed on the official SEMAR site. If you have questions along the way, write to me and I will explain. When you finish, you can check the status with your reference number under \"My request\"."
        ),
        [{ etiqueta: t("✅ Ya terminé mi trámite en línea", "✅ I finished my online procedure"), accion: () => terminarEnLinea() }]
    );
}

function terminarEnLinea() {
    decir(t(
        "Guarda el folio y comprobante que te dio el portal oficial. Si necesitas otro trámite, dime cuál.",
        "Keep the reference number and receipt the official portal gave you. If you need another procedure, tell me which one."
    ));
    flujo = null;
    modoEnLinea = false;
}

// ---------- Llenado de solicitud en formato oficial ----------
function empezarLlenado() {
    const idioma = idiomaFlujo();
    const tr = flujo.tramite;
    flujo.paso = "llenado";
    flujo.indice = 0;
    let texto = t(
        "Llenaré la solicitud en el formato oficial \"" + tr.clave + "\". Te haré unas preguntas, una por una, en español; la solicitud final queda en español para presentarla en la Capitanía.\n\n",
        "I will fill the request in the official form \"" + tr.clave + "\". I will ask a few questions, one at a time, in English so you can understand everything; the final form is written in Spanish to submit it at the Harbor Master's Office.\n\n"
    );
    texto += t("Puedes escribir \"corregir\" para volver a la pregunta anterior.", "You can type \"corregir\" to go back to the previous question.");
    decir(texto);
    decir(campoPregunta(tr.campos[0], idioma));
}

function procesarRespuestaLlenado(texto) {
    const idioma = idiomaFlujo();
    const tr = flujo.tramite;
    const campo = tr.campos[flujo.indice];

    if (normalizar(texto).match(/(corregir|correct|go back|atras)/)) {
        if (flujo.indice === 0) {
            decir(campoPregunta(campo, idioma));
        } else {
            flujo.indice--;
            delete flujo.datos[tr.campos[flujo.indice].id];
            decir(campoPregunta(tr.campos[flujo.indice], idioma));
        }
        return;
    }

    const error = validarCampo(campo, texto, idioma);
    if (error) {
        decir(error + "\n\n" + campoPregunta(campo, idioma));
        return;
    }

    flujo.datos[campo.id] = texto.trim();
    flujo.indice++;

    if (flujo.indice < tr.campos.length) {
        const siguiente = tr.campos[flujo.indice];
        let msg = campoPregunta(siguiente, idioma);
        if (idioma !== "en" && siguiente.ayuda) msg += "\n\n" + siguiente.ayuda;
        decir(msg);
    } else {
        concluirSolicitud();
    }
}

function validarCampo(campo, valor, idioma) {
    const v = valor.trim();
    const es = idioma !== "en";
    if (campo.obligatorio && !v) {
        return es ? "Ese dato es necesario para tu solicitud." : "That information is required.";
    }
    if (!v) return null;
    if (campo.tipo === "curp") {
        const curp = v.toUpperCase();
        if (!/^[A-Z][AEIOU][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]\d$/.test(curp)) {
            return es
                ? "La CURP no parece correcta. Debe tener 18 caracteres: 4 letras, tu fecha de nacimiento, tu sexo y 3 letras de tu estado. Revisa tu acta de nacimiento o tu INE."
                : "The CURP does not look right. It must have 18 characters: 4 letters, your birth date, your sex and 3 letters for your state. Check your birth certificate or your INE ID.";
        }
    }
    if (campo.tipo === "telefono" && !/^\d{10}$/.test(v.replace(/[\s-]/g, ""))) {
        return es
            ? "El teléfono debe ser de 10 dígitos, por ejemplo: 3221234567."
            : "The phone number must be 10 digits, for example: 3221234567.";
    }
    if (campo.tipo === "correo" && v !== "no tengo" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        return es
            ? "Ese correo no parece válido. Revisa que tenga @ y punto, o escribe \"no tengo\"."
            : "That e-mail does not look valid. Check it has @ and a dot, or write \"no tengo\".";
    }
    if (campo.tipo === "numero" && !/^\d+$/.test(v)) {
        return es ? "Escribe solo el número, por favor." : "Please write only the number.";
    }
    return null;
}

function concluirSolicitud() {
    const idioma = idiomaFlujo();
    const tr = flujo.tramite;
    const curp = (flujo.datos.curp || "S/D").toUpperCase();
    const solicitud = {
        folio: generarFolio(),
        tramiteId: tr.id,
        tramiteNombre: tramiteNombre(tr, "es"),
        clave: tr.clave,
        claveOficial: tr.claveOficial || null,
        fecha: hoyISO(),
        curp: curp,
        idiomaAuxiliar: idioma,
        datos: { ...flujo.datos },
        requisitos: tr.requisitos,
        estatus: "recibida",
        historial: [{ estatus: "recibida", fecha: hoyISO(), nota: "Solicitud creada en el asistente" }]
    };
    guardarSolicitud(solicitud);

    let resumen = t(
        "Tu solicitud está completa.\n\n",
        "Your request is complete.\n\n"
    );
    resumen += "📄 " + tramiteNombre(tr, idioma) + " (" + tr.clave + ")\n";
    resumen += t("🔖 Folio de seguimiento: ", "🔖 Reference number: ") + solicitud.folio + "\n\n";
    resumen += t(
        "Tu hoja de solicitud, en el formato oficial y en español, está lista para descargar e imprimir. Preséntala en la Capitanía con tu carpeta de documentos.",
        "Your request sheet, in the official form and in Spanish, is ready to download and print. Submit it at the Harbor Master's Office with your document folder."
    );

    flujo = null;
    decir(resumen, [
        { etiqueta: t("🖨️ Descargar solicitud en formato oficial (PDF)", "🖨️ Download official request form (PDF)"), accion: () => generarPDF(solicitud), estilo: "primario" },
        { etiqueta: t("📄 Ver qué más llevar en mi carpeta", "📄 See what else to bring"), accion: () => decirCarpeta(tr, idioma) },
        { etiqueta: t("🔎 Ver el estatus de mi solicitud", "🔎 Check my request status"), accion: () => iniciarConsultaEstatus() }
    ]);
}

function decirCarpeta(tr, idioma) {
    let texto = t("📁 TU CARPETA PARA LA VENTANILLA\n\nAdemás de tu solicitud, lleva:\n",
                  "📁 YOUR DOCUMENT FOLDER\n\nBesides your request form, bring:\n");
    listaRequisitos(tr, idioma).forEach((r, i) => { texto += (i + 1) + ". " + r + (idioma === "en" ? " (original and one copy)" : " (original y una copia)") + "\n"; });
    texto += "\n" + t(
        "📍 Preséntate en la Capitanía de Puerto de Lunes a Viernes, de 9:00 a 13:00 h. La atención es por orden de llegada.",
        "📍 Submit at the Harbor Master's Office Monday to Friday, 9:00 a.m. to 1:00 p.m. Service is first come, first served."
    );
    decir(texto);
}

// ---------- PDF: solicitud en formato oficial ----------
function pdfMultiLinea(doc, texto, x, y, ancho, altoLinea) {
    const lineas = doc.splitTextToSize(texto, ancho);
    doc.text(lineas, x, y);
    return lineas.length * altoLinea;
}

function generarPDF(s) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "letter" });
    const M = 20;
    const ancho = 216 - M * 2;
    let y = 18;

    const tramite = TRAMITES.find(x => x.id === s.tramiteId);
    const idiomaAux = s.idiomaAuxiliar === "en";
    const dato = id => s.datos[id] || "";
    const notaEn = id => idiomaAux && s.datos[id] ? "  (" + s.datos[id] + ")" : "";

    // Encabezado oficial
    doc.setFont("helvetica", "bold"); doc.setFontSize(13);
    doc.text("SECRETARÍA DE MARINA", 108, y, { align: "center" }); y += 6;
    doc.setFontSize(11);
    doc.text("UNIDAD DE LA AUTORIDAD MARÍTIMA NACIONAL (UNAMAN)", 108, y, { align: "center" }); y += 5;
    doc.text("UNIDAD DE CAPITANÍAS DE PUERTO Y ASUNTOS MARÍTIMOS", 108, y, { align: "center" }); y += 7;

    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text("Av. Heroica Escuela Naval Militar No. 669, Col. Presidentes Ejidales, Alcaldía Coyoacán, CDMX, C.P. 04470", 108, y, { align: "center" }); y += 5;
    doc.text("Homoclave del formato: " + s.clave, M, y);
    doc.text("Folio de seguimiento: " + s.folio, M + ancho, y, { align: "right" }); y += 8;

    doc.setDrawColor(0, 58, 93); doc.setLineWidth(0.6);
    doc.line(M, y, M + ancho, y); y += 7;

    doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    y += pdfMultiLinea(doc, "SOLICITUD DE TRÁMITE: " + s.tramiteNombre.toUpperCase(), M, y, ancho, 5) + 1;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text("Lugar y fecha de emisión: " + dato("capitania") + ", " + formatearFecha(s.fecha, "es"), M, y); y += 7;

    // Secciones del formato oficial
    const secciones = ["solicitante", "embarcacion", "tramite"];
    for (const sec of secciones) {
        const campos = tramite ? tramite.campos.filter(c => c.seccion === sec && s.datos[c.id] !== undefined) : [];
        if (!campos.length) continue;
        if (y > 235) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "bold"); doc.setFontSize(10);
        doc.text(SECCIONES[sec].es, M, y); y += 3;
        doc.setDrawColor(180, 195, 205); doc.setLineWidth(0.3);
        doc.line(M, y, M + ancho, y); y += 6;

        doc.setFontSize(9.5);
        for (const c of campos) {
            if (y > 250) { doc.addPage(); y = 20; }
            doc.setFont("helvetica", "bold");
            doc.text(campoEtiqueta(c, "es") + ":", M, y);
            doc.setFont("helvetica", "normal");
            const valor = String(s.datos[c.id]) + (idiomaAux ? notaEn(c.id) : "");
            const lineas = doc.splitTextToSize(valor, ancho - 60);
            doc.text(lineas, M + 60, y);
            y += Math.max(5.5, lineas.length * 4.6);
        }
        y += 3;
    }

    // Petición
    if (y > 235) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text("FORMULACIÓN DE LA PETICIÓN", M, y); y += 3;
    doc.setDrawColor(180, 195, 205); doc.line(M, y, M + ancho, y); y += 6;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5);
    const peticion = "Quien suscribe, " + (dato("nombre") || dato("nombrePropietario") || dato("nombrePatron") || dato("responsable") || dato("organizacion") || "(nombre del solicitante)") +
        ", comparece ante la Autoridad Marítima Nacional para solicitar: " + s.tramiteNombre + ", conforme a la clave " + s.clave + ", y declara bajo protesta de decir verdad que los datos proporcionados son verídicos.";
    y += pdfMultiLinea(doc, peticion, M, y, ancho, 4.6) + 5;

    // Documentos adjuntos
    if (y > 235) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text("DOCUMENTOS QUE DEBE ADJUNTAR (original y copia)", M, y); y += 3;
    doc.setDrawColor(180, 195, 205); doc.line(M, y, M + ancho, y); y += 6;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    for (const req of s.requisitos) {
        if (y > 252) { doc.addPage(); y = 20; }
        y += pdfMultiLinea(doc, "• " + req, M, y, ancho, 4.2);
    }

    // Firma
    if (y > 225) { doc.addPage(); y = 30; }
    y += 18;
    doc.setDrawColor(60); doc.setLineWidth(0.3);
    doc.line(M + 30, y, M + 120, y); y += 5;
    doc.setFontSize(9);
    doc.text("Firma autógrafa del interesado o su representante legal", M + 75, y, { align: "center" }); y += 8;

    // Nota al pie
    doc.setFontSize(8); doc.setTextColor(120);
    const nota = "Documento de apoyo generado por un asistente no oficial; replica la estructura del formato " + s.clave +
        (s.claveOficial ? " (descarga oficial: gob.mx/semar/unaman, trámite " + s.claveOficial + ")" : "") +
        ". Presentar en la Capitanía de Puerto, lunes a viernes de 9:00 a 13:00 h. Información oficial: gob.mx/semar/unaman.";
    y += pdfMultiLinea(doc, nota, M, y, ancho, 3.6);

    doc.save("Solicitud_" + s.clave.replace(/[^A-Za-z0-9-]/g, "") + "_" + s.folio + ".pdf");
}

// ---------- Consulta de estatus ----------
function iniciarConsultaEstatus() {
    decir(t(
        "Para revisar tu solicitud dame tu folio de seguimiento (empieza con \"UN-\"). Si no lo tienes a la mano, puedo mostrarte las solicitudes guardadas en este dispositivo.",
        "To check your request, give me your reference number (it starts with \"UN-\"). If you do not have it handy, I can show the requests saved on this device."
    ), [
        { etiqueta: t("📋 Ver mis solicitudes guardadas", "📋 See my saved requests"), accion: () => listarSolicitudesLocales() }
    ]);
    flujo = { paso: "consultar-folio" };
}

function listarSolicitudesLocales() {
    const lista = cargarSolicitudes();
    if (!lista.length) {
        decir(t("Todavía no tienes solicitudes guardadas en este dispositivo.", "You have no requests saved on this device yet."));
        flujo = null;
        return;
    }
    const botones = lista.slice(-5).reverse().map(s => ({
        etiqueta: "📄 " + s.folio + " — " + s.tramiteNombre.split("—")[0].trim(),
        accion: () => mostrarEstatus(s)
    }));
    decir(t("Estas son tus solicitudes guardadas en este dispositivo. Toca la tuya para ver su estatus:",
            "These are the requests saved on this device. Tap yours to see its status:"), botones);
}

function mostrarEstatus(s) {
    const pasos = ["recibida", "en proceso", "concluida"];
    const indiceActual = pasos.indexOf(s.estatus);
    let html = escapar("🔎 " + s.folio + " — " + s.tramiteNombre + "\n");
    html += escapar("📅 " + t("Creada", "Created") + ": " + formatearFecha(s.fecha, perfil.idioma) + " · " + t("Estatus", "Status") + ": " + s.estatus.toUpperCase() + "\n");
    const ultimo = s.historial && s.historial.length ? s.historial[s.historial.length - 1] : null;
    html += escapar(ultimo ? "📝 " + t("Último movimiento", "Last update") + ": " + ultimo.fecha + (ultimo.nota ? " — " + ultimo.nota : "") : "");

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
        botones.push({ etiqueta: t("⏩ Simular avance de estatus (demostración)", "⏩ Simulate status advance (demo)"), accion: () => avanzarEstatus(s) });
    }
    botones.push({ etiqueta: t("🖨️ Descargar mi solicitud (PDF)", "🖨️ Download my request (PDF)"), accion: () => generarPDF(s) });
    flujo = null;

    agregarMensaje(html, "asistente", botones, { html: html + barra });
    if (vozAutomatica) leerEnVoz(t("Tu solicitud ", "Your request ") + s.folio + t(" está ", " is ") + s.estatus + ".", null);
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
function respuestasInfo() {
    return {
        costos: t(
`💰 COSTOS DE LOS TRÁMITES

Los montos de derechos varían según el trámite y se actualizan cada año.

📍 Consulta la tabla oficial de costos en: gob.mx/semar/unaman

Lleva efectivo o verifica los métodos de pago aceptados en tu Capitanía de Puerto.`,
`💰 PROCEDURE FEES

Fees vary by procedure and are updated every year.

📍 Check the official fee table at: gob.mx/semar/unaman

Bring cash or verify the accepted payment methods at your Harbor Master's Office.`),
        horarios: t(
`🕐 HORARIOS DE ATENCIÓN

📍 Capitanías de Puerto:
Lunes a Viernes de 9:00 a 13:00 horas

Sábados, domingos y días festivos: cerrado

La atención es por orden de llegada.`,
`🕐 OFFICE HOURS

📍 Harbor Master's Offices:
Monday to Friday, 9:00 a.m. to 1:00 p.m.

Saturdays, Sundays and holidays: closed

Service is first come, first served.`)
    };
}

// ---------- Motor de conversación ----------
function procesarMensaje(texto) {
    const idioma = idiomaFlujo();
    const n = normalizar(texto);
    const en = perfil.idioma === "en";

    // Flujo de llenado activo tiene prioridad
    if (flujo && flujo.paso === "pregunta-camino") {
        if (/(en l[i]nea|linea|portal|internet|online)/.test(n)) { empezarEnLinea(); return; }
        if (/(imprimir|papel|llenar|presencial|capitan[i]a|print|form)/.test(n)) { empezarLlenado(); return; }
    }
    if (flujo && flujo.paso === "llenado") { procesarRespuestaLlenado(texto); return; }
    if (flujo && flujo.paso === "consultar-folio") { procesarConsultaFolio(texto); return; }
    if (flujo && flujo.paso === "consultar-curp") { procesarConsultaCurp(texto); return; }

    // Intención: consultar estatus
    if (/(estatus|status|consultar|seguimiento|folio|mi solicitud|my request|que paso|que paso con)/.test(n)) {
        iniciarConsultaEstatus();
        return;
    }

    // Intención: lista de todos los trámites
    if (/(todos|lista|opciones|tramites|categories|categorias|qué puedo|que puedo|help|menu|menú|procedures)/.test(n)) {
        menuTramites();
        return;
    }

    // Búsqueda por nombre de trámite: los sinónimos dedicados valen más que palabras del nombre
    let mejor = null, mejorPuntaje = 0;
    for (const tr of TRAMITES) {
        const claves = (tr.clavesBusqueda || []).map(c => ({ clave: normalizar(c), bono: 100 }));
        const palabras = normalizar(tr.nombre + " " + (tr.nombreEn || "")).replace(/[^a-z0-9áéíóúñü ]/g, " ").split(/\s+/).filter(p => p.length > 4);
        claves.push({ clave: normalizar(tr.nombre), bono: 0 }, { clave: normalizar(tr.nombreEn || ""), bono: 0 }, ...palabras.map(p => ({ clave: p, bono: 0 })));
        for (const { clave, bono } of claves) {
            const puntaje = clave.length + bono;
            if (clave.length > 4 && n.includes(clave) && puntaje > mejorPuntaje) { mejor = tr; mejorPuntaje = puntaje; }
        }
    }
    if (mejor) { elegirTramite(mejor); return; }

    // Respuestas informativas
    const info = respuestasInfo();
    if (/(costo|costos|cuanto|pago|precio|tarifa|derechos|fee|fees|cost|price|pay)/.test(n)) { decir(info.costos); return; }
    if (/(horario|horarios|atencion|abren|cierran|sabado|domingo|hours|open|close)/.test(n)) { decir(info.horarios); return; }

    // Gracias / despedida
    if (/(gracias|adios|bye|thank)/.test(n)) {
        decir(en
            ? "You're welcome. If you need anything else, I'm here. Official information is issued by SEMAR at gob.mx/semar."
            : "Con gusto. Si necesitas algo más, aquí estoy. La información oficial la emite SEMAR en gob.mx/semar.");
        return;
    }

    // Saludo
    if (/(hola|buenas|buenos dias|buenas tardes|buenas noches|buen dia|hello|hi |good morning)/.test(n)) {
        decir(saludoPrincipal());
        return;
    }

    decir(respuestaGeneral());
}

function procesarConsultaFolio(texto) {
    const f = texto.trim();
    const en = perfil.idioma === "en";
    if (/^(un-)?\d{4}/i.test(f) || /^un-/i.test(f)) {
        flujo.paso = "consultar-curp";
        flujo.folioTemp = f.toUpperCase();
        decir(en
            ? "Now, to protect your data, give me the first 4 characters of your CURP."
            : "Ahora, para proteger tus datos, dame los primeros 4 caracteres de tu CURP.");
        return;
    }
    if (/^(no|nada|no lo tengo|olvide|dont|don t|no tengo)/.test(normalizar(f))) {
        listarSolicitudesLocales();
        return;
    }
    decir(en
        ? "That reference number doesn't have the expected format. It starts with \"UN-\", for example: UN-2026-1234. Or type \"no tengo\" to see your saved requests."
        : "Ese folio no tiene el formato esperado. Empieza con \"UN-\", por ejemplo: UN-2026-1234. O escribe \"no lo tengo\" para ver tus solicitudes guardadas aquí.");
}

function procesarConsultaCurp(texto) {
    const curp = texto.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
    const s = buscarSolicitud(flujo.folioTemp, curp);
    flujo = null;
    if (s) { mostrarEstatus(s); return; }
    decir(perfil.idioma === "en"
        ? "No request was found with that number and data on this device. Check they are correct. In this demo version, only requests made in this same browser can be checked."
        : "No encontré una solicitud con ese folio y esos datos en este dispositivo. Verifica que estén correctos. En esta versión demostrativa solo se consultan las solicitudes hechas en este mismo navegador.");
}

function respuestaGeneral() {
    return (perfil.idioma === "en"
? `📌 I CAN HELP YOU WITH

📋 "procedures" — see the full list by category
🔎 "my request" — check your status with your reference number
💰 Fees · 🕐 Hours

Ask about any procedure in your own words, for example:
💬 "I lost my seaman's book" · "I want to clear my vessel for departure"`
: `📌 PUEDO AYUDARTE DE ESTAS FORMAS

📋 "trámites" — ver la lista completa por categoría
🔎 "mi solicitud" — revisar tu estatus con tu folio
💰 Costos · 🕐 Horarios

Pregúntame por cualquier trámite con tus palabras, por ejemplo:
💬 "perdí mi libreta" · "quiero despachar mi embarcación" · "renovar"`);
}

function saludoPrincipal() {
    return (perfil.idioma === "en"
? `Hello. I'm your assistant for Maritime Authority (UNAMAN — SEMAR) procedures.

I help you understand requirements in English and fill out the official request form in Spanish, ready to print and submit at the Harbor Master's Office.

What do you need?`
: `Hola. Soy tu asistente de trámites de la Unidad de la Autoridad Marítima Nacional (UNAMAN — SEMAR).

Te ayudo a llenar la solicitud oficial de tu trámite, lista para imprimir y presentar en la Capitanía de Puerto.

¿Qué necesitas?`);
}

// ---------- Entrada del usuario ----------
function enviarMensaje() {
    const campo = document.getElementById("texto-usuario");
    const texto = campo.value.trim();
    if (!texto) return;
    agregarMensaje(texto, "usuario");
    campo.value = "";
    pensarYResponder(() => procesarMensaje(texto), 400);
}

// ---------- Micrófono ----------
function configurarMicrofono() {
    const ReconocimientoVoz = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!ReconocimientoVoz) {
        document.getElementById("aviso-micro").classList.add("visible");
        return;
    }
    reconocimiento = new ReconocimientoVoz();
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
        document.getElementById("boton-micro").classList.remove("escuchando");
    };
}

function actualizarIdiomaMicrofono() {
    if (reconocimiento) reconocimiento.lang = perfil.idioma === "en" ? "en-US" : "es-MX";
}

// ---------- Perfil y modales ----------
function abrirModalConfig(primeraVez) {
    const modal = document.getElementById("modal-config");
    modal.classList.add("visible");
    document.getElementById("boton-cerrar-config").style.display = primeraVez ? "none" : "inline-block";
    document.getElementById("fila-borrar").style.display = primeraVez ? "none" : "block";
    actualizarEleccionVoz();
    actualizarEleccionIdioma();
    actualizarBotonGuardar();
}

function actualizarEleccionVoz() {
    document.querySelectorAll(".opcion-voz").forEach(btn => {
        btn.classList.toggle("elegida", perfil.voz === btn.dataset.voz);
    });
}

function actualizarEleccionIdioma() {
    document.querySelectorAll(".opcion-idioma").forEach(btn => {
        btn.classList.toggle("elegida", perfil.idioma === btn.dataset.idioma);
    });
}

function actualizarBotonGuardar() {
    document.getElementById("boton-guardar-config").disabled = !(perfil.voz && perfil.idioma);
}

function guardarConfiguracion() {
    guardarLocal(CLAVE_PERFIL, perfil);
    actualizarIdiomaMicrofono();
    actualizarPlaceholder();
    renderBotonesFijos();
    document.getElementById("modal-config").classList.remove("visible");
    decir(t(
        "Configuración guardada. Puedes cambiar la voz o el idioma cuando quieras desde el botón de configuración.",
        "Settings saved. You can change the voice or language anytime from the settings button."
    ));
}

function borrarDatos() {
    const en = perfil.idioma === "en";
    const msg = en
        ? "Are you sure you want to delete ALL your data saved on this device? (requests and preferences)"
        : "¿Seguro que quieres borrar TODOS tus datos guardados en este dispositivo? (solicitudes y preferencias)";
    if (!confirm(msg)) return;
    localStorage.removeItem(CLAVE_SOLICITUDES);
    localStorage.removeItem(CLAVE_PERFIL);
    localStorage.removeItem(CLAVE_PRIMER_USO);
    perfil = { voz: null, idioma: "es" };
    flujo = null;
    renderBotonesFijos();
    document.getElementById("modal-config").classList.remove("visible");
    document.getElementById("modal-privacidad").classList.add("visible");
}

function limpiarConversacion() {
    if (vozAutomatica && "speechSynthesis" in window) speechSynthesis.cancel();
    flujo = null;
    modoEnLinea = false;
    document.getElementById("cuadro-conversacion").innerHTML = "";
    decir(t(
        "Conversación limpia. ¿En qué te ayudo?",
        "Conversation cleared. How can I help you?"
    ));
}

// ---------- Privacidad ----------
function abrirModalPrivacidadIdioma() {
    const es = perfil.idioma !== "en";
    document.getElementById("titulo-privacidad").textContent = es ? "🔒 Aviso de Privacidad" : "🔒 Privacy Notice";
    document.getElementById("cuerpo-privacidad").innerHTML = es
? `<p><strong>Este sitio es un asistente de apoyo independiente.</strong> No es un sitio oficial del Gobierno de México ni de SEMAR. Los trámites se concluyen únicamente en los canales oficiales de SEMAR (gob.mx) o en las Capitanías de Puerto.</p>
<p><strong>Qué datos se piden:</strong> solo los que tú decidas escribir para llenar tu solicitud (nombre, CURP, domicilio, teléfono, etc.).</p>
<p><strong>Para qué se usan:</strong> únicamente para llenar tu hoja de solicitud y tu folio de seguimiento.</p>
<p><strong>Quién los ve:</strong> <strong>nadie más que tú.</strong> Toda la información se guarda solamente en tu propio dispositivo (navegador). No se envía a ningún servidor ni se comparte con nadie.</p>
<p><strong>Cómo borrarlos:</strong> desde el botón de configuración ⚙️ ("Borrar mis datos") o limpiando el historial de tu navegador.</p>
<p>Al continuar, aceptas este manejo de tus datos personales.</p>`
: `<p><strong>This site is an independent support assistant.</strong> It is not an official site of the Government of Mexico or SEMAR. Procedures are completed only through SEMAR's official channels (gob.mx) or at the Harbor Master's Offices.</p>
<p><strong>What data is asked:</strong> only what you choose to type to fill your request form (name, CURP, address, phone, etc.).</p>
<p><strong>What it is used for:</strong> only to fill your request sheet and your tracking number.</p>
<p><strong>Who sees it:</strong> <strong>nobody but you.</strong> All information is stored only on your own device (browser). It is not sent to any server nor shared with anyone.</p>
<p><strong>How to delete it:</strong> from the settings button ⚙️ ("Borrar mis datos") or by clearing your browser history.</p>
<p>By continuing, you accept this handling of your personal data.</p>`;
    document.getElementById("boton-aceptar-privacidad").textContent = es ? "Acepto — quiero usar el asistente" : "I accept — let me use the assistant";
    document.getElementById("modal-privacidad").classList.add("visible");
}

// ---------- Inicio ----------
function iniciar() {
    const acepto = localStorage.getItem(CLAVE_PRIMER_USO);
    const perfilGuardado = leerLocal(CLAVE_PERFIL, null);
    if (perfilGuardado) perfil = { voz: null, idioma: "es", ...perfilGuardado };

    renderBotonesFijos();
    actualizarPlaceholder();
    actualizarIdiomaMicrofono();
    configurarMicrofono();

    document.getElementById("boton-enviar").addEventListener("click", enviarMensaje);
    document.getElementById("texto-usuario").addEventListener("keydown", e => {
        if (e.key === "Enter") { e.preventDefault(); enviarMensaje(); }
    });
    document.getElementById("boton-limpiar").addEventListener("click", limpiarConversacion);
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
    document.getElementById("enlace-privacidad").addEventListener("click", abrirModalPrivacidadIdioma);

    document.querySelectorAll(".opcion-voz").forEach(btn => {
        btn.addEventListener("click", () => {
            perfil.voz = btn.dataset.voz;
            actualizarEleccionVoz();
            actualizarBotonGuardar();
            leerEnVoz(perfil.idioma === "en"
                ? "This is how my voice sounds."
                : "Así suena mi voz.", null);
        });
    });

    document.querySelectorAll(".opcion-idioma").forEach(btn => {
        btn.addEventListener("click", () => {
            perfil.idioma = btn.dataset.idioma;
            actualizarEleccionIdioma();
            actualizarBotonGuardar();
        });
    });

    if (!acepto) {
        abrirModalPrivacidadIdioma();
    } else {
        decir(saludoPrincipal());
    }
}

document.addEventListener("DOMContentLoaded", iniciar);
