class Info{
    constructor(all_data,sequence){
        this.all_data = all_data
        this.sequence = sequence

        this.infoDiv = d3.select("#info-div")
        this.numColorStops = 500

        this.legend = this.infoDiv
            .append("svg")
            .attr("class", "legend")
            .attr("width", 80)
            .attr("height", 400)
            .style("float", "right")
            .style('margin-top', 50)
            .style('margin-right', 0)
        this.axis = this.legend.append('g')

           


    }

    drawLegend(){
    const that = this

    this.legend.selectAll("rect").remove()
    this.legend.selectAll("text").remove()


    var colorStops = d3.range(this.sequence.max_abs*-1, this.sequence.max_abs, (this.sequence.max_abs - (this.sequence.max_abs*-1)) / this.numColorStops);
    colorStops = colorStops.reverse()
    
    this.legend.selectAll("rect")
    .data(colorStops)
    .enter()
    .append("rect")
    .attr("x", 70)
    .attr("y", function (d, i) { return i * (400 / that.numColorStops); })
    .attr("width", 10)
    .attr("height", (400 / this.numColorStops)+3)
    .style("fill", function (d) { return that.sequence.color_scale(d); })
    .style('stroke-width', 0)
    .style('stroke', 'none')
    .style('stroke-opacity', '0')


    this.legend.append("text")
        .attr("x", 60)
        .attr("y", 15)
        .text(d3.format(".2f")(this.sequence.max_abs))
        .attr("text-anchor", "end")
        .style("font-family", "monospace")



    this.legend.append("text")
        .attr("x", 60)
        .attr("y", 400 -10)
        .text(d3.format(".2f")(-1*this.sequence.max_abs))
        .attr("text-anchor", "end")
        .style("font-family", "monospace")



    this.legend.append("text")
        .attr("x", 60)
        .attr("y", 400/2)
        .text("   0")
        .attr("text-anchor", "end")
        .style("font-family", "monospace")





   
   


    }
}