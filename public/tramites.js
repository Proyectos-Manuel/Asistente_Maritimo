// ==========================================
// CATÁLOGO DE TRÁMITES — SEMAR · UNAMAN
// Cada trámite tiene: id, categoría, nombre,
// clave, etiqueta "en línea" (si aplica),
// requisitos, vigencia y campos del formulario.
// ==========================================

const CATEGORIAS = [
    { id: "libretas", nombre: "Libretas de Mar", emoji: "📔" },
    { id: "navegacion", nombre: "Navegación", emoji: "🚢" },
    { id: "embarcaciones", nombre: "Embarcaciones", emoji: "⛵" },
    { id: "proteccion", nombre: "Protección Portuaria", emoji: "🛡️" },
    { id: "certificados", nombre: "Certificados y Otros", emoji: "📜" }
];

const TRAMITES = [
    // ---------- LIBRETAS DE MAR ----------
    {
        id: "libreta-a",
        categoria: "libretas",
        nombre: "Libreta Tipo A — Marina Mercante / Internacional",
        clave: "UN-01-002-A",
        enLinea: false,
        sinopsis: "Para tripulantes de la marina mercante y navegación internacional.",
        requisitos: [
            "Acta de nacimiento",
            "CURP",
            "INE o Pasaporte vigente",
            "Comprobante de domicilio (menos de 3 meses)",
            "Constancia de Situación Fiscal (RFC)",
            "Examen médico autorizado por SEMAR",
            "Curso STCW de Formación Básica",
            "2 fotos credencial, fondo blanco",
            "Comprobante de pago"
        ],
        vigencia: "5 años",
        campos: [
            { id: "nombre", pregunta: "¿Cuál es tu nombre completo (como aparece en tu acta de nacimiento)?", tipo: "texto", obligatorio: true },
            { id: "curp", pregunta: "¿Cuál es tu CURP? Son 18 letras y números", tipo: "curp", obligatorio: true },
            { id: "domicilio", pregunta: "¿Cuál es tu domicilio completo? (calle, número, colonia, ciudad y estado)", tipo: "texto", obligatorio: true },
            { id: "ocupacion", pregunta: "¿Cuál es tu puesto o cargo a bordo? (por ejemplo: piloto, maquinista, marinero)", tipo: "texto", obligatorio: true },
            { id: "capitania", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", tipo: "texto", obligatorio: true },
            { id: "telefono", pregunta: "¿A qué teléfono te pueden llamar? (10 dígitos)", tipo: "telefono", obligatorio: true },
            { id: "correo", pregunta: "¿Cuál es tu correo electrónico? (opcional, si no tienes escribe 'no tengo')", tipo: "correo", obligatorio: false }
        ]
    },
    {
        id: "libreta-b",
        categoria: "libretas",
        nombre: "Libreta Tipo B — Pesca",
        clave: "UN-01-002-B",
        enLinea: false,
        sinopsis: "Para pescadores y tripulantes de embarcaciones pesqueras.",
        requisitos: [
            "Acta de nacimiento",
            "CURP",
            "INE vigente",
            "Comprobante de domicilio",
            "Examen médico vigente",
            "Constancia de actividad pesquera",
            "2 fotos credencial, fondo blanco",
            "Comprobante de pago"
        ],
        vigencia: "5 años",
        campos: [
            { id: "nombre", pregunta: "¿Cuál es tu nombre completo?", tipo: "texto", obligatorio: true },
            { id: "curp", pregunta: "¿Cuál es tu CURP? Son 18 letras y números", tipo: "curp", obligatorio: true },
            { id: "domicilio", pregunta: "¿Cuál es tu domicilio completo?", tipo: "texto", obligatorio: true },
            { id: "ocupacion", pregunta: "¿A qué te dedicas en la pesca? (por ejemplo: pescador ribereño, tripulante)", tipo: "texto", obligatorio: true },
            { id: "capitania", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", tipo: "texto", obligatorio: true },
            { id: "telefono", pregunta: "¿A qué teléfono te pueden llamar? (10 dígitos)", tipo: "telefono", obligatorio: true },
            { id: "correo", pregunta: "¿Cuál es tu correo electrónico? (opcional)", tipo: "correo", obligatorio: false }
        ]
    },
    {
        id: "libreta-c",
        categoria: "libretas",
        nombre: "Libreta Tipo C — Recreo / Turismo",
        clave: "UN-01-002-C",
        enLinea: false,
        sinopsis: "Para quienes navegan embarcaciones de recreo deportivo o turismo.",
        requisitos: [
            "Acta de nacimiento",
            "CURP",
            "INE vigente",
            "Comprobante de domicilio",
            "Examen médico vigente",
            "Título de Patrón de Embarcaciones de Recreo",
            "2 fotos credencial, fondo blanco",
            "Comprobante de pago"
        ],
        vigencia: "5 años",
        campos: [
            { id: "nombre", pregunta: "¿Cuál es tu nombre completo?", tipo: "texto", obligatorio: true },
            { id: "curp", pregunta: "¿Cuál es tu CURP? Son 18 letras y números", tipo: "curp", obligatorio: true },
            { id: "domicilio", pregunta: "¿Cuál es tu domicilio completo?", tipo: "texto", obligatorio: true },
            { id: "ocupacion", pregunta: "¿Qué título o licencia de recreo tienes? (por ejemplo: Patrón de Yate)", tipo: "texto", obligatorio: true },
            { id: "capitania", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", tipo: "texto", obligatorio: true },
            { id: "telefono", pregunta: "¿A qué teléfono te pueden llamar? (10 dígitos)", tipo: "telefono", obligatorio: true },
            { id: "correo", pregunta: "¿Cuál es tu correo electrónico? (opcional)", tipo: "correo", obligatorio: false }
        ]
    },
    {
        id: "libreta-d",
        categoria: "libretas",
        nombre: "Libreta Tipo D — Plataformas / Costa Afuera",
        clave: "UN-01-002-D",
        enLinea: false,
        sinopsis: "Para personal que trabaja en plataformas costa afuera.",
        requisitos: [
            "Acta de nacimiento",
            "CURP",
            "INE vigente",
            "Comprobante de domicilio",
            "Constancia de Situación Fiscal (RFC)",
            "Examen médico completo y vigente",
            "Curso de seguridad en plataformas costa afuera",
            "2 fotos credencial, fondo blanco",
            "Comprobante de pago"
        ],
        vigencia: "5 años",
        campos: [
            { id: "nombre", pregunta: "¿Cuál es tu nombre completo?", tipo: "texto", obligatorio: true },
            { id: "curp", pregunta: "¿Cuál es tu CURP? Son 18 letras y números", tipo: "curp", obligatorio: true },
            { id: "domicilio", pregunta: "¿Cuál es tu domicilio completo?", tipo: "texto", obligatorio: true },
            { id: "ocupacion", pregunta: "¿Cuál es tu puesto en la plataforma? (por ejemplo: técnico, operador)", tipo: "texto", obligatorio: true },
            { id: "empresa", pregunta: "¿Para qué empresa o contratista trabajas?", tipo: "texto", obligatorio: true },
            { id: "capitania", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", tipo: "texto", obligatorio: true },
            { id: "telefono", pregunta: "¿A qué teléfono te pueden llamar? (10 dígitos)", tipo: "telefono", obligatorio: true },
            { id: "correo", pregunta: "¿Cuál es tu correo electrónico? (opcional)", tipo: "correo", obligatorio: false }
        ]
    },
    {
        id: "renovacion-libreta",
        categoria: "libretas",
        nombre: "Renovación de Libreta de Mar",
        clave: "UN-01-003",
        clavesBusqueda: ["renovar", "renovar mi libreta", "mi libreta venció", "mi libreta esta vencida", "revalidar", "renovación"],
        enLinea: false,
        sinopsis: "Renueva tu libreta vigente o vencida. Tramítala 30 días antes de que venza.",
        requisitos: [
            "Libreta anterior original",
            "CURP actualizada",
            "Identificación oficial vigente",
            "Comprobante de domicilio reciente",
            "Examen médico vigente",
            "2 fotos credencial, fondo blanco",
            "Comprobante de pago"
        ],
        vigencia: "5 años",
        campos: [
            { id: "nombre", pregunta: "¿Cuál es tu nombre completo?", tipo: "texto", obligatorio: true },
            { id: "curp", pregunta: "¿Cuál es tu CURP? Son 18 letras y números", tipo: "curp", obligatorio: true },
            { id: "tipoLibreta", pregunta: "¿Qué tipo de libreta vas a renovar? (A, B, C o D)", tipo: "texto", obligatorio: true },
            { id: "folioLibreta", pregunta: "¿Cuál es el folio o número de tu libreta actual? (si no lo recuerdas escribe 'no lo sé')", tipo: "texto", obligatorio: true },
            { id: "capitania", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", tipo: "texto", obligatorio: true },
            { id: "telefono", pregunta: "¿A qué teléfono te pueden llamar? (10 dígitos)", tipo: "telefono", obligatorio: true },
            { id: "correo", pregunta: "¿Cuál es tu correo electrónico? (opcional)", tipo: "correo", obligatorio: false }
        ]
    },
    {
        id: "duplicado",
        categoria: "libretas",
        nombre: "Duplicado por Pérdida o Robo",
        clave: "UN-01-004",
        clavesBusqueda: ["perdí mi libreta", "perdi mi libreta", "se me perdió", "se me perdio", "me la robaron", "me robaron", "extravié", "extravie", "duplicado", "pérdida", "perdida"],
        enLinea: false,
        sinopsis: "Si perdiste o te robaron tu libreta, tramita el duplicado. Entrega de 5 a 10 días hábiles.",
        requisitos: [
            "Acta de nacimiento",
            "CURP",
            "Identificación oficial vigente",
            "Comprobante de domicilio",
            "Constancia de extravío o denuncia levantada ante autoridad",
            "2 fotos credencial, fondo blanco",
            "Comprobante de pago"
        ],
        vigencia: "Misma vigencia de la libreta original",
        campos: [
            { id: "nombre", pregunta: "¿Cuál es tu nombre completo?", tipo: "texto", obligatorio: true },
            { id: "curp", pregunta: "¿Cuál es tu CURP? Son 18 letras y números", tipo: "curp", obligatorio: true },
            { id: "tipoLibreta", pregunta: "¿Qué tipo de libreta se te perdió o robaron? (A, B, C o D)", tipo: "texto", obligatorio: true },
            { id: "motivo", pregunta: "¿Fue pérdida o robo? (con esto el asistente te recuerda si necesitas denuncia)", tipo: "texto", obligatorio: true },
            { id: "capitania", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", tipo: "texto", obligatorio: true },
            { id: "telefono", pregunta: "¿A qué teléfono te pueden llamar? (10 dígitos)", tipo: "telefono", obligatorio: true },
            { id: "correo", pregunta: "¿Cuál es tu correo electrónico? (opcional)", tipo: "correo", obligatorio: false }
        ]
    },

    // ---------- NAVEGACIÓN ----------
    {
        id: "despacho",
        categoria: "navegacion",
        nombre: "Despacho de Embarcación",
        clave: "UN-02-001",
        clavesBusqueda: ["despacho", "despachar", "zarpar", "salida a navegar", "despacho de embarcación"],
        enLinea: true,
        portal: "https://www.gob.mx/semar/unaman",
        sinopsis: "Trámite obligatorio ANTES de zarpar. Se puede iniciar en línea y concluir en Capitanía.",
        requisitos: [
            "Matrícula y documentos vigentes de la embarcación",
            "Libretas Marítimas vigentes del Patrón y toda la tripulación",
            "Identificación oficial de cada miembro",
            "Lista de tripulantes firmada",
            "Comprobante de pago de derechos"
        ],
        vigencia: "Por cada viaje",
        campos: [
            { id: "nombrePatron", pregunta: "¿Cuál es el nombre completo del Patrón del viaje?", tipo: "texto", obligatorio: true },
            { id: "curp", pregunta: "¿Cuál es la CURP del Patrón? Son 18 letras y números", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", pregunta: "¿Cómo se llama tu embarcación (según su matrícula)?", tipo: "texto", obligatorio: true },
            { id: "matricula", pregunta: "¿Cuál es el número de matrícula de la embarcación?", tipo: "texto", obligatorio: true },
            { id: "puertoSalida", pregunta: "¿De qué puerto zarpas?", tipo: "texto", obligatorio: true },
            { id: "puertoDestino", pregunta: "¿A qué puerto o zona vas?", tipo: "texto", obligatorio: true },
            { id: "numTripulantes", pregunta: "¿Cuántas personas van a bordo (incluyéndote)?", tipo: "numero", obligatorio: true },
            { id: "fechaZarpe", pregunta: "¿Qué día piensas zarpar? (por ejemplo: 20 de octubre de 2026)", tipo: "texto", obligatorio: true },
            { id: "telefono", pregunta: "¿A qué teléfono te pueden llamar? (10 dígitos)", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "permiso-navegacion",
        categoria: "navegacion",
        nombre: "Permiso de Navegación Interior",
        clave: "UN-02-005",
        enLinea: true,
        portal: "https://www.gob.mx/semar/unaman",
        sinopsis: "Para navegar en aguas interiores (lagunas, ríos, bahías) con fines deportivos o comerciales.",
        requisitos: [
            "Identificación oficial del solicitante",
            "Matrícula o documento de la embarcación",
            "Lista de tripulantes",
            "Comprobante de pago"
        ],
        vigencia: "Según el permiso otorgado",
        campos: [
            { id: "nombre", pregunta: "¿Cuál es tu nombre completo?", tipo: "texto", obligatorio: true },
            { id: "curp", pregunta: "¿Cuál es tu CURP? Son 18 letras y números", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", pregunta: "¿Cómo se llama tu embarcación?", tipo: "texto", obligatorio: true },
            { id: "zonaNavegacion", pregunta: "¿En qué zona o cuerpo de agua vas a navegar?", tipo: "texto", obligatorio: true },
            { id: "proposito", pregunta: "¿Para qué vas a usar el permiso? (deporte, turismo, trabajo...)", tipo: "texto", obligatorio: true },
            { id: "capitania", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", tipo: "texto", obligatorio: true },
            { id: "telefono", pregunta: "¿A qué teléfono te pueden llamar? (10 dígitos)", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "regata",
        categoria: "navegacion",
        nombre: "Autorización de Regatas y Competencias Náuticas",
        clave: "UN-02-008",
        enLinea: true,
        portal: "https://www.gob.mx/semar/unaman",
        sinopsis: "Autorización para organizar regatas, veleros o competencias náuticas.",
        requisitos: [
            "Solicitud del club u organizador",
            "Ruta y fecha del evento",
            "Lista de participantes y embarcaciones",
            "Plan de seguridad del evento"
        ],
        vigencia: "Por evento",
        campos: [
            { id: "organizacion", pregunta: "¿Quién organiza el evento? (club, asociación o persona)", tipo: "texto", obligatorio: true },
            { id: "responsable", pregunta: "¿Quién es el responsable del evento?", tipo: "texto", obligatorio: true },
            { id: "nombreEvento", pregunta: "¿Cómo se llama la regata o competencia?", tipo: "texto", obligatorio: true },
            { id: "fechaEvento", pregunta: "¿Qué fecha se realizará? (por ejemplo: 5 de diciembre de 2026)", tipo: "texto", obligatorio: true },
            { id: "zonaEvento", pregunta: "¿En qué zona se realizará? (bahía, mar abierto, laguna...)", tipo: "texto", obligatorio: true },
            { id: "numParticipantes", pregunta: "¿Cuántas embarcaciones y participantes aproximadamente?", tipo: "texto", obligatorio: true },
            { id: "capitania", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", tipo: "texto", obligatorio: true },
            { id: "telefono", pregunta: "¿A qué teléfono te pueden llamar? (10 dígitos)", tipo: "telefono", obligatorio: true }
        ]
    },

    // ---------- EMBARCACIONES ----------
    {
        id: "inscripcion",
        categoria: "embarcaciones",
        nombre: "Inscripción de Embarcación",
        clave: "UN-03-001",
        clavesBusqueda: ["inscribir", "inscripción", "matricular", "matrícula", "compré una embarcación", "bote nuevo"],
        enLinea: false,
        sinopsis: "Registra tu embarcación nueva o recién comprada en la matrícula naval.",
        requisitos: [
            "Solicitud firmada",
            "Título de propiedad o documento de compraventa",
            "Identificación del propietario",
            "Comprobante de domicilio",
            "Póliza de seguro vigente",
            "Comprobante de pago"
        ],
        vigencia: "Permanente, con documentos complementarios vigentes",
        campos: [
            { id: "nombrePropietario", pregunta: "¿Cuál es el nombre completo del propietario?", tipo: "texto", obligatorio: true },
            { id: "curp", pregunta: "¿Cuál es su CURP? Son 18 letras y números", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", pregunta: "¿Qué nombre llevará la embarcación?", tipo: "texto", obligatorio: true },
            { id: "tipoEmbarcacion", pregunta: "¿Qué tipo de embarcación es? (velero, lancha, yate, pangas...)", tipo: "texto", obligatorio: true },
            { id: "eslora", pregunta: "¿Cuánto mide de largo (eslora)? por ejemplo: 7.5 metros", tipo: "texto", obligatorio: true },
            { id: "motor", pregunta: "¿Qué motor tiene? (marca y potencia, o 'velero sin motor')", tipo: "texto", obligatorio: true },
            { id: "puertoBase", pregunta: "¿En qué puerto tendrá su base?", tipo: "texto", obligatorio: true },
            { id: "capitania", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", tipo: "texto", obligatorio: true },
            { id: "telefono", pregunta: "¿A qué teléfono te pueden llamar? (10 dígitos)", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "cambio-datos",
        categoria: "embarcaciones",
        nombre: "Cambio de Domicilio o Datos",
        clave: "UN-01-009",
        enLinea: false,
        sinopsis: "Actualiza tu domicilio o datos personales en tu libreta marítima.",
        requisitos: [
            "Libreta marítima original",
            "CURP actualizada",
            "Nuevo comprobante de domicilio (menos de 3 meses)",
            "Comprobante de pago si aplica"
        ],
        vigencia: "No aplica",
        campos: [
            { id: "nombre", pregunta: "¿Cuál es tu nombre completo?", tipo: "texto", obligatorio: true },
            { id: "curp", pregunta: "¿Cuál es tu CURP? Son 18 letras y números", tipo: "curp", obligatorio: true },
            { id: "cambioTipo", pregunta: "¿Qué dato vas a cambiar? (domicilio, teléfono, estado civil...)", tipo: "texto", obligatorio: true },
            { id: "datoNuevo", pregunta: "¿Cuál es el dato nuevo? (escríbelo completo)", tipo: "texto", obligatorio: true },
            { id: "capitania", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", tipo: "texto", obligatorio: true },
            { id: "telefono", pregunta: "¿A qué teléfono te pueden llamar? (10 dígitos)", tipo: "telefono", obligatorio: true }
        ]
    },

    // ---------- PROTECCIÓN PORTUARIA ----------
    {
        id: "proteccion-portuaria",
        categoria: "proteccion",
        nombre: "Trámite de Protección Portuaria",
        clave: "UN-05-001",
        enLinea: true,
        portal: "https://www.gob.mx/semar/unaman",
        sinopsis: "Autorizaciones e inspecciones de protección portuaria (ISPS): acceso a puerto, protección de instalaciones y buques.",
        requisitos: [
            "Identificación oficial del solicitante",
            "Documento que acredite la relación con el buque o instalación",
            "Formulario de protección portuaria (la Capitanía lo proporciona)",
            "Comprobante de pago si aplica"
        ],
        vigencia: "Según el tipo de autorización",
        campos: [
            { id: "nombre", pregunta: "¿Cuál es tu nombre completo?", tipo: "texto", obligatorio: true },
            { id: "curp", pregunta: "¿Cuál es tu CURP? Son 18 letras y números", tipo: "curp", obligatorio: true },
            { id: "empresa", pregunta: "¿Qué empresa o instalación portuaria representa?", tipo: "texto", obligatorio: true },
            { id: "tipoTramite", pregunta: "¿Qué tipo de trámite de protección portuaria necesitas? (acceso, inspección, protección de instalación...)", tipo: "texto", obligatorio: true },
            { id: "buque", pregunta: "¿Para qué buque o instalación es? (nombre o código)", tipo: "texto", obligatorio: true },
            { id: "capitania", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", tipo: "texto", obligatorio: true },
            { id: "telefono", pregunta: "¿A qué teléfono te pueden llamar? (10 dígitos)", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "delegado-honorario",
        categoria: "proteccion",
        nombre: "Solicitud de Delegado Honorario",
        clave: "UN-05-012",
        enLinea: true,
        portal: "https://www.gob.mx/semar/unaman",
        sinopsis: "Postulación como Delegado Honorario de Marina Mercante en puertos sin Capitanía.",
        requisitos: [
            "Solicitud dirigida a la Autoridad Marítima Nacional",
            "Copia de identificación oficial",
            "CURP",
            "Comprobante de domicilio de la localidad",
            "Carta de antecedentes o cartas de recomendación de la comunidad",
            "Currículum breve"
        ],
        vigencia: "Por designación",
        campos: [
            { id: "nombre", pregunta: "¿Cuál es tu nombre completo?", tipo: "texto", obligatorio: true },
            { id: "curp", pregunta: "¿Cuál es tu CURP? Son 18 letras y números", tipo: "curp", obligatorio: true },
            { id: "localidad", pregunta: "¿En qué localidad o puerto serías Delegado Honorario?", tipo: "texto", obligatorio: true },
            { id: "motivacion", pregunta: "En pocas palabras, ¿por qué quieres ser Delegado Honorario?", tipo: "texto", obligatorio: true },
            { id: "experiencia", pregunta: "¿Qué experiencia marítima tienes? (estudios, trabajo en el mar, cargo en la comunidad)", tipo: "texto", obligatorio: true },
            { id: "telefono", pregunta: "¿A qué teléfono te pueden llamar? (10 dígitos)", tipo: "telefono", obligatorio: true },
            { id: "correo", pregunta: "¿Cuál es tu correo electrónico? (opcional)", tipo: "correo", obligatorio: false }
        ]
    },

    // ---------- CERTIFICADOS ----------
    {
        id: "patron-yate",
        categoria: "certificados",
        nombre: "Patrón de Embarcaciones de Recreo (Patrón de Yate)",
        clave: "UN-04-002",
        enLinea: false,
        sinopsis: "Certificado que habilita para gobernar embarcaciones de recreo hasta cierta distancia de la costa.",
        requisitos: [
            "Acta de nacimiento",
            "CURP",
            "INE vigente",
            "Comprobante de domicilio",
            "Examen médico vigente",
            "Certificado de curso de patrón de yate (escuela autorizada)",
            "2 fotos credencial, fondo blanco",
            "Comprobante de pago"
        ],
        vigencia: "5 años",
        campos: [
            { id: "nombre", pregunta: "¿Cuál es tu nombre completo?", tipo: "texto", obligatorio: true },
            { id: "curp", pregunta: "¿Cuál es tu CURP? Son 18 letras y números", tipo: "curp", obligatorio: true },
            { id: "curso", pregunta: "¿Dónde tomaste tu curso de patrón de yate?", tipo: "texto", obligatorio: true },
            { id: "capitania", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", tipo: "texto", obligatorio: true },
            { id: "telefono", pregunta: "¿A qué teléfono te pueden llamar? (10 dígitos)", tipo: "telefono", obligatorio: true },
            { id: "correo", pregunta: "¿Cuál es tu correo electrónico? (opcional)", tipo: "correo", obligatorio: false }
        ]
    },
    {
        id: "tiempo-embarque",
        categoria: "certificados",
        nombre: "Constancia de Tiempo de Embarque",
        clave: "UN-04-007",
        enLinea: false,
        sinopsis: "Constancia oficial de los días navegados, necesaria para ascensos y exámenes de capacidad.",
        requisitos: [
            "Libreta de mar vigente",
            "Bitácoras o cartas de embarco de cada viaje",
            "Identificación oficial",
            "Solicitud firmada"
        ],
        vigencia: "No aplica",
        campos: [
            { id: "nombre", pregunta: "¿Cuál es tu nombre completo?", tipo: "texto", obligatorio: true },
            { id: "curp", pregunta: "¿Cuál es tu CURP? Son 18 letras y números", tipo: "curp", obligatorio: true },
            { id: "numLibreta", pregunta: "¿Cuál es el folio de tu libreta de mar?", tipo: "texto", obligatorio: true },
            { id: "periodo", pregunta: "¿De qué periodo necesitas la constancia? (por ejemplo: de enero de 2023 a diciembre de 2025)", tipo: "texto", obligatorio: true },
            { id: "capitania", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", tipo: "texto", obligatorio: true },
            { id: "telefono", pregunta: "¿A qué teléfono te pueden llamar? (10 dígitos)", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "pesca-ribereña",
        categoria: "certificados",
        nombre: "Tarjeta de Control de Pesca Ribereña",
        clave: "UN-04-010",
        enLinea: false,
        sinopsis: "Tarjeta para pescadores ribereños que faenan en embarcaciones menores.",
        requisitos: [
            "Libreta de mar tipo B vigente",
            "Identificación oficial",
            "Permiso o concesión de pesca (si aplica)",
            "Datos de la embarcación en que faenas",
            "Comprobante de pago si aplica"
        ],
        vigencia: "Según la vigencia del permiso de pesca",
        campos: [
            { id: "nombre", pregunta: "¿Cuál es tu nombre completo?", tipo: "texto", obligatorio: true },
            { id: "curp", pregunta: "¿Cuál es tu CURP? Son 18 letras y números", tipo: "curp", obligatorio: true },
            { id: "numLibreta", pregunta: "¿Cuál es el folio de tu libreta tipo B?", tipo: "texto", obligatorio: true },
            { id: "embarcacion", pregunta: "¿En qué embarcación faenas? (nombre y matrícula)", tipo: "texto", obligatorio: true },
            { id: "especie", pregunta: "¿Qué especies capturas principalmente?", tipo: "texto", obligatorio: true },
            { id: "capitania", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", tipo: "texto", obligatorio: true },
            { id: "telefono", pregunta: "¿A qué teléfono te pueden llamar? (10 dígitos)", tipo: "telefono", obligatorio: true }
        ]
    }
];

// ==========================================
// TRÁMITES RECOMENDADOS POR OCUPACIÓN
// (para la personalización de botones)
// ==========================================
const OCUPACIONES = [
    { id: "pescador", nombre: "Pescador(a)", emoji: "🎣", recomendados: ["libreta-b", "renovacion-libreta", "pesca-ribereña", "duplicado", "despacho"] },
    { id: "mercante", nombre: "Marino(a) Mercante", emoji: "🚢", recomendados: ["libreta-a", "renovacion-libreta", "tiempo-embarque", "duplicado", "despacho"] },
    { id: "recreo", nombre: "Dueño(a) de Embarcación de Recreo", emoji: "⛵", recomendados: ["libreta-c", "patron-yate", "inscripcion", "despacho", "permiso-navegacion"] },
    { id: "plataformas", nombre: "Trabajo en Plataformas", emoji: "🛢️", recomendados: ["libreta-d", "renovacion-libreta", "duplicado", "cambio-datos", "tiempo-embarque"] },
    { id: "puerto", nombre: "Trabajo en Puerto / Instalación", emoji: "🏗️", recomendados: ["proteccion-portuaria", "despacho", "delegado-honorario", "permiso-navegacion", "inscripcion"] },
    { id: "otra", nombre: "Otra actividad", emoji: "⚓", recomendados: ["libreta-a", "libreta-b", "libreta-c", "libreta-d", "renovacion-libreta"] }
];
