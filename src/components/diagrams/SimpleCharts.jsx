import React, { useEffect } from 'react';
import Chart from 'chart.js/auto';

export default function SimpleCharts() {
  useEffect(() => {
    // Crear gráficos simples
    createCostComparisonChart();
    createPieChart();
    createRoiChart();
    createEfficiencyChart();
    createFinancialChart();
    
    // Función para limpiar los gráficos al desmontar
    return () => {
      // Limpiar los gráficos si es necesario
    };
  }, []);
  
  // Función para crear el gráfico de comparación de costos
  const createCostComparisonChart = () => {
    const container = document.getElementById('cost-comparison-container');
    if (!container) return;
    
    // Limpiar el contenedor
    container.innerHTML = '';
    
    // Crear el canvas
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    // Crear el gráfico
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Modelo Tradicional', 'Agentes IA RAG'],
        datasets: [{
          data: [3600000, 1980000],
          backgroundColor: ['rgba(239, 68, 68, 0.8)', 'rgba(74, 222, 128, 0.8)'],
          borderColor: ['rgba(239, 68, 68, 1)', 'rgba(74, 222, 128, 1)'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return '$' + context.raw.toLocaleString('es-CL');
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              callback: function(value) {
                return '$' + (value / 1000000).toFixed(1) + 'M';
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          x: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  };
  
  // Función para crear el gráfico de distribución de costos
  const createPieChart = () => {
    const container = document.getElementById('pie-charts-container');
    if (!container) return;
    
    // Limpiar el contenedor
    container.innerHTML = '';
    
    // Crear el canvas
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    // Datos para el gráfico
    const categories = [
      'Personal',
      'Procesamiento',
      'Infraestructura',
      'Corrección errores',
      'Capacitación',
      'Software',
      'Horas extras'
    ];
    
    const traditionalValues = [1200000, 850000, 450000, 350000, 220000, 380000, 150000];
    const ragValues = [480000, 340000, 380000, 70000, 180000, 480000, 50000];
    
    // Crear el gráfico
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [
          {
            label: 'Modelo Tradicional',
            data: traditionalValues,
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 1
          },
          {
            label: 'Agentes IA RAG',
            data: ragValues,
            backgroundColor: 'rgba(74, 222, 128, 0.8)',
            borderColor: 'rgba(74, 222, 128, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              callback: function(value) {
                if (value >= 1000000) {
                  return '$' + (value / 1000000).toFixed(1) + 'M';
                } else if (value >= 1000) {
                  return '$' + (value / 1000).toFixed(0) + 'K';
                }
                return '$' + value;
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          y: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  };
  
  // Función para crear el gráfico de ROI
  const createRoiChart = () => {
    const container = document.getElementById('roi-chart-container');
    if (!container) return;
    
    // Limpiar el contenedor
    container.innerHTML = '';
    
    // Crear el canvas
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    // Crear el gráfico
    new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Mes 1', 'Mes 3', 'Mes 6', 'Mes 9', 'Mes 12'],
        datasets: [
          {
            label: 'Inversión',
            data: [8500000, 8500000, 8500000, 8500000, 8500000],
            borderColor: 'rgba(239, 68, 68, 0.8)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            fill: false
          },
          {
            label: 'Ahorro Acumulado',
            data: [1620000, 4860000, 9720000, 14580000, 19440000],
            borderColor: 'rgba(74, 222, 128, 0.8)',
            backgroundColor: 'rgba(74, 222, 128, 0.1)',
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: 'rgba(74, 222, 128, 1)',
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          }
        },
        scales: {
          y: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              callback: function(value) {
                return '$' + (value / 1000000).toFixed(1) + 'M';
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          x: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        }
      }
    });
  };
  
  // Función para crear el gráfico de eficiencia
  const createEfficiencyChart = () => {
    const container = document.getElementById('efficiency-chart-container');
    if (!container) return;
    
    // Limpiar el contenedor
    container.innerHTML = '';
    
    // Crear el canvas
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    // Crear el gráfico
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['T. Respuesta', 'Consultas/h', 'Precisión', 'Disponib.'],
        datasets: [
          {
            label: 'Tradicional',
            data: [100, 100, 95, 40],
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 1
          },
          {
            label: 'IA RAG',
            data: [25, 400, 98, 100],
            backgroundColor: 'rgba(74, 222, 128, 0.8)',
            borderColor: 'rgba(74, 222, 128, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              callback: function(value) {
                return value + '%';
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          x: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  };
  
  // Función para crear el gráfico financiero
  const createFinancialChart = () => {
    const container = document.getElementById('financial-chart-container');
    if (!container) return;
    
    // Limpiar el contenedor
    container.innerHTML = '';
    
    // Crear el canvas
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    // Crear el gráfico
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Ventas', 'Costos', 'Margen'],
        datasets: [
          {
            label: 'Tradicional',
            data: [10000000, 3600000, 2000000],
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 1
          },
          {
            label: 'IA RAG',
            data: [10000000, 1980000, 3620000],
            backgroundColor: 'rgba(74, 222, 128, 0.8)',
            borderColor: 'rgba(74, 222, 128, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              callback: function(value) {
                return '$' + (value / 1000000).toFixed(1) + 'M';
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          x: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  };
  
  return null;
}