// Variables del DOM
const inputMinutos = document.getElementById('inputMinutos');
const setTimerButton = document.getElementById('setTimerButton');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const resetButton = document.getElementById('resetButton');
const countdownDisplay = document.getElementById('countdown');
const statusMessage = document.getElementById('statusMessage');
const grupoNombreInput = document.getElementById('grupoNombre');
const actividadDescripcionInput = document.getElementById('actividadDescripcion');
const displayGrupo = document.getElementById('displayGrupo');
const displayActividad = document.getElementById('displayActividad');

// Variables de Estado
let tiempoRestanteSegundos = 0; // Tiempo en segundos
let intervalID; // ID para controlar el setInterval
let isPaused = true;
const LS_TIME_KEY = 'activityTimerSeconds'; // Llave de LocalStorage

// --- Funciones de Utilidad ---

/**
 * Convierte segundos totales a formato HH:MM:SS.
 * @param {number} totalSeconds - Tiempo total en segundos.
 * @returns {string} Tiempo en formato HH:MM:SS.
 */
function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    // Función padding para asegurar dos dígitos (01, 10)
    const pad = (num) => String(num).padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Actualiza la interfaz del contador, guarda el tiempo en LocalStorage,
 * y aplica la alerta visual si el tiempo es crítico.
 */
function updateDisplay() {
    countdownDisplay.textContent = formatTime(tiempoRestanteSegundos);
    localStorage.setItem(LS_TIME_KEY, tiempoRestanteSegundos);
    
    // Actualizar la etiqueta de la actividad
    displayGrupo.textContent = grupoNombreInput.value;
    // CAMBIO AQUÍ: Usar innerHTML y reemplazar saltos de línea con <br>
    displayActividad.innerHTML = actividadDescripcionInput.value.replace(/\n/g, '<br>');
    
    // === LÓGICA DE ALERTA DE TIEMPO (5 MINUTOS = 300 SEGUNDOS) ===
    const tiempoCritico = 300; 

    if (tiempoRestanteSegundos <= tiempoCritico && tiempoRestanteSegundos > 0) {
        // Menos de 5 minutos: Aplicar clase CSS para la animación de pulso
        countdownDisplay.classList.add('alert-pulse');
        // Cambiar color a Naranja para que destaque del Rojo predeterminado
        countdownDisplay.style.color = '#ff9800'; 
    } else {
        // Más de 5 minutos o tiempo agotado: Retirar la alerta
        countdownDisplay.classList.remove('alert-pulse');
        // Restaurar el color Rojo predeterminado (definido en el CSS principal)
        countdownDisplay.style.color = '#dc3545'; 
    }
}

/**
 * Detiene el contador si está corriendo.
 */
function stopTimer() {
    clearInterval(intervalID);
    isPaused = true;
    startButton.textContent = '▶️ Iniciar';
    statusMessage.textContent = 'Detenido';
}

// --- Lógica del Temporizador ---

/**
 * 1. Establece y reinicia el tiempo del contador basado en el input en minutos.
 */
function setTimer() {
    stopTimer(); // Asegura que cualquier contador previo se detenga
    
    const minutos = parseInt(inputMinutos.value, 10);
    if (isNaN(minutos) || minutos <= 0) {
        alert("Por favor, ingrese un valor de minutos válido (mayor que 0).");
        return;
    }

    tiempoRestanteSegundos = minutos * 60;
    updateDisplay();
    statusMessage.textContent = 'Listo para Iniciar';
}

/**
 * 2. Inicia o reanuda el contador.
 */
function startTimer() {
    if (!isPaused || tiempoRestanteSegundos <= 0) {
        // Si ya está corriendo o el tiempo es cero, no hacemos nada.
        if (tiempoRestanteSegundos <= 0) {
             statusMessage.textContent = 'Tiempo Agotado. Por favor, establezca un nuevo tiempo.';
        }
        return;
    }

    isPaused = false;
    startButton.textContent = '▶️ Corriendo...';
    statusMessage.textContent = 'Corriendo';

    intervalID = setInterval(() => {
        if (tiempoRestanteSegundos > 0) {
            tiempoRestanteSegundos--;
            updateDisplay();
        } else {
            // Cuando el tiempo llega a cero
            stopTimer();
            statusMessage.textContent = '¡TIEMPO AGOTADO! ⏰';
            countdownDisplay.textContent = "00:00:00";
            // Asegurarse de quitar la alerta al finalizar
            countdownDisplay.classList.remove('alert-pulse');
        }
    }, 1000); // Se actualiza cada 1 segundo (1000ms)
}

/**
 * 3. Pausa el contador.
 */
function pauseTimer() {
    stopTimer();
    statusMessage.textContent = 'Pausado';
    startButton.textContent = '▶️ Continuar';
}

/**
 * 4. Reinicia el contador a cero y limpia LocalStorage.
 */
function resetTimerToZero() {
    stopTimer();
    tiempoRestanteSegundos = 0;
    localStorage.removeItem(LS_TIME_KEY);
    updateDisplay();
    statusMessage.textContent = 'Reiniciado a Cero';
}

/**
 * 5. Carga el tiempo guardado en LocalStorage al iniciar la página.
 */
function loadSavedTime() {
    const savedTime = localStorage.getItem(LS_TIME_KEY);
    if (savedTime !== null) {
        tiempoRestanteSegundos = parseInt(savedTime, 10);
    } else {
        // Cargar el valor inicial por defecto (15 minutos)
        tiempoRestanteSegundos = parseInt(inputMinutos.value, 10) * 60;
    }
    updateDisplay();
    // La alerta se aplica si el tiempo es crítico al cargar
    if(tiempoRestanteSegundos > 0 && tiempoRestanteSegundos <= 300) {
        pauseButton.textContent = 'Pausar';
        statusMessage.textContent = 'Pausado (Alerta)';
    } else {
         statusMessage.textContent = 'Listo para Iniciar';
    }
}


// --- Event Listeners ---

setTimerButton.addEventListener('click', setTimer);
startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimerToZero);

// Inicialización: Cargar el tiempo guardado al cargar la página
window.addEventListener('load', loadSavedTime);
