d3.queue()
  .defer(d3.json,'data/Access_Elec_HAP_CO2.json')
  .defer(d3.json,'data/countries.json')
  .awaitAll(function (error, results) {
    if (error) { throw error; }

    scatter = new DirectedScatterPlot(results[0]);
    scatter.update(results[0]);

    map = new Choropleth(results[0], results[1]);

    d3.select('#restart').on('click', function () {
        map.clean()
        scatter.update(results[0]);

    });
  });

var margin = {
    left: 75,
    right: 50,
    top: 50,
    bottom: 75
};

var stg_dur = 200;
var stg_delay = 350;

var width = 625 - margin.left - margin.right;
var height = 450 - margin.top - margin.bottom;

function DirectedScatterPlot(data) {

    var chart = this;

    chart.SVG = d3.select("#chart1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    chart.svg = d3.select("svg")
        .append("g")
        .attr("transform", function(){ return "translate(" + margin.left + "," + margin.top + ")" });

    chart.xScale = d3.scaleLinear()
        .domain([0,100])
        .range([0, width])
        .nice();

    chart.yScale = d3.scaleLinear()
        .domain([-.20, .80])
        .range([height, 0]);

    chart.xAxis = d3.axisBottom(chart.xScale).ticks(10, "s");
    chart.yAxis = d3.axisLeft(chart.yScale).ticks(10, "s");

};

DirectedScatterPlot.prototype.update = function (data) {

    var chart = this;
    var full = data.slice();

    chart.svg.selectAll(".circ").remove();
    //chart.svg.selectAll(".year_note").remove();
    chart.svg.selectAll(".line").remove();

    // Remove existing map on reset:
    d3.select("#chart2").selectAll("path").remove();

    // Interrupt ongoing transitions:
    chart.svg.selectAll("*").interrupt();

    chart.svg.append("g")
        .attr("transform", function(){ return "translate(0," + height + ")" })
        .attr("class", "axis")
        .call(chart.xAxis);

    chart.svg.append("g")
        .attr("class", "axis")
        .call(chart.yAxis);

    chart.svg
        .append("text")
        .attr("class", "yAxisLabel")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", -(margin.left * 0.75))
        .style("text-anchor", "middle")
        .html("CO2 Emissions per KWH Electricity Produced");

    chart.svg
        .append("text")
        .attr("class", "xAxisLabel")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom * 0.75)
        .style("text-anchor", "middle")
        .html("Percentage of Population with Access to Electricity");

    chart.svg.selectAll(".circ")
        .data(full, function(d){ return d.country }).enter()
        .append("circle")
        .attr("class", "circ")
        .attr("cx", function(d){ return chart.xScale(d.ACCESS_1990) })
        .attr("cy", function(d){ return chart.yScale(d.CO2KWHd1_2016) })
        .transition()
        .delay(function (d,i){ return (i * 50) })
        .duration(2000)
        .ease(d3.easePoly.exponent(3))
        .attr("r", 8);

    //chart.svg
        //.on("mouseover", function(d) {
            //chart.tooltip.transition()
                //.duration(200)
                //.style("opacity", 1)
                //.style("left", (d3.event.pageX)+ "px")
                //.style("top", (d3.event.pageY -28) + "px");
//
            //chart.tooltip.append("p")
                //.attr("class", "tooltip_text")
                //.html(d.ACCESS_1990)
       // })
        //.on("mouseout", function(d) {
            //chart.tooltip.html("")
            //.transition()
            //.duration(500)
            //.style("opacity", 0)
       // });

    chart.svg.selectAll(".id")
        .data(full).enter()
        .append("text")
        .attr("class", "id")
        .attr("x", function(d){ return chart.xScale(d.ACCESS_1990) })
        .attr("y", function(d){ return chart.yScale(d.CO2KWHd1_2016) })
        .text(function(d){ return d.id })
        .attr("opacity",10)
        .transition()
        .delay(function (d,i){ return (i * 50) })
        .duration(2000)
        .ease(d3.easePoly.exponent(3))
        // Many more eases here: https://github.com/d3/d3/blob/master/API.md#easings-d3-ease
        .attr("opacity",1);

    // Append a new path to the svg, using .datum() since we are binding all of our data to one new path element. We also pass the line variable to the "d" attribute.
    chart.svg.append("path")
        .datum(full)
        .attr("class", "line")
        .style("opacity",0)
        .transition().delay(2000).duration(1000).on("end", function(){map.update(); })
        .style("opacity", 1);

    chart.tooltip = d3.select("body").append("div")   
          .attr("class", "tooltip")               
          .style("opacity", 0);
};

function Choropleth(change, countries){

    var chart = this;

    chart.svg = d3.select("#chart2")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", function(){ return "translate(" + margin.left + "," + margin.top + ")" });

    // Data merge:
    for (var i = 0; i < change.length; i++) {

        var dataCountry = change[i].country;
        var value_1990 = change[i].ACCESS_1990;
        var value_2012 = change[i].ACCESS_2012;

        // Find the corresponding country inside the GeoJSON
        for (var j = 0; j < countries.features.length; j++)  {
            var jsonCountry = countries.features[j].properties.name;

            if (dataCountry == jsonCountry) {
            countries.features[j].properties.value_1990 = value_1990;
            countries.features[j].properties.value_2000 = value_2012;
            break;
            };
        };
    };
    chart.tooltip = d3.select("body").append("div")   
          .attr("class", "tooltip")               
          .style("opacity", 0);

    chart.countries = countries;

};

Choropleth.prototype.update = function () {

    var chart = this;
    // Interrupt ongoing transitions:
    chart.svg.selectAll("*").interrupt();

    chart.title_text = chart.svg.append("g").attr("transform", "translate(0,0)")

    chart.color_range = ["#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4"];
    chart.data_bins = [0,10,20,30,40,50,60,80,90,100];

    chart.colorScale = d3.scaleLinear()
        .domain(chart.data_bins)
        .range(chart.color_range);

    chart.xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width])

    chart.xAxis = d3.axisTop(chart.xScale).ticks(20)

    chart.svg
        .append("text")
        .attr("class", "xAxisLabel")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom * 0.75)
        .style("text-anchor", "middle")
        .html("Percentage of Developing Countries Population with Access to Electricity in 1990");

    chart.defs = chart.svg.append('defs')

    chart.tooltip = d3.select("body").append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);

    // First create a map projection and specify some options:
    var projection = d3.geoEquirectangular()
       .translate([width/2, height/2])// Places the map in the center of the SVG
       .scale([width * 0.2]); // Scales the size of the map

    // Then pass this projection to d3.geoPath() - which is analagous to d3.line()
    var projectionPath = d3.geoPath().projection(projection);

    // Now we have this projection path that we can give to the "d" attribute of a new path:
    chart.map = chart.svg.append("g").attr("transform", "translate(0,30)").selectAll("path")
        .data(chart.countries.features)
        .enter()
        .append("path")
        .attr("class", "map")
        .attr("d", projectionPath)
        .attr("stroke", "gray");

    chart.map
        .on("mouseover", function(d) {
            chart.tooltip.transition()
                .duration(200)
                .style("opacity", 1)
                .style("left", (d3.event.pageX)+ "px")
                .style("top", (d3.event.pageY -28) + "px");

            chart.tooltip.append("p")
                .attr("class", "tooltip_text")
                .html(d.properties.name + ":" + d.properties.value_1990 + "%")
        })
        .on("mouseout", function(d) {
            chart.tooltip.html("")
            .transition()
            .duration(500)
            .style("opacity", 0)
        });

    chart.map
        .style("fill", "white")
        //.transition().delay(2000).duration(1000)
        .style("fill", function(d) {
            return chart.colorScale(d.properties.value_1990);
        });


    };
        
        






