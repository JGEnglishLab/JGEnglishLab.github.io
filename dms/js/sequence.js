class Sequence{
    constructor(all_data){
        /////////////////////////////////////////////////////////////////////////////////////////////////
        //                                  CONSTANTS
        /////////////////////////////////////////////////////////////////////////////////////////////////
        this.WIDTH = 1500 
        this.HEIGHT = 350
        this.MARGINS = { top: 50, left: 80, right: 20, bottom: 10 }
        this.SQUARE_SIZE = 15
        this.RADIUS = 15
        this.MAX_RADIUS_DIVISOR = 3 //min_radius = max_radius/MAX_RADIUS_DIVISOR
        this.HEAT_PERCENT = 70
        this.TRANSITION_TIME = 1000
        this.MUTANT_LABELS_DELAY = 200
        this.RECT_TRANSITION_DELAY = .75 //Lower this to make squares drop down faster
        this.AA_RECT_OPACITY = .6
        this.AA_RECT_HEIGHT = 50
        this.DEFAULT_DOMAIN_OPACITY = .3
        this.HIGHLIGHTED_DOMAIN_OPACITY = .5
        this.HEAT_STICKY_SVG_OPACITY = .9
        this.LINE_OPACITY = .5
        this.MUTANT_LABEL_TEXT_SCALE = .7
        this.NA_COLOR = "darkgrey"
        this.FIVE_LINE_COLOR = "black"
        this.NON_FIVE_LINE_COLOR = "lightgrey"
        this.FIVE_LINE_STROKE_WIDTH = 1.2
        this.NON_FIVE_LINE_STROKE_WIDTH = 1
        this.CIRCLE_STROKE_WIDTH = .4
        this.FIVE_NUMBER_COLOR = "black"
        this.NON_FIVE_NUMBER_COLOR = "darkgrey"
        this.SHIFT_POSITION_LABELS_RIGHT = 1
        this.FIVE_POSITION_LABEL_SCALE = .03
        this.NON_FIVE_POSITION_LABEL_SCALE = .02
        this.TM_DOMAIN_COLOR = "#ff0000"
        this.ECL_DOMAIN_COLOR = "#0000ff"
        this.ICL_DOMAIN_COLOR = "#87cefa"
        this.H8_DOMAIN_COLOR = "#00ff00"
        this.OTHER_DOMAIN_COLOR = "grey"


        /////////////////////////////////////////////////////////////////////////////////////////////////
        //                                  GENERAL SET UP 
        /////////////////////////////////////////////////////////////////////////////////////////////////
        const that = this

        this.all_data = all_data
        this.right_parent_div = d3.select("#right-parent-div") 
        this.heat_sticky_div = d3.select("#heat-sticky-div")
        this.bar_sticky_div = d3.select("#bar-sticky-div")
        this.tooltip = d3.select("#default_tooltip")

        this.positions = [...new Set(this.all_data.map((item) => item.pos))];   
        this.mutants = [...new Set(this.all_data.map((item) => item.mut))]; 

        this.selected_condition = "Select A Condition" 
        this.selected_protein = null
        this.heat_drawn = false
        this.first_time_drawing = true
        this.new_grouping = true
        this.filtering = false
        this.highlighted = []
        this.sorting = "hydropathy"
        this.cell_type = "squares"
        this.grouping = returnGroupings(this.sorting)[0]
        this.grouping_map = returnGroupings(this.sorting)[1]
        this.upper_percentile = .99
        this.lower_percentile = .01

        //Call resize 
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
    setLegend(legend){
        this.legend = legend
    }
    setScatter(scatter){
        this.scatter = scatter
    }
    setSnake(snake){
        this.snake = snake
    }


    /////////////////////////////////////////////////////////////////////////////////////////////// 
    //                                 HELPER FUNCTIONS
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //Sorts an array to be ascending
    asc(arr){
        return(arr.sort((a, b) => a - b))
    }

    //Used for sorting objects with pos attribute
    comparePos(a, b) {
        return a.pos - b.pos;
    }

    //Gives reverse range of two numbers
    //rev_range(1,4) -> ['4','3','2','1']
    rev_range(start, end) {
        const ans = [];
        for (let i = start; i <= end; i++) {
            ans.push(i.toString());
            }
        return ans.reverse();
    }

    //Returns the percentile (q) >=0 && <=1 of an array
    calcPercentile(arr, q){
        const sorted = this.asc(arr);
        const pos = (sorted.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (sorted[base + 1] !== undefined) {
            return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        } else {
            return sorted[base];
        }
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        clear()

    Removes every svg in the right-parent-div
    *////////////////////////////////////////////////////////////////////////////////////////////////
    clear(){
        if (this.heat_drawn){
            this.filtering=false
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


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        resize()
                                        
    Clears everything and re-draws
    *////////////////////////////////////////////////////////////////////////////////////////////////
    resize(){
        this.clear()
        this.drawHeatMap()
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        setProtein(selected_protein)
                                        
    Sets selected_protein and returns all conditions that are associated with selected_protein
    *////////////////////////////////////////////////////////////////////////////////////////////////
    setProtein(selected_protein){
        this.selected_protein = selected_protein
        this.protein_data = this.all_data.filter(function(d){return d.protein == selected_protein})
        this.getRegions()

        return([...new Set(this.protein_data.map((item) => item.condition))])
    }
    

    /////////////////////////////////////////////////////////////////////////////////////////////// 
    /*
                                      setCondition(selected_condition)
                                        
    Sets the selected condition 
    This function is called when a new condition is selected in head.js when a new condition is selected
    *////////////////////////////////////////////////////////////////////////////////////////////////
    setCondition(selected_condition){
        this.first_time_drawing = true
        this.selected_condition = selected_condition
        this.filtered_data = this.protein_data.filter(function(d){return d.condition == selected_condition})
        
        //sort filtered data for transitions
        this.filtered_data.sort(this.comparePos);
        this.freq_data = this.filtered_data.filter(function(d){return !isNaN(d.freq)})

        this.positions = [...new Set(this.filtered_data.map((item) => item.pos))];   
        this.mutants = [...new Set(this.filtered_data.map((item) => item.mut))]; 
        this.domain = returnOrder(this.sorting, this.mutants) //returnOrder from utils.js

        this.n_positions =  d3.max(this.positions.map(d => Number(d))) 

        this.max_value =  d3.max(this.filtered_data.map(d => +d.value))
        this.min_value =  d3.min(this.filtered_data.map(d => +d.value))
        this.max_abs = d3.max([Math.abs(this.max_value), Math.abs(this.min_value)])

        this.min_freq = d3.min(this.filtered_data.map(d => +d.freq))
        this.max_freq = d3.max(this.filtered_data.map(d => +d.freq))

        this.non_Na_data = this.filtered_data.filter(function(d) {return !isNaN(d.value) })
        this.bottom_value = this.calcPercentile(this.non_Na_data.map(d => +d.value), this.lower_percentile)
        this.top_value = this.calcPercentile(this.non_Na_data.map(d => +d.value), this.upper_percentile)
        this.max_abs_percentile = d3.max([Math.abs(this.top_value), Math.abs(this.bottom_value)])

        //Draw color_scale between max_max_abs_percentile and -max_max_abs_percentile
        this.color_scale = d3.scaleDiverging()
        .interpolator(d3.interpolateRdBu)
        .domain([this.max_abs_percentile,0,this.max_abs_percentile*-1])
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        change_cells(value)
                                        
    takes a string value, Either "circles" or "squares"
    Changes the heat map cells to either squares (default) or circles (to show frequency in radius)
    *////////////////////////////////////////////////////////////////////////////////////////////////
    change_cells(value){
        const that = this

        //Set rect opacity to 1 
        //Remove all grid lines
        if(value == "squares"){
            this.cell_type = "squares"
            this.heat_svg.selectAll("rect")
            .transition()
            .duration(this.TRANSITION_TIME)
            .style("opacity", 1)
            this.heat_svg.selectAll("line")
            .transition()
            .duration(this.TRANSITION_TIME)
            .style("opacity", 0)
        }

        //Set rect opacity to 0
        //Add grid lines
        //If we are filtering, (from brushing scatter plot) keep rect at opacity of 1
        if(value == "circles"){
            this.cell_type = "circles"
            this.heat_svg.selectAll("rect")
            .transition()
            .duration(this.TRANSITION_TIME)
            .style("opacity", function(d){
                if (that.filtering){
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
            .style("opacity", this.LINE_OPACITY )
        }
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        draw_mutant_lables()
                                        
    Draws text labels for columns of heat map
    If the grouping has been changed the transition will be used
    *////////////////////////////////////////////////////////////////////////////////////////////////
    draw_mutant_labels(){
        const that = this
        this.heat_sticky_svg.selectAll()
            .data(this.mutants)
            .enter()
            .append("text")
            .attr("class", "mutant-labels")
            .attr("x", function(d){return(that.x_scale(d))})
            .attr("font-size", `${(this.heat_width/this.mutants.length)*this.MUTANT_LABEL_TEXT_SCALE }px` )
            .style("font-family", "monospace")
            .style("cursor", "none")
            .style("text-anchor", "middle")
            .text(function(d){return(d)})
            .on("mouseover", function(event, d){
                defaultMouseover()
                d3.select(this)
                  .style("font-weight", "bold")
              })
            .on("mousemove", function(event,d){
                defaultMousemove(getFullName(d),event,-50,20)
            })
            .on("mouseleave", function(d,event){
                defaultMouseleave()
                d3.select(this)
                    .style("font-weight", "normal")
            })
            .transition()
            .delay(this.MUTANT_LABELS_DELAY)
            .duration(function(){
                if (that.new_grouping){
                    return(that.TRANSITION_TIME)
                }
                else {
                    return(0)
                }
            })
            .attr("y", 30)      
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        draw_group_boxes()
                                        
    Draws colored rectangles behind the mutant labels
    If the grouping has been changed the transition will be used
    This.grouping is returned by returnGroupings from utils.js
    It is an array of object
    If one of the mutants from the grouping isn't included in the this.mutants we move past it. 
   
    If we had this
    
    values:["A", "V", "I", "L", "M", "F", "Y", "W"],
    type:"Hydrophobic",
    color:"#c71585"

    as one of the groupings, and we happened to be missing "A", "W", and "L" in the this.mutants
    this function will draw a box from "V" to "Y", it won't matter that L is missing
    *////////////////////////////////////////////////////////////////////////////////////////////////
    draw_group_boxes(){
        const that = this
        this.heat_sticky_svg.selectAll()
            .data(this.grouping)
            .enter()
            .append("rect")
            .attr("class", "group-rect")
            .attr("x", function(d){
                let start = null
                let cur_index = 0
                //Find the earliest mutant in this.grouping[i].values that is in this.mutants
                while(cur_index < d.values.length - 1){
                    if (that.mutants.includes(d.values[cur_index])){
                        start = d.values[cur_index]
                        break
                    } 
                    cur_index +=1
                }
                if (start !== null){ //If start is still null that means this.mutants doesn't contain any of the mutants in this.grouping[i].values
                    return(that.x_scale(start) - that.max_radius)
                }else{
                    return(0)
                }
            })
            .attr("width", function(d){
                let start = null
                let cur_index = 0
                //Find the earliest mutant in this.grouping[i].values that is in this.mutants
                while(cur_index < d.values.length - 1){
                    if (that.mutants.includes(d.values[cur_index])){
                        start = d.values[cur_index]
                        break
                    } 
                    cur_index +=1
                }
                let stop = null
                cur_index =  d.values.length - 1

                //Find the last mutant in this.grouping[i].values that is in this.mutants
                while(cur_index >= 0){
                    if (that.mutants.includes(d.values[cur_index])){
                        stop = d.values[cur_index]
                        break
                    } 
                    cur_index -=1
                }
                if (start !== null && stop !== null){
                    return(that.x_scale(stop) - that.x_scale(start) + that.max_radius * 2)

                } else{
                    return(0)
                }
            })
            .style("fill", function(d){return(d.color)})
            .style("opacity", 0)
            .on("mouseover", function(event, d){
                defaultMouseover()
                d3.select(this)
                  .style("stroke", "black")
                  .style("stroke-width", 2)
                  .style("stroke-opacity", 1)
            })
            .on("mousemove", function(event,d){
                defaultMousemove(d.type,event,-50,20)
            })
            .on("mouseleave", function(d,event){
                defaultMouseleave()
                d3.select(this)
                    .style("stroke", "none")
            })
            .transition()
            .delay(this.MUTANT_LABELS_DELAY)
            .duration(function(){
                if (that.new_grouping){
                    return(that.TRANSITION_TIME)
                }
                else {
                    return(0)
                }
            })
            .attr("y", 0)
            .attr("height", this.AA_RECT_HEIGHT)
            .style("opacity", this.AA_RECT_OPACITY)
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        sortAA()
                                        
    Used to to change the order of AA mutants
    Called in head.js on sort_select change
    Resets x_scale and domain
    *////////////////////////////////////////////////////////////////////////////////////////////////
    sortAA(sorting){
        const that = this
        this.new_grouping = true
        this.sorting = sorting
        this.domain = returnOrder(sorting, this.mutants)
        this.x_scale.domain(this.domain)
        this.grouping = returnGroupings(sorting)[0]
        this.grouping_map = returnGroupings(sorting)[1]

        //Remove and re-draw group boxes
        this.heat_sticky_svg.selectAll("rect")
            .remove()
        this.draw_group_boxes()

        //Remove and re-draw mutant labels
        this.heat_sticky_svg.selectAll("text")
            .remove()
        this.draw_mutant_labels()
        
        //Move circles to new x
        this.heat_svg.selectAll("circle")
        .transition()
        .duration(this.TRANSITION_TIME)
        .attr("cx", function(d) {  return (that.x_scale(d.mut)) })

        //Move rect to new x
        this.heat_svg.selectAll("rect")
        .transition()
        .duration(this.TRANSITION_TIME)
        .attr("x", function(d) { return (that.x_scale(d.mut) - that.max_radius)  })

        this.new_grouping = false
    }


    /////////////////////////////////////////////////////////////////////////////////////////////// 
    /*
                                      getRegions()
                                        
    Sets all the domain_data
    Domain data will be an array of object used to draw rectangles to the right of heat
    this.domain_data will be an array of objects
    E.g.
    {cur_domain: "TM1",
    max_position: 200,
    min_position: 120,}
    *////////////////////////////////////////////////////////////////////////////////////////////////
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
    }


    
    /////////////////////////////////////////////////////////////////////////////////////////////// 
    /*
                                      reCalcPercentiles()
                                        
    When percentile sliders are changed this function is called from head.js
    Re-calcs percentiles and updates this.color_scale and updates colors of heat map
    *////////////////////////////////////////////////////////////////////////////////////////////////
    reCalcPercentiles(){
        const that = this
        
        //Reset the top and bottom values & color scale
        this.bottom_value = this.calcPercentile(this.non_Na_data.map(d => +d.value), this.lower_percentile)
        this.top_value = this.calcPercentile(this.non_Na_data.map(d => +d.value), this.upper_percentile)
        this.max_abs_percentile = d3.max([Math.abs(this.top_value), Math.abs(this.bottom_value)])

        this.color_scale = d3.scaleDiverging()
        .interpolator(d3.interpolateRdBu)
        .domain([this.max_abs_percentile,0,this.max_abs_percentile*-1])

        //Change colors of circles
        this.heat_svg.selectAll("circle")
            .transition() 
            .duration(that.TRANSITION_TIME)
            .style("fill",function(d){
                if (!isNaN(+d.value)){
                    if (+d.value < 0){
                        //Anything less than bottom value should be the same color as bottom value
                        return (that.color_scale(d3.max([that.bottom_value, +d.value]))) 
                    }
                    else{
                        //Anything greater than top value should be the same color as top value
                        return (that.color_scale(d3.min([that.top_value,+d.value])))
                    }
                }
                else{
                    return(that.NA_COLOR)
                }
                })
        //Change the colors of the rects
        this.heat_svg.selectAll("rect")
            .transition() 
            .duration(that.TRANSITION_TIME)
            .style("fill",function(d){
                if (!isNaN(+d.value)){
                    if (+d.value < 0){
                        return (that.color_scale(d3.max([that.bottom_value, +d.value])))
                    }
                    else{
                        return (that.color_scale(d3.min([that.top_value,+d.value])))
                    }
                }
                else{
                    return(that.NA_COLOR)
                }
                })
    }

    
    /////////////////////////////////////////////////////////////////////////////////////////////// 
    /*
                                      filterHeatMap(values,selection)
                                        
    Grey's out squares that aren't in heat map
    values = an array of objects that have been brushed in the scatter.
    selection = either null or not, If null that means the brush has been reset and we un-grey everything
    this is called in scatter.js
    *////////////////////////////////////////////////////////////////////////////////////////////////
    filterHeatMap(values, selection){
        //get all of the identities of the highlighted values
        //id = pos+mut
        this.highlighted = [...new Set(values.map((item) => item.pos+item.mut))];  
        const that = this
        
        if(selection){ //Selection will be null on reset
            this.filtering = true
            
            //Grey out rectangles if they aren't in highlighted
            this.heat_svg
            .selectAll("rect")
            .transition()
            .duration(this.TRANSITION_TIME)
            .style("opacity", function(d){
                let pos_mut = d.pos + d.mut
                if (that.highlighted.includes(pos_mut)){
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
                if (that.highlighted.includes(pos_mut)){
                    return(that.color_scale(d.value))
                }
                else{
                    return(that.NA_COLOR)
                }
            })

      
        }
        else{
            this.filtering = false

            //Un grey out rectangles
            //If cell_type == cirlces keep rectangle opacity at 0
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
                    return(that.NA_COLOR)
                }
            })
            .style("stroke", "none")
        }
    }



    

    /////////////////////////////////////////////////////////////////////////////////////////////// 
    /*
                                      drawHeatMap()
                                        
    Creates svgs
    Draws all rectangles, circles, grid lines, position labels, region rectangles, and region labels
    *////////////////////////////////////////////////////////////////////////////////////////////////
    drawHeatMap(){
        this.document_height = document.body.clientHeight
        const that = this


        //If selecting a condition Draw everything
        if (this.selected_condition!= "Select A Condition"){
            this.heat_drawn = true
            this.new_grouping = false

            //Clear and redraw-legend
            this.legend.clear()
            this.legend.drawLegend()
            if (this.legend.frequency_drawn){
                this.legend.addFrequencyLegend()
            }

            //Get widths/heights and max radius
            this.heat_width = document.getElementById('heat-sticky-div').getBoundingClientRect().width 
            this.bar_width = document.getElementById('bar-sticky-div').getBoundingClientRect().width 
            this.max_radius = Math.floor(this.heat_width/this.mutants.length)/2
            let cur_svg_height = this.max_radius*2*this.n_positions


            //Append Svgs
            this.heat_sticky_svg = this.heat_sticky_div.append("svg")
                .attr('id', 'sticky_heat_svg')
                .attr("width", "100%")
                .attr("height", "100%")
                .style("background", "white")
                .style("opacity", this.HEAT_STICKY_SVG_OPACITY)
            this.bar_sticky_svg = this.bar_sticky_div.append("svg")
                .attr('id', 'sticky_bar_svg')
                .attr("width", "100%")
                .attr("height", "100%")
                .style("background", "white")
            this.heat_svg = this.right_parent_div.append("svg")
                .attr('id', 'heat_svg')
                .attr('width', `${this.HEAT_PERCENT}%`)
                .attr('height', cur_svg_height + this.MARGINS.top + this.MARGINS.bottom)
                .style("display", "flex")
                .style("float", "left")
            this.bar_svg = this.right_parent_div.append("svg")
                .attr("id", "bar_svg")
                .attr('width', `${100 - this.HEAT_PERCENT}%`)
                .attr('height', cur_svg_height + this.MARGINS.top + this.MARGINS.bottom)
                .style("display", "flex")

            // Set up scales
            this.x_scale = d3.scaleBand()
            .range([this.max_radius, this.heat_width])
            .domain(this.domain)
            this.y_scale = d3.scaleBand()
            .range([cur_svg_height, 0])
            .domain(this.rev_range(0,this.n_positions))
            this.r_scale = d3.scaleLog()
            .range([(this.max_radius/this.MAX_RADIUS_DIVISOR), this.max_radius])
            .domain([this.min_freq,this.max_freq])

            this.draw_group_boxes()
            this.draw_mutant_labels()

             //Draw horizontal lines
             this.heat_svg.selectAll()
             .data(this.rev_range(0,this.n_positions))
             .enter()
             .append("line")
             .attr("y1", function(d) {return(that.y_scale(d)+that.max_radius)})
             .attr("y2", function(d) {return(that.y_scale(d)+that.max_radius)})
             .attr("x2", 0)
             .attr("x1", this.heat_width - this.max_radius)
             .style("stroke", function(d){
                 if (d == 0 || d%5 == 0 || d == that.n_positions){
                     return(that.FIVE_LINE_COLOR)
                 }
                 else{
                     return(that.NON_FIVE_LINE_COLOR)
                 }
             })
             .style("stroke-width", function(d){
                 if (d == 0 || d%5 == 0 || d == that.n_positions){
                     return(that.FIVE_LINE_STROKE_WIDTH)
                 }
                 else{
                     return(that.NON_FIVE_LINE_STROKE_WIDTH)
                 }
             })
             .style("opacity", function(){
                if (that.cell_type == "circles"){
                    return(that.LINE_OPACITY)
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
             .style("stroke", this.NON_FIVE_LINE_COLOR)
             .style("stroke-width", this.NON_FIVE_LINE_STROKE_WIDTH)
             .style("opacity", function(){
                if (that.cell_type === "circles"){
                    return(that.LINE_OPACITY )
                }
                else{
                    return(0)
                }
            })
                 
            // Draw circles
            this.heat_svg.selectAll()
            .data(this.freq_data)
            .enter()
            .append("circle")
            .attr("cx", function(d) { return (that.x_scale(d.mut))})
            .attr("cy", function(d) { return (that.y_scale(d.pos))})
            .style("fill",function(d){
                if (!isNaN(+d.value)){
                    if (+d.value < 0){
                        //Anything less than bottom value should be the same color as bottom value
                        return (that.color_scale(d3.max([that.bottom_value, +d.value])))
                    }
                    else{
                        //Anything greater than top value should be the same color as top value
                        return (that.color_scale(d3.min([that.top_value,+d.value])))
                    }
                }
                else{
                    return(that.NA_COLOR)
                }
                })
            .style("stroke", that.NA_COLOR)
            .style("stroke-width", this.CIRCLE_STROKE_WIDTH)
            .style("pointer-events", "none")
            .transition() 
            .duration(function(){
                if (that.first_time_drawing){
                    return(that.TRANSITION_TIME)
                }
                else{
                    return(0)
                }})
            .attr("r", function(d){return (that.r_scale(d.freq))})
            
            //Draw rectangles
            this.heat_svg.selectAll()
            .data(this.filtered_data)
            .enter()
            .append("rect")
            .style("opacity", 0.0)
            .attr("x", function(d) { return (that.x_scale(d.mut) - that.max_radius)  })
            .attr("y", function(d) { return (that.y_scale(d.pos) - that.max_radius) })   
            .attr("width", this.max_radius*2)  
            .style("opacity", function(){
                if (that.cell_type == "squares"){
                    return(1)
                }
                else{
                    return(0)
                }
            })
            .on("mouseover", function(event,d){
                defaultMouseover()
                if (!that.snake.residue_clicked){ //Only highlight snake if a residue is not clicked
                    that.snake.heatMousover(d)
                }
                that.scatter.heatMousover(d)
                if (!that.filtering){
                    d3.select(this)
                        .style("opacity", .5)
                        .style("stroke", "black")
                        .style("stroke-width", .5)
                        .style("stroke-opacity", 1)
                }
            })
            .on("mousemove", function(event,d){
                let text = "Val: " + truncateDecimals(+d.value,3) + "<br>Position: " + d.pos + "<br>WT: " + d.wt + "<br> Mutation: "+ d.mut +"<br> BW Number: " + d.BW+ "<br> Gnomad Frequeny: " + (+(+d.freq).toPrecision(2)).toExponential()
                defaultMousemove(text,event,-190,-30)
            })
            .on("mouseleave", function(){
                defaultMouseleave()
                if (!that.snake.residue_clicked){
                    that.snake.heatMouseleave()
                }
                that.scatter.heatMouseleave()
                if (!that.filtering){
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
            .transition() 
            .delay(function(d, i) { 
                if (!that.first_time_drawing){
                    return(0)
                }
                if (i <  ((that.document_height - that.AA_RECT_HEIGHT ) / (that.max_radius * 2) ) * that.mutants.length){
                    return(i*that.RECT_TRANSITION_DELAY)
                }
                else{
                    return(0)
                }
                })           
            .duration(function(){
                if (that.first_time_drawing){
                    return(that.TRANSITION_TIME/3)
                }
                else{
                    return(0)
                }})
            .attr("height", this.max_radius*2)  
            .style("fill", function(d){
                if (!isNaN(+d.value)){
                    if (+d.value < 0){
                        //Anything less than bottom value should be the same color as bottom value
                        return (that.color_scale(d3.max([that.bottom_value, +d.value])))
                    }
                    else{
                        //Anything greater than top value should be the same color as top value
                        return (that.color_scale(d3.min([that.top_value,+d.value])))
                    }
                }
                else{
                    return(that.NA_COLOR)
                }
                })

            
            //Draw position labels
            this.bar_svg.selectAll()
            .data(this.rev_range(1,this.n_positions))
            .enter()
            .append("text")
            .attr("x", this.SHIFT_POSITION_LABELS_RIGHT)
            .attr("y", function(d){return(that.y_scale(d) + that.max_radius/4)})
            .attr("font-size", function(d){
                if (d%5 ==0){
                    return( `${(that.heat_width )*that.FIVE_POSITION_LABEL_SCALE}px`)
                }
                else{
                    return( `${(that.heat_width )*that.NON_FIVE_POSITION_LABEL_SCALE}px`)
                }
                }
                )
            .attr("fill",function(d){
                if (d%5 ==0){
                    return(that.FIVE_NUMBER_COLOR)
                }
                else{
                    return(that.NON_FIVE_NUMBER_COLOR)
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
            .attr("width", "100%")
            .attr("height", function(d){
                return(that.y_scale(String(d.stop_pos)) - that.y_scale(String(d.start_pos)) + that.max_radius*2)
            })
            .style("fill", function(d){
                if(d.domain.startsWith("TM")){
                    return(that.TM_DOMAIN_COLOR)
                } else if(d.domain.startsWith("ECL")){
                    return(that.ECL_DOMAIN_COLOR)
                } else if(d.domain.startsWith("ICL")){
                    return(that.ICL_DOMAIN_COLOR)
                } else if(d.domain === "H8"){
                    return(that.H8_DOMAIN_COLOR)
                } else{
                    return(that.OTHER_DOMAIN_COLOR)
                }
            })
            .style("opacity", this.DEFAULT_DOMAIN_OPACITY)
            .on("mouseover", function(event,d){
                defaultMouseover()
                d3.select(this)
                .style("opacity", that.HIGHLIGHTED_DOMAIN_OPACITY)
            })
            .on("mousemove", function(event,d){
                defaultMousemove(d.domain,event,-40,-30)
            })
            .on("mouseleave", function(event,d){
                defaultMouseleave
                d3.select(this)
                .style("opacity",  that.DEFAULT_DOMAIN_OPACITY)
            })


            //Label region bars
            this.bar_svg.selectAll()
            .data(this.domain_data)
            .enter()
            .append("text")
            .attr("x", this.bar_width/2)
            .attr("y", function(d){
                return(that.y_scale(String(d.start_pos)) + that.max_radius )
            })
            .html(function(d){
                if(d.domain ==="NA"){
                    return("No Domain Info")
                }
                else{
                    return(d.domain)
                }
            })
            .style("font-family", "monospace")
            .style("text-anchor", "middle")


            this.first_time_drawing = false

        }}     
    }