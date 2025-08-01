const urlApi = 'https://script.google.com/macros/s/AKfycbxfgVF2jS07FgjMU4Y3J6pnX4A_yVRI4E8I9MbejsqUMXuS064GxundZocdQsexXik/exec';
const offsetFilas = 1;

function formatearFecha(fechaStr) {
  if (!fechaStr) return '';
  const f = new Date(fechaStr);
  return f.toLocaleDateString('es-ES') + ' ' + f.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatearSoloFecha(fechaStr) {
  if (!fechaStr) return '';
  const f = new Date(fechaStr);
  return f.toLocaleDateString('es-ES');
}

// NOTA: La función actualizarFila se deja pero **NO** se usa para Prioridad o Notas para evitar CORS
// Puedes usarla en casos donde estés seguro del contexto y dominio
async function actualizarFila(id, datos) {
  try {
    const datosConId = { ...datos, ID: id };
    const response = await fetch(urlApi, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'saveFormData', ...datosConId })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
    }
    const result = await response.json();
    if (result.status !== 'success') {
      throw new Error(result.message || 'Error al actualizar fila');
    }
    return result;
  } catch (e) {
    console.error('Error al actualizar fila:', e);
    throw new Error('Error al actualizar fila: ' + e.message);
  }
}

// Obtener fila por ID
async function obtenerFilaPorId(id) {
  try {
    const response = await fetch(`${urlApi}?id=${encodeURIComponent(id)}`);
    const result = await response.json();
    if (result.status !== 'success') throw new Error(result.message || 'Error al obtener fila');
    return result.data;
  } catch (e) {
    console.error('Error al obtener fila:', e);
    throw e;
  }
}

// Marca un campo simple usando querystring sin body JSON para evitar CORS
async function marcarCampo(campo, id, valor) {
  try {
    const valorNorm = String(valor).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const response = await fetch(`${urlApi}?marcar=${encodeURIComponent(campo + ':' + id + ':' + valorNorm)}`, {
      method: 'POST',
    });
    const result = await response.json();
    if (result.status !== 'success') throw new Error(result.message || `Error al marcar ${campo}`);
    return result;
  } catch (e) {
    console.error(`Error al marcar ${campo}:`, e);
    throw e;
  }
}

async function marcarLlamado(id, valor) {
  return marcarCampo("Llamado", id, valor);
}

async function marcarRespondido(id, valor) {
  return marcarCampo("Respondido", id, valor);
}

async function marcarNotas(id, notas) {
  return marcarCampo("Notas", id, notas);
}

// Crear botón genérico reutilizable
function crearBoton({ fondo, borde, textoColor, texto, extra = {}, onClick }) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-sm';
  btn.innerHTML = texto;
  btn.style.backgroundColor = fondo;
  btn.style.border = `2px solid ${borde}`;
  btn.style.color = textoColor;
  btn.style.borderRadius = '6px';
  btn.style.padding = '5px 12px';
  btn.style.fontWeight = '600';
  btn.style.minWidth = '60px';
  btn.style.height = '32px';
  btn.style.cursor = 'pointer';
  btn.style.transition = 'background-color 0.3s ease, color 0.3s ease';
  Object.assign(btn.style, extra);
  if (onClick) btn.addEventListener('click', onClick);
  return btn;
}

// Botón Llamado toggle Sí/No
function crearBotonLlamado(id, estado) {
  const colorRojo = '#f28b82', bordeRojo = '#d9534f';
  const colorVerde = '#81c995', bordeVerde = '#4cae4c';
  const esLlamado = estado === true || estado === 'Sí';

  const btn = crearBoton({
    fondo: esLlamado ? colorVerde : colorRojo,
    borde: esLlamado ? bordeVerde : bordeRojo,
    textoColor: '#fff',
    texto: esLlamado ? 'Sí' : 'No',
    onClick: async function () {
      const textoActual = this.innerText.trim();
      const nuevoEstado = textoActual === 'Sí' ? 'No' : 'Sí';
      const nuevoEstadoNormalized = nuevoEstado.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      this.disabled = true;
      this.innerHTML = `<div class="spinner-border spinner-border-sm text-warning" role="status"><span class="visually-hidden">Cargando...</span></div>`;

      try {
        await marcarLlamado(id, nuevoEstadoNormalized);

        const filaData = await obtenerFilaPorId(id);
        const tr = document.querySelector(`tr[data-id="${id}"]`);
        if (!tr) return;

        const tdLlamado = tr.querySelector('.td-llamado');
        tdLlamado.innerHTML = '';
        tdLlamado.appendChild(crearBotonLlamado(id, filaData['Llamado']));

        const tdRespondido = tr.querySelector('.td-respondido');
        mostrarOpcionesRespondido(tdRespondido, id);

        const tdSeguimiento = tr.querySelector('.td-seguimiento');
        tdSeguimiento.innerHTML = '';
        tdSeguimiento.appendChild(crearBotonSeguimiento(id, filaData['Respondido'], filaData['NoContestados']));

        const tdEstado = tr.querySelector('.td-estado');
        tdEstado.textContent = filaData['Estado'] || 'Pendiente';

        this.disabled = false;
      } catch (e) {
        this.innerText = textoActual;
        this.disabled = false;
        alert('Error al marcar Llamado: ' + e.message);
      }
    }
  });
  return btn;
}

// Botón Respondido tipo toggle con opciones Sí/No
function crearBotonRespondido(id, estado) {
  const tr = document.querySelector(`tr[data-id="${id}"]`);
  const td = tr?.querySelector('.td-respondido');

  const btn = crearBoton({
    fondo: estado === 'Sí' ? '#81c995' : (estado === 'No' ? '#f28b82' : '#f7b267'),
    borde: estado === 'Sí' ? '#4cae4c' : (estado === 'No' ? '#d9534f' : '#e08e0b'),
    textoColor: '#fff',
    texto: estado || 'Pendiente',
    onClick: () => {
      if (!td) return;
      mostrarOpcionesRespondido(td, id);
    }
  });

  if (td) {
    td.innerHTML = '';
    td.appendChild(btn);
  }
  return btn;
}

// Mostrar opciones para marcar Respondido "Sí" o "No"
function mostrarOpcionesRespondido(td, id) {
  td.innerHTML = '';
  const contenedor = document.createElement('div');
  contenedor.className = 'd-flex gap-1';

  ['Sí', 'No'].forEach(valor => {
    const btn = document.createElement('button');
    btn.className = `btn btn-sm ${valor === 'Sí' ? 'btn-success' : 'btn-danger'}`;
    btn.innerHTML = valor === 'Sí' ? '<i class="bi bi-check-lg"></i>' : '<i class="bi bi-x-lg"></i>';

    btn.addEventListener('click', async () => {
      const tr = document.querySelector(`tr[data-id="${id}"]`);
      if (!tr) return;

      const tdRespondido = tr.querySelector('.td-respondido');
      const tdLlamado = tr.querySelector('.td-llamado');
      const tdSeguimiento = tr.querySelector('.td-seguimiento');
      const tdEstado = tr.querySelector('.td-estado');

      tdRespondido.innerHTML = '';
      tdRespondido.appendChild(crearBotonRespondido(id, valor));

      try {
        const valorNorm = valor.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        await marcarRespondido(id, valorNorm);

        if (valorNorm === 'si') {
          await marcarLlamado(id, 'si');
        }

        const filaData = await obtenerFilaPorId(id);

        tdLlamado.innerHTML = '';
        tdLlamado.appendChild(crearBotonLlamado(id, filaData['Llamado']));

        tdSeguimiento.innerHTML = '';
        tdSeguimiento.appendChild(crearBotonSeguimiento(id, filaData['Respondido'], filaData['NoContestados']));

        tdEstado.textContent = filaData['Estado'] || 'Pendiente';

      } catch (e) {
        alert('Error al actualizar Respondido y Llamado: ' + e.message);
      }
    });

    contenedor.appendChild(btn);
  });

  td.appendChild(contenedor);
}

// Botón Prioridad con estrellas (usa marcarCampo para actualizar)
function crearBotonPrioridad(id, prioridad) {
  const niveles = ['Baja', 'Media', 'Alta'];
  const prioridadNormal = normalizarPrioridad(prioridad);
  const selected = niveles.indexOf(prioridadNormal);

  const contenedor = document.createElement('div');
  contenedor.className = 'td-prioridad';
  contenedor.style.display = 'inline-flex';
  contenedor.style.alignItems = 'center';
  contenedor.style.gap = '6px';
  contenedor.style.userSelect = 'none';

  const estrellas = [];

  function pintarHover(idx) {
    estrellas.forEach((estrella, i) => {
      if (i <= idx) {
        estrella.style.color = '#cc9a06';
        estrella.style.transform = 'scale(1.15)';
      } else {
        estrella.style.color = estrella.classList.contains('activa') ? '#ffc107' : '#ccc';
        estrella.style.transform = 'scale(1)';
      }
    });
  }

  function pintarNormal() {
    estrellas.forEach((estrella, i) => {
      estrella.style.color = estrella.classList.contains('activa') ? '#ffc107' : '#ccc';
      estrella.style.transform = 'scale(1)';
    });
  }

  for (let i = 0; i < 3; i++) {
    const estrella = document.createElement('span');
    estrella.innerHTML = i <= selected ? '★' : '☆';
    if (i <= selected) estrella.classList.add('activa');
    estrella.title = niveles[i];
    estrella.style.fontSize = '1.7em';
    estrella.style.cursor = 'pointer';

    estrella.addEventListener('mouseenter', () => pintarHover(i));
    estrella.addEventListener('mouseleave', () => pintarNormal());

    estrella.addEventListener('click', async () => {
      try {
        await marcarCampo("Prioridad", id, niveles[i]);

        const filaData = await obtenerFilaPorId(id);
        const tr = document.querySelector(`tr[data-id="${id}"]`);
        if (!tr) return;

        const tdPrioridad = tr.querySelector('.td-prioridad');
        tdPrioridad.innerHTML = '';
        tdPrioridad.appendChild(crearBotonPrioridad(id, filaData['Prioridad']));

        const tdEstado = tr.querySelector('.td-estado');
        tdEstado.textContent = filaData['Estado'] || 'Pendiente';

      } catch (e) {
        alert('Error al actualizar Prioridad: ' + e.message);
      }
    });

    estrellas.push(estrella);
    contenedor.appendChild(estrella);
  }

  pintarNormal();

  return contenedor;
}

function normalizarPrioridad(p) {
  if (!p) return 'Media';
  p = p.trim().toLowerCase();
  if (p === 'baja') return 'Baja';
  if (p === 'media') return 'Media';
  if (p === 'alta') return 'Alta';
  return 'Media';
}


// Botón Seguimiento con emojis y contador
function crearBotonSeguimiento(id, respondido, noContestados) {
  const esRespondido = respondido === 'Sí';

  const span = document.createElement('span');
  span.style.cursor = 'pointer';
  span.style.fontSize = '1em';
  span.style.userSelect = 'none';
  span.style.color = '#333';
  span.style.display = 'inline-flex';
  span.style.alignItems = 'center';
  span.style.gap = '0.15em';
  span.style.padding = '2px 4px';
  span.style.borderRadius = '4px';

  const emojiSpan = document.createElement('span');
  emojiSpan.textContent = esRespondido ? '😊' : '😢';
  emojiSpan.style.fontSize = '1.1em';
  emojiSpan.style.lineHeight = '1';

  span.appendChild(emojiSpan);

  if (!esRespondido) {
    const numeroSpan = document.createElement('span');
    numeroSpan.textContent = `(${noContestados || 0})`;
    numeroSpan.style.fontSize = '0.85em';
    numeroSpan.style.lineHeight = '1';
    numeroSpan.style.fontWeight = '500';
    numeroSpan.style.userSelect = 'none';
    span.appendChild(numeroSpan);
  }

  span.title = esRespondido ? 'Respondido' : `${noContestados || 0} no contestados`;

  span.addEventListener('click', () => {
    const tr = document.querySelector(`tr[data-id="${id}"]`);
    const tdSeguimiento = tr.querySelector('.td-seguimiento');
    mostrarOpcionesSeguimiento(tdSeguimiento, id);
  });

  return span;
}

// Mostrar opciones Seguimiento para seleccionar 'Sí' o 'No'
function mostrarOpcionesSeguimiento(td, id) {
  td.innerHTML = '';
  const contenedor = document.createElement('div');
  contenedor.className = 'd-flex gap-1';

  ['Sí', 'No'].forEach(valor => {
    const btn = document.createElement('button');
    btn.className = `btn btn-sm ${valor === 'Sí' ? 'btn-success' : 'btn-danger'}`;
    btn.innerHTML = valor === 'Sí' ? '😊' : '😢';

    btn.addEventListener('click', async () => {
      const tr = document.querySelector(`tr[data-id="${id}"]`);
      const tdRespondido = tr.querySelector('.td-respondido');
      const tdLlamado = tr.querySelector('.td-llamado');
      const tdSeguimiento = tr.querySelector('.td-seguimiento');
      const tdEstado = tr.querySelector('.td-estado');

      tdRespondido.innerHTML = '';
      tdRespondido.appendChild(crearBotonRespondido(id, valor));

      try {
        await marcarRespondido(id, valor.toLowerCase());
        const filaData = await obtenerFilaPorId(id);
        tdLlamado.innerHTML = '';
        tdLlamado.appendChild(crearBotonLlamado(id, filaData['Llamado']));
        tdSeguimiento.innerHTML = '';
        tdSeguimiento.appendChild(crearBotonSeguimiento(id, filaData['Respondido'], filaData['NoContestados']));
        tdEstado.textContent = filaData['Estado'] || 'Pendiente';
      } catch (e) {
        alert('Error al actualizar Seguimiento: ' + e.message);
      }
    });

    contenedor.appendChild(btn);
  });

  td.appendChild(contenedor);
}


// Mostrar contactos en tabla
let contactosData = [];
let sortColumn = null;
let sortDirection = 1;

function mostrarContactos(contactos) {
  contactosData = contactos;
  const tbody = document.querySelector('#tabla-contactos tbody');
  tbody.innerHTML = '';

  contactos.forEach((c, idx) => {
    const llamado = c['Llamado'] === 'Sí';
    const respondido = c['Respondido'] === 'Sí' ? 'Sí' : (c['Respondido'] === 'No' ? 'No' : null);
    const idPersona = c['ID'] || `contacto_${idx + 1}`;

    const tr = document.createElement('tr');
    tr.dataset.id = idPersona;

    tr.innerHTML = `
      <td style="text-align:left;">${c['your-name'] || ''}</td>
      <td>${c['tel-686'] || ''}</td>
      <td>${c['radio-188'] || ''}</td>
      <td>${c['ubicacion-terreno'] || ''}</td>
      <td>${c['number-419'] || ''}</td>
      <td class="td-llamado"></td>
      <td class="td-respondido"></td>
      <td class="td-notas">
        <div class="d-flex gap-1">
          <input type="text" class="form-control form-control-sm" value="${c['Notas'] || ''}" style="max-width: 150px;">
          <button class="btn btn-sm btn-primary"><i class="bi bi-save"></i></button>
        </div>
      </td>
      <td class="td-seguimiento"></td>
      <td class="td-prioridad"></td>
      <td class="td-estado">${c['Estado'] || 'Pendiente'}</td>
      <td>
        <button class="btn btn-link btn-sm p-0 fw-bold" style="text-decoration:none;" data-toggle="detalle" data-idx="${idx}">
          <span style="font-size:1.1em;">▼</span> Detalles
        </button>
      </td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="window.location.href='ficha.html?id=${idPersona}'">
          Ficha
        </button>
      </td>
    `;

    tbody.appendChild(tr);

    tr.querySelector('.td-llamado').appendChild(crearBotonLlamado(idPersona, llamado));
    tr.querySelector('.td-respondido').appendChild(crearBotonRespondido(idPersona, respondido));
    tr.querySelector('.td-seguimiento').appendChild(crearBotonSeguimiento(idPersona, respondido, c['NoContestados']));
    tr.querySelector('.td-prioridad').appendChild(crearBotonPrioridad(idPersona, c['Prioridad']));

    const inputNotas = tr.querySelector('.td-notas input');
    const btnGuardarNotas = tr.querySelector('.td-notas button');

    // Cambiado para usar marcarNotas y evitar CORS
    btnGuardarNotas.addEventListener('click', async () => {
      const notas = inputNotas.value;
      try {
        await marcarNotas(idPersona, notas);

        const filaData = await obtenerFilaPorId(idPersona);
        inputNotas.value = filaData['Notas'] || '';

        const tdEstado = tr.querySelector('.td-estado');
        tdEstado.textContent = filaData['Estado'] || 'Pendiente';

      } catch (e) {
        alert('Error al guardar Notas: ' + e.message);
      }
    });

    const trDetalle = document.createElement('tr');
    trDetalle.className = 'fila-detalle';
    trDetalle.style.display = 'none';
    trDetalle.innerHTML = `
      <td colspan="13" style="padding: 0; background:#f9f6ff;">
        <div style="display: flex; align-items: flex-start; padding: 0.75rem 1rem;">
          <div style="min-width: 250px; background: #e0dfff; border-radius: 8px; padding: 1rem; box-shadow: 0 2px 6px rgba(108,92,231,0.2); font-size: 0.95rem; line-height: 1.4;">
            <ul class="mb-0" style="list-style: disc inside; margin: 0;">
              <li><b>Email:</b> ${c['your-email'] || ''}</li>
              <li><b>Cualidades:</b> ${c['checkbox-374'] || ''}</li>
              <li><b>Plazo:</b> ${formatearSoloFecha(c['date-33'])}</li>
              <li><b>Plantas:</b> ${c['number-420'] || ''}</li>
              <li><b>Superficie:</b> ${c['number-421'] || ''}</li>
              <li><b>Dormitorios:</b> ${c['number-422'] || ''}</li>
              <li><b>Baños:</b> ${c['number-423'] || ''}</li>
              <li><b>Fecha:</b> ${formatearFecha(c['Fecha'])}</li>
              <li><b>Fecha Llamada:</b> ${formatearFecha(c['fecha-llamada'])}</li>
              <li><b>Fecha Mail:</b> ${formatearFecha(c['fecha-mail'])}</li>
              <li><b>Fecha Reunión:</b> ${formatearFecha(c['fecha-reunion'])}</li>
            </ul>
          </div>
          <div style="flex-grow:1"></div>
        </div>
      </td>
    `;
    tbody.appendChild(trDetalle);
  });
}

// Cargar contactos desde GAS
async function cargarContactos() {
  try {
    const response = await fetch(urlApi);
    const result = await response.json();
    if (result.status !== 'success') throw new Error(result.message || 'Error al cargar contactos');
    return result.data;
  } catch (error) {
    console.error('Error al cargar contactos:', error);
    throw error;
  }
}

async function cargarYMostrar() {
  try {
    const datos = await cargarContactos();
    mostrarContactos(datos);
  } catch (e) {
    document.querySelector('#tabla-contactos tbody').innerHTML =
      `<tr><td colspan="13" class="text-center text-danger">Error al cargar datos: ${e.message}</td></tr>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  cargarYMostrar();

  document.querySelectorAll('.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const column = th.dataset.sort;

      if (sortColumn === column) {
        sortDirection *= -1;
      } else {
        sortColumn = column;
        sortDirection = 1;
      }

      const sortedData = [...contactosData].sort((a, b) => {
        let valA = a[column] || '';
        let valB = b[column] || '';

        if (column === 'FechaSeguimiento') {
          valA = valA ? new Date(valA).getTime() : 0;
          valB = valB ? new Date(valB).getTime() : 0;
        } else if (column === 'Prioridad') {
          const order = { 'Alta': 3, 'Media': 2, 'Baja': 1 };
          valA = order[valA] || 0;
          valB = order[valB] || 0;
        } else if (column === 'Estado') {
          const orderEstado = { 'Sin Llamar': 1, 'Llamado': 2, 'Respondido': 3 };
          valA = orderEstado[valA] || 0;
          valB = orderEstado[valB] || 0;
        }

        if (valA < valB) return -1 * sortDirection;
        if (valA > valB) return 1 * sortDirection;
        return 0;
      });

      mostrarContactos(sortedData);

      document.querySelectorAll('.sortable').forEach(t => {
        t.innerHTML = t.innerHTML.replace(' ↑', '').replace(' ↓', '');
      });
      th.innerHTML += sortDirection === 1 ? ' ↑' : ' ↓';
    });
  });

  document.querySelector('#tabla-contactos tbody').addEventListener('click', function(event) {
    const btn = event.target.closest('button[data-toggle="detalle"]');
    if (!btn) return;

    event.preventDefault();

    const tbody = this;
    const idx = parseInt(btn.dataset.idx, 10);
    const filas = tbody.querySelectorAll('tr');
    const filaDetalle = filas[idx * 2 + 1];

    if (!filaDetalle) return;

    const estiloActual = window.getComputedStyle(filaDetalle).display;

    filas.forEach((tr, i) => {
      if (i % 2 === 1 && tr !== filaDetalle) {
        tr.style.display = 'none';
        const btnAnterior = filas[i - 1].querySelector('button[data-toggle="detalle"]');
        if (btnAnterior) {
          btnAnterior.classList.remove('abierto');
          btnAnterior.querySelector('span').textContent = '▼';
        }
      }
    });

    if (estiloActual === 'none') {
      filaDetalle.style.display = 'table-row';
      btn.classList.add('abierto');
      btn.querySelector('span').textContent = '▲';
    } else {
      filaDetalle.style.display = 'none';
      btn.classList.remove('abierto');
      btn.querySelector('span').textContent = '▼';
    }
  });
});
