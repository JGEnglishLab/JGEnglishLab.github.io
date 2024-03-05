class SequenceLegend{
    constructor(all_data,sequence,descriptor_data){
        /////////////////////////////////////////////////////////////////////////////////////////////////
        //                                  CONSTANTS
        /////////////////////////////////////////////////////////////////////////////////////////////////
        this.NUM_COLOR_STOPS = 150
        this.LEGEND_HEIGHT = 150 
        this.LEGEND_TOTAL_WIDTH = 140
        this.LEGEND_SQUARE_WIDTH = 15
        this.LEGEND_MARGINS = { top: 15, left: 80, right: 20, bottom: 20 }
        this.SHIFT_COLOR_LEGEND_DOWN = 80
        this.SOLID_RECT_HEIGHT = 30
        this.SOLID_RECT_GAP = 5
        this.RECT_OVERLAP = 3
        this.AXIS_HORIZONTAL_PADDING = 7
        this.SHIFT_LEGEND_LABELS_LEFT = 1
        this.SHIFT_LEGEND_DESCRIPTORS_LEFT = 30 
        this.FREQUENCY_TRANSITION_TIME = 500
        this.DESCRIPTOR_LABEL_TRANSITION_TIME = 200
        this.SHIFT_LEGEND_TITLE_DOWN = 30
        this.LEGEND_FONT_SIZE = 10 
        this.SHIFT_FREQUENCY_CIRCLES_RIGHT = 130
        this.FREQUENCY_CIRCLE_TEXT_BUFFER = 5


        /////////////////////////////////////////////////////////////////////////////////////////////////
        //                                  GENERAL SET UP 
        /////////////////////////////////////////////////////////////////////////////////////////////////
        this.sequenceLegendDiv = d3.select("#sequence-legend-div")
        this.sequenceLegendLabelsDiv = d3.select("#sequence-legend-div-labels")
        this.all_data = all_data
        this.sequence = sequence
        this.descriptor_data = descriptor_data
        this.first_time_drawing = true
        this.frequency_drawn = false

        //Add tool tip events for percentile labels
        var percentil_labels = document.getElementsByClassName("percentile-labels")
        function mouseover(){
            d3.select("#default_tooltip")
            .style("opacity", 1)
        }
        function mousemove(d){
-            d3.select("#default_tooltip")
                .html("Selectors used to pick top and bottom percentiles<br>Anything above or below selected percentiles will be the same color")
                .style("left", `${d.clientX - 150}px`)
                .style("top", `${d.clientY + 40}px`)
        }
        function mouseleave(){
            d3.select("#default_tooltip")
                  .style("opacity", 0)
        }

        for (let i = 0; i < percentil_labels.length; i++) {
            percentil_labels[i].addEventListener("mouseover", mouseover);
            percentil_labels[i].addEventListener("mousemove", mousemove);
            percentil_labels[i].addEventListener("mouseleave", mouseleave);
        }
    }


    /////////////////////////////////////////////////////////////////////////////////////////////// 
    //                                 HELPER FUNCTIONS
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //Get range from min to max in n_steps
    range(min, max, n_steps) {
        const step = (max - min) / (n_steps - 1); // Calculate the step size
        const result = [];
        for (let i = 0; i < n_steps; i++) {
            result.push(min + step * i); // Add values to the result array
        }
        return result;
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        clear()

    Removes everything from sequence_legend_svg
    *////////////////////////////////////////////////////////////////////////////////////////////////
    clear(){  
        d3.select("#sequence_legend_svg")
        .remove()
    }

    
    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        drawLegend()

    Draws legend for heatMap
    *////////////////////////////////////////////////////////////////////////////////////////////////
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
    this.axis_g = this.legend.append("g")
        .attr("id","color-legend-axis")

    //Draw legend title
    this.legend.append("text")
        .attr("x", total_width/2)
        .attr("y", this.SHIFT_LEGEND_TITLE_DOWN)
        .style("font-family", "monospace")
        .attr("text-anchor", "middle")
        .text("Effect Size")
        .style("cursor", "help")
        .on("mouseover", function(){
            defaultMouseover("300px")
        })
        .on("mousemove", function(event){
            let selected_protein_conditions = that.descriptor_data[that.sequence.selected_protein].conditions
            defaultMousemove(selected_protein_conditions[that.sequence.selected_condition], event,-100,30)
        })
        .on("mouseleave", function(event,d){
            defaultMouseleave()
        })
    
    //Get the numbers from bottom_val to top_val in num colorsteps
    //Reverse so max is at top
    let data_range = this.range(this.sequence.bottom_value, this.sequence.top_value, this.NUM_COLOR_STOPS)
    data_range.reverse()
    this.legend.selectAll("rect")
        .data(data_range)
        .enter()
        .append("rect")
        .attr("x", total_width - this.LEGEND_SQUARE_WIDTH)
        .attr("y", function (d, i) { return i * (that.LEGEND_HEIGHT / that.NUM_COLOR_STOPS) + that.SHIFT_COLOR_LEGEND_DOWN})
        .attr("height", (this.LEGEND_HEIGHT / this.NUM_COLOR_STOPS)+this.RECT_OVERLAP)
        .style("fill", function (d) { return that.sequence.color_scale(d); })
        .attr("width", this.LEGEND_SQUARE_WIDTH)
    
    //Add solid rect at bottom that shows the min value
    this.legend
        .append("rect")
        .attr("x", total_width - this.LEGEND_SQUARE_WIDTH)
        .attr("y", that.LEGEND_HEIGHT + that.SHIFT_COLOR_LEGEND_DOWN + this.RECT_OVERLAP + this.SOLID_RECT_GAP)
        .attr("height", this.SOLID_RECT_HEIGHT)
        .style("fill", this.sequence.color_scale(this.sequence.bottom_value))
        .attr("width", this.LEGEND_SQUARE_WIDTH)

    //Add solid rect at top that shows the max value
    this.legend
    .append("rect")
        .attr("x", total_width - this.LEGEND_SQUARE_WIDTH)
        .attr("y", this.SHIFT_COLOR_LEGEND_DOWN -  this.SOLID_RECT_HEIGHT - this.SOLID_RECT_GAP)
        .attr("height", this.SOLID_RECT_HEIGHT)
        .style("fill", this.sequence.color_scale(this.sequence.top_value))
        .attr("width", this.LEGEND_SQUARE_WIDTH)


    //Mousover any rect to show the .legend_descriptor class   
    this.legend
        .selectAll("rect")
        .on("mouseover", function(){
            d3.selectAll(".legend_descriptors").transition().duration(that.DESCRIPTOR_LABEL_TRANSITION_TIME).style("opacity", 1)
        })
        .on("mouseleave", function(){
            d3.selectAll(".legend_descriptors").transition().duration(that.DESCRIPTOR_LABEL_TRANSITION_TIME).style("opacity", 0)
        })

    //Add a linear scale so we can overlay an axis by the squares
    let scale = d3.scaleLinear()
        .domain([this.sequence.top_value, this.sequence.bottom_value])
        .range([this.SHIFT_COLOR_LEGEND_DOWN + this.AXIS_HORIZONTAL_PADDING, (this.SHIFT_COLOR_LEGEND_DOWN+this.RECT_OVERLAP + this.LEGEND_HEIGHT) - this.AXIS_HORIZONTAL_PADDING])

    let axis = d3.axisLeft(scale) 
        .tickSize(0)
        .tickFormat(d3.format(",.1f"))
        .tickPadding(this.SHIFT_LEGEND_LABELS_LEFT)
        .tickValues([this.sequence.top_value, this.sequence.top_value/2,0,this.sequence.bottom_value, this.sequence.bottom_value/2])

    d3.select('#color-legend-axis')
        .call(axis)
        .attr("transform", `translate(${this.LEGEND_TOTAL_WIDTH - this.LEGEND_SQUARE_WIDTH},0)`)
        .style("font-family", "monospace")
        .style("text-anchor", "end")

    //Remove line from Axis
    this.axis_g.select(".domain").remove()


    this.legend.append("text")
        .attr("x", this.LEGEND_TOTAL_WIDTH - this.LEGEND_SQUARE_WIDTH - this.SHIFT_LEGEND_LABELS_LEFT)
        .attr("y", this.SHIFT_COLOR_LEGEND_DOWN - this.SOLID_RECT_GAP - this.SOLID_RECT_HEIGHT/2)
        .text(d3.format(".1f")(this.sequence.max_value))
        .attr("text-anchor", "end")
        .style("font-family", "monospace")
        .style("font-size",  this.LEGEND_FONT_SIZE)

    this.legend.append("text")
        .attr("x", this.LEGEND_TOTAL_WIDTH - this.LEGEND_SQUARE_WIDTH - this.SHIFT_LEGEND_LABELS_LEFT)
        .attr("y", this.SHIFT_COLOR_LEGEND_DOWN + this.LEGEND_HEIGHT + this.SOLID_RECT_GAP  + this.SOLID_RECT_HEIGHT/2)
        .text(d3.format(".1f")(this.sequence.min_value))
        .attr("text-anchor", "end")
        .style("font-family", "monospace")
        .style("font-size",  this.LEGEND_FONT_SIZE)

    //Add all legend descriptors
    //They will all be invisible until a mouseover evend on a rect
    //Max Val
    this.legend
        .append("text")
        .attr("x", this.LEGEND_TOTAL_WIDTH - this.LEGEND_SQUARE_WIDTH - this.SHIFT_LEGEND_LABELS_LEFT -this.SHIFT_LEGEND_DESCRIPTORS_LEFT)
        .attr("y", this.SHIFT_COLOR_LEGEND_DOWN - this.SOLID_RECT_GAP - this.SOLID_RECT_HEIGHT/2)
        .attr("class", "legend_descriptors")
        .text("Max value ->")
        .style("text-anchor", "end")
        .style("font-family", "monospace")
        .style("font-size",  this.LEGEND_FONT_SIZE)
        .style("pointer-events", "none")
        .style("opacity", 0)
    
    //Min val
    this.legend.append("text")
        .attr("x", this.LEGEND_TOTAL_WIDTH - this.LEGEND_SQUARE_WIDTH - this.SHIFT_LEGEND_LABELS_LEFT - this.SHIFT_LEGEND_DESCRIPTORS_LEFT )
        .attr("y", this.SHIFT_COLOR_LEGEND_DOWN + this.LEGEND_HEIGHT + this.SOLID_RECT_GAP  + this.SOLID_RECT_HEIGHT/2)
        .attr("class", "legend_descriptors")
        .text("Min value ->")
        .style("text-anchor", "end")
        .style("font-family", "monospace")
        .style("font-size",  this.LEGEND_FONT_SIZE)
        .style("pointer-events", "none")
        .style("opacity", 0)
    
    //Upper %ile
    this.legend
        .append("text")
        .attr("x", this.LEGEND_TOTAL_WIDTH - this.LEGEND_SQUARE_WIDTH - this.SHIFT_LEGEND_LABELS_LEFT -this.SHIFT_LEGEND_DESCRIPTORS_LEFT)
        .attr("y", this.SHIFT_COLOR_LEGEND_DOWN + this.AXIS_HORIZONTAL_PADDING)
        .attr("class", "legend_descriptors")
        .text( `${d3.format(".0f")(this.sequence.upper_percentile * 100)}%-ile ->`)
        .style("text-anchor", "end")
        .style("font-family", "monospace")
        .style("font-size",  this.LEGEND_FONT_SIZE)
        .style("pointer-events", "none")
        .style("opacity", 0)

    //Lower %ile
    this.legend
        .append("text")
        .attr("x", this.LEGEND_TOTAL_WIDTH - this.LEGEND_SQUARE_WIDTH - this.SHIFT_LEGEND_LABELS_LEFT - this.SHIFT_LEGEND_DESCRIPTORS_LEFT)
        .attr("y", this.SHIFT_COLOR_LEGEND_DOWN + this.LEGEND_HEIGHT)
        .attr("class", "legend_descriptors")
        .text( `${d3.format(".0f")(this.sequence.lower_percentile * 100)}%-ile ->`)
        .style("text-anchor", "end")
        .style("font-family", "monospace")
        .style("font-size", 10)
        .style("pointer-events", "none")
        .style("opacity", 0)
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        drawFrequencyLegend()
                                        
    Draws a legend showing all the frequencies when the show frequencies button is pressed
    *////////////////////////////////////////////////////////////////////////////////////////////////
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
            .attr("cx", this.SHIFT_FREQUENCY_CIRCLES_RIGHT)
            .attr("cy", this.LEGEND_HEIGHT + this.SHIFT_COLOR_LEGEND_DOWN + this.SOLID_RECT_GAP + this.SOLID_RECT_HEIGHT + (this.sequence.max_radius * 2 * n))
            .transition()
            .duration(function(){
                if (that.first_time_drawing){
                    return(that.FREQUENCY_TRANSITION_TIME)
                }
                else{
                    return(0)
                }
            })            
            .attr("r", this.sequence.r_scale(+freq))
            .style("fill", "darkgrey")

        this.legend.append("text")
            .attr("class", "freq-legend")
            .attr("x", this.SHIFT_FREQUENCY_CIRCLES_RIGHT - this.sequence.max_radius - this.FREQUENCY_CIRCLE_TEXT_BUFFER)
            .attr("y", this.LEGEND_HEIGHT + this.SHIFT_COLOR_LEGEND_DOWN +  this.SOLID_RECT_GAP + this.SOLID_RECT_HEIGHT + (this.sequence.max_radius * 2 * n) + this.sequence.max_radius/2)
            .transition()
            .duration(function(){
                if (that.first_time_drawing){
                    return(that.FREQUENCY_TRANSITION_TIME)
                }
                else{
                    return(0)
                }
            })
            .text(freq)
            .style("font-family", "monospace")
            .attr("text-anchor", "end")
            .style("font-size",`${this.sequence.max_radius * 1.4}px`)
        });
        this.first_time_drawing = false
    }

    
    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        clearFrequencyLegend()
                                        
    *////////////////////////////////////////////////////////////////////////////////////////////////
    clearFrequencyLegend(){
        this.legend.selectAll(".freq-legend")
        .remove()
       this.first_time_drawing = true
       this.frequency_drawn = false

    }
}