
const url = "/api/stateproduction"


d3.json(url).then(function(response) {
    console.log(response);
    // energy production column from string to numeric
    response.forEach(row => {
        row.energy_production_gwh = +row.energy_production_gwh 
    });

    // array of each fuel type
    const fuel_types = [...new Set(response.map(row => row.fuel_source))];
    console.log("fuel_type:", fuel_types);

    // array of each state
    const states = [...new Set(response.map(row => row.state))];
    console.log("states: ", states);

    // array of each financial year
    const fin_years = [...new Set(response.map(row => row.financial_year))];
    console.log("years: ", fin_years);

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
  

    // custom bar colours
    colors =['rgb(229, 60, 60)',
        'rgb(238, 77, 54)',
        'rgb(246, 94, 47)',
        'rgb(252, 111, 38)',
        'rgb(255, 127, 28)',
        'rgb(255, 144, 13)',
        'rgb(255, 161, 0)',
        'rgb(255, 178, 0)',
        'rgb(255, 195, 0)',
        'rgb(255, 212, 0)',
        'rgb(254, 228, 0)',
        'rgb(248, 245, 0) '
   ]

   // the first year of data will be used throughout to set up the graph
   const startYear = fin_years[0]
   // state to initialise the graph
   const initState = states[0]

   function yLimit (data, state) {
        const state_production = data.filter((v,i) => {
            return (v["state"] == state)
        });
        const total_output = [...new Set(state_production.map(row => row.energy_production_gwh))]

        const max_output = Math.max(...total_output)

        const yLim = Math.ceil(max_output/10000)*10000

        return yLim   
   };


    // function to get percent renewable energy output for selected state and year
    function getRenewable(data, year, state) {
        const state_production = data.filter((v,i) => {
            return (v["financial_year"] == year && v["state"] == state)
        });
        const state_total = state_production.reduce((accumulator, object) => {
            return accumulator + object.energy_production_gwh
        }, 0);
        const renewable_production = state_production.filter((v,i) => {
            return (v["renewable"] == true)
        }); 
        const renewable_total = renewable_production.reduce((accumulator, object) => {
            return accumulator + object.energy_production_gwh
        }, 0);
        const renewable = (renewable_total/state_total)
        

        return renewable
    };
    
    // function to return output of each fuel for a particular state and year
    function fuelOutput(data, year, state, fuels) {
        var production = []
        fuels.forEach(fuel => {
            var fuelOutput = data.filter((v, i) => {
                return (v["financial_year"] == year && v["state"] == state && v["fuel_source"] == fuel)
            });
            production.push(fuelOutput[0].energy_production_gwh)
        });
        return production
    };

    // function to create trace for bar graph
    // each trace is a state for a particular year
    // x values: each fuel source
    // y values: energy output
    function createTrace(data, year, state, fuels) {
        x_values = fuels;
        y_values = fuelOutput(data, year, state, fuels)
        var trace ={
            x: x_values,
            y: y_values,
            marker: {color: colors},
            text: y_values.map(String),
            textposition: 'auto',
            name: state,
            type: 'bar'
        };
        console.log("trace: ", trace)
        return trace
    };

    // function to create steps
    // steps are labels on the slider used to change the graph
    // each step will be a financial year
    // the steps will also use the animate method to change frames - each frame a different year
    function createStep(year) {
        step = {}
        step["label"] = year,
        step["method"] = 'animate',
        step["args"] = [[year], {
            mode: 'immediate',
            transition: {duration: 300},
            frame: {duration: 1200, redraw: false},
        }]
        return step
    };

    // function to create frames
    // each frame is similar to a trace, but contains only the data that needs to change
    // one frame for each change that will take place. this case the y values (the fuel production for the changed year)
    function createFrame(data, year, state, fuels) {
        const y_values = fuelOutput(data, year, state, fuels)
        const y_renewable = getRenewable(data, year, state)
        const frame ={
            name: year,
            data: [{
                y: y_values,
                text: y_values.map(String),
                textposition: 'auto',
                },{
                y: [y_renewable],
                text:`${String(Math.floor(y_renewable*100))}%`,
                yaxis: 'y2',
                xaxis: 'x2'
            }]};

        return frame
    };

    // function to create graph
    function createGraph(data, state, startYear, fuels) {
        // create initial trace. changes to trace will be made through frames
        var traces =[]
        traces.push(createTrace(data, startYear, state, fuels))

        const y_renewable = getRenewable(data, startYear, state)
        renewable_trace = {
            x: ["Renewable"],
            y: [y_renewable],
            xaxis: 'x2',
            yaxis: 'y2',
            marker: {color: 'rgb(69, 191, 85)'},
            text: `${String(Math.floor(y_renewable*100))}%`,
            textposition: 'auto',
            type: 'bar'
        }

        traces.push(renewable_trace)

        // create frames. each frame is data to change for each year selected
        var frames = []
        fin_years.forEach(finyear => {
            var frame = createFrame(data, finyear, state, fuels)
            frames.push(frame)
        })
        
        // create slider step for each year
        var sliderSteps = []
        fin_years.forEach(finyear => {
            var step = createStep(finyear)
            sliderSteps.push(step)
        });

        const yLim = yLimit(data,state)

        var layout = {
            title: {
                text:`${state} energy production mix`,
                font: {size: 24}
            },
            height: 800,
            showlegend: false,
            yaxis: {
                range:[0, yLim],
                title: "Production (GWh)",
                tickformat: ",.2r"
            },
            yaxis2: {
                range: [0, 1],
                anchor: 'free',
                tickformat: '%',
                position: 1},
            xaxis: {
                domain: [0,0.85]
            },
            xaxis2: {
                domain: [0.90,0.95]
            },
            sliders: [{
                activebgcolor: 'rgb(219, 7, 61)',
                currentvalue: {
                    prefix: 'Financial Year: ',
                    xanchor: 'left',
                    font: {size: 25, color: '#231'}
                },
                pad: {t:100, l: 150, r:25},
                steps: sliderSteps,
                transition: {easing: "exp"}                
            }],
            updatemenus: [{
                type: 'buttons',
                x: 0,
                y:0,
                pad: {t:125, r:50},
                yanchor: 'top',
                xanchor: 'left',
                direction: 'left',
                buttons: [{
                    label: 'Play',
                    method: 'animate',
                    args: [null, {
                        mode: 'immediate',
                        fromcurrent: true,
                        transition: {duration: 300},
                        frame: {duration: 1000, redraw: false}
                    }]
                }, {
                    label: 'Pause',
                    method: 'animate',
                    args: [[null], {
                        mode: 'immediate',
                        transition: {duration: 0},
                        frame: {duration: 0, redraw: false}
                    }]
                }]
            }]
        };          
                        
        Plotly.newPlot('dbtest',{
            data: traces,
            layout: layout,
            frames: frames
        })
    };

    function updateGraph(data, startYear, years, fuels) {
        // set state as selected
        const state = stateButtons.property("value")
        console.log("buttonval: ", state)
  
          
        // change existing trace to that of new state
        const y_values = fuelOutput(data, startYear, state, fuels)
        console.log("y vals: ", y_values)
        const y_renewable = getRenewable(data,startYear,state)
        const data_update = [{
            y: [y_values],
            name: state,
            text: y_values.map(String)
        },{
            y: [y_renewable],
            yaxis: 'y2',
            text: String(y_renewable)
        }];

        const yLim = yLimit(data,state)

        const layout_update = {
            title: `${state} energy production mix`,
            yaxis: {
                range: [0, yLim],
                title: "Production (GWh)"
            }       
        }

        Plotly.update('dbtest', data_update, layout_update)

        // create new frames for the new state
        frames = []
        years.forEach(finyear => {
            var frame = createFrame(data, finyear, state, fuels)
            frames.push(frame)
        })
        Plotly.addFrames('dbtest', frames)
      
    };

    function updateGraphBAD(data, state, startYear, fuels) {
        Plotly.purge('dbtest')
        createGraph(data,state, startYear, fuels)
    }

    // create graph on landing and set up event change
    createGraph(response, initState, startYear, fuel_types)
    // update the graph when the state is changed
//    stateDropdown.on("change", function() {
//     updateGraph(response, startYear, fin_years, fuel_types)
//    });
 
   d3.selectAll("#stateButton")
    .on("click", function() {
        var state = d3.select(this).attr("value");
        updateGraphBAD(response, state, startYear, fuel_types)
    });
});