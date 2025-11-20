// ===== Navegación =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Cerrar menú al hacer click en un enlace
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');

        // Actualizar link activo
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// Navegación desde tarjetas de módulos
function navigateTo(section) {
    document.getElementById(section).scrollIntoView({ behavior: 'smooth' });
}

// ===== Toggle Topics =====
function toggleTopic(header) {
    const content = header.nextElementSibling;
    const isActive = header.classList.contains('active');

    // Cerrar todos los demás
    document.querySelectorAll('.topic-header').forEach(h => {
        h.classList.remove('active');
        h.nextElementSibling.classList.remove('show');
    });

    // Abrir el actual si no estaba activo
    if (!isActive) {
        header.classList.add('active');
        content.classList.add('show');
    }
}

// ===== Tabs =====
function showTab(button, tabId) {
    const container = button.closest('.topic-content');

    // Desactivar todos los botones y contenidos
    container.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    container.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Activar el seleccionado
    button.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// ===== Utilidades =====
function formatNumber(num, decimals = 2) {
    return new Intl.NumberFormat('es-MX', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
}

function formatCurrency(num) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(num);
}

// ===== Calculadora: Interés Simple =====
function calcularInteresSimple() {
    const capital = parseFloat(document.getElementById('is-capital').value);
    const tasa = parseFloat(document.getElementById('is-tasa').value) / 100;
    const tiempo = parseFloat(document.getElementById('is-tiempo').value);
    const periodo = document.getElementById('is-periodo').value;

    if (isNaN(capital) || isNaN(tasa) || isNaN(tiempo)) {
        alert('Por favor ingresa todos los valores correctamente');
        return;
    }

    // Ajustar tiempo según período
    let tiempoAnual = tiempo;
    if (periodo === 'meses') tiempoAnual = tiempo / 12;
    if (periodo === 'días') tiempoAnual = tiempo / 365;

    const interes = capital * tasa * tiempoAnual;
    const montoFinal = capital + interes;

    const resultadoHTML = `
        <div class="result-content">
            <div class="result-title">Resultado del Cálculo</div>
            <div class="result-grid">
                <div class="result-item">
                    <span class="result-label">Interés Generado</span>
                    <span class="result-value">${formatCurrency(interes)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Monto Final</span>
                    <span class="result-value highlight">${formatCurrency(montoFinal)}</span>
                </div>
            </div>
            <div class="result-steps">
                <h5>Procedimiento:</h5>
                <p>I = C × i × t</p>
                <p>I = ${formatCurrency(capital)} × ${tasa} × ${formatNumber(tiempoAnual)}</p>
                <p>I = ${formatCurrency(interes)}</p>
                <p>M = C + I = ${formatCurrency(capital)} + ${formatCurrency(interes)} = ${formatCurrency(montoFinal)}</p>
            </div>
        </div>
    `;

    document.getElementById('is-resultado').innerHTML = resultadoHTML;
}

// ===== Calculadora: Interés Compuesto =====
function calcularInteresCompuesto() {
    const capital = parseFloat(document.getElementById('ic-capital').value);
    const tasaAnual = parseFloat(document.getElementById('ic-tasa').value) / 100;
    const tiempo = parseFloat(document.getElementById('ic-tiempo').value);
    const capitalizacion = parseInt(document.getElementById('ic-capitalizacion').value);

    if (isNaN(capital) || isNaN(tasaAnual) || isNaN(tiempo)) {
        alert('Por favor ingresa todos los valores correctamente');
        return;
    }

    const tasaPeriodo = tasaAnual / capitalizacion;
    const numeroPeriodos = tiempo * capitalizacion;
    const montoFinal = capital * Math.pow(1 + tasaPeriodo, numeroPeriodos);
    const interes = montoFinal - capital;

    // Comparación con interés simple
    const interesSimple = capital * tasaAnual * tiempo;
    const diferencia = interes - interesSimple;

    const capitalizacionTexto = {
        1: 'anual',
        2: 'semestral',
        4: 'trimestral',
        12: 'mensual',
        365: 'diaria'
    };

    const resultadoHTML = `
        <div class="result-content">
            <div class="result-title">Resultado del Cálculo</div>
            <div class="result-grid">
                <div class="result-item">
                    <span class="result-label">Monto Final</span>
                    <span class="result-value highlight">${formatCurrency(montoFinal)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Interés Generado</span>
                    <span class="result-value">${formatCurrency(interes)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Tasa por Período</span>
                    <span class="result-value">${formatNumber(tasaPeriodo * 100, 4)}%</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Núm. Períodos</span>
                    <span class="result-value">${numeroPeriodos}</span>
                </div>
            </div>
            <div class="result-steps">
                <h5>Procedimiento:</h5>
                <p>Capitalización ${capitalizacionTexto[capitalizacion]}: n = ${tiempo} × ${capitalizacion} = ${numeroPeriodos}</p>
                <p>i por período = ${tasaAnual * 100}% / ${capitalizacion} = ${formatNumber(tasaPeriodo * 100, 4)}%</p>
                <p>M = C(1 + i)ⁿ</p>
                <p>M = ${formatCurrency(capital)} × (1 + ${formatNumber(tasaPeriodo, 6)})^${numeroPeriodos}</p>
                <p>M = ${formatCurrency(montoFinal)}</p>
                <br>
                <p><strong>Comparación:</strong> Con interés simple ganarías ${formatCurrency(interesSimple)}</p>
                <p>El interés compuesto genera ${formatCurrency(diferencia)} adicionales</p>
            </div>
        </div>
    `;

    document.getElementById('ic-resultado').innerHTML = resultadoHTML;
}

// ===== Calculadora: Valor Presente/Futuro =====
let vpvfTipo = 'vf';

function selectVPVFType(tipo) {
    vpvfTipo = tipo;

    // Actualizar botones
    document.querySelectorAll('.calc-type-selector .type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Cambiar etiqueta del input
    const label = document.querySelector('#vpvf-valor-container label');
    const input = document.getElementById('vpvf-valor');

    if (tipo === 'vf') {
        label.textContent = 'Valor Presente ($)';
        input.value = '10000';
    } else {
        label.textContent = 'Valor Futuro ($)';
        input.value = '15000';
    }
}

function calcularVPVF() {
    const valor = parseFloat(document.getElementById('vpvf-valor').value);
    const tasa = parseFloat(document.getElementById('vpvf-tasa').value) / 100;
    const periodos = parseFloat(document.getElementById('vpvf-periodos').value);

    if (isNaN(valor) || isNaN(tasa) || isNaN(periodos)) {
        alert('Por favor ingresa todos los valores correctamente');
        return;
    }

    const factor = Math.pow(1 + tasa, periodos);
    let resultado, titulo, formula;

    if (vpvfTipo === 'vf') {
        resultado = valor * factor;
        titulo = 'Valor Futuro';
        formula = `VF = VP(1 + i)ⁿ = ${formatCurrency(valor)} × ${formatNumber(factor, 4)} = ${formatCurrency(resultado)}`;
    } else {
        resultado = valor / factor;
        titulo = 'Valor Presente';
        formula = `VP = VF/(1 + i)ⁿ = ${formatCurrency(valor)} / ${formatNumber(factor, 4)} = ${formatCurrency(resultado)}`;
    }

    const resultadoHTML = `
        <div class="result-content">
            <div class="result-title">Resultado del Cálculo</div>
            <div class="result-grid">
                <div class="result-item">
                    <span class="result-label">${titulo}</span>
                    <span class="result-value highlight">${formatCurrency(resultado)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Factor (1+i)ⁿ</span>
                    <span class="result-value">${formatNumber(factor, 4)}</span>
                </div>
            </div>
            <div class="result-steps">
                <h5>Procedimiento:</h5>
                <p>Factor = (1 + ${tasa})^${periodos} = ${formatNumber(factor, 4)}</p>
                <p>${formula}</p>
            </div>
        </div>
    `;

    document.getElementById('vpvf-resultado').innerHTML = resultadoHTML;
}

// ===== Calculadora: Tendencia Central =====
function calcularTendenciaCentral() {
    const input = document.getElementById('mtc-datos').value;
    const datos = input.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x));

    if (datos.length === 0) {
        alert('Por favor ingresa datos válidos separados por coma');
        return;
    }

    // Media
    const suma = datos.reduce((a, b) => a + b, 0);
    const media = suma / datos.length;

    // Mediana
    const ordenados = [...datos].sort((a, b) => a - b);
    let mediana;
    const mid = Math.floor(ordenados.length / 2);
    if (ordenados.length % 2 === 0) {
        mediana = (ordenados[mid - 1] + ordenados[mid]) / 2;
    } else {
        mediana = ordenados[mid];
    }

    // Moda
    const frecuencias = {};
    datos.forEach(x => {
        frecuencias[x] = (frecuencias[x] || 0) + 1;
    });
    const maxFrecuencia = Math.max(...Object.values(frecuencias));
    const modas = Object.keys(frecuencias).filter(x => frecuencias[x] === maxFrecuencia).map(x => parseFloat(x));
    const modaTexto = maxFrecuencia === 1 ? 'No hay moda' : modas.join(', ');

    const resultadoHTML = `
        <div class="result-content">
            <div class="result-title">Resultados (n = ${datos.length})</div>
            <div class="result-grid">
                <div class="result-item">
                    <span class="result-label">Media (Promedio)</span>
                    <span class="result-value">${formatNumber(media)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Mediana</span>
                    <span class="result-value">${formatNumber(mediana)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Moda</span>
                    <span class="result-value">${modaTexto}</span>
                </div>
            </div>
            <div class="result-steps">
                <h5>Procedimiento:</h5>
                <p><strong>Media:</strong> (${datos.join(' + ')}) / ${datos.length} = ${formatNumber(media)}</p>
                <p><strong>Mediana:</strong> Datos ordenados: [${ordenados.join(', ')}]</p>
                <p>Posición central: ${mediana}</p>
                <p><strong>Moda:</strong> ${maxFrecuencia === 1 ? 'Todos los valores aparecen 1 vez' : `${modaTexto} aparece ${maxFrecuencia} veces`}</p>
            </div>
        </div>
    `;

    document.getElementById('mtc-resultado').innerHTML = resultadoHTML;
}

// ===== Calculadora: Dispersión =====
function calcularDispersion() {
    const input = document.getElementById('de-datos').value;
    const tipo = document.getElementById('de-tipo').value;
    const datos = input.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x));

    if (datos.length < 2) {
        alert('Por favor ingresa al menos 2 datos válidos separados por coma');
        return;
    }

    // Media
    const n = datos.length;
    const media = datos.reduce((a, b) => a + b, 0) / n;

    // Varianza
    const sumaCuadrados = datos.reduce((sum, x) => sum + Math.pow(x - media, 2), 0);
    const divisor = tipo === 'muestra' ? n - 1 : n;
    const varianza = sumaCuadrados / divisor;

    // Desviación estándar
    const desviacion = Math.sqrt(varianza);

    // Coeficiente de variación
    const coefVariacion = (desviacion / media) * 100;

    // Rango
    const minimo = Math.min(...datos);
    const maximo = Math.max(...datos);
    const rango = maximo - minimo;

    const tipoTexto = tipo === 'muestra' ? `n-1 = ${n - 1}` : `n = ${n}`;

    const resultadoHTML = `
        <div class="result-content">
            <div class="result-title">Resultados (${tipo === 'muestra' ? 'Muestra' : 'Población'})</div>
            <div class="result-grid">
                <div class="result-item">
                    <span class="result-label">Desviación Estándar</span>
                    <span class="result-value highlight">${formatNumber(desviacion)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Varianza</span>
                    <span class="result-value">${formatNumber(varianza)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Media</span>
                    <span class="result-value">${formatNumber(media)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Coef. Variación</span>
                    <span class="result-value">${formatNumber(coefVariacion)}%</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Rango</span>
                    <span class="result-value">${formatNumber(rango)}</span>
                </div>
            </div>
            <div class="result-steps">
                <h5>Procedimiento:</h5>
                <p>1. Media = ${formatNumber(media)}</p>
                <p>2. Σ(xᵢ - x̄)² = ${formatNumber(sumaCuadrados)}</p>
                <p>3. Varianza = ${formatNumber(sumaCuadrados)} / ${tipoTexto} = ${formatNumber(varianza)}</p>
                <p>4. σ = √${formatNumber(varianza)} = ${formatNumber(desviacion)}</p>
                <p>5. CV = (${formatNumber(desviacion)} / ${formatNumber(media)}) × 100 = ${formatNumber(coefVariacion)}%</p>
            </div>
        </div>
    `;

    document.getElementById('de-resultado').innerHTML = resultadoHTML;
}

// ===== Calculadora: Punto de Equilibrio =====
function calcularPuntoEquilibrio() {
    const costosFijos = parseFloat(document.getElementById('pe-cf').value);
    const precioVenta = parseFloat(document.getElementById('pe-pv').value);
    const costoVariable = parseFloat(document.getElementById('pe-cv').value);

    if (isNaN(costosFijos) || isNaN(precioVenta) || isNaN(costoVariable)) {
        alert('Por favor ingresa todos los valores correctamente');
        return;
    }

    if (precioVenta <= costoVariable) {
        alert('El precio de venta debe ser mayor que el costo variable');
        return;
    }

    const margenContribucion = precioVenta - costoVariable;
    const mcPorcentual = (margenContribucion / precioVenta) * 100;
    const peUnidades = costosFijos / margenContribucion;
    const peMonetario = peUnidades * precioVenta;

    const resultadoHTML = `
        <div class="result-content">
            <div class="result-title">Punto de Equilibrio</div>
            <div class="result-grid">
                <div class="result-item">
                    <span class="result-label">PE en Unidades</span>
                    <span class="result-value highlight">${formatNumber(peUnidades, 0)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">PE en Dinero</span>
                    <span class="result-value highlight">${formatCurrency(peMonetario)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Margen Contrib.</span>
                    <span class="result-value">${formatCurrency(margenContribucion)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">MC Porcentual</span>
                    <span class="result-value">${formatNumber(mcPorcentual)}%</span>
                </div>
            </div>
            <div class="result-steps">
                <h5>Procedimiento:</h5>
                <p>1. Margen de Contribución = PV - CV</p>
                <p>   MC = ${formatCurrency(precioVenta)} - ${formatCurrency(costoVariable)} = ${formatCurrency(margenContribucion)}</p>
                <p>2. PE (unidades) = CF / MC</p>
                <p>   PE = ${formatCurrency(costosFijos)} / ${formatCurrency(margenContribucion)} = ${formatNumber(peUnidades)} unidades</p>
                <p>3. PE ($) = PE unidades × PV</p>
                <p>   PE = ${formatNumber(peUnidades)} × ${formatCurrency(precioVenta)} = ${formatCurrency(peMonetario)}</p>
                <br>
                <p><strong>Interpretación:</strong> Necesitas vender ${Math.ceil(peUnidades)} unidades (${formatCurrency(peMonetario)}) para cubrir todos tus costos.</p>
            </div>
        </div>
    `;

    document.getElementById('pe-resultado').innerHTML = resultadoHTML;
}

// ===== Calculadora: Margen de Contribución =====
function calcularMargenContribucion() {
    const precioVenta = parseFloat(document.getElementById('mc-pv').value);
    const costoVariable = parseFloat(document.getElementById('mc-cv').value);
    const unidades = parseFloat(document.getElementById('mc-unidades').value) || 1;

    if (isNaN(precioVenta) || isNaN(costoVariable)) {
        alert('Por favor ingresa todos los valores correctamente');
        return;
    }

    const mcUnitario = precioVenta - costoVariable;
    const mcPorcentual = (mcUnitario / precioVenta) * 100;
    const mcTotal = mcUnitario * unidades;
    const ingresoTotal = precioVenta * unidades;
    const costoTotal = costoVariable * unidades;

    const resultadoHTML = `
        <div class="result-content">
            <div class="result-title">Margen de Contribución</div>
            <div class="result-grid">
                <div class="result-item">
                    <span class="result-label">MC Unitario</span>
                    <span class="result-value highlight">${formatCurrency(mcUnitario)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">MC Porcentual</span>
                    <span class="result-value highlight">${formatNumber(mcPorcentual)}%</span>
                </div>
                <div class="result-item">
                    <span class="result-label">MC Total</span>
                    <span class="result-value">${formatCurrency(mcTotal)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Ingreso Total</span>
                    <span class="result-value">${formatCurrency(ingresoTotal)}</span>
                </div>
            </div>
            <div class="result-steps">
                <h5>Procedimiento:</h5>
                <p>1. MC Unitario = PV - CV</p>
                <p>   MC = ${formatCurrency(precioVenta)} - ${formatCurrency(costoVariable)} = ${formatCurrency(mcUnitario)}</p>
                <p>2. MC% = (MC / PV) × 100</p>
                <p>   MC% = (${formatCurrency(mcUnitario)} / ${formatCurrency(precioVenta)}) × 100 = ${formatNumber(mcPorcentual)}%</p>
                <p>3. MC Total = MC Unitario × Unidades</p>
                <p>   MC Total = ${formatCurrency(mcUnitario)} × ${formatNumber(unidades, 0)} = ${formatCurrency(mcTotal)}</p>
                <br>
                <p><strong>Interpretación:</strong> Cada unidad vendida aporta ${formatCurrency(mcUnitario)} (${formatNumber(mcPorcentual)}%) para cubrir costos fijos y generar utilidad.</p>
            </div>
        </div>
    `;

    document.getElementById('mc-resultado').innerHTML = resultadoHTML;
}

// ===== Calculadora: Porcentajes =====
let porcentajeTipo = 'variacion';

function selectPorcentajeType(tipo) {
    porcentajeTipo = tipo;

    // Actualizar botones
    const buttons = document.querySelectorAll('#porcentajes .calc-type-selector .type-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Cambiar inputs según tipo
    const container = document.getElementById('porc-inputs');

    if (tipo === 'variacion') {
        container.innerHTML = `
            <div class="calc-input">
                <label for="porc-vi">Valor Inicial ($)</label>
                <input type="number" id="porc-vi" placeholder="80000" value="80000">
            </div>
            <div class="calc-input">
                <label for="porc-vf">Valor Final ($)</label>
                <input type="number" id="porc-vf" placeholder="100000" value="100000">
            </div>
        `;
    } else if (tipo === 'aumento') {
        container.innerHTML = `
            <div class="calc-input">
                <label for="porc-vi">Valor Inicial ($)</label>
                <input type="number" id="porc-vi" placeholder="1000" value="1000">
            </div>
            <div class="calc-input">
                <label for="porc-porc">Porcentaje de Aumento (%)</label>
                <input type="number" id="porc-porc" placeholder="15" value="15" step="0.1">
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="calc-input">
                <label for="porc-vi">Valor Inicial ($)</label>
                <input type="number" id="porc-vi" placeholder="200" value="200">
            </div>
            <div class="calc-input">
                <label for="porc-porc">Porcentaje de Descuento (%)</label>
                <input type="number" id="porc-porc" placeholder="30" value="30" step="0.1">
            </div>
        `;
    }
}

function calcularPorcentaje() {
    let resultadoHTML = '';

    if (porcentajeTipo === 'variacion') {
        const vi = parseFloat(document.getElementById('porc-vi').value);
        const vf = parseFloat(document.getElementById('porc-vf').value);

        if (isNaN(vi) || isNaN(vf) || vi === 0) {
            alert('Por favor ingresa valores válidos');
            return;
        }

        const diferencia = vf - vi;
        const variacion = (diferencia / vi) * 100;
        const tipo = variacion >= 0 ? 'Aumento' : 'Disminución';

        resultadoHTML = `
            <div class="result-content">
                <div class="result-title">Variación Porcentual</div>
                <div class="result-grid">
                    <div class="result-item">
                        <span class="result-label">${tipo}</span>
                        <span class="result-value highlight">${formatNumber(Math.abs(variacion))}%</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Diferencia</span>
                        <span class="result-value">${formatCurrency(diferencia)}</span>
                    </div>
                </div>
                <div class="result-steps">
                    <h5>Procedimiento:</h5>
                    <p>Variación = ((VF - VI) / VI) × 100</p>
                    <p>Variación = ((${formatCurrency(vf)} - ${formatCurrency(vi)}) / ${formatCurrency(vi)}) × 100</p>
                    <p>Variación = (${formatCurrency(diferencia)} / ${formatCurrency(vi)}) × 100</p>
                    <p>Variación = ${formatNumber(variacion)}%</p>
                </div>
            </div>
        `;
    } else if (porcentajeTipo === 'aumento') {
        const vi = parseFloat(document.getElementById('porc-vi').value);
        const porcentaje = parseFloat(document.getElementById('porc-porc').value);

        if (isNaN(vi) || isNaN(porcentaje)) {
            alert('Por favor ingresa valores válidos');
            return;
        }

        const aumento = vi * (porcentaje / 100);
        const vf = vi + aumento;

        resultadoHTML = `
            <div class="result-content">
                <div class="result-title">Aplicar Aumento</div>
                <div class="result-grid">
                    <div class="result-item">
                        <span class="result-label">Valor Final</span>
                        <span class="result-value highlight">${formatCurrency(vf)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Aumento</span>
                        <span class="result-value">${formatCurrency(aumento)}</span>
                    </div>
                </div>
                <div class="result-steps">
                    <h5>Procedimiento:</h5>
                    <p>VF = VI × (1 + %/100)</p>
                    <p>VF = ${formatCurrency(vi)} × (1 + ${porcentaje}/100)</p>
                    <p>VF = ${formatCurrency(vi)} × ${formatNumber(1 + porcentaje/100, 4)}</p>
                    <p>VF = ${formatCurrency(vf)}</p>
                </div>
            </div>
        `;
    } else {
        const vi = parseFloat(document.getElementById('porc-vi').value);
        const porcentaje = parseFloat(document.getElementById('porc-porc').value);

        if (isNaN(vi) || isNaN(porcentaje)) {
            alert('Por favor ingresa valores válidos');
            return;
        }

        const descuento = vi * (porcentaje / 100);
        const vf = vi - descuento;

        resultadoHTML = `
            <div class="result-content">
                <div class="result-title">Aplicar Descuento</div>
                <div class="result-grid">
                    <div class="result-item">
                        <span class="result-label">Precio Final</span>
                        <span class="result-value highlight">${formatCurrency(vf)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Descuento</span>
                        <span class="result-value">${formatCurrency(descuento)}</span>
                    </div>
                </div>
                <div class="result-steps">
                    <h5>Procedimiento:</h5>
                    <p>VF = VI × (1 - %/100)</p>
                    <p>VF = ${formatCurrency(vi)} × (1 - ${porcentaje}/100)</p>
                    <p>VF = ${formatCurrency(vi)} × ${formatNumber(1 - porcentaje/100, 4)}</p>
                    <p>VF = ${formatCurrency(vf)}</p>
                </div>
            </div>
        `;
    }

    document.getElementById('porc-resultado').innerHTML = resultadoHTML;
}

// ===== Observador de navegación =====
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    let current = '';
    const offset = 150;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollY >= sectionTop - offset) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ===== Inicialización =====
document.addEventListener('DOMContentLoaded', () => {
    // Abrir el primer tema por defecto en cada sección
    const firstTopics = document.querySelectorAll('.module-section .topic-container:first-of-type .topic-header');
    // Opcional: descomentar para abrir el primer tema automáticamente
    // firstTopics.forEach(topic => toggleTopic(topic));

    console.log('MathBusiness App cargada correctamente');
});
