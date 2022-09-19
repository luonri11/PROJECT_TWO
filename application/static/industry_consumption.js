
const url = "/api/industryconsumption"

d3.json(url).then(function(data) {
        console.log(data);
        
    var energy =[];
    var year=[];
    var industry=[];
    var state=[];

    data.forEach(element=>{
        var x=Object.values(element);
        energy.push(x[0]);
        year.push(x[1]);
        industry.push(x[2]);
        state.push(x[3]);
    });

    year.forEach(convert);

    function convert(item,index,arr){
        arr[index]=Number(item.slice(0,4));
    };

    main(energy,year,industry,state);

})  

function main(energy,year,industry,state){
    console.log(energy,year,industry,state);


var industry_name=['Mining','Agriculture','Manufacturing','Electricity generation'
,'Construction','Transport','Water and waste','Commercial and services'
,'Residential','Other'];



var selectDropdown= d3.select("#selDataset");
function addSectors(){

    industry_name.forEach(i => {
        selectDropdown.append('option').text(i);
       
        
    })
}

addSectors();


function n(){
    
    var z = this.options[this.selectedIndex].value
    z1(z);

}

selectDropdown.on("change", n);



function z1(z){

    var sector_input=z;
    
    var year_x=[];
    var energy_y=[];

for (let i=0; i<industry.length;i++){
    if (industry[i]===sector_input){
        year_x.push(year[i]);
        energy_y.push(energy[i]); 
    }
}


var oneyear=Array.from(new Set(year_x));
// console.log(oneyear);


var oneenergy=[];


oneyear.forEach(i => {
    var sumenergy=0.0;
    var a=-1;
    year_x.forEach(j => {
        a=a+1
        if(j===i){
          sumenergy=sumenergy+energy_y[a];  
        }
    })
    // console.log(sumenergy);
    oneenergy.push(sumenergy);
    
})

// console.log(oneyear,oneenergy);






var trace1 = {
    x: oneyear ,
    y: oneenergy,
    mode: 'markers',
    type: 'scatter'

  };

  var layout = {

    title : {
    text: 'Industrial Sector Electricity Consumption'},
    xaxis : {
    title: {
    text: 'Years'}},
    yaxis : {
    title: {
    text: 'Energy PetaJoules'}}
  }
    
     
    

  var data = [trace1];
  
  Plotly.newPlot('line', data, layout);

}

}