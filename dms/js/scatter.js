class Scatter{
    constructor(sequence, descriptor_data){
        /////////////////////////////////////////////////////////////////////////////////////////////////
        //                                  CONSTANTS
        /////////////////////////////////////////////////////////////////////////////////////////////////
        this.MARGINS = { top: 15, left: 110, right: 10, bottom: 60 }
        this.SCATTER_BUFFER = .1
        this.DEFAULT_OPACITY = .2
        this.DEFAULT_RADIUS = 2
        this.TRANSITION_TIME = 1000
        this.TRANSITION_TIME_LEGEND = 500
        this.SD_LINE_WIDTH = 1
        this.MEDIAN_LINE_WIDTH = .75
        this.DEFAULT_DOT_COLOR = "green"
        this.NOT_SELECTED_DOT_COLOR = "lightgrey"
        this.HIGHLIGHT_POINT_TRANSITIOIN_TIME = 200 
        this.HIGHLIGHT_POINT_COLOR = "black"
        this.HIGHLIGHT_POINT_RADIUS = 4
        this.NON_BRUSHED_COLOR = "gray"
        this.SHIFT_FREQUENCY_LEGEND_CIRCLES_RIGHT = 40 
        this.SHIFT_FREQUENCY_LEGEND_TEXT_RIGHT = 5
        this.SNAKE_MOUSEOVER_RADIUS = 6
        this.SHIFT_X_AXIS_LABEL_DOWN = 5


        /////////////////////////////////////////////////////////////////////////////////////////////////
        //                                  GENERAL SET UP 
        /////////////////////////////////////////////////////////////////////////////////////////////////
        const that = this
        this.brush = d3.brush()
        this.sequence = sequence
        this.descriptor_data = descriptor_data
        this.second_condition = "Select Second Condition"
        this.scatter_div = d3.select("#scatter-div")
        this.second_condition = "Select Second Condition"
        this.show_frequencies = false
        this.show_scatter = false
        this.first_time_drawing_scatter = true
        this.first_time_drawing_legend = true
        this.active_brush = false
        this.brushed_points = []
        this.brushed_positions = []
        this.brushed_ids = []

        var timeOutFunctionId; 
        window.addEventListener("resize", function(){
            // fired after we are done resizing 
            clearTimeout(timeOutFunctionId); 
            
            // setTimeout returns the numeric ID which is used by 
            // clearTimeOut to reset the timer 
            timeOutFunctionId = setTimeout(that.resize(), 500);
        });
    }


    /////////////////////////////////////////////////////////////////////////////////////////////// 
    //                                  SETTER FUNCTIONS
    ///////////////////////////////////////////////////////////////////////////////////////////////
    setSnake(snake){
        this.snake = snake
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        clear()

    Removes scatter svg
    *////////////////////////////////////////////////////////////////////////////////////////////////
    clear(){  
        if (this.show_scatter){
            d3.select("#scatter_svg")
            .remove()
        }
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        resize()
                                        
    Clears everything and re-draws
    *////////////////////////////////////////////////////////////////////////////////////////////////
    resize(){
        this.clear()
        this.drawScatter(this.second_condition)
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        setSecondConditionOptions(condition1)
                                        
    Appends all available options to condition_2_select
    This is called in head.js when condition_select (first condition) is changed
    *////////////////////////////////////////////////////////////////////////////////////////////////
    setSecondConditionOptions(condition1){
        let condition2_select = document.getElementById("condition_2_select");
        
        //Remove current options
        while (condition2_select.firstChild) {
            condition2_select.removeChild(condition2_select.firstChild);
        }

        //Create new default option
        var option = document.createElement("option");
        option.text = "Select Second Condition"
        option.value = "Select Second Condition"
        condition2_select.appendChild(option)

        //Appends all possible options (That are not option1)
        if (condition1 != "Select A Condition"){
            let conditions = [...new Set(this.sequence.protein_data.map((item) => item.condition))]
            this.condition1 = this.sequence.selected_condition
        
            for (const condition of conditions){
                if (condition !==condition1){
                    var option = document.createElement("option");
                    option.text = condition
                    option.value = condition
                    condition2_select.appendChild(option);
                }
            }
        }
        else{
            this.second_condition = "Select Second Condition"
        }
    }

    
    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        changeCircles(showFrequency)
                                        
    Takes a boolean that states if the frequency should be encoded in the radius or not
    This function is called in head.js when scatter_frequency_button is pressed
    *////////////////////////////////////////////////////////////////////////////////////////////////
    changeCircles(showFrequency){
        const that = this
        this.show_frequencies = showFrequency
        this.points
        .selectAll(".scatter-circle")
        .attr("r", function(d) { 
            if (that.show_frequencies){
                return (that.sequence.r_scale(d.freq) )
            }
            else{
                return(that.DEFAULT_RADIUS)
            }
        })

        //Set selection to null
        this.points.call(this.brush.move, null);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        snakeMouseover(pos)
                                        
    Called on mouseover of snakeplot (in snake.js)
    Pos, is the positions being heighlighted by the snakeplot
    This will highlight all of the points on the snakeplot that match the highlighted position
    *////////////////////////////////////////////////////////////////////////////////////////////////
    snakeMouseover(pos){
        const that = this
        if (this.show_scatter){
            this.points.selectAll(".scatter-circle")  
            
            .style("opacity", function(d){
                if (+d.pos === +pos){
                    return(that.sequence.AA_RECT_OPACITY)
                }
                else{
                    return(0)
                }     
            })
            .attr("r", function(d){
                if(+d.pos === +pos){
                    if (that.show_frequencies){
                        return (that.sequence.r_scale(d.freq))
                    } else{
                        return(that.SNAKE_MOUSEOVER_RADIUS)
                    }
                } else{
                    return(0)
                }
            })  
            .style("fill", function(d){
                if (d.mut === d.wt){
                    return("white")
                } else{
                    return(that.sequence.grouping_map.get(d.mut))
                }
            })
            .style("stroke", function(d){
                if (d.mut === d.wt){
                    return(that.sequence.grouping_map.get(d.mut))
                }
            })
            .style("stroke-width", 4)
            .style('fill-opacity', function(d){
                if (d.mut === d.wt){
                    return(0)
                }
            })  
        }
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        snakeMouseleave()
                                        
    Resets to the defaults that were changed by snakeMouseover()
    *////////////////////////////////////////////////////////////////////////////////////////////////
    snakeMouseleave(){
        const that = this        
        if (this.show_scatter){
            this.points.selectAll(".scatter-circle")  
            .attr("r", function(d){
                if (that.show_frequencies){
                    return (that.sequence.r_scale(d.freq))
                } else{
                    return(that.DEFAULT_RADIUS)
                }
            })  
            .style("opacity", function(d){
                if (that.active_brush){
                    if (that.brushed_ids.includes(`${d.pos}${d.mut}`)){
                        return(1)
                    }
                    else{
                        return(that.DEFAULT_OPACITY)
                    }
                }
                else{
                    return(that.DEFAULT_OPACITY)
                }
            })
            .style("fill", function(d){
                if (that.active_brush){
                    if (that.brushed_ids.includes(`${d.pos}${d.mut}`)){
                        return(that.DEFAULT_DOT_COLOR)
                    }
                    else{
                        return(that.NOT_SELECTED_DOT_COLOR)
                    }
                } else{
                    return(that.DEFAULT_DOT_COLOR)
                }
            })
            .style("stroke", "none")
        }
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        heatMousover(point)
                                        
    When the heat map is mousedover a circle is drawn on the scatter plot to show the value of that
    point in both conditions.
    Point is the actual data point that was moused-over, and contains the pos and mut values
    *////////////////////////////////////////////////////////////////////////////////////////////////
    heatMousover(point){
        if(this.show_scatter){
            let clicked_point = this.joined_data.filter(function(d){return (d.pos == point.pos && d.mut == point.mut)})
             if (clicked_point.length !== 0){
                this.points
                .select("#highlight-point")
                .transition()
                .duration(this.HIGHLIGHT_POINT_TRANSITIOIN_TIME)
                .attr("id", "highlight-point")
                .attr("cy", this.y_scale(clicked_point[0][this.sequence.selected_condition]))
                .attr("cx",  this.x_scale(clicked_point[0][this.second_condition]))
                .attr("r", this.HIGHLIGHT_POINT_RADIUS)
                .style("fill", this.HIGHLIGHT_POINT_COLOR)
            }
            else{
                this.points
                .select("#highlight-point")
                .transition()
                .duration(this.HIGHLIGHT_POINT_TRANSITIOIN_TIME)
                .attr("r", 0)
            }
        }
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        heatMouseleave()
                                        
    Sets the highlight point to a radius of 0
    *////////////////////////////////////////////////////////////////////////////////////////////////
    heatMouseleave(){
        if (this.show_scatter){
            this.points
                .select("#highlight-point")
                .transition()
                .duration(this.HIGHLIGHT_POINT_TRANSITIOIN_TIME)
                .attr("r", 0)
        }
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        joinConditionArrays(arr1, arr2)
                                        
    Joins two arrays on pos and mut
    *////////////////////////////////////////////////////////////////////////////////////////////////
    joinConditionArrays(arr1, arr2) {
        const joined = [];
        
        // Create a map to store values based on position
        const map = new Map();

        var condition1 =  [...new Set(arr1.map((item) => item.condition))][0]
        var condition2 =  [...new Set(arr2.map((item) => item.condition))][0]
        
        // Populate map with values from arr1
        for (const item of arr1) {
            let mut = item.mut
            let pos = item.pos
            let val = item.value
            let freq = item.freq
            let wt = item.wt
            let syn_sd = item.syn_sd
            let syn_mean = item.syn_mean

            const key = pos +  mut;
            map.set(key, { [`${condition1}`]:val, wt:wt, pos:pos, mut:mut, freq:freq, [`${condition1}_syn_sd`]:syn_sd, [`${condition1}_syn_mean`]:syn_mean});
        }

        // Update map with values from arr2 or add new items
        for (const item of arr2) {
            let mut = item.mut
            let pos = item.pos
            let val = item.value
            let syn_sd = item.syn_sd
            let syn_mean = item.syn_mean

            const key = pos + mut;

            if (map.has(key)) {
                map.get(key)[`${condition2}`] = val;
                map.get(key)[`${condition2}_syn_sd`] = syn_sd;
                map.get(key)[`${condition2}_syn_mean`] = syn_mean;
            } 
            else{ //If pos and mut not in both arrays we don't want it
                map.delete(key)
            }
        }
        
        //Create joined array
        for (const [, value] of map) {
            if(!isNaN(value[condition1]) && !isNaN(value[condition2])){
                joined.push(value);
            }
        }
        
        return joined;
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        drawScatter(second_condition)
                                        
    This function will be called in head.js if a condition is passed in, we draw the scatter
    If a condition is not passed in, the function is called with the default "Select Second Condition" 
    and the scatter is cleared.
    This function creates SVG, axis, and draws points.
    *////////////////////////////////////////////////////////////////////////////////////////////////
    drawScatter(second_condition = "Select Second Condition"){
        const that = this
        this.second_condition = second_condition
        this.show_scatter  = true
        this.clear()

        let offset  = document.getElementById('condition_2_select').getBoundingClientRect().height 
        let div_height  = document.getElementById('scatter-div').getBoundingClientRect().height 
        this.svg_height = div_height - offset

        this.scatter_svg = this.scatter_div.append("svg")
        .attr('id', 'scatter_svg')
        .attr('width', "100%")
        .attr('height', this.svg_height)
        .style("display", "flex")
        .style("float", "left")


        if (second_condition != "Select Second Condition"){
            let total_height = document.getElementById('scatter-div').getBoundingClientRect().height
            let total_width = document.getElementById('scatter-div').getBoundingClientRect().width
            
            let condition1_data = this.sequence.filtered_data
            condition1_data = condition1_data.filter(function(d){return !isNaN(d.value)})
            let condition1_min = this.sequence.min_value
            let condition1_max = this.sequence.max_value

            let condition2_data = this.sequence.protein_data.filter(function(d){return d.condition == second_condition})
            condition2_data = condition2_data.filter(function(d){return !isNaN(d.value)})
            let condition2_max = d3.max(condition2_data.map(d => +d.value))
            let condition2_min = d3.min(condition2_data.map(d => +d.value))

            //Make scales and axis
            this.x_scale = d3.scaleLinear()
                .domain([condition2_min - this.SCATTER_BUFFER, condition2_max + this.SCATTER_BUFFER])
                .range([this.MARGINS.left, total_width - this.MARGINS.right]);
            var x_axis = d3.axisBottom()
                .scale(this.x_scale);
            this.scatter_svg.append("g")
                .call(x_axis)
                .attr("transform", `translate(0,${total_height-this.MARGINS.bottom})`)
                .style("font-family", "monospace")

            this.y_scale = d3.scaleLinear()
                .domain([ condition1_max+this.SCATTER_BUFFER, condition1_min-this.SCATTER_BUFFER])
                .range([this.MARGINS.top, total_height - this.MARGINS.bottom]);
            var y_axis = d3.axisLeft()
                .scale(this.y_scale);
            this.scatter_svg.append("g")
                .call(y_axis)
                .attr("transform", `translate(${this.MARGINS.left},0)`)
                .style("font-family", "monospace") 
                
            //Join data and get mean/sd for each condition
            this.joined_data = this.joinConditionArrays(condition1_data, condition2_data);
            let second_condition_mean = +this.joined_data[0][`${second_condition}_syn_mean`]
            let second_condition_sd = +this.joined_data[0][`${second_condition}_syn_sd`]
            let first_condition_mean = +this.joined_data[0][`${this.sequence.selected_condition}_syn_mean`]
            let first_condition_sd = +this.joined_data[0][`${this.sequence.selected_condition}_syn_sd`]

            // Add points
            this.points = this.scatter_svg.append("g")
            this.points.call(this.brush.on("end", ({selection}) => {
                that.brushed_points = [];
                if (selection) { //If the brush is active, get all the points from brush
                    that.active_brush = true
                    const [[x0, y0], [x1, y1]] = selection;
                    that.brushed_points = that.points.selectAll(".scatter-circle")
                    .style("fill", this.NON_BRUSHED_COLOR)
                    .style("opacity", this.DEFAULT_OPACITY)
                    .filter(d => x0 <= this.x_scale(d[second_condition]) && this.x_scale(d[second_condition]) < x1
                            && y0 <= this.y_scale(d[that.sequence.selected_condition]) && this.y_scale(d[that.sequence.selected_condition]) < y1)
                    .filter(function(d){
                        if(that.show_frequencies){
                            return(!isNaN(d.freq))
                        }
                        else{
                            return(d)
                        }
                    })
                    .style("fill", that.DEFAULT_DOT_COLOR)
                    .style("opacity", 1)
                    .data();

                } else { // If the brush isn't active reset all the points
                    that.active_brush = false
                    that.points.selectAll(".scatter-circle").style("fill", that.DEFAULT_DOT_COLOR).style("opacity", this.DEFAULT_OPACITY)
                }

                that.brushed_positions = [...new Set(that.brushed_points.map((item) => item.pos))]; 
                that.brushed_ids =  that.brushed_points.map((item) => {return(`${item.pos}${item.mut}`);}) 
                that.sequence.filterHeatMap(that.brushed_points, selection)
                that.snake.highlightSnake(that.brushed_positions)
                }));

             //Draw horizontal lines
             this.points.append("line")
                .attr("class", "median_line")
                .attr("x1", this.MARGINS.left)
                .attr("x2", total_width - this.MARGINS.right)
                .attr("y1", this.y_scale(first_condition_mean))
                .attr("y2", this.y_scale(first_condition_mean))
             this.points.append("line")
                .attr("class", "sd_line")
                .attr("x1", this.MARGINS.left)
                .attr("x2", total_width - this.MARGINS.right)
                .attr("y1", this.y_scale(first_condition_mean + first_condition_sd*2))
                .attr("y2", this.y_scale(first_condition_mean  +first_condition_sd*2))
             this.points.append("line")
                .attr("class", "sd_line")
                .attr("x1", this.MARGINS.left)
                .attr("x2", total_width - this.MARGINS.right)
                .attr("y1", this.y_scale(first_condition_mean - first_condition_sd *2))
                .attr("y2", this.y_scale(first_condition_mean  - first_condition_sd *2))
                        
             //Draw verticle lines
             this.points.append("line")
                .attr("class", "median_line")
                .attr("y1", this.MARGINS.top)
                .attr("y2", total_height - this.MARGINS.bottom)
                .attr("x1", this.x_scale(second_condition_mean))
                .attr("x2", this.x_scale(second_condition_mean))
             this.points.append("line")
                .attr("class", "sd_line")
                .attr("y1", this.MARGINS.top)
                .attr("y2", total_height - this.MARGINS.bottom)
                .attr("x1", this.x_scale(second_condition_mean+ second_condition_sd*2))
                .attr("x2", this.x_scale(second_condition_mean+second_condition_sd*2))
             this.points.append("line")
                .attr("class", "sd_line")
                .attr("y1", this.MARGINS.top)
                .attr("y2", total_height - this.MARGINS.bottom)
                .attr("x1", this.x_scale(second_condition_mean-second_condition_sd*2))
                .attr("x2", this.x_scale(second_condition_mean-second_condition_sd*2))
            


             d3.selectAll(".median_line")
                .style("cursor", "help")
                .style("stroke", "lightgrey")
                .style("stroke-width", this.MEDIAN_LINE_WIDTH)
                .on("mouseover", function(){
                    defaultMouseover()
                    d3.selectAll(".median_line")
                    .style("stroke-width", (that.MEDIAN_LINE_WIDTH* 3))
                })
                .on("mousemove", function(event){
                    defaultMousemove("Median of synonymous mutation scores", event, 40,-30)
                })
                .on("mouseleave", function(){
                    defaultMouseleave()
                    d3.selectAll(".median_line")
                    .style("stroke-width",  that.MEDIAN_LINE_WIDTH)
                })

             d3.selectAll(".sd_line")
             .style("cursor", "help")
             .style("stroke", "grey")
             .style("stroke-width", this.SD_LINE_WIDTH)
             .on("mouseover", function(event,d){
                 defaultMouseover()
                 d3.selectAll(".sd_line")
                 .style("stroke-width", (that.SD_LINE_WIDTH* 3))
             })
             .on("mousemove", function(event,d){
                defaultMousemove("+/- 2 standard deviations of synonymous mutation scores", event, 40,-30)
             })
             .on("mouseleave", function(event,d){
                defaultMouseleave()
                d3.selectAll(".sd_line")
                .style("stroke-width",  that.SD_LINE_WIDTH)
            })
 
 

            //Draw all the points
            this.points.selectAll()
                .data(this.joined_data)
                .enter()
                .append("circle")
                .attr("class", "scatter-circle")
                .attr("cy", function(d) { return(that.y_scale(d[that.sequence.selected_condition]))})
                .attr("cx", function(d) { return (that.x_scale(d[second_condition])) })
                .style("fill", this.DEFAULT_DOT_COLOR)
                .style("opacity", this.DEFAULT_OPACITY)
                .style("pointer-events", "none") // We set the pointer events to none so the tool tip doesn't show be default
                //Pointer-events will be set to all after a point is clicked on the snake thus showing the tooltip
                .on("mouseover", function(event,d){
                    defaultMouseover()
                    d3.select(this)
                    .style("opacity", 1)
                })
                .on("mousemove", function(event,d){
                    let text = "WT: " + d.wt + "<br>Mutation: " + d.mut + `<br>${that.sequence.selected_condition}: ` + (+d[that.sequence.selected_condition]).toPrecision(2) + `<br> ${second_condition}: `+ (+d[second_condition]).toPrecision(2) +"<br> Position: " + d.pos+ "<br> Gnomad Frequeny: " + (+(+d.freq).toPrecision(2)).toExponential()
                    defaultMousemove(text,event,40,-30)
                })
                .on("mouseleave", function(event,d){
                    defaultMouseleave()
                    d3.select(this)
                    .style("opacity",  that.sequence.AA_RECT_OPACITY)
                })
                .transition()
                .duration(function(){
                    if(that.first_time_drawing_scatter){
                        return(that.TRANSITION_TIME)
                    }else{
                        return(0)
                }})
                .attr("r", function(d) { 
                    if (that.show_frequencies){
                        return (that.sequence.r_scale(d.freq))
                    }
                    else{
                        return(that.DEFAULT_RADIUS)
                    }
                })
                
            //Append the highlight point
            //Used to show a specific point on scatter when highlighting over the heat map.
            this.points
                .append("circle")
                .attr("id", "highlight-point")
                

            //Add X label
            this.scatter_svg.append("text")
                .attr("x", (total_width - this.MARGINS.right - this.MARGINS.left )/2 +   this.MARGINS.left)
                .attr("y", this.svg_height - this.SHIFT_X_AXIS_LABEL_DOWN)
                .text(`${second_condition} Effect Size`)
                .style("font-family", "monospace")
                .style("cursor", "help")
                .style("text-anchor", "middle")
                .on("mouseover", function(){
                    defaultMouseover("200px")
                })
                .on("mousemove", function(event){
                    // let selected_protein_conditions = that.descriptor_data[that.sequence.selected_protein].conditions
                    let selected_protein_conditions = that.descriptor_data[that.sequence.selected_protein].conditions
                    let selected_condition = selected_protein_conditions[that.second_condition]
                    let text = formatConditionText(selected_condition)
                    defaultMousemove(text, event,-100,30)
                })
                .on("mouseleave", function(){
                    defaultMouseleave()
                })

            //Add Y label
            this.scatter_svg.append("text")
                .attr("text-anchor", "middle")
                .text(`${this.sequence.selected_condition} Effect Size`)
                .style("font-family", "monospace")
                .attr("transform", `translate(${this.MARGINS.left -40},${(total_height - this.MARGINS.top - this.MARGINS.bottom)/2})rotate(-90)`)
                .style("cursor", "help")
                .style("text-anchor", "middle")
                .on("mouseover", function(){
                    defaultMouseover("200px")
                })
                .on("mousemove", function(event){
                    // let selected_protein_conditions = that.descriptor_data[that.sequence.selected_protein].conditions
                    let selected_protein_conditions = that.descriptor_data[that.sequence.selected_protein].conditions
                    let selected_condition = selected_protein_conditions[that.sequence.selected_condition]
                    let text = formatConditionText(selected_condition)
                    defaultMousemove(text, event,0,30)
                })
                .on("mouseleave", function(){
                    defaultMouseleave()
                })

            this.first_time_drawing_scatter = false
            if (this.show_frequencies){
                this.drawFrequencyLegend()
            }
        }

        else{
            this.show_scatter=false
            this.clear()
        }

    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        drawFrequencyLegend()
                                        
    Draws a legend showing all the frequencies when the show frequencies button is pressed
    *////////////////////////////////////////////////////////////////////////////////////////////////
    drawFrequencyLegend(){
        //Get all the scientific notations for the the frequencies
        //Gets all the lowest rounded frequencies
        const that = this
        this.show_frequencies = true
        let positions = [...new Set(this.sequence.all_data.map((item) =>(+(+item.freq).toPrecision(1)).toExponential() ))];   
        positions = positions.filter(function(d){return d != "NaN"})
        positions = [...new Set(positions.map((item) => "1"+item.substr(1)))]
        positions = positions.map((item) => (+item).toExponential())
        positions.sort()

        console.log("Positionst", positions)

        var n = 1
        //Draw circles
        positions.forEach((freq) => {
            n+=1
            this.scatter_svg.append("circle")
            .attr("class", "freq-legend")
            .attr("cx", this.SHIFT_FREQUENCY_LEGEND_CIRCLES_RIGHT + this.sequence.max_radius)
            .attr("cy", this.MARGINS.top + (this.sequence.max_radius * 2 * n))
            .transition()
            .duration(function(){
                if (that.first_time_drawing_legend){
                    return(that.TRANSITION_TIME_LEGEND)
                }
                else{
                    return(0)
                }
            })            
            .attr("r", this.sequence.r_scale(+freq))
            .style("fill", "darkgrey")

            //Draw text
            this.scatter_svg.append("text")
            .attr("class", "freq-legend")
            .attr("x", this.SHIFT_FREQUENCY_LEGEND_TEXT_RIGHT)
            .attr("y", this.MARGINS.top + (this.sequence.max_radius * 2 * n) + this.sequence.max_radius/2)
            .transition()
            .duration(function(){
                if (that.first_time_drawing_legend){
                    return(that.TRANSITION_TIME_LEGEND)
                }
                else{
                    return(0)
                }
            })
            .text(freq)
            .style("font-family", "monospace")
            .attr("text-anchor", "left")
            .style("font-size",`${this.sequence.max_radius * 1.4}px`)
        });
        this.first_time_drawing = false
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        clearFrequencyLegend()
                                        
    *////////////////////////////////////////////////////////////////////////////////////////////////
    clearFrequencyLegend(){
        this.scatter_svg.selectAll(".freq-legend")
       .remove()
       this.first_time_drawing = true
    }

   
}