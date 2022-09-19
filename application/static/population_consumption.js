var svgWidth = 900;
var svgHeight = 600;

var margin = {
    top: 60,
    right: 120,
    bottom: 60,
    left: 120
  };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select("#dbtest")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create group for x-axis labels
var labelsGroup = chartGroup.append("g")
.attr("transform", `translate(${width / 2.3}, ${height + 10})`);

var yearsLabel = labelsGroup.append("text")
.attr("x", 0)
.attr("y", 40)
.text("Years");

var leftLabel = labelsGroup.append("text")
.attr("x", 260)
.attr("y", -360)
.attr("transform", "rotate(-90)")
.text("Population");

var rightLabel = labelsGroup.append("text")
.attr("x", 210)
.attr("y", 440)
.attr("transform", "rotate(-90)")
.text("Energy Consumption (pJ)");

function CallResponse() {
    const url = "/api/populationconsumption"

    d3.json(url).then(function(response){
        console.log(response);

        var parseTime = d3.timeParse("%Y-%m");

          // Format the data
          response.forEach(function(response) {
          response.financial_year = parseTime(response.financial_year);   
          response.energy_consumption_pj = +response.energy_consumption_pj;
          response.population = +response.population;

          });

// list of groups (states)
var allGroup = ["VIC","NSW","QLD","WA","SA","NT"]

// add options to button
d3.select("#selectButton")
.selectAll("myOptions")
  .data(allGroup)
.enter()
  .append("option")


// text showed in menu
.text(function(d) {return d;}) 

// corresponding value returned
.attr("value",function(d) {return d;})

// selectedGroup is initialised to VIC, so we can initialise graph with Victorian data
var selectedGroup = "VIC"  
var stateData = response.filter(row => row.state === selectedGroup)
  console.log(selectedGroup)

// scaling for axes
var xTimeScale = d3.scaleTime()
.domain(d3.extent(stateData,d => d.financial_year))
.range([0,width]);

var yLinearScale1 = d3.scaleLinear()
.domain([d3.min(stateData,d => d.population) * 0.9, d3.max(stateData, d => d.population)*1.1])
.range([height, 0]);

var yLinearScale2 = d3.scaleLinear()
.domain([d3.min(stateData,d => d.energy_consumption_pj) * 0.9, d3.max(stateData, d => d.energy_consumption_pj)*1.1])
.range([height, 0]);

var bottomAxis = d3.axisBottom(xTimeScale);
var leftAxis = d3.axisLeft(yLinearScale1);
var rightAxis = d3.axisRight(yLinearScale2);

// Add bottomAxis
chartGroup.append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

// Add leftAxis to the left side of the display
chartGroup.append("g")
  .classed("green", true)
  .call(leftAxis);

// Add rightAxis to the right side of the display
chartGroup.append("g")
.classed("orange", true)
.attr("transform", `translate(${width}, 0)`)
.call(rightAxis);

// data to lines
var line1 = d3
.line()
.x(d => xTimeScale(d.financial_year))
.y(d => yLinearScale1(d.population));

var line2 = d3
.line()
.x(d => xTimeScale(d.financial_year))
.y(d => yLinearScale2(d.energy_consumption_pj));

// Append a path for line1 (this adds the lines to graph)
chartGroup.append("path")
.data([stateData])
.attr("d", line1)
.classed("line green", true);

// Append a path for line2 (this adds the lines to graph)
chartGroup.append("path")
.data([stateData])
.attr("d", line2)
.classed("line orange", true);
      
function update(selectedGroup) {

  // clear graph elements before re-adding next set
  chartGroup.selectAll("path").remove()
  chartGroup.selectAll("g").remove()
  
  var stateData = response.filter(row => row.state === selectedGroup)
  console.log(selectedGroup)

  // data to lines
  var line1 = d3
  .line()
  .x(d => xTimeScale(d.financial_year))
  .y(d => yLinearScale1(d.population));

  var line2 = d3
  .line()
  .x(d => xTimeScale(d.financial_year))
  .y(d => yLinearScale2(d.energy_consumption_pj));

  // scaling for axes
  var xTimeScale = d3.scaleTime()
  .domain(d3.extent(stateData,d => d.financial_year))
  .range([0,width]);

  var yLinearScale1 = d3.scaleLinear()
  .domain([d3.min(stateData,d => d.population) * 0.9, d3.max(stateData, d => d.population)*1.1])
  .range([height, 0]);
  
  var yLinearScale2 = d3.scaleLinear()
  .domain([d3.min(stateData,d => d.energy_consumption_pj) * 0.9, d3.max(stateData, d => d.energy_consumption_pj)*1.1])
  .range([height, 0]);

  // Append a path for line1 (this adds the lines to graph)
  chartGroup.append("path")
  .data([stateData])
  .attr("d", line1)
  .classed("line green", true);

  // Append a path for line2 (this adds the lines to graph)
  chartGroup.append("path")
  .data([stateData])
  .attr("d", line2)
  .classed("line orange", true);

  var bottomAxis = d3.axisBottom(xTimeScale);
  var leftAxis = d3.axisLeft(yLinearScale1);
  var rightAxis = d3.axisRight(yLinearScale2);

  // Add bottomAxis
  chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // Add leftAxis to the left side of the display
  chartGroup.append("g")
    .classed("green", true)
    .call(leftAxis);

  // Add rightAxis to the right side of the display
  chartGroup.append("g")
    .classed("orange", true)
    .attr("transform", `translate(${width}, 0)`).call(rightAxis);

  var labelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width / 2.3}, ${height + 10})`);
  
  var yearsLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 40)
  .text("Years");

    var leftLabel = labelsGroup.append("text")
  .attr("x", 260)
  .attr("y", -360)
  .attr("transform", "rotate(-90)")
  .text("Population");

  var rightLabel = labelsGroup.append("text")
  .attr("x", 210)
  .attr("y", 440)
  .attr("transform", "rotate(-90)")
  .text("Energy Consumption (pJ)");
  }

// When the button is changed, run the updateChart function
d3.select("#selectButton").on("change", function(d) {
  // recover the option that has been chosen
  var selectedOption = d3.select(this).property("value")
  // run the updateChart function with this selected option
  update(selectedOption)
})

  })
  
}
CallResponse()