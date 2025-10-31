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
    
    const Ra_41 = getValue('ra_41');
    const Ra_42 = getValue('ra_42');
    const Rc_4 = getValue('rc_4');

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

    // 2. Cálculos (siguiendo el documento, de r=4 a r=1)

    // --- RAMA 4 (Paso 3 del doc) ---
    let Reo_41 = 0;
    let Reo_42 = 0;

    if (Ra_41 > Ra_42) {
        Reo_42 = Ra_41 - Ra_42;
    } else if (Ra_42 > Ra_41) {
        Reo_41 = Ra_42 - Ra_41;
    }
    
    const R_s41 = Ra_41 + Reo_41;
    const R_p4 = R_s41 / 2;
    const R_4 = R_p4 + Rc_4;
    const V_4 = R_4 * (2 * I_subr);

    // --- RAMA 3 (Paso 4 del doc) ---
    const V_n3 = V_4;
    const R_s3_target = V_n3 / I_subr;
    const Reo_31 = R_s3_target - Ra_31;
    const Reo_32 = R_s3_target - Ra_32;
    const R_p3 = 1 / ( (2 / R_s3_target) + (1 / R_4) );
    const R_3 = R_p3 + Rc_3;
    const V_3 = R_3 * (4 * I_subr);

    // --- RAMA 2 (Paso 5 del doc) ---
    const V_n2 = V_3;
    const R_s2_target = V_n2 / I_subr;
    const Reo_21 = R_s2_target - Ra_21;
    const Reo_22 = R_s2_target - Ra_22;
    const R_p2 = 1 / ( (2 / R_s2_target) + (1 / R_3) );
    const R_2 = R_p2 + Rc_2;
    const V_2 = R_2 * (6 * I_subr);

    // --- RAMA 1 (Paso 6 del doc) ---
    const V_n1 = V_2;
    const R_s1_target = V_n1 / I_subr;
    const Reo_11 = R_s1_target - Ra_11;
    const Reo_12 = R_s1_target - Ra_12;
    const R_p1 = 1 / ( (2 / R_s1_target) + (1 / R_2) );
    const R_1 = R_p1 + Rc_1;
    
    // Valores Finales
    const Rect = R_1 * (8 * I_subr);
    const It = 8 * I_subr;

    // 3. Mostrar Resultados
    setResult('result-rect', Rect);
    setResult('result-it', It);

    if (setRheostatValue('reo_41', Reo_41)) hasNegativeRheostat = true;
    if (setRheostatValue('reo_42', Reo_42)) hasNegativeRheostat = true;
    if (setRheostatValue('reo_31', Reo_31)) hasNegativeRheostat = true;
    if (setRheostatValue('reo_32', Reo_32)) hasNegativeRheostat = true;
    if (setRheostatValue('reo_21', Reo_21)) hasNegativeRheostat = true;
    if (setRheostatValue('reo_22', Reo_22)) hasNegativeRheostat = true;
    if (setRheostatValue('reo_11', Reo_11)) hasNegativeRheostat = true;
    if (setRheostatValue('reo_12', Reo_12)) hasNegativeRheostat = true;

    setResult('v_4', V_4);
    setResult('r_4', R_4);
    setResult('v_3', V_3);
    setResult('r_3', R_3);
    setResult('v_2', V_2);
    setResult('r_2', R_2);
    setResult('v_1', Rect);
    setResult('r_1', R_1);

    if (hasNegativeRheostat) {
        setStatus('¡Advertencia! Se calcularon Reóstatos negativos (en rojo). El sistema no se puede balancear con estos valores de entrada.', true);
    } else {
        setStatus('Cálculo completado exitosamente.', false);
    }
}

// Asignar el evento al botón y configurar la interactividad
function initializeInteractiveCalculations() {
    document.getElementById('calculate-btn').addEventListener('click', calculateSystem);
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.addEventListener('input', calculateSystem);
    });
    calculateSystem();
}

window.addEventListener('load', initializeInteractiveCalculations);
