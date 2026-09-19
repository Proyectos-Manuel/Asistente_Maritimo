// ==========================================
// ASISTENTE PARA TRÁMITES — lógica principal
// Español/inglés, formato de solicitud
// oficial por trámite, chat limpio.
// ==========================================

// ---------- Estado global ----------
const CLAVE_VOZ = "unaman_voz_automatica";
let vozAutomatica = leerLocal(CLAVE_VOZ, true);
let reconocimiento = null;
let reconociendo = false;
let perfil = { voz: null, idioma: "es" };
let flujo = null;          // flujo de llenado activo (idioma fijo al iniciar)
let modoEnLinea = false;

const CLAVE_PRIMER_USO = "unaman_privacidad_aceptada";
const CLAVE_PERFIL = "unaman_perfil";
const CLAVE_SOLICITUDES = "unaman_solicitudes";
const CLAVE_USUARIO = "unaman_usuario";

// 💛 ENLACE DE APOYO VOLUNTARIO
const ENLACE_APOYO = "http://link.mercadopago.com.mx/asistentetramites";

// ---------- Usuario (preparado para el futuro "Premium") ----------
// Hoy siempre es "anónimo". Se llenará cuando añadamos login más adelante.
let usuario = leerLocal(CLAVE_USUARIO, { tipo: "anónimo", id: null, expira: null, primerUso: null });

// Marca la fecha del primer uso (servirá para dar acceso fundador gratis)
if (!usuario.primerUso) {
    usuario.primerUso = new Date().toISOString().slice(0, 10);
    guardarLocal(CLAVE_USUARIO, usuario);
}

// Devuelve true solo si el usuario es premium y no ha expirado.
// Hoy siempre devuelve false; la lógica real se activará al añadir el premium.
function esPremium() {
    if (usuario.tipo !== "premium") return false;
    if (usuario.expira && new Date(usuario.expira) < new Date()) return false;
    return true;
}

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
    // Número de referencia PERSONAL del asistente. No es oficial.
    // Sirve solo para que el usuario identifique su solicitud guardada.
    return "R-" + Math.floor(1000 + Math.random() * 9000);
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

// Pregunta adaptada al solicitante: pasaporte si es extranjero, RFC si es persona moral
function campoPreguntaActual(c, idioma) {
    let pregunta = campoPregunta(c, idioma);
    const sol = flujo && flujo.solicitante;
    if (c.tipo === "curp" && sol) {
        if (sol.nacionalidad === "extranjero") {
            pregunta = t("¿Cuál es el número de tu pasaporte? Escríbelo tal como aparece en el documento.", "What is your passport number? Write it exactly as shown on the document.");
        } else if (sol.tipo === "moral") {
            pregunta = t("¿Cuál es su RFC? Son 12 o 13 letras y números. Si aún no tiene RFC, escribe \"no tengo\".", "What is its tax ID (RFC)? If it does not have one yet, write \"no tengo\".");
        }
    }
    return pregunta;
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
// Solo reemplaza siglas exactas, en MAYÚSCULAS, para no confundir palabras comunes.
// Ejemplo: "VINE" o "DEFINE" no deben convertirse en "VENE" o "DEFENE".
const PRONUNCIACION = [
    { ver: /\bCURP\b/g, decir: "curpe" },
    { ver: /\bRFC\b/g, decir: "erre efe ce" },
    { ver: /\bINE\b/g, decir: "ene" },
    { ver: /\bSTCW\b/g, decir: "este ce doble uve" },
    { ver: /\bISPS\b/g, decir: "i ese pe ese" }
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
    // Neutra: la voz predeterminada del dispositivo, sin buscar género
    if (perfil.voz === "neutra") return lista[0];
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
    // Femenina a ritmo natural; masculina algo más lenta por el pitch bajo; neutra sin ajustes
    utterance.rate = perfil.voz === "masculina" ? 0.92 : perfil.voz === "neutra" ? 1 : 1.05;
    utterance.pitch = perfil.voz === "masculina" ? 0.7 : perfil.voz === "neutra" ? 1 : 1.15;
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

// ---------- Tutorial de bienvenida ----------
const CLAVE_TUTORIAL = "unaman_tutorial_completado";
let tutorial = null;   // { paso } durante la bienvenida

const PASOS_TUTORIAL = [
    {
        id: "funcion",
        texto: () => t(
            "¡Hola! Bienvenido a tu Asistente para Trámites.\n\nMi trabajo es acompañarte en los trámites de la UNAMAN que están disponibles por el momento. Mi objetivo es ahorrarte vueltas, filas y tiempo perdido: te explico cada trámite con la información de su ficha oficial, te ayudo a llenar tu solicitud y te dejo listo para presentarla.\n\nVamos a conocernos con unas preguntas rápidas.",
            "Hello! Welcome to your Procedures Assistant.\n\nMy job is to guide you through the UNAMAN procedures currently available. My goal is to save you detours, lines and wasted time: I explain each procedure with its official information sheet, help you fill your request and get you ready to submit it.\n\nLet's get acquainted with a few quick questions."
        ),
        boton: () => t("➡️ Siguiente", "➡️ Next"),
        alAceptar: () => pasoTutorial(1)
    },
    {
        id: "cuota",
        texto: () => t(
            "Este asistente es gratuito en su función principal, y seguirá siéndolo.\n\nAl final, si te sirvió, puedes apoyar el proyecto con una donación voluntaria. Es 100% opcional; la app funciona completa sin necesidad de donar.\n\nAl continuar, aceptas también los términos y condiciones de uso y el manejo confidencial de tus datos personales: todo lo que escribas se queda únicamente en tu dispositivo, nadie más lo ve.",
            "This assistant is free in its main function, and it will remain so.\n\nAt the end, if it helped you, you can support the project with a voluntary donation. It is 100% optional; the app works fully without donating.\n\nBy continuing, you also accept the terms and conditions of use and the confidential handling of your personal data: everything you write stays only on your device; nobody else sees it."
        ),
        boton: () => t("✅ Entendido", "✅ Got it"),
        alAceptar: () => pasoTutorial(2)
    },
    {
        id: "voz",
        texto: () => t(
            "¿Qué voz prefieres para mí? Puedo sonar femenina, masculina o neutra. La neutra usa la voz predeterminada de tu teléfono, sin buscar ningún género.\n\nNota: las voces dependen de las instaladas en cada dispositivo, así que pruébalas y quédate con la que mejor te suene. Tu asistente aparecerá en la esquina superior izquierda.\n\nTambién dime: ¿en qué idioma quieres que te auxilie? Si eliges inglés, todo te lo explico en inglés, pero la solicitud final se llena en español, lista para presentarse ante la oficina correspondiente.",
            "Which voice do you prefer for me? I can sound female, male or neutral. The neutral option uses your phone's default voice, without looking for any gender.\n\nNote: the available voices depend on the ones installed on each device, so try them and keep the one that sounds best to you. Your assistant will appear in the upper-left corner.\n\nAlso tell me: which language should I use? If you choose English, I explain everything in English, but the final request form is filled in Spanish, ready to submit at the corresponding office."
        ),
        conOpciones: true,
        boton: () => t("➡️ Siguiente", "➡️ Next"),
        alAceptar: () => pasoTutorial(3)
    },
    {
        id: "herramientas",
        texto: () => t(
            "Conozcamos las herramientas de la pantalla:\n\n🎤 Micrófono — para hablarme en lugar de escribir.\n➤ Enviar — manda tu mensaje.\n🧹 Empezar de nuevo — la brocha limpia la conversación y arrancamos frescos.\n🔊 Voz automática — el interruptor de abajo: ya la encendí por ti, así que leo todas mis respuestas en voz alta sin que toques la bocina. Al final del tutorial te preguntaré si quieres dejarla encendida o prefieres apagarla.\n⚙️ Configuración — el engranaje arriba a la derecha: ahí puedes cambiar tu voz, tu idioma y reiniciar el asistente para volver a ver este tutorial desde el principio.",
            "Let's look at the tools on the screen:\n\n🎤 Microphone — talk to me instead of typing.\n➤ Send — sends your message.\n🧹 Start over — the brush clears the conversation and we start fresh.\n🔊 Automatic voice — the switch below: I already turned it on for you, so I read all my answers out loud without you tapping the speaker. At the end of the tutorial I will ask whether you want to keep it on or turn it off.\n⚙️ Settings — the gear at the top right: there you can change your voice, your language, and restart the assistant to see this tutorial from the beginning."
        ),
        boton: () => t("➡️ Siguiente", "➡️ Next"),
        alAceptar: () => pasoTutorial(4)
    },
    {
        id: "apoyo",
        texto: () => t(
            "Durante el trámite te acompaño así:\n\n• Te explico cada trámite con la información de su ficha oficial: para qué sirve, requisitos y preguntas, en el orden de la ficha.\n• Te pregunto si eres persona física o moral, y si eres nacional o extranjero; si eres extranjero, en lugar de tu CURP te pido el número de tu pasaporte.\n\n¿Listo? Empecemos.",
            "During your procedure I support you like this:\n\n• I explain each procedure with its official information sheet: what it is for, requirements and questions, in the sheet's order.\n• I ask whether you are an individual or a company, and whether you are a national or a foreigner; if you are a foreigner, I ask for your passport number instead of your CURP.\n\nReady? Let's start."
        ),
        boton: () => t("🚀 Empezar", "🚀 Start"),
        alAceptar: () => terminarTutorial()
    }
];

function iniciarTutorial() {
    tutorial = { paso: 0 };
    document.getElementById("zona-entrada").style.opacity = "0.35";
    document.getElementById("zona-entrada").style.pointerEvents = "none";
    pasoTutorial(0);
}

function pasoTutorial(n) {
    if (!tutorial) return;
    tutorial.paso = n;
    const paso = PASOS_TUTORIAL[n];
    const div = agregarMensajeConTutor(paso.texto(), paso, !!paso.conOpciones);
    if (vozAutomatica) leerEnVoz(paso.texto(), null);
    if (paso.boton) {
        const cont = div.querySelector(".texto-mensaje");
        const contBotones = document.createElement("div");
        contBotones.className = "botones-mensaje";
        const btn = document.createElement("button");
        btn.className = "boton-accion primario";
        btn.textContent = paso.boton();
        btn.addEventListener("click", () => { div.remove(); paso.alAceptar(); });
        contBotones.appendChild(btn);
        cont.appendChild(contBotones);
    }
}

function terminarTutorial() {
    guardarLocal(CLAVE_TUTORIAL, true);
    tutorial = null;
    document.getElementById("zona-entrada").style.opacity = "";
    document.getElementById("zona-entrada").style.pointerEvents = "";
    decir(t(
        "Perfecto, ya estamos listos. Última pregunta: la voz automática está encendida, ¿quieres dejarla así?",
        "Perfect, we are all set. Last question: the automatic voice is on, do you want to keep it that way?"
    ), [
        { etiqueta: t("🔊 Dejar la voz encendida", "🔊 Keep the voice on"), accion: () => fijarVozAutomatica(true) },
        { etiqueta: t("🔇 Apagar la voz", "🔇 Turn the voice off"), accion: () => fijarVozAutomatica(false) }
    ]);
}

function fijarVozAutomatica(activa) {
    vozAutomatica = activa;
    guardarLocal(CLAVE_VOZ, activa);
    document.getElementById("interruptor-voz").setAttribute("aria-checked", activa ? "true" : "false");
    if (!activa && "speechSynthesis" in window) speechSynthesis.cancel();
    decir(activa
        ? t("Voz automática encendida. Te leeré todas mis respuestas. Puedes cambiarla cuando quieras con el interruptor de abajo. ¿En qué te ayudo hoy?", "Automatic voice on. I will read all my answers to you. You can change it anytime with the switch below. How can I help you today?")
        : t("Voz automática apagada. Puedes encenderla cuando quieras con el interruptor de abajo. ¿En qué te ayudo hoy?", "Automatic voice off. You can turn it on anytime with the switch below. How can I help you today?"));
}

function agregarMensajeConTutor(texto, paso, conOpciones) {
    const caja = document.getElementById("cuadro-conversacion");
    const div = document.createElement("div");
    div.className = "mensaje asistente tutorial-paso";
    const cuerpo = escapar(texto).replace(/\n/g, "<br>");
    div.innerHTML = '<div class="contenido-mensaje"><span class="texto-mensaje">' + cuerpo + '</span></div>';
    const cont = div.querySelector(".texto-mensaje");

    if (conOpciones) {
        const fila = document.createElement("div");
        fila.className = "opciones-tutorial";
        for (const v of ["femenina", "masculina", "neutra"]) {
            const btn = document.createElement("button");
            btn.className = "opcion-voz" + (perfil.voz === v ? " elegida" : "");
            btn.dataset.voz = v;
            btn.innerHTML = '<span class="icono">' + AVATARES[v] + '</span><span class="rotulo">' +
                (v === "femenina" ? t("Femenina", "Female") : v === "masculina" ? t("Masculina", "Male") : t("Neutra", "Neutral")) + '</span>';
            btn.addEventListener("click", () => {
                perfil.voz = v;
                fila.querySelectorAll(".opcion-voz").forEach(b => b.classList.toggle("elegida", b === btn));
                actualizarAvatar();
                guardarLocal(CLAVE_PERFIL, perfil);
                leerEnVoz(perfil.idioma === "en" ? "This is how I sound." : "Así sueno yo.", null);
            });
            fila.appendChild(btn);
        }
        const filaIdioma = document.createElement("div");
        filaIdioma.className = "opciones-tutorial";
        for (const idioma of ["es", "en"]) {
            const btn = document.createElement("button");
            btn.className = "opcion-idioma" + (perfil.idioma === idioma ? " elegida" : "");
            btn.dataset.idioma = idioma;
            btn.innerHTML = '<span class="icono">' + (idioma === "es" ? "🇲🇽" : "🇺🇸") + '</span><span class="rotulo">' +
                (idioma === "es" ? "Español" : "English") + '</span>';
            btn.addEventListener("click", () => {
                perfil.idioma = idioma;
                filaIdioma.querySelectorAll(".opcion-idioma").forEach(b => b.classList.toggle("elegida", b === btn));
                guardarLocal(CLAVE_PERFIL, perfil);
                actualizarIdiomaMicrofono();
                actualizarPlaceholder();
            });
            filaIdioma.appendChild(btn);
        }
        cont.appendChild(fila);
        cont.appendChild(filaIdioma);
    }

    caja.appendChild(div);
    caja.scrollTop = caja.scrollHeight;
    return div;
}

// ---------- Avatar ----------
const AVATARES = { femenina: "👩", masculina: "👨‍🦲", neutra: "🧑" };

function actualizarAvatar() {
    const cont = document.getElementById("avatar-asistente");
    if (!cont) return;
    cont.textContent = perfil.voz ? (AVATARES[perfil.voz] || "🧑") : "🧑";
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
                    // Los botones "persistentes" no se borran: el usuario puede volver a elegir
                    if (!b.persistente) {
                        div.remove();
                    }
                    b.accion();
                });
                cont.appendChild(btn);
            }
            div.querySelector(".texto-mensaje").appendChild(cont);
        }
    } else {
        div.innerHTML = `
            <div class="texto-mensaje">
                <span class="texto-cuerpo">${cuerpo}</span>
                <button class="boton-editar" title="${t('Corregir este mensaje', 'Edit this message')}" aria-label="${t('Corregir este mensaje', 'Edit this message')}">✏️</button>
            </div>
        `;
        const contexto = opciones.contexto || null;
        const btnEditar = div.querySelector(".boton-editar");
        btnEditar.addEventListener("click", () => {
            const campo = document.getElementById("texto-usuario");
            campo.value = texto;
            div.remove();
            restaurarContextoFlujo(contexto);
            campo.focus();
        });
    }

    caja.appendChild(div);
    caja.scrollTop = caja.scrollHeight;
    return div;
}

// Restaura el flujo al punto exacto donde estaba cuando el usuario envió ese mensaje.
// Si no hay contexto (o el flujo ya cambió), simplemente no hace nada y deja que
// procesarMensaje trate el texto como nuevo.
function restaurarContextoFlujo(contexto) {
    if (!contexto || !flujo) return;
    // Solo si seguimos en el mismo trámite
    const mismoTramite = flujo.tramite && flujo.tramite.id === contexto.tramiteId;
    if (!mismoTramite) return;

    if (contexto.paso === "llenado" && typeof contexto.indice === "number") {
        // Regresamos al campo exacto que el usuario está corrigiendo
        flujo.paso = "llenado";
        flujo.indice = contexto.indice;
        const campo = flujo.tramite.campos[contexto.indice];
        if (campo) delete flujo.datos[campo.id];
    } else if (contexto.paso === "dictado" && typeof contexto.seccionDictado === "number") {
        flujo.paso = "dictado";
        flujo.seccionDictado = contexto.seccionDictado;
        flujo.borradorDictado = "";
    } else if (contexto.paso) {
        // Otros pasos: solo restauramos el nombre del paso
        flujo.paso = contexto.paso;
    }
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
        { etiqueta: t("📋 Ver trámites de la UNAMAN", "📋 UNAMAN procedures"), accion: () => { const x = flujo; flujo = null; menuTramites(); flujo = x; } },
        { etiqueta: t("📋 Mis solicitudes guardadas", "📋 My saved requests"), accion: () => listarSolicitudesLocales() }
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

// ---------- Menú de trámites englobado por categorías ----------
function menuTramites() {
    const idioma = idiomaFlujo();
    let texto = t(
        "Por ahora te acompaño con los trámites de la UNAMAN. Elige una categoría y te muestro sus trámites:",
        "For now I can help you with UNAMAN procedures. Pick a category and I'll show you its procedures:"
    );
    const botones = [];
    for (const cat of CATEGORIAS) {
        const lista = TRAMITES.filter(tr => tr.categoria === cat.id);
        if (!lista.length && !RUTAS[cat.id]) continue;
        botones.push({ etiqueta: cat.emoji + " " + categoriaNombre(cat, idioma), accion: () => menuCategoria(cat) });
    }
    decir(texto, botones);
}

function menuCategoria(cat) {
    const idioma = idiomaFlujo();
    const ruta = RUTAS[cat.id];
    let botones = [];
    if (ruta) {
        botones = [{
            etiqueta: t("✨ Empezar — te pregunto lo básico", "✨ Start — I'll ask you the basics"),
            accion: () => iniciarRuta(cat),
            estilo: "primario"
        }];
    } else {
        botones = TRAMITES.filter(tr => tr.categoria === cat.id).map(tr => ({
            etiqueta: tramiteNombre(tr, idioma),
            accion: () => elegirTramite(tr)
        }));
    }
    botones.push({
        etiqueta: t("↩️ Ver otras categorías", "↩️ See other categories"),
        accion: () => menuTramites()
    });
    decir(cat.emoji + " " + categoriaNombre(cat, idioma), botones);
}

// ---------- Rutas guiadas: preguntas hasta la solicitud exacta ----------
function iniciarRuta(cat) {
    const idioma = idiomaFlujo();
    flujo = { paso: "ruta", categoria: cat.id, pasoIndice: 0, respuestas: {}, tramite: null, datos: {}, indice: 0, idioma };
    preguntarPasoRuta();
}

function preguntarPasoRuta() {
    const idioma = idiomaFlujo();
    const ruta = RUTAS[flujo.categoria];
    // Avanza hasta un paso aplicable a las respuestas previas
    while (flujo.pasoIndice < ruta.pasos.length && ruta.pasos[flujo.pasoIndice].soloSi && !ruta.pasos[flujo.pasoIndice].soloSi(flujo.respuestas)) {
        flujo.pasoIndice++;
    }
    if (flujo.pasoIndice >= ruta.pasos.length) {
        const destinoId = ruta.destino(flujo.respuestas);
        const destino = buscarTramitePorId(destinoId);
        flujo.paso = "elegido";
        flujo.tramite = destino;
        elegirTramite(destino, flujo.respuestas);
        return;
    }
    const paso = ruta.pasos[flujo.pasoIndice];
    const botones = paso.opciones.map(o => ({
        etiqueta: (idioma === "en" ? (o.etiquetaEn || o.etiqueta) : o.etiqueta),
        accion: () => responderPasoRuta(o)
    }));
    decir(idioma === "en" ? (paso.preguntaEn || paso.pregunta) : paso.pregunta, botones);
}

function responderPasoRuta(opcion) {
    const paso = RUTAS[flujo.categoria].pasos[flujo.pasoIndice];
    flujo.respuestas[paso.id] = opcion.valor;
    flujo.pasoIndice++;
    preguntarPasoRuta();
}

// ---------- Elección de trámite: ¿en línea o con formato para imprimir? ----------
function elegirTramite(tramite, respuestasRuta) {
    const idioma = idiomaFlujo();
    const respuestas = respuestasRuta || (flujo && flujo.respuestas) || {};
    flujo = { tramite, datos: {}, indice: 0, paso: "pregunta-camino", idioma, respuestasRuta: respuestas };
    let texto = tramiteNombre(tramite, idioma) + " (" + tramite.clave + ")\n\n";
    texto += t("¿Para qué sirve? ", "What is it for? ") + tramiteSinopsis(tramite, idioma) + "\n\n";
    texto += t("Estos son los requisitos de su ficha oficial:\n", "These are the requirements from its official information sheet:\n");
    listaRequisitos(tramite, idioma).forEach((r, i) => { texto += (i + 1) + ". " + r + "\n"; });
    texto += "\n";
    if (tramite.enLinea) {
        texto += t(
            "Puedes iniciar este trámite en línea en el sitio oficial correspondiente, o puedo llenar tu solicitud en el formato oficial para imprimirla y presentarla en la oficina que corresponda.\n\n¿Qué prefieres?",
            "You can start this procedure online on the corresponding official site, or I can fill your request in the official form to print and submit it at the corresponding office.\n\nWhat do you prefer?"
        );
    } else {
        texto += t(
            "Este trámite se presenta de manera presencial en la Capitanía de Puerto; no se hace por internet. Puedo llenar tu solicitud en el formato oficial ahora, para que llegues con todo listo.\n\n¿Llenamos tu solicitud?",
            "This procedure is submitted in person at the Harbor Master's Office; it cannot be done online. I can fill your request in the official form now, so you arrive ready.\n\nShall we fill out your request?"
        );
    }
    const botones = [];
    // Opción primaria: llenar la solicitud para imprimir (flujo principal)
    botones.push({ etiqueta: t("🖨️ Llenar la solicitud para imprimir", "🖨️ Fill out the request form to print"), accion: () => empezarLlenado(), estilo: "primario" });
    // Opción secundaria: hacerlo en línea (solo si aplica)
    if (tramite.enLinea) {
        botones.push({ etiqueta: t("🌐 Hacerlo en línea", "🌐 Do it online"), accion: () => empezarEnLinea() });
    }
    decir(texto, botones);
}

function empezarEnLinea() {
    const idioma = idiomaFlujo();
    const tr = flujo.tramite;
    flujo.paso = "guia-linea";
    modoEnLinea = true;
    let texto = t("Estos son los requisitos. Tenlos a la mano:\n\n", "These are the requirements. Have them ready:\n\n");
    listaRequisitos(tr, idioma).forEach((r, i) => { texto += (i + 1) + ". " + r + "\n"; });
    texto += "\n" + t(
        "Cuando los tengas, abre el sitio oficial correspondiente y busca \"" + tramiteNombre(tr, idioma) + "\". Si te atoras en alguna pantalla, escribe \"¿cómo lleno...?\" y te explico.\n\n¿Abro el sitio?",
        "When you have them, open the corresponding official site and look for \"" + tramiteNombre(tr, idioma) + "\". If you get stuck on any screen, type \"how do I fill...?\" and I will explain.\n\nOpen the site?"
    );
    decir(texto, [
        { etiqueta: t("🌐 Abrir el sitio oficial", "🌐 Open the official site"), accion: () => abrirPortal(), estilo: "primario" },
        { etiqueta: t("🖨️ Mejor lléname la solicitud", "🖨️ Fill out the request form instead"), accion: () => empezarLlenado() }
    ]);
}

function abrirPortal() {
    const idioma = idiomaFlujo();
    const url = (flujo && flujo.tramite && flujo.tramite.portal) || "https://www.gob.mx/semar/unaman";
    // Intentar abrir en nueva pestaña
    const ventana = window.open(url, "_blank", "noopener");
    if (!ventana || ventana.closed || typeof ventana.closed === "undefined") {
        // Pop-up bloqueado: mostrar el enlace para que lo abra manualmente
        decir(t(
            "⚠️ Tu navegador bloqueó la ventana emergente.\n\n" +
            "Copia y pega este enlace en tu navegador para abrir el sitio oficial:\n\n" +
            url,
            "⚠️ Your browser blocked the pop-up.\n\n" +
            "Copy and paste this link into your browser to open the official site:\n\n" +
            url
        ), [
            { etiqueta: t("✅ Ya lo abrí", "✅ I opened it"), accion: () => terminarEnLinea() }
        ]);
    } else {
        decir(
            t(
                "Abrí el sitio oficial.\n\nRecuerda: soy solo tu guía de apoyo; el trámite se concluye en el sitio oficial correspondiente. Si tienes dudas en el camino, escríbeme y te explico.",
                "I opened the official site.\n\nRemember: I am only your support guide; the procedure is completed on the corresponding official site. If you have questions along the way, write to me and I will explain."
            ),
            [{ etiqueta: t("✅ Ya terminé mi trámite en línea", "✅ I finished my online procedure"), accion: () => terminarEnLinea() }]
        );
    }
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
    flujo.paso = "llenado-perfil-tipo";
    flujo.indice = 0;
    flujo.solicitante = { tipo: null, nacionalidad: null };
    let texto = t(
        "Llenaré la solicitud en el formato oficial \"" + tr.clave + "\". Te haré unas preguntas, una por una, en español; la solicitud final queda en español para presentarla en la oficina correspondiente.\n\n",
        "I will fill the request in the official form \"" + tr.clave + "\". I will ask a few questions, one at a time, in English so you can understand everything; the final form is written in Spanish to submit it at the corresponding office.\n\n"
    );
    texto += t("Te repito los requisitos de la ficha oficial para que los tengas a la mano:\n", "Here are the official requirements again, so you have them handy:\n");
    listaRequisitos(tr, idioma).forEach((r, i) => { texto += (i + 1) + ". " + r + "\n"; });
    texto += "\n" + t("Puedes escribir \"corregir\" para volver a la pregunta anterior.", "You can type \"corregir\" to go back to the previous question.");
    decir(texto);
    decir(t("Antes de empezar: ¿eres persona física (una persona) o persona moral (una empresa u organización)?",
            "First: are you an individual (a person) or a company/organization?"), [
        { etiqueta: t("👤 Persona física", "👤 Individual"), accion: () => responderPerfilSolicitante("fisica") },
        { etiqueta: t("🏢 Persona moral (empresa u organización)", "🏢 Company/organization"), accion: () => responderPerfilSolicitante("moral") }
    ]);
}

function responderPerfilSolicitante(tipo) {
    flujo.solicitante.tipo = tipo;
    flujo.paso = "llenado-perfil-nacionalidad";
    decir(t("¿Eres nacional (mexicano) o extranjero?", "Are you a Mexican national or a foreigner?"), [
        { etiqueta: t("🇲🇽 Nacional", "🇲🇽 National"), accion: () => responderNacionalidad("nacional") },
        { etiqueta: t("🌍 Extranjero", "🌍 Foreigner"), accion: () => responderNacionalidad("extranjero") }
    ]);
}

function responderNacionalidad(nacionalidad) {
    flujo.solicitante.nacionalidad = nacionalidad;
    flujo.paso = "llenado";
    flujo.indice = 0;
    decir(campoPreguntaActual(flujo.tramite.campos[0], idiomaFlujo()));
}

function procesarPerfilSolicitante(texto) {
    const n = normalizar(texto);
    if (/(moral|empresa|organizacion|compania|company)/.test(n)) { responderPerfilSolicitante("moral"); return; }
    if (/(fisica|persona|individual)/.test(n)) { responderPerfilSolicitante("fisica"); return; }
    decir(t("Por favor elige una opción: persona física o persona moral (empresa).", "Please choose one: individual or company."));
}

function procesarNacionalidad(texto) {
    const n = normalizar(texto);
    if (/(extranjero|foreign|otro pais)/.test(n)) { responderNacionalidad("extranjero"); return; }
    if (/(nacional|mexicano|mexicana|national)/.test(n)) { responderNacionalidad("nacional"); return; }
    decir(t("Por favor elige una opción: nacional o extranjero.", "Please choose one: national or foreigner."));
}

function procesarRespuestaLlenado(texto) {
    const idioma = idiomaFlujo();
    const tr = flujo.tramite;
    const campo = tr.campos[flujo.indice];

    if (normalizar(texto).match(/(corregir|correct|go back|atras)/)) {
        if (flujo.indice === 0) {
            decir(campoPreguntaActual(campo, idioma));
        } else {
            flujo.indice--;
            delete flujo.datos[tr.campos[flujo.indice].id];
            decir(campoPreguntaActual(tr.campos[flujo.indice], idioma));
        }
        return;
    }

    const error = validarCampo(campo, texto, idioma, flujo.solicitante);
    if (error) {
        decir(error + "\n\n" + campoPreguntaActual(campo, idioma));
        return;
    }

    flujo.datos[campo.id] = texto.trim();
    flujo.indice++;

    if (flujo.indice < tr.campos.length) {
        const siguiente = tr.campos[flujo.indice];
        let msg = campoPreguntaActual(siguiente, idioma);
        if (idioma !== "en" && siguiente.ayuda) msg += "\n\n" + siguiente.ayuda;
        decir(msg);
    } else if (tr.dictado) {
        iniciarDictado();
    } else {
        concluirSolicitud();
    }
}

// ---------- Dictado del acta de protesta ----------
function iniciarDictado() {
    const idioma = idiomaFlujo();
    const tr = flujo.tramite;
    flujo.paso = "dictado";
    flujo.seccionDictado = 0;
    flujo.dictadoTexto = {};
    flujo.borradorDictado = "";
    decir(t(
        "Perfecto. Ahora viene la parte más importante: tu relato.\n\nTe guiaré sección por sección. Puedes hablar o escribir con calma, sin límite de palabras, y en varios mensajes si lo necesitas.\n\nCuando termines cada sección, toca el botón \"✅ Ya terminé esta sección\".",
        "Perfect. Now comes the most important part: your account.\n\nI'll guide you section by section. Speak or write calmly, with no word limit, in as many messages as you need.\n\nWhen you finish each section, tap the button \"✅ I finished this section\"."
    ));
    const sec = tr.seccionesDictado[0];
    decir(idioma === "en" ? sec.introduccionEn : sec.introduccion);
    mostrarBotonesDictado();
}

function mostrarBotonesDictado() {
    const idioma = idiomaFlujo();
    const total = flujo.tramite.seccionesDictado.length;
    const actual = flujo.seccionDictado + 1;
    const titulo = t(
        "📝 Sección " + actual + " de " + total + ". Cuando termines, toca el botón.",
        "📝 Section " + actual + " of " + total + ". When you finish, tap the button."
    );
    decir(titulo, [
        { etiqueta: t("✅ Ya terminé esta sección", "✅ I finished this section"), accion: () => cerrarSeccionDictado(), estilo: "primario", persistente: true }
    ]);
}

function procesarDictado(texto) {
    // En el nuevo modelo, todo lo que el usuario escriba se acumula en el borrador.
    // La sección se cierra solo cuando el usuario toca el botón "Ya terminé esta sección".
    flujo.borradorDictado = (flujo.borradorDictado ? flujo.borradorDictado + " " : "") + texto.trim();
    // Confirmación breve para que sepa que lo escuchamos
    decir(t("📝 Anotado. Puedes seguir escribiendo o hablar, y tocar \"✅ Ya terminé esta sección\" cuando acabes esta parte.",
            "📝 Noted. You can keep typing or speaking, and tap \"✅ I finished this section\" when you finish this part."));
}

function cerrarSeccionDictado() {
    const idioma = idiomaFlujo();
    const secciones = flujo.tramite.seccionesDictado;
    const sec = secciones[flujo.seccionDictado];
    // Si el usuario no escribió nada, al menos guardamos un texto vacío para no bloquear
    flujo.dictadoTexto[sec.id] = flujo.borradorDictado || "";
    flujo.borradorDictado = "";
    flujo.seccionDictado++;

    if (flujo.seccionDictado < secciones.length) {
        const siguiente = secciones[flujo.seccionDictado];
        decir(idioma === "en" ? siguiente.introduccionEn : siguiente.introduccion);
        mostrarBotonesDictado();
    } else {
        concluirSolicitud();
    }
}

function validarCampo(campo, valor, idioma, solicitante) {
    const v = valor.trim();
    const es = idioma !== "en";
    if (campo.obligatorio && !v) {
        return es ? "Ese dato es necesario para tu solicitud." : "That information is required.";
    }
    if (!v) return null;
    if (campo.tipo === "curp") {
        // Extranjero: se pide pasaporte en lugar de CURP, sin validación de CURP
        if (solicitante && solicitante.nacionalidad === "extranjero") return null;
        if (solicitante && solicitante.tipo === "moral" && /^(no tengo|no tiene)$/.test(normalizar(v))) return null;
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
        dictado: flujo.dictadoTexto ? { ...flujo.dictadoTexto } : null,
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
    resumen += t("🔖 Número de referencia (para ti): ", "🔖 Reference number (for you): ") + solicitud.folio + "\n\n";
    resumen += t(
        "Tu hoja de solicitud, en el formato oficial y en español, está lista. Preséntala en la oficina correspondiente con tu carpeta de documentos.\n\n" +
        "📌 Nota importante: el folio oficial de seguimiento te lo dará la oficina cuando recibas tu trámite. El número de arriba es solo del asistente, para que puedas identificar tu solicitud en este dispositivo.",
        "Your request sheet, in the official form and in Spanish, is ready. Submit it at the corresponding office with your document folder.\n\n" +
        "📌 Important: the official reference number will be given to you by the office when you submit your procedure. The number above is only from the assistant, so you can identify your request on this device."
    );

    flujo = null;
    decir(resumen, [
        { etiqueta: t("📄 Descargar mi solicitud (PDF)", "📄 Download my request (PDF)"), accion: () => descargarYApoyar(solicitud), estilo: "primario", persistente: true },
        { etiqueta: t("📁 Ver qué más llevar", "📁 See what else to bring"), accion: () => decirCarpeta(tr, idioma), persistente: true },
        { etiqueta: t("🕐 Ver plazos y tiempos de atención", "🕐 See deadlines and service hours"), accion: () => verPlazosYRecordatorio(solicitud), persistente: true }
    ]);
}

function descargarYApoyar(solicitud) {
    generarPDF(solicitud);
    setTimeout(() => mostrarApoyo(), 900);
}

function mostrarApoyo() {
    const tieneEnlace = ENLACE_APOYO && ENLACE_APOYO.length > 0;
    let texto = t(
        "🎉 Listo, tu solicitud está descargada.\n\n" +
        "💛 Este asistente es y seguirá siendo gratuito en su función principal.\n\n" +
        "Si te sirvió, puedes apoyar el proyecto con una donación voluntaria. Es 100% opcional — la app funciona completa sin necesidad de donar. Tu apoyo ayuda a mantenerla en línea y a seguir agregando más trámites de otras dependencias.\n\n" +
        "🙏 Gracias por confiar en este proyecto.",
        "🎉 Done, your request has been downloaded.\n\n" +
        "💛 This assistant is and will remain free in its main function.\n\n" +
        "If it helped you, you can support the project with a voluntary donation. It is 100% optional — the app works fully without donating. Your support helps keep it online and add more procedures from other agencies.\n\n" +
        "🙏 Thank you for trusting this project."
    );
    const botones = [];
    if (tieneEnlace) {
        botones.push({
            etiqueta: t("💛 Apoyar al proyecto", "💛 Support the project"),
            accion: () => abrirEnlaceApoyo(),
            estilo: "primario"
        });
    }
    botones.push({
        etiqueta: t("📋 Hacer otro trámite", "📋 Start another procedure"),
        accion: () => { flujo = null; menuTramites(); }
    });
    botones.push({
        etiqueta: t("📋 Ver mis solicitudes guardadas", "📋 See my saved requests"),
        accion: () => listarSolicitudesLocales()
    });
    decir(texto, botones);
}

function abrirEnlaceApoyo() {
    // Intentar abrir en nueva pestaña
    const ventana = window.open(ENLACE_APOYO, "_blank", "noopener");
    if (!ventana || ventana.closed || typeof ventana.closed === "undefined") {
        // Pop-up bloqueado: mostrar el enlace para copiar manualmente
        decir(t(
            "⚠️ Tu navegador bloqueó la ventana emergente.\n\n" +
            "Copia y pega este enlace en tu navegador para hacer tu donación:\n\n" +
            ENLACE_APOYO,
            "⚠️ Your browser blocked the pop-up.\n\n" +
            "Copy and paste this link into your browser to make your donation:\n\n" +
            ENLACE_APOYO
        ));
    }
}

function decirCarpeta(tr, idioma) {
    let texto = t("📁 TU CARPETA PARA LA VENTANILLA\n\nAdemás de tu solicitud, lleva:\n",
                  "📁 YOUR DOCUMENT FOLDER\n\nBesides your request form, bring:\n");
    listaRequisitos(tr, idioma).forEach((r, i) => { texto += (i + 1) + ". " + r + (idioma === "en" ? " (original and one copy)" : " (original y una copia)") + "\n"; });
    decir(texto);
    decirHorariosPresentacion();
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
    const dato = id => s.datos[id] || "";

    // Encabezado del formato
    doc.setFont("helvetica", "bold"); doc.setFontSize(13);
    doc.text("SOLICITUD DE TRÁMITE", 108, y, { align: "center" }); y += 6;
    doc.setFontSize(11);
    doc.text("Asistente para Trámites — Documento de apoyo", 108, y, { align: "center" }); y += 7;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text("Homoclave del formato: " + s.clave, M, y);
    doc.text("Folio de seguimiento: " + s.folio, M + ancho, y, { align: "right" }); y += 8;

    doc.setDrawColor(0, 58, 93); doc.setLineWidth(0.6);
    doc.line(M, y, M + ancho, y); y += 7;

    doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    y += pdfMultiLinea(doc, s.tramiteNombre.toUpperCase(), M, y, ancho, 5) + 1;

    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text("Fecha de llenado: " + formatearFecha(s.fecha, "es"), M, y); y += 7;
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
            const valor = String(s.datos[c.id]);
            const lineas = doc.splitTextToSize(valor, ancho - 60);
            doc.text(lineas, M + 60, y);
            y += Math.max(5.5, lineas.length * 4.6);
        }
        y += 3;
    }

    // Petición
    doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text("FORMULACIÓN DE LA PETICIÓN", M, y); y += 3;
    doc.setDrawColor(180, 195, 205); doc.line(M, y, M + ancho, y); y += 6;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5);
    const peticion = "Quien suscribe, " + (dato("nombre") || dato("nombrePropietario") || dato("nombrePatron") || dato("responsable") || dato("organizacion") || "(nombre del solicitante)") +
        ", comparece ante la autoridad correspondiente para solicitar: " + s.tramiteNombre + ", conforme a la clave " + s.clave + ", y declara bajo protesta de decir verdad que los datos proporcionados son verídicos.";
    y += pdfMultiLinea(doc, peticion, M, y, ancho, 4.6) + 5;

    // Dictado del acta de protesta (secciones de la descripción de los hechos)
    if (s.dictado) {
        for (const sec of tramite.seccionesDictado || Object.keys(s.dictado).map(k => ({ id: k, etiqueta: k }))) {
            const texto = s.dictado[sec.id];
            if (!texto) continue;
            if (y > 235) { doc.addPage(); y = 20; }
            doc.setFont("helvetica", "bold"); doc.setFontSize(10);
            doc.text(sec.etiqueta.toUpperCase(), M, y); y += 3;
            doc.setDrawColor(180, 195, 205); doc.line(M, y, M + ancho, y); y += 6;
            doc.setFont("helvetica", "normal"); doc.setFontSize(9.5);
            y += pdfMultiLinea(doc, texto, M, y, ancho, 4.6) + 5;
        }
    }

    // Documentos adjuntos
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
    const nota = "Documento de apoyo generado por el Asistente para Trámites; replica la estructura del formato " + s.clave +
        ". Preséntalo en la oficina correspondiente en horario de atención, junto con los documentos listados.";
    y += pdfMultiLinea(doc, nota, M, y, ancho, 3.6);

    doc.save("Solicitud_" + s.clave.replace(/[^A-Za-z0-9-]/g, "") + "_" + s.folio + ".pdf");
}

// ---------- Consulta de estatus ----------
function verPlazosYRecordatorio(solicitud) {
    const tr = flujoTramiteDe(solicitud);
    const idioma = perfil.idioma === "en" ? "en" : "es";

    let texto = t(
        "🕐 PLAZOS Y TIEMPOS DE ATENCIÓN\n\n" +
        "📍 Las oficinas de atención al público suelen operar de lunes a viernes, de 9:00 a 14:00 horas. Sábados, domingos y días festivos están cerradas.\n\n" +
        "⏳ El tiempo de respuesta del trámite depende de cada oficina. Como orientación general, suele resolverse entre 5 y 15 días hábiles.\n\n" +
        "📞 Para saber cómo va el avance de tu trámite, comunícate directamente con la oficina donde lo presentaste, o consúltalo en el portal oficial.",
        "🕐 DEADLINES AND SERVICE HOURS\n\n" +
        "📍 Public service offices usually operate Monday to Friday, 9:00 a.m. to 2:00 p.m. Saturdays, Sundays and holidays are closed.\n\n" +
        "⏳ The response time depends on each office. As a general guide, it is usually resolved within 5 to 15 business days.\n\n" +
        "📞 To know how your procedure is progressing, contact the office where you submitted it directly, or check it on the official portal."
    );

    decir(texto, [
        { etiqueta: t("🔔 Ponerme un recordatorio en este dispositivo", "🔔 Set a reminder on this device"), accion: () => crearRecordatorio(solicitud), persistente: true },
        { etiqueta: t("📋 Ver mis solicitudes guardadas", "📋 See my saved requests"), accion: () => listarSolicitudesLocales() }
    ]);
}

function crearRecordatorio(solicitud) {
    const dias = 10; // 10 días hábiles como referencia razonable
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    solicitud.recordatorio = fecha.toISOString().slice(0, 10);
    // Guardar actualizado
    const lista = cargarSolicitudes();
    const idx = lista.findIndex(x => x.folio === solicitud.folio);
    if (idx >= 0) { lista[idx] = solicitud; guardarLocal(CLAVE_SOLICITUDES, lista); }

    const fechaBonita = formatearFecha(solicitud.recordatorio, perfil.idioma);
    decir(t(
        "🔔 Recordatorio guardado.\n\n" +
        "Te sugerimos volver a este asistente a partir del " + fechaBonita + " para que preguntes en la oficina cómo va tu trámite.\n\n" +
        "💡 Consejo: también puedes apuntar esa fecha en tu calendario o en tu teléfono, por si se borran los datos de este navegador.",
        "🔔 Reminder saved.\n\n" +
        "We suggest you come back to this assistant starting on " + fechaBonita + " so you can ask at the office how your procedure is going.\n\n" +
        "💡 Tip: you can also write that date in your calendar or on your phone, in case this browser's data is cleared."
    ));
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
    decir(t("Estas son tus solicitudes guardadas en este dispositivo. Toca la tuya para verla o descargarla:",
            "These are the requests saved on this device. Tap yours to view or download it:"), botones);
}

function mostrarEstatus(s) {
    let html = escapar("📄 " + s.folio + " — " + s.tramiteNombre + "\n");
    html += escapar("📅 " + t("Creada", "Created") + ": " + formatearFecha(s.fecha, perfil.idioma) + "\n");
    if (s.recordatorio) {
        html += escapar("🔔 " + t("Recordatorio sugerido", "Suggested reminder") + ": " + formatearFecha(s.recordatorio, perfil.idioma) + "\n");
    }

    const botones = [
        { etiqueta: t("🖨️ Descargar mi solicitud (PDF)", "🖨️ Download my request (PDF)"), accion: () => generarPDF(s), persistente: true },
        { etiqueta: t("🕐 Ver plazos y tiempos", "🕐 See deadlines and hours"), accion: () => verPlazosYRecordatorio(s), persistente: true }
    ];
    flujo = null;

    agregarMensaje(html, "asistente", botones);
    if (vozAutomatica) leerEnVoz(t("Esta es tu solicitud ", "This is your request ") + s.folio + ".", null);
}

// ---------- Horarios: solo cuando el usuario va a presentarse ----------
function decirHorariosPresentacion() {
    decir(t(
`🕐 PARA PRESENTAR TU TRÁMITE

📍 Las oficinas de atención al público suelen operar de Lunes a Viernes de 9:00 a 14:00 horas; sábados, domingos y días festivos están cerradas.

La atención es por orden de llegada. Lleva tu solicitud impresa y tu carpeta de documentos. Confirma el horario exacto en la oficina correspondiente.`,
`🕐 TO SUBMIT YOUR PROCEDURE

📍 Public service offices usually operate Monday to Friday, 9:00 a.m. to 2:00 p.m.; Saturdays, Sundays and holidays are closed.

Service is first come, first served. Bring your printed request form and your document folder. Confirm the exact schedule at the corresponding office.`
    ));
}

// ---------- Motor de conversación ----------
function procesarMensaje(texto) {
    const idioma = idiomaFlujo();
    const n = normalizar(texto);
    const en = perfil.idioma === "en";

    // Flujo de llenado activo tiene prioridad
    if (flujo && flujo.paso === "pregunta-camino") {
        if (/(en l[i]nea|linea|portal|internet|online)/.test(n) && flujo.tramite && flujo.tramite.enLinea) { empezarEnLinea(); return; }
        if (/(imprimir|papel|llenar|presencial|oficina|print|form)/.test(n)) { empezarLlenado(); return; }
    }
    if (flujo && flujo.paso === "llenado") { procesarRespuestaLlenado(texto); return; }
    if (flujo && flujo.paso === "llenado-perfil-tipo") { procesarPerfilSolicitante(texto); return; }
    if (flujo && flujo.paso === "llenado-perfil-nacionalidad") { procesarNacionalidad(texto); return; }
    if (flujo && flujo.paso === "dictado") { procesarDictado(texto); return; }
    if (flujo && flujo.paso === "consultar-folio") { procesarConsultaFolio(texto); return; }
    if (flujo && flujo.paso === "consultar-curp") { procesarConsultaCurp(texto); return; }

    // Intención: consultar estatus
    if (/(estatus|status|consultar|seguimiento|folio|mi solicitud|my request|que paso|que paso con|mis solicitudes|solicitudes guardadas)/.test(n)) {
        listarSolicitudesLocales();
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

    // Respuestas informativas (los horarios se explican solo al final del llenado)
    if (/(costo|costos|cuanto cuesta|cuanto vale|pago|precio|tarifa|derechos|fee|fees|cost|price)/.test(n)) {
        decir(t(
            "Los montos varían según el trámite y se actualizan cada año. Al terminar tu solicitud te indico dónde consultarlos y pagar.",
            "Fees vary by procedure and are updated every year. When your request is done, I'll tell you where to check and pay them."
        ));
        return;
    }
    if (/(horario|horarios|atencion|abren|cierran|sabado|domingo|hours|open|close)/.test(n)) {
        decir(t(
            "Los horarios de atención los confirmo cuando tengas tu solicitud lista, junto con la oficina donde presentarla.",
            "I'll confirm the office hours when your request form is ready, along with the office where to submit it."
        ));
        return;
    }

    // Gracias / despedida
    if (/(gracias|adios|bye|thank)/.test(n)) {
        decir(en
            ? "You're welcome. If you need anything else, I'm here to help."
            : "Con gusto. Si necesitas algo más, aquí estoy para ayudarte.");
        return;
    }

    // Saludo
    if (/(hola|buenas|buenos dias|buenas tardes|buenas noches|buen dia|hello|hi |good morning)/.test(n)) {
        decir(saludoPrincipal());
        return;
    }

    decir(respuestaGeneral());
}



function respuestaGeneral() {
    return (perfil.idioma === "en"
? `📌 I CAN HELP YOU WITH

📋 "procedures" — see the full list by category
📋 "my requests" — see your saved requests
💰 Fees · 🕐 Hours

Ask about any procedure in your own words, for example:
💬 "I lost my seaman's book" · "I want to clear my vessel for departure"`
: `📌 PUEDO AYUDARTE DE ESTAS FORMAS

📋 "trámites" — ver la lista completa por categoría
📋 "mis solicitudes" — ver tus solicitudes guardadas
💰 Costos · 🕐 Horarios

Pregúntame por cualquier trámite con tus palabras, por ejemplo:
💬 "perdí mi libreta" · "quiero despachar mi embarcación" · "renovar"`);
}

function saludoPrincipal() {
    return (perfil.idioma === "en"
? `Hello, I'm your Procedures Assistant; I help you with any procedure, so it's easier for you.

How can I help you today?`
: `Hola, soy tu Asistente para Trámites; te auxilio en cualquier trámite, para que te sea más fácil.

¿Cómo te puedo ayudar hoy?`);
}

// ---------- Entrada del usuario ----------
function enviarMensaje() {
    const campo = document.getElementById("texto-usuario");
    const texto = campo.value.trim();
    if (!texto) return;
    // Capturar el contexto ANTES de procesar (para poder restaurar al editar)
    const contexto = capturarContextoFlujo();
    agregarMensaje(texto, "usuario", null, { contexto });
    campo.value = "";
    const aviso = document.getElementById("aviso-confianza");
    if (aviso) aviso.classList.remove("visible");
    pensarYResponder(() => procesarMensaje(texto), 400);
}

function capturarContextoFlujo() {
    if (!flujo) return null;
    return {
        paso: flujo.paso || null,
        indice: typeof flujo.indice === "number" ? flujo.indice : null,
        tramiteId: flujo.tramite ? flujo.tramite.id : null,
        seccionDictado: typeof flujo.seccionDictado === "number" ? flujo.seccionDictado : null
    };
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
        const resultado = e.results[0][0];
        const texto = resultado.transcript;
        const confianza = resultado.confidence;
        const campo = document.getElementById("texto-usuario");
        campo.value = texto;
        campo.focus();
        // No enviamos automáticamente: el usuario revisa y confirma.
        // Si la confianza es baja, avisamos con un mensaje amarillo.
        if (confianza > 0 && confianza < 0.7 && texto.length > 6) {
            mostrarAvisoConfianza();
        }
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

function mostrarAvisoConfianza() {
    const aviso = document.getElementById("aviso-confianza");
    if (!aviso) return;
    aviso.textContent = perfil.idioma === "en"
        ? "⚠️ I'm not sure I heard you right. Check the text below, correct it if needed, then tap ➤ to send."
        : "⚠️ No estoy seguro de haber escuchado bien. Revisa el texto, corrígelo si es necesario y toca ➤ para enviar.";
    aviso.classList.add("visible");
    clearTimeout(aviso._timer);
    aviso._timer = setTimeout(() => aviso.classList.remove("visible"), 8000);
}

// ---------- Perfil y modales ----------
function abrirModalConfig(primeraVez) {
    const modal = document.getElementById("modal-config");
    modal.classList.add("visible");
    document.getElementById("boton-cerrar-config").style.display = primeraVez ? "none" : "inline-block";
    document.getElementById("fila-borrar").style.display = primeraVez ? "none" : "block";
    document.getElementById("fila-reiniciar").style.display = primeraVez ? "none" : "block";
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

function guardarConfiguracion(primeraVez) {
    guardarLocal(CLAVE_PERFIL, perfil);
    document.documentElement.lang = perfil.idioma === "en" ? "en" : "es";
    actualizarIdiomaMicrofono();
    actualizarPlaceholder();
    renderBotonesFijos();
    document.getElementById("modal-config").classList.remove("visible");
    if (primeraVez) {
        decirSaludo();
    } else {
        decir(t(
            "Configuración guardada. Puedes cambiar la voz o el idioma cuando quieras desde el botón de configuración.",
            "Settings saved. You can change the voice or language anytime from the settings button."
        ));
    }
}

function decirSaludo() {
    const saludo = saludoPrincipal();
    decir(saludo);
    // El saludo de bienvenida siempre suena, sin esperar a que toquen la bocina
    if (!vozAutomatica) leerEnVoz(saludo, null);
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
    localStorage.removeItem(CLAVE_VOZ);
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
        "Nueva consulta. ¿En qué te ayudo?",
        "New inquiry. How can I help you?"
    ));
}

// Reinicio total: borra todo y vuelve a mostrar el tutorial desde el paso 1
function reiniciarAsistente() {
    const en = perfil.idioma === "en";
    const msg = en
        ? "This will erase ALL your data on this device (requests, settings and tutorial) and take you back to the welcome tutorial. Continue?"
        : "Esto borrará TODOS tus datos en este dispositivo (solicitudes, configuración y tutorial) y volverá al tutorial de bienvenida desde el paso 1. ¿Continuar?";
    if (!confirm(msg)) return;
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    localStorage.removeItem(CLAVE_SOLICITUDES);
    localStorage.removeItem(CLAVE_PERFIL);
    localStorage.removeItem(CLAVE_TUTORIAL);
    localStorage.removeItem(CLAVE_PRIMER_USO);
    localStorage.removeItem(CLAVE_VOZ);
    perfil = { voz: null, idioma: "es" };
    flujo = null;
    tutorial = null;
    vozAutomatica = true;
    document.getElementById("interruptor-voz").setAttribute("aria-checked", "false");
    document.getElementById("modal-config").classList.remove("visible");
    document.getElementById("cuadro-conversacion").innerHTML = "";
    actualizarAvatar();
    actualizarIdiomaMicrofono();
    actualizarPlaceholder();
    abrirModalPrivacidadIdioma();
}

// ---------- Privacidad ----------
function abrirModalPrivacidadIdioma() {
    renderizarContenidoPrivacidad();
    actualizarSelectorIdiomaPrivacidad();
    document.getElementById("modal-privacidad").classList.add("visible");
}

function renderizarContenidoPrivacidad() {
    const es = perfil.idioma !== "en";
    document.getElementById("titulo-privacidad").textContent = es ? "🔒 Aviso de Privacidad" : "🔒 Privacy Notice";
    document.getElementById("subtitulo-privacidad").textContent = es
        ? "Elige tu idioma · Choose your language"
        : "Choose your language · Elige tu idioma";
    document.getElementById("cuerpo-privacidad").innerHTML = es
? `<p><strong>Este sitio es un asistente de apoyo independiente.</strong> No está afiliado a ningún ente de gobierno; es una herramienta privada que te orienta y te ayuda a preparar tus documentos. Los trámites se concluyen únicamente en las oficinas o sitios oficiales correspondientes.</p>
<p><strong>Qué datos se piden:</strong> solo los que tú decidas escribir para llenar tu solicitud (nombre, CURP, domicilio, teléfono, etc.).</p>
<p><strong>Para qué se usan:</strong> únicamente para llenar tu hoja de solicitud y tu número de referencia.</p>
<p><strong>Quién los ve:</strong> <strong>nadie más que tú.</strong> Toda la información se guarda solamente en tu propio dispositivo (navegador). No se envía a ningún servidor ni se comparte con nadie.</p>
<p><strong>Cómo borrarlos:</strong> desde el botón de configuración ⚙️ ("Borrar mis datos") o limpiando el historial de tu navegador.</p>
<p><strong>Costo:</strong> este asistente es gratuito. Si te sirve, al final puedes apoyar el proyecto con una donación voluntaria, 100% opcional.</p>
<p>Al continuar, aceptas este manejo de tus datos personales.</p>`
: `<p><strong>This site is an independent support assistant.</strong> It is not affiliated with any government entity; it is a private tool that guides you and helps you prepare your documents. Procedures are completed only at the corresponding official offices or sites.</p>
<p><strong>What data is asked:</strong> only what you choose to type to fill your request form (name, ID code, address, phone, etc.).</p>
<p><strong>What it is used for:</strong> only to fill your request sheet and your reference number.</p>
<p><strong>Who sees it:</strong> <strong>nobody but you.</strong> All information is stored only on your own device (browser). It is not sent to any server nor shared with anyone.</p>
<p><strong>How to delete it:</strong> from the settings button ⚙️ ("Borrar mis datos") or by clearing your browser history.</p>
<p><strong>Cost:</strong> this assistant is free. If it helps you, at the end you can support the project with a voluntary donation, 100% optional.</p>
<p>By continuing, you accept this handling of your personal data.</p>`;
    document.getElementById("boton-aceptar-privacidad").textContent = es
        ? "Acepto — quiero usar el asistente"
        : "I accept — let me use the assistant";
}

function actualizarSelectorIdiomaPrivacidad() {
    document.querySelectorAll("#selector-idioma-privacidad .opcion-idioma").forEach(btn => {
        btn.classList.toggle("elegida", perfil.idioma === btn.dataset.idioma);
    });
}

// ---------- Inicio ----------
function iniciar() {
    const acepto = localStorage.getItem(CLAVE_PRIMER_USO);
    const perfilGuardado = leerLocal(CLAVE_PERFIL, null);
    if (perfilGuardado) perfil = { voz: null, idioma: "es", ...perfilGuardado };
    document.documentElement.lang = perfil.idioma === "en" ? "en" : "es";

    renderBotonesFijos();
    document.getElementById("interruptor-voz").setAttribute("aria-checked", vozAutomatica ? "true" : "false");
    actualizarPlaceholder();
    actualizarIdiomaMicrofono();
    configurarMicrofono();
    actualizarAvatar();

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
        guardarLocal(CLAVE_VOZ, vozAutomatica);
        if (!vozAutomatica && "speechSynthesis" in window) speechSynthesis.cancel();
    });

    document.getElementById("boton-config").addEventListener("click", () => abrirModalConfig(false));
    document.getElementById("boton-aceptar-privacidad").addEventListener("click", () => {
        localStorage.setItem(CLAVE_PRIMER_USO, "si");
        document.getElementById("modal-privacidad").classList.remove("visible");
        iniciarTutorial();
    });
    document.getElementById("boton-reiniciar").addEventListener("click", reiniciarAsistente);
    document.getElementById("boton-guardar-config").addEventListener("click", () => guardarConfiguracion(false));
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
            actualizarAvatar();
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

    // Selector de idioma dentro del modal de privacidad
    document.querySelectorAll("#selector-idioma-privacidad .opcion-idioma").forEach(btn => {
        btn.addEventListener("click", () => {
            perfil.idioma = btn.dataset.idioma;
            guardarLocal(CLAVE_PERFIL, perfil);
            document.documentElement.lang = perfil.idioma === "en" ? "en" : "es";
            actualizarSelectorIdiomaPrivacidad();
            renderizarContenidoPrivacidad();
            actualizarPlaceholder();
            actualizarIdiomaMicrofono();
            actualizarAvatar();
        });
    });

    if (!acepto) {
        abrirModalPrivacidadIdioma();
    } else if (!leerLocal(CLAVE_TUTORIAL, false)) {
        // Ya aceptó privacidad antes de existir el tutorial: lo vemos una vez
        iniciarTutorial();
    } else {
        decirSaludo();
    }
}

document.addEventListener("DOMContentLoaded", iniciar);
