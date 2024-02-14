class Sequence{
    constructor(all_data){


        //**********************************************************************************************
        //                                      CONSTANTS 
        //**********************************************************************************************
        this.WIDTH = 1500 
        this.HEIGHT = 350
        this.MARGINS = { top: 50, left: 80, right: 20, bottom: 10 }
        this.SQUARE_SIZE = 15
        this.RADIUS = 15
        this.HEAT_PERCENT = 70
        this.TRANSITION_TIME = 1000
        this.RECT_OPACITY = .3
        

        //**********************************************************************************************
        //                                  GENERAL SET UP 
        //**********************************************************************************************
        const that = this

        this.all_data = all_data
        this.scroll_div = d3.select("#scroll-div") 
        this.heat_sticky_div = d3.select("#heat-sticky-div")
        this.bar_sticky_div = d3.select("#bar-sticky-div")
        this.tooltip = d3.select(".tooltip")


        this.positions = [...new Set(this.all_data.map((item) => item.pos))];   
        this.mutants = [...new Set(this.all_data.map((item) => item.mut))]; 

        this.selected_condition = null 
        this.selected_protein = null
        this.HEAT_DRAWN = false
        this.FIRST_TIME_DRAWING = true
        this.NEW_GROUPING = true
        this.FILTERING = false
        this.highlighted = []
        this.sorting = "properties"
        this.domain = returnOrder(this.sorting)
        this.grouping = returnGroupings(this.sorting)
        this.cell_type = "squares"




        var timeOutFunctionId; 
        window.addEventListener("resize", function(){
            // fired after we are done resizing 
            clearTimeout(timeOutFunctionId); 
            
            // setTimeout returns the numeric ID which is used by 
            // clearTimeOut to reset the timer 
            timeOutFunctionId = setTimeout(that.resize(), 500);
        });
    
    }

    clear(){
        if (this.HEAT_DRAWN){

            this.FILTERING=false
            d3.select("#bar_svg")
            .remove()
            d3.select("#heat_svg")
            .remove()
            d3.select("#sticky_heat_svg")
            .remove()
            d3.select("#sticky_bar_svg")
            .remove()
            
     }

    }

    resize(){
        this.clear()
        this.drawHeatMap()
    }

    change_cells(value){
        const that = this

        if(value == "squares"){
            this.cell_type = "squares"
            this.heat_svg.selectAll("rect")
            .transition()
            .duration(this.TRANSITION_TIME)
            .style("opacity", 1)

            this.heat_svg.selectAll("line")
            .transition()
            .duration(this.TRANSITION_TIME)
            .style("opacity", .1)

           
        }
        if(value == "circles"){

            this.cell_type = "circles"
            this.heat_svg.selectAll("rect")
            .transition()
            .duration(this.TRANSITION_TIME)
            .style("opacity", function(d){
                if (that.FILTERING){

                    if (that.highlighted.includes(d.pos+d.mut)){
                        return(0)
                    }
                    else{
                        return(1)

                    }

                }
                else{
                    return(0)
                }
            })

            this.heat_svg.selectAll("line")
            .transition()
            .duration(this.TRANSITION_TIME)
            .style("opacity", .5)

         
        }
    }

    draw_mutant_labels(){
        const that = this
        this.heat_sticky_svg.selectAll()
            .data(this.mutants)
            .enter()
            .append("text")
            .attr("class", "mutant-labels")
            .attr("x", function(d){return(that.x_scale(d))})
            .attr("font-size", function(d){
                return( `${(that.heat_width/that.mutants.length)*.7}px` )
            })
            .style("font-family", "monospace")
            .text(function(d){return(d)})
            .style("text-anchor", "middle")
            .transition()
            .duration(function(){
                if (that.NEW_GROUPING){
                    return(that.TRANSITION_TIME)
                }
                else {
                    return(0)
                }
            })
            .attr("y", 30) 
    }

    draw_group_boxes(){
        const that = this
        this.heat_sticky_svg.selectAll()
            .data(this.grouping)
            .enter()
            .append("rect")
            .attr("class", "group-rect")
            .on("mouseover", function(event, d){
                d3.select(".tooltip")
                  .style("opacity", 1)
                d3.select(this)
                  .style("stroke", "black")
                  .style("stroke-width", 2)
                  .style("stroke-opacity", 1)
              })
            .on("mousemove", function(event,d){
                d3.select(".tooltip")
                .html(d.type)
                .style("left", `${event.pageX - 50}px`)
                .style("top", `${event.pageY + 20}px`)
            })
            .on("mouseleave", function(d,event){
                d3.select(".tooltip")
                  .style("opacity", 0)
                d3.select(this)
                .style("stroke", "none")
            })
            .style("opacity", this.RECT_OPACITY)
            .attr("x", function(d){
                return(that.x_scale(d.start) - that.max_radius)})
            .attr("width", function(d){

                return(that.x_scale(d.stop) - that.x_scale(d.start) + that.max_radius * 2)
            })
            .transition()
            .duration(function(){
                if (that.NEW_GROUPING){
                    return(that.TRANSITION_TIME)
                }
                else {
                    return(0)
                }
            }
            )
            .attr("y", 0)
            .attr("height", 50)
            .style("fill", function(d){
                return(d.color)
            })
    }

    sortAA(sorting){
        const that = this
        this.NEW_GROUPING = true
        this.domain = returnOrder(sorting)
        this.x_scale.domain(this.domain)
        this.grouping = returnGroupings(sorting)

        this.heat_sticky_svg.selectAll("text")
        .transition()
        .duration(this.TRANSITION_TIME)
        .attr("x", function(d){
            return(that.x_scale(d))})

        this.heat_sticky_svg.selectAll("rect")
            .remove()
    
        this.draw_group_boxes()

        this.heat_sticky_svg.selectAll("text")
            .remove()
        this.draw_mutant_labels()

        this.heat_svg.selectAll("circle")
        .transition()
        .duration(this.TRANSITION_TIME)
        .attr("cx", function(d) {  return (that.x_scale(d.mut)) })

        this.heat_svg.selectAll("rect")
        .transition()
        .duration(this.TRANSITION_TIME)
        .attr("x", function(d) { return (that.x_scale(d.mut) - that.max_radius)  })

        this.NEW_GROUPING = false
    }

    // Returns the conditions corresponding to that protein
    setProtein(selected_protein){
        this.protein_data = this.all_data.filter(function(d){return d.protein == selected_protein})
        this.getRegions()

        return([...new Set(this.protein_data.map((item) => item.condition))])

    }

    getRegions(){
        let domains = [...new Set(this.protein_data.map((item) => item.protein_segment))];
        this.domain_data = []
        domains.forEach((domain) => {
            let cur_domain = this.protein_data.filter(function(d){return d.protein_segment == domain})
            let max_position = d3.max(cur_domain.map(d => +d.pos))
            let min_position = d3.min(cur_domain.map(d => +d.pos))
            let cur_domain_data = {"domain": domain, "start_pos": min_position, "stop_pos": max_position}
            this.domain_data.push(cur_domain_data)
        })
        console.log("this.domain_data", this.domain_data)
    }

    setLegend(legend){
        this.legend = legend
    }

    setScatter(scatter){
        this.scatter = scatter
    }

    setCondition(selected_condition){
        this.FIRST_TIME_DRAWING = true
        this.selected_condition = selected_condition
        this.filtered_data = this.protein_data.filter(function(d){return d.condition == selected_condition})

        this.positions = [...new Set(this.filtered_data.map((item) => item.pos))];   
        this.mutants = [...new Set(this.filtered_data.map((item) => item.mut))]; 

        this.n_positions =  d3.max(this.positions.map(d => Number(d))) 

        this.max_value =  d3.max(this.filtered_data.map(d => +d.value))
        this.min_value =  d3.min(this.filtered_data.map(d => +d.value))
        this.max_abs = d3.max([Math.abs(this.max_value), Math.abs(this.min_value)])

        this.min_freq = d3.min(this.filtered_data.map(d => +d.freq))
        this.max_freq = d3.max(this.filtered_data.map(d => +d.freq))


        this.color_scale = d3.scaleDiverging()
        .interpolator(d3.interpolateRdBu)
        .domain([this.max_abs,0,this.max_abs*-1])

    }

    rev_range(start, end) {
        const ans = [ ];
        for (let i = start; i <= end; i++) {
            ans.push(i.toString());
            }
        return ans.reverse();
    }

    filterHeatMap(values, selection){

        let highlighted = [...new Set(values.map((item) => item.pos+item.mut))];  



        const that = this
        
        if(selection){ //Selection will be null on reset
            this.FILTERING = true
            this.highlighted = highlighted
            this.heat_svg
            .selectAll("rect")
            .transition()
            .duration(this.TRANSITION_TIME)
            .style("opacity", function(d){
                let pos_mut = d.pos + d.mut
                if (highlighted.includes(pos_mut)){
                    if(that.cell_type == "circles"){
                        return(0)
                    }
                    else{
                        return(1)
                    }
                }
                else{
                    return(1)
                }
            })

            .style("stroke-width", 1)
            .style("stroke-opacity", 1)
            .style("stroke", "black")
            .style("fill", function(d){
                let pos_mut = d.pos + d.mut
                if (highlighted.includes(pos_mut)){
                    return(that.color_scale(d.value))
                }
                else{
                    return("darkgrey")
                }
            })

      
        }
        else{
            //For now. 
            //Later just reset it to the current settings!
            this.FILTERING = false
            this.filter_values = []
            // this.clear()
            // this.drawHeatMap()

            this.heat_svg
            .selectAll("rect")
            .transition()
            .duration(this.TRANSITION_TIME)
            .style("opacity", function(){
                if (that.cell_type == "circles"){
                    return(0)
                } else{
                    return(1)
                }
            })
            .style("fill", function(d){
                if (!isNaN(+d.value)){
                    return (that.color_scale(d.value))
                }
                else{
                    return("darkgrey")
                }
            })
            .style("stroke", "none")

        }
    }



    


    drawHeatMap(){
        if (this.selected_condition && this.selected_condition!= "Select A Condition"){
            this.legend.clear()
            this.legend.drawLegend()
 

            if (this.legend.frequency_drawn){
                this.legend.addFrequencyLegend()
            }
            this.HEAT_DRAWN = true
            const that = this


            this.heat_width = document.getElementById('heat-sticky-div').getBoundingClientRect().width 
            this.bar_width = document.getElementById('bar-sticky-div').getBoundingClientRect().width 
            this.max_radius = Math.floor(this.heat_width/this.mutants.length)/2
            let cur_svg_height = this.max_radius*this.n_positions*2

            this.heat_sticky_svg = this.heat_sticky_div.append("svg")
                .attr('id', 'sticky_heat_svg')
                .attr("width", "100%")
                .attr("height", "100%")
                .style("background", "white")
                .style("opacity", .9)
                // .style("float", "left")



            this.bar_sticky_svg = this.bar_sticky_div.append("svg")
                .attr('id', 'sticky_bar_svg')
                .attr("width", "100%")
                .attr("height", "100%")
                .style("background", "white")
                // .style("float", "right")



            this.heat_svg = this.scroll_div.append("svg")
                .attr('id', 'heat_svg')
                .attr('width', `${this.HEAT_PERCENT}%`)
                .attr('height', cur_svg_height + this.MARGINS.top + this.MARGINS.bottom)
                .style("display", "flex")
                .style("float", "left")


            this.bar_svg = this.scroll_div.append("svg")
                .attr("id", "bar_svg")
                .attr('width', `${100 - this.HEAT_PERCENT}%`)
                .attr('height', cur_svg_height + this.MARGINS.top + this.MARGINS.bottom)
                .style("display", "flex")




            // // //Set up initial axis
            this.x_scale = d3.scaleBand()
            .range([this.max_radius, this.heat_width])
            .domain(this.domain)

            this.y_scale = d3.scaleBand()
            .range([cur_svg_height, 0])
            .domain(this.rev_range(0,this.n_positions))


            // let r_scale = d3.scaleLinear()
            // .range([this.max_radius/4, this.max_radius])
            // .domain([0,this.max_abs])

            this.r_scale = d3.scaleLog()
            .range([this.max_radius/3, this.max_radius])
            .domain([this.min_freq,this.max_freq])


             //Draw horizontal lines
             this.heat_svg.selectAll()
             .data(this.rev_range(0,this.n_positions+1))
             .enter()
             .append("line")
             .attr("y1", function(d) {return(that.y_scale(d)+that.max_radius)})
             .attr("y2", function(d) {return(that.y_scale(d)+that.max_radius)})
             .attr("x2", 0)
             .attr("x1", this.heat_width - this.max_radius)
             .style("stroke", function(d){
                 if (d == 0 || d%5 == 0 || d == that.n_positions){
                     return("black")
                 }
                 else{
                     return("lightgrey")
                 }
             })
             .style("stroke-width", function(d){
                 if (d == 0 || d%5 == 0 || d == that.n_positions){
                     return(1.2)
                 }
                 else{
                     return(1)
                 }
             })
             .style("opacity", function(){
                if (that.cell_type == "circles"){
                    return(.5)
                }
                else{
                    return(0)
                }
            })
 
             //draw verticle lines
             this.heat_svg.selectAll()
             .data(this.mutants)
             .enter()
             .append("line")
             .attr("x1", function(d) {return(that.x_scale(d)+that.max_radius)})
             .attr("x2", function(d) {return(that.x_scale(d)+that.max_radius)})
             .attr("y2", 0 + this.max_radius)
             .attr("y1", cur_svg_height - this.max_radius)
             .style("stroke", "lightgrey")
             .style("stroke-width", 1)
             .style("opacity", function(){
                if (that.cell_type === "circles"){
                    return(.5)
                }
                else{
                    return(0)
                }
            })
             
 

       
            // Draw circles
            this.heat_svg.selectAll()
            .data(this.filtered_data)
            .enter()
            .append("circle")
            .attr("cx", function(d) { return (that.x_scale(d.mut)) })
            .attr("cy", function(d) { return (that.y_scale(d.pos)) })
            .transition() 
            .duration(function(){
                if (that.FIRST_TIME_DRAWING){
                    return(that.TRANSITION_TIME)
                }
                else{
                    return(0)
                }})
            //.attr("r", function(d){return (r_scale(Math.abs(d.value)))})
            .attr("r", function(d){return (that.r_scale(d.freq))})
            .style("fill",function(d){
                if (!isNaN(+d.value)){
                    return (that.color_scale(d.value))
                }
                else{
                    return("darkgrey")
                }
                })
            .style("stroke", "darkgrey")
            .style("stroke-width", .4)
          

            //Draw rectangles
            this.heat_svg.selectAll()
            .data(this.filtered_data)
            .enter()
            .append("rect")
            .on("mouseover", function(event,d){
                that.scatter.heatMousover(d)
                d3.select(".tooltip")
                .style("opacity",1)
                if (!that.FILTERING){
                    d3.select(this)
                        .style("opacity", .5)
                        .style("stroke", "black")
                        .style("stroke-width", .5)
                        .style("stroke-opacity", 1)
                }
                
            })
            .on("mousemove", function(event,d){
                d3.select(".tooltip")
                  .html("Val: " + truncateDecimals(+d.value,3) + "<br>Position: " + d.pos + "<br>WT: " + d.wt + "<br> Mutation: "+ d.mut +"<br> BW Number: " + d.BW+ "<br> Gnomad Frequeny: " + (+(+d.freq).toPrecision(2)).toExponential())
                  .style("left", `${event.pageX - 180}px`)
                  .style("top", `${event.pageY - 30}px`)
            })
            .on("mouseleave", function(event,d){
                that.scatter.heatMouseleave()

                d3.select(".tooltip")
                .style("opacity", 0)
                if (!that.FILTERING){
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
                }
            })

            .style("opacity", 0.0)
            .attr("x", function(d) { return (that.x_scale(d.mut) - that.max_radius)  })
            .attr("y", function(d) { return (that.y_scale(d.pos) - that.max_radius) })   
            .attr("width", this.max_radius*2)
            .attr("height", this.max_radius*2)  
            .style("fill", function(d){
                if (!isNaN(+d.value)){
                    return (that.color_scale(d.value))
                }
                else{
                    return("darkgrey")
                }
                })

            .transition() 
            .duration(function(){
                if (that.FIRST_TIME_DRAWING){
                    return(that.TRANSITION_TIME)
                }
                else{
                    return(0)
                }})
            .style("opacity", function(){
                if (that.cell_type == "squares"){
                    return(1)
                }
                else{
                    return(0)
                }
            })
            
           
            
            this.draw_group_boxes()
            this.draw_mutant_labels()


            //Draw position labels
            this.bar_svg.selectAll()
            .data(this.rev_range(1,this.n_positions))
            .enter()
            .append("text")
            .attr("x", 1)
            .attr("y", function(d){return(that.y_scale(d) + that.max_radius/4)})
            .attr("font-size", function(d){
                if (d%5 ==0){
                    return( `${(that.heat_width )*.025}px`)
                }
                else{
                    return( `${(that.heat_width )*.015}px`)
                }
                }
                )
            .attr("fill",function(d){
                if (d%5 ==0){
                    return("black")
                }
                else{
                    return("darkgrey")
                }
                })
            .style("text-anchor", "left")
            .style("font-family", "monospace")
            .text(function(d){return(d)})

            //Draw region bars
            this.bar_svg.selectAll()
            .data(this.domain_data)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", function(d){
                return(that.y_scale(String(d.start_pos)) - that.max_radius)
            })
            .attr("width", 500)
            .attr("height", function(d){
                return(that.y_scale(String(d.stop_pos)) - that.y_scale(String(d.start_pos)) + that.max_radius*2)
            })
            .style("fill", function(d){
                if(d.domain.startsWith("TM")){
                    return("#ff0000")
                } else if(d.domain.startsWith("ECL")){
                    return("#0000ff")
                } else if(d.domain.startsWith("ICL")){
                    return("#87cefa")
                } else if(d.domain.startsWith("H")){
                    return("#00ff00")
                } else{
                    return("grey")
                }
            })
            .style("opacity", .3)
            .on("mouseover", function(event,d){
                d3.select(".tooltip")
                .style("opacity",1)
                d3.select(this)
                .style("opacity", .5)
            })
            .on("mousemove", function(event,d){
                d3.select(".tooltip")
                  .html(d.domain)
                  .style("left", `${event.pageX - 40}px`)
                  .style("top", `${event.pageY - 30}px`)
            })
            .on("mouseleave", function(event,d){
                d3.select(".tooltip")
                .style("opacity", 0)
                d3.select(this)
                .style("opacity", .3)
            })

            console.log("this.bar_width", this.bar_width)

            //Label region bars
            this.bar_svg.selectAll()
            .data(this.domain_data)
            .enter()
            .append("text")
            .attr("x", this.bar_width/2)
            .attr("y", function(d){
                return(that.y_scale(String(d.start_pos)) + that.max_radius )
            })
            .html(function(d){return(d.domain)})
            .style("font-family", "monospace")
            .style("text-anchor", "middle")

            this.NEW_GROUPING = false
            this.FIRST_TIME_DRAWING = false
        }
        }     
    }
    

        





