document.addEventListener('DOMContentLoaded', () => {
  const apiUrl = 'https://script.google.com/macros/s/AKfycbxfgVF2jS07FgjMU4Y3J6pnX4A_yVRI4E8I9MbejsqUMXuS064GxundZocdQsexXik/exec';

  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  // Barra de navegación actualizada
  const nombreInput = document.getElementById('nombre');
  const fechaInput = document.getElementById('fecha');
  const navNombre = document.getElementById('nav-nombre');
  const navFecha = document.getElementById('nav-fecha');
  function updateNavBar() {
    navNombre.textContent = `Nombre: ${nombreInput.value || '-'}`;
    navFecha.textContent = `Fecha: ${fechaInput.value || '-'}`;
  }
  nombreInput.addEventListener('input', updateNavBar);
  fechaInput.addEventListener('input', updateNavBar);

  // Comportamientos dinámicos (terreno, como conocido, cualidades)
  const terrenoSelect = document.getElementById('terreno');
  const ubicacionContainer = document.getElementById('ubicacion-container');
  terrenoSelect.addEventListener('change', () => {
    ubicacionContainer.style.display = terrenoSelect.value === 'No' ? 'none' : 'block';
    if (terrenoSelect.value === 'No') {
      document.getElementById('ubicacion-terreno').value = '';
    }
  });

  const comoConocidoSelect = document.getElementById('como-conocido');
  const comoConocidoOtrosContainer = document.getElementById('como-conocido-otros-container');
  comoConocidoSelect.addEventListener('change', () => {
    comoConocidoOtrosContainer.style.display = comoConocidoSelect.value === 'Otros' ? 'block' : 'none';
    if (comoConocidoSelect.value !== 'Otros') {
      document.getElementById('como-conocido-otros').value = '';
    }
  });

  const cualidadOtrosCheckbox = document.getElementById('cualidad-otros');
  const cualidadesOtrosContainer = document.getElementById('cualidades-otros-container');
  cualidadOtrosCheckbox.addEventListener('change', () => {
    cualidadesOtrosContainer.style.display = cualidadOtrosCheckbox.checked ? 'block' : 'none';
    if (!cualidadOtrosCheckbox.checked) {
      document.getElementById('cualidades-otros').value = '';
    }
  });

  // Formateo para fechas input[type=date]
  function formatDateForInput(dateString) {
    if (!dateString) return '';
    return dateString.split('T')[0];
  }

  // Variable para guardar datos cargados o guardados (para exportar)
  let datosGuardados = null;

  // Cargar datos por ID (si existe en query string) y asignar también a datosGuardados
  const id = getQueryParam('id');
  if (id) {
    document.getElementById('ficha-id').value = id;

    fetch(`${apiUrl}?id=${id}`)
      .then(r => r.json())
      .then(json => {
        if (json.status === 'success') {
          const data = json.data;

          // Asignar datos al formulario igual que antes
          document.querySelector('[name=Fecha]').value = formatDateForInput(data['Fecha']) || '';
          document.querySelector('[name=your-name]').value = data['your-name'] || '';
          document.querySelector('[name=your-email]').value = data['your-email'] || '';
          document.querySelector('[name=tel-686]').value = data['tel-686'] || '';

          if (data['cualidades']) {
            const cualidades = data['cualidades'].split(',').map(c => c.trim());
            document.querySelectorAll('[name=cualidades]').forEach(checkbox => {
              checkbox.checked = cualidades.includes(checkbox.value);
            });
            if (cualidades.includes('Otros') && data['cualidades-otros']) {
              document.getElementById('cualidad-otros').checked = true;
              document.getElementById('cualidades-otros').value = data['cualidades-otros'] || '';
              cualidadesOtrosContainer.style.display = 'block';
            } else {
              document.getElementById('cualidad-otros').checked = false;
              document.getElementById('cualidades-otros').value = '';
              cualidadesOtrosContainer.style.display = 'none';
            }
          } else {
            document.querySelectorAll('[name=cualidades]').forEach(chk => chk.checked = false);
            document.getElementById('cualidad-otros').checked = false;
            document.getElementById('cualidades-otros').value = '';
            cualidadesOtrosContainer.style.display = 'none';
          }

          document.querySelector('[name=terreno]').value = data['terreno'] || '';
          if (data['terreno'] === 'No') {
            ubicacionContainer.style.display = 'none';
            document.querySelector('[name=ubicacion-terreno]').value = '';
          } else {
            ubicacionContainer.style.display = 'block';
            document.querySelector('[name=ubicacion-terreno]').value = data['ubicacion-terreno'] || '';
          }

          document.querySelector('[name=number-419]').value = data['number-419'] || '';
          document.querySelector('[name=date-33]').value = formatDateForInput(data['date-33']) || '';
          document.querySelector('[name=number-420]').value = data['number-420'] || '';
          document.querySelector('[name=number-421]').value = data['number-421'] || '';
          document.querySelector('[name=number-422]').value = data['number-422'] || '';
          document.querySelector('[name=number-423]').value = data['number-423'] || '';

          document.querySelector('[name=coherencia-dormitorios]').value = data['coherencia-dormitorios'] || '';
          document.querySelector('[name=coherencia-presupuesto]').value = data['coherencia-presupuesto'] || '';

          document.querySelector('[name=fecha-llamada]').value = formatDateForInput(data['fecha-llamada']) || '';
          document.querySelector('[name=como-conocido]').value = data['como-conocido'] || '';

          if (data['como-conocido'] === 'Otros') {
            comoConocidoOtrosContainer.style.display = 'block';
            document.getElementById('como-conocido-otros').value = data['como-conocido-otros'] || '';
          } else {
            comoConocidoOtrosContainer.style.display = 'none';
            document.getElementById('como-conocido-otros').value = '';
          }

          document.querySelector('[name=descripcion-vivienda]').value = data['descripcion-vivienda'] || '';
          document.querySelector('[name=distribucion-dia]').value = data['distribucion-dia'] || '';
          document.querySelector('[name=garaje]').value = data['garaje'] || '';
          document.querySelector('[name=piscina]').value = data['piscina'] || '';
          document.querySelector('[name=estancia-adicional]').value = data['estancia-adicional'] || '';

          document.querySelector('[name=superficie-parcela]').value = data['superficie-parcela'] || '';
          document.querySelector('[name=edificabilidad]').value = data['edificabilidad'] || '';
          document.querySelector('[name=ocupacion]').value = data['ocupacion'] || '';
          document.querySelector('[name=referencia-catastral]').value = data['referencia-catastral'] || '';
          document.querySelector('[name=presupuesto-deseado]').value = data['presupuesto-deseado'] || '';
          document.querySelector('[name=viabilidad]').value = data['viabilidad'] || '';
          document.querySelector('[name=informacion-adicional]').value = data['informacion-adicional'] || '';

          document.querySelector('[name=fecha-mail]').value = formatDateForInput(data['fecha-mail']) || '';
          document.querySelector('[name=info-enviada]').value = data['info-enviada'] || '';

          document.querySelector('[name=fecha-reunion]').value = formatDateForInput(data['fecha-reunion']) || '';
          document.querySelector('[name=imprescindible]').value = data['imprescindible'] || '';

          // Guarda localmente PARA EXPORTAR
          datosGuardados = data;
          document.getElementById('exportarWord').disabled = false;
          updateNavBar();

        } else {
          alert('No se encontraron datos para este ID');
        }
      })
      .catch(err => {
        console.error('Error al cargar datos:', err);
        alert('Hubo un problema al cargar los datos.');
      });
  }
  
 


  // Guardar datos (POST y actualizar)
  document.getElementById('guardarDatos').addEventListener('click', () => {
    const form = document.getElementById('form-ficha');
    const formData = new FormData(form);

    const dataToSend = {};
    for (let [key, value] of formData.entries()) {
      if (key === 'cualidades') {
        dataToSend[key] = dataToSend[key] ? dataToSend[key] + ', ' + value : value;
      } else {
        dataToSend[key] = value;
      }
    }
	

	
    dataToSend['action'] = 'saveFormData';
    dataToSend['id'] = document.getElementById('ficha-id').value || '';

    fetch(apiUrl, {
      method: 'POST',
      body: new URLSearchParams(dataToSend),
    })
      .then(r => r.json())
      .then(response => {
        if (response.status === 'success') {
          alert('Datos guardados correctamente');
          datosGuardados = dataToSend;
          document.getElementById('exportarWord').disabled = false;
          updateNavBar();
        } else {
          alert('Error al guardar: ' + response.message);
        }
      })
      .catch(() => alert('Error al guardar los datos'));
  });
  
  

// Evento Exportar a Word
document.getElementById('exportarWord').addEventListener('click', async () => {
  if (!datosGuardados) {
    alert('Primero debes guardar o cargar los datos.');
    return;
  }
  if (!window.docx) {
    alert('La librería docx no está cargada.');
    return;
  }

  // 1. Importar clases docx
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, Table, TableRow, TableCell, WidthType } = window.docx;

  // 2. Función para formatear fecha a DD/MM/YYYY
  function formatearFecha(fecha) {
    if (!fecha) return '-';
    const dateObj = new Date(fecha);
    if (isNaN(dateObj.getTime())) return '-';
    const dia = dateObj.getDate().toString().padStart(2, '0');
    const mes = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const año = dateObj.getFullYear();
    return `${dia}/${mes}/${año}`;
  }

  // 3. Función para convertir CSV a array limpia
  function textoALista(texto) {
    if (!texto) return ['-'];
    return texto.split(',').map(i => i.trim()).filter(i => i.length > 0);
  }

  // 4. Campos especiales
  const camposFecha = ['Fecha', 'date-33', 'fecha-llamada', 'fecha-mail', 'fecha-reunion'];
  const camposLista = ['cualidades'];
  const camposMultilinea = [
    'coherencia-dormitorios', 'coherencia-presupuesto', 'descripcion-vivienda', 'estancia-adicional',
    'presupuesto-deseado', 'viabilidad', 'informacion-adicional', 'info-enviada', 'imprescindible'
  ];

  // 5. Definir secciones y campos según el documento original
  const secciones = [
    {
      titulo: 'DATOS VÍA WEB O VÍA MAIL',
      subtitulo: 'A medida de tus sueños',
      campos: [
        ['Nombre/s', 'your-name'],
        ['Correo electrónico', 'your-email'],
        ['Teléfono', 'tel-686'],
        ['¿Qué cualidades buscas en tu vivienda?', 'cualidades', 'cualidades-otros'],
      ]
    },
    {
      subtitulo: 'A medida de tus posibilidades',
      campos: [
        ['Dispones de terreno', 'terreno'],
        ['Ubicación del terreno', 'ubicacion-terreno'],
        ['Inversión estimada para la vivienda', 'number-419'],
        ['Plazo o fecha deseada', 'date-33'],
      ]
    },
    {
      subtitulo: 'A medida de tus necesidades',
      campos: [
        ['Número de plantas', 'number-420'],
        ['Superficie de la vivienda', 'number-421'],
        ['Número de dormitorios', 'number-422'],
        ['Número de baños', 'number-423'],
      ]
    },
    {
      subtitulo: 'Análisis inicial',
      campos: [
        ['Coherencia nº dormitorios y superficie', 'coherencia-dormitorios'],
        ['Coherencia superficie y presupuesto', 'coherencia-presupuesto'],
      ]
    },
    {
      titulo: 'LLAMADA 01',
      campos: [
        ['¿Cómo nos has conocido?', 'como-conocido', 'como-conocido-otros'],
        ['Breve descripción de Proyectopía', null, null, 'Vivienda ecoeficiente a medida.'],
        ['¿Cómo te gustaría que fuese tu vivienda?', 'descripcion-vivienda'],
        ['Distribución de la zona de día', 'distribucion-dia'],
        ['Garaje', 'garaje'],
        ['Piscina', 'piscina'],
        ['Estancia adicional', 'estancia-adicional'],
        ['Aspectos urbanísticos', null],
        ['Superficie de la parcela (pendiente?)', 'superficie-parcela'],
        ['Edificabilidad', 'edificabilidad'],
        ['Ocupación', 'ocupacion'],
        ['Referencia catastral (R.C.)', 'referencia-catastral'],
        ['Presupuesto deseado', 'presupuesto-deseado'],
        ['Comentar viabilidad nº D - Superficie - €', 'viabilidad'],
        ['Información adicional', 'informacion-adicional'],
      ]
    },
    {
      titulo: 'MAIL 01',
      campos: [
        ['Detallar información enviada', 'info-enviada'],
      ]
    },
    {
      titulo: 'REUNIÓN ESTUDIOS PREVIOS',
      campos: [
        ['Imprescindible', 'imprescindible'],
      ]
    },
  ];

  // 6. Función para crear filas de tabla según tipo de dato
  function crearFilasTabla(label, key, otrosKey = null, valorFijo = null) {
    const valorOriginal = valorFijo || datosGuardados[key] || '-';
    const valorOtros = otrosKey ? datosGuardados[otrosKey] || '' : '';

    const labelCell = new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({ text: `${label}:`, bold: true, size: 18, font: 'Arial', color: '2F4F4F' })
          ]
        })
      ],
      width: { size: 30, type: WidthType.PERCENTAGE },
      margins: { top: 100, bottom: 100, left: 100, right: 100 }
    });

    if (camposFecha.includes(key)) {
      const valor = formatearFecha(valorOriginal);
      return [
        new TableRow({
          children: [
            labelCell,
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: valor, size: 18, font: 'Arial', color: '000000' })
                  ]
                })
              ],
              width: { size: 70, type: WidthType.PERCENTAGE },
              margins: { top: 100, bottom: 100, left: 100, right: 100 }
            })
          ],
          height: { value: 500 }
        })
      ];
    }

    if (camposLista.includes(key)) {
      const items = textoALista(valorOriginal);
      const filas = [
        new TableRow({
          children: [
            labelCell,
            new TableCell({
              children: items.map(item => new Paragraph({
                children: [
                  new TextRun({ text: `• ${item}`, size: 18, font: 'Arial', color: '000000' })
                ],
                spacing: { after: 80 }
              })),
              width: { size: 70, type: WidthType.PERCENTAGE },
              margins: { top: 100, bottom: 100, left: 100, right: 100 }
            })
          ],
          height: { value: 500 }
        })
      ];
      if (otrosKey && valorOtros && items.includes('Otros')) {
        filas.push(
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: '', size: 18, font: 'Arial' })
                    ]
                  })
                ],
                width: { size: 30, type: WidthType.PERCENTAGE },
                margins: { top: 100, bottom: 100, left: 100, right: 100 }
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: `• ${valorOtros}`, size: 18, font: 'Arial', color: '000000' })
                    ],
                    spacing: { after: 80 }
                  })
                ],
                width: { size: 70, type: WidthType.PERCENTAGE },
                margins: { top: 100, bottom: 100, left: 100, right: 100 }
              })
            ],
            height: { value: 500 }
          })
        );
      }
      return filas;
    }

    if (camposMultilinea.includes(key)) {
      const lineas = valorOriginal.split('\n').filter(l => l.trim() !== '');
      if (lineas.length === 0) {
        return [
          new TableRow({
            children: [
              labelCell,
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: '-', size: 18, font: 'Arial', color: '000000' })
                    ]
                  })
                ],
                width: { size: 70, type: WidthType.PERCENTAGE },
                margins: { top: 100, bottom: 100, left: 100, right: 100 }
              })
            ],
            height: { value: 500 }
          })
        ];
      }
      return [
        new TableRow({
          children: [
            labelCell,
            new TableCell({
              children: lineas.map((linea, index) => new Paragraph({
                children: [
                  new TextRun({ text: linea, size: 18, font: 'Arial', color: '000000' })
                ],
                spacing: { after: index < lineas.length - 1 ? 80 : 0 }
              })),
              width: { size: 70, type: WidthType.PERCENTAGE },
              margins: { top: 100, bottom: 100, left: 100, right: 100 }
            })
          ],
          height: { value: 500 }
        })
      ];
    }

    return [
      new TableRow({
        children: [
          labelCell,
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: valorOriginal, size: 18, font: 'Arial', color: '000000' })
                ]
              })
            ],
            width: { size: 70, type: WidthType.PERCENTAGE },
            margins: { top: 100, bottom: 100, left: 100, right: 100 }
          })
        ],
        height: { value: 500 }
      })
    ];
  }

  // 7. Crear el documento con una sola sección
  const doc = new Document({
    styles: {
      default: {
        heading1: {
          run: { size: 28, bold: true, font: 'Arial', color: '849901' },
          paragraph: { spacing: { before: 400, after: 400 }, alignment: AlignmentType.CENTER }
        },
        heading2: {
          run: { size: 24, bold: true, font: 'Arial', color: '849901' },
          paragraph: { spacing: { before: 400, after: 200 }, indent: { left: 200 } }
        },
        heading3: {
          run: { size: 20, bold: true, font: 'Arial', color: '849901' },
          paragraph: { spacing: { before: 200, after: 150 }, indent: { left: 200 } }
        },
        document: {
          run: { size: 18, font: 'Arial' },
          paragraph: { spacing: { before: 100, after: 100 } }
        }
      }
    },
    sections: [
      {
        properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'CUESTIONARIO 2025', size: 20, font: 'Arial', color: '849901' })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 50 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Nombre: ${datosGuardados['your-name'] || '-'}`, size: 18, font: 'Arial', color: '000000' })
                ],
                alignment: AlignmentType.LEFT,
                spacing: { after: 50 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Fecha: ${formatearFecha(datosGuardados['Fecha'] || document.querySelector('[name=Fecha]').value || '-')}`, size: 18, font: 'Arial', color: '000000' })
                ],
                alignment: AlignmentType.LEFT,
                spacing: { after: 100 }
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Página ', size: 18, font: 'Arial' }),
                  new TextRun({ field: 'PAGE', size: 18, font: 'Arial' })
                ],
                alignment: AlignmentType.CENTER
              })
            ]
          })
        },
        children: [
          new Paragraph({
            text: 'CUESTIONARIO 2025',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER
          }),
          ...secciones.flatMap(seccion => {
            const elementos = [];
            if (seccion.titulo) {
              elementos.push(
                new Paragraph({
                  text: seccion.titulo,
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 400, after: 200 }
                })
              );
            }
            if (seccion.subtitulo) {
              elementos.push(
                new Paragraph({
                  text: seccion.subtitulo,
                  heading: HeadingLevel.HEADING_3,
                  spacing: { before: 200, after: 150 }
                })
              );
            }
            const tableRows = seccion.campos.flatMap(([label, key, otrosKey, valorFijo]) => {
              // Condicional para "Ubicación del terreno"
              if (key === 'ubicacion-terreno' && datosGuardados['terreno'] === 'No') {
                return [];
              }
              // Condicional para "Cualidades - Otros"
              if (key === 'cualidades-otros' && !datosGuardados['cualidades']?.includes('Otros')) {
                return [];
              }
              // Condicional para "¿Cómo nos has conocido? - Otros"
              if (key === 'como-conocido-otros' && datosGuardados['como-conocido'] !== 'Otros') {
                return [];
              }
              return crearFilasTabla(label, key, otrosKey, valorFijo);
            });
            if (tableRows.length > 0) {
              elementos.push(
                new Table({
                  rows: tableRows,
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  margins: { top: 100, bottom: 100 }
                })
              );
            }
            return elementos;
          })
        ]
      }
    ]
  });

  // 8. Función para formatear fecha para el nombre de archivo
  function formatearFechaArchivo(fechaObj) {
    const dia = fechaObj.getDate().toString().padStart(2, '0');
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
    const año = fechaObj.getFullYear();
    return `${dia}_${mes}_${año}`;
  }

  const fechaActual = new Date();
  const fechaFormato = formatearFechaArchivo(fechaActual);
  const nombrePersona = (datosGuardados['your-name'] || 'sin_nombre')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '');

  // 9. Generar y descargar el documento
  try {
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `cuestionario_${nombrePersona}_${fechaFormato}.docx`);
    console.log('Documento Word generado exitosamente.');
  } catch (error) {
    console.error('Error al generar el documento Word:', error);
    alert('Error al generar el documento Word. Revisa la consola.');
  }
});
});
