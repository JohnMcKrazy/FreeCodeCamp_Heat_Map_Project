document.addEventListener("DOMContentLoaded", () => {
    console.log("ready");

    const apiURL = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";

    const heatMapContainer = d3.select(".general_container");

    const tip = heatMapContainer.append("div").attr("class", "d3-tip").attr("id", "tooltip");
    const titleSection = heatMapContainer.append("section");

    const mapTitle = titleSection.append("h1").attr("class", "map_title").attr("id", "title").text("Monthly Global Land-Surface Temperature");

    const colorScheme = {};

    const fetchData = async () => {
        const rawData = await d3.json(apiURL);
        console.log(rawData);
        const fontSize = 12;
        const width = 5 * Math.ceil(rawData.monthlyVariance.length / 12);
        const height = 33 * 12;
        const padding = {
            left: 9 * fontSize,
            right: 9 * fontSize,
            top: 1 * fontSize,
            bottom: 8 * fontSize,
        };

        const heatMapSVG = heatMapContainer
            .append("svg")
            .attr("class", "heat_map_container")
            .attr("width", width + padding.left)
            .attr("height", height + padding.bottom + padding.top);

        const mapSubitle = titleSection
            .append("h2")
            .attr("class", "map_subtitle")
            .attr("id", "description")
            .html(rawData.monthlyVariance[0].year + " - " + rawData.monthlyVariance[rawData.monthlyVariance.length - 1].year + ": base temperature " + rawData.baseTemperature + "&#8451;");

        /* 
             //^ DATES DATA  //
        const yearsDate = rawData.map((item)=>  new Date(item[0]));
        //^ DATES DATA MAX AND MIN  //
        const xMax = new Date(d3.max(yearsDate));
        const xMin = new Date(d3.min(yearsDate));
        const xGroup = heatMapSVG.append("g").attr("class", "axis x_axis").attr("id", "x-axis");
        const yGroup = heatMapSVG.append("g").attr("class", "axis y_axis").attr("id", "y-axis"); */

        const yScale = d3
            .scaleBand()
            // months
            .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
            .rangeRound([0, height])
            .padding(0);

        const yAxis = d3
            .axisLeft()
            .scale(yScale)
            .tickValues(yScale.domain())
            .tickFormat(function (month) {
                const date = new Date(0);
                date.setUTCMonth(month);
                const format = d3.utcFormat("%B");
                return format(date);
            })
            .tickSize(10, 1);

        heatMapSVG
            .append("g")
            .classed("y-axis", true)
            .attr("id", "y-axis")
            .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
            .call(yAxis)
            .append("text")
            .text("Months")
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + -7 * fontSize + "," + height / 2 + ")" + "rotate(-90)")
            .attr("fill", "black");

        // xaxis

        // ordinal scale
        const xScale = d3
            .scaleBand()
            .domain(
                rawData.monthlyVariance.map(function (val) {
                    return val.year;
                })
            )
            .range([0, width])
            .padding(0);

        const xAxis = d3
            .axisBottom()
            .scale(xScale)
            .tickValues(
                xScale.domain().filter(function (year) {
                    // set ticks to years divisible by 10
                    return year % 10 === 0;
                })
            )
            .tickFormat(function (year) {
                const date = new Date(0);
                date.setUTCFullYear(year);
                const format = d3.utcFormat("%Y");
                return format(date);
            })
            .tickSize(10, 1);

        heatMapSVG
            .append("g")
            .classed("x-axis", true)
            .attr("id", "x-axis")
            .attr("transform", "translate(" + padding.left + "," + (height + padding.top) + ")")
            .call(xAxis)
            .append("text")
            .text("Years")
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + width / 2 + "," + 3 * fontSize + ")")
            .attr("fill", "black");
    };
    fetchData();
});
