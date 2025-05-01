const width = 800, height = 400;

  d3.csv("nintendo_prices.csv").then(data => {
  
    data.forEach(d => {
        d.date = new Date(d.release_year);
        d.close = +d.price_usd;
    });
  

  const x = d3.scaleTime() 
    .domain(d3.extent(data, d => d.date))
    .range([40, width - 20]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.close)])
    .nice()
    .range([height - 30, 10]);

  const xAxis = (g, scale) => g
    .attr("transform", `translate(0,${height - 30})`)
    .call(d3.axisBottom(scale).ticks(5));

  const yAxis = (g, scale) => g
    .attr("transform", `translate(40,0)`)
    .call(d3.axisLeft(scale));

  function chart() {
    const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const zx = x.copy(); // Zoomable x-scale

    const line = d3.line()
      .x(d => zx(d.date))
      .y(d => y(d.close));

    const path = svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-miterlimit", 1)
      .attr("d", line);

    const gx = svg.append("g").call(xAxis, zx);
    const gy = svg.append("g").call(yAxis, y);

    const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("background", "#fff")
        .style("padding", "5px 10px")
        .style("border", "1px solid #ccc")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("display", "none");

    svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => zx(d.date))
        .attr("cy", d => y(d.close))
        .attr("r", 4)
        .attr("fill", "steelblue")
        .on("mouseover", (event, d) => {
            tooltip.style("display", "block")
            .html(
              `<strong>${d.console}</strong><br>` +
              `${d.date.toLocaleDateString()}<br>` +
              `Price: $${d.close.toFixed(2)}`
            );          
    })
        .on("mousemove", (event) => {
    tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px");
     })
        .on("mouseout", () => {
    tooltip.style("display", "none");
    });


    return Object.assign(svg.node(), {
      update(domain) {
        const t = svg.transition().duration(750);
        zx.domain(domain);
        gx.transition(t).call(xAxis, zx);
        path.transition(t).attr("d", line);
      }
    });
  }

  const chartEl = chart();
  document.getElementById("graph-container").appendChild(chartEl);

  const zoom = d3.zoom()
  .scaleExtent([1, 10])
  .translateExtent([[0, 0], [width, height]])
  .on("zoom", (event) => {
    const newX = event.transform.rescaleX(x);
    chartEl.update(newX.domain());
  });

d3.select(chartEl).call(zoom);
  });