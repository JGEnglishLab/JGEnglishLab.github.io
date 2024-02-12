class Scatter{
    constructor(sequence){
        // this.all_data = all_data
        this.sequence = sequence
        this.second_condition = "Select Second Condition"
        this.scatter_div = d3.select("#scatter-div")
        this.SCATTER_BUFFER = .1
        this.DEFAULT_OPACITY = .2
        this.DEFAULT_RADIUS = 2
        this.SCATTER_COLOR = "green"
        this.TRANSITION_TIME = 1000
        this.TRANSITION_TIME_LEGEND = 500



        this.MARGINS = { top: 15, left: 110, right: 10, bottom: 40 }
        this.scatter_svg = this.scatter_div.append("svg")
                .attr('id', 'scatter_svg')
                .attr('width', "100%")
                .attr('height', "100%")
                .style("display", "flex")
                .style("float", "left")
        this.second_condition = "Select Second Condition"
        this.show_frequencies = false
        this.first_time_drawing_scatter = true
        this.first_time_drawing_legend = true



        const that = this


        var timeOutFunctionId; 
        window.addEventListener("resize", function(){
            // fired after we are done resizing 
            clearTimeout(timeOutFunctionId); 
            
            // setTimeout returns the numeric ID which is used by 
            // clearTimeOut to reset the timer 
            timeOutFunctionId = setTimeout(that.resize(), 500);
        });
    }

    changeCircles(showFrequency){



        const that = this
        this.show_frequencies = showFrequency
        this.points
        .selectAll("circle")
        .transition()
        .duration(300)
        .attr("r", function(d) { 
            if (that.show_frequencies){
                return (that.sequence.r_scale(d.freq) )
            }
            else{
                return(that.DEFAULT_RADIUS)
            }
        })


        this.points.call(this.brush.move, null);



    }

    

    setSecondConditionOptions(condition1){
        let condition2_select = document.getElementById("condition_2_select");
        
        while (condition2_select.firstChild) {
            condition2_select.removeChild(condition2_select.firstChild);
        }

        var option = document.createElement("option");
        option.text = "Select Second Condition"
        option.value = "Select Second Condition"
        condition2_select.appendChild(option)

        if (condition1 != "Select A Condition"){
            let conditions = [...new Set(this.sequence.protein_data.map((item) => item.condition))]
            this.condition1 = this.sequence.selected_condition
    
            console.log("this.condition1", this.condition1)
    
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
   
    
    


    resize(){
        this.clear()
        this.drawScatter(this.second_condition)
    }

    clear(){  
        this.scatter_svg.selectAll("*").remove();
    }

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
            const key = pos + '_' + mut;
            map.set(key, { [`${condition1}`]:val, wt:wt, pos:pos, mut:mut, freq:freq});

        }


        // Update map with values from arr2 or add new items
        for (const item of arr2) {
            let mut = item.mut
            let pos = item.pos
            let val = item.value
            let wt = item.wt

            const key = pos + '_' + mut;

            if (map.has(key)) {
                map.get(key)[`${condition2}`] = val;
            } 
            else{
                map.delete(key)
            }
        }
        
        for (const [, value] of map) {
            if(!isNaN(value[condition1]) && !isNaN(value[condition2])){
                joined.push(value);

            }
        }
        
        return joined;
    }

    drawScatter(second_condition = "Select Second Condition"){
        this.second_condition = second_condition
        this.clear()

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

            let x_scale = d3.scaleLinear()
                  .domain([condition2_min - this.SCATTER_BUFFER, condition2_max + this.SCATTER_BUFFER])
                  .range([this.MARGINS.left, total_width - this.MARGINS.right]);
            var x_axis = d3.axisBottom()
                        .scale(x_scale);
            this.scatter_svg.append("g")
                .call(x_axis)
                .attr("transform", `translate(0,${total_height-this.MARGINS.bottom})`)
                .style("font-family", "monospace")


            let y_scale = d3.scaleLinear()
            .domain([ condition1_max+this.SCATTER_BUFFER, condition1_min-this.SCATTER_BUFFER])

            .range([this.MARGINS.top, total_height - this.MARGINS.bottom]);
            var y_axis = d3.axisLeft()
                        .scale(y_scale);
            this.scatter_svg.append("g")
                .call(y_axis)
                .attr("transform", `translate(${this.MARGINS.left},0)`)
                .style("font-family", "monospace")




            
            
            
            const joined = this.joinConditionArrays(condition1_data, condition2_data);
            const that = this



            //Draw horizontal line
            this.scatter_svg.append("line")
            .attr("x1", this.MARGINS.left)
            .attr("x2", total_width - this.MARGINS.right)
            .attr("y1", y_scale(0))
            .attr("y2", y_scale(0))
            .style("stroke", "lightgrey")
            .style("stroke-width", 1)

            //Draw verticle line
            this.scatter_svg.append("line")
            .attr("y1", this.MARGINS.top)
            .attr("y2", total_height - this.MARGINS.bottom)
            .attr("x1", x_scale(0))
            .attr("x2", x_scale(0))
            .style("stroke", "lightgrey")
            .style("stroke-width", 1)


            // Add points
            this.points = this.scatter_svg.append("g")
            this.points.selectAll()
                .data(joined)
                .enter()
                .append("circle")
                .attr("cy", function(d) { return(y_scale(d[that.sequence.selected_condition]))})
                .attr("cx", function(d) { return (x_scale(d[second_condition])) })
                .style("fill", this.SCATTER_COLOR)
                .style("opacity", this.DEFAULT_OPACITY)
                .style("pointer-events", function(d){
                    if (d.freq){
                        return("all")
                    } else{
                        return("none")
                    }
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

                

            //Add X label
            this.scatter_svg.append("text")
                .attr("text-anchor", "middle")
                .attr("x", (total_width - this.MARGINS.right - this.MARGINS.left )/2 +   this.MARGINS.left)
                .attr("y", total_height-5)
                .text(`${second_condition} Effect Size`)
                .style("font-family", "monospace")
                .style("cursor", "help")


            //Add Y label
            this.scatter_svg.append("text")
                .attr("text-anchor", "middle")
                .text(`${this.sequence.selected_condition} Effect Size`)
                .style("font-family", "monospace")
                .attr("transform", `translate(${this.MARGINS.left -40},${(total_height - this.MARGINS.top - this.MARGINS.bottom)/2})rotate(-90)`)
                .style("cursor", "help")

            
            this.brush = d3.brush()


            this.points.call(this.brush.on("end", ({selection}) => {
                let value = [];
                console.log("selection", selection)
                if (selection) {
                    const [[x0, y0], [x1, y1]] = selection;
                    value = that.points.selectAll("circle")
                    .style("fill", "gray")
                    .style("opacity", this.DEFAULT_OPACITY)
                    .filter(d => x0 <= x_scale(d[second_condition]) && x_scale(d[second_condition]) < x1
                            && y0 <= y_scale(d[that.sequence.selected_condition]) && y_scale(d[that.sequence.selected_condition]) < y1)
                    .filter(function(d){
                        if(that.show_frequencies){
                            return(!isNaN(d.freq))
                        }
                        else{
                            return(d)
                        }
                    })
                        
                    .style("fill", that.SCATTER_COLOR)
                    .style("opacity", 1)
                    .data();

                } else {
                    that.points.selectAll("circle").style("fill", that.SCATTER_COLOR).style("opacity", this.DEFAULT_OPACITY)

                }

                that.sequence.filterHeatMap(value, selection)

                }));
                this.first_time_drawing_scatter = false

                if (this.show_frequencies){
                    this.drawFrequencyLegend()
                }

        }

        else{
            this.clear()
        }

    }

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

        var n = 1
        positions.forEach((freq) => {
            n+=1

            this.scatter_svg.append("circle")
            .attr("class", "freq-legend")
            .attr("cx", 40)
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

            this.scatter_svg.append("text")
            .attr("class", "freq-legend")
            .attr("x", 5)
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
            .text(positions[n-2])
            .style("font-family", "monospace")
            .attr("text-anchor", "left")
            .style("font-size",`${this.sequence.max_radius * 1.4}px`)
        });
        this.first_time_drawing = false
    }

    clearFrequencyLegend(){
        this.scatter_svg.selectAll(".freq-legend")
       .remove()
       this.first_time_drawing = true
    }

   
}