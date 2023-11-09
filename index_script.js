// Function to reload the page
function refreshPage() 
{
    location.reload();
}

// Function to load googlemaps view
function goToGooglemappage() 
{
    window.location.href = "Index_googlemaps.html";
}


var margin = { top: 0, left: 0, right: 0, bottom: 0 };
var height = 900;
var width =900;

var svg = d3.select("#map")
    .append("svg")
    .attr("height", height)
    .attr("width", width)
    .append("g")
    .attr("id", "svg_id");

var projection = d3.geoNaturalEarth1()
    .translate([width / 2, height / 2])
    .scale(3200)
    .center([-2, 52]);

var path = d3.geoPath().projection(projection);

var townsData; // Variable to store the town data
var circlesGroup; // Group to hold the circles
var labelGroup; // Group to hold the town labels

// Function to update the map with the selected number of towns
function updateMap(selectedValue) 
{
    var selectedTowns = townsData.slice(0, selectedValue);

    // Remove existing circles and town labels based on slider value
    circlesGroup.selectAll(".circle").remove();
    labelGroup.selectAll(".townLabel").remove();

    // Create a tooltip
    var Tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip");

    // Three functions that change the tooltip when the user hovers/moves/leaves a cell
    var mouseover = function(d) 
    {
      Tooltip.style("opacity", 1);
    }

    var mousemove = function(d) 
    {
      Tooltip
        .html(d.Town + "<br>" + "long: " + d.lng + "<br>" + "lat: " + d.lat + "<br>" + "Population: " + d.Population)
        .style("left", (d3.event.pageX + 5) + "px")
        .style("top", (d3.event.pageY) + "px");
    }

    var mouseleave = function(d) {
      Tooltip.style("opacity", 0);
    }

    // Create a linear scale for the radius
    var radiusScale = d3.scaleSqrt()
                        .domain([d3.min(selectedTowns, function(d) { return d.Population; }), d3.max(selectedTowns, function(d) { return d.Population; })])
                        .range([5, 25]);

    var opacityScale = d3.scaleSqrt()
                        .domain([d3.min(selectedTowns, function(d) { return d.Population; }), d3.max(selectedTowns, function(d) { return d.Population; })])
                        .range([1, 0.4]);

    // Add circles for towns
    circlesGroup
      .selectAll("myCircles")
      .data(selectedTowns)
      .enter()
      .append("circle")
      .attr("class", "circle")
      .attr("cx", function(d) { return projection([d.lng, d.lat])[0]; })
      .attr("cy", function(d) { return projection([d.lng, d.lat])[1]; })
      .attr("r", function(d) { return radiusScale(d.Population); }) // Adjust the circle radius as needed
      .style("fill", "#3498DB")
      .attr("stroke", "#1C2833")
      .attr("stroke-width", 1)
      .attr("fill-opacity", function(d) { return opacityScale(d.Population); })
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

    // Add town names
    labelGroup
      .selectAll("townLabels")
      .data(selectedTowns)
      .enter()
      .append("text")
      .attr("class", "townLabel")
      .attr("x", function(d) { return projection([d.lng, d.lat])[0] + 5; })
      .attr("y", function(d) { return projection([d.lng, d.lat])[1] - 5; })
      .text(function(d) { return d.Town; })
      .attr("font-size", "10px")
      .attr("fill", "white");
}

// Load UK map
d3.json('https://yamu.pro/gb.json', function(error, data) 
{
    svg.selectAll(".country")
      .data(data.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path)
      .append('title')
      .text("Great Britain");

    // Load towns data
    d3.json("http://34.38.72.236/Circles/Towns/100", function(error, towns) 
    {
        townsData = towns; // Store the town data

        // Draw the initial map with 50 towns
        circlesGroup = svg.append("g");
        labelGroup = svg.append("g");
        updateMap(50);

        // Create a tooltip
        var Tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip");

        // Three functions that change the tooltip when the user hovers/moves/leaves a cell
        var mouseover = function(d)     
        {
            Tooltip.style("opacity", 1);
        }

        var mousemove = function(d) 
        {
            Tooltip
            .html(d.Town + "<br>" + "long: " + d.lng + "<br>" + "lat: " + d.lat + "<br>" + "Population: " + d.Population)
            .style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY) + "px");
        }

        var mouseleave = function(d) 
        {
            Tooltip.style("opacity", 0);
        }

        // Slider functionality
        var slider = document.getElementById("townsSlider");
        var output = document.getElementById("townsValue");
        output.innerHTML = slider.value;

        slider.oninput = function() 
        {
            output.innerHTML = this.value;
            updateMap(this.value); // Update the map with the selected value
        };
    });
});
  document.getElementById("refresh-button").addEventListener("click", refreshPage);
