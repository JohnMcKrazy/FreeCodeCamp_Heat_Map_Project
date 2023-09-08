document.addEventListener("DOMContentLoaded", () => {
    console.log("ready");
    const heatMapContainer = d3.select(".map_container");

    const mapTitle = heatMapContainer.append("text").attr("class", "map_title").attr("id", "title").text("Monthly Global Land-Surface Temperature");
    const mapSubitle = heatMapContainer.append("text").attr("class", "map_subtitle").attr("id", "description").text("1753 - 2015: base temperature 8.66℃");
});
