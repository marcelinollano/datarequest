import { LightningElement, wire, api } from "lwc";
import { loadScript } from "lightning/platformResourceLoader";
import chartjs from "@salesforce/resourceUrl/chartJs";
import stats from "@salesforce/apex/ContactController.stats";

export default class Chart extends LightningElement {
  @api completed;
  @api pending;

  @wire(stats) stats({ error, data }) {
    if (data) {
      this.completed = data[0];
      this.pending = data[1];
      data.forEach((count) => {
        this.updateChart(count);
      });
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.accounts = undefined;
    }
  }

  error;
  chart;
  chartjsInitialized = false;
  message;

  config = {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [],
          backgroundColor: ["rgb(128, 143, 219)", "rgb(255, 99, 132)"]
        }
      ],
      labels: ["Contacts Completed", "Contacts Pending"]
    },
    options: {
      legend: {
        display: false
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  };

  renderedCallback() {
    if (this.chartjsInitialized) {
      return;
    }
    this.chartjsInitialized = true;
    (async () => {
      await loadScript(this, chartjs)
        .then(() => {
          const canvas = document.createElement("canvas");
          this.template.querySelector("div.doughnut").appendChild(canvas);
          const ctx = canvas.getContext("2d");
          this.chart = new window.Chart(ctx, this.config);
          this.chart.canvas.parentNode.style.height = "auto";
          this.chart.canvas.parentNode.style.width = "100%";
        })
        .catch((error) => {
          this.error = error;
        });
    })();
  }

  updateChart(count) {
    if (this.chart != undefined) {
      this.chart.data.datasets[0].data.push(count);
      this.chart.update();
    } else {
      window.location.reload();
    }
  }
}
