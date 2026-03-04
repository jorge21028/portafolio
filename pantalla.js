const datos = JSON.parse(localStorage.getItem("datosClase"));

if (!datos) {
    alert("No hay datos disponibles.");
    window.close();
}

// Formato 12 horas
function formatearHora12(hora24) {
    const partes = hora24.split(":");
    let horas = parseInt(partes[0]);
    let minutos = partes[1];

    let ampm = horas >= 12 ? "PM" : "AM";
    horas = horas % 12;
    horas = horas ? horas : 12;

    return `${horas}:${minutos} ${ampm}`;
}

document.getElementById("profesor").textContent = datos.profesor;
document.getElementById("asignatura").textContent = datos.asignatura;
document.getElementById("centro").textContent = datos.centro;
const horaFormateada = formatearHora12(datos.horaInicio);
document.getElementById("hora").innerHTML =
    'Iniciamos a las <span class="hora-destacada">' + horaFormateada + '</span>';
document.getElementById("logo").src = datos.logo;

// Cronómetro
function calcularTiempoRestante() {

    const ahora = new Date();

    const partes = datos.horaInicio.split(":");
    const inicio = new Date();
    inicio.setHours(parseInt(partes[0]));
    inicio.setMinutes(parseInt(partes[1]));
    inicio.setSeconds(0);

    const diferencia = inicio - ahora;

    if (diferencia <= 0) {
        document.getElementById("cronometro").textContent = "INICIANDO...";
        return;
    }

    const minutos = Math.floor(diferencia / 60000);
    const segundos = Math.floor((diferencia % 60000) / 1000);

    const tiempo = `${String(minutos).padStart(2,"0")}:${String(segundos).padStart(2,"0")}`;

    const cronometro = document.getElementById("cronometro");
    cronometro.textContent = tiempo;

    if (minutos <= 5) {
        cronometro.style.color = "#ff4444";
    }
}

setInterval(calcularTiempoRestante,1000);
calcularTiempoRestante();

// Audio
const audio = new Audio("Musica.mp3");
audio.loop = true;
audio.volume = 0.5;

audio.play().catch(()=>{
    document.body.addEventListener("click",()=>{
        audio.play();
    },{once:true});
});

// Pantalla completa
const btnFull = document.getElementById("btnFull");

btnFull.addEventListener("click",()=>{
    if(!document.fullscreenElement){
        document.documentElement.requestFullscreen();
    }else{
        document.exitFullscreen();
    }
});

document.addEventListener("fullscreenchange",()=>{
    if(document.fullscreenElement){
        btnFull.style.display="none";
    }else{
        btnFull.style.display="block";
    }
});