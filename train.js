import { createChart, updateChart } from "./scatterplot.js";

const nn = ml5.neuralNetwork({ task: "regression", debug: true });

// Domme elementen
const predictButton = document.getElementById("btn");
const inputFieldValue = document.getElementById("field").value;
const resultDiv = document.getElementById("result");

// Event listener
predictButton.addEventListener("click", (e) => {
  e.preventDefault();
  makePrediction(+inputFieldValue);
});

// 1 - Laden van een CSV
function loadData() {
  Papa.parse("./data/cars.csv", {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: (results) => createNeuralNetwork(results.data),
  });
}

// Het aanmaken van een neural network
function createNeuralNetwork(data) {
  // shuffle
  data.sort(() => Math.random() - 0.5);

  // Data toevoegen aan neural network
  for (let car of data) {
    nn.addData({ horsepower: car.horsepower }, { mpg: car.mpg });
  }

  // normalize
  nn.normalizeData();
  checkData(data);
}

// Checkt of inladen van CSV goed is gegaan
function checkData(data) {
  console.table(data);
  const chartdata = data.map((car) => ({
    x: car.horsepower,
    y: car.mpg,
  }));
  startTraining();
  // chartjs aanmaken
  createChart(chartdata, "Horsepower", "MPG"); // scatterplot
}

// 2 - Trainen van een neural network
function startTraining() {
  nn.train({ epochs: 10 }, () => finishedTraining());
}

async function finishedTraining() {
  let predictions = [];
  for (let hp = 40; hp < 250; hp += 2) {
    const pred = await nn.predict({ horsepower: hp });
    predictions.push({ x: hp, y: pred[0].mpg });
  }
  updateChart("Predictions", predictions);
  console.log("Finished training!");
}
// 3 - Doen van een voorspelling
async function makePrediction(value) {
  const results = await nn.predict({ horsepower: value });
  resultDiv.innerText = `Geschat verbruik: ${results[0].mpg}`;
}

loadData();