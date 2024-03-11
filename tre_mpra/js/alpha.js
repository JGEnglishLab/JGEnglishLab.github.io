class Alpha{
    constructor(all_data,globalApplicationState,volcano, helper){


        //**********************************************************************************************
        //                                      CONSTANTS 
        //**********************************************************************************************
        this.WIDTH = 500 //550
        this.HEIGHT = 500
        this.MARGIN = 50
        this.DEFAULT_STROKE_WIDTH = .5
        this.TOP_5_OPACITY = 1
        this.CONTROL_OPACITY = .1
        this.ALL_OTHER_OPACITY=.5
        this.BRUSH_ON_OPACITY=1
        this.BRUSH_OFF_OPACITY=.1
        this.TOP_5_RADIUS = 4
        this.ALL_OTHER_RADIUS = 2.5
        this.CHILD_OFF_OPACITY = .3
        this.LEGEND_CIRCLE_CX = 510
        this.LEGEND_CIRCLE_CY = 130
        this.LEGEND_ROW_SEP = 30
        this.LEGEND_CIRCLE_R = 6.5
        this.LEGEND_RANK_X = 530
        this.LEGEND_RANK_Y = 135


        this.CIRCLE_COLOR = "grey"
        this.CONTROL_CIRCLE_COLOR = "#4c4c4c"

        //**********************************************************************************************
        //                                  GENERAL SET UP 
        //**********************************************************************************************
        this.globalApplicationState = globalApplicationState
        
        this.all_data = all_data
        this.h = helper
        this.show_anonymized_data = d3.select("#show_anonymous_conditions_condition_check").checked

        this.volcano = volcano
        this.alpha_div = d3.select("#alpha-div") 

        this.alphaSvg = this.alpha_div.append("svg")
        .attr('id', 'alpha_svg')
        .attr('width', this.WIDTH + 350)
        .attr('height', this.HEIGHT)

        this.selected_data = null

        this.alphaSvg.append("circle").attr("cx",this.LEGEND_CIRCLE_CX ).attr("cy",this.LEGEND_CIRCLE_CY + this.LEGEND_ROW_SEP * 0).attr("r", this.LEGEND_CIRCLE_R).attr("stroke", "black").style("fill", this.globalApplicationState.scaleColor(1))
        this.alphaSvg.append("circle").attr("cx",this.LEGEND_CIRCLE_CX ).attr("cy",this.LEGEND_CIRCLE_CY + this.LEGEND_ROW_SEP * 1).attr("r", this.LEGEND_CIRCLE_R).attr("stroke", "black").style("fill", this.globalApplicationState.scaleColor(2))
        this.alphaSvg.append("circle").attr("cx",this.LEGEND_CIRCLE_CX ).attr("cy",this.LEGEND_CIRCLE_CY + this.LEGEND_ROW_SEP * 2).attr("r", this.LEGEND_CIRCLE_R).attr("stroke", "black").style("fill", this.globalApplicationState.scaleColor(3))
        this.alphaSvg.append("circle").attr("cx",this.LEGEND_CIRCLE_CX ).attr("cy",this.LEGEND_CIRCLE_CY + this.LEGEND_ROW_SEP * 3).attr("r", this.LEGEND_CIRCLE_R).attr("stroke", "black").style("fill", this.globalApplicationState.scaleColor(4))
        this.alphaSvg.append("circle").attr("cx",this.LEGEND_CIRCLE_CX ).attr("cy",this.LEGEND_CIRCLE_CY + this.LEGEND_ROW_SEP * 4).attr("r", this.LEGEND_CIRCLE_R).attr("stroke", "black").style("fill", this.globalApplicationState.scaleColor(5))

        this.alphaSvg.append("text").attr("x",490).attr("y",90).text("Motif Ranking based on").style("font-size", "17px").attr("alignment-baseline","middle")
        this.alphaSvg.append("text").attr("x",490).attr("y",110).text("absolute Log 2 FC × LRT").style("font-size", "17px").attr("alignment-baseline","middle")

        this.alphaSvg.append("text").attr("id","legend1").attr("x",this.LEGEND_RANK_X).attr("y",this.LEGEND_RANK_Y + this.LEGEND_ROW_SEP * 0).text("1").style("font-size", "15px").attr("alignment-baseline","middle")
        this.alphaSvg.append("text").attr("id","legend2").attr("x",this.LEGEND_RANK_X).attr("y",this.LEGEND_RANK_Y + this.LEGEND_ROW_SEP * 1).text("2").style("font-size", "15px").attr("alignment-baseline","middle")
        this.alphaSvg.append("text").attr("id","legend3").attr("x",this.LEGEND_RANK_X).attr("y",this.LEGEND_RANK_Y + this.LEGEND_ROW_SEP * 2).text("3").style("font-size", "15px").attr("alignment-baseline","middle")
        this.alphaSvg.append("text").attr("id","legend4").attr("x",this.LEGEND_RANK_X).attr("y",this.LEGEND_RANK_Y + this.LEGEND_ROW_SEP * 3).text("4").style("font-size", "15px").attr("alignment-baseline","middle")
        this.alphaSvg.append("text").attr("id","legend5").attr("x",this.LEGEND_RANK_X).attr("y",this.LEGEND_RANK_Y + this.LEGEND_ROW_SEP * 4).text("5").style("font-size", "15px").attr("alignment-baseline","middle")


        this.searchBarStim = document.getElementById("searchBarStim");
        this.datalistStim = document.createElement("datalist");
        this.datalistStim.id = "searchOptionsStim";

        this.searchBarBase = document.getElementById("searchBarBase");
        this.datalistBase = document.createElement("datalist");
        this.datalistBase.id = "searchOptionsBase";

        //d3.selectAll('.child-div').style("opacity", this.CHILD_OFF_OPACITY) //.style("pointer-events", "none")

        //**********************************************************************************************
        //                                 SELECTORS
        //**********************************************************************************************

        //For getting unique values for base a stimulated
        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }
        
        this.baseMap = new Map();
        this.stimMap = new Map();

        this.bases = []
        this.stims = []

        for (let i = 0; i < this.globalApplicationState.base_treatments.length; i++) {

            // Ids used in the global application state maps for mapping short names to long names and visa versa
            let base_id = this.globalApplicationState.base_treatments[i] + "||" + this.globalApplicationState.base_runs[i]
            let stim_id = this.globalApplicationState.stim_treatments[i] + "||" + this.globalApplicationState.stim_runs[i]

            let curBase = this.globalApplicationState.display_name_map.get(base_id)
            let curStim = this.globalApplicationState.display_name_map.get(stim_id)

            this.stims.push(curStim)
            this.bases.push(curBase)

            // If its already in map just push it
            if (this.baseMap.get(curBase) != undefined){
                this.baseMap.get(curBase).push(curStim)
            }else{
                this.baseMap.set(curBase, [curStim])
            }

            if (this.stimMap.get(curStim) != undefined){
                this.stimMap.get(curStim).push(curBase)
            }else{
                this.stimMap.set(curStim, [curBase])
            }
        }


      

        this.bases = this.bases.filter(onlyUnique)
        this.stims = this.stims.filter(onlyUnique)

        this.updateSearchOptions(this.bases, "base")
        this.updateSearchOptions(this.stims, "stim")



        
        //*************************************** 
        // Add listeners
        //***************************************

        const that = this

        //listeners
        //on change, update the other options
        //on click clear current selection for the one you clicked


        document.getElementById('searchBarStim').addEventListener('change', function(){
            var selectedOption = d3.select(this).property("value")
            that.globalApplicationState.stimulated = selectedOption
            that.drawAlphaScatter()
            that.volcano.drawVolcano()
            if (document.getElementById('searchBarBase').value === ""){
            that.filter_options(that.globalApplicationState.stimulated, "stim")
            }
            d3.select("#control_check").property('checked', false)
            d3.select("#top_check").property('checked', false)
            d3.select("#filter_motif_check").property('checked', false)
            that.globalApplicationState.selected_motif = "none"
            that.info.updateSearchOptions()

            })

        document.getElementById('searchBarStim').addEventListener('mousedown', function(event){
            if (event.target === this && this.value != ""){
                
                document.getElementById('searchBarBase').value = '';
                document.getElementById('searchBarStim').value = '';
                that.updateSearchOptions(that.bases, "base")
                that.updateSearchOptions(that.stims, "stim")


                that.globalApplicationState.stimulated = null
                that.globalApplicationState.base = null


                that.drawAlphaScatter()
                that.volcano.drawVolcano()

                d3.select("#control_check").property('checked', false)
                d3.select("#top_check").property('checked', false)
                d3.select("#filter_motif_check").property('checked', false)
                that.globalApplicationState.selected_motif = "none"
                that.info.updateSearchOptions()

            }
        })

        document.getElementById('searchBarBase').addEventListener('change', function(){

            var selectedOption = d3.select(this).property("value")
            that.globalApplicationState.base = selectedOption

          
            that.drawAlphaScatter()
            that.volcano.drawVolcano()
            if (document.getElementById('searchBarStim').value === ""){

            that.filter_options(that.globalApplicationState.base, "base")
            }
            d3.select("#control_check").property('checked', false)
            d3.select("#top_check").property('checked', false)
            d3.select("#filter_motif_check").property('checked', false)
            that.globalApplicationState.selected_motif = "none"
            that.info.updateSearchOptions()

        })

        document.getElementById('searchBarBase').addEventListener('mousedown', function(event){

            if (event.target === this && this.value != ""){

                document.getElementById('searchBarBase').value = '';
                document.getElementById('searchBarStim').value = '';
                that.updateSearchOptions(that.bases, "base")
                that.updateSearchOptions(that.stims, "stim")
                that.globalApplicationState.base = null
                that.globalApplicationState.stimulated = null

                that.drawAlphaScatter()
                that.volcano.drawVolcano()
                d3.select("#control_check").property('checked', false)
                d3.select("#top_check").property('checked', false)
                d3.select("#filter_motif_check").property('checked', false)
                that.globalApplicationState.selected_motif = "none"
                that.info.updateSearchOptions()


            }
        })

        d3.select("#show_anonymous_conditions_condition_check").on("change", function(){
            that.show_anonymized_data = this.checked
            that.updateSearchOptions(that.bases, "base")
            that.updateSearchOptions(that.stims, "stim")
            console.log(that.show_anonymized_data, that.show_anonymized_data)
            
        })
          

       
        //**********************************************************************************************
        //                                      INITIAL SCATTER
        //**********************************************************************************************

        //*************************************** 
        // Get inititial min and max for scales (Will change upon selection)
        //***************************************

        this.min = -.5
        this.max =  5

        this.x_scale = d3.scaleLinear()
        .domain([this.min, this.max]).nice()
        .range([this.MARGIN, this.WIDTH - this.MARGIN])
        this.y_scale = d3.scaleLinear()
        .domain([this.min, this.max]).nice()
        .range([this.HEIGHT - this.MARGIN, this.MARGIN])

        this.xAxis = g => g
        .attr("transform", `translate(0,${this.HEIGHT- this.MARGIN })`)
        .call(d3.axisBottom(this.x_scale))
        this.yAxis = g => g
        .attr("transform", `translate(${this.MARGIN },0)`)
        .call(d3.axisLeft(this.y_scale))

        this.x_axis = this.alphaSvg.append('g').call(this.xAxis)
        this.y_axis = this.alphaSvg.append('g').call(this.yAxis)


        this.alphaSvg
        .append("text")
        .attr("id", "base_text")
        .attr("transform","translate(" + this.WIDTH / 2 + " ," + (this.HEIGHT - 10) + ")")
        .style("text-anchor", "middle")
        .text("Basal Transcription Rate")
        .style('fill', '#6C4343');

        this.alphaSvg
        .append("text")
        .attr("id", "stim_text")
        .attr("transform", "rotate(-90)")
        .attr("y", 15)
        .attr("x",-(this.HEIGHT/2))
        .style("text-anchor", "middle")
        .text("Stimulated Transcription Rate")
        .style('fill', '#00429d');


        this.alphaSvg
            .append('line')
            .style("stroke", "grey")
            .style("stroke-width", 1)
            .attr("x1", this.x_scale(0))
            .attr("y1", this.y_scale(0))
            .attr("x2", this.x_scale(this.max))
            .attr("y2", this.y_scale(this.max))
            .attr("opacity", ".4") 

        this.points = this.alphaSvg.append('g')

        
    }



   



    filter_options(option, selected_searchbar){
        const that = this

        // If they cleared a selection. Restore all options
        if (option ===null && selected_searchbar === "base"){
            that.updateSearchOptions(that.stims, "stim")
        }
        else if (option === null && selected_searchbar === "stim"){
            that.updateSearchOptions(that.bases, "base")
        }

        else if (option != null && selected_searchbar === "stim"){

            // console.log("that.stimMap.get(option)", that.stimMap.get(option))
            that.updateSearchOptions(that.stimMap.get(option), "base")
        }
        else if (option != null && selected_searchbar === "base"){
            that.updateSearchOptions(that.baseMap.get(option), "stim")
        }
    }





    


    updateSearchOptions(options, selector) {
        console.log("Update search options")
        console.log("this.show_a _dataqa", this.show_anonymized_data)
        if (!this.show_anonymized_data){
            options = options.filter((d) => !d.includes("group_"))
        }
        const that = this
        if (selector === "stim"){
            var select = document.getElementById("searchBarStim");
            while (select.firstChild) {
                select.removeChild(select.firstChild);
            }


            let opt = document.createElement("option");
            opt.text = "--Please choose a stimulated treatment--";
            opt.value = "";
            select.add(opt);
            let all_tags = []
            // Get all unique tags
            options.forEach(function(option) {

                let id = that.globalApplicationState.display_name_map.revGet(option)
                let tag = that.globalApplicationState.tag_map.get(id)
                
                // if tag == ""{
                // tag = "Misc."
                //add a checker in the next loop
               // }

                if (!all_tags.includes(tag)){
                    all_tags.push(tag)
                }
            });

            //Pair all options with each tag
            all_tags.forEach(function(tag){
                var optgroup = document.createElement("optgroup");
                optgroup.label = tag;

                options.forEach(function(option){

                    let id = that.globalApplicationState.display_name_map.revGet(option)
                    let cur_tag = that.globalApplicationState.tag_map.get(id)
                    if (cur_tag === tag){
                        let opt = document.createElement("option");
                        opt.text = opt.value = option;    
                        
                        optgroup.appendChild(opt)
                    }
                })
                select.appendChild(optgroup);
            })

        }

        else if (selector === "base"){
        


            var select = document.getElementById("searchBarBase");



         
            while (select.firstChild) {
                select.removeChild(select.firstChild);
            }



            
            // // // Create a new option
            let opt = document.createElement("option");
            opt.text = "--Please choose a base treatment--";
            opt.value = "";
            select.add(opt);


            let all_tags = []
            // Get all unique tags
            options.forEach(function(option) {

                let id = that.globalApplicationState.display_name_map.revGet(option)
                let tag = that.globalApplicationState.tag_map.get(id)

                if (!all_tags.includes(tag)){
                    all_tags.push(tag)
                }
            });


            //Pair all options with each tag
            all_tags.forEach(function(tag){
                var optgroup = document.createElement("optgroup");
                optgroup.label = tag;

                options.forEach(function(option){
                    let id = that.globalApplicationState.display_name_map.revGet(option)
                    let cur_tag = that.globalApplicationState.tag_map.get(id)
                    
                    if (cur_tag === tag){
                        let opt = document.createElement("option");
                        opt.text = opt.value = option;     
                        optgroup.appendChild(opt)
                    }
                })
                select.appendChild(optgroup);
            })
        

        }
     
    }
    
    drawAlphaScatter(selected_motif = "none"){


        if (this.globalApplicationState.base != null && this.globalApplicationState.stimulated != null){

            //d3.selectAll('.child-div').style("opacity", "1")//.style("pointer-events", "all")
            //Remove everything before drawing again
            this.points
                .selectAll('circle')
                .remove()

            let base_display_name = this.globalApplicationState.base
            let stim_display_name = this.globalApplicationState.stimulated

         
            let base_id = this.globalApplicationState.display_name_map.revGet(base_display_name)
            let stim_id = this.globalApplicationState.display_name_map.revGet(stim_display_name)

            let base_run = base_id.split("||")[1]
            let base_treatment = base_id.split("||")[0]

            let stim_run = stim_id.split("||")[1]
            let stim_treatment = stim_id.split("||")[0]
           
            this.stim_name = "aggregate_rpm_ratio__"+stim_treatment+"__"+stim_run
            this.base_name = "aggregate_rpm_ratio__"+base_treatment+"__"+base_run
            this.max_rank_name = "maxRank__" +base_treatment+"__"+base_run+"_vs_"+stim_treatment+"__"+stim_run
            this.n_rna_stim_name = "RNA_barcodes__" +stim_treatment+"__"+stim_run
            this.n_rna_base_name = "RNA_barcodes__" +base_treatment+"__"+base_run

            d3.select("#base_text").text("Basal Transcription Rate: "+base_display_name.split("(")[0])
            d3.select("#stim_text").text("Stimulated Transcription Rate: "+stim_display_name.split("(")[0])

            this.globalApplicationState.selected_comparison = base_treatment+"__"+base_run+"_vs_"+stim_treatment+"__"+stim_run

            const that = this

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
            this.globalApplicationState.motifs = filter_res[1]

            let max_base =  d3.max(selected_data.map(d => +d[this.base_name]))
            let max_stim =  d3.max(selected_data.map(d => +d[this.stim_name]))

            let max = d3.max([max_base, max_stim])        
            this.x_scale = d3.scaleLinear()
            .domain([this.min, max]).nice()
            .range([this.MARGIN, this.WIDTH - this.MARGIN])

            this.y_scale = d3.scaleLinear()
            .domain([this.min, max]).nice()
            .range([this.HEIGHT - this.MARGIN , this.MARGIN])

            this.x_axis.selectAll('g').remove()
            this.y_axis.selectAll('g').remove()

            this.x_axis = this.alphaSvg.append('g').call(this.xAxis)
            this.y_axis = this.alphaSvg.append('g').call(this.yAxis)


            //Add the names of the top 5 to the legend if applicable
            let top_5_motifs = selected_data.filter((d)=> +d[this.max_rank_name]<=5)
            top_5_motifs = top_5_motifs.filter((d)=> d[this.max_rank_name]!="")

            let top_5_map = new Map()
            top_5_motifs.forEach(function(item) {
                let m  = item["motif"]
                let r = item[that.max_rank_name]
                top_5_map.set(r, m);
            });
            
            this.alphaSvg.select("#legend1").text(top_5_map.get("1.0") ? "1: " + top_5_map.get("1.0"):"1: None")
            this.alphaSvg.select("#legend2").text(top_5_map.get("2.0") ? "2: " + top_5_map.get("2.0"):"2: None")
            this.alphaSvg.select("#legend3").text(top_5_map.get("3.0") ? "3: " + top_5_map.get("3.0"):"3: None")
            this.alphaSvg.select("#legend4").text(top_5_map.get("4.0") ? "4: " + top_5_map.get("4.0"):"4: None")
            this.alphaSvg.select("#legend5").text(top_5_map.get("5.0") ? "5: " + top_5_map.get("5.0"):"5: None")

            this.points
                .selectAll('circle')
                .data(selected_data)
                .enter()
                .append('circle')
                .attr('cx', (d)=> this.x_scale(d[this.base_name]))
                .attr('cy', (d)=> this.y_scale(d[this.stim_name]))
                .attr('r', (d) =>{
                    if (selected_motif=="none"){
                        if (+d[that.max_rank_name] <= 5 & d[that.max_rank_name]!= ""){
                            return(this.TOP_5_RADIUS)
                        }
                        else{
                            return(this.ALL_OTHER_RADIUS )
                        }
                    }
                    else{
                        return(this.TOP_5_RADIUS)
                    }
                })
                .style('fill', (d)=>{
                    if (selected_motif=="none"){
                        if(+d[that.max_rank_name] <= 5 & d[that.max_rank_name]!= ""){
                            return that.globalApplicationState.scaleColor(+d[that.max_rank_name])
                        }
                        else if (d["controls"] === "True"){
                            return this.CONTROL_CIRCLE_COLOR
                        }
                        else{
                            return this.CIRCLE_COLOR
                        }
                    }
                    else{
                        if(+d[that.max_rank_name] <= 5 & d[that.max_rank_name]!= ""){
                            return that.globalApplicationState.scaleColor(+d[that.max_rank_name])
                        }
                        return this.CIRCLE_COLOR
                    }
                })
                .style('stroke', 'black')
                .style('stroke-width', this.DEFAULT_STROKE_WIDTH)
                .style('opacity', (d)=>{
                    if (selected_motif=="none"){
                        if(+d[that.max_rank_name] <= 5 & d[that.max_rank_name]!= ""){
                            return that.TOP_5_OPACITY
                        }
                        else if (d["controls"] === "True"){
                            return that.CONTROL_OPACITY
                        }
                        else{
                            return that.ALL_OTHER_OPACITY
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
                    d3.select(".tooltip")
                    .style("opacity", 0)
                    .style("left", "-300px")
                    .style("top", "-300px")
                  })
                  .on("click", (event, d) => {
                    that.info.click(d)
                  })


        

            
        }

        else{
            //d3.selectAll('.child-div').style("opacity", this.CHILD_OFF_OPACITY).style("pointer-events", "none")

            this.alphaSvg.select("#legend1").text("1")
            this.alphaSvg.select("#legend2").text("2")
            this.alphaSvg.select("#legend3").text("3")
            this.alphaSvg.select("#legend4").text("4")
            this.alphaSvg.select("#legend5").text("5")


            this.globalApplicationState.selected_comparison = "none"
            this.points
                .selectAll('circle')
                .remove()
            d3.select("#base_text").text("Basal Transcription Rate")
            d3.select("#stim_text").text("Stimulated Transcription Rate")
            this.info.clear()
        }



    }

      

    

    check_negative_controls(redraw){
        if (this.globalApplicationState.controls_checked) {
            d3.select("#top_check").property('checked', false)
            d3.select("#filter_motif_check").property('checked', false)

            this.drawAlphaScatter()
            this.points.selectAll("circle")
                .style("opacity", d => (d.controls === "True" ? 1 : 0))
                .filter(d => d.controls !== "True")
                .remove();
        } 
        else if (redraw) {
            this.drawAlphaScatter()
        }
    }

    check_top_5(redraw){
        let max_rank_name = "maxRank__" +this.globalApplicationState.selected_comparison
        let n = d3.select('#number_selector').property("value") === "" ? 5 : d3.select('#number_selector').property("value")
        if (this.globalApplicationState.top_5_checked) {
            this.drawAlphaScatter()
            this.points.selectAll("circle")
                .filter(d => +d[max_rank_name] > n | d[max_rank_name] == "")
                .remove();
        } 
        else if (redraw)  {
            this.drawAlphaScatter()
        }
    }

    set_info(info){
        this.info = info
    }
       
   
}