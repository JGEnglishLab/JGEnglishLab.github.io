class Volcano{
    constructor(all_data, globalApplicationState, helper){

        //**********************************************************************************************
        //                                  CONSTANTS FOR CHART SIZE
        //**********************************************************************************************
        this.WIDTH = 650 //500
        this.HEIGHT = 700
        this.MARGIN = 55
        this.DEFAULT_VOLCANO_OPACITY = .7
        this.DEFAULT_STROKE_WIDTH = .2
        this.ANIMATION_DURATION = 8
        this.NOT_HIGHLIGHTED_OPACITY = .01
        this.HIGHLIGHTED_OPACITY = 1

        this.NOT_HIGHLIGHTED_STROKE_WIDTH = .01
        this.HIGHLIGHTED_STROKE_WIDTH = 1

        this.TOP_5_OPACITY = 1
        this.CONTROL_OPACITY = .5
        this.ALL_OTHER_OPACITY=.5
        this.BRUSH_ON_OPACITY=1
        this.BRUSH_OFF_OPACITY=.1
        this.TOP_5_RADIUS = 4
        this.ALL_OTHER_RADIUS = 2.5

        this.FDR_LINE_COLOR = "#e83f3f"
        this.CIRCLE_COLOR = "grey"
        this.CONTROL_CIRCLE_COLOR = "#4c4c4c"

        const that = this


        //**********************************************************************************************
        //                                  GENERAL SET UP 
        //**********************************************************************************************
        this.all_data = all_data
        this.globalApplicationState = globalApplicationState

        this.h = helper

        this.volcano_div = d3.select("#volcano-div") 
    
        





        this.volcanoSvg = this.volcano_div.append("svg")
            .attr('id', 'volcano_svg')
            .attr('width', this.WIDTH + 75)
            .attr('height', this.HEIGHT)
            .attr("transform", `translate(0,${150})`)

        //**********************************************************************************************
        //                                  GET MIN AND MAX
        //**********************************************************************************************

        this.max_p_val = 15
        this.max_fc = 2
        this.min_fc = -2

        //**********************************************************************************************
        //                                   LABELS
        //**********************************************************************************************

        this.volcanoSvg.append("text").attr("x",640).attr("y",600).text("FDR = .05").style("font-size", "15px").attr("alignment-baseline","middle")
        this.volcanoSvg
            .append('line')
            .style("stroke", this.FDR_LINE_COLOR)
            .style("stroke-width", 4)
            .attr("x1", 615)
            .attr("y1",595)
            .attr("x2", 635)
            .attr("y2", 595); 

        this.volcanoSvg
        .append("text")
        .attr("transform","translate(" + this.WIDTH / 2 + " ," + (this.HEIGHT - 10) + ")")
        .style("text-anchor", "middle")
        .text("Log 2 Fold Change");

        this.volcanoSvg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 15)
        .attr("x",-(this.HEIGHT/2))
        .style("text-anchor", "middle")
        .text("LRT Statistic");


        //**********************************************************************************************
        //                                  SCALES
        //**********************************************************************************************

        //TODO should we make the x scale symetrical?
        this.x_scale = d3.scaleLinear()
        .domain([this.min_fc, this.max_fc]).nice()
        .range([this.MARGIN, this.WIDTH - this.MARGIN])

        this.y_scale = d3.scaleLinear()
        .domain([0, this.max_p_val]).nice()
        .range([this.HEIGHT - this.MARGIN, this.MARGIN])

        this.xAxis = g => g
        .attr("transform", `translate(0,${this.HEIGHT - this.MARGIN })`)
        .call(d3.axisBottom(this.x_scale))

        this.yAxis = g => g
        .attr("transform", `translate(${this.MARGIN},0)`)
        .call(d3.axisLeft(this.y_scale))


        this.x_axis = this.volcanoSvg.append('g').call(this.xAxis)
        this.y_axis = this.volcanoSvg.append('g').call(this.yAxis)
        this.line = this.volcanoSvg.append('g')
        this.points = this.volcanoSvg.append('g')




        // document.getElementById('control_check').addEventListener('change', function(){
        //     const isChecked = d3.select(this).property("checked");
        //     if (isChecked) {
        //         d3.select("#top_check").property('checked', false)
        //         that.drawVolcano()
        //         that.points.selectAll("circle")
        //             .style("opacity", d => (d.controls === "True" ? 1 : 0))
        //             .filter(d => d.controls !== "True")
        //             .remove();
        //     } 
        //     else {
        //         that.drawVolcano()
        //     }
        //   });

        //   document.getElementById('number_selector').addEventListener('change', function(){
        //     let n = d3.select('#number_selector').property("value") === "" ? 5 : d3.select('#number_selector').property("value")
        //     const isChecked = d3.select("#top_check").property("checked");
        //     if (isChecked) {
        //         d3.select("#control_check").property('checked', false)
        //         that.drawVolcano()
        //         that.points.selectAll("circle")
        //             // .style("opacity", d => (+d[that.max_rank_name] <= 5) )
        //             .filter(d => +d[that.max_rank_name] > n | d[that.max_rank_name] == "")
        //             .remove();
        //     } 
        //     else {
        //         that.drawVolcano()
        //     }
        //   });


        //   document.getElementById('top_check').addEventListener('change', function(){
        //     const isChecked = d3.select(this).property("checked");

        //     let n = d3.select('#number_selector').property("value") === "" ? 5 : d3.select('#number_selector').property("value")

        //     if (isChecked) {
        //         d3.select("#control_check").property('checked', false)
        //         that.drawVolcano()
        //         that.points.selectAll("circle")
        //             .filter(d => +d[that.max_rank_name] > n | d[that.max_rank_name] == "")
        //             .remove();
        //     } 
        //     else {
        //         that.drawVolcano()
        //     }
        //   });

      

      
       
    }

    drawVolcano(selected_motif = "none"){
        const that = this
        if (this.globalApplicationState.selected_comparison != "none"){

            this.points
                .selectAll('circle')
                .remove()

            this.line
                .selectAll('line')
                .remove()

            let base_display_name = this.globalApplicationState.base
            let stim_display_name = this.globalApplicationState.stimulated

            let base_id = this.globalApplicationState.display_name_map.revGet(base_display_name)
            let stim_id = this.globalApplicationState.display_name_map.revGet(stim_display_name)

            let base_run = base_id.split("||")[1]
            let base_treatment = base_id.split("||")[0]

            let stim_run = stim_id.split("||")[1]
            let stim_treatment = stim_id.split("||")[0]

            let logFC_col = "logFC__"+this.globalApplicationState.selected_comparison
            let statistic_name = "statistic__"+this.globalApplicationState.selected_comparison
            this.max_rank_name = "maxRank__" +this.globalApplicationState.selected_comparison
            this.n_rna_stim_name = "RNA_barcodes__" +stim_treatment+"__"+stim_run
            this.n_rna_base_name = "RNA_barcodes__" +base_treatment+"__"+base_run
            let fdr_name = "fdr__" +this.globalApplicationState.selected_comparison

            


            let filter_res = this.h.filter_comparison_data(
                this.all_data, 
                base_treatment, 
                stim_treatment, 
                base_run, 
                stim_run, 
                selected_motif, 
                this.globalApplicationState.min_RNA, 
                this.globalApplicationState.min_DNA,
                this.globalApplicationState.filter_by_motif)

            let selected_data = filter_res[0]
            let max_statistic = filter_res[2]
            let min_statistic = filter_res[3]
            let max_fc = filter_res[4]
            let min_fc = filter_res[5]
            this.max_abs_fc = d3.max([max_fc, -1*min_fc])

            let fdr_vals = this.all_data.map(d => +d[fdr_name])
            fdr_vals= fdr_vals.filter(function(d){return d != 0})
            fdr_vals = fdr_vals.map(d=> d-.05)

            let below = d3.max(fdr_vals.filter(function(d){return d<0})) //Gets the higest fdr below .05
            let above = d3.min(fdr_vals.filter(function(d){return d>0})) //Gets the lowest fdr above .05
            let match = fdr_vals.filter(function(d){return d===0})          //Gets a list of fdrs that are exactly .05 (EXTREMELY UNLIKELY)
            let statistic_threshold = null

            //Sets the statistic_threshold by finding the static values closest to .05
            //If a fdr value was .05 (if (extremely unlikely)) set the corresponding statistic to the fdr threshold
            //Otherwise, get the mean of the statistics corresponding to the highest fdr below .05 and the lowest fdr above .05
            if (match.length != 0){ // If there is an exact match
                let exact_match = this.all_data.filter(function(d){
                    return +d[fdr_name] - .05 === 0;
                })
                statistic_threshold = exact_match.map(d => d[statistic_name])
            }
            else if (below != null & above != null) { // If there is a value above and below .05
                let above_and_below = this.all_data.filter(function(d){
                    return +d[fdr_name] - .05 === above || +d[fdr_name] - .05 === below;
                })
                statistic_threshold = d3.mean(above_and_below.map(d => d[statistic_name] ))
            }
            else if (below == null & above != null){ // If there is no value below .05 set statistic threshold to highest lrt
                statistic_threshold = max_statistic
            }
            else if (below == null & above != null){ // If there is no value above .05 set statistic threshold to lowest lrt
                statistic_threshold = min_statistic
            }

            this.x_scale = d3.scaleLinear()
            .domain([-1*this.max_abs_fc, this.max_abs_fc])
            .range([this.MARGIN, this.WIDTH - this.MARGIN])

            this.y_scale = d3.scaleLinear()
            .domain([min_statistic, max_statistic])
            .range([this.HEIGHT - this.MARGIN, this.MARGIN])

            this.x_axis.selectAll('g').remove()
            this.y_axis.selectAll('g').remove()

            this.x_axis = this.volcanoSvg.append('g').call(this.xAxis)
            this.y_axis = this.volcanoSvg.append('g').call(this.yAxis)

            this.line
            .append('line')
            .style("stroke", this.FDR_LINE_COLOR)
            .style("stroke-width", 2)
            .attr("x1", this.x_scale(-1*this.max_abs_fc)) 
            .attr("y1", this.y_scale(statistic_threshold))
            .attr("x2", this.x_scale(this.max_abs_fc))
            .attr("y2", this.y_scale(statistic_threshold)); 

            this.points
                .selectAll('circle')
                .data(selected_data)
                .enter()
                .append('circle')
                .attr('cx', (d)=> this.x_scale(d[logFC_col]))
                .attr('cy', (d)=> this.y_scale(d[statistic_name]))
                .style('fill', (d)=>{
                    if (selected_motif==="none"){
                        if(+d[this.max_rank_name] <= 5 & d[this.max_rank_name]!= ""){
                            return that.globalApplicationState.scaleColor(+d[this.max_rank_name])
                        }
                        else if (d["controls"] === "True"){
                            return this.CONTROL_CIRCLE_COLOR
                        }
                        else{
                            return this.CIRCLE_COLOR
                        }
                    }
                    else{
                        if(+d[this.max_rank_name] <= 5 & d[this.max_rank_name]!= ""){
                            return that.globalApplicationState.scaleColor(+d[this.max_rank_name])
                        }
                        return this.CIRCLE_COLOR
                    }
                })
                .attr('r', (d) =>{
                    if (selected_motif==="none"){
                        if (+d[this.max_rank_name] <= 5 & d[this.max_rank_name]!= ""){
                            return(this.TOP_5_RADIUS )
                        }
                        else{
                            return( this.ALL_OTHER_RADIUS )
                        }
                    }
                    else{
                        return(this.TOP_5_RADIUS)
                    }
                })
                .style('stroke', 'black')
                .style('stroke-width', this.DEFAULT_STROKE_WIDTH)
                .style('opacity', (d)=>{
                    if (selected_motif==="none"){
                        if(+d[this.max_rank_name] <= 5 & d[this.max_rank_name]!= ""){
                            return 1
                        }
                        else if (d["controls"] === "True"){
                            return .1
                        }
                        else{
                            return .5
                        }
                    }
                    else{
                        return that.TOP_5_OPACITY
                    }
                })
                .on("mouseover", (event, d) => {
                    d3.select(".tooltip")
                      .style("opacity", 1)
                      .html(d.architecture)
                      .style("left", `${event.pageX + 30}px`)
                      .style("top", `${event.pageY - 10}px`)
                  })
                  .on("mousemove", (event, d) => {
                    d3.select(".tooltip")
                      .style("left", `${event.pageX + 30}px`)
                      .style("top", `${event.pageY - 10}px`)
                  })
                  .on("mouseleave", (event, d) => {
                    d3.select(".tooltip").style("opacity", 0)
                    .style("left", "-300px")
                    .style("top", "-300px")
                  })
                  .on("click", (event, d) => {
                    that.info.click(d)
                  })
        }

        else{
            this.points
                .selectAll('circle')
                .remove()

            this.line
                .selectAll('line')
                .remove()
        }


    }

    check_negative_controls(redraw){
        if (this.globalApplicationState.controls_checked) {
            this.drawVolcano()
            this.points.selectAll("circle")
                .style("opacity", d => (d.controls === "True" ? 1 : 0))
                .filter(d => d.controls !== "True")
                .remove();
        } 
        else if (redraw) {
            this.drawVolcano()
        }
    }

    check_top_5(redraw){
        console.log("here")
        let max_rank_name = "maxRank__" +this.globalApplicationState.selected_comparison
        console.log("max_rank_name",max_rank_name)
        let n = d3.select('#number_selector').property("value") === "" ? 5 : d3.select('#number_selector').property("value")
        if (this.globalApplicationState.top_5_checked) {
            console.log("hereinside")
            this.drawVolcano()
            this.points.selectAll("circle")
                .filter(d => +d[max_rank_name] > n | d[max_rank_name] == "")
                .remove();
        } 
        else if (redraw) {
            this.drawVolcano()
        }
    }

   
    set_info(info){
        this.info = info
    }

    set_alpha(alpha){
        this.alpha = alpha
    }

 
   
}