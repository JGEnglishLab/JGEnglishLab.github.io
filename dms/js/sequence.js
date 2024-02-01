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
        this.HEAT_PERCENT = 60
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
        this.sorting = "properties"
        this.domain = returnOrder(this.sorting)
        this.grouping = returnGroupings(this.sorting)



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
            .on("mouseover", this.mouseover)
            .on("mousemove", this.grouping_mousemove)
            .on("mouseleave", this.mouseleave)
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

        this.NEW_GROUPING = false
    }

    // Returns the conditions corresponding to that protein
    setProtein(selected_protein){
        this.protein_data = this.all_data.filter(function(d){return d.protein == selected_protein})
        return([...new Set(this.protein_data.map((item) => item.condition))])
    }

    setInfo(info){
        this.info = info
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
        // this.color_scale = d3.scaleDiverging()
        //     .interpolator(d3.interpolateRdBu)
        //     // .range(["#d7191c"," #ffffbf", "#2c7bb6"])
        //     // .interpolator(d3.interpolateBrBG)
        //     // .interpolator(d3.interpolatePuOr)
        //     .domain([this.min_value,0,this.max_value])

        this.color_scale = d3.scaleDiverging()
        .interpolator(d3.interpolateRdBu)
                    // .range(["#d7191c"," #ffffbf", "#2c7bb6"])

            .domain([this.max_abs,0,this.max_abs*-1])

    }

    rev_range(start, end) {
        const ans = [ ];
        for (let i = start; i <= end; i++) {
            ans.push(i.toString());
            }
        return ans.reverse();
    }



    mouseover(event, d) {
        d3.select(".tooltip")
          .style("opacity", 1)
        d3.select(this)
          .style("stroke", "black")
          .style("stroke-width", .5)
          .style("stroke-opacity", 1)
      }
    circle_mousemove(event, d) {
        d3.select(".tooltip")
          .html("Val: " + truncateDecimals(+d.value,3) + "<br>Position: " + d.pos + "<br>WT: " + d.wt + "<br> Mutation: "+ d.mut)
          .style("left", `${event.pageX - 100}px`)
          .style("top", `${event.pageY - 30}px`)
      }
    grouping_mousemove(event, d) {

        d3.select(".tooltip")
          .html(d.type)
          .style("left", `${event.pageX - 50}px`)
          .style("top", `${event.pageY + 20}px`)
      }
    mouseleave(event, d) {
        d3.select(".tooltip")
          .style("opacity", 0)
        d3.select(this)
          .style("stroke", "none")

      }


    drawHeatMap(){
        if (this.selected_condition){
            this.info.drawLegend()
            this.HEAT_DRAWN = true
            const that = this

            this.heat_width = document.getElementById('heat-sticky-div').getBoundingClientRect().width 
            let bar_width = document.getElementById('heat-sticky-div').getBoundingClientRect().width 
            this.max_radius = Math.floor(this.heat_width/this.mutants.length)/2
            let cur_svg_height = this.max_radius*this.n_positions*2
         
            this.heat_sticky_svg = this.heat_sticky_div.append("svg")
                .attr('id', 'sticky_heat_svg')
                .attr("width", "100%")
                .attr("height", "100%")
                .style("background", "white")
                .style("opacity", .9)

            this.bar_sticky_svg = this.bar_sticky_div.append("svg")
                .attr('id', 'sticky_bar_svg')
                .attr("width", "100%")
                .attr("height", "100%")
                .style("background", "white")

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


            let r_scale = d3.scaleLinear()
            .range([this.max_radius/4, this.max_radius])
            .domain([0,this.max_abs])


             //Draw horizontal lines
             this.heat_svg.selectAll()
             .data(this.rev_range(0,this.n_positions+1))
             .enter()
             .append("line")
             .attr("y1", function(d) {return(that.y_scale(d)+that.max_radius)})
             .attr("y2", function(d) {return(that.y_scale(d)+that.max_radius)})
             .transition() 
             .duration(function(){
                if (that.FIRST_TIME_DRAWING){
                    return(that.TRANSITION_TIME)
                }
                else{
                    return(0)
                }})
             .attr("x2", 0)
             .attr("x1", this.heat_width - this.max_radius)
             .style("opacity", .5)
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
 
             //draw verticle lines
             this.heat_svg.selectAll()
             .data(this.mutants)
             .enter()
             .append("line")
             .attr("x1", function(d) {return(that.x_scale(d)+that.max_radius)})
             .attr("x2", function(d) {return(that.x_scale(d)+that.max_radius)})
             .transition() 
             .duration(function(){
                if (that.FIRST_TIME_DRAWING){
                    return(that.TRANSITION_TIME*3)
                }
                else{
                    return(0)
                }})
             .attr("y2", 0 + this.max_radius)
             .attr("y1", cur_svg_height - this.max_radius)
             .style("opacity", .5)
             .style("stroke", "lightgrey")
             .style("stroke-width", 1)
 

       
            // Draw circles
            this.heat_svg.selectAll()
            .data(this.filtered_data)
            .enter()
            .append("circle")
            .on("mouseover", this.mouseover)
            .on("mousemove", this.circle_mousemove)
            .on("mouseleave", this.mouseleave)
            .attr("cx", function(d) { return (that.x_scale(d.mut)) })
            .attr("cy", function(d) { return (that.y_scale(d.pos)) })
            .style("opacity", 0) 
            .style("opacity", 1)
            .transition() 
            .duration(function(){
                if (that.FIRST_TIME_DRAWING){
                    return(that.TRANSITION_TIME)
                }
                else{
                    return(0)
                }})
            .attr("r", function(d){return (r_scale(Math.abs(d.value)))})
            .style("fill", function(d){return (that.color_scale(d.value))})
            
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
                    return( `${(bar_width)*.025}px`)
                }
                else{
                    return( `${(bar_width)*.015}px`)
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


           
            this.NEW_GROUPING = false
            this.FIRST_TIME_DRAWING = false

        }
        }     
    }
    

        





