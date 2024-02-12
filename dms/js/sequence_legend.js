class SequenceLegend{
    constructor(all_data,sequence){
        this.all_data = all_data
        this.sequence = sequence

        this.sequenceLegendDiv = d3.select("#sequence-legend-div")
        this.numColorStops = 150
        this.LEGEND_HEIGHT = 300 
        this.LEGEND_TOTAL_WIDTH = 140
        this.LEGEND_SQUARE_WIDTH = 15
        this.LEGEND_MARGINS = { top: 15, left: 80, right: 20, bottom: 20 }
        this.SHIFT_COLOR_LEGEND_DOWN = 40

        this.first_time_drawing = true
        this.transition_time = 500
        this.frequency_drawn = false


    }

    clear(){  
        d3.select("#sequence_legend_svg")
        .remove()
    }

    drawLegend(){
    const that = this

    let total_height = document.getElementById('sequence-legend-div').getBoundingClientRect().height -  document.getElementById('sequence-legend-div-labels').getBoundingClientRect().height 
    let total_width = document.getElementById('sequence-legend-div').getBoundingClientRect().width



    this.legend = this.sequenceLegendDiv
            .append("svg")
            .attr("id", "sequence_legend_svg")
            .attr("width", total_width)
            .attr("height", total_height)
            .style("position", "absoloute")


    var colorStops = d3.range(this.sequence.max_abs*-1, this.sequence.max_abs, (this.sequence.max_abs - (this.sequence.max_abs*-1)) / this.numColorStops);
    colorStops = colorStops.reverse()

    this.legend.append("text")
    .attr("x", total_width/2)
    .attr("y", 20)
    .style("font-family", "monospace")
    .attr("text-anchor", "middle")
    .text("Effect Size")

    this.legend.append("text")
    .style('font-family', 'Linearicons-Free')
    .attr('font-size', '15px' )
    .attr('id', "question_icon")
    .text('\ue87d')
    .attr('x', 120)
    .attr('y',23)
    .attr("fill","black")
    .on("mouseover", function(even){
        d3.select(".tooltip")
        .style("opacity",1)
        d3.select(this)
        .style("opacity", .5)
        .style("stroke", "black")
        .style("stroke-width", 2)
        .style("stroke-opacity", 1)
})
.on("mousemove", function(event){
    d3.select(".tooltip")
      .html("Extra info coming soon!!!")
      .style("left", `${event.pageX - 100}px`)
      .style("top", `${event.pageY - 30}px`)
})
.on("mouseleave", function(event,d){
    d3.select(".tooltip")
    .style("opacity", 0)
  d3.select(this)
  .style("opacity", function(){
      if (that.cell_type == "circles"){
          return(0)
      }
      else{
          return(1)
      }
    })
    .style("stroke", "none")
})

   

    
    this.legend.selectAll("rect")
    .data(colorStops)
    .enter()
    .append("rect")
    .attr("x", total_width - this.LEGEND_SQUARE_WIDTH)
    .attr("y", function (d, i) { return i * (that.LEGEND_HEIGHT / that.numColorStops) + that.SHIFT_COLOR_LEGEND_DOWN})
    .attr("height", (this.LEGEND_HEIGHT / this.numColorStops)+3)
    .style("fill", function (d) { return that.sequence.color_scale(d); })
    .attr("width", this.LEGEND_SQUARE_WIDTH)
    .style('stroke-width', 0)
    .style('stroke', 'none')
    .style('stroke-opacity', '0')


    this.legend.append("text")
        .attr("x", total_width - this.LEGEND_SQUARE_WIDTH - 2)
        .attr("y", this.SHIFT_COLOR_LEGEND_DOWN + 12)
        .text(d3.format(".2f")(this.sequence.max_abs))
        .attr("text-anchor", "end")
        .style("font-family", "monospace")



    this.legend.append("text")
        .attr("x", total_width - this.LEGEND_SQUARE_WIDTH - 2)
        .attr("y", this.LEGEND_HEIGHT + this.SHIFT_COLOR_LEGEND_DOWN)
        .text(d3.format(".2f")(-1*this.sequence.max_abs))
        .attr("text-anchor", "end")
        .style("font-family", "monospace")



    this.legend.append("text")
        .attr("x", total_width - this.LEGEND_SQUARE_WIDTH )
        .attr("y", (this.LEGEND_HEIGHT +this.SHIFT_COLOR_LEGEND_DOWN+this.SHIFT_COLOR_LEGEND_DOWN)/2)
        .text("   0")
        .attr("text-anchor", "end")
        .style("font-family", "monospace")

    }

    addFrequencyLegend(){
        //Get all the scientific notations for the the frequencies
        //Gets all the lowest rounded frequencies
        const that = this
        this.frequency_drawn = true
        let positions = [...new Set(this.all_data.map((item) =>(+(+item.freq).toPrecision(1)).toExponential() ))];   
        positions = positions.filter(function(d){return d != "NaN"})
        positions = [...new Set(positions.map((item) => "1"+item.substr(1)))]
        positions = positions.map((item) => (+item).toExponential())
        positions.sort()

        var n = 1
        positions.forEach((freq) => {
            n+=1

            this.legend.append("circle")
            .attr("class", "freq-legend")
            .attr("cx", 130)
            .attr("cy", this.LEGEND_HEIGHT + this.SHIFT_COLOR_LEGEND_DOWN + (this.sequence.max_radius * 2 * n))
            .transition()
            .duration(function(){
                if (that.first_time_drawing){
                    return(that.transition_time)
                }
                else{
                    return(0)
                }
            })            .attr("r", this.sequence.r_scale(+freq))
            .style("fill", "darkgrey")

            this.legend.append("text")
            .attr("class", "freq-legend")
            .attr("x", 120)
            .attr("y", this.LEGEND_HEIGHT + this.SHIFT_COLOR_LEGEND_DOWN + (this.sequence.max_radius * 2 * n) + this.sequence.max_radius/2)
            .transition()
            .duration(function(){
                if (that.first_time_drawing){
                    return(that.transition_time)
                }
                else{
                    return(0)
                }
            })
            .text(positions[n-2])
            .style("font-family", "monospace")
            .attr("text-anchor", "end")
            .style("font-size",`${this.sequence.max_radius * 1.4}px`)
        });
        this.first_time_drawing = false
    }

    clearFrequencyLegend(){
        this.legend.selectAll(".freq-legend")
       .remove()
       this.first_time_drawing = true

    }
}