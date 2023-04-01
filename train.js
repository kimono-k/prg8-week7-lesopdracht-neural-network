import { createChart, updateChart } from "./scatterplot.js";

// Neural Network: Can find complex patterns in data and works with regression
// Regression: When the neural network gives back a numeric value
const nn = ml5.neuralNetwork({ task: "regression", debug: true });

// Getting DOM Elements
const predictButton = document.getElementById("btn");
const inputField = document.getElementById("field");
const resultDiv = document.getElementById("result");

// Initial hiding for elements
inputField.style.display = "none";
predictButton.style.display = "none";

/** 
 * Fires the predcition and shows it in the viewport
 */
predictButton.addEventListener("click", (e) => {
  e.preventDefault();
  let inputFieldValue = document.getElementById("field").value;
  makePrediction(+inputFieldValue);
});

// 1 - Loading the CSV file
function loadData() {
  Papa.parse("./data/cars.csv", {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: (results) => createNeuralNetwork(results.data),
  });
}

// Creating a Neural Network
function createNeuralNetwork(data) {
  /**
   * Shuffle: Prevents that the Neural Network learns the exact order of csv data
   */
  data.sort(() => Math.random() - 0.5);

  // Adding data to the Neural Network
  for (let car of data) {
    nn.addData({ horsepower: car.horsepower }, { mpg: car.mpg });
  }

  /**
   * Normalize: Prevents that some columns have higher precedence than others
   */
  nn.normalizeData();
  checkData(data);
}

/**
 * Checks if loading of CSV file was succesful
 */
function checkData(data) {
  console.table(data);

  /**
   * Scatterplot = A type of mathemtical diagram using Cartesian coordinates
   * to display values for typically two variables for a set of data
   */

  // Prepare the data for the scatterplot
  const chartdata = data.map((car) => ({
    x: car.horsepower,
    y: car.mpg,
  }));

  // Create a scatterplot
  createChart(chartdata, "Horsepower", "MPG"); // scatterplot

  // Train the neural network
  startTraining();
}

/**
 * Trains the neural network
 * epochs: A value that should be as close as possible to value 0.
 */
function startTraining() {
  nn.train({ epochs: 5 }, () => finishedTraining());
}

async function finishedTraining() {
  // Empty array to push all the data in later on
  let predictions = [];
  /**
   * For loop for every possible horsepower in csv (values from 40 to 250)
   */
  for (let hp = 40; hp < 250; hp += 2) {
    const pred = await nn.predict({ horsepower: hp });
    predictions.push({ x: hp, y: pred[0].mpg });
  }

  // Adds the neural network data to the chart
  updateChart("Predictions", predictions);
  console.log("Finished having sex with Jutta!");

  // Show the DOM elements after loading in the scatterplot and neural network
  inputField.style.display = "inline";
  predictButton.style.display = "inline";
}

// Creates a prediction of the miles per gallon you used
async function makePrediction(value) {
  const results = await nn.predict({ horsepower: value });
  resultDiv.innerText = `Geschat verbruik: ${results[0].mpg}`;
}

loadData();
