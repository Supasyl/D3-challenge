// Define SVG area dimensions
let svgWidth = 960;
let svgHeight = 500;

// Define the chart's margins as an object
let margin = {
  top: 60,
  right: 60,
  bottom: 60,
  left: 60
};

// Define dimensions of the chart area
let chartWidth = svgWidth - margin.left - margin.right;
let chartHeight = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimensions
let svg = d3.select("body")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append a group area, then set its margins
let chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Load data from csv
d3.csv("./static/data/data.csv").then(function(UShealth, err) {
    if (err) throw err;

    // change some strings to numbers
    UShealth.forEach(function(line) {
        line.age = +line.age;
        line.healthcare = +line.healthcare;
        line.income = +line.income;
        line.obesity = +line.obesity;
        line.poverty = +line.poverty;
        line.smokes = +line.smokes;
    });

    // Print the file
    console.log(UShealth);

    // x and yLinearScale functions above csv imort
    let xLinearScale = xScale(UShealth, chosenXaxis);
    let yLinearScale = yScale(UShealth, chosenYaxis);

    //create initial axis functions
    let bottomAxis = d3.axisBottom(xScale);
    // let leftAxis = d3.axisLeft(yScale);

    // add x-axis to plot
    chartGroup.append('g')
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${chartWidth})`)
        .call(bottomAxis);
});

// initial paramaters
let chosenXaxis = 'poverty';
let chosenYaxis = 'healthcare';

// function used for updating x-scale variable upon click on axis label
function xScale(UShealth, chosenXaxis) {
    // create scales
    let xLinearScale = d3.scaleLinear()
        .domain([d3.extent(UShealth, d => d[chosenXaxis])])
        .range([0, chartWidth]);
    return xLinearScale;
}

// function for updating y-scale variable upon click on axis label
function yScale(UShealth, chosenYaxis) {
    // create scales
    let yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(UShealth, d => (d[chosenYaxis]))])
        .range([chartHeight, 0]);
    return yLinearScale;
}