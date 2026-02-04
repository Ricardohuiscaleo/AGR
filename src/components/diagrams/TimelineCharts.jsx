import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function TimelineCharts() {
  // Referencias para los gráficos
  const costComparisonChartRef = useRef(null);
  const roiChartRef = useRef(null);
  const efficiencyChartRef = useRef(null);
  const financialChartRef = useRef(null);

  // Almacenar las instancias de Chart.js para limpiarlas después
  const chartInstances = useRef([]);

  // Configuración de colores
  const colors = {
    traditional: {
      primary: 'rgba(239, 68, 68, 0.8)', // Rojo
      secondary: 'rgba(239, 68, 68, 0.2)',
      border: 'rgba(239, 68, 68, 1)',
    },
    rag: {
      primary: 'rgba(74, 222, 128, 0.8)', // Verde
      secondary: 'rgba(74, 222, 128, 0.2)',
      border: 'rgba(74, 222, 128, 1)',
    },
    categories: [
      'rgba(251, 191, 36, 0.8)', // Amarillo
      'rgba(129, 140, 248, 0.8)', // Indigo
      'rgba(239, 68, 68, 0.8)', // Rojo
      'rgba(34, 211, 238, 0.8)', // Cyan
      'rgba(167, 139, 250, 0.8)', // Violeta
      'rgba(16, 185, 129, 0.8)', // Esmeralda
      'rgba(245, 158, 11, 0.8)', // Ambar
    ],
  };

  // Función para buscar e inicializar contenedores externos
  const mountChartToExternalContainer = (chartId, chartCanvas) => {
    const externalContainer = document.getElementById(chartId);
    if (externalContainer && chartCanvas.current) {
      // Asegurarse de que el contenedor esté vacío antes de agregar el canvas
      while (externalContainer.firstChild) {
        externalContainer.removeChild(externalContainer.firstChild);
      }

      // Creamos un contenedor para mantener el tamaño adecuado
      const chartWrapper = document.createElement('div');
      chartWrapper.style.width = '100%';
      chartWrapper.style.height = '100%';
      chartWrapper.style.position = 'relative';

      // Agregamos el canvas al contenedor externo
      externalContainer.appendChild(chartWrapper);
      chartWrapper.appendChild(chartCanvas.current);

      return true;
    }
    return false;
  };

  // Función para verificar si estamos en un dispositivo móvil
  const isMobile = () => {
    return window.innerWidth < 768;
  };

  // Función para detectar pantallas medianas (rango problemático 800-900px)
  const isMediumScreen = () => {
    return window.innerWidth >= 768 && window.innerWidth <= 950;
  };

  // Función para ajustar la configuración de los gráficos según el dispositivo
  const getResponsiveOptions = (defaultOptions, chartType) => {
    const options = { ...defaultOptions };

    // Ajustes para dispositivos móviles
    if (isMobile()) {
      // Reducir el tamaño de la fuente
      if (options.plugins && options.plugins.legend) {
        options.plugins.legend.labels = {
          ...(options.plugins.legend.labels || {}),
          font: {
            ...(options.plugins.legend.labels?.font || {}),
            size: 9,
          },
          boxWidth: 10,
        };
      }

      // Para gráficos de tipo pastel (doughnut), ajustar la posición de la leyenda
      if (chartType === 'doughnut') {
        if (options.plugins && options.plugins.legend) {
          options.plugins.legend.position = 'bottom';
        }
      }

      // Ajustes para escalas en gráficos de barra o línea
      if (options.scales) {
        if (options.scales.y) {
          options.scales.y.ticks = {
            ...(options.scales.y.ticks || {}),
            font: {
              size: 8,
            },
          };
        }
        if (options.scales.x) {
          options.scales.x.ticks = {
            ...(options.scales.x.ticks || {}),
            font: {
              size: 8,
            },
          };
        }
      }
    }
    // Ajustes específicos para pantallas medianas (800-900px)
    else if (isMediumScreen()) {
      // Para gráficos de tipo pastel/donut, modificamos la posición y tamaño de la leyenda
      if (chartType === 'doughnut') {
        if (options.plugins && options.plugins.legend) {
          // Colocar la leyenda abajo en este rango de pantallas
          options.plugins.legend.position = 'bottom';
          options.plugins.legend.labels = {
            ...(options.plugins.legend.labels || {}),
            font: {
              ...(options.plugins.legend.labels?.font || {}),
              size: 9, // Reducimos un poco el tamaño de fuente
            },
            boxWidth: 10,
            padding: 4,
          };
        }
      }

      // Ajustes para todos los tipos de gráficos en pantallas medianas
      if (options.plugins && options.plugins.legend) {
        options.plugins.legend.labels = {
          ...(options.plugins.legend.labels || {}),
          font: {
            ...(options.plugins.legend.labels?.font || {}),
            size: options.plugins.legend.labels?.font?.size || 10,
          },
        };
      }
    }

    return options;
  };

  useEffect(() => {
    // Optimizar para dispositivos móviles
    if (isMobile()) {
      // Reducir la calidad de animación en dispositivos móviles
      Chart.defaults.animation.duration = 500;
      Chart.defaults.animation.easing = 'linear';
      Chart.defaults.responsive = true;
      Chart.defaults.maintainAspectRatio = false;
    }
    
    // Limpiar gráficos anteriores
    if (chartInstances.current) {
      chartInstances.current.forEach((chart) => {
        if (chart) chart.destroy();
      });
      chartInstances.current = [];
    }

    // Crear nuevos canvas para cada gráfico
    costComparisonChartRef.current = document.createElement('canvas');
    const costDistributionChartRef = document.createElement('canvas');
    roiChartRef.current = document.createElement('canvas');
    efficiencyChartRef.current = document.createElement('canvas');
    financialChartRef.current = document.createElement('canvas');

    // Intentar montar los gráficos en contenedores externos
    mountChartToExternalContainer('cost-comparison-container', costComparisonChartRef);

    // Para el gráfico de distribución
    const pieChartsContainer = document.getElementById('pie-charts-container');
    if (pieChartsContainer) {
      // Limpiar el contenedor
      while (pieChartsContainer.firstChild) {
        pieChartsContainer.removeChild(pieChartsContainer.firstChild);
      }

      // Crear un contenedor para el nuevo gráfico de barras
      const chartContainer = document.createElement('div');
      chartContainer.className = 'w-full h-full';
      chartContainer.style.width = '100%';
      chartContainer.style.height = '100%';
      chartContainer.style.position = 'relative';

      // Título para el gráfico
      const title = document.createElement('p');
      title.className = 'text-center text-amber-400 mb-4 font-medium text-base md:text-lg';
      title.textContent = '';
      pieChartsContainer.appendChild(title);

      // Agregar el canvas al contenedor
      chartContainer.appendChild(costDistributionChartRef);
      pieChartsContainer.appendChild(chartContainer);

      // Guardar la referencia del canvas
      window.costDistributionChartCanvas = costDistributionChartRef;

      // Crear y montar el gráfico de barras comparativas
      initCostDistributionChart(costDistributionChartRef);
    }

    // Montar los demás gráficos
    mountChartToExternalContainer('roi-chart-container', roiChartRef);
    mountChartToExternalContainer('efficiency-chart-container', efficiencyChartRef);
    mountChartToExternalContainer('financial-chart-container', financialChartRef);

    // Iniciar la creación de gráficos
    initCharts();

    // Optimizar el manejo de eventos de redimensionamiento
    let resizeTimeout;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Destruir gráficos existentes
        chartInstances.current.forEach((chart) => {
          if (chart) chart.destroy();
        });
        chartInstances.current = [];

        // Volver a inicializar gráficos
        initCharts();
        
        // Recrear el gráfico de distribución
        if (window.costDistributionChartCanvas) {
          initCostDistributionChart(window.costDistributionChartCanvas);
        }
      }, 300);
    };

    // Usar passive: true para mejorar el rendimiento
    window.addEventListener('resize', handleResize, { passive: true });

    // Limpiar al desmontar
    return () => {
      chartInstances.current.forEach((chart) => {
        if (chart) chart.destroy();
      });
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const initCharts = () => {
    // Evitar inicializar múltiples veces
    if (chartInstances.current.length > 0) return;
    
    // 1. Gráfico de comparación de costos
    if (costComparisonChartRef.current) {
      const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return '$' + (value / 1000000).toFixed(1) + 'M';
              },
              color: 'rgba(255, 255, 255, 0.7)',
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
          x: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
            },
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return '$' + context.raw.toLocaleString('es-CL');
              },
            },
          },
        },
      };

      const responsiveOptions = getResponsiveOptions(defaultOptions, 'bar');

      const costComparisonChart = new Chart(costComparisonChartRef.current, {
        type: 'bar',
        data: {
          labels: ['Modelo Tradicional', 'Agentes IA RAG'],
          datasets: [
            {
              data: [3600000, 1980000],
              backgroundColor: [colors.traditional.primary, colors.rag.primary],
              borderColor: [colors.traditional.border, colors.rag.border],
              borderWidth: 1,
            },
          ],
        },
        options: responsiveOptions,
      });
      chartInstances.current.push(costComparisonChart);
    }

    // 2. Gráfico de retorno de inversión
    if (roiChartRef.current) {
      const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            ticks: {
              callback: function (value) {
                return '$' + (value / 1000000).toFixed(1) + 'M';
              },
              color: 'rgba(255, 255, 255, 0.7)',
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
          x: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: 'rgba(255, 255, 255, 0.7)',
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.dataset.label || '';
                return label + ': $' + context.raw.toLocaleString('es-CL');
              },
            },
          },
        },
      };

      const responsiveOptions = getResponsiveOptions(defaultOptions, 'line');

      // En móvil, reducimos los puntos de datos para mejor visualización
      const labels = isMobile()
        ? ['Mes 1', 'Mes 3', 'Mes 6', 'Mes 9', 'Mes 12']
        : [
            'Mes 1', 'Mes 2', 'Mes 3', 'Mes 4', 'Mes 5', 'Mes 6',
            'Mes 7', 'Mes 8', 'Mes 9', 'Mes 10', 'Mes 11', 'Mes 12',
          ];

      const investmentData = isMobile()
        ? [8500000, 8500000, 8500000, 8500000, 8500000]
        : [
            8500000, 8500000, 8500000, 8500000, 8500000, 8500000,
            8500000, 8500000, 8500000, 8500000, 8500000, 8500000,
          ];

      const savingsData = isMobile()
        ? [1620000, 4860000, 9720000, 14580000, 19440000]
        : [
            1620000, 3240000, 4860000, 6480000, 8100000, 9720000,
            11340000, 12960000, 14580000, 16200000, 17820000, 19440000,
          ];

      const roiChart = new Chart(roiChartRef.current, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Inversión',
              data: investmentData,
              borderColor: 'rgba(239, 68, 68, 0.8)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderWidth: 2,
              pointRadius: 0,
              fill: false,
            },
            {
              label: 'Ahorro Acumulado',
              data: savingsData,
              borderColor: 'rgba(74, 222, 128, 0.8)',
              backgroundColor: 'rgba(74, 222, 128, 0.1)',
              borderWidth: 2,
              pointRadius: isMobile() ? 2 : 3,
              pointBackgroundColor: 'rgba(74, 222, 128, 1)',
              fill: true,
            },
          ],
        },
        options: responsiveOptions,
      });
      chartInstances.current.push(roiChart);
    }

    // 3. Gráfico de eficiencia operativa
    if (efficiencyChartRef.current) {
      const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return value + '%';
              },
              color: 'rgba(255, 255, 255, 0.7)',
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
          x: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
            },
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: 'rgba(255, 255, 255, 0.7)',
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.dataset.label || '';
                return label + ': ' + context.raw + '%';
              },
            },
          },
        },
      };

      const responsiveOptions = getResponsiveOptions(defaultOptions, 'bar');

      // Simplificar etiquetas para móvil
      const labels = isMobile()
        ? ['T. Respuesta', 'Consultas/h', 'Precisión', 'Disponib.']
        : ['Tiempo de Respuesta', 'Consultas por Hora', 'Precisión', 'Disponibilidad'];

      const efficiencyChart = new Chart(efficiencyChartRef.current, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Tradicional',
              data: [100, 100, 95, 40],
              backgroundColor: colors.traditional.primary,
              borderColor: colors.traditional.border,
              borderWidth: 1,
            },
            {
              label: 'IA RAG',
              data: [25, 400, 98, 100],
              backgroundColor: colors.rag.primary,
              borderColor: colors.rag.border,
              borderWidth: 1,
            },
          ],
        },
        options: responsiveOptions,
      });
      chartInstances.current.push(efficiencyChart);
    }

    // 4. Gráfico de impacto financiero
    if (financialChartRef.current) {
      const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return '$' + (value / 1000000).toFixed(1) + 'M';
              },
              color: 'rgba(255, 255, 255, 0.7)',
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
          x: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
            },
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: 'rgba(255, 255, 255, 0.7)',
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.dataset.label || '';
                return label + ': $' + context.raw.toLocaleString('es-CL');
              },
            },
          },
        },
      };

      const responsiveOptions = getResponsiveOptions(defaultOptions, 'bar');

      const financialChart = new Chart(financialChartRef.current, {
        type: 'bar',
        data: {
          labels: ['Ventas', 'Costos', 'Margen'],
          datasets: [
            {
              label: 'Tradicional',
              data: [10000000, 3600000, 2000000],
              backgroundColor: colors.traditional.primary,
              borderColor: colors.traditional.border,
              borderWidth: 1,
            },
            {
              label: 'IA RAG',
              data: [10000000, 1980000, 3620000],
              backgroundColor: colors.rag.primary,
              borderColor: colors.rag.border,
              borderWidth: 1,
            },
          ],
        },
        options: responsiveOptions,
      });
      chartInstances.current.push(financialChart);
    }
  };

  const initCostDistributionChart = (chartCanvas) => {
    if (!chartCanvas) return;
    
    // Verificar si ya existe un gráfico para este canvas
    const existingChartIndex = chartInstances.current.findIndex(
      chart => chart.canvas === chartCanvas
    );
    
    // Si ya existe un gráfico para este canvas, no crear uno nuevo
    if (existingChartIndex !== -1) return;

    // Función para determinar el breakpoint responsive
    const getResponsiveBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 480) return 'mobile';
      if (width < 950) return 'medium';
      return 'desktop';
    };

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        y: {
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            font: {
              size: getResponsiveBreakpoint() === 'mobile' ? 10 : 11,
            },
            padding: getResponsiveBreakpoint() === 'mobile' ? 4 : 8,
          },
          grid: {
            display: false,
          },
        },
        x: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              if (value >= 1000000) {
                return '$' + (value / 1000000).toFixed(1) + 'M';
              } else if (value >= 1000) {
                return '$' + (value / 1000).toFixed(0) + 'K';
              }
              return '$' + value;
            },
            color: 'rgba(255, 255, 255, 0.7)',
            font: {
              size: getResponsiveBreakpoint() === 'mobile' ? 9 : 10,
            },
            maxRotation: 0,
            minRotation: 0,
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
      plugins: {
        legend: {
          position: getResponsiveBreakpoint() === 'desktop' ? 'top' : 'bottom',
          labels: {
            color: 'rgba(255, 255, 255, 0.7)',
            padding: getResponsiveBreakpoint() === 'mobile' ? 10 : 15,
            font: {
              size: getResponsiveBreakpoint() === 'mobile' ? 10 : 11,
            },
            boxWidth: getResponsiveBreakpoint() === 'mobile' ? 12 : 15,
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || '';
              return label + ': $' + context.raw.toLocaleString('es-CL');
            },
          },
        },
      },
      animation: {
        duration: isMobile() ? 500 : 1000,
      },
    };

    // Datos para ordenar
    const categories = [
      'Personal',
      'Procesamiento',
      'Infraestructura',
      'Corrección errores',
      'Capacitación',
      'Software',
      'Horas extras',
    ];

    const traditionalValues = [1200000, 850000, 450000, 350000, 220000, 380000, 150000];
    const ragValues = [480000, 340000, 380000, 70000, 180000, 480000, 50000];

    // Crear pares de [categoría, valor] para poder ordenarlos
    const pairs = categories.map((category, index) => ({
      category,
      traditional: traditionalValues[index],
      rag: ragValues[index],
    }));

    // Ordenar pares de mayor a menor según valores tradicionales
    pairs.sort((a, b) => b.traditional - a.traditional);

    // Extraer categorías y valores ordenados
    const sortedCategories = pairs.map((pair) => pair.category);
    const sortedTraditionalValues = pairs.map((pair) => pair.traditional);
    const sortedRagValues = pairs.map((pair) => pair.rag);

    // Simplificar etiquetas para pantallas pequeñas
    const getSimplifiedLabel = (label) => {
      if (getResponsiveBreakpoint() === 'mobile') {
        switch (label) {
          case 'Procesamiento':
            return 'Proc.';
          case 'Infraestructura':
            return 'Infra.';
          case 'Corrección errores':
            return 'Errores';
          case 'Capacitación':
            return 'Capac.';
          case 'Horas extras':
            return 'H.Extra';
          default:
            return label;
        }
      }
      return label;
    };

    const labels = sortedCategories.map(getSimplifiedLabel);

    const costDistributionChart = new Chart(chartCanvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Modelo Tradicional',
            data: sortedTraditionalValues,
            backgroundColor: colors.traditional.primary,
            borderColor: colors.traditional.border,
            borderWidth: 1,
          },
          {
            label: 'Agentes IA RAG',
            data: sortedRagValues,
            backgroundColor: colors.rag.primary,
            borderColor: colors.rag.border,
            borderWidth: 1,
          },
        ],
      },
      options: defaultOptions,
    });

    chartInstances.current.push(costDistributionChart);
  };

  // No necesitamos retornar nada visible, ya que los gráficos se montan en contenedores existentes
  return null;
}