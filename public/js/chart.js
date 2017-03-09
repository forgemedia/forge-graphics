var gradient = "linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15)), ";

var colourScale = d3.scaleLinear()
    .interpolate(d3.interpolateRgb)
    .range([d3.rgb("#00222b"), d3.rgb('#26bae1')]);
var colourDelayFunction = function (d, i) {
	return (i * textInterval) + (textDelay * 0.75);
};

var textDelay = 2000;
var textInterval = 75;
var textDelayFunction = function (d, i) {
	return (i * textInterval) + textDelay;
};

var voteReturn = function(d, voteCount, final) {
	var value = final ? d.final : d.votes;
	if (value == 0) return "";
	return Math.round((value / voteCount) * 1000) / 10 + "%";
}

function barChartVotes(ax, data, error, final) {
	if (error) throw error;

	var a = d3.select(ax).selectAll("div");

	data.sort(function(a, b) {
		return final ? (a.final - b.final) : (a.votes - b.votes);
	}).reverse();

	console.log(data);
    var dcScale = colourScale.domain([0, final ? d3.max(data).final : d3.max(data).votes]);
	var lScale = d3.scaleLinear().domain([0, final ? d3.max(data).final : d3.max(data).votes]).range([0, 65]);

	var voteCount = 0;
	data.forEach(function(d, i) {
		// console.log("voteCount: " + voteCount);
		// console.log(d.votes);
		voteCount += parseInt(final? d.final : d.votes);
	});
		// console.log(a);
		var x = a.data(data)
		.enter().append("div").attr("class", "barContainer");
		var b = x.append("div");
			b.attr("class", "bar")
			.style("width", "0px")
			.style("background", gradient + "#26bae1")
			.style("opacity", 0)
			.transition()
			.ease(d3.easeBack)
			.duration(1000)
			.style("opacity", 1)
			.duration(500)
			.delay(500)
			.style("width", function(d) { return lScale(final? d.final : d.votes) + "vw"; });
			b.transition().
			style("background", function(d, i) {
				return "linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15)), " + dcScale(d.votes);
			})
			.delay(colourDelayFunction);
			x.append("div")
				.attr("class", "name")
				.text(function(d) { return d.name; })
				.style("opacity", 0)
				.transition()
				.style("opacity", 1)
				.delay(textDelayFunction);
			b.append("span")
				.attr("class", "tally")
				.text(function(d) { return final? d.final : d.votes; })
				.style("opacity", 0)
				.transition()
				.style("opacity", 1)
				.delay(textDelayFunction);
			b.append("span")
				.attr("class", "percentage")
				.text(function(d) { return voteReturn(d, voteCount, final); })
				.style("opacity", 0)
				.transition()
				.style("opacity", 0.75)
				.delay(textDelayFunction);
}

function type(d) {
    d.votes = +d.votes;
    return d;
}
