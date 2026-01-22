// Variables globales para la lógica de la ruleta
let estudiantesTotales = []; // Lista de todos los estudiantes cargados
let estudiantesDisponibles = []; // Lista de estudiantes que aún no han salido
let gradosSegmento = 0; // Grados por segmento de la ruleta
let gradosTotalesAcumulados = 0; // Para la animación de la ruleta

// Referencias a elementos del DOM
const inputArchivos = document.getElementById('archivosGrupos');
const infoCarga = document.getElementById('infoCarga');
const ruletaDiv = document.getElementById('ruleta');
const botonGirar = document.getElementById('botonGirar');
const historialSalida = document.getElementById('historialSalida');
const contadorRestante = document.getElementById('contadorRestante');
const botonReiniciar = document.getElementById('botonReiniciar');

// --- Funciones Principales ---

/**
 * 1. Maneja la carga de archivos de texto (.txt) y extrae los nombres de estudiantes.
 */
function cargarEstudiantes(event) {
    const archivos = event.target.files;
    estudiantesTotales = []; // Reiniciar la lista total
    let archivosCargados = 0;

    // Procesar cada archivo cargado
    Array.from(archivos).forEach(archivo => {
        const lector = new FileReader();

        lector.onload = function(e) {
            const contenido = e.target.result;
            // Separa por saltos de línea y filtra líneas vacías
            const estudiantesGrupo = contenido.split('\n')
                .map(nombre => nombre.trim())
                .filter(nombre => nombre.length > 0);

            // Añadir al total, incluyendo el nombre del archivo (grupo)
            const nombreGrupo = archivo.name.replace('.txt', '');
            estudiantesGrupo.forEach(estudiante => {
                estudiantesTotales.push({
                    nombre: estudiante,
                    grupo: nombreGrupo
                });
            });

            archivosCargados++;
            // Cuando todos los archivos han sido procesados, inicializar la ruleta
            if (archivosCargados === archivos.length) {
                inicializarRuleta();
            }
        };

        lector.readAsText(archivo, 'UTF-8');
    });

    infoCarga.textContent = `Archivos seleccionados: ${archivos.length}. Procesando...`;
}


/**
 * 2. Prepara la ruleta y las listas después de cargar los estudiantes.
 */
function inicializarRuleta() {
    // 1. Inicializar listas
    estudiantesDisponibles = [...estudiantesTotales]; // Copia profunda
    
    // 2. Actualizar el DOM
    generarSegmentosRuleta(estudiantesDisponibles);
    actualizarContador();
    
    // 3. Habilitar o deshabilitar botón
    if (estudiantesDisponibles.length > 0) {
        botonGirar.disabled = false;
        infoCarga.textContent = `✅ Grupos cargados: ${estudiantesTotales.length} estudiantes listos.`;
        historialSalida.innerHTML = '<p>Haga clic en "Girar Ruleta" para comenzar.</p>';
    } else {
        botonGirar.disabled = true;
        infoCarga.textContent = '❌ Error: No se encontraron estudiantes válidos en los archivos.';
        historialSalida.textContent = '';
    }
}

/**
 * 3. Dibuja los segmentos de la ruleta en el DOM.
 * @param {Array<Object>} lista - Lista de estudiantes a mostrar en la ruleta.
 */
function generarSegmentosRuleta(lista) {
    ruletaDiv.innerHTML = '<div class="puntero"></div>'; // Limpiar segmentos antiguos y mantener el puntero
    const totalEstudiantes = lista.length;
    if (totalEstudiantes === 0) return;

    gradosSegmento = 360 / totalEstudiantes;

    lista.forEach((estudiante, indice) => {
        const segmento = document.createElement('div');
        segmento.classList.add('segmento');
        
        // Estilos y propiedades matemáticas para el segmento
        const rotacion = indice * gradosSegmento;
        const color = `hsl(${rotacion}, 70%, 50%)`; // Asigna un color basado en el ángulo
        
        segmento.style.backgroundColor = color;
        segmento.style.transform = `rotate(${rotacion}deg)`;
        segmento.style.setProperty('--rotation', `${gradosSegmento / 2}deg`); // Para rotar el texto

        // Contenido del segmento (nombre y grupo)
        segmento.innerHTML = `<span>${estudiante.nombre} (${estudiante.grupo})</span>`;
        
        ruletaDiv.appendChild(segmento);
    });
}

/**
 * 4. Gira la ruleta, selecciona un estudiante sin repetición y actualiza el historial.
 */
function girarRuleta() {
    if (estudiantesDisponibles.length === 0) {
        alert("Todos los estudiantes han sido seleccionados. Por favor, reinicie la ruleta.");
        return;
    }

    // 1. Bloquear interacción
    botonGirar.disabled = true;
    ruletaDiv.style.pointerEvents = 'none'; // Prevenir clics durante el giro
    
    // 2. Elegir un índice aleatorio
    const indiceGanador = Math.floor(Math.random() * estudiantesDisponibles.length);
    const estudianteGanador = estudiantesDisponibles[indiceGanador];

    // 3. Calcular rotación necesaria para la animación
    const posicionGanador = estudiantesTotales.findIndex(e => e.nombre === estudianteGanador.nombre && e.grupo === estudianteGanador.grupo);
    
    // Calcular la rotación para centrar el segmento sobre el puntero (arriba)
    const anguloParaCentrar = 360 - (posicionGanador * gradosSegmento + gradosSegmento / 2);

    // Asegurar varias vueltas (al menos 5 vueltas completas)
    const vueltas = 5;
    const nuevaRotacion = gradosTotalesAcumulados + (vueltas * 360) + anguloParaCentrar;
    gradosTotalesAcumulados = nuevaRotacion; // Guardar la rotación total para el próximo giro

    // 4. Aplicar animación de giro
    ruletaDiv.style.transform = `rotate(${nuevaRotacion}deg)`;
    
    // 5. Mostrar resultado después de la animación (5 segundos)
    setTimeout(() => {
        // Eliminar al estudiante de la lista de disponibles
        estudiantesDisponibles.splice(indiceGanador, 1);
        
        // Actualizar el historial
        agregarAlHistorial(estudianteGanador);
        
        // Actualizar el contador y re-habilitar
        actualizarContador();
        
        if (estudiantesDisponibles.length > 0) {
             botonGirar.disabled = false;
        } else {
             botonGirar.disabled = true;
             alert("¡Todos los estudiantes han sido seleccionados!");
        }

        // 6. Regenerar los segmentos de la ruleta para reflejar solo los restantes
        generarSegmentosRuleta(estudiantesDisponibles);

        ruletaDiv.style.pointerEvents = 'auto'; // Permitir clics de nuevo

    }, 5000); // El tiempo debe coincidir con la transición CSS (5s)
}

/**
 * 5. Agrega el nombre del estudiante seleccionado al cuadro de texto del historial en orden ascendente (1, 2, 3...).
 * @param {Object} estudiante - El estudiante seleccionado.
 */
function agregarAlHistorial(estudiante) {
    // Si es el primer elemento, limpiar el mensaje inicial
    if (historialSalida.innerHTML.includes('Haga clic')) {
        // Limpiar el contenido previo, manteniendo la estructura HTML
        historialSalida.innerHTML = '';
    }
    
    // Crear un nuevo elemento para el turno
    const nuevoTurno = document.createElement('p');
    // La cuenta de turnos sigue siendo (Total - Disponibles)
    const numeroTurno = estudiantesTotales.length - estudiantesDisponibles.length; 
    nuevoTurno.innerHTML = `<strong>${numeroTurno}. ${estudiante.nombre}</strong> (Grupo: ${estudiante.grupo})`;
    
    // APLICAR CAMBIO: Usar appendChild para agregar al final del contenedor.
    historialSalida.appendChild(nuevoTurno); 
}

/**
 * 6. Reinicia el estado de la ruleta y las listas.
 */
function reiniciarRuleta() {
    if (confirm("¿Está seguro que desea reiniciar la ruleta? Se perderá el historial actual.")) {
        // Restablecer listas
        estudiantesDisponibles = [...estudiantesTotales];
        gradosTotalesAcumulados = 0; // Reiniciar rotación
        
        // Restablecer el DOM
        ruletaDiv.style.transform = `rotate(0deg)`;
        historialSalida.innerHTML = '<p>Haga clic en "Girar Ruleta" para comenzar.</p>';
        
        // Inicializar de nuevo (regenera segmentos y habilita botón)
        inicializarRuleta();
        
        alert("Ruleta reiniciada con éxito.");
    }
}

/**
 * 7. Actualiza el contador de estudiantes restantes.
 */
function actualizarContador() {
    contadorRestante.textContent = estudiantesDisponibles.length;
}

// --- Event Listeners ---

inputArchivos.addEventListener('change', cargarEstudiantes);
botonGirar.addEventListener('click', girarRuleta);
botonReiniciar.addEventListener('click', reiniciarRuleta);

// Inicialización
generarSegmentosRuleta([]); // Inicialmente vacía
actualizarContador();
