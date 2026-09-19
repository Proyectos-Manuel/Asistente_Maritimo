// ==========================================
// CATÁLOGO DE TRÁMITES — UNAMAN
// Estructura igual a la página oficial de
// UNAMAN. El asistente guía por preguntas
// hasta la solicitud exacta (ruta), y hay
// trámites de llenado directo.
// ==========================================

const CATEGORIAS = [
    { id: "certificacion", nombre: "Certificación de Documentos", nombreEn: "Certification of Documents", emoji: "📜" },
    { id: "matriculas", nombre: "Matrículas y Abanderamiento", nombreEn: "Ship Registry and Ensign", emoji: "⛵" },
    { id: "libretas", nombre: "Libretas de Mar", nombreEn: "Seaman's Books", emoji: "📔" },
    { id: "navegacion", nombre: "Navegación", nombreEn: "Navigation", emoji: "🧭" },
    { id: "accidentes", nombre: "Accidente o Incidente Marítimo", nombreEn: "Maritime Accident or Incident", emoji: "⚠️" }
];

// ---------- RUTAS: el asistente pregunta y llega al trámite exacto ----------
const RUTAS = {
    libretas: {
        pasos: [
            { id: "tipo", pregunta: "¿Qué tipo de libreta de mar necesitas?", preguntaEn: "What type of seaman's book do you need?",
              opciones: [
                  { valor: "A", etiqueta: "Tipo A — Marina Mercante", etiquetaEn: "Type A — Merchant Marine" },
                  { valor: "B", etiqueta: "Tipo B — Pesca", etiquetaEn: "Type B — Fishing" },
                  { valor: "C", etiqueta: "Tipo C — Recreo deportivo", etiquetaEn: "Type C — Recreational" },
                  { valor: "D", etiqueta: "Tipo D — Plataformas costa afuera", etiquetaEn: "Type D — Offshore Platforms" },
                  { valor: "DIM", etiqueta: "Documento de Identidad Marítima", etiquetaEn: "Maritime Identity Document" }
              ] },
            { id: "modalidad", pregunta: "¿Es primera vez o renovación?", preguntaEn: "Is it your first time or a renewal?",
              soloSi: r => r.tipo !== "DIM",
              opciones: [
                  { valor: "primera", etiqueta: "Primera vez", etiquetaEn: "First time" },
                  { valor: "renovacion", etiqueta: "Renovación", etiquetaEn: "Renewal" }
              ] },
            { id: "modalidad", pregunta: "¿Es expedición o renovación?", preguntaEn: "Is it a new issue or a renewal?",
              soloSi: r => r.tipo === "DIM",
              opciones: [
                  { valor: "primera", etiqueta: "Expedición", etiquetaEn: "New issue" },
                  { valor: "renovacion", etiqueta: "Renovación", etiquetaEn: "Renewal" }
              ] }
        ],
        destino: r => {
            if (r.tipo === "DIM") return r.modalidad === "renovacion" ? "dim-renovacion" : "dim-primera";
            if (r.modalidad === "renovacion") return "libreta-renovacion";
            return "libreta-" + r.tipo.toLowerCase();
        }
    },
    navegacion: {
        pasos: [
            { id: "operacion", pregunta: "¿Qué necesitas: arribo o despacho?", preguntaEn: "What do you need: arrival or clearance?",
              opciones: [
                  { valor: "arribo", etiqueta: "🛳️ Arribo (llego a puerto)", etiquetaEn: "🛳️ Arrival (I'm coming into port)" },
                  { valor: "despacho", etiqueta: "⚓ Despacho (voy a zarpar)", etiquetaEn: "⚓ Clearance (I'm departing)" }
              ] },
            { id: "tamano", pregunta: "¿Tu embarcación es menor o mayor?", preguntaEn: "Is your vessel small (menor) or large (mayor)?",
              soloSi: r => r.operacion === "arribo",
              opciones: [
                  { valor: "menor", etiqueta: "Menor", etiquetaEn: "Small (menor)" },
                  { valor: "mayor", etiqueta: "Mayor", etiquetaEn: "Large (mayor)" }
              ] },
            { id: "tipoNavegacion", pregunta: "¿Navegas en altura o en cabotaje?", preguntaEn: "Do you navigate on high seas (altura) or coastal waters (cabotaje)?",
              soloSi: r => r.operacion === "arribo",
              opciones: [
                  { valor: "altura", etiqueta: "Navegación de altura", etiquetaEn: "High seas (altura)" },
                  { valor: "cabotaje", etiqueta: "Cabotaje", etiquetaEn: "Coastal waters (cabotaje)" }
              ] }
        ],
        destino: r => {
            if (r.operacion === "despacho") return "despacho";
            return "arribo-" + r.tamano + "-" + r.tipoNavegacion;
        }
    }
};

// ---------- TRÁMITES DE LLENADO DIRECTO ----------
const TRAMITES = [
    // ---------- CERTIFICACIÓN DE DOCUMENTOS ----------
    {
        id: "certificacion-documentos",
        categoria: "certificacion",
        nombre: "Certificación de documentos (Expedición)",
        nombreEn: "Document Certification (Issue)",
        clave: "SEMAR-05-006",
        claveOficial: "SEMAR-05-006",
        clavesBusqueda: ["certificar", "certificación de documentos", "certificacion de documentos", "constancia certificada", "certify"],
        enLinea: false,
        sinopsis: "Certificación oficial de documentos que presentaste en tus trámites: la autoridad constata que la copia coincide con el original.",
        sinopsisEn: "Official certification of documents you submitted in your procedures: the authority confirms the copy matches the original.",
        requisitos: [
            "Documento(s) original(es) a certificar",
            "Copia(s) simple(s) del documento",
            "Identificación oficial vigente",
            "Solicitud firmada (te la lleno aquí)",
            "Comprobante de pago de derechos"
        ],
        requisitosEn: [
            "Original document(s) to certify",
            "Simple copy of the document",
            "Valid official ID",
            "Signed request (I fill it here)",
            "Proof of payment of fees"
        ],
        vigencia: "No aplica",
        vigenciaEn: "Not applicable",
        campos: [
            { id: "nombre", seccion: "solicitante", etiqueta: "Nombre completo", etiquetaEn: "Full name", pregunta: "¿Cuál es tu nombre completo?", preguntaEn: "What is your full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP", etiquetaEn: "CURP", pregunta: "¿Cuál es tu CURP? Son 18 letras y números.", preguntaEn: "What is your CURP? It is an 18-character Mexican ID code.", tipo: "curp", obligatorio: true },
            { id: "documentoCertificar", seccion: "tramite", etiqueta: "Documento(s) a certificar", etiquetaEn: "Document(s) to certify", pregunta: "¿Qué documento(s) quieres certificar? Por ejemplo: constancia de tiempo de embarque, título...", preguntaEn: "Which document(s) do you want certified? For example: sea service record, title...", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", preguntaEn: "At which Harbor Master's Office will you submit this request?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },

    // ---------- MATRÍCULAS Y ABANDERAMIENTO (13 trámites oficiales) ----------
    {
        id: "mat-001",
        categoria: "matriculas",
        nombre: "Autorización de dimisión de bandera, cancelación de matrícula y baja de señal distintiva de llamada",
        nombreEn: "Flag resignation, registry cancellation and call sign removal",
        clave: "SEMAR-05-001",
        enLinea: false,
        sinopsis: "Da de baja tu embarcación del registro mexicano: dimisión de bandera, cancelación de matrícula y señal distintiva.",
        sinopsisEn: "Remove your vessel from the Mexican registry: flag resignation, registry and call sign cancellation.",
        requisitos: ["Certificado de matrícula original", "Identificación del propietario", "Escrito de motivo firmado", "Comprobante de pago si aplica"],
        requisitosEn: ["Original registry certificate", "Owner's ID", "Signed statement of reason", "Proof of payment if applicable"],
        vigencia: "No aplica", vigenciaEn: "Not applicable",
        campos: [
            { id: "nombrePropietario", seccion: "solicitante", etiqueta: "Nombre del propietario", etiquetaEn: "Owner's name", pregunta: "¿Cuál es el nombre completo del propietario?", preguntaEn: "What is the owner's full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP del propietario", etiquetaEn: "Owner's CURP", pregunta: "¿Cuál es su CURP?", preguntaEn: "What is the owner's CURP?", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la embarcación", etiquetaEn: "Vessel name", pregunta: "¿Cómo se llama la embarcación?", preguntaEn: "What is the vessel's name?", tipo: "texto", obligatorio: true },
            { id: "matricula", seccion: "embarcacion", etiqueta: "Matrícula", etiquetaEn: "Registry number", pregunta: "¿Cuál es su número de matrícula?", preguntaEn: "What is its registry number?", tipo: "texto", obligatorio: true },
            { id: "motivo", seccion: "tramite", etiqueta: "Motivo de la baja", etiquetaEn: "Reason", pregunta: "¿Por qué das de baja la embarcación? Venta, cambio de bandera, siniestro...", preguntaEn: "Why are you removing the vessel? Sale, flag change, casualty...", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto presentarás el trámite?", preguntaEn: "At which Harbor Master's Office will you submit it?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "mat-002",
        categoria: "matriculas",
        nombre: "Asignación de señal distintiva de llamada",
        nombreEn: "Call sign assignment",
        clave: "SEMAR-05-002",
        enLinea: false,
        sinopsis: "Asigna la señal distintiva de llamada radio para tu embarcación.",
        sinopsisEn: "Assigns the radio call sign for your vessel.",
        requisitos: ["Certificado de matrícula vigente", "Identificación del propietario", "Comprobante de pago si aplica"],
        requisitosEn: ["Valid registry certificate", "Owner's ID", "Proof of payment if applicable"],
        vigencia: "Permanente", vigenciaEn: "Permanent",
        campos: [
            { id: "nombrePropietario", seccion: "solicitante", etiqueta: "Nombre del propietario", etiquetaEn: "Owner's name", pregunta: "¿Cuál es el nombre completo del propietario?", preguntaEn: "What is the owner's full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP del propietario", etiquetaEn: "Owner's CURP", pregunta: "¿Cuál es su CURP?", preguntaEn: "What is the owner's CURP?", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la embarcación", etiquetaEn: "Vessel name", pregunta: "¿Cómo se llama la embarcación?", preguntaEn: "What is the vessel's name?", tipo: "texto", obligatorio: true },
            { id: "matricula", seccion: "embarcacion", etiqueta: "Matrícula", etiquetaEn: "Registry number", pregunta: "¿Cuál es su número de matrícula?", preguntaEn: "What is its registry number?", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto presentarás el trámite?", preguntaEn: "At which Harbor Master's Office will you submit it?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "mat-003",
        categoria: "matriculas",
        nombre: "Abanderamiento de embarcaciones o artefactos navales",
        nombreEn: "Ensign registry of vessels or naval artifacts",
        clave: "SEMAR-05-003",
        enLinea: false,
        clavesBusqueda: ["abanderar", "abanderamiento", "bandera mexicana", "pavellon", "ensign"],
        sinopsis: "Imposición de bandera mexicana a tu embarcación recién matriculada.",
        sinopsisEn: "Flying the Mexican flag on your newly registered vessel.",
        requisitos: ["Certificado de matrícula vigente", "Identificación del propietario", "Comprobante de pago de derechos"],
        requisitosEn: ["Valid registry certificate", "Owner's ID", "Proof of payment of fees"],
        vigencia: "Permanente", vigenciaEn: "Permanent",
        campos: [
            { id: "nombrePropietario", seccion: "solicitante", etiqueta: "Nombre del propietario", etiquetaEn: "Owner's name", pregunta: "¿Cuál es el nombre completo del propietario?", preguntaEn: "What is the owner's full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP del propietario", etiquetaEn: "Owner's CURP", pregunta: "¿Cuál es su CURP?", preguntaEn: "What is the owner's CURP?", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la embarcación", etiquetaEn: "Vessel name", pregunta: "¿Cómo se llama la embarcación?", preguntaEn: "What is the vessel's name?", tipo: "texto", obligatorio: true },
            { id: "matricula", seccion: "embarcacion", etiqueta: "Matrícula", etiquetaEn: "Registry number", pregunta: "¿Cuál es su número de matrícula?", preguntaEn: "What is its registry number?", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto presentarás el trámite?", preguntaEn: "At which Harbor Master's Office will you submit it?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "mat-004a",
        categoria: "matriculas",
        nombre: "Modificaciones significativas a una embarcación o artefacto naval, o a su tipo de navegación o uso",
        nombreEn: "Significant modifications to a vessel or its type of navigation/use",
        clave: "SEMAR-05-004-A",
        enLinea: false,
        sinopsis: "Reporta cambios importantes en la embarcación: motor, eslora, uso o tipo de navegación.",
        sinopsisEn: "Report major vessel changes: engine, length, use or type of navigation.",
        requisitos: ["Certificado de matrícula original", "Documentación técnica de la modificación", "Identificación del propietario", "Comprobante de pago si aplica"],
        requisitosEn: ["Original registry certificate", "Technical documentation of the modification", "Owner's ID", "Proof of payment if applicable"],
        vigencia: "No aplica", vigenciaEn: "Not applicable",
        campos: [
            { id: "nombrePropietario", seccion: "solicitante", etiqueta: "Nombre del propietario", etiquetaEn: "Owner's name", pregunta: "¿Cuál es el nombre completo del propietario?", preguntaEn: "What is the owner's full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP del propietario", etiquetaEn: "Owner's CURP", pregunta: "¿Cuál es su CURP?", preguntaEn: "What is the owner's CURP?", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la embarcación", etiquetaEn: "Vessel name", pregunta: "¿Cómo se llama la embarcación?", preguntaEn: "What is the vessel's name?", tipo: "texto", obligatorio: true },
            { id: "matricula", seccion: "embarcacion", etiqueta: "Matrícula", etiquetaEn: "Registry number", pregunta: "¿Cuál es su número de matrícula?", preguntaEn: "What is its registry number?", tipo: "texto", obligatorio: true },
            { id: "descripcionCambio", seccion: "tramite", etiqueta: "Modificación realizada", etiquetaEn: "Modification made", pregunta: "¿Qué modificación se hizo? Motor, eslora, uso, tipo de navegación...", preguntaEn: "What was modified? Engine, length, use, navigation type...", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto presentarás el trámite?", preguntaEn: "At which Harbor Master's Office will you submit it?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "mat-004b",
        categoria: "matriculas",
        nombre: "Cambio de propietario de una embarcación o artefacto naval",
        nombreEn: "Change of vessel owner",
        clave: "SEMAR-05-004-B",
        enLinea: false,
        clavesBusqueda: ["cambie de propietario", "vendieron la embarcación", "compré una embarcación usada", "transferencia"],
        sinopsis: "Actualiza la matrícula cuando la embarcación cambia de dueño.",
        sinopsisEn: "Update the registry when the vessel changes owners.",
        requisitos: ["Certificado de matrícula original", "Documento de compraventa o cesión", "Identificaciones de vendedor y comprador", "Comprobante de pago si aplica"],
        requisitosEn: ["Original registry certificate", "Bill of sale or transfer document", "Seller's and buyer's IDs", "Proof of payment if applicable"],
        vigencia: "No aplica", vigenciaEn: "Not applicable",
        campos: [
            { id: "nombrePropietario", seccion: "solicitante", etiqueta: "Nombre del nuevo propietario", etiquetaEn: "New owner's name", pregunta: "¿Cuál es el nombre del nuevo propietario?", preguntaEn: "What is the new owner's name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP del nuevo propietario", etiquetaEn: "New owner's CURP", pregunta: "¿Cuál es su CURP?", preguntaEn: "What is the owner's CURP?", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la embarcación", etiquetaEn: "Vessel name", pregunta: "¿Cómo se llama la embarcación?", preguntaEn: "What is the vessel's name?", tipo: "texto", obligatorio: true },
            { id: "matricula", seccion: "embarcacion", etiqueta: "Matrícula", etiquetaEn: "Registry number", pregunta: "¿Cuál es su número de matrícula?", preguntaEn: "What is its registry number?", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto presentarás el trámite?", preguntaEn: "At which Harbor Master's Office will you submit it?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "mat-004c",
        categoria: "matriculas",
        nombre: "Cambio de Capitanía de Puerto de la embarcación o artefacto naval",
        nombreEn: "Change of Harbor Master's Office for the vessel",
        clave: "SEMAR-05-004-C",
        enLinea: false,
        sinopsis: "Traslada el registro de tu embarcación a otra Capitanía de Puerto.",
        sinopsisEn: "Move your vessel's registration to another Harbor Master's Office.",
        requisitos: ["Certificado de matrícula original", "Identificación del propietario", "Comprobante de domicilio del nuevo puerto", "Comprobante de pago si aplica"],
        requisitosEn: ["Original registry certificate", "Owner's ID", "Proof of address at the new port", "Proof of payment if applicable"],
        vigencia: "No aplica", vigenciaEn: "Not applicable",
        campos: [
            { id: "nombrePropietario", seccion: "solicitante", etiqueta: "Nombre del propietario", etiquetaEn: "Owner's name", pregunta: "¿Cuál es el nombre completo del propietario?", preguntaEn: "What is the owner's full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP del propietario", etiquetaEn: "Owner's CURP", pregunta: "¿Cuál es su CURP?", preguntaEn: "What is the owner's CURP?", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la embarcación", etiquetaEn: "Vessel name", pregunta: "¿Cómo se llama la embarcación?", preguntaEn: "What is the vessel's name?", tipo: "texto", obligatorio: true },
            { id: "matricula", seccion: "embarcacion", etiqueta: "Matrícula", etiquetaEn: "Registry number", pregunta: "¿Cuál es su número de matrícula?", preguntaEn: "What is its registry number?", tipo: "texto", obligatorio: true },
            { id: "capitaniaNueva", seccion: "tramite", etiqueta: "Capitanía de destino", etiquetaEn: "Destination office", pregunta: "¿A qué Capitanía de Puerto quieres trasladar la embarcación?", preguntaEn: "To which Harbor Master's Office do you want to move the vessel?", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía actual", etiquetaEn: "Current office", pregunta: "¿En qué Capitanía está inscrita hoy?", preguntaEn: "Where is it registered today?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "mat-004d",
        categoria: "matriculas",
        nombre: "Cambio de nombre de la embarcación o artefacto naval",
        nombreEn: "Change of vessel name",
        clave: "SEMAR-05-004-D",
        enLinea: false,
        clavesBusqueda: ["cambiar nombre", "renombrar", "nuevo nombre"],
        sinopsis: "Cambia el nombre registrado de tu embarcación.",
        sinopsisEn: "Change your vessel's registered name.",
        requisitos: ["Certificado de matrícula original", "Identificación del propietario", "Comprobante de pago si aplica"],
        requisitosEn: ["Original registry certificate", "Owner's ID", "Proof of payment if applicable"],
        vigencia: "No aplica", vigenciaEn: "Not applicable",
        campos: [
            { id: "nombrePropietario", seccion: "solicitante", etiqueta: "Nombre del propietario", etiquetaEn: "Owner's name", pregunta: "¿Cuál es el nombre completo del propietario?", preguntaEn: "What is the owner's full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP del propietario", etiquetaEn: "Owner's CURP", pregunta: "¿Cuál es su CURP?", preguntaEn: "What is the owner's CURP?", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre actual de la embarcación", etiquetaEn: "Current vessel name", pregunta: "¿Cómo se llama hoy la embarcación?", preguntaEn: "What is the vessel's current name?", tipo: "texto", obligatorio: true },
            { id: "matricula", seccion: "embarcacion", etiqueta: "Matrícula", etiquetaEn: "Registry number", pregunta: "¿Cuál es su número de matrícula?", preguntaEn: "What is its registry number?", tipo: "texto", obligatorio: true },
            { id: "nombreNuevo", seccion: "tramite", etiqueta: "Nombre nuevo", etiquetaEn: "New name", pregunta: "¿Qué nombre nuevo llevará?", preguntaEn: "What will its new name be?", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto presentarás el trámite?", preguntaEn: "At which Harbor Master's Office will you submit it?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "mat-004e",
        categoria: "matriculas",
        nombre: "Reposición del certificado de matrícula por daño, robo, extravío o pérdida total",
        nombreEn: "Replacement of registry certificate (damage, theft, loss)",
        clave: "SEMAR-05-004-E",
        enLinea: false,
        clavesBusqueda: ["perdí la matrícula", "me robaron la matrícula", "reposición de matrícula", "se dañó mi certificado"],
        sinopsis: "Tramita un certificado de matrícula nuevo si el tuyo se dañó, lo robaron o lo perdiste.",
        sinopsisEn: "Get a new registry certificate if yours was damaged, stolen or lost.",
        requisitos: ["Identificación del propietario", "Denuncia (en caso de robo)", "Documento dañado (si aplica)", "Comprobante de pago si aplica"],
        requisitosEn: ["Owner's ID", "Police report (in case of theft)", "Damaged document (if applicable)", "Proof of payment if applicable"],
        vigencia: "No aplica", vigenciaEn: "Not applicable",
        campos: [
            { id: "nombrePropietario", seccion: "solicitante", etiqueta: "Nombre del propietario", etiquetaEn: "Owner's name", pregunta: "¿Cuál es el nombre completo del propietario?", preguntaEn: "What is the owner's full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP del propietario", etiquetaEn: "Owner's CURP", pregunta: "¿Cuál es su CURP?", preguntaEn: "What is the owner's CURP?", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la embarcación", etiquetaEn: "Vessel name", pregunta: "¿Cómo se llama la embarcación?", preguntaEn: "What is the vessel's name?", tipo: "texto", obligatorio: true },
            { id: "matricula", seccion: "embarcacion", etiqueta: "Matrícula", etiquetaEn: "Registry number", pregunta: "¿Cuál es su número de matrícula?", preguntaEn: "What is its registry number?", tipo: "texto", obligatorio: true },
            { id: "motivo", seccion: "tramite", etiqueta: "Motivo de la reposición", etiquetaEn: "Reason", pregunta: "¿Por qué necesitas la reposición? Daño, robo, extravío o pérdida total.", preguntaEn: "Why do you need the replacement? Damage, theft, loss or total loss.", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto presentarás el trámite?", preguntaEn: "At which Harbor Master's Office will you submit it?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "mat-005",
        categoria: "matriculas",
        nombre: "Aviso sobre el cambio de propietario de una embarcación o artefacto naval",
        nombreEn: "Notice of vessel ownership change",
        clave: "SEMAR-05-005",
        enLinea: false,
        sinopsis: "Avisa a la autoridad que la embarcación cambió de dueño, sin modificar aún la matrícula.",
        sinopsisEn: "Notify the authority that the vessel changed owners, before updating the registry.",
        requisitos: ["Certificado de matrícula vigente", "Documento de compraventa", "Identificación del nuevo propietario"],
        requisitosEn: ["Valid registry certificate", "Bill of sale", "New owner's ID"],
        vigencia: "No aplica", vigenciaEn: "Not applicable",
        campos: [
            { id: "nombrePropietario", seccion: "solicitante", etiqueta: "Nombre del nuevo propietario", etiquetaEn: "New owner's name", pregunta: "¿Cuál es el nombre del nuevo propietario?", preguntaEn: "What is the new owner's name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP del nuevo propietario", etiquetaEn: "New owner's CURP", pregunta: "¿Cuál es su CURP?", preguntaEn: "What is the owner's CURP?", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la embarcación", etiquetaEn: "Vessel name", pregunta: "¿Cómo se llama la embarcación?", preguntaEn: "What is the vessel's name?", tipo: "texto", obligatorio: true },
            { id: "matricula", seccion: "embarcacion", etiqueta: "Matrícula", etiquetaEn: "Registry number", pregunta: "¿Cuál es su número de matrícula?", preguntaEn: "What is its registry number?", tipo: "texto", obligatorio: true },
            { id: "fechaVenta", seccion: "tramite", etiqueta: "Fecha de la venta", etiquetaEn: "Sale date", pregunta: "¿En qué fecha se vendió o cedió? Por ejemplo: 15 de marzo de 2026.", preguntaEn: "When was it sold or transferred? For example: March 15, 2026.", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto presentarás el aviso?", preguntaEn: "At which Harbor Master's Office will you submit the notice?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "mat-008",
        categoria: "matriculas",
        nombre: "Expedición de Certificado de matrícula para embarcaciones o artefactos navales",
        nombreEn: "Issue of registry certificate for vessels or naval artifacts",
        clave: "SEMAR-05-008",
        claveOficial: "SEMAR-05-008",
        clavesBusqueda: ["inscribir", "inscripción", "matricular", "matrícula nueva", "compré una embarcación", "bote nuevo", "register"],
        enLinea: false,
        sinopsis: "Registra tu embarcación nueva o recién comprada en el Registro Público Marítimo Nacional y obtén su matrícula.",
        sinopsisEn: "Register your new or recently purchased vessel in the National Maritime Public Registry.",
        requisitos: ["Título de propiedad o documento de compraventa", "Identificación del propietario", "Comprobante de domicilio", "Documentación técnica de la embarcación", "Comprobante de pago de derechos"],
        requisitosEn: ["Ownership title or bill of sale", "Owner's ID", "Proof of address", "Vessel technical documentation", "Proof of payment of fees"],
        vigencia: "Permanente, con documentos complementarios vigentes",
        vigenciaEn: "Permanent, with complementary documents kept valid",
        campos: [
            { id: "nombrePropietario", seccion: "solicitante", etiqueta: "Nombre del propietario", etiquetaEn: "Owner's name", pregunta: "¿Cuál es el nombre completo del propietario?", preguntaEn: "What is the owner's full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP del propietario", etiquetaEn: "Owner's CURP", pregunta: "¿Cuál es su CURP?", preguntaEn: "What is the owner's CURP?", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la embarcación", etiquetaEn: "Vessel name", pregunta: "¿Qué nombre llevará la embarcación?", preguntaEn: "What name will the vessel have?", tipo: "texto", obligatorio: true },
            { id: "tipoEmbarcacion", seccion: "embarcacion", etiqueta: "Tipo de embarcación", etiquetaEn: "Vessel type", pregunta: "¿Qué tipo de embarcación es? Velero, lancha, yate, panga...", preguntaEn: "What type of vessel is it? Sailboat, motorboat, yacht, panga...", tipo: "texto", obligatorio: true },
            { id: "eslora", seccion: "embarcacion", etiqueta: "Eslora", etiquetaEn: "Length overall", pregunta: "¿Cuánto mide de largo (eslora)? Por ejemplo: 7.5 metros.", preguntaEn: "How long is it (length overall)? For example: 7.5 meters.", tipo: "texto", obligatorio: true },
            { id: "motor", seccion: "embarcacion", etiqueta: "Motor", etiquetaEn: "Engine", pregunta: "¿Qué motor tiene? Marca y potencia, o \"velero sin motor\".", preguntaEn: "What engine does it have? Brand and power, or \"sailboat without engine\".", tipo: "texto", obligatorio: true },
            { id: "puertoBase", seccion: "embarcacion", etiqueta: "Puerto de base", etiquetaEn: "Home port", pregunta: "¿En qué puerto tendrá su base?", preguntaEn: "Which port will be its home port?", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto presentarás el trámite?", preguntaEn: "At which Harbor Master's Office will you submit it?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "mat-043a",
        categoria: "matriculas",
        nombre: "Expedición de Certificado de matrícula para plataforma fija mar adentro",
        nombreEn: "Issue of registry certificate for fixed offshore platform",
        clave: "SEMAR-05-043-A",
        enLinea: false,
        sinopsis: "Matrícula para plataformas fijas mar adentro.",
        sinopsisEn: "Registry certificate for fixed offshore platforms.",
        requisitos: ["Documentación técnica de la plataforma", "Identificación del propietario", "Comprobante de pago de derechos"],
        requisitosEn: ["Platform technical documentation", "Owner's ID", "Proof of payment of fees"],
        vigencia: "Permanente", vigenciaEn: "Permanent",
        campos: [
            { id: "nombrePropietario", seccion: "solicitante", etiqueta: "Nombre del propietario", etiquetaEn: "Owner's name", pregunta: "¿Cuál es el nombre completo del propietario o concesionaria?", preguntaEn: "What is the owner's or concessionaire's full name?", tipo: "texto", obligatorio: true },
            { id: "rfc", seccion: "solicitante", etiqueta: "RFC", etiquetaEn: "Tax ID (RFC)", pregunta: "¿Cuál es su RFC? Si es persona física, su CURP de 18 caracteres.", preguntaEn: "What is its tax ID (RFC)? If an individual, the 18-character CURP.", tipo: "texto", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la plataforma", etiquetaEn: "Platform name", pregunta: "¿Cómo se llama la plataforma?", preguntaEn: "What is the platform's name?", tipo: "texto", obligatorio: true },
            { id: "ubicacion", seccion: "embarcacion", etiqueta: "Ubicación", etiquetaEn: "Location", pregunta: "¿Dónde está instalada? Sonda, campo, coordenadas.", preguntaEn: "Where is it installed? Depth, field, coordinates.", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto presentarás el trámite?", preguntaEn: "At which Harbor Master's Office will you submit it?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "mat-044a",
        categoria: "matriculas",
        nombre: "Abanderamiento de plataforma fija mar adentro",
        nombreEn: "Ensign registry of fixed offshore platform",
        clave: "SEMAR-05-044-A",
        enLinea: false,
        sinopsis: "Imposición de bandera mexicana a plataformas fijas mar adentro.",
        sinopsisEn: "Flying the Mexican flag on fixed offshore platforms.",
        requisitos: ["Certificado de matrícula de la plataforma", "Identificación del propietario", "Comprobante de pago de derechos"],
        requisitosEn: ["Platform registry certificate", "Owner's ID", "Proof of payment of fees"],
        vigencia: "Permanente", vigenciaEn: "Permanent",
        campos: [
            { id: "nombrePropietario", seccion: "solicitante", etiqueta: "Nombre del propietario", etiquetaEn: "Owner's name", pregunta: "¿Cuál es el nombre completo del propietario o concesionaria?", preguntaEn: "What is the owner's or concessionaire's full name?", tipo: "texto", obligatorio: true },
            { id: "rfc", seccion: "solicitante", etiqueta: "RFC", etiquetaEn: "Tax ID (RFC)", pregunta: "¿Cuál es su RFC? Si es persona física, su CURP de 18 caracteres.", preguntaEn: "What is its tax ID (RFC)? If an individual, the 18-character CURP.", tipo: "texto", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la plataforma", etiquetaEn: "Platform name", pregunta: "¿Cómo se llama la plataforma?", preguntaEn: "What is the platform's name?", tipo: "texto", obligatorio: true },
            { id: "matricula", seccion: "embarcacion", etiqueta: "Matrícula", etiquetaEn: "Registry number", pregunta: "¿Cuál es su número de matrícula?", preguntaEn: "What is its registry number?", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto presentarás el trámite?", preguntaEn: "At which Harbor Master's Office will you submit it?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "mat-045a",
        categoria: "matriculas",
        nombre: "Modificación o reposición del certificado de matrícula por modificaciones significativas de características de plataforma fija mar adentro",
        nombreEn: "Modification or replacement of registry certificate for fixed offshore platform changes",
        clave: "SEMAR-05-045-A",
        enLinea: false,
        sinopsis: "Actualiza la matrícula de la plataforma cuando cambian sus características.",
        sinopsisEn: "Update the platform's registry certificate when its characteristics change.",
        requisitos: ["Certificado de matrícula original", "Documentación técnica del cambio", "Identificación del propietario", "Comprobante de pago si aplica"],
        requisitosEn: ["Original registry certificate", "Technical documentation of the change", "Owner's ID", "Proof of payment if applicable"],
        vigencia: "No aplica", vigenciaEn: "Not applicable",
        campos: [
            { id: "nombrePropietario", seccion: "solicitante", etiqueta: "Nombre del propietario", etiquetaEn: "Owner's name", pregunta: "¿Cuál es el nombre completo del propietario o concesionaria?", preguntaEn: "What is the owner's or concessionaire's full name?", tipo: "texto", obligatorio: true },
            { id: "rfc", seccion: "solicitante", etiqueta: "RFC", etiquetaEn: "Tax ID (RFC)", pregunta: "¿Cuál es su RFC? Si es persona física, su CURP de 18 caracteres.", preguntaEn: "What is its tax ID (RFC)? If an individual, the 18-character CURP.", tipo: "texto", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la plataforma", etiquetaEn: "Platform name", pregunta: "¿Cómo se llama la plataforma?", preguntaEn: "What is the platform's name?", tipo: "texto", obligatorio: true },
            { id: "matricula", seccion: "embarcacion", etiqueta: "Matrícula", etiquetaEn: "Registry number", pregunta: "¿Cuál es su número de matrícula?", preguntaEn: "What is its registry number?", tipo: "texto", obligatorio: true },
            { id: "descripcionCambio", seccion: "tramite", etiqueta: "Modificación realizada", etiquetaEn: "Modification made", pregunta: "¿Qué cambió en la plataforma?", preguntaEn: "What changed on the platform?", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto presentarás el trámite?", preguntaEn: "At which Harbor Master's Office will you submit it?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },

    // ---------- LIBRETAS DE MAR (destinos de la ruta) ----------
    {
        id: "libreta-a",
        categoria: "libretas",
        nombre: "Libreta de Mar Tipo A — Marina Mercante (Primera vez)",
        nombreEn: "Seaman's Book Type A — Merchant Marine (First time)",
        clave: "SEMAR-05-009-A",
        rutaRapida: "libretas",
        clavesBusqueda: ["libreta de mar", "libreta tipo a", "marina mercante"],
        enLinea: false,
        sinopsis: "Documento de identidad marítima para tripulantes de la marina mercante y navegación internacional.",
        sinopsisEn: "Maritime identity document for merchant marine crew and international navigation.",
        requisitos: [
            "Acta de nacimiento",
            "CURP",
            "INE o pasaporte vigente",
            "Comprobante de domicilio (menos de 3 meses)",
            "Constancia de Situación Fiscal (RFC)",
            "Examen médico autorizado por SEMAR",
            "Curso STCW de Formación Básica",
            "2 fotografías tamaño credencial, fondo blanco",
            "Comprobante de pago de derechos"
        ],
        requisitosEn: [
            "Birth certificate",
            "CURP (Mexican population ID code)",
            "Valid INE ID or passport",
            "Proof of address (less than 3 months old)",
            "Tax situation certificate (RFC)",
            "Medical examination authorized by SEMAR",
            "STCW Basic Training course",
            "2 ID-size photographs, white background",
            "Proof of payment of fees"
        ],
        vigencia: "5 años", vigenciaEn: "5 years",
        campos: [
            { id: "nombre", seccion: "solicitante", etiqueta: "Nombre completo", etiquetaEn: "Full name", pregunta: "¿Cuál es tu nombre completo, como aparece en tu acta de nacimiento?", preguntaEn: "What is your full name, as shown on your birth certificate?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP", etiquetaEn: "CURP", pregunta: "¿Cuál es tu CURP? Son 18 letras y números.", preguntaEn: "What is your CURP? It is an 18-character Mexican ID code.", tipo: "curp", obligatorio: true },
            { id: "domicilio", seccion: "solicitante", etiqueta: "Domicilio para notificaciones", etiquetaEn: "Address for notifications", pregunta: "¿Cuál es tu domicilio completo? Calle, número, colonia, ciudad y estado.", preguntaEn: "What is your full address? Street, number, neighborhood, city and state.", tipo: "texto", obligatorio: true },
            { id: "ocupacion", seccion: "tramite", etiqueta: "Puesto o cargo a bordo", etiquetaEn: "Onboard position", pregunta: "¿Cuál es tu puesto o cargo a bordo? Por ejemplo: piloto, maquinista, marinero.", preguntaEn: "What is your position on board? For example: officer, engineer, sailor.", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", preguntaEn: "At which Harbor Master's Office will you submit this request?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true },
            { id: "correo", seccion: "solicitante", etiqueta: "Correo electrónico", etiquetaEn: "E-mail", pregunta: "¿Cuál es tu correo electrónico? Si no tienes, escribe \"no tengo\".", preguntaEn: "What is your e-mail address? If you do not have one, write \"no tengo\".", tipo: "correo", obligatorio: false }
        ]
    },
    {
        id: "libreta-b",
        categoria: "libretas",
        nombre: "Libreta de Mar Tipo B — Pesca (Primera vez)",
        nombreEn: "Seaman's Book Type B — Fishing (First time)",
        clave: "SEMAR-05-009-B",
        rutaRapida: "libretas",
        enLinea: false,
        sinopsis: "Documento de identidad marítima para pescadores y tripulantes de embarcaciones pesqueras.",
        sinopsisEn: "Maritime identity document for fishermen and fishing vessel crew.",
        requisitos: ["Acta de nacimiento", "CURP", "INE vigente", "Comprobante de domicilio", "Examen médico vigente", "Constancia de actividad pesquera", "2 fotografías tamaño credencial, fondo blanco", "Comprobante de pago de derechos"],
        requisitosEn: ["Birth certificate", "CURP", "Valid INE ID", "Proof of address", "Valid medical examination", "Fishing activity certificate", "2 ID-size photographs, white background", "Proof of payment of fees"],
        vigencia: "5 años", vigenciaEn: "5 years",
        campos: [
            { id: "nombre", seccion: "solicitante", etiqueta: "Nombre completo", etiquetaEn: "Full name", pregunta: "¿Cuál es tu nombre completo?", preguntaEn: "What is your full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP", etiquetaEn: "CURP", pregunta: "¿Cuál es tu CURP? Son 18 letras y números.", preguntaEn: "What is your CURP? It is an 18-character Mexican ID code.", tipo: "curp", obligatorio: true },
            { id: "domicilio", seccion: "solicitante", etiqueta: "Domicilio para notificaciones", etiquetaEn: "Address for notifications", pregunta: "¿Cuál es tu domicilio completo?", preguntaEn: "What is your full address?", tipo: "texto", obligatorio: true },
            { id: "ocupacion", seccion: "tramite", etiqueta: "Actividad pesquera", etiquetaEn: "Fishing activity", pregunta: "¿A qué te dedicas en la pesca? Por ejemplo: pescador ribereño, tripulante.", preguntaEn: "What is your fishing activity? For example: coastal fisherman, crew member.", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", preguntaEn: "At which Harbor Master's Office will you submit this request?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true },
            { id: "correo", seccion: "solicitante", etiqueta: "Correo electrónico", etiquetaEn: "E-mail", pregunta: "¿Cuál es tu correo electrónico? Opcional.", preguntaEn: "What is your e-mail address? Optional.", tipo: "correo", obligatorio: false }
        ]
    },
    {
        id: "libreta-c",
        categoria: "libretas",
        nombre: "Libreta de Mar Tipo C — Recreo deportivo (Primera vez)",
        nombreEn: "Seaman's Book Type C — Recreational (First time)",
        clave: "SEMAR-05-009-C",
        rutaRapida: "libretas",
        enLinea: false,
        sinopsis: "Documento de identidad marítima para quienes navegan embarcaciones de recreo deportivo o turismo.",
        sinopsisEn: "Maritime identity document for recreational or tourism vessel operators.",
        requisitos: ["Acta de nacimiento", "CURP", "INE vigente", "Comprobante de domicilio", "Examen médico vigente", "Título de Patrón de Embarcaciones de Recreo", "2 fotografías tamaño credencial, fondo blanco", "Comprobante de pago de derechos"],
        requisitosEn: ["Birth certificate", "CURP", "Valid INE ID", "Proof of address", "Valid medical examination", "Recreational Vessel Master title", "2 ID-size photographs, white background", "Proof of payment of fees"],
        vigencia: "5 años", vigenciaEn: "5 years",
        campos: [
            { id: "nombre", seccion: "solicitante", etiqueta: "Nombre completo", etiquetaEn: "Full name", pregunta: "¿Cuál es tu nombre completo?", preguntaEn: "What is your full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP", etiquetaEn: "CURP", pregunta: "¿Cuál es tu CURP? Son 18 letras y números.", preguntaEn: "What is your CURP? It is an 18-character Mexican ID code.", tipo: "curp", obligatorio: true },
            { id: "domicilio", seccion: "solicitante", etiqueta: "Domicilio para notificaciones", etiquetaEn: "Address for notifications", pregunta: "¿Cuál es tu domicilio completo?", preguntaEn: "What is your full address?", tipo: "texto", obligatorio: true },
            { id: "ocupacion", seccion: "tramite", etiqueta: "Título de recreo", etiquetaEn: "Recreational title", pregunta: "¿Qué título o licencia de recreo tienes? Por ejemplo: Patrón de Yate.", preguntaEn: "Which recreational license do you hold? For example: Yacht Master.", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", preguntaEn: "At which Harbor Master's Office will you submit this request?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true },
            { id: "correo", seccion: "solicitante", etiqueta: "Correo electrónico", etiquetaEn: "E-mail", pregunta: "¿Cuál es tu correo electrónico? Opcional.", preguntaEn: "What is your e-mail address? Optional.", tipo: "correo", obligatorio: false }
        ]
    },
    {
        id: "libreta-d",
        categoria: "libretas",
        nombre: "Libreta de Mar Tipo D — Plataformas costa afuera (Primera vez)",
        nombreEn: "Seaman's Book Type D — Offshore Platforms (First time)",
        clave: "SEMAR-05-009-D",
        rutaRapida: "libretas",
        enLinea: false,
        sinopsis: "Documento de identidad marítima para personal que trabaja en plataformas costa afuera.",
        sinopsisEn: "Maritime identity document for offshore platform personnel.",
        requisitos: ["Acta de nacimiento", "CURP", "INE vigente", "Comprobante de domicilio", "Constancia de Situación Fiscal (RFC)", "Examen médico completo y vigente", "Curso de seguridad en plataformas costa afuera", "2 fotografías tamaño credencial, fondo blanco", "Comprobante de pago de derechos"],
        requisitosEn: ["Birth certificate", "CURP", "Valid INE ID", "Proof of address", "Tax situation certificate (RFC)", "Complete and valid medical examination", "Offshore platform safety course", "2 ID-size photographs, white background", "Proof of payment of fees"],
        vigencia: "5 años", vigenciaEn: "5 years",
        campos: [
            { id: "nombre", seccion: "solicitante", etiqueta: "Nombre completo", etiquetaEn: "Full name", pregunta: "¿Cuál es tu nombre completo?", preguntaEn: "What is your full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP", etiquetaEn: "CURP", pregunta: "¿Cuál es tu CURP? Son 18 letras y números.", preguntaEn: "What is your CURP? It is an 18-character Mexican ID code.", tipo: "curp", obligatorio: true },
            { id: "domicilio", seccion: "solicitante", etiqueta: "Domicilio para notificaciones", etiquetaEn: "Address for notifications", pregunta: "¿Cuál es tu domicilio completo?", preguntaEn: "What is your full address?", tipo: "texto", obligatorio: true },
            { id: "ocupacion", seccion: "tramite", etiqueta: "Puesto en la plataforma", etiquetaEn: "Platform position", pregunta: "¿Cuál es tu puesto en la plataforma? Por ejemplo: técnico, operador.", preguntaEn: "What is your position on the platform? For example: technician, operator.", tipo: "texto", obligatorio: true },
            { id: "empresa", seccion: "tramite", etiqueta: "Empresa o contratista", etiquetaEn: "Company or contractor", pregunta: "¿Para qué empresa o contratista trabajas?", preguntaEn: "Which company or contractor do you work for?", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", preguntaEn: "At which Harbor Master's Office will you submit this request?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true },
            { id: "correo", seccion: "solicitante", etiqueta: "Correo electrónico", etiquetaEn: "E-mail", pregunta: "¿Cuál es tu correo electrónico? Opcional.", preguntaEn: "What is your e-mail address? Optional.", tipo: "correo", obligatorio: false }
        ]
    },
    {
        id: "libreta-renovacion",
        categoria: "libretas",
        nombre: "Renovación de Libreta de Mar",
        nombreEn: "Seaman's Book Renewal",
        clave: "SEMAR-05-009 (renovación)",
        rutaRapida: "libretas",
        clavesBusqueda: ["renovar", "renovar mi libreta", "mi libreta venció", "mi libreta esta vencida", "revalidar", "renovación", "renew"],
        enLinea: false,
        sinopsis: "Renueva tu libreta vigente o vencida. Tramítala 30 días antes de que venza.",
        sinopsisEn: "Renew your current or expired seaman's book. Start 30 days before it expires.",
        requisitos: ["Libreta anterior original", "CURP actualizada", "Identificación oficial vigente", "Comprobante de domicilio reciente", "Examen médico vigente", "2 fotografías tamaño credencial, fondo blanco", "Comprobante de pago de derechos"],
        requisitosEn: ["Original previous seaman's book", "Updated CURP", "Valid official ID", "Recent proof of address", "Valid medical examination", "2 ID-size photographs, white background", "Proof of payment of fees"],
        vigencia: "5 años", vigenciaEn: "5 years",
        campos: [
            { id: "nombre", seccion: "solicitante", etiqueta: "Nombre completo", etiquetaEn: "Full name", pregunta: "¿Cuál es tu nombre completo?", preguntaEn: "What is your full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP", etiquetaEn: "CURP", pregunta: "¿Cuál es tu CURP? Son 18 letras y números.", preguntaEn: "What is your CURP? It is an 18-character Mexican ID code.", tipo: "curp", obligatorio: true },
            { id: "tipoLibreta", seccion: "tramite", etiqueta: "Tipo de libreta a renovar", etiquetaEn: "Seaman's book type to renew", pregunta: "¿Qué tipo de libreta vas a renovar? A, B, C o D.", preguntaEn: "Which type of seaman's book are you renewing? A, B, C or D.", tipo: "texto", obligatorio: true },
            { id: "folioLibreta", seccion: "tramite", etiqueta: "Folio de la libreta actual", etiquetaEn: "Current seaman's book number", pregunta: "¿Cuál es el folio o número de tu libreta actual? Si no lo recuerdas, escribe \"no lo sé\".", preguntaEn: "What is the number of your current seaman's book? If you do not remember, write \"no lo sé\".", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", preguntaEn: "At which Harbor Master's Office will you submit this request?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true },
            { id: "correo", seccion: "solicitante", etiqueta: "Correo electrónico", etiquetaEn: "E-mail", pregunta: "¿Cuál es tu correo electrónico? Opcional.", preguntaEn: "What is your e-mail address? Optional.", tipo: "correo", obligatorio: false }
        ]
    },
    {
        id: "dim-primera",
        categoria: "libretas",
        nombre: "Documento de Identidad Marítima (Expedición)",
        nombreEn: "Maritime Identity Document (New issue)",
        clave: "SEMAR-05-010-A",
        rutaRapida: "libretas",
        enLinea: false,
        sinopsis: "Documento de identidad para gente de mar, con formatos OMI (Convenio FAL).",
        sinopsisEn: "Identity document for seafarers, per ILO/IMO formats.",
        requisitos: ["Acta de nacimiento", "CURP", "INE o pasaporte vigente", "Comprobante de domicilio", "Examen médico vigente", "Libreta de mar vigente o trámite simultáneo", "2 fotografías tamaño credencial, fondo blanco", "Comprobante de pago de derechos"],
        requisitosEn: ["Birth certificate", "CURP", "Valid INE ID or passport", "Proof of address", "Valid medical examination", "Valid seaman's book or simultaneous request", "2 ID-size photographs, white background", "Proof of payment of fees"],
        vigencia: "5 años", vigenciaEn: "5 years",
        campos: [
            { id: "nombre", seccion: "solicitante", etiqueta: "Nombre completo", etiquetaEn: "Full name", pregunta: "¿Cuál es tu nombre completo?", preguntaEn: "What is your full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP", etiquetaEn: "CURP", pregunta: "¿Cuál es tu CURP? Son 18 letras y números.", preguntaEn: "What is your CURP? It is an 18-character Mexican ID code.", tipo: "curp", obligatorio: true },
            { id: "domicilio", seccion: "solicitante", etiqueta: "Domicilio para notificaciones", etiquetaEn: "Address for notifications", pregunta: "¿Cuál es tu domicilio completo?", preguntaEn: "What is your full address?", tipo: "texto", obligatorio: true },
            { id: "numLibreta", seccion: "tramite", etiqueta: "Folio de la libreta de mar", etiquetaEn: "Seaman's book number", pregunta: "¿Cuál es el folio de tu libreta de mar? Si la estás tramitando a la vez, escribe \"en trámite\".", preguntaEn: "What is your seaman's book number? If you are applying for it at the same time, write \"en trámite\".", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", preguntaEn: "At which Harbor Master's Office will you submit this request?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "dim-renovacion",
        categoria: "libretas",
        nombre: "Documento de Identidad Marítima (Renovación)",
        nombreEn: "Maritime Identity Document (Renewal)",
        clave: "SEMAR-05-010-B",
        rutaRapida: "libretas",
        enLinea: false,
        sinopsis: "Renueva tu Documento de Identidad Marítima vigente o vencido.",
        sinopsisEn: "Renew your current or expired Maritime Identity Document.",
        requisitos: ["Documento de Identidad Marítima anterior", "CURP actualizada", "Identificación oficial vigente", "Examen médico vigente", "2 fotografías tamaño credencial, fondo blanco", "Comprobante de pago de derechos"],
        requisitosEn: ["Previous Maritime Identity Document", "Updated CURP", "Valid official ID", "Valid medical examination", "2 ID-size photographs, white background", "Proof of payment of fees"],
        vigencia: "5 años", vigenciaEn: "5 years",
        campos: [
            { id: "nombre", seccion: "solicitante", etiqueta: "Nombre completo", etiquetaEn: "Full name", pregunta: "¿Cuál es tu nombre completo?", preguntaEn: "What is your full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP", etiquetaEn: "CURP", pregunta: "¿Cuál es tu CURP? Son 18 letras y números.", preguntaEn: "What is your CURP? It is an 18-character Mexican ID code.", tipo: "curp", obligatorio: true },
            { id: "folioDim", seccion: "tramite", etiqueta: "Folio del documento actual", etiquetaEn: "Current document number", pregunta: "¿Cuál es el folio de tu documento actual? Si no lo recuerdas, escribe \"no lo sé\".", preguntaEn: "What is your current document number? If you do not remember, write \"no lo sé\".", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", preguntaEn: "At which Harbor Master's Office will you submit this request?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },

    // ---------- NAVEGACIÓN (destinos de la ruta) ----------
    {
        id: "arribo-menor-altura",
        categoria: "navegacion",
        nombre: "Autorización de arribo — Embarcación menor en navegación de altura",
        nombreEn: "Arrival authorization — Small vessel on high seas",
        clave: "SEMAR-05-017-B",
        rutaRapida: "navegacion",
        enLinea: false,
        sinopsis: "Autorización para arribo a puerto de embarcaciones menores que navegan en altura.",
        sinopsisEn: "Port arrival authorization for small vessels coming from high seas.",
        requisitos: ["Matrícula y documentos vigentes de la embarcación", "Libretas de mar del patrón y la tripulación", "Lista de tripulantes firmada", "Comprobante de pago de derechos"],
        requisitosEn: ["Vessel registry certificate and valid documents", "Seaman's books of master and crew", "Signed crew list", "Proof of payment of fees"],
        vigencia: "Por cada arribo", vigenciaEn: "Per arrival",
        campos: [
            { id: "nombrePatron", seccion: "solicitante", etiqueta: "Nombre del patrón", etiquetaEn: "Master's name", pregunta: "¿Cuál es el nombre completo del patrón?", preguntaEn: "What is the master's full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP del patrón", etiquetaEn: "Master's CURP", pregunta: "¿Cuál es la CURP del patrón?", preguntaEn: "What is the master's CURP?", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la embarcación", etiquetaEn: "Vessel name", pregunta: "¿Cómo se llama tu embarcación?", preguntaEn: "What is your vessel's name?", tipo: "texto", obligatorio: true },
            { id: "matricula", seccion: "embarcacion", etiqueta: "Matrícula", etiquetaEn: "Registry number", pregunta: "¿Cuál es su número de matrícula?", preguntaEn: "What is its registry number?", tipo: "texto", obligatorio: true },
            { id: "procedencia", seccion: "tramite", etiqueta: "Puerto de procedencia", etiquetaEn: "Port of origin", pregunta: "¿De qué puerto o zona vienes?", preguntaEn: "Which port or area are you coming from?", tipo: "texto", obligatorio: true },
            { id: "fechaArribo", seccion: "tramite", etiqueta: "Fecha prevista de arribo", etiquetaEn: "Expected arrival date", pregunta: "¿Qué día llegarás a puerto?", preguntaEn: "On what day will you arrive?", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿A qué Capitanía de Puerto llegarás?", preguntaEn: "At which Harbor Master's Office will you arrive?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "arribo-menor-cabotaje",
        categoria: "navegacion",
        nombre: "Autorización de arribo — Embarcación menor en navegación de cabotaje",
        nombreEn: "Arrival authorization — Small vessel on coastal waters",
        clave: "SEMAR-05-017-D",
        rutaRapida: "navegacion",
        enLinea: false,
        sinopsis: "Autorización para arribo a puerto de embarcaciones menores en cabotaje.",
        sinopsisEn: "Port arrival authorization for small vessels on coastal navigation.",
        requisitos: ["Matrícula y documentos vigentes de la embarcación", "Libretas de mar del patrón y la tripulación", "Lista de tripulantes firmada", "Comprobante de pago de derechos"],
        requisitosEn: ["Vessel registry certificate and valid documents", "Seaman's books of master and crew", "Signed crew list", "Proof of payment of fees"],
        vigencia: "Por cada arribo", vigenciaEn: "Per arrival",
        campos: [
            { id: "nombrePatron", seccion: "solicitante", etiqueta: "Nombre del patrón", etiquetaEn: "Master's name", pregunta: "¿Cuál es el nombre completo del patrón?", preguntaEn: "What is the master's full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP del patrón", etiquetaEn: "Master's CURP", pregunta: "¿Cuál es la CURP del patrón?", preguntaEn: "What is the master's CURP?", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la embarcación", etiquetaEn: "Vessel name", pregunta: "¿Cómo se llama tu embarcación?", preguntaEn: "What is your vessel's name?", tipo: "texto", obligatorio: true },
            { id: "matricula", seccion: "embarcacion", etiqueta: "Matrícula", etiquetaEn: "Registry number", pregunta: "¿Cuál es su número de matrícula?", preguntaEn: "What is its registry number?", tipo: "texto", obligatorio: true },
            { id: "procedencia", seccion: "tramite", etiqueta: "Puerto de procedencia", etiquetaEn: "Port of origin", pregunta: "¿De qué puerto o zona vienes?", preguntaEn: "Which port or area are you coming from?", tipo: "texto", obligatorio: true },
            { id: "fechaArribo", seccion: "tramite", etiqueta: "Fecha prevista de arribo", etiquetaEn: "Expected arrival date", pregunta: "¿Qué día llegarás a puerto?", preguntaEn: "On what day will you arrive?", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿A qué Capitanía de Puerto llegarás?", preguntaEn: "At which Harbor Master's Office will you arrive?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "arribo-mayor-altura",
        categoria: "navegacion",
        nombre: "Autorización de arribo — Embarcación mayor en navegación de altura",
        nombreEn: "Arrival authorization — Large vessel on high seas",
        clave: "SEMAR-05-017-A",
        rutaRapida: "navegacion",
        enLinea: false,
        sinopsis: "Autorización para arribo a puerto de embarcaciones mayores que navegan en altura.",
        sinopsisEn: "Port arrival authorization for large vessels coming from high seas.",
        requisitos: ["Matrícula y documentos vigentes de la embarcación", "Libretas de mar del capitán y la tripulación", "Lista de tripulantes firmada", "Certificados aplicables", "Comprobante de pago de derechos"],
        requisitosEn: ["Vessel registry certificate and valid documents", "Seaman's books of master and crew", "Signed crew list", "Applicable certificates", "Proof of payment of fees"],
        vigencia: "Por cada arribo", vigenciaEn: "Per arrival",
        campos: [
            { id: "nombrePatron", seccion: "solicitante", etiqueta: "Nombre del capitán", etiquetaEn: "Master's name", pregunta: "¿Cuál es el nombre completo del capitán?", preguntaEn: "What is the master's full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP del capitán", etiquetaEn: "Master's CURP", pregunta: "¿Cuál es la CURP del capitán?", preguntaEn: "What is the master's CURP?", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la embarcación", etiquetaEn: "Vessel name", pregunta: "¿Cómo se llama tu embarcación?", preguntaEn: "What is your vessel's name?", tipo: "texto", obligatorio: true },
            { id: "matricula", seccion: "embarcacion", etiqueta: "Matrícula", etiquetaEn: "Registry number", pregunta: "¿Cuál es su número de matrícula?", preguntaEn: "What is its registry number?", tipo: "texto", obligatorio: true },
            { id: "procedencia", seccion: "tramite", etiqueta: "Puerto de procedencia", etiquetaEn: "Port of origin", pregunta: "¿De qué puerto vienes?", preguntaEn: "Which port are you coming from?", tipo: "texto", obligatorio: true },
            { id: "fechaArribo", seccion: "tramite", etiqueta: "Fecha prevista de arribo", etiquetaEn: "Expected arrival date", pregunta: "¿Qué día llegarás a puerto?", preguntaEn: "On what day will you arrive?", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿A qué Capitanía de Puerto llegarás?", preguntaEn: "At which Harbor Master's Office will you arrive?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "arribo-mayor-cabotaje",
        categoria: "navegacion",
        nombre: "Autorización de arribo — Embarcación mayor en navegación de cabotaje",
        nombreEn: "Arrival authorization — Large vessel on coastal waters",
        clave: "SEMAR-05-017-C",
        rutaRapida: "navegacion",
        enLinea: false,
        sinopsis: "Autorización para arribo a puerto de embarcaciones mayores en cabotaje.",
        sinopsisEn: "Port arrival authorization for large vessels on coastal navigation.",
        requisitos: ["Matrícula y documentos vigentes de la embarcación", "Libretas de mar del capitán y la tripulación", "Lista de tripulantes firmada", "Certificados aplicables", "Comprobante de pago de derechos"],
        requisitosEn: ["Vessel registry certificate and valid documents", "Seaman's books of master and crew", "Signed crew list", "Applicable certificates", "Proof of payment of fees"],
        vigencia: "Por cada arribo", vigenciaEn: "Per arrival",
        campos: [
            { id: "nombrePatron", seccion: "solicitante", etiqueta: "Nombre del capitán", etiquetaEn: "Master's name", pregunta: "¿Cuál es el nombre completo del capitán?", preguntaEn: "What is the master's full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP del capitán", etiquetaEn: "Master's CURP", pregunta: "¿Cuál es la CURP del capitán?", preguntaEn: "What is the master's CURP?", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la embarcación", etiquetaEn: "Vessel name", pregunta: "¿Cómo se llama tu embarcación?", preguntaEn: "What is your vessel's name?", tipo: "texto", obligatorio: true },
            { id: "matricula", seccion: "embarcacion", etiqueta: "Matrícula", etiquetaEn: "Registry number", pregunta: "¿Cuál es su número de matrícula?", preguntaEn: "What is its registry number?", tipo: "texto", obligatorio: true },
            { id: "procedencia", seccion: "tramite", etiqueta: "Puerto de procedencia", etiquetaEn: "Port of origin", pregunta: "¿De qué puerto vienes?", preguntaEn: "Which port are you coming from?", tipo: "texto", obligatorio: true },
            { id: "fechaArribo", seccion: "tramite", etiqueta: "Fecha prevista de arribo", etiquetaEn: "Expected arrival date", pregunta: "¿Qué día llegarás a puerto?", preguntaEn: "On what day will you arrive?", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿A qué Capitanía de Puerto llegarás?", preguntaEn: "At which Harbor Master's Office will you arrive?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "despacho",
        categoria: "navegacion",
        nombre: "Despacho de embarcaciones o artefactos navales",
        nombreEn: "Vessel Clearance (Despacho)",
        clave: "SEMAR-05-018",
        claveOficial: "SEMAR-05-018",
        rutaRapida: "navegacion",
        clavesBusqueda: ["despacho", "despachar", "zarpar", "salida a navegar", "despacho de embarcación", "clearance"],
        enLinea: true,
        portal: "https://www.gob.mx/semar/unaman",
        sinopsis: "Trámite obligatorio antes de zarpar. Se puede iniciar en línea y concluir en la Capitanía.",
        sinopsisEn: "Mandatory procedure before departing. It can be started online and completed at the Harbor Master's Office.",
        requisitos: ["Matrícula y documentos vigentes de la embarcación", "Libretas de mar vigentes del patrón y toda la tripulación", "Identificación oficial de cada miembro", "Lista de tripulantes firmada", "Comprobante de pago de derechos"],
        requisitosEn: ["Vessel registry certificate and valid documents", "Valid seaman's books for the master and all crew", "Official ID for each crew member", "Signed crew list", "Proof of payment of fees"],
        vigencia: "Por cada viaje", vigenciaEn: "Per voyage",
        campos: [
            { id: "nombrePatron", seccion: "solicitante", etiqueta: "Nombre del patrón", etiquetaEn: "Master's name", pregunta: "¿Cuál es el nombre completo del patrón del viaje?", preguntaEn: "What is the voyage master's full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP del patrón", etiquetaEn: "Master's CURP", pregunta: "¿Cuál es la CURP del patrón?", preguntaEn: "What is the master's CURP?", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la embarcación", etiquetaEn: "Vessel name", pregunta: "¿Cómo se llama tu embarcación, según su matrícula?", preguntaEn: "What is your vessel's name, as shown on its registry certificate?", tipo: "texto", obligatorio: true },
            { id: "matricula", seccion: "embarcacion", etiqueta: "Matrícula", etiquetaEn: "Registry number", pregunta: "¿Cuál es el número de matrícula de la embarcación?", preguntaEn: "What is the vessel's registry number?", tipo: "texto", obligatorio: true },
            { id: "puertoSalida", seccion: "tramite", etiqueta: "Puerto de salida", etiquetaEn: "Port of departure", pregunta: "¿De qué puerto zarpas?", preguntaEn: "From which port are you departing?", tipo: "texto", obligatorio: true },
            { id: "puertoDestino", seccion: "tramite", etiqueta: "Puerto o zona de destino", etiquetaEn: "Destination port or area", pregunta: "¿A qué puerto o zona vas?", preguntaEn: "Which port or area are you going to?", tipo: "texto", obligatorio: true },
            { id: "numTripulantes", seccion: "tramite", etiqueta: "Personas a bordo", etiquetaEn: "People on board", pregunta: "¿Cuántas personas van a bordo, incluyéndote?", preguntaEn: "How many people will be on board, including you?", tipo: "numero", obligatorio: true },
            { id: "fechaZarpe", seccion: "tramite", etiqueta: "Fecha prevista de zarpe", etiquetaEn: "Expected departure date", pregunta: "¿Qué día piensas zarpar? Por ejemplo: 20 de octubre de 2026.", preguntaEn: "On what day do you plan to depart? For example: October 20, 2026.", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },

    // ---------- ACCIDENTE O INCIDENTE MARÍTIMO ----------
    {
        id: "acta-protesta",
        categoria: "accidentes",
        nombre: "Presentación del Acta de Protesta de accidente o incidente marítimo",
        nombreEn: "Filing of the Sea Protest Affidavit for maritime accident or incident",
        clave: "SEMAR-05-038",
        claveOficial: "SEMAR-05-038",
        clavesBusqueda: ["acta de protesta", "protesta de mar", "accidente", "incidente", "choque", "hundimiento", "varadura", "accident", "incident"],
        enLinea: false,
        sinopsis: "Deja constancia oficial de lo que pasó en un accidente o incidente marítimo. Te ayudo a dictar tu relato completo.",
        sinopsisEn: "Officially record what happened in a maritime accident or incident. I help you dictate your full account.",
        dictado: true,
        requisitos: [
            "Relato de los hechos (te ayudo a redactarlo aquí)",
            "Libreta de mar o identificación del capitán o patrón",
            "Matrícula y documentos de la embarcación",
            "Bitácora de navegación (si la tienes)",
            "Fotografías o evidencia del suceso (si tienes)"
        ],
        requisitosEn: [
            "Account of the events (I help you write it here)",
            "Seaman's book or ID of the master",
            "Vessel registry and documents",
            "Navigation logbook (if available)",
            "Photos or evidence of the event (if available)"
        ],
        vigencia: "No aplica", vigenciaEn: "Not applicable",
        campos: [
            { id: "nombre", seccion: "solicitante", etiqueta: "Nombre completo", etiquetaEn: "Full name", pregunta: "¿Cuál es tu nombre completo?", preguntaEn: "What is your full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP", etiquetaEn: "CURP", pregunta: "¿Cuál es tu CURP? Son 18 letras y números.", preguntaEn: "What is your CURP? It is an 18-character Mexican ID code.", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Embarcación involucrada", etiquetaEn: "Vessel involved", pregunta: "¿Cómo se llama la embarcación involucrada?", preguntaEn: "What is the name of the vessel involved?", tipo: "texto", obligatorio: true },
            { id: "matricula", seccion: "embarcacion", etiqueta: "Matrícula", etiquetaEn: "Registry number", pregunta: "¿Cuál es su número de matrícula? Si no la sabes, escribe \"no la sé\".", preguntaEn: "What is its registry number? If you do not know it, write \"no la sé\".", tipo: "texto", obligatorio: true },
            { id: "fechaSuceso", seccion: "tramite", etiqueta: "Fecha del suceso", etiquetaEn: "Date of the event", pregunta: "¿Qué día pasó? Por ejemplo: 10 de septiembre de 2026.", preguntaEn: "On what day did it happen? For example: September 10, 2026.", tipo: "texto", obligatorio: true },
            { id: "lugarSuceso", seccion: "tramite", etiqueta: "Lugar del suceso", etiquetaEn: "Place of the event", pregunta: "¿Dónde pasó? Puerto, bahía, mar abierto, coordenadas...", preguntaEn: "Where did it happen? Port, bay, open sea, coordinates...", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto presentarás el acta?", preguntaEn: "At which Harbor Master's Office will you file the affidavit?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ],
        seccionesDictado: [
            { id: "hechos", etiqueta: "Descripción detallada de los hechos", etiquetaEn: "Detailed description of events",
              introduccion: "Ahora cuéntame, con todas las palabras que quieras, TODO lo que pasó. Dicta tu relato completo: qué estabas haciendo, qué pasó y qué hiciste después. Usa cuantos mensajes necesites; escribe \"terminé\" cuando acabes.",
              introduccionEn: "Now tell me, in as many words as you want, EVERYTHING that happened. Dictate your full account: what you were doing, what happened and what you did after. Use as many messages as you need; write \"terminé\" (done) when finished." },
            { id: "danos", etiqueta: "Daños a la embarcación, carga o personas", etiquetaEn: "Damage to vessel, cargo or people",
              introduccion: "¿Qué daños hubo? Describe daños a la embarcación, al equipo, a la carga o a las personas. Si no hubo daños, escribe \"sin daños\".",
              introduccionEn: "What damage was there? Describe damage to the vessel, equipment, cargo or people. If there was none, write \"sin daños\" (no damage)." },
            { id: "personas", etiqueta: "Personas involucradas o lesionadas", etiquetaEn: "People involved or injured",
              introduccion: "¿Quiénes estaban involucrados? Nombres de la tripulación, pasajeros o terceros, y si alguien resultó lesionado.",
              introduccionEn: "Who was involved? Names of crew, passengers or third parties, and whether anyone was injured." },
            { id: "condiciones", etiqueta: "Condiciones del mar y del clima", etiquetaEn: "Sea and weather conditions",
              introduccion: "¿Cómo estaba el mar y el clima? Oleaje, viento, visibilidad, corriente...",
              introduccionEn: "How were the sea and weather? Swell, wind, visibility, current..." }
        ]
    }
];

// ---------- Estatus en línea y portales oficiales ----------
// Fuente oficial (actualizada a 2026):
// https://www.gob.mx/semar/unaman/es/articulos/1-de-julio
const PORTALES_EN_LINEA = {
    // Libretas de Mar y Documento de Identidad Marítima
    "libreta-a":       "https://cp.semar.gob.mx/cp/Sigem/TramiteInternet",
    "libreta-c":       "https://cp.semar.gob.mx/cp/Sigem/TramiteInternet",
    "libreta-d":       "https://cp.semar.gob.mx/cp/Sigem/TramiteInternet",
    "dim-primera":     "https://cp.semar.gob.mx/cp/Sigem/TramiteInternet",
    "dim-renovacion":  "https://cp.semar.gob.mx/cp/Sigem/TramiteInternet",
    // Navegación — Arribos
    "arribo-mayor-altura":   "https://cp.semar.gob.mx/cp/Sicapam/TramiteInternet?cUA=1&TiD=578&MiD=0",
    "arribo-menor-altura":   "https://cp.semar.gob.mx/cp/Sicapam/TramiteInternet?cUA=1&TiD=579&MiD=0",
    "arribo-mayor-cabotaje": "https://cp.semar.gob.mx/cp/Sicapam/TramiteInternet?cUA=1&TiD=580&MiD=0",
    "arribo-menor-cabotaje": "https://cp.semar.gob.mx/cp/Sicapam/TramiteInternet?cUA=1&TiD=581&MiD=0",
    // Navegación — Despacho (4 variantes oficiales)
    "despacho-menor-altura":   "https://cp.semar.gob.mx/cp/Sicapam/TramiteInternet?cUA=1&TiD=583&MiD=0",
    "despacho-mayor-altura":   "https://cp.semar.gob.mx/cp/Sicapam/TramiteInternet?cUA=1&TiD=584&MiD=0",
    "despacho-menor-cabotaje": "https://cp.semar.gob.mx/cp/Sicapam/TramiteInternet?cUA=1&TiD=585&MiD=0",
    "despacho-mayor-cabotaje": "https://cp.semar.gob.mx/cp/Sicapam/TramiteInternet?cUA=1&TiD=586&MiD=0"
};

// ---------- TRÁMITES DE DESPACHO (nuevas variantes) ----------
// Se agregan al catálogo general. Reutilizan la misma estructura.
const TRAMITES_DESPACHO = [
    {
        id: "despacho-menor-altura",
        categoria: "navegacion",
        nombre: "Despacho de embarcaciones o artefactos navales menores en navegación de altura",
        nombreEn: "Clearance of small vessels or naval artifacts on high seas",
        clave: "SEMAR-05-018-A",
        enLinea: true,
        clavesBusqueda: ["despacho menor altura", "despachar menor altura", "clearance small high seas"],
        sinopsis: "Autorización para que una embarcación menor zarpe hacia aguas de navegación de altura.",
        sinopsisEn: "Authorization for a small vessel to depart for high seas navigation.",
        requisitos: ["Matrícula y documentos vigentes de la embarcación", "Libretas de mar vigentes del patrón y toda la tripulación", "Identificación oficial de cada miembro", "Lista de tripulantes firmada", "Comprobante de pago de derechos"],
        requisitosEn: ["Vessel registry certificate and valid documents", "Valid seaman's books for the master and all crew", "Official ID for each crew member", "Signed crew list", "Proof of payment of fees"],
        vigencia: "Por cada viaje",
        vigenciaEn: "Per voyage",
        campos: [
            { id: "nombrePatron", seccion: "solicitante", etiqueta: "Nombre del patrón", etiquetaEn: "Master's name", pregunta: "¿Cuál es el nombre completo del patrón del viaje?", preguntaEn: "What is the voyage master's full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP del patrón", etiquetaEn: "Master's CURP", pregunta: "¿Cuál es la CURP del patrón?", preguntaEn: "What is the master's CURP?", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la embarcación", etiquetaEn: "Vessel name", pregunta: "¿Cómo se llama tu embarcación, según su matrícula?", preguntaEn: "What is your vessel's name, as shown on its registry certificate?", tipo: "texto", obligatorio: true },
            { id: "matricula", seccion: "embarcacion", etiqueta: "Matrícula", etiquetaEn: "Registry number", pregunta: "¿Cuál es el número de matrícula de la embarcación?", preguntaEn: "What is the vessel's registry number?", tipo: "texto", obligatorio: true },
            { id: "puertoSalida", seccion: "tramite", etiqueta: "Puerto de salida", etiquetaEn: "Port of departure", pregunta: "¿De qué puerto zarpas?", preguntaEn: "From which port are you departing?", tipo: "texto", obligatorio: true },
            { id: "puertoDestino", seccion: "tramite", etiqueta: "Puerto o zona de destino", etiquetaEn: "Destination port or area", pregunta: "¿A qué puerto o zona vas?", preguntaEn: "Which port or area are you going to?", tipo: "texto", obligatorio: true },
            { id: "numTripulantes", seccion: "tramite", etiqueta: "Personas a bordo", etiquetaEn: "People on board", pregunta: "¿Cuántas personas van a bordo, incluyéndote?", preguntaEn: "How many people will be on board, including you?", tipo: "numero", obligatorio: true },
            { id: "fechaZarpe", seccion: "tramite", etiqueta: "Fecha prevista de zarpe", etiquetaEn: "Expected departure date", pregunta: "¿Qué día piensas zarpar? Por ejemplo: 20 de octubre de 2026.", preguntaEn: "On what day do you plan to depart? For example: October 20, 2026.", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "despacho-mayor-altura",
        categoria: "navegacion",
        nombre: "Despacho de embarcaciones o artefactos navales mayores en navegación de altura",
        nombreEn: "Clearance of large vessels or naval artifacts on high seas",
        clave: "SEMAR-05-018-B",
        enLinea: true,
        clavesBusqueda: ["despacho mayor altura", "despachar mayor altura", "clearance large high seas"],
        sinopsis: "Autorización para que una embarcación mayor zarpe hacia aguas de navegación de altura.",
        sinopsisEn: "Authorization for a large vessel to depart for high seas navigation.",
        requisitos: ["Matrícula y documentos vigentes de la embarcación", "Libretas de mar vigentes del capitán y toda la tripulación", "Identificación oficial de cada miembro", "Lista de tripulantes firmada", "Certificados aplicables", "Comprobante de pago de derechos"],
        requisitosEn: ["Vessel registry certificate and valid documents", "Valid seaman's books for the master and all crew", "Official ID for each crew member", "Signed crew list", "Applicable certificates", "Proof of payment of fees"],
        vigencia: "Por cada viaje",
        vigenciaEn: "Per voyage",
        campos: [
            { id: "nombrePatron", seccion: "solicitante", etiqueta: "Nombre del capitán", etiquetaEn: "Master's name", pregunta: "¿Cuál es el nombre completo del capitán?", preguntaEn: "What is the master's full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP del capitán", etiquetaEn: "Master's CURP", pregunta: "¿Cuál es la CURP del capitán?", preguntaEn: "What is the master's CURP?", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la embarcación", etiquetaEn: "Vessel name", pregunta: "¿Cómo se llama tu embarcación?", preguntaEn: "What is your vessel's name?", tipo: "texto", obligatorio: true },
            { id: "matricula", seccion: "embarcacion", etiqueta: "Matrícula", etiquetaEn: "Registry number", pregunta: "¿Cuál es su número de matrícula?", preguntaEn: "What is its registry number?", tipo: "texto", obligatorio: true },
            { id: "puertoSalida", seccion: "tramite", etiqueta: "Puerto de salida", etiquetaEn: "Port of departure", pregunta: "¿De qué puerto zarpas?", preguntaEn: "From which port are you departing?", tipo: "texto", obligatorio: true },
            { id: "puertoDestino", seccion: "tramite", etiqueta: "Puerto o zona de destino", etiquetaEn: "Destination port or area", pregunta: "¿A qué puerto o zona vas?", preguntaEn: "Which port or area are you going to?", tipo: "texto", obligatorio: true },
            { id: "numTripulantes", seccion: "tramite", etiqueta: "Personas a bordo", etiquetaEn: "People on board", pregunta: "¿Cuántas personas van a bordo, incluyéndote?", preguntaEn: "How many people will be on board, including you?", tipo: "numero", obligatorio: true },
            { id: "fechaZarpe", seccion: "tramite", etiqueta: "Fecha prevista de zarpe", etiquetaEn: "Expected departure date", pregunta: "¿Qué día piensas zarpar? Por ejemplo: 20 de octubre de 2026.", preguntaEn: "On what day do you plan to depart? For example: October 20, 2026.", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "despacho-menor-cabotaje",
        categoria: "navegacion",
        nombre: "Autorización de zarpe de embarcaciones o artefactos navales menores",
        nombreEn: "Departure authorization for small vessels or naval artifacts",
        clave: "SEMAR-05-018-C",
        enLinea: true,
        clavesBusqueda: ["zarpe menor", "despacho menor cabotaje", "zarpe cabotaje menor"],
        sinopsis: "Autorización de zarpe para embarcaciones menores que navegan en cabotaje.",
        sinopsisEn: "Departure authorization for small vessels on coastal navigation.",
        requisitos: ["Matrícula y documentos vigentes de la embarcación", "Libretas de mar vigentes del patrón y la tripulación", "Lista de tripulantes firmada", "Comprobante de pago de derechos"],
        requisitosEn: ["Vessel registry certificate and valid documents", "Valid seaman's books for the master and crew", "Signed crew list", "Proof of payment of fees"],
        vigencia: "Por cada viaje",
        vigenciaEn: "Per voyage",
        campos: [
            { id: "nombrePatron", seccion: "solicitante", etiqueta: "Nombre del patrón", etiquetaEn: "Master's name", pregunta: "¿Cuál es el nombre completo del patrón?", preguntaEn: "What is the master's full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP del patrón", etiquetaEn: "Master's CURP", pregunta: "¿Cuál es la CURP del patrón?", preguntaEn: "What is the master's CURP?", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la embarcación", etiquetaEn: "Vessel name", pregunta: "¿Cómo se llama tu embarcación?", preguntaEn: "What is your vessel's name?", tipo: "texto", obligatorio: true },
            { id: "matricula", seccion: "embarcacion", etiqueta: "Matrícula", etiquetaEn: "Registry number", pregunta: "¿Cuál es su número de matrícula?", preguntaEn: "What is its registry number?", tipo: "texto", obligatorio: true },
            { id: "puertoSalida", seccion: "tramite", etiqueta: "Puerto de salida", etiquetaEn: "Port of departure", pregunta: "¿De qué puerto zarpas?", preguntaEn: "From which port are you departing?", tipo: "texto", obligatorio: true },
            { id: "puertoDestino", seccion: "tramite", etiqueta: "Puerto o zona de destino", etiquetaEn: "Destination port or area", pregunta: "¿A qué puerto o zona vas?", preguntaEn: "Which port or area are you going to?", tipo: "texto", obligatorio: true },
            { id: "numTripulantes", seccion: "tramite", etiqueta: "Personas a bordo", etiquetaEn: "People on board", pregunta: "¿Cuántas personas van a bordo, incluyéndote?", preguntaEn: "How many people will be on board, including you?", tipo: "numero", obligatorio: true },
            { id: "fechaZarpe", seccion: "tramite", etiqueta: "Fecha prevista de zarpe", etiquetaEn: "Expected departure date", pregunta: "¿Qué día piensas zarpar?", preguntaEn: "On what day do you plan to depart?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "despacho-mayor-cabotaje",
        categoria: "navegacion",
        nombre: "Autorización de zarpe de embarcaciones o artefactos navales mayores",
        nombreEn: "Departure authorization for large vessels or naval artifacts",
        clave: "SEMAR-05-018-D",
        enLinea: true,
        clavesBusqueda: ["zarpe mayor", "despacho mayor cabotaje", "zarpe cabotaje mayor"],
        sinopsis: "Autorización de zarpe para embarcaciones mayores que navegan en cabotaje.",
        sinopsisEn: "Departure authorization for large vessels on coastal navigation.",
        requisitos: ["Matrícula y documentos vigentes de la embarcación", "Libretas de mar vigentes del capitán y la tripulación", "Lista de tripulantes firmada", "Certificados aplicables", "Comprobante de pago de derechos"],
        requisitosEn: ["Vessel registry certificate and valid documents", "Valid seaman's books for the master and crew", "Signed crew list", "Applicable certificates", "Proof of payment of fees"],
        vigencia: "Por cada viaje",
        vigenciaEn: "Per voyage",
        campos: [
            { id: "nombrePatron", seccion: "solicitante", etiqueta: "Nombre del capitán", etiquetaEn: "Master's name", pregunta: "¿Cuál es el nombre completo del capitán?", preguntaEn: "What is the master's full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP del capitán", etiquetaEn: "Master's CURP", pregunta: "¿Cuál es la CURP del capitán?", preguntaEn: "What is the master's CURP?", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la embarcación", etiquetaEn: "Vessel name", pregunta: "¿Cómo se llama tu embarcación?", preguntaEn: "What is your vessel's name?", tipo: "texto", obligatorio: true },
            { id: "matricula", seccion: "embarcacion", etiqueta: "Matrícula", etiquetaEn: "Registry number", pregunta: "¿Cuál es su número de matrícula?", preguntaEn: "What is its registry number?", tipo: "texto", obligatorio: true },
            { id: "puertoSalida", seccion: "tramite", etiqueta: "Puerto de salida", etiquetaEn: "Port of departure", pregunta: "¿De qué puerto zarpas?", preguntaEn: "From which port are you departing?", tipo: "texto", obligatorio: true },
            { id: "puertoDestino", seccion: "tramite", etiqueta: "Puerto o zona de destino", etiquetaEn: "Destination port or area", pregunta: "¿A qué puerto o zona vas?", preguntaEn: "Which port or area are you going to?", tipo: "texto", obligatorio: true },
            { id: "numTripulantes", seccion: "tramite", etiqueta: "Personas a bordo", etiquetaEn: "People on board", pregunta: "¿Cuántas personas van a bordo, incluyéndote?", preguntaEn: "How many people will be on board, including you?", tipo: "numero", obligatorio: true },
            { id: "fechaZarpe", seccion: "tramite", etiqueta: "Fecha prevista de zarpe", etiquetaEn: "Expected departure date", pregunta: "¿Qué día piensas zarpar?", preguntaEn: "On what day do you plan to depart?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    }
];

// Agregar los trámites de despacho al catálogo general
TRAMITES.push(...TRAMITES_DESPACHO);

// ---------- RUTA DE NAVEGACIÓN ACTUALIZADA (con sub-pasos para despacho) ----------
RUTAS.navegacion = {
    pasos: [
        { id: "operacion", pregunta: "¿Qué necesitas: arribo o despacho?", preguntaEn: "What do you need: arrival or clearance?",
          opciones: [
              { valor: "arribo", etiqueta: "🛳️ Arribo (llego a puerto)", etiquetaEn: "🛳️ Arrival (I'm coming into port)" },
              { valor: "despacho", etiqueta: "⚓ Despacho (voy a zarpar)", etiquetaEn: "⚓ Clearance (I'm departing)" }
          ] },
        { id: "tamano", pregunta: "¿Tu embarcación es menor o mayor?", preguntaEn: "Is your vessel small (menor) or large (mayor)?",
          opciones: [
              { valor: "menor", etiqueta: "Menor", etiquetaEn: "Small (menor)" },
              { valor: "mayor", etiqueta: "Mayor", etiquetaEn: "Large (mayor)" }
          ] },
        { id: "tipoNavegacion", pregunta: "¿Navegas en altura o en cabotaje?", preguntaEn: "Do you navigate on high seas (altura) or coastal waters (cabotaje)?",
          opciones: [
              { valor: "altura", etiqueta: "Navegación de altura", etiquetaEn: "High seas (altura)" },
              { valor: "cabotaje", etiqueta: "Cabotaje", etiquetaEn: "Coastal waters (cabotaje)" }
          ] }
    ],
    destino: r => {
        // Combina operación + tamaño + tipo de navegación
        if (r.operacion === "despacho") {
            return "despacho-" + r.tamano + "-" + r.tipoNavegacion;
        }
        // Arribo
        return "arribo-" + r.tamano + "-" + r.tipoNavegacion;
    }
};

// Aplicar enlaces y estatus en línea
TRAMITES.forEach(tr => {
    if (PORTALES_EN_LINEA[tr.id]) {
        tr.enLinea = true;
        tr.portal = PORTALES_EN_LINEA[tr.id];
    } else {
        tr.enLinea = false;
        delete tr.portal;
    }
});

// ---------- Búsqueda global de trámites ----------
function buscarTramitePorId(id) {
    return TRAMITES.find(x => x.id === id) || null;
}