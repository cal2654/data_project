(() => { const width = 800, height = 400;


// This determines which container to use and which CSV to load based on the page
let containerId, csvFile;
 // Check for the presence of the first graph container
if (document.getElementById("graph-container")) {
  containerId = "graph-container";
  csvFile = "nintendo_prices.csv";

  // Check for the presence of the first graph container
} else if (document.getElementById("graph-container2")) {
  containerId = "graph-container2";
  csvFile = "nintendo_prices_inflation.csv";

  // Fallback if neither containor exists
} else {
  console.error("No valid graph container found on this page.");
  return;
}
console.log("Using container:", containerId, "→ loading:", csvFile);

// Load the CSV file
d3.csv(csvFile)
  .then(data => {
    console.log("✅ CSV loaded, rows:", data.length);

    // Parse the data
    data.forEach(d => {
      d.date = new Date(d.release_year);  // Converts year into a full Date object
      d.close = +d.price_usd; // Cast price to number
    });
  
  // Sets up the x and y scales
  const x = d3.scaleTime() 
    .domain(d3.extent(data, d => d.date)) // Compute min and max date range
    .range([40, width - 20]); // Leave margins on sides

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.close)]) // Y domain goes from 0 to max price
    .nice() // Extend domain to round numbers
    .range([height - 30, 10]); // Inverted y axis

  // These generate the axises
  const xAxis = (g, scale) => g
    .attr("transform", `translate(0,${height - 30})`) // Position at bottom
    .call(d3.axisBottom(scale).ticks(5)); // Generate 5 ticks

  const yAxis = (g, scale) => g
    .attr("transform", `translate(40,0)`) // Align with left margin
    .call(d3.axisLeft(scale)); // Standard left axis

  // The main chart fuction
  function chart() {
    // SVG element that sets its size and responsiveness
    const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const zx = x.copy(); // Zoomable x-scale

    // Line generator function that maps data points to x and y paths
    const line = d3.line()
      .x(d => zx(d.date))
      .y(d => y(d.close));

    // Append the line path to the SVG
    const path = svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-miterlimit", 1)
      .attr("d", line);

    // Append x and y axes
    const gx = svg.append("g").call(xAxis, zx);
    const gy = svg.append("g").call(yAxis, y);

    // Create a tooltip div 
    const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("background", "#fff")
        .style("padding", "5px 10px")
        .style("border", "1px solid #ccc")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("display", "none");

    // Draws data points as small dots and add hover interaction
    svg.selectAll("circle")
    const dots = svg.append("g")
    .attr("class", "dots")
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("r", 4)
    .attr("fill", "steelblue")
    .attr("cx", d => zx(d.date)) // X position based on zoomable scale
    .attr("cy", d => y(d.close)) // Y position
    .on("mouseover", (event, d) => {
      // Shows the tooltip with info on hover
        tooltip.style("display", "block")
          .html(
            `<strong>${d.console}</strong><br>` +
            `${d.date.toLocaleDateString()}<br>` +
            `Price: $${d.close.toFixed(2)}`
          );
    })
        .on("mousemove", (event) => {
          // Move tooltip with mouse
    tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px");
     })
        .on("mouseout", () => {
          // Hide tooltip when not hovering
    tooltip.style("display", "none");
    });

    // Update method for handling zoom on chart
    return Object.assign(svg.node(), {
      update(domain) {
        const t = svg.transition().duration(750); // Animation duration
        zx.domain(domain); // Update zoom domain
        gx.transition(t).call(xAxis, zx); // Update x-axis
        path.transition(t).attr("d", line); // Redraw line
        dots.transition(t)  // Move dots to new x scale
          .attr("cx", d => zx(d.date))
          .attr("cy", d => y(d.close));
      }
    });
  }

   // Create and append the chart to the correct container
  const chartEl = chart();
  document.getElementById(containerId).appendChild(chartEl);

   // Define zoom behavior and bind it to the chart
  const zoom = d3.zoom()
  .scaleExtent([1, 10])  // Allow zoom levels 1x–10x
  .translateExtent([[0, 0], [width, height]]) // Limit zoomable area
  .on("zoom", (event) => {
    const newX = event.transform.rescaleX(x); // Rescale x-axis on zoom
    chartEl.update(newX.domain());  // Redraw chart
  });
// Apply zooming and panning behavior to the chart
d3.select(chartEl).call(zoom);
});
})();