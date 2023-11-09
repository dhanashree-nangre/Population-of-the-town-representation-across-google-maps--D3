// Function to reload the page
function refreshPage() 
{
    location.reload();
}

// Function to load regular maps view
function goTogeopathmaps() 
{
    window.location.href = "index.html";
}

// Create the Google Map…
var map = new google.maps.Map(d3.select("#map").node(), 
{
  zoom: 6,
  center: new google.maps.LatLng(54.721135, -3.277264),
  mapTypeId: google.maps.MapTypeId.TERRAIN
});

// Load the station data. When the data comes back, create an overlay.
d3.json("http://34.38.72.236/Circles/Towns/50", function(error, data) 
{
    if (error) throw error;
    var overlay = new google.maps.OverlayView();
    var townsData; // To store all towns data
    var marker; // Declare the marker variable at the top level
    var layer; // Declare the layer variable at the top level
    var padding = 25;

    // Create a linear scale for the radius
    var radiusScale = d3.scale.linear()
                        .domain([d3.min(data, function(d) { return d.Population; }), d3.max(data, function(d) { return d.Population; })])
                        .range([5, 25]);

    var colourscale = d3.scale.linear()
                        .domain([d3.min(data, function(d) { return d.Population; }), d3.max(data, function(d) { return d.Population; })])
                        .range(['blue','#4D2287']);

    var opacityScale = d3.scale.linear()
                        .domain([d3.min(data, function(d) { return d.Population; }), d3.max(data, function(d) { return d.Population; })])
                        .range([1,0.2]); 

    // Create the tooltip
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

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
        .style("top", (d3.event.pageY) + "px")
        .style("display", "block");
    }

    var mouseleave = function(d) 
    {
        Tooltip.style("opacity", 0);
    }

    // Add the container when the overlay is added to the map.
    overlay.onAdd = function() 
    {
        layer = d3.select(this.getPanes().overlayLayer).append("div")
                .attr("class", "town");

        // Draw each marker as a separate SVG element.
        // We could use a single SVG, but what size would it have?
        overlay.draw = function() 
        {
            var projection = this.getProjection(),
            marker = layer.selectAll("svg")
                    .data(data)
                    .each(transform) // update existing markers
                    .enter().append("svg")
                    .each(transform)
                    .attr("class", "marker");

            // Add a circle.
            marker.append("circle")
                    .attr("r", function(d) { return radiusScale(d.Population); })
                    .attr("cx", padding)
                    .attr("cy", padding)
                    .style("fill", function(d) { return colourscale(d.Population); })
                    .style("opacity", 0.7)
                    .style("stroke", "black")
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave);

            marker.append("title") // Append a title element for the tooltip
                    .text(function(d) { return d.Town + "\nPopulation: " + d.Population; });

             // Add a label.
            marker.append("text")
                    .attr("x", padding + 7)
                    .attr("y", padding)
                    .attr("dy", ".31em")
                    .attr("colour",'white')
                    .text(function(d) { return d.Town; });
                
            function transform(d) 
            {
                d = new google.maps.LatLng(d.lat, d.lng);
                d = projection.fromLatLngToDivPixel(d);
                return d3.select(this)
                    .style("left", (d.x - padding) + "px")
                    .style("top", (d.y - padding) + "px");
            }
        };
    };

    // Bind our overlay to the map…
    overlay.setMap(map);

});

// Add an event listener to the refresh button
document.getElementById("refresh-button").addEventListener("click", refreshPage);

// Slider functionality
var slider = document.getElementById("townsSlider");
var output = document.getElementById("townsValue");
output.innerHTML = slider.value;

slider.oninput = function() 
{
    output.innerHTML = this.value;
    updateMap(this.value); // Update the map with the selected value
}