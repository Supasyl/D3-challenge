// Define SVG area dimensions
let svgWidth = 960;
let svgHeight = 500;

// Define the chart's margins as an object
let margin = {
  top: 60,
  right: 60,
  bottom: 100,
  left: 100
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

// initial paramaters
var chosenXaxis = 'poverty';
var chosenYaxis = 'healthcare';

// function used for updating x-scale variable upon click on axis label
function xScale(UShealth, chosenXaxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        // .domain(d3.extent(UShealth, d => d[chosenXaxis]))
        .domain([d3.min(UShealth, d => d[chosenXaxis]) * 0.9, d3.max(UShealth, d => d[chosenXaxis]) * 1.1])
        .range([0, chartWidth]);
    return xLinearScale;
}

// function for updating y-scale variable upon click on axis label
function yScale(UShealth, chosenYaxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(UShealth, d => (d[chosenYaxis]))])
        .range([chartHeight, 0]);
    return yLinearScale;
}

// function used for updating xAxis variable upon click on axis label
function renderXaxis(newXscale, xAxis) {
    let bottomAxis = d3.axisBottom(newXscale);
  
    xAxis
        .transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// function used for updating yAxis variable upon click on axis label
function renderYaxis(newYscale, yAxis) {
    let leftAxis = d3.axisLeft(newYscale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
    return yAxis;
}
  
// function used for updating x-axis circles group with a transition to new circles
function renderCircles(circlesGroup, newXscale, chosenXaxis, newYscale, chosenYaxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXscale(d[chosenXaxis]))
      .attr("cy", d => newYscale(d[chosenYaxis]));
    return circlesGroup;
}

function renderStateText(stateText, newXscale, chosenXaxis, newYscale, chosenYaxis) {
    stateText.transition()
        .duration(1000)
        .attr("cx", d => newXscale(d[chosenXaxis])-6)
        .attr("cy", d => newYscale(d[chosenYaxis])+4);
    return stateText;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXaxis, chosenYaxis, circlesGroup) {
    var xlabel;
    if (chosenXaxis === "poverty") {
        xlabel = 'Poverty (%):';
    }
    if (chosenXaxis === 'age') {
        xlabel = 'Median Age:';
    }
    if (chosenYaxis === 'income') {
        xlabel = "Median Household Income:";
    }
    
    var ylabel;
    if (chosenYaxis === 'healthcare') {
        ylabel = 'Lacks Healthcare (%):';
    }
    if (chosenYaxis === 'smokes') {
        ylabel = 'Smokes (%):';
    }
    if (chosenYaxis === 'obesity') {
        ylabel = 'Obese (%):';
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([100, 70])
        .style("opacity", 0)
        .style("background-color", "purple")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .html(function(d) {
            return (`State: ${d.state}<br>${xlabel} ${d[chosenXaxis]}<br>${ylabel} ${d[chosenYaxis]}`);
        });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
    // onmouseout event
    .on("mouseout", function(data, index) {
    toolTip.hide(data);
    });
  
    return circlesGroup;
}

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
    var xLinearScale = xScale(UShealth, chosenXaxis);
    var yLinearScale = yScale(UShealth, chosenYaxis);

    //create initial axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // add x-axis to plot
    var xAxis = chartGroup.append('g')
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);
    
    // add y-axis to plot
    var yAxis = chartGroup.append('g')
        .classed("y-axis", true)
        .call(leftAxis);

    // scatterplot & add bubbles to the scatterplot
    var circlesGroup = chartGroup.selectAll("circle")
        .classed('bubblePlot', true)
        .data(UShealth)
        .enter()
        .append('circle')
            .classed('bubble', true)
            .attr('cx', data => xLinearScale(data[chosenXaxis]))
            .attr('cy', data => yLinearScale(data[chosenYaxis]))
            .attr('r', 12)
            // .attr('text', data => data.abbr)
            .style('fill', 'fuchsia')
            .style('opacity', '0.5');

    // create state abbreviations inside bubbles
    var stateText = chartGroup.selectAll(null)
        .classed('stateText', true)
        .data(UShealth)    
        .enter()
        .append('text')
            .text(data => data.abbr)
            .attr('dx', data => xLinearScale(data[chosenXaxis])-6)
            .attr('dy', data => yLinearScale(data[chosenYaxis])+4)
            .attr('font-size', 10);

    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`)
        .attr('class', 'axisText');

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (median)");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (median)");
    
    // Create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g")
        .attr('transform', "rotate(-90)")
        .attr("x", 0 - (chartHeight / 3 * 2))
        .attr("y", 0 - margin.left)
        // .attr("dy", "1em")
        .attr('class', 'axisText');

    var healthcareLabel = ylabelsGroup.append("text")
        // .attr("transform", "rotate(-90)")
        .attr("x", 0 - chartHeight / 3 * 2)
        .attr("y", 0 - 60)
        .attr("value", "healthcare") // value to grab for event listener
        .attr("dy", "1em")
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    var smokesLabel = ylabelsGroup.append("text")
        // .attr("transform", "rotate(-90)")
        .attr("x", 0 - (chartHeight / 3 * 2))
        .attr("y", 0 - 70)
        .attr("value", "smokes") // value to grab for event listener
        // .attr("dy", "1em")
        .classed("inactive", true)
        .text("Smokes (%)");

    var obesityLabel = ylabelsGroup.append("text")
        // .attr("transform", "rotate(-90)")
        .attr("x", 0 - (chartHeight / 3 * 2))
        .attr("y", 0 - 90)
        .attr("value", "obesity") // value to grab for event listener
        // .attr("dy", "1em")
        .classed("inactive", true)
        .text("Obese (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);

    var stateText = renderStateText(stateText, xLinearScale, chosenXaxis, yLinearScale, chosenYaxis);

     // x axis labels event listener
    xlabelsGroup.selectAll("text").on("click", function() {
        // get value of selection
        var xValue = d3.select(this).attr("value");
        if (xValue !== chosenXaxis) {
            // replaces chosenXAxis with value
            chosenXaxis = xValue;
            
            console.log(chosenXaxis)

            // functions here found above csv import
            // updates x scale for new data
            var xLinearScale = xScale(UShealth, chosenXaxis);
            var yLinearScale = yScale(UShealth, chosenYaxis);

            // updates x axis with transition
            xAxis = renderXaxis(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXaxis, yLinearScale, chosenYaxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);

            // updates location of state abbreviation text to new bubble location
            stateText = renderStateText(stateText, xLinearScale, chosenXaxis, yLinearScale, chosenYaxis);

            // changes x-classes to change bold text
            if (chosenXaxis === "poverty") {
                povertyLabel
                .classed("active", true)
                .classed("inactive", false);
                ageLabel
                .classed("active", false)
                .classed("inactive", true);
                incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            if (chosenXaxis === "age") {
                povertyLabel
                .classed("active", false)
                .classed("inactive", true);
                ageLabel
                .classed("active", true)
                .classed("inactive", false);
                incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            if (chosenXaxis === "income") {
                povertyLabel
                .classed("active", false)
                .classed("inactive", true);
                ageLabel
                .classed("active", false)
                .classed("inactive", true);
                incomeLabel
                .classed("active", true)
                .classed("inactive", false);
            }
        }
    });
    ylabelsGroup.selectAll('text').on('click', function() {
        // get value of selection
        var yValue = d3.select(this).attr("value");
        if (yValue !== chosenYaxis) {
            // replaces chosenXAxis with value
            chosenYaxis = yValue;

            console.log(chosenYaxis)

            // functions here found above csv import
            // updates x scale for new data
            var xLinearScale = xScale(UShealth, chosenXaxis);
            var yLinearScale = yScale(UShealth, chosenYaxis);

            // updates x axis with transition
            yAxis = renderYaxis(yLinearScale, yAxis);

            // updates circles with new x values
            // circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYaxis);
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXaxis, yLinearScale, chosenYaxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);

            // updates location of state abbreviation text to new bubble location
            stateText = renderStateText(stateText, xLinearScale, chosenXaxis, yLinearScale, chosenYaxis);

            // changes y-classes to change bold text
            if (chosenYaxis === "healthcare") {
                healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
                smokesLabel
                .classed("active", false)
                .classed("inactive", true);
                obesityLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            if (chosenYaxis === "smokes") {
                healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
                smokesLabel
                .classed("active", true)
                .classed("inactive", false);
                obesityLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            if (chosenYaxis === "obesity") {
                healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
                smokesLabel
                .classed("active", false)
                .classed("inactive", true);
                obesityLabel
                .classed("active", true)
                .classed("inactive", false);
            }
        }
        
    });    

}).catch(function(error) {
console.log(error);
});

