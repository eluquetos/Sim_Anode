// --- Funciones Auxiliares ---

/**
 * Obtiene el valor numérico de un campo de entrada.
 * @param {string} id - El ID del elemento input.
 * @returns {number} El valor como número, o 0 si está vacío o no es válido.
 */
function getValue(id) {
    const value = document.getElementById(id).value;
    return parseFloat(value) || 0;
}

/**
 * Establece el texto de un elemento de resultado, formateado a 3 decimales.
 * @param {string} id - El ID del elemento span de resultado.
 * @param {number} value - El valor numérico a mostrar.
 */
function setResult(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = value.toFixed(3);
        el.classList.remove('warning-text');
    }
}

/**
 * Establece el valor de un reóstato. Si es negativo, aplica estilo de advertencia.
 * @param {string} id - El ID del elemento span de resultado.
 * @param {number} value - El valor numérico calculado.
 * @returns {boolean} - Devuelve true si el valor es negativo, false en caso contrario.
 */
function setRheostatValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return false;

    el.textContent = value.toFixed(3);
    if (value < 0) {
        el.classList.add('warning-text');
        return true; // Hay un error (valor negativo)
    } else {
        el.classList.remove('warning-text');
        return false; // Valor OK
    }
}

/**
 * Muestra un mensaje de estado.
 * @param {string} message - El mensaje a mostrar.
 * @param {boolean} isError - Si es un mensaje de error.
 */
function setStatus(message, isError = false) {
    const el = document.getElementById('status-message');
    el.textContent = message;
    if (isError) {
        el.className = 'mt-4 text-center text-sm font-bold text-red-600';
    } else {
        el.className = 'mt-4 text-center text-sm font-medium text-green-700';
    }
}

// --- Función Principal de Cálculo ---

function calculateSystem() {
    let hasNegativeRheostat = false;
    setStatus(''); // Limpiar estado previo

    // 1. Obtener Entradas
    const I_subr = getValue('i_subr');
    
    const Ra_31 = getValue('ra_31');
    const Ra_32 = getValue('ra_32');
    const Rc_3 = getValue('rc_3');

    const Ra_21 = getValue('ra_21');
    const Ra_22 = getValue('ra_22');
    const Rc_2 = getValue('rc_2');

    const Ra_11 = getValue('ra_11');
    const Ra_12 = getValue('ra_12');
    const Rc_1 = getValue('rc_1');

    if (I_subr === 0) {
        setStatus('La corriente (I_subr) no puede ser cero.', true);
        return;
    }

    // 2. Cálculos (de r=3 a r=1)

    // --- RAMA 3 (Más lejana) ---
    let Reo_31 = 0;
    let Reo_32 = 0;

    if (Ra_31 > Ra_32) {
        Reo_32 = Ra_31 - Ra_32;
    } else if (Ra_32 > Ra_31) {
        Reo_31 = Ra_32 - Ra_31;
    }
    
    const R_s31 = Ra_31 + Reo_31;
    const R_p3 = R_s31 / 2;
    const R_3 = R_p3 + Rc_3;
    const V_3 = R_3 * (2 * I_subr);

    // --- RAMA 2 ---
    const V_n2 = V_3;
    const R_s2_target = V_n2 / I_subr;
    
    const Reo_21 = R_s2_target - Ra_21;
    const Reo_22 = R_s2_target - Ra_22;
    
    const R_p2 = 1 / ( (2 / R_s2_target) + (1 / R_3) );
    const R_2 = R_p2 + Rc_2;
    const V_2 = R_2 * (4 * I_subr);

    // --- RAMA 1 (Más cercana) ---
    const V_n1 = V_2;
    const R_s1_target = V_n1 / I_subr;
    
    const Reo_11 = R_s1_target - Ra_11;
    const Reo_12 = R_s1_target - Ra_12;
    
    const R_p1 = 1 / ( (2 / R_s1_target) + (1 / R_2) );
    const R_1 = R_p1 + Rc_1;
    const V_1 = R_1 * (6 * I_subr);
    
    // Valores Finales
    const Rect = V_1; // En este sistema de 3 ramas, el voltaje del rectificador es V_1
    const It = 6 * I_subr;

    // 3. Mostrar Resultados

    // Resultados Principales
    setResult('result-rect', Rect);
    setResult('result-it', It);

    // Reóstatos (Revisando si hay negativos)
    if (setRheostatValue('reo_31', Reo_31)) hasNegativeRheostat = true;
    if (setRheostatValue('reo_32', Reo_32)) hasNegativeRheostat = true;
    if (setRheostatValue('reo_21', Reo_21)) hasNegativeRheostat = true;
    if (setRheostatValue('reo_22', Reo_22)) hasNegativeRheostat = true;
    if (setRheostatValue('reo_11', Reo_11)) hasNegativeRheostat = true;
    if (setRheostatValue('reo_12', Reo_12)) hasNegativeRheostat = true;

    // Valores Intermedios
    setResult('v_3', V_3);
    setResult('r_3', R_3);
    setResult('v_2', V_2);
    setResult('r_2', R_2);
    setResult('v_1', V_1);
    setResult('r_1', R_1);

    // Mensaje de estado final
    if (hasNegativeRheostat) {
        setStatus('¡Advertencia! Se calcularon Reóstatos negativos (en rojo). El sistema no se puede balancear con estos valores de entrada.', true);
    } else {
        setStatus('Cálculo completado exitosamente.', false);
    }
}

// Asignar el evento al botón y configurar la interactividad
function initializeInteractiveCalculations() {
    // Mantener la funcionalidad del botón
    document.getElementById('calculate-btn').addEventListener('click', calculateSystem);

    // Seleccionar todos los campos de entrada numéricos
    const numberInputs = document.querySelectorAll('input[type="number"]');
    
    // Añadir un listener a cada campo para que recalcule al instante
    numberInputs.forEach(input => {
        input.addEventListener('input', calculateSystem);
    });

    // Realizar el cálculo inicial al cargar la página
    calculateSystem();
}

// Iniciar cuando la página esté completamente cargada
window.addEventListener('load', initializeInteractiveCalculations);
