import { c as createComponent, g as renderComponent, f as renderTemplate } from './astro/server_DQ0m6GiM.mjs';
import 'kleur/colors';
import { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

function TimelineCharts() {
  const costComparisonChartRef = useRef(null);
  const roiChartRef = useRef(null);
  const efficiencyChartRef = useRef(null);
  const financialChartRef = useRef(null);
  const chartInstances = useRef([]);
  const colors = {
    traditional: {
      primary: "rgba(239, 68, 68, 0.8)",
      border: "rgba(239, 68, 68, 1)"
    },
    rag: {
      primary: "rgba(74, 222, 128, 0.8)",
      border: "rgba(74, 222, 128, 1)"
    }};
  const mountChartToExternalContainer = (chartId, chartCanvas) => {
    const externalContainer = document.getElementById(chartId);
    if (externalContainer && chartCanvas.current) {
      while (externalContainer.firstChild) {
        externalContainer.removeChild(externalContainer.firstChild);
      }
      const chartWrapper = document.createElement("div");
      chartWrapper.style.width = "100%";
      chartWrapper.style.height = "100%";
      chartWrapper.style.position = "relative";
      externalContainer.appendChild(chartWrapper);
      chartWrapper.appendChild(chartCanvas.current);
      return true;
    }
    return false;
  };
  const isMobile = () => {
    return window.innerWidth < 768;
  };
  const isMediumScreen = () => {
    return window.innerWidth >= 768 && window.innerWidth <= 950;
  };
  const getResponsiveOptions = (defaultOptions, chartType) => {
    const options = { ...defaultOptions };
    if (isMobile()) {
      if (options.plugins && options.plugins.legend) {
        options.plugins.legend.labels = {
          ...options.plugins.legend.labels || {},
          font: {
            ...options.plugins.legend.labels?.font || {},
            size: 9
          },
          boxWidth: 10
        };
      }
      if (chartType === "doughnut") {
        if (options.plugins && options.plugins.legend) {
          options.plugins.legend.position = "bottom";
        }
      }
      if (options.scales) {
        if (options.scales.y) {
          options.scales.y.ticks = {
            ...options.scales.y.ticks || {},
            font: {
              size: 8
            }
          };
        }
        if (options.scales.x) {
          options.scales.x.ticks = {
            ...options.scales.x.ticks || {},
            font: {
              size: 8
            }
          };
        }
      }
    } else if (isMediumScreen()) {
      if (chartType === "doughnut") {
        if (options.plugins && options.plugins.legend) {
          options.plugins.legend.position = "bottom";
          options.plugins.legend.labels = {
            ...options.plugins.legend.labels || {},
            font: {
              ...options.plugins.legend.labels?.font || {},
              size: 9
              // Reducimos un poco el tamaño de fuente
            },
            boxWidth: 10,
            padding: 4
          };
        }
      }
      if (options.plugins && options.plugins.legend) {
        options.plugins.legend.labels = {
          ...options.plugins.legend.labels || {},
          font: {
            ...options.plugins.legend.labels?.font || {},
            size: options.plugins.legend.labels?.font?.size || 10
          }
        };
      }
    }
    return options;
  };
  useEffect(() => {
    if (chartInstances.current) {
      chartInstances.current.forEach((chart) => {
        if (chart) chart.destroy();
      });
      chartInstances.current = [];
    }
    costComparisonChartRef.current = document.createElement("canvas");
    const costDistributionChartRef = document.createElement("canvas");
    roiChartRef.current = document.createElement("canvas");
    efficiencyChartRef.current = document.createElement("canvas");
    financialChartRef.current = document.createElement("canvas");
    mountChartToExternalContainer("cost-comparison-container", costComparisonChartRef);
    const pieChartsContainer = document.getElementById("pie-charts-container");
    if (pieChartsContainer) {
      while (pieChartsContainer.firstChild) {
        pieChartsContainer.removeChild(pieChartsContainer.firstChild);
      }
      const chartContainer = document.createElement("div");
      chartContainer.className = "w-full h-full";
      chartContainer.style.width = "100%";
      chartContainer.style.height = "100%";
      chartContainer.style.position = "relative";
      const title = document.createElement("p");
      title.className = "text-center text-amber-400 mb-4 font-medium text-base md:text-lg";
      title.textContent = "";
      pieChartsContainer.appendChild(title);
      chartContainer.appendChild(costDistributionChartRef);
      pieChartsContainer.appendChild(chartContainer);
      window.costDistributionChartCanvas = costDistributionChartRef;
      initCostDistributionChart(costDistributionChartRef);
    }
    mountChartToExternalContainer("roi-chart-container", roiChartRef);
    mountChartToExternalContainer(
      "efficiency-chart-container",
      efficiencyChartRef
    );
    mountChartToExternalContainer("financial-chart-container", financialChartRef);
    initCharts();
    const handleResize = () => {
      chartInstances.current.forEach((chart) => {
        if (chart) chart.destroy();
      });
      chartInstances.current = [];
      initCharts();
      if (window.costDistributionChartCanvas) {
        initCostDistributionChart(window.costDistributionChartCanvas);
      } else {
        const pieChartsContainer2 = document.getElementById("pie-charts-container");
        if (pieChartsContainer2) {
          while (pieChartsContainer2.firstChild) {
            pieChartsContainer2.removeChild(pieChartsContainer2.firstChild);
          }
          const newCanvas = document.createElement("canvas");
          const chartContainer = document.createElement("div");
          chartContainer.className = "w-full h-full";
          chartContainer.style.width = "100%";
          chartContainer.style.height = "100%";
          chartContainer.style.position = "relative";
          const title = document.createElement("p");
          title.className = "text-center text-amber-400 mb-4 font-medium text-base md:text-lg";
          title.textContent = "Comparación de Distribución de Costos";
          pieChartsContainer2.appendChild(title);
          chartContainer.appendChild(newCanvas);
          pieChartsContainer2.appendChild(chartContainer);
          window.costDistributionChartCanvas = newCanvas;
          initCostDistributionChart(newCanvas);
        }
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      chartInstances.current.forEach((chart) => {
        if (chart) chart.destroy();
      });
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const initCharts = () => {
    if (costComparisonChartRef.current) {
      const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return "$" + (value / 1e6).toFixed(1) + "M";
              },
              color: "rgba(255, 255, 255, 0.7)"
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)"
            }
          },
          x: {
            ticks: {
              color: "rgba(255, 255, 255, 0.7)"
            },
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
            // No necesitamos leyenda ya que las etiquetas están en el eje X
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return "$" + context.raw.toLocaleString("es-CL");
              }
            }
          }
        }
      };
      const responsiveOptions = getResponsiveOptions(defaultOptions, "bar");
      const costComparisonChart = new Chart(costComparisonChartRef.current, {
        type: "bar",
        data: {
          labels: ["Modelo Tradicional", "Agentes IA RAG"],
          datasets: [
            {
              data: [36e5, 198e4],
              backgroundColor: [colors.traditional.primary, colors.rag.primary],
              borderColor: [colors.traditional.border, colors.rag.border],
              borderWidth: 1
            }
          ]
        },
        options: responsiveOptions
      });
      chartInstances.current.push(costComparisonChart);
    }
    if (roiChartRef.current) {
      const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            ticks: {
              callback: function(value) {
                return "$" + (value / 1e6).toFixed(1) + "M";
              },
              color: "rgba(255, 255, 255, 0.7)"
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)"
            }
          },
          x: {
            ticks: {
              color: "rgba(255, 255, 255, 0.7)"
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)"
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: "rgba(255, 255, 255, 0.7)"
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || "";
                return label + ": $" + context.raw.toLocaleString("es-CL");
              }
            }
          }
        }
      };
      const responsiveOptions = getResponsiveOptions(defaultOptions, "line");
      const labels = isMobile() ? ["Mes 1", "Mes 3", "Mes 6", "Mes 9", "Mes 12"] : [
        "Mes 1",
        "Mes 2",
        "Mes 3",
        "Mes 4",
        "Mes 5",
        "Mes 6",
        "Mes 7",
        "Mes 8",
        "Mes 9",
        "Mes 10",
        "Mes 11",
        "Mes 12"
      ];
      const investmentData = isMobile() ? [85e5, 85e5, 85e5, 85e5, 85e5] : [
        85e5,
        85e5,
        85e5,
        85e5,
        85e5,
        85e5,
        85e5,
        85e5,
        85e5,
        85e5,
        85e5,
        85e5
      ];
      const savingsData = isMobile() ? [162e4, 486e4, 972e4, 1458e4, 1944e4] : [
        162e4,
        324e4,
        486e4,
        648e4,
        81e5,
        972e4,
        1134e4,
        1296e4,
        1458e4,
        162e5,
        1782e4,
        1944e4
      ];
      const roiChart = new Chart(roiChartRef.current, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Inversión",
              data: investmentData,
              borderColor: "rgba(239, 68, 68, 0.8)",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderWidth: 2,
              pointRadius: 0,
              fill: false
            },
            {
              label: "Ahorro Acumulado",
              data: savingsData,
              borderColor: "rgba(74, 222, 128, 0.8)",
              backgroundColor: "rgba(74, 222, 128, 0.1)",
              borderWidth: 2,
              pointRadius: isMobile() ? 2 : 3,
              pointBackgroundColor: "rgba(74, 222, 128, 1)",
              fill: true
            }
          ]
        },
        options: responsiveOptions
      });
      chartInstances.current.push(roiChart);
    }
    if (efficiencyChartRef.current) {
      const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value + "%";
              },
              color: "rgba(255, 255, 255, 0.7)"
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)"
            }
          },
          x: {
            ticks: {
              color: "rgba(255, 255, 255, 0.7)"
            },
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: "rgba(255, 255, 255, 0.7)"
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || "";
                return label + ": " + context.raw + "%";
              }
            }
          }
        }
      };
      const responsiveOptions = getResponsiveOptions(defaultOptions, "bar");
      const labels = isMobile() ? ["T. Respuesta", "Consultas/h", "Precisión", "Disponib."] : ["Tiempo de Respuesta", "Consultas por Hora", "Precisión", "Disponibilidad"];
      const efficiencyChart = new Chart(efficiencyChartRef.current, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Tradicional",
              data: [100, 100, 95, 40],
              backgroundColor: colors.traditional.primary,
              borderColor: colors.traditional.border,
              borderWidth: 1
            },
            {
              label: "IA RAG",
              data: [25, 400, 98, 100],
              backgroundColor: colors.rag.primary,
              borderColor: colors.rag.border,
              borderWidth: 1
            }
          ]
        },
        options: responsiveOptions
      });
      chartInstances.current.push(efficiencyChart);
    }
    if (financialChartRef.current) {
      const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return "$" + (value / 1e6).toFixed(1) + "M";
              },
              color: "rgba(255, 255, 255, 0.7)"
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)"
            }
          },
          x: {
            ticks: {
              color: "rgba(255, 255, 255, 0.7)"
            },
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: "rgba(255, 255, 255, 0.7)"
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || "";
                return label + ": $" + context.raw.toLocaleString("es-CL");
              }
            }
          }
        }
      };
      const responsiveOptions = getResponsiveOptions(defaultOptions, "bar");
      const financialChart = new Chart(financialChartRef.current, {
        type: "bar",
        data: {
          labels: ["Ventas", "Costos", "Margen"],
          datasets: [
            {
              label: "Tradicional",
              data: [1e7, 36e5, 2e6],
              backgroundColor: colors.traditional.primary,
              borderColor: colors.traditional.border,
              borderWidth: 1
            },
            {
              label: "IA RAG",
              data: [1e7, 198e4, 362e4],
              backgroundColor: colors.rag.primary,
              borderColor: colors.rag.border,
              borderWidth: 1
            }
          ]
        },
        options: responsiveOptions
      });
      chartInstances.current.push(financialChart);
    }
  };
  const initCostDistributionChart = (chartCanvas) => {
    if (!chartCanvas) return;
    const getResponsiveBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 480) return "mobile";
      if (width < 950) return "medium";
      return "desktop";
    };
    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      scales: {
        y: {
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            font: {
              size: getResponsiveBreakpoint() === "mobile" ? 10 : 11
            },
            padding: getResponsiveBreakpoint() === "mobile" ? 4 : 8
          },
          grid: {
            display: false
          }
        },
        x: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              if (value >= 1e6) {
                return "$" + (value / 1e6).toFixed(1) + "M";
              } else if (value >= 1e3) {
                return "$" + (value / 1e3).toFixed(0) + "K";
              }
              return "$" + value;
            },
            color: "rgba(255, 255, 255, 0.7)",
            font: {
              size: getResponsiveBreakpoint() === "mobile" ? 9 : 10
            },
            maxRotation: 0,
            minRotation: 0
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)"
          }
        }
      },
      plugins: {
        legend: {
          position: getResponsiveBreakpoint() === "desktop" ? "top" : "bottom",
          labels: {
            color: "rgba(255, 255, 255, 0.7)",
            padding: getResponsiveBreakpoint() === "mobile" ? 10 : 15,
            font: {
              size: getResponsiveBreakpoint() === "mobile" ? 10 : 11
            },
            boxWidth: getResponsiveBreakpoint() === "mobile" ? 12 : 15
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || "";
              return label + ": $" + context.raw.toLocaleString("es-CL");
            }
          },
          titleFont: {
            size: getResponsiveBreakpoint() === "mobile" ? 11 : 12
          },
          bodyFont: {
            size: getResponsiveBreakpoint() === "mobile" ? 10 : 11
          },
          padding: getResponsiveBreakpoint() === "mobile" ? 8 : 10
        }
      },
      layout: {
        padding: {
          left: 5,
          right: 15,
          top: getResponsiveBreakpoint() === "mobile" ? 10 : 15,
          bottom: getResponsiveBreakpoint() === "mobile" ? 10 : 15
        }
      },
      barPercentage: 0.85,
      categoryPercentage: 0.85
    };
    const categories = [
      "Personal",
      "Procesamiento",
      "Infraestructura",
      "Corrección errores",
      "Capacitación",
      "Software",
      "Horas extras"
    ];
    const traditionalValues = [12e5, 85e4, 45e4, 35e4, 22e4, 38e4, 15e4];
    const ragValues = [48e4, 34e4, 38e4, 7e4, 18e4, 48e4, 5e4];
    const pairs = categories.map((category, index) => ({
      category,
      traditional: traditionalValues[index],
      rag: ragValues[index]
    }));
    pairs.sort((a, b) => b.traditional - a.traditional);
    const sortedCategories = pairs.map((pair) => pair.category);
    const sortedTraditionalValues = pairs.map((pair) => pair.traditional);
    const sortedRagValues = pairs.map((pair) => pair.rag);
    const getSimplifiedLabel = (label) => {
      if (getResponsiveBreakpoint() === "mobile") {
        switch (label) {
          case "Procesamiento":
            return "Proc.";
          case "Infraestructura":
            return "Infra.";
          case "Corrección errores":
            return "Errores";
          case "Capacitación":
            return "Capac.";
          case "Horas extras":
            return "H.Extra";
          default:
            return label;
        }
      }
      return label;
    };
    const labels = sortedCategories.map(getSimplifiedLabel);
    const costDistributionChart = new Chart(chartCanvas, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Modelo Tradicional",
            data: sortedTraditionalValues,
            backgroundColor: colors.traditional.primary,
            borderColor: colors.traditional.border,
            borderWidth: 1
          },
          {
            label: "Agentes IA RAG",
            data: sortedRagValues,
            backgroundColor: colors.rag.primary,
            borderColor: colors.rag.border,
            borderWidth: 1
          }
        ]
      },
      options: defaultOptions
    });
    chartInstances.current.push(costDistributionChart);
  };
  return null;
}

const $$TimelineChartsWrapper = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "TimelineCharts", TimelineCharts, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/diagrams/TimelineCharts", "client:component-export": "default" })}`;
}, "/Users/ricardohuiscaleollafquen/Agente RAG Website 3/src/components/diagrams/TimelineChartsWrapper.astro", void 0);

export { $$TimelineChartsWrapper as $ };
