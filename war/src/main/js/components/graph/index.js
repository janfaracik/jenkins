import Chart from "chart.js/auto";

function init() {
  const ctx = document.getElementById("myChart");
  const things = eval(ctx.dataset.labels).reverse();
  const labels = things.map((e) => e.label).map((e) => "#" + e);
  const values = eval(ctx.dataset.values).reverse();

  const textColor = getComputedStyle(ctx).getPropertyValue("--text-color");

  const skipped = (context) => {
    if (context.p0DataIndex >= things.length) {
      return "orange";
    }

    let color = things[context.p0DataIndex].color;

    if (color === "blue") {
      color = "green";
    }

    return getComputedStyle(ctx).getPropertyValue("--" + color);
  };

  Chart.defaults.font.weight = 500;
  Chart.defaults.color = textColor;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          data: values,
          fill: "start",
          segment: {
            backgroundColor: () => "transparent",
            borderColor: (ctx) => skipped(ctx),
            backgroundOpacity: 0.5,
          },
          // spanGaps: true,
          pointStyle: false,
          // pointRadius: 1,
          // pointHoverRadius: 10
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
      },
      elements: {
        line: {
          tension: 0.3,
        },
      },
      scales: {
        x: {
          border: {
            display: false,
          },
          grid: {
            drawOnChartArea: false,
          },
        },
        y: {
          border: {
            display: false,
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    },
  });

  // Jumplists.init();
}

export default { init };
