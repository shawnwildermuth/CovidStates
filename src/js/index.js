import "jquery";
import "bootstrap";
import "../css/site.css";
import 'bootstrap/dist/css/bootstrap.min.css';

import {
  Chart
} from "chart.js"
import axios from "axios";

let _rawData, _stateCombo, _chart = null;

function createChart(state) {
  console.log("Creating Chart");
  let generated = generateData(state);
  if (_chart) _chart.destroy();
  _chart = new Chart("theChart", {
    data: {
      labels: generated.labels,
      datasets: [{
        label: "Infected",
        fill: false,
        borderColor: "Red",
        lineTension: 0,
        data: generated.infected
      }, {
        label: "Hospitalized",
        fill: false,
        borderColor: "Green",
        lineTension: 0,
        data: generated.hospitalized
      }, {
        label: "Deaths",
        fill: false,
        borderColor: "Black",
        lineTension: 0,
        data: generated.dead
      }]
    },
    type: "line",
    options: {
      title: {
        display: true,
        text: "COVID-19 Infection Rates for " + _stateCombo.options[_stateCombo.selectedIndex].innerText,
        fontSize: 18,
        fontStyle: "Bold"
      },
      legend: {
        position: "bottom"
      },
      tooltips: {
        callbacks: {
          afterBody: function (items, data) {
            const item = items[0];
            if (item.index > 0 && data.datasets[item.datasetIndex].data[item.index - 1] > 0) {
              const currentValue = data.datasets[item.datasetIndex].data[item.index];
              const lastValue = data.datasets[item.datasetIndex].data[item.index - 1];
              return ["Change: " + Number(((currentValue - lastValue) / lastValue) * 100).toFixed(2) + "%"];
            }
            return ["Change: 0%"];
          }
        }
      }
    }
  });
}

function formatDate(date) {
  let theDate = new String(date);
  return theDate.substring(0, 4) + "-" + theDate.substring(4, 6) + "-" + theDate.substring(6, 8);
}

function generateData(state) {
  let stateData = _rawData.filter(d => d.state == state);
  stateData.sort((a,b) => {
    if (a == b) return 0;
    if (a < b) return 1;
    return -1
  });
  let infected = stateData.map(d => d.positive);
  let hospitalized = stateData.map(d => d.hospitalized);
  let dead = stateData.map(d => d.death);
  let dailyChanges = stateData.map((d, i, a) => {
    return a > 0 ? (d.infected - a[i - 1]) / a[i - 1] : 0.0;
  });
  let labels = stateData.map(d => formatDate(d.date));
  return {
    infected,
    hospitalized,
    dead,
    dailyChanges,
    labels
  };
}

async function init() {
  _stateCombo = document.getElementById("theState");
  _stateCombo.addEventListener("change", e => {
    if (_stateCombo.value) {
      createChart(_stateCombo.value);
    }
  });
  let result = await axios.get("https://covidtracking.com/api/states/daily");
  if (result.status == 200) {
    _rawData = result.data;
  } else {
    let errorBlock = document.getElementById("error");
    errorBlock.innerText = "Failed to load data...";
    errorBlock.style = "display: block;";
  }
}
1
init();