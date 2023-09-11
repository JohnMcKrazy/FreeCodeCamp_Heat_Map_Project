document.addEventListener("DOMContentLoaded", () => {
    // ! API URL ! //
    const apiURL = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";

    // ! COLOR SHEMA ! //
    const colorScheme = ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4", "#313695"];

    var legendColors = colorScheme.reverse();
    // ! CREATE GENERAL CONTAINER ! //
    const heatMapGeneral = d3.select(".general_container");

    // ! CREATE TIP ! //
    const tip = heatMapGeneral.append("div").attr("class", "d3-tip").attr("id", "tooltip");

    // ! CREATE TITLE SECTION! //
    const titleSection = heatMapGeneral.append("section").attr("id", "title_section");
    // ^ CREATE TITLE ^ //
    titleSection.append("h1").attr("class", "map_title").attr("id", "title").text("Monthly Global Land-Surface Temperature");

    // ! CREATE MAP SECTION! //
    const mapSection = heatMapGeneral.append("section").attr("id", "heat_map_section");
    // ^ CREATE MAP CONTAINER ^ //
    const heatMapContainer = mapSection.append("div").attr("class", "heat_map_container");
    // ^ CREATE LEGEND CONTAINER ^ //
    const legendContainer = mapSection.append("div").attr("class", "legend_container").attr("id", "legend");

    // ! FETCHIN DATA !  //
    const fetchData = async () => {
        const rawData = await d3.json(apiURL);
        console.log(rawData);
        const monthlyVariance = rawData.monthlyVariance;
        const baseTemperature = rawData.baseTemperature;
        const fontSize = 12;
        const width = 5 * Math.ceil(monthlyVariance.length / 12);
        const height = 33 * 12;
        const padding = {
            left: 9 * fontSize,
            right: 9 * fontSize,
            top: 1 * fontSize,
            bottom: 5 * fontSize,
        };

        const variance = monthlyVariance.map((val) => val.variance);
        console.log(variance);
        const minTemp = baseTemperature + Math.min.apply(null, variance);
        const maxTemp = baseTemperature + Math.max.apply(null, variance);
        console.log(minTemp, maxTemp);

        // ! LEGEND SIZES ! //
        const legendWidth = 400;
        const legendHeight = 300 / legendColors.length;
        // ! LEGEND THRESHOLD !
        const legendThreshold = d3
            .scaleThreshold()
            .domain(
                ((min, max, count) => {
                    var array = [];
                    var step = (max - min) / count;
                    var base = min;
                    for (var i = 1; i < count; i++) {
                        array.push(base + i * step);
                    }
                    return array;
                })(minTemp, maxTemp, legendColors.length)
            )
            .range(legendColors);
        // ! CREATE SVG ! //
        const heatMapSVG = heatMapContainer
            .append("svg")
            .attr("class", "heat_map_container")
            .attr("width", width + padding.left)
            .attr("height", height + padding.bottom + padding.top);

        // ! CREATE SUBTITLE ! //
        titleSection
            .append("h2")
            .attr("class", "map_subtitle")
            .attr("id", "description")
            .html(monthlyVariance[0].year + " - " + monthlyVariance[monthlyVariance.length - 1].year + ": base temperature " + baseTemperature + "&#8451;");

        // ! CREATE MAP Y SCALE ! //
        const yScale = d3
            .scaleBand()
            // months
            .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
            .rangeRound([0, height]);

        // ! CREATE MAP Y AXIS ! //
        const yAxis = d3
            .axisLeft()
            .scale(yScale)
            .tickValues(yScale.domain())
            .tickFormat((month) => {
                const date = new Date(0);
                date.setUTCMonth(month);
                const format = d3.utcFormat("%B");
                return format(date);
            });

        // ! CREATE AND CALL MAP Y AXIS ! //
        heatMapSVG
            .append("g")
            .attr("class", "axis y-axis")
            .attr("id", "y-axis")
            .attr("transform", `translate(${padding.left},${padding.top})`)
            .call(yAxis)
            .append("text")
            .text("Months")
            .style("text-anchor", "middle")
            .attr("transform", `translate(${-7 * fontSize},${height / 2}) rotate(-90)`);

        // ! CREATE MAP X SCALE ! //
        const xScale = d3
            .scaleBand()
            .domain(monthlyVariance.map((val) => val.year))
            .range([0, width])
            .padding(0);

        // ! CREATE MAP X AXIS ! //
        const xAxis = d3
            .axisBottom()
            .scale(xScale)
            .tickValues(
                xScale.domain().filter((year) => {
                    return year % 10 === 0;
                })
            )
            .tickFormat((year) => {
                const date = new Date(0);
                date.setUTCFullYear(year);
                const format = d3.utcFormat("%Y");
                return format(date);
            })
            .tickSize(10, 1);

        // ! CREATE AND CALL MAP X AXIS ! //
        heatMapSVG
            .append("g")
            .attr("class", "axis x-axis")
            .attr("id", "x-axis")
            .attr("transform", `translate(${padding.left},${height + padding.top})`)
            .call(xAxis)
            .append("text")
            .text("Years")
            .style("text-anchor", "middle")
            .attr("transform", `translate(${width / 2},${3 * fontSize})`);

        // ! CREATE HEAT MAP RECTS !
        heatMapSVG
            .append("g")
            .attr("class", "map")
            .attr("transform", `translate(${padding.left}, ${padding.top})`)
            .selectAll("rect")
            .data(monthlyVariance)
            .enter()
            .append("rect")
            .attr("class", "cell")
            .attr("data-month", (d) => d.month)
            .attr("data-year", (d) => d.year)
            .attr("data-temp", (d) => baseTemperature + d.variance)
            .attr("x", (d) => xScale(d.year))
            .attr("y", (d) => yScale(d.month - 1))
            .attr("width", (d) => xScale.bandwidth(d.year))
            .attr("height", (d) => yScale.bandwidth(d.month))
            .attr("fill", (d) => legendThreshold(baseTemperature + d.variance));

        // ! CREATE LEGEND X SCALE ! //
        const legend_xScale = d3.scaleLinear().domain([minTemp, maxTemp]).range([0, legendWidth]);

        // ! CREATE LEGEND X AXIS ! //
        const legend_xAxis = d3.axisBottom().scale(legend_xScale).tickValues(legendThreshold.domain()).tickFormat(d3.format(".1f"));

        // ! CREATE LEGEND SVG ! //
        const legendSVG = legendContainer
            .append("svg")
            .attr("width", width)
            .attr("height", legendHeight * 2)
            .attr("transform", `translate(${padding.left},0)`);

        // ! CREATE AND CALL LEGEND X AXIS ! //
        legendSVG
            .append("g")
            .attr("class", "legend_axis legend_y-axis")
            .attr("id", "legend_y-axis")
            .attr("transform", "translate(" + 0 + "," + legendHeight + ")")
            .call(legend_xAxis)
            .append("text")
            .text("Temperature Threshold");

        // ! CREATE LEGEND RECT ! //
        legendSVG
            .append("g")
            .selectAll("rect")
            .data(
                legendThreshold.range().map((color) => {
                    const d = legendThreshold.invertExtent(color);
                    if (d[0] === null) {
                        d[0] = legend_xScale.domain()[0];
                    }
                    if (d[1] === null) {
                        d[1] = legend_xScale.domain()[1];
                    }
                    return d;
                })
            )
            .enter()
            .append("rect")
            .style("fill", (d) => legendThreshold(d[0]))
            .attr("x", (d) => legend_xScale(d[0]))
            .attr("y", 0)
            .attr("width", (d) => (d[0] && d[1] ? legend_xScale(d[1]) - legend_xScale(d[0]) : legend_xScale(null)))
            .attr("height", legendHeight)
            .attr("class", "scale_color");

        // ?  ? //
    };
    fetchData();
});
