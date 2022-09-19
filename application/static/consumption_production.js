const url = "/api/consumptionproduction"

// svg container size
const height = 800;
const width = 900;

// margins
const margin ={
    top: 120,
    right:120,
    bottom:120,
    left:120
};


// chart size
const chartHeight = height - margin.top - margin.bottom;
const chartWidth = width -margin.left -margin.right;

// create svg
function createSvg() {
    const svg = d3.select("#chart").append("svg")
        .attr("height", height)
        .attr("width", width)
    return svg
};

// create chart
function createChart(svg) {
    const chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
    return chartGroup
};

// create x scale (categorical)
function xScale(data) {
    var years = data.map(d => d.financial_year)
    years = [...new Set(years)] 
    const xScale = d3.scaleBand()
        .domain(years)
        .range([0, chartWidth])
    return xScale
};

// create y scale (numerical)
function yScale(data, state, chosenY) {
    const stateData = data.filter(row => row["state"] == state)
    const yScale = d3.scaleLinear()
        .domain([d3.min(stateData, d => d[chosenY]) * 0.8, d3.max(stateData, d => d[chosenY]) * 1.1])
        .range([chartHeight, 0])
    return yScale
};

function appendPaths(data, chartGroup, state, productionLine, consumptionLine) {
    const stateData = data.filter(row => row["state"] == state)
 
    const productionPath = chartGroup.append("path")
        .data([stateData])
        .attr("d", productionLine)
        .classed("line production", true);

    const consumptionPath = chartGroup.append("path")
        .data([stateData])
        .attr("d", consumptionLine)
        .classed("line consumption", true);
    
    return paths = {
        production:productionPath,
        consumption: consumptionPath
    };
};

function updateGraph(data, state, paths, productionLine, consumptionLine, leftAxis, rightAxis, yAxisLeft, yAxisRight, chosenState, chartTitle) {
    const stateData = data.filter(row => row["state"] == state)
    yAxisLeft.transition()
        .duration(1000)
        .call(leftAxis)

    yAxisRight.transition()
        .duration(1000)
        .call(rightAxis)
    
    paths.production
        .data([stateData])

    paths.consumption
        .data([stateData])
    
    paths.production.transition()
        .duration(1000)
        .attr("d", productionLine)
    
    paths.consumption.transition()
        .duration(1000)
        .attr("d", consumptionLine)
    
    chartTitle.transition()
        .duration(1000)
        .text(`${chosenState} Consumption vs Production`)

};

// CREATE PLOT
// ----------------------------------------------------------------------
function createPlot(data, states) {

    var chosenState = states[0]

    // CHART AREA
    const svg = createSvg()
    const chartGroup = createChart(svg)

    // AXES
    // x axis
    const x = xScale(data)
    const bottomAxis = d3.axisBottom(x)
    const xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .classed("x", true)
        .call(bottomAxis)

    // y axes
    const y1 = "energy_production_gwh"
    const y2 = "energy_consumption_pj"

    var yScaleLeft = yScale(data,chosenState , y1)
    var leftAxis = d3.axisLeft(yScaleLeft)
    var yAxisLeft = chartGroup.append("g")
        .classed("production", true)
        .call(leftAxis)

    var yScaleRight = yScale(data,chosenState , y2)
    var rightAxis = d3.axisRight(yScaleRight)
    var yAxisRight = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth}, 0)`)
        .classed("consumption", true)
        .call(rightAxis)
    
    // labels
    const xLabel = chartGroup.append("text")
        .attr("transform", `translate(${chartWidth/2}, ${chartHeight +50})`)
        .classed("text", true)
        .text("Financial Year")
    const consumptionLabel = chartGroup.append("text")
        .attr("transform", `translate(${chartWidth+75},${chartHeight/2}) rotate(90)`)
        .classed("consumption-text text", true)
        .text("Consumption (Gwh)")
    const productionLabel = chartGroup.append("text")
        .attr("transform", `translate(-75,${chartHeight/2}) rotate(-90)`)
        .classed("production-text text", true)
        .text("Production (Gwh)")
    var chartTitle = chartGroup.append("text")
        .attr("transform", `translate(${chartWidth/2}, -50)`)
        .classed("title-text", true)
        .text(`${chosenState} Consumption vs Production`)
          
    
    // LINES
    var productionLine = d3.line()
        .x(d => x(d.financial_year))
        .y(d => yScaleLeft(d.energy_production_gwh))

    var consumptionLine = d3.line()
        .x(d => x(d.financial_year))
        .y(d => yScaleRight(d.energy_consumption_gwh))


    var paths = appendPaths(data, chartGroup, chosenState, productionLine, consumptionLine)

    // EVENT LISTENER AND CHART UPDATE
    d3.selectAll("#stateButton")
    .on("click", function() {
        var state = d3.select(this).attr("value");
        if (state !== chosenState) {
            chosenState = state;
            yScaleLeft = yScale(data, chosenState, y1);
            yScaleRight = yScale(data, chosenState, y2);
            leftAxis = d3.axisLeft(yScaleLeft);
            rightAxis = d3.axisRight(yScaleRight);
            productionLine = d3.line()
                .x(d => x(d.financial_year))
                .y(d => yScaleLeft(d.energy_production_gwh));
            consumptionLine = d3.line()
                .x(d => x(d.financial_year))
                .y(d => yScaleRight(d.energy_consumption_gwh));

            updateGraph(data, chosenState, paths, productionLine, consumptionLine, leftAxis, rightAxis ,yAxisLeft, yAxisRight, chosenState, chartTitle)          
        }

                
    });
};


// ----------------------------------------------------------------------
// CALL API
// ----------------------------------------------------------------------
d3.json(url).then(function(energyData) {
    energyData.forEach(row => {
        row.energy_consumption_pj = +row.energy_consumption_gwh;
        row.energy_production_gwh = +row.energy_production_gwh;
    }) 
    console.log("energy data: ", energyData)

    var states = energyData.map(row => row.state)
    states = [...new Set(states)]
    console.log("states: ", states)    

    // create buttons for eachs state to be used to change graph
    const stateButtons = d3.select("#stateButtons")
        .selectAll('button')
        .data(states)

    stateButtons
        .enter()
        .append('button')
        .attr('class', 'btn btn-outline-success mr-3')
        .attr('type', 'button')
        .attr('value', d => `${d}`)
        .attr('id', 'stateButton')
        .text(d=>d)



    createPlot(energyData, states)

});
// ----------------------------------------------------------------------