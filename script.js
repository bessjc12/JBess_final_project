var app;

// Declaring our constants
var START_YEAR = 1950;
var END_YEAR = 2015;
var MAX_RADIUS = 50;
var TRANSITION_DURATION = 750;

d3.json('data/data.json', function (error, data) {
  if (error) { throw error; }
  app.initialize(data);
});

// // d3.queue() enables us to load multiple data files. Following the example below, we make
// // additional .defer() calls with additional data files, and they are returned as results[1],
// // results[2], etc., once they have all finished downloading.
// d3.queue()
//   .defer(d3.json, 'data/data.json')
//   .awaitAll(function (error, results) {
//     if (error) { throw error; }
//     app.initialize(results[0]);
//   });

app = {
  data: [],
  components: [],

  options: {
    year: START_YEAR
  },

  initialize: function (data) {
    app.data = data;

    // Here we create each of the components on our page, storing them in an array
    app.components = [
      new Chart('#chart')
    ];

    // Add event listeners and the like here

    // app.resize() will be called anytime the page size is changed
    d3.select('window').on('resize', app.resize);

    // For demo purposes, let's tick the year every 750ms
    function incrementYear() {
      app.options.year += 1;
      if (app.options.year > END_YEAR) {
        app.options.year = START_YEAR;
      }

      app.update();
    }

    setInterval(incrementYear, TRANSITION_DURATION);
    // d3.interval(incrementYear, TRANSITION_DURATION);
  },

  resize: function () {
    app.components.forEach(function (c) { if (c.resize) { c.resize(); }});
  },

  update: function () {
    app.components.forEach(function (c) { if (c.update) { c.update(); }});
  }
}

function Chart(selector) {
  var chart = this;

  // SVG and MARGINS

  var margin = {
    top: 15, right: 15, bottom: 40, left: 45
  };

  chart.width = 600 - margin.left - margin.right;
  chart.height = 400 - margin.top - margin.bottom;

  chart.svg = d3.select(selector)
    .append('svg')
    .attr('width', chart.width + margin.left + margin.right)
    .attr('height', chart.height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // SCALES

  chart.x = d3.scale.linear()
    .domain([0, d3.max(app.data, function (d) { return d.total_fertility; })])
    .range([0, chart.width])
    .nice();

  chart.y = d3.scale.linear()
    .domain([0, d3.max(app.data, function (d) { return d.life_expectancy; })])
    .range([chart.height, 0])
    .nice();

  chart.r = d3.scale.sqrt()
    .domain([0, d3.max(app.data, function (d) { return d.population; })])
    .range([0, MAX_RADIUS]);

  chart.color = d3.scale.category10();

  // AXES

  var xAxis = d3.svg.axis()
    .orient('bottom')
    .scale(chart.x);

  var yAxis = d3.svg.axis()
    .orient('left')
    .scale(chart.y);

  chart.svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + chart.height + ')')
    .call(xAxis)
    .append('text')
    .attr('y', 30)
    .attr('x', chart.width)
    .style('text-anchor', 'end')
    .style('fill', '#000')
    .style('font-weight', 'bold')
    .text('Fertility (births per woman)');

  chart.svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('dy', '.71em')
    .attr('y', -35)
    .attr('x', 0)
    .style('text-anchor', 'end')
    .style('fill', '#000')
    .style('font-weight', 'bold')
    .text('Life expectancy (years)');

  // YEAR LABEL

  chart.svg.append('text')
    .attr('class', 'year')
    .attr('x', chart.width / 2)
    .attr('y', chart.height / 2)
    .attr('dy', '.35em')
    .style('text-anchor', 'middle')
    .style('font-size', '230px')
    .style('font-weight', 'bold')
    .style('opacity', 0.2)
    .text(app.options.year);

  chart.update();
}

Chart.prototype = {
  update: function () {
    var chart = this;

    // TRANSFORM DATA

    var txData = app.data.filter(function (d) { return d.year === app.options.year; });

    // UPDATE CHART ELEMENTS

    var yearText = d3.selectAll('.year')
      .transition().delay(TRANSITION_DURATION / 2)
      .text(app.options.year);

    var countries = chart.svg.selectAll('.country')
      .data(txData);

    countries.enter().append('circle')
      .attr('class', 'country')
      .style('fill', function (d) { return chart.color(d.continent); })
      .style('opacity', 0.75)
      .attr('r', 0)
      .attr('cx', chart.width / 2)
      .attr('cy', chart.height / 2)

    countries
      .sort(function (a, b) { return b.population - a.population; })
      .transition().duration(TRANSITION_DURATION)
      .attr('r', function (d) { return chart.r(d.population); })
      .attr('cx', function (d) { return chart.x(d.total_fertility); })
      .attr('cy', function (d) { return chart.y(d.life_expectancy); });

    countries.exit()
      .transition().duration(TRANSITION_DURATION)
      .attr('r', 0)
      .remove();
  }
}
