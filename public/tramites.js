// ==========================================
// CATÁLOGO DE TRÁMITES — SEMAR · UNAMAN
// Categorías con los nombres de la página
// oficial de UNAMAN. Cada trámite incluye
// traducción al inglés y campos agrupados
// por sección para el formato de solicitud.
// ==========================================

const CATEGORIAS = [
    { id: "certificacion", nombre: "Certificación de Documentos", nombreEn: "Certification of Documents", emoji: "📜" },
    { id: "libretas", nombre: "Documento de Identidad Marítima y Libreta de Mar", nombreEn: "Maritime Identity Document and Seaman's Book", emoji: "📔" },
    { id: "matriculas", nombre: "Matrículas, Abanderamiento y Dimensión de Bandera", nombreEn: "Ship Registry, Ensign and Flag Measurement", emoji: "⛵" },
    { id: "navegacion", nombre: "Navegación", nombreEn: "Navigation", emoji: "🧭" },
    { id: "titulos", nombre: "Títulos y Certificados de Gente de Mar", nombreEn: "Seafarer Titles and Certificates", emoji: "🎓" },
    { id: "proteccion", nombre: "Protección Portuaria", nombreEn: "Port Security (ISPS)", emoji: "🛡️" }
];

const TRAMITES = [
    // ---------- LIBRETA DE MAR ----------
    {
        id: "libreta-a",
        categoria: "libretas",
        nombre: "Libreta de Mar Tipo A — Marina Mercante",
        nombreEn: "Seaman's Book Type A — Merchant Marine",
        clave: "SEMAR-05-009-A",
        claveOficial: "SEMAR-05-009-A",
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
        vigencia: "5 años",
        vigenciaEn: "5 years",
        campos: [
            { id: "nombre", seccion: "solicitante", etiqueta: "Nombre completo", etiquetaEn: "Full name", pregunta: "¿Cuál es tu nombre completo, como aparece en tu acta de nacimiento?", preguntaEn: "What is your full name, as shown on your birth certificate?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP", etiquetaEn: "CURP", pregunta: "¿Cuál es tu CURP? Son 18 letras y números.", preguntaEn: "What is your CURP? It is an 18-character Mexican ID code.", ayuda: "La CURP está en tu acta de nacimiento o en tu INE. Mide 18 caracteres.", ayudaEn: "The CURP appears on your birth certificate or your INE ID. It is 18 characters long.", tipo: "curp", obligatorio: true },
            { id: "domicilio", seccion: "solicitante", etiqueta: "Domicilio para notificaciones", etiquetaEn: "Address for notifications", pregunta: "¿Cuál es tu domicilio completo? Calle, número, colonia, ciudad y estado.", preguntaEn: "What is your full address? Street, number, neighborhood, city and state.", tipo: "texto", obligatorio: true },
            { id: "ocupacion", seccion: "tramite", etiqueta: "Puesto o cargo a bordo", etiquetaEn: "Onboard position", pregunta: "¿Cuál es tu puesto o cargo a bordo? Por ejemplo: piloto, maquinista, marinero.", preguntaEn: "What is your position on board? For example: officer, engineer, sailor.", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", preguntaEn: "At which Harbor Master's Office (Capitanía de Puerto) will you submit this request?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true },
            { id: "correo", seccion: "solicitante", etiqueta: "Correo electrónico", etiquetaEn: "E-mail", pregunta: "¿Cuál es tu correo electrónico? Si no tienes, escribe \"no tengo\".", preguntaEn: "What is your e-mail address? If you do not have one, write \"no tengo\".", tipo: "correo", obligatorio: false }
        ]
    },
    {
        id: "libreta-b",
        categoria: "libretas",
        nombre: "Libreta de Mar Tipo B — Pesca",
        nombreEn: "Seaman's Book Type B — Fishing",
        clave: "SEMAR-05-009-B",
        enLinea: false,
        sinopsis: "Documento de identidad marítima para pescadores y tripulantes de embarcaciones pesqueras.",
        sinopsisEn: "Maritime identity document for fishermen and crew of fishing vessels.",
        requisitos: [
            "Acta de nacimiento",
            "CURP",
            "INE vigente",
            "Comprobante de domicilio",
            "Examen médico vigente",
            "Constancia de actividad pesquera",
            "2 fotografías tamaño credencial, fondo blanco",
            "Comprobante de pago de derechos"
        ],
        requisitosEn: [
            "Birth certificate",
            "CURP",
            "Valid INE ID",
            "Proof of address",
            "Valid medical examination",
            "Fishing activity certificate",
            "2 ID-size photographs, white background",
            "Proof of payment of fees"
        ],
        vigencia: "5 años",
        vigenciaEn: "5 years",
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
        nombre: "Libreta de Mar Tipo C — Recreo deportivo",
        nombreEn: "Seaman's Book Type C — Recreational",
        clave: "SEMAR-05-009-C",
        enLinea: false,
        sinopsis: "Documento de identidad marítima para quienes navegan embarcaciones de recreo deportivo o turismo.",
        sinopsisEn: "Maritime identity document for people who operate recreational or tourism vessels.",
        requisitos: [
            "Acta de nacimiento",
            "CURP",
            "INE vigente",
            "Comprobante de domicilio",
            "Examen médico vigente",
            "Título de Patrón de Embarcaciones de Recreo",
            "2 fotografías tamaño credencial, fondo blanco",
            "Comprobante de pago de derechos"
        ],
        requisitosEn: [
            "Birth certificate",
            "CURP",
            "Valid INE ID",
            "Proof of address",
            "Valid medical examination",
            "Recreational Vessel Master title",
            "2 ID-size photographs, white background",
            "Proof of payment of fees"
        ],
        vigencia: "5 años",
        vigenciaEn: "5 years",
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
        nombre: "Libreta de Mar Tipo D — Plataformas costa afuera",
        nombreEn: "Seaman's Book Type D — Offshore Platforms",
        clave: "SEMAR-05-009-D",
        enLinea: false,
        sinopsis: "Documento de identidad marítima para personal que trabaja en plataformas costa afuera.",
        sinopsisEn: "Maritime identity document for personnel working on offshore platforms.",
        requisitos: [
            "Acta de nacimiento",
            "CURP",
            "INE vigente",
            "Comprobante de domicilio",
            "Constancia de Situación Fiscal (RFC)",
            "Examen médico completo y vigente",
            "Curso de seguridad en plataformas costa afuera",
            "2 fotografías tamaño credencial, fondo blanco",
            "Comprobante de pago de derechos"
        ],
        requisitosEn: [
            "Birth certificate",
            "CURP",
            "Valid INE ID",
            "Proof of address",
            "Tax situation certificate (RFC)",
            "Complete and valid medical examination",
            "Offshore platform safety course",
            "2 ID-size photographs, white background",
            "Proof of payment of fees"
        ],
        vigencia: "5 años",
        vigenciaEn: "5 years",
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
        id: "renovacion-libreta",
        categoria: "libretas",
        nombre: "Renovación de Libreta de Mar",
        nombreEn: "Seaman's Book Renewal",
        clave: "SEMAR-05-009 (renovación)",
        clavesBusqueda: ["renovar", "renovar mi libreta", "mi libreta venció", "mi libreta esta vencida", "revalidar", "renovación", "renew"],
        enLinea: false,
        sinopsis: "Renueva tu libreta vigente o vencida. Tramítala 30 días antes de que venza.",
        sinopsisEn: "Renew your current or expired seaman's book. Start 30 days before it expires.",
        requisitos: [
            "Libreta anterior original",
            "CURP actualizada",
            "Identificación oficial vigente",
            "Comprobante de domicilio reciente",
            "Examen médico vigente",
            "2 fotografías tamaño credencial, fondo blanco",
            "Comprobante de pago de derechos"
        ],
        requisitosEn: [
            "Original previous seaman's book",
            "Updated CURP",
            "Valid official ID",
            "Recent proof of address",
            "Valid medical examination",
            "2 ID-size photographs, white background",
            "Proof of payment of fees"
        ],
        vigencia: "5 años",
        vigenciaEn: "5 years",
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
        id: "duplicado",
        categoria: "libretas",
        nombre: "Duplicado de Libreta por Pérdida o Robo",
        nombreEn: "Duplicate Seaman's Book for Loss or Theft",
        clave: "SEMAR-05-009 (duplicado)",
        clavesBusqueda: ["perdí mi libreta", "perdi mi libreta", "se me perdió", "se me perdio", "me la robaron", "me robaron", "extravié", "extravie", "duplicado", "pérdida", "perdida", "lost"],
        enLinea: false,
        sinopsis: "Si perdiste o te robaron tu libreta, tramita el duplicado. Entrega de 5 a 10 días hábiles.",
        sinopsisEn: "If you lost your seaman's book or it was stolen, request a duplicate. Delivery in 5 to 10 business days.",
        requisitos: [
            "Acta de nacimiento",
            "CURP",
            "Identificación oficial vigente",
            "Comprobante de domicilio",
            "Constancia de extravío o denuncia levantada ante autoridad",
            "2 fotografías tamaño credencial, fondo blanco",
            "Comprobante de pago de derechos"
        ],
        requisitosEn: [
            "Birth certificate",
            "CURP",
            "Valid official ID",
            "Proof of address",
            "Loss certificate or police report",
            "2 ID-size photographs, white background",
            "Proof of payment of fees"
        ],
        vigencia: "Misma vigencia de la libreta original",
        vigenciaEn: "Same validity as the original seaman's book",
        campos: [
            { id: "nombre", seccion: "solicitante", etiqueta: "Nombre completo", etiquetaEn: "Full name", pregunta: "¿Cuál es tu nombre completo?", preguntaEn: "What is your full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP", etiquetaEn: "CURP", pregunta: "¿Cuál es tu CURP? Son 18 letras y números.", preguntaEn: "What is your CURP? It is an 18-character Mexican ID code.", tipo: "curp", obligatorio: true },
            { id: "tipoLibreta", seccion: "tramite", etiqueta: "Tipo de libreta extraviada", etiquetaEn: "Lost seaman's book type", pregunta: "¿Qué tipo de libreta se te perdió o robaron? A, B, C o D.", preguntaEn: "Which type of seaman's book was lost or stolen? A, B, C or D.", tipo: "texto", obligatorio: true },
            { id: "motivo", seccion: "tramite", etiqueta: "Motivo del duplicado", etiquetaEn: "Reason for duplicate", pregunta: "¿Fue pérdida o robo? Con esto te recuerdo si necesitas presentar denuncia.", preguntaEn: "Was it lost or stolen? This tells you whether you need a police report.", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", preguntaEn: "At which Harbor Master's Office will you submit this request?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true },
            { id: "correo", seccion: "solicitante", etiqueta: "Correo electrónico", etiquetaEn: "E-mail", pregunta: "¿Cuál es tu correo electrónico? Opcional.", preguntaEn: "What is your e-mail address? Optional.", tipo: "correo", obligatorio: false }
        ]
    },
    {
        id: "cambio-datos",
        categoria: "libretas",
        nombre: "Actualización de Domicilio o Datos en Libreta",
        nombreEn: "Address or Data Update in Seaman's Book",
        clave: "SEMAR-05-009 (actualización)",
        enLinea: false,
        sinopsis: "Actualiza tu domicilio o datos personales en tu libreta de mar.",
        sinopsisEn: "Update your address or personal data in your seaman's book.",
        requisitos: [
            "Libreta de mar original",
            "CURP actualizada",
            "Nuevo comprobante de domicilio (menos de 3 meses)",
            "Comprobante de pago si aplica"
        ],
        requisitosEn: [
            "Original seaman's book",
            "Updated CURP",
            "New proof of address (less than 3 months old)",
            "Proof of payment if applicable"
        ],
        vigencia: "No aplica",
        vigenciaEn: "Not applicable",
        campos: [
            { id: "nombre", seccion: "solicitante", etiqueta: "Nombre completo", etiquetaEn: "Full name", pregunta: "¿Cuál es tu nombre completo?", preguntaEn: "What is your full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP", etiquetaEn: "CURP", pregunta: "¿Cuál es tu CURP? Son 18 letras y números.", preguntaEn: "What is your CURP? It is an 18-character Mexican ID code.", tipo: "curp", obligatorio: true },
            { id: "cambioTipo", seccion: "tramite", etiqueta: "Dato a actualizar", etiquetaEn: "Data to update", pregunta: "¿Qué dato vas a actualizar? Domicilio, teléfono, estado civil...", preguntaEn: "Which data do you want to update? Address, phone, marital status...", tipo: "texto", obligatorio: true },
            { id: "datoNuevo", seccion: "tramite", etiqueta: "Dato nuevo", etiquetaEn: "New data", pregunta: "¿Cuál es el dato nuevo? Escríbelo completo.", preguntaEn: "What is the new data? Write it in full.", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", preguntaEn: "At which Harbor Master's Office will you submit this request?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },

    // ---------- CERTIFICACIÓN DE DOCUMENTOS ----------
    {
        id: "tiempo-embarque",
        categoria: "certificacion",
        nombre: "Certificación de Constancia de Tiempo de Embarque",
        nombreEn: "Certification of Sea Service Record",
        clave: "SEMAR-05-006-A",
        claveOficial: "SEMAR-05-006-A",
        enLinea: false,
        sinopsis: "Constancia oficial certificada de los días navegados, necesaria para ascensos y exámenes de capacidad.",
        sinopsisEn: "Official certified record of days sailed, required for promotions and competency exams.",
        requisitos: [
            "Libreta de mar vigente",
            "Bitácoras o cartas de embarco de cada viaje",
            "Identificación oficial",
            "Solicitud firmada"
        ],
        requisitosEn: [
            "Valid seaman's book",
            "Logbooks or embarkation letters for each voyage",
            "Official ID",
            "Signed request"
        ],
        vigencia: "No aplica",
        vigenciaEn: "Not applicable",
        campos: [
            { id: "nombre", seccion: "solicitante", etiqueta: "Nombre completo", etiquetaEn: "Full name", pregunta: "¿Cuál es tu nombre completo?", preguntaEn: "What is your full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP", etiquetaEn: "CURP", pregunta: "¿Cuál es tu CURP? Son 18 letras y números.", preguntaEn: "What is your CURP? It is an 18-character Mexican ID code.", tipo: "curp", obligatorio: true },
            { id: "numLibreta", seccion: "tramite", etiqueta: "Folio de la libreta de mar", etiquetaEn: "Seaman's book number", pregunta: "¿Cuál es el folio de tu libreta de mar?", preguntaEn: "What is your seaman's book number?", tipo: "texto", obligatorio: true },
            { id: "periodo", seccion: "tramite", etiqueta: "Periodo solicitado", etiquetaEn: "Requested period", pregunta: "¿De qué periodo necesitas la constancia? Por ejemplo: de enero de 2023 a diciembre de 2025.", preguntaEn: "Which period do you need the record for? For example: from January 2023 to December 2025.", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", preguntaEn: "At which Harbor Master's Office will you submit this request?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },

    // ---------- MATRÍCULAS Y ABANDERAMIENTO ----------
    {
        id: "inscripcion",
        categoria: "matriculas",
        nombre: "Certificado de Matrícula e Inscripción de Embarcación",
        nombreEn: "Ship Registry Certificate and Vessel Registration",
        clave: "SEMAR-05-008",
        claveOficial: "SEMAR-05-008",
        clavesBusqueda: ["inscribir", "inscripción", "matricular", "matrícula", "compré una embarcación", "bote nuevo", "register"],
        enLinea: false,
        sinopsis: "Registra tu embarcación nueva o recién comprada en el Registro Público Marítimo Nacional y obtén su matrícula.",
        sinopsisEn: "Register your new or recently purchased vessel in the National Maritime Public Registry and obtain its registry certificate.",
        requisitos: [
            "Solicitud firmada",
            "Título de propiedad o documento de compraventa",
            "Identificación del propietario",
            "Comprobante de domicilio",
            "Póliza de seguro vigente",
            "Comprobante de pago de derechos"
        ],
        requisitosEn: [
            "Signed request",
            "Ownership title or bill of sale",
            "Owner's ID",
            "Proof of address",
            "Valid insurance policy",
            "Proof of payment of fees"
        ],
        vigencia: "Permanente, con documentos complementarios vigentes",
        vigenciaEn: "Permanent, with complementary documents kept valid",
        campos: [
            { id: "nombrePropietario", seccion: "solicitante", etiqueta: "Nombre del propietario", etiquetaEn: "Owner's name", pregunta: "¿Cuál es el nombre completo del propietario?", preguntaEn: "What is the owner's full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP del propietario", etiquetaEn: "Owner's CURP", pregunta: "¿Cuál es su CURP? Son 18 letras y números.", preguntaEn: "What is the owner's CURP? It is an 18-character Mexican ID code.", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la embarcación", etiquetaEn: "Vessel name", pregunta: "¿Qué nombre llevará la embarcación?", preguntaEn: "What name will the vessel have?", tipo: "texto", obligatorio: true },
            { id: "tipoEmbarcacion", seccion: "embarcacion", etiqueta: "Tipo de embarcación", etiquetaEn: "Vessel type", pregunta: "¿Qué tipo de embarcación es? Velero, lancha, yate, panga...", preguntaEn: "What type of vessel is it? Sailboat, motorboat, yacht, panga...", tipo: "texto", obligatorio: true },
            { id: "eslora", seccion: "embarcacion", etiqueta: "Eslora", etiquetaEn: "Length overall", pregunta: "¿Cuánto mide de largo (eslora)? Por ejemplo: 7.5 metros.", preguntaEn: "How long is it (length overall)? For example: 7.5 meters.", tipo: "texto", obligatorio: true },
            { id: "motor", seccion: "embarcacion", etiqueta: "Motor", etiquetaEn: "Engine", pregunta: "¿Qué motor tiene? Marca y potencia, o \"velero sin motor\".", preguntaEn: "What engine does it have? Brand and power, or \"sailboat without engine\".", tipo: "texto", obligatorio: true },
            { id: "puertoBase", seccion: "embarcacion", etiqueta: "Puerto de base", etiquetaEn: "Home port", pregunta: "¿En qué puerto tendrá su base?", preguntaEn: "Which port will be its home port?", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", preguntaEn: "At which Harbor Master's Office will you submit this request?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },

    // ---------- NAVEGACIÓN ----------
    {
        id: "despacho",
        categoria: "navegacion",
        nombre: "Despacho de Embarcaciones o Artefactos Navales",
        nombreEn: "Vessel Clearance (Despacho)",
        clave: "SEMAR-05-018",
        claveOficial: "SEMAR-05-018",
        clavesBusqueda: ["despacho", "despachar", "zarpar", "salida a navegar", "despacho de embarcación", "clearance"],
        enLinea: true,
        portal: "https://www.gob.mx/semar/unaman",
        sinopsis: "Trámite obligatorio antes de zarpar. Se puede iniciar en línea y concluir en la Capitanía.",
        sinopsisEn: "Mandatory procedure before departing. It can be started online and completed at the Harbor Master's Office.",
        requisitos: [
            "Matrícula y documentos vigentes de la embarcación",
            "Libretas de mar vigentes del patrón y toda la tripulación",
            "Identificación oficial de cada miembro",
            "Lista de tripulantes firmada",
            "Comprobante de pago de derechos"
        ],
        requisitosEn: [
            "Vessel registry certificate and valid documents",
            "Valid seaman's books for the master and all crew",
            "Official ID for each crew member",
            "Signed crew list",
            "Proof of payment of fees"
        ],
        vigencia: "Por cada viaje",
        vigenciaEn: "Per voyage",
        campos: [
            { id: "nombrePatron", seccion: "solicitante", etiqueta: "Nombre del patrón", etiquetaEn: "Master's name", pregunta: "¿Cuál es el nombre completo del patrón del viaje?", preguntaEn: "What is the voyage master's full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP del patrón", etiquetaEn: "Master's CURP", pregunta: "¿Cuál es la CURP del patrón? Son 18 letras y números.", preguntaEn: "What is the master's CURP? It is an 18-character Mexican ID code.", tipo: "curp", obligatorio: true },
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
        id: "permiso-navegacion",
        categoria: "navegacion",
        nombre: "Permiso de Navegación Interior",
        nombreEn: "Inland Navigation Permit",
        clave: "SEMAR-05-017",
        claveOficial: "SEMAR-05-017",
        enLinea: true,
        portal: "https://www.gob.mx/semar/unaman",
        sinopsis: "Para navegar en aguas interiores (lagunas, ríos, bahías) con fines deportivos o comerciales.",
        sinopsisEn: "For navigating inland waters (lagoons, rivers, bays) for sports or commercial purposes.",
        requisitos: [
            "Identificación oficial del solicitante",
            "Matrícula o documento de la embarcación",
            "Lista de tripulantes",
            "Comprobante de pago de derechos"
        ],
        requisitosEn: [
            "Applicant's official ID",
            "Vessel registry certificate or document",
            "Crew list",
            "Proof of payment of fees"
        ],
        vigencia: "Según el permiso otorgado",
        vigenciaEn: "As stated in the permit",
        campos: [
            { id: "nombre", seccion: "solicitante", etiqueta: "Nombre completo", etiquetaEn: "Full name", pregunta: "¿Cuál es tu nombre completo?", preguntaEn: "What is your full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP", etiquetaEn: "CURP", pregunta: "¿Cuál es tu CURP? Son 18 letras y números.", preguntaEn: "What is your CURP? It is an 18-character Mexican ID code.", tipo: "curp", obligatorio: true },
            { id: "nombreEmbarcacion", seccion: "embarcacion", etiqueta: "Nombre de la embarcación", etiquetaEn: "Vessel name", pregunta: "¿Cómo se llama tu embarcación?", preguntaEn: "What is your vessel's name?", tipo: "texto", obligatorio: true },
            { id: "zonaNavegacion", seccion: "tramite", etiqueta: "Zona de navegación", etiquetaEn: "Navigation area", pregunta: "¿En qué zona o cuerpo de agua vas a navegar?", preguntaEn: "In which area or body of water will you navigate?", tipo: "texto", obligatorio: true },
            { id: "proposito", seccion: "tramite", etiqueta: "Propósito", etiquetaEn: "Purpose", pregunta: "¿Para qué vas a usar el permiso? Deporte, turismo, trabajo...", preguntaEn: "What will you use the permit for? Sports, tourism, work...", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", preguntaEn: "At which Harbor Master's Office will you submit this request?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "regata",
        categoria: "navegacion",
        nombre: "Autorización de Regatas y Competencias Náuticas",
        nombreEn: "Authorization for Regattas and Nautical Competitions",
        clave: "SEMAR-05-017 (evento)",
        enLinea: true,
        portal: "https://www.gob.mx/semar/unaman",
        sinopsis: "Autorización para organizar regatas, veleros o competencias náuticas.",
        sinopsisEn: "Authorization to organize regattas, sailing events or nautical competitions.",
        requisitos: [
            "Solicitud del club u organizador",
            "Ruta y fecha del evento",
            "Lista de participantes y embarcaciones",
            "Plan de seguridad del evento"
        ],
        requisitosEn: [
            "Request from the club or organizer",
            "Event route and date",
            "List of participants and vessels",
            "Event safety plan"
        ],
        vigencia: "Por evento",
        vigenciaEn: "Per event",
        campos: [
            { id: "organizacion", seccion: "tramite", etiqueta: "Organización", etiquetaEn: "Organization", pregunta: "¿Quién organiza el evento? Club, asociación o persona.", preguntaEn: "Who is organizing the event? Club, association or person.", tipo: "texto", obligatorio: true },
            { id: "responsable", seccion: "solicitante", etiqueta: "Responsable del evento", etiquetaEn: "Event manager", pregunta: "¿Quién es el responsable del evento?", preguntaEn: "Who is the person in charge of the event?", tipo: "texto", obligatorio: true },
            { id: "nombreEvento", seccion: "tramite", etiqueta: "Nombre del evento", etiquetaEn: "Event name", pregunta: "¿Cómo se llama la regata o competencia?", preguntaEn: "What is the name of the regatta or competition?", tipo: "texto", obligatorio: true },
            { id: "fechaEvento", seccion: "tramite", etiqueta: "Fecha del evento", etiquetaEn: "Event date", pregunta: "¿Qué fecha se realizará? Por ejemplo: 5 de diciembre de 2026.", preguntaEn: "On what date will it take place? For example: December 5, 2026.", tipo: "texto", obligatorio: true },
            { id: "zonaEvento", seccion: "tramite", etiqueta: "Zona del evento", etiquetaEn: "Event area", pregunta: "¿En qué zona se realizará? Bahía, mar abierto, laguna...", preguntaEn: "In which area will it take place? Bay, open sea, lagoon...", tipo: "texto", obligatorio: true },
            { id: "numParticipantes", seccion: "tramite", etiqueta: "Participantes", etiquetaEn: "Participants", pregunta: "¿Cuántas embarcaciones y participantes aproximadamente?", preguntaEn: "About how many vessels and participants?", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", preguntaEn: "At which Harbor Master's Office will you submit this request?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },

    // ---------- TÍTULOS Y CERTIFICADOS DE GENTE DE MAR ----------
    {
        id: "patron-yate",
        categoria: "titulos",
        nombre: "Título de Patrón de Embarcaciones de Recreo",
        nombreEn: "Recreational Vessel Master Title",
        clave: "SEMAR-05-011",
        enLinea: false,
        sinopsis: "Certificado que habilita para gobernar embarcaciones de recreo hasta cierta distancia de la costa.",
        sinopsisEn: "Certificate that qualifies you to operate recreational vessels up to a certain distance from shore.",
        requisitos: [
            "Acta de nacimiento",
            "CURP",
            "INE vigente",
            "Comprobante de domicilio",
            "Examen médico vigente",
            "Certificado de curso de patrón de yate (escuela autorizada)",
            "2 fotografías tamaño credencial, fondo blanco",
            "Comprobante de pago de derechos"
        ],
        requisitosEn: [
            "Birth certificate",
            "CURP",
            "Valid INE ID",
            "Proof of address",
            "Valid medical examination",
            "Yacht master course certificate (authorized school)",
            "2 ID-size photographs, white background",
            "Proof of payment of fees"
        ],
        vigencia: "5 años",
        vigenciaEn: "5 years",
        campos: [
            { id: "nombre", seccion: "solicitante", etiqueta: "Nombre completo", etiquetaEn: "Full name", pregunta: "¿Cuál es tu nombre completo?", preguntaEn: "What is your full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP", etiquetaEn: "CURP", pregunta: "¿Cuál es tu CURP? Son 18 letras y números.", preguntaEn: "What is your CURP? It is an 18-character Mexican ID code.", tipo: "curp", obligatorio: true },
            { id: "curso", seccion: "tramite", etiqueta: "Curso de patrón", etiquetaEn: "Master course", pregunta: "¿Dónde tomaste tu curso de patrón de yate?", preguntaEn: "Where did you take your yacht master course?", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", preguntaEn: "At which Harbor Master's Office will you submit this request?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true },
            { id: "correo", seccion: "solicitante", etiqueta: "Correo electrónico", etiquetaEn: "E-mail", pregunta: "¿Cuál es tu correo electrónico? Opcional.", preguntaEn: "What is your e-mail address? Optional.", tipo: "correo", obligatorio: false }
        ]
    },
    {
        id: "pesca-ribereña",
        categoria: "titulos",
        nombre: "Tarjeta de Control de Pesca Ribereña",
        nombreEn: "Coastal Fishing Control Card",
        clave: "SEMAR-05-013",
        enLinea: false,
        sinopsis: "Tarjeta para pescadores ribereños que faenan en embarcaciones menores.",
        sinopsisEn: "Card for coastal fishermen working on small vessels.",
        requisitos: [
            "Libreta de mar tipo B vigente",
            "Identificación oficial",
            "Permiso o concesión de pesca (si aplica)",
            "Datos de la embarcación en que faenas",
            "Comprobante de pago si aplica"
        ],
        requisitosEn: [
            "Valid type B seaman's book",
            "Official ID",
            "Fishing permit or concession (if applicable)",
            "Details of the vessel you work on",
            "Proof of payment if applicable"
        ],
        vigencia: "Según la vigencia del permiso de pesca",
        vigenciaEn: "Same validity as the fishing permit",
        campos: [
            { id: "nombre", seccion: "solicitante", etiqueta: "Nombre completo", etiquetaEn: "Full name", pregunta: "¿Cuál es tu nombre completo?", preguntaEn: "What is your full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP", etiquetaEn: "CURP", pregunta: "¿Cuál es tu CURP? Son 18 letras y números.", preguntaEn: "What is your CURP? It is an 18-character Mexican ID code.", tipo: "curp", obligatorio: true },
            { id: "numLibreta", seccion: "tramite", etiqueta: "Folio de la libreta tipo B", etiquetaEn: "Type B seaman's book number", pregunta: "¿Cuál es el folio de tu libreta tipo B?", preguntaEn: "What is your type B seaman's book number?", tipo: "texto", obligatorio: true },
            { id: "embarcacion", seccion: "embarcacion", etiqueta: "Embarcación donde faena", etiquetaEn: "Vessel you work on", pregunta: "¿En qué embarcación faenas? Nombre y matrícula.", preguntaEn: "Which vessel do you work on? Name and registry number.", tipo: "texto", obligatorio: true },
            { id: "especie", seccion: "tramite", etiqueta: "Especies que captura", etiquetaEn: "Species caught", pregunta: "¿Qué especies capturas principalmente?", preguntaEn: "Which species do you mainly catch?", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", preguntaEn: "At which Harbor Master's Office will you submit this request?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },

    // ---------- PROTECCIÓN PORTUARIA ----------
    {
        id: "proteccion-portuaria",
        categoria: "proteccion",
        nombre: "Trámite de Protección Portuaria (código PBIP/ISPS)",
        nombreEn: "Port Security Procedure (ISPS Code)",
        clave: "SEMAR-05-030",
        enLinea: true,
        portal: "https://www.gob.mx/semar/unaman",
        sinopsis: "Autorizaciones e inspecciones de protección portuaria: acceso a puerto, protección de instalaciones y buques.",
        sinopsisEn: "Port security authorizations and inspections: port access, facility and ship security.",
        requisitos: [
            "Identificación oficial del solicitante",
            "Documento que acredite la relación con el buque o instalación",
            "Formulario de protección portuaria (la Capitanía lo proporciona)",
            "Comprobante de pago si aplica"
        ],
        requisitosEn: [
            "Applicant's official ID",
            "Document proving the relationship with the ship or facility",
            "Port security form (provided by the Harbor Master's Office)",
            "Proof of payment if applicable"
        ],
        vigencia: "Según el tipo de autorización",
        vigenciaEn: "As stated in the authorization",
        campos: [
            { id: "nombre", seccion: "solicitante", etiqueta: "Nombre completo", etiquetaEn: "Full name", pregunta: "¿Cuál es tu nombre completo?", preguntaEn: "What is your full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP", etiquetaEn: "CURP", pregunta: "¿Cuál es tu CURP? Son 18 letras y números.", preguntaEn: "What is your CURP? It is an 18-character Mexican ID code.", tipo: "curp", obligatorio: true },
            { id: "empresa", seccion: "tramite", etiqueta: "Empresa o instalación", etiquetaEn: "Company or facility", pregunta: "¿Qué empresa o instalación portuaria representa?", preguntaEn: "Which company or port facility do you represent?", tipo: "texto", obligatorio: true },
            { id: "tipoTramite", seccion: "tramite", etiqueta: "Tipo de trámite", etiquetaEn: "Procedure type", pregunta: "¿Qué tipo de trámite de protección portuaria necesitas? Acceso, inspección, protección de instalación...", preguntaEn: "What kind of port security procedure do you need? Access, inspection, facility security...", tipo: "texto", obligatorio: true },
            { id: "buque", seccion: "embarcacion", etiqueta: "Buque o instalación", etiquetaEn: "Ship or facility", pregunta: "¿Para qué buque o instalación es? Nombre o código.", preguntaEn: "Which ship or facility is it for? Name or code.", tipo: "texto", obligatorio: true },
            { id: "capitania", seccion: "tramite", etiqueta: "Capitanía de Puerto", etiquetaEn: "Harbor Master's Office", pregunta: "¿En qué Capitanía de Puerto vas a presentar tu trámite?", preguntaEn: "At which Harbor Master's Office will you submit this request?", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true }
        ]
    },
    {
        id: "delegado-honorario",
        categoria: "proteccion",
        nombre: "Solicitud de Delegado Honorario de Marina Mercante",
        nombreEn: "Honorary Merchant Marine Delegate Application",
        clave: "SEMAR-05-032",
        enLinea: true,
        portal: "https://www.gob.mx/semar/unaman",
        sinopsis: "Postulación como Delegado Honorario de Marina Mercante en puertos sin Capitanía.",
        sinopsisEn: "Application to serve as Honorary Merchant Marine Delegate in ports without a Harbor Master's Office.",
        requisitos: [
            "Solicitud dirigida a la Autoridad Marítima Nacional",
            "Copia de identificación oficial",
            "CURP",
            "Comprobante de domicilio de la localidad",
            "Carta de antecedentes o cartas de recomendación de la comunidad",
            "Currículum breve"
        ],
        requisitosEn: [
            "Request addressed to the National Maritime Authority",
            "Copy of official ID",
            "CURP",
            "Proof of address in the locality",
            "Background letter or community recommendation letters",
            "Short résumé"
        ],
        vigencia: "Por designación",
        vigenciaEn: "Per appointment",
        campos: [
            { id: "nombre", seccion: "solicitante", etiqueta: "Nombre completo", etiquetaEn: "Full name", pregunta: "¿Cuál es tu nombre completo?", preguntaEn: "What is your full name?", tipo: "texto", obligatorio: true },
            { id: "curp", seccion: "solicitante", etiqueta: "CURP", etiquetaEn: "CURP", pregunta: "¿Cuál es tu CURP? Son 18 letras y números.", preguntaEn: "What is your CURP? It is an 18-character Mexican ID code.", tipo: "curp", obligatorio: true },
            { id: "localidad", seccion: "tramite", etiqueta: "Localidad", etiquetaEn: "Locality", pregunta: "¿En qué localidad o puerto serías Delegado Honorario?", preguntaEn: "In which locality or port would you serve as Honorary Delegate?", tipo: "texto", obligatorio: true },
            { id: "motivacion", seccion: "tramite", etiqueta: "Motivación", etiquetaEn: "Motivation", pregunta: "En pocas palabras, ¿por qué quieres ser Delegado Honorario?", preguntaEn: "In a few words, why do you want to be an Honorary Delegate?", tipo: "texto", obligatorio: true },
            { id: "experiencia", seccion: "tramite", etiqueta: "Experiencia marítima", etiquetaEn: "Maritime experience", pregunta: "¿Qué experiencia marítima tienes? Estudios, trabajo en el mar, cargo en la comunidad.", preguntaEn: "What maritime experience do you have? Studies, work at sea, community roles.", tipo: "texto", obligatorio: true },
            { id: "telefono", seccion: "solicitante", etiqueta: "Teléfono", etiquetaEn: "Phone", pregunta: "¿A qué teléfono te pueden llamar? 10 dígitos.", preguntaEn: "What phone number can they call? 10 digits.", tipo: "telefono", obligatorio: true },
            { id: "correo", seccion: "solicitante", etiqueta: "Correo electrónico", etiquetaEn: "E-mail", pregunta: "¿Cuál es tu correo electrónico? Opcional.", preguntaEn: "What is your e-mail address? Optional.", tipo: "correo", obligatorio: false }
        ]
    }
];
