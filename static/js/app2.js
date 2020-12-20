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

// initial paramaters
let chosenXaxis = 'poverty';
let chosenYaxis = 'healthcare';

// function used for updating x-scale variable upon click on axis label
function xScale(UShealth, chosenXaxis) {
    // create scales
    let xLinearScale = d3.scaleLinear()
        .domain([d3.extent(UShealth, d => d[chosenXaxis])])
        .range([0, svgWidth]);
    return xLinearScale;
}

// function for updating y-scale variable upon click on axis label
function yScale(UShealth, chosenYaxis) {
    // create scales
    let yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(UShealth, d => (d[chosenYaxis]))])
        .range([svgHeight, 0]);
    return yLinearScale;
}

// function used for updating xAxis variable upon click on axis label
function renderXaxis(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// function used for updating yAxis variable upon click on axis label
function renderYaxis(newYScale, yAxis) {
    let leftAxis = d3.axisBottom(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
    return yAxis;
}
  
// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXaxis]));
    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXaxis, chosenYaxis, circlesGroup) {
    let xlabel;
    if (chosenXaxis === "poverty") {
        xlabel = 'Poverty (%):';
    }
    if (chosenXaxis === 'age') {
        xlabel = 'Median Age:';
    }
    if (chosenYaxis === 'income') {
        xlabel = "Median Household Income:";
    }
    
    let ylabel;
    if (chosenYaxis === 'healthcare') {
        ylabel = 'Lacks Healthcare (%):';
    }
    if (chosenYaxis === 'smokes') {
        ylabel = 'Smokes (%):';
    }
    if (chosenYaxis === 'obesity') {
        ylabel = 'Obese (%):';
    }

    let toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([50, 0])
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
        line.ageMoe = +line.ageMoe;
        line.healthcare = +line.healthcare;
        line.healthcareHigh = +line.healthcareHigh;
        line.healthcareLow = +line.healthcareLow;
        line.income = +line.income;
        line.incomeMoe = +line.incomeMoe;
        line.obesity = +line.obesity;
        line.obesityHigh = +line.obesityHigh;
        line.obesityLow = +line.obesityLow;
        line.poverty = +line.poverty;
        line.povertyMoe = +line.povertyMoe;
        line.smokes = +line.smokes;
        line.smokesHigh = +line.smokesHigh;
        line.smokesLow = +line.smokesLow;
    });

    // Print the file
    console.log(UShealth);
    

    // x and yLinearScale functions above csv imort
    let xLinearScale = xScale(UShealth, chosenXaxis);
    let yLinearScale = yScale(UShealth, chosenYaxis);
    
    //create initial axis functions
    let bottomAxis = d3.axisBottom(xScale);
    let leftAxis = d3.axisLeft(yScale);

    // add x-axis to plot
    chartGroup.append('g')
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);
 
    // add y-axis to plot
    chartGroup.append('g')
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
        .attr('r', 10)
        .style('fill', 'fuchsia')
        .style('opacity', '0.5')
    // // trigger hover function for tooltip
    // .on('mouseover', showTooltip)
    // .on('mousemove', moveTooltip)
    // .on('mouseleave', hideTooltip);

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
        .attr('class', 'axisText');

    var healthcareLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (chartHeight / 3 * 2))
        .attr("y", 0-margin-left)
        .attr("value", "healthcare") // value to grab for event listener
        .attr("dy", "1em")
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    var smokesLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (chartHeight / 3 * 2))
        .attr("y", 0-margin-left - 20)
        .attr("value", "smokes") // value to grab for event listener
        .attr("dy", "1em")
        .classed("inactive", true)
        .text("Smokes (%)");

    var obesityLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (chartHeight / 3 * 2))
        .attr("y", 0-margin-left - 40)
        .attr("value", "obesity") // value to grab for event listener
        .attr("dy", "1em")
        .classed("inactive", true)
        .text("Obese (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYaxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text").on("click", function() {
        // get value of selection
        var xvalue = d3.select(this).attr("value");
        if (xvalue !== chosenXAxis) {
            // replaces chosenXAxis with value
                chosenXAxis = value;
            
            // console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(UShealth, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXaxis(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

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
        var yvalue = d3.select(this).attr("value");
        if (yvalue !== chosenYAxis) {
            // replaces chosenXAxis with value
                chosenYAxis = value;

            // console.log(chosenYAxis)

            // functions here found above csv import
            // updates x scale for new data
            yLinearScale = yScale(UShealth, chosenYAxis);

            // updates x axis with transition
            yAxis = renderYaxis(yLinearScale, yAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

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


//  // create labels
//  let labels = function(d) {
//     return d.abbr;
// }