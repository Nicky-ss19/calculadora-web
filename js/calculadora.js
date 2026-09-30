/*
 * Calculadora Web - Tarea 2 de Programación Web (ITLA)
 * Hecha por Nicole Alejandra Santana Sánchez
 * Todo está escrito en JavaScript ES5 (var y function, nada de let, const ni flechas)
 */

// Nombre con el que guardo el historial en el localStorage
var CLAVE_HISTORIAL = 'historialCalculadora';

// Aquí voy guardando el estado de la calculadora
var numeroActual = '0';      // lo que se ve en la pantalla grande
var numeroAnterior = null;   // el primer número de la operación
var operadorActual = null;   // +, -, * o /
var empezarNuevo = false;    // si es true, el próximo número reemplaza lo que hay en pantalla
var huboError = false;       // se pone en true si alguien intenta dividir entre cero

// Símbolos bonitos para mostrar en pantalla
var SIMBOLOS = { '+': '+', '-': '−', '*': '×', '/': '÷' };

// Se llama cuando carga la página (onload del body)
function iniciarCalculadora() {
    actualizarPantalla();
    mostrarHistorial();
    document.addEventListener('keydown', manejarTeclado);
}

// ---------- Pantalla ----------

function actualizarPantalla() {
    var pantallaResultado = document.getElementById('resultado');
    var pantallaOperacion = document.getElementById('operacion');

    pantallaResultado.className = 'resultado';
    pantallaResultado.innerHTML = numeroActual;

    if (numeroAnterior !== null && operadorActual !== null) {
        pantallaOperacion.innerHTML = numeroAnterior + ' ' + SIMBOLOS[operadorActual];
    } else {
        pantallaOperacion.innerHTML = '';
    }

    marcarOperadorActivo();
}

// Pinta de otro color el botón del operador que está elegido
function marcarOperadorActivo() {
    var operadores = document.querySelectorAll('.tecla.operador');
    for (var i = 0; i < operadores.length; i++) {
        operadores[i].classList.remove('activo');
    }
    if (operadorActual !== null && empezarNuevo) {
        var indices = { '/': 0, '*': 1, '-': 2, '+': 3 };
        operadores[indices[operadorActual]].classList.add('activo');
    }
}

function mostrarError(mensaje) {
    var pantallaResultado = document.getElementById('resultado');
    pantallaResultado.innerHTML = mensaje;
    pantallaResultado.className = 'resultado error';
    document.getElementById('operacion').innerHTML = '';
    numeroActual = '0';
    numeroAnterior = null;
    operadorActual = null;
    empezarNuevo = true;
    huboError = true;
    marcarOperadorActivo();
}

// ---------- Botones ----------

function agregarNumero(digito) {
    if (empezarNuevo) {
        numeroActual = digito;
        empezarNuevo = false;
    } else if (numeroActual === '0') {
        numeroActual = digito;
    } else if (numeroActual.length < 15) {
        numeroActual = numeroActual + digito;
    }
    actualizarPantalla();
}

function agregarPunto() {
    if (empezarNuevo) {
        numeroActual = '0.';
        empezarNuevo = false;
    } else if (numeroActual.indexOf('.') === -1) {
        numeroActual = numeroActual + '.';
    }
    actualizarPantalla();
}

function elegirOperador(operador) {
    // Si ya había una operación pendiente, la resuelvo primero (ej: 2 + 3 + ...)
    if (operadorActual !== null && !empezarNuevo) {
        huboError = false;
        calcular();
        if (huboError) {
            return; // no sigo si hubo un error, por ejemplo dividir entre cero
        }
    }
    numeroAnterior = numeroActual;
    operadorActual = operador;
    empezarNuevo = true;
    actualizarPantalla();
}

function calcular() {
    if (operadorActual === null || numeroAnterior === null) {
        return; // no hay nada que calcular todavía
    }

    var a = parseFloat(numeroAnterior);
    var b = parseFloat(numeroActual);
    var resultado;

    if (operadorActual === '+') {
        resultado = a + b;
    } else if (operadorActual === '-') {
        resultado = a - b;
    } else if (operadorActual === '*') {
        resultado = a * b;
    } else if (operadorActual === '/') {
        if (b === 0) {
            mostrarError('No se puede dividir entre 0');
            return;
        }
        resultado = a / b;
    }

    // Esto evita cosas raras como 0.1 + 0.2 = 0.30000000000000004
    resultado = parseFloat(resultado.toFixed(10));

    var cuenta = numeroAnterior + ' ' + SIMBOLOS[operadorActual] + ' ' + numeroActual;
    guardarEnHistorial(cuenta, String(resultado));

    numeroActual = String(resultado);
    numeroAnterior = null;
    operadorActual = null;
    empezarNuevo = true;
    actualizarPantalla();
}

function limpiarTodo() {
    numeroActual = '0';
    numeroAnterior = null;
    operadorActual = null;
    empezarNuevo = false;
    actualizarPantalla();
}

function borrarUltimo() {
    if (empezarNuevo) {
        return;
    }
    if (numeroActual.length > 1) {
        numeroActual = numeroActual.substring(0, numeroActual.length - 1);
        if (numeroActual === '-') {
            numeroActual = '0';
        }
    } else {
        numeroActual = '0';
    }
    actualizarPantalla();
}

function cambiarSigno() {
    if (numeroActual === '0') {
        return;
    }
    if (numeroActual.charAt(0) === '-') {
        numeroActual = numeroActual.substring(1);
    } else {
        numeroActual = '-' + numeroActual;
    }
    actualizarPantalla();
}

// ---------- Historial con localStorage ----------

function obtenerHistorial() {
    try {
        var guardado = localStorage.getItem(CLAVE_HISTORIAL);
        return guardado ? JSON.parse(guardado) : [];
    } catch (error) {
        return [];
    }
}

function guardarHistorial(historial) {
    try {
        localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(historial));
    } catch (error) {
        console.log('No se pudo guardar el historial: ' + error);
    }
}

function guardarEnHistorial(cuenta, resultado) {
    var historial = obtenerHistorial();
    var ahora = new Date();

    historial.unshift({
        cuenta: cuenta,
        resultado: resultado,
        fecha: ahora.toLocaleDateString('es-DO') + ' ' + ahora.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
    });

    guardarHistorial(historial);
    mostrarHistorial();
}

function mostrarHistorial() {
    var historial = obtenerHistorial();
    var lista = document.getElementById('listaHistorial');
    var botonBorrar = document.getElementById('botonBorrarHistorial');

    lista.innerHTML = '';
    botonBorrar.disabled = historial.length === 0;

    if (historial.length === 0) {
        lista.innerHTML = '<li class="historial-vacio">Todavía no hay cálculos.<br>Haz una operación y aparecerá aquí.</li>';
        return;
    }

    for (var i = 0; i < historial.length; i++) {
        var item = document.createElement('li');
        item.className = 'item-historial';
        item.setAttribute('tabindex', '0');
        item.setAttribute('data-indice', i);
        item.innerHTML =
            '<div class="item-texto">' +
                '<div class="cuenta">' + historial[i].cuenta + ' =</div>' +
                '<div class="respuesta">' + historial[i].resultado + '</div>' +
                '<div class="fecha">' + historial[i].fecha + '</div>' +
            '</div>' +
            '<button class="quitar-item" title="Quitar este cálculo" aria-label="Quitar este cálculo">&times;</button>';

        item.onclick = usarResultado;
        item.onkeydown = function (evento) {
            if (evento.key === 'Enter') {
                usarResultado.call(this, evento);
            }
        };
        item.querySelector('.quitar-item').onclick = quitarDelHistorial;

        lista.appendChild(item);
    }
}

// Al tocar un cálculo del historial, su resultado pasa a la pantalla
function usarResultado() {
    var indice = parseInt(this.getAttribute('data-indice'), 10);
    var historial = obtenerHistorial();
    numeroActual = historial[indice].resultado;
    empezarNuevo = true;
    actualizarPantalla();
}

// Quita un solo cálculo del historial
function quitarDelHistorial(evento) {
    evento.stopPropagation(); // para que no se active usarResultado también
    var indice = parseInt(this.parentNode.getAttribute('data-indice'), 10);
    var historial = obtenerHistorial();
    historial.splice(indice, 1);
    guardarHistorial(historial);
    mostrarHistorial();
}

// Borra todo el historial, pero solo si el usuario lo confirma
function borrarHistorial() {
    if (confirm('¿Seguro que quieres borrar todo el historial?')) {
        localStorage.removeItem(CLAVE_HISTORIAL);
        mostrarHistorial();
    }
}

// ---------- Teclado de la computadora ----------

function manejarTeclado(evento) {
    var tecla = evento.key;

    // Si estoy parada en un item del historial, dejo que el Enter lo maneje él
    if (document.activeElement && document.activeElement.className === 'item-historial') {
        return;
    }

    if (tecla >= '0' && tecla <= '9') {
        agregarNumero(tecla);
    } else if (tecla === '.' || tecla === ',') {
        agregarPunto();
    } else if (tecla === '+' || tecla === '-' || tecla === '*' || tecla === '/') {
        evento.preventDefault();
        elegirOperador(tecla);
    } else if (tecla === 'Enter' || tecla === '=') {
        evento.preventDefault();
        calcular();
    } else if (tecla === 'Backspace') {
        borrarUltimo();
    } else if (tecla === 'Escape' || tecla === 'Delete') {
        limpiarTodo();
    }
}
