import { Chart } from "chart.js"
import axios from "axios";

let _stateData, _stateCombo, _chart = null;
let rootUrl = "https://covidstates.azurewebsites.net/";

function createChart(state) {
  console.log("Creating Chart");
  let generated = generateData(state);
  let subtitle = "Current Numbers: ";
  function shouldShow(value, key) {
    return value && value[key];
  }
  function showPercentage(value) {
    return isFinite(value) ? ` (*${value}%)` : "" ;
  }
  if (shouldShow(generated.current, "infections")) subtitle += `infected: ${generated.current.infections}${showPercentage(generated.current.infectionsPercent)} `;
  if (shouldShow(generated.current, "hospitalized")) subtitle += `hospitalized: ${generated.current.hospitalized}${showPercentage(generated.current.hospitalizedPercent)} `;
  if (shouldShow(generated.current, "deaths")) subtitle += `deaths: ${generated.current.deaths}${showPercentage(generated.current.deathsPercent)}`;
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
      animation: false,
      title: {
        display: true,
        text: [
          "Infection Rates for " + _stateCombo.options[_stateCombo.selectedIndex].innerText,
          `As of: ${generated.current.lastDate}`,
          subtitle
        ],
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

  let link = document.getElementById("theLink");
  if (link) {
    link.href = `${rootUrl}?state=${state}`;
    link.innerText = `${rootUrl}?state=${state}`
  }
}

function formatDate(date) {
  let theDate = new String(date);
  return theDate.substring(0, 4) + "-" + theDate.substring(4, 6) + "-" + theDate.substring(6, 8);
}

function categorizeData(rawData) {
  _stateData = rawData.reduce((map, obj) => {
    if (map[obj.state]) map[obj.state].push(obj);
    else map[obj.state] = [obj];
    return map;
  }, {});
  for (let item in _stateData) {
    _stateData[item].sort((a, b) => {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return 0;
    })
  }
}

function generateData(state) {
  let stateData = _stateData[state]
  let infected = stateData.map(d => d.positive);
  let hospitalized = stateData.map(d => d.hospitalized);
  let dead = stateData.map(d => d.death);
  let dailyChanges = stateData.map((d, i, a) => {
    return a > 0 ? (d.infected - a[i - 1]) / a[i - 1] : 0.0;
  });
  let labels = stateData.map(d => formatDate(d.date));
  let current = {
    infections: infected[infected.length - 1],
    infectionsPercent: calcPercentage(infected),
    hospitalized: hospitalized[hospitalized.length - 1],
    hospitalizedPercent: calcPercentage(hospitalized),
    deaths: dead[dead.length - 1],
    deathsPercent: calcPercentage(dead),
    lastDate: labels[labels.length - 1]
  };

  return {
    infected,
    hospitalized,
    dead,
    dailyChanges,
    labels,
    current
  };
}

function calcPercentage(coll) {
  return (((coll[coll.length - 1] - coll[coll.length - 2]) / coll[coll.length - 2]) * 100).toFixed(2);
}

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function init() {
  _stateCombo = document.getElementById("theState");
  _stateCombo.addEventListener("change", e => {
    if (_stateCombo.value) {
      createChart(_stateCombo.value);
    }
  });
  axios.get("https://covidtracking.com/api/states/daily")
    .then(result => {
      if (result.status == 200) {
        categorizeData(result.data);
        let stateParam = getUrlParameter("state").toUpperCase();
        if (!stateParam || !_stateData[stateParam]) {
          let largest = "";
          for (let key in _stateData) {
            if (!largest) largest = key;
            else {
              let currentLast = lastItem(_stateData[key]);
              let biggest = lastItem(_stateData[largest]);
              if (currentLast.positive > biggest.positive) {
                largest = key;
              }
            }
          }
          stateParam = largest;
        }
        _stateCombo.value = stateParam;
        createChart(stateParam);
      }
    }).catch(e => {
      let errorBlock = document.getElementById("error");
      errorBlock.innerText = "Failed to load data...";
      errorBlock.style = "display: block;";
    });
}

function lastItem(arr) {
  if (arr) {
    return arr[arr.length - 1];
  }
  return null;
}

init();