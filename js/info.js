class Info{
    constructor(all_data,sequence_data, globalApplicationState,volcano,alpha,h){

        //**********************************************************************************************
        //                                  CONSTANTS FOR CHART SIZE
        //**********************************************************************************************
        this.WIDTH = 800
        this.HEIGHT = 300
        this.NUM_DEC = 2
        this.MARGIN_TEXT_LEFT = 25
        this.MARGIN_TEXT_TOP = 15
        this.MARGIN_BETWEEN_TEXT = 25
        this.TOOL_TIP_TIME_OUT = 500
        this.TOOL_TIP_DELAY = 1000

        this.BASE_COLOR = "#6C4343"
        this.STIM_COLOR = "#00429d"
        
        this.SLIDER_MARGIN_LEFT = 25
        this.RNA_SLIDER_TRANSLATE = 155
        this.DNA_SLIDER_TRANSLATE = 250
        this.SLIDER_HANDLE_R = 4
        this.SLIDER_HANDLE_TRANSLATE = 8
        this.SHIFT_SLIDER_LABEL_RIGHT = 315
        this.SHIFT_STIM_LABEL_UP = -10
        this.SHIFT_BASE_LABEL_DOWN = 15
        this.SHIFT_HANDLE_TEXT_LEFT = -15
        this.SHIFT_HANDLE_TEXT_DOWN = 5

        this.SLIDER_LABEL_FONT_SIZE = "10px"
        this.SLIDER_BARCODE_N_FONT_SIZE = "11px"

        this.globalApplicationState = globalApplicationState
        this.all_data = all_data
        this.sequence_data = sequence_data

        this.alpha = alpha
        this.volcano = volcano
        this.info_div = d3.select("#info-div") 
        this.selected_architecture = "none"

        this.searchBar = document.getElementById("searchBar");
        this.datalist = document.createElement("datalist");
        this.datalist.id = "searchOptions";

        document.getElementById('searchBar').value = '';
        document.getElementById('searchBarBase').value = '';
        document.getElementById('searchBarStim').value = '';


        this.infoSvg = this.info_div.append("svg")
        .attr('id', 'info_svg')
        .attr('width', this.WIDTH)
        .attr('height', this.HEIGHT)

        this.infoSvg.append("text")
        .attr("id", "architecture_text")
        .attr("y", this.MARGIN_TEXT_TOP + this.MARGIN_BETWEEN_TEXT * 0)
        .attr("x", this.MARGIN_TEXT_LEFT)
        .text("Architecture: ")

        this.infoSvg.append("text")
        .attr("id", "fc_text")
        .attr("y", this.MARGIN_TEXT_TOP + this.MARGIN_BETWEEN_TEXT * 1)
        .attr("x", this.MARGIN_TEXT_LEFT)
        .text("Log Fold Change: ")

        this.infoSvg.append("text")
        .attr("id", "fdr_text")
        .attr("y", this.MARGIN_TEXT_TOP + this.MARGIN_BETWEEN_TEXT * 2)
        .attr("x", this.MARGIN_TEXT_LEFT)
        .text("FDR: ")

        this.infoSvg.append("text")
        .attr("id", "stimulated_text")
        .attr("y", this.MARGIN_TEXT_TOP + this.MARGIN_BETWEEN_TEXT * 3)
        .attr("x", this.MARGIN_TEXT_LEFT)
        .text("Stimulated Alpha: ")
        .style('fill', this.STIM_COLOR)

        this.infoSvg.append("text")
        .attr("id", "basal_text")
        .attr("y", this.MARGIN_TEXT_TOP + this.MARGIN_BETWEEN_TEXT * 4)
        .attr("x", this.MARGIN_TEXT_LEFT)
        .text("Basal Alpha: ")
        .style('fill', this.BASE_COLOR)

        var treatment_info = this.infoSvg
        .append("g")
        .attr("id", "treatment_info_g")
        .attr("transform", `translate(${500},${220})`);
        
        treatment_info.append("rect")
        .attr("id", "treatment_info_rect")
        .attr("width", 250)
        .attr("height", 40)
        .attr("fill", "rgb(84, 90, 107)")
        .attr("rx", 5)
        .attr("ry", 5)

        treatment_info.append("text")
        .html("Scroll over to see treatment information")
        .attr("y", 25)
        .attr("x", 125)
        .attr("text-anchor", "middle") 
        .attr("font-size", "11px")
        .style('fill', 'white')
        .attr("font-weight", "bold")




        // Create a scale for the slider
        this.barcode_scale = d3.scaleLinear()
            .domain([0, 100]) 
            .range([0, 300]);

        var slider_rna = this.infoSvg
            .append("g")
            .attr("transform", `translate(${this.SLIDER_MARGIN_LEFT},${this.RNA_SLIDER_TRANSLATE})`);

        var rna_slider_text = slider_rna.append("text")
            .attr("x", this.SHIFT_HANDLE_TEXT_LEFT) 
            .attr("y", this.SHIFT_HANDLE_TEXT_DOWN)
            .attr("text-anchor", "middle") 
            .attr("font-size",this.SLIDER_BARCODE_N_FONT_SIZE) 


        var rna_labels = this.infoSvg
            .append("g")
            .attr("transform", `translate(${this.SLIDER_MARGIN_LEFT},${this.RNA_SLIDER_TRANSLATE})`);

        rna_labels.append("text")
        .attr("y", this.SHIFT_BASE_LABEL_DOWN)
        .attr("x", this.SHIFT_SLIDER_LABEL_RIGHT)
        .text("RNA Basal Barcodes")
        .attr("text-anchor", "left") 
        .style("font-size", this.SLIDER_LABEL_FONT_SIZE)
        .attr("fill", this.BASE_COLOR)

        rna_labels.append("text")
        .attr("y", this.SHIFT_STIM_LABEL_UP)
        .attr("x", this.SHIFT_SLIDER_LABEL_RIGHT)
        .text("RNA Stimulated Barcodes")
        .attr("text-anchor", "left") 
        .style("font-size", this.SLIDER_LABEL_FONT_SIZE)
        .attr("fill", this.STIM_COLOR)


        // G's for the text displaying number of barcodes
        this.rna_text = this.infoSvg
            .append("g")
            .attr("transform", `translate(${this.SLIDER_MARGIN_LEFT},${this.RNA_SLIDER_TRANSLATE})`);
        
        
        slider_rna.append("line")
            .attr("class", "track")
            .attr("x1", this.barcode_scale.range()[0])
            .attr("x2", this.barcode_scale.range()[1])
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-inset")
       
        var handle_rna = slider_rna.insert("circle")
            .attr("class", "handle")
            .attr("r", this.SLIDER_HANDLE_R )
            .attr("cx", this.SLIDER_HANDLE_TRANSLATE)

        var drag_rna = d3.drag()
            .on("start", function() {
                handle_rna.raise().classed("active", true);
                handle_rna.style("cursor", "grab")
            })
            .on("drag", function(event) {
                var xPos = event.x;
                xPos = Math.max(0, Math.min(that.barcode_scale.range()[1], xPos-that.SLIDER_MARGIN_LEFT));
                handle_rna.attr("cx", xPos);
                var sliderValue = that.barcode_scale.invert(xPos);
                rna_slider_text.text(Math.ceil(sliderValue)); 
                that.globalApplicationState.min_RNA = sliderValue
            })
            .on("end", function() {
                d3.select(this).classed("active", false);
                rna_slider_text.text("");
                that.alpha.drawAlphaScatter(that.globalApplicationState.selected_motif)
                that.volcano.drawVolcano(that.globalApplicationState.selected_motif)
                that.alpha.check_negative_controls(false)
                that.volcano.check_negative_controls(false)
                that.alpha.check_top_5(false)
                that.volcano.check_top_5(false)

            });

        slider_rna.call(drag_rna);

        var slider_dna = this.infoSvg
            .append("g")
            .attr("transform", `translate(${this.SLIDER_MARGIN_LEFT},${this.DNA_SLIDER_TRANSLATE})`);

        var dna_slider_text = slider_dna.append("text")
            .attr("x", this.SHIFT_HANDLE_TEXT_LEFT) 
            .attr("y", this.SHIFT_HANDLE_TEXT_DOWN)
            .attr("text-anchor", "middle")
            .attr("font-size",this.SLIDER_BARCODE_N_FONT_SIZE) 

        var dna_labels = this.infoSvg
        .append("g")
        .attr("transform", `translate(${this.SLIDER_MARGIN_LEFT},${this.DNA_SLIDER_TRANSLATE})`);

        dna_labels.append("text")
        .attr("y", this.SHIFT_BASE_LABEL_DOWN)
        .attr("x", this.SHIFT_SLIDER_LABEL_RIGHT)
        .text("DNA Basal Barcodes")
        .attr("text-anchor", "left") 
        .style("font-size", this.SLIDER_LABEL_FONT_SIZE)
        .attr("fill", this.BASE_COLOR)

        dna_labels.append("text")
        .attr("y", this.SHIFT_STIM_LABEL_UP)
        .attr("x", this.SHIFT_SLIDER_LABEL_RIGHT)
        .text("DNA Stimulated Barcodes")
        .attr("text-anchor", "left") 
        .style("font-size", this.SLIDER_LABEL_FONT_SIZE)
        .attr("fill", this.STIM_COLOR)

        this.dna_text = this.infoSvg
            .append("g")
            .attr("transform", `translate(${this.SLIDER_MARGIN_LEFT},${this.DNA_SLIDER_TRANSLATE})`);
    
    
        slider_dna.append("line")
            .attr("class", "track")
            .attr("x1", this.barcode_scale.range()[0])
            .attr("x2", this.barcode_scale.range()[1])
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-inset")

        var handle_dna = slider_dna.insert("circle")
            .attr("class", "handle")
            .attr("r", this.SLIDER_HANDLE_R)
            .attr("cx", this.SLIDER_HANDLE_TRANSLATE)
            
        var drag_dna = d3.drag()
            .on("start", function() {
                handle_dna.raise().classed("active", true);
                handle_dna.style("cursor", "grab")
            })
            .on("drag", function(event) {
                var xPos = event.x;
                xPos = Math.max(0, Math.min(that.barcode_scale.range()[1], xPos-that.SLIDER_MARGIN_LEFT));
                handle_dna.attr("cx", xPos);
                var sliderValue = that.barcode_scale.invert(xPos);
                dna_slider_text.text(Math.ceil(sliderValue)); 

                that.globalApplicationState.min_DNA = sliderValue
            })
            .on("end", function() {
                d3.select(this).classed("active", false);
                dna_slider_text.text(""); 
                that.alpha.drawAlphaScatter(that.globalApplicationState.selected_motif)
                that.volcano.drawVolcano(that.globalApplicationState.selected_motif)
                that.alpha.check_negative_controls(false)
                that.volcano.check_negative_controls(false)
                that.alpha.check_top_5(false)
                that.volcano.check_top_5(false)


            });

        slider_dna.call(drag_dna);

        var numTicks = 10; // You can adjust this based on your needs
        var tickSpacing = 10; // Adjust this based on your data

        // Create the scale group
        var sliderScale = this.infoSvg
        .append("g")
        .attr("transform", `translate(${this.SLIDER_MARGIN_LEFT},${this.RNA_SLIDER_TRANSLATE})`);

        // Generate tick marks using a loop
        for (var i = 0; i <= numTicks; i++) {
            var xPos = this.barcode_scale(i * tickSpacing);

            sliderScale.append("line")
                .attr("x1", xPos)
                .attr("x2", xPos)
                .attr("y1", 20)
                .attr("y2", this.DNA_SLIDER_TRANSLATE - this.RNA_SLIDER_TRANSLATE - 20)
                .style("stroke", "white")
                .style("stroke-width", "2px")

            sliderScale.append("text")
                .attr("x", xPos)
                .attr("y", (this.DNA_SLIDER_TRANSLATE - this.RNA_SLIDER_TRANSLATE)/2)
                .attr("text-anchor", "middle") // Center the text horizontally
                .text(i*tickSpacing)
                .style("font-size", "12px")

        }

        const that = this

        document.getElementById("filter_motif_check").addEventListener("change", function() {
            const isChecked = d3.select(this).property("checked");
            if (isChecked){
                let selected_motif = that.searchBar.value
                that.globalApplicationState.selected_motif = selected_motif
                that.alpha.drawAlphaScatter(selected_motif)
                that.volcano.drawVolcano(selected_motif)
                d3.select("#control_check").property('checked', false)
                d3.select("#top_check").property('checked', false)
                that.globalApplicationState.top_5_checked = false
                that.globalApplicationState.controls_checked = false

            }
            else{
                that.globalApplicationState.selected_motif = "none"
                that.alpha.drawAlphaScatter()
                that.volcano.drawVolcano()
            }
        });

        document.getElementById("show_button").addEventListener("click", function() {
            that.alpha.drawAlphaScatter()
            that.volcano.drawVolcano()
            that.globalApplicationState.selected_motif = "none"
            d3.select("#control_check").property('checked', false)
            d3.select("#top_check").property('checked', false)
            d3.select("#filter_motif_check").property('checked', false)
            that.globalApplicationState.top_5_checked = false
            that.globalApplicationState.controls_checked = false
        });

        document.getElementById("copy-button").addEventListener("click", function(event) {
            that.copyClicked(event, "sequence")
            setTimeout(() => {
                d3.select(".info-tooltip").style("opacity", 0);
              }, that.TOOL_TIP_TIME_OUT)
        });

        document.getElementById('control_check').addEventListener('change', function(){
            that.globalApplicationState.controls_checked = d3.select(this).property("checked")
            if (that.globalApplicationState.controls_checked){
                d3.select("#top_check").property('checked', false)
                d3.select("#filter_motif_check").property('checked', false)
                that.globalApplicationState.top_5_checked = false
                that.globalApplicationState.selected_motif = "none"

            }
            that.alpha.check_negative_controls(true)
            that.volcano.check_negative_controls(true)
        });

        document.getElementById('top_check').addEventListener('change', function(){
            console.log("here")
            that.globalApplicationState.top_5_checked = d3.select(this).property("checked")

            console.log("that.globalApplicationState.top_5_checked", that.globalApplicationState.top_5_checked)
            console.log("control_checked", d3.select("#control_check").property("checked"))
            console.log("motif_checked", d3.select("#filter_motif_check").property("checked"))

            if (that.globalApplicationState.top_5_checked){
                d3.select("#control_check").property('checked', false)
                d3.select("#filter_motif_check").property('checked', false)
                that.globalApplicationState.controls_checked = false
                that.globalApplicationState.selected_motif = "none"

            }
            that.alpha.check_top_5(true)
            that.volcano.check_top_5(true)
        });

          document.getElementById('number_selector').addEventListener('change', function(){
            that.alpha.check_top_5()
            that.volcano.check_top_5()
          });






        


        document.getElementById("copy-button-top").addEventListener("click", function(event) {
            that.copyClicked(event, "primer_top")
            setTimeout(() => {
                d3.select(".info-tooltip").style("opacity", 0);
              }, that.TOOL_TIP_TIME_OUT)
        });

        document.getElementById("copy-button-bottom").addEventListener("click", function(event) {
            that.copyClicked(event, "primer_bottom")
            setTimeout(() => {
                d3.select(".info-tooltip").style("opacity", 0);
              }, that.TOOL_TIP_TIME_OUT)
        });

        document.getElementById('searchBar').addEventListener('click', function(){
            document.getElementById('searchBar').value = '';
        })

        
        //***********************************************************************
        //                       Add tool tips for each button/component
        //***********************************************************************        
        
        d3.select('#treatment_info_g').on("mouseover", (event, d) => {
            d3.select(".tooltip")
                .html(d=>{
                    if(that.globalApplicationState.selected_comparison != "none"){

                        let [base_id, stim_id] = that.globalApplicationState.selected_comparison.split("_vs_")
                        base_id = base_id.replace("__", "||")
                        stim_id = stim_id.replace("__", "||")
                        
                       
                        let base_time = that.globalApplicationState.time_map.get(base_id)
                        let stim_time = that.globalApplicationState.time_map.get(stim_id)

                        let base_cell = that.globalApplicationState.cell_map.get(base_id)
                        let stim_cell = that.globalApplicationState.cell_map.get(stim_id)
                        let base_con = that.globalApplicationState.concentration_map.get(base_id)
                        let stim_con = that.globalApplicationState.concentration_map.get(stim_id)
                        let base_name = that.globalApplicationState.display_name_map.get(base_id).split("\t(")[0]
                        let stim_name = that.globalApplicationState.display_name_map.get(stim_id).split("\t(")[0]
                                
                        return(`<pre>${base_name}<br>\ttime: ${base_time}<br>\tconcentration: ${base_con}<br>\tcell type: ${base_cell}<br><br>${stim_name}<br>\ttime: ${stim_time}<br>\tconcentration: ${stim_con}<br>\tcell type: ${stim_cell}`)
                    }
                    return ("Select a Basal and Stimulated condition")
                })
                .style("left", "700px")
                .style("top", "475px")
                .transition()
                .delay(0)
                .style("opacity", 1)
          })

          .on("mouseleave", (event, d) => {
            d3.select(".tooltip")
            .style("opacity", 0)
            .style("left", "-300px")
            .style("top", "-300px")
          })

        d3.selectAll('.control_check_group').on("mouseover", (event, d) => {
            d3.select(".tooltip")
                .html("Toggle on to see negative controls.<br><br>Negative controls include <br>Spacer and Scramble architectures.")
                .style("left", `${event.pageX +30}px`)
                .style("top", `${event.pageY - 80}px`)
                .transition()
                .delay(this.TOOL_TIP_DELAY)
                .style("opacity", 1)
          })
          .on("mousemove", (event, d) => {
            d3.select(".tooltip")
              .style("left", `${event.pageX  +30}px`)

              .style("top", `${event.pageY - 80}px`)
          })
          .on("mouseleave", (event, d) => {
            d3.select(".tooltip")
            .style("opacity", 0)
            .style("left", "-300px")
            .style("top", "-300px")
          })

        d3.selectAll('.top_check_group').on("mouseover", (event, d) => {
            d3.select(".tooltip")
                .html("Toggle on to see top N motifs.<br><br>The top group had the motif with the<br>highest absolute log fold change.\
                <br>The second group had the motif with the<br>second highest absolute log fold change. \
                <br>etc.")
                .style("left", `${event.pageX +30}px`)
                .style("top", `${event.pageY - 10}px`)
                .transition()
                .delay(this.TOOL_TIP_DELAY)
                .style("opacity", 1)
          })
          .on("mousemove", (event, d) => {
            d3.select(".tooltip")
              .style("left", `${event.pageX +30}px`)
              .style("top", `${event.pageY - 10}px`)
          })
          .on("mouseleave", (event, d) => {
            d3.select(".tooltip")
            .style("opacity", 0)
            .style("left", "-300px")
            .style("top", "-300px")
          })

        d3.select('#copy-button').on("mouseover", (event, d) => {
            d3.select(".tooltip")
                .html("Click to copy the TRE unit sequence. <br>The sequence does not include the promoter. ")
                .style("left", `${event.pageX + 30}px`)
                .style("top", `${event.pageY - 10}px`)
                .transition()
                .delay(this.TOOL_TIP_DELAY)
                .style("opacity", 1)
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

          d3.select('#copy-button').on("mouseover", (event, d) => {
            d3.select(".tooltip")
                .html("Click to copy the TRE unit sequence. <br>The sequence does not include the promoter. ")
                .style("left", `${event.pageX + 30}px`)
                .style("top", `${event.pageY - 60}px`)
                .transition()
                .delay(this.TOOL_TIP_DELAY)
                .style("opacity", 1)
          })
          .on("mousemove", (event, d) => {
            d3.select(".tooltip")
              .style("left", `${event.pageX + 30}px`)
              .style("top", `${event.pageY - 60}px`)
          })
          .on("mouseleave", (event, d) => {
            d3.select(".tooltip")
            .style("opacity", 0)
            .style("left", "-300px")
            .style("top", "-300px")
          })


          d3.selectAll('.oligo_group').on("mouseover", (event, d) => {
            d3.select(".tooltip")
                .html("Click to copy the oligonucleotide sequence for <br>cloning into TRE pGL4.R plasmids")
                .style("left", `${event.pageX + 30}px`)
                .style("top", `${event.pageY - 60}px`)
                .transition()
                .delay(this.TOOL_TIP_DELAY)
                .style("opacity", 1)
          })
          .on("mousemove", (event, d) => {
            d3.select(".tooltip")
              .style("left", `${event.pageX + 30}px`)
              .style("top", `${event.pageY - 60}px`)
          })
          .on("mouseleave", (event, d) => {
            d3.select(".tooltip")
            .style("opacity", 0)
            .style("left", "-300px")
            .style("top", "-300px")
          })

    }

    showTooltip(text, x, y) {
        const tooltip = d3.select(".info-tooltip");
        tooltip.style("opacity", 1)
          .html(text)
          .style("left", `20px`)
          .style("top", `250px`);
      }

    copyClicked(event, type){
        let textToCopy = ""
        let tooltipText = ""
        if (this.selected_architecture === "none"){
            textToCopy = "No Architecture Selected"
            tooltipText = "No Architecture Selected";
        }
        else{
            let motif = this.selected_architecture.split(",")[0]
            let spacer = this.selected_architecture.split(",")[1]
            let scramble = this.selected_architecture.split(",")[2]
            let architecture = motif + ","+ spacer + "," + scramble
            let selected_architecture = this.sequence_data.filter(function(d){return d.architecture=== architecture;})

    
            if (selected_architecture.length != 1){
                textToCopy = "Unable to copy sequence"
                tooltipText = "Error: Invalid Architecture";
            }
            else{
                textToCopy = this.sequence_data.filter(function(d){return d.architecture=== architecture;})[0][type]
                tooltipText = "Copied";

            }
        }
        const that = this
        navigator.clipboard.writeText(textToCopy).then(function() {
            console.log("Text copied!");
            that.showTooltip(tooltipText);
        }, function(err) {
            that.showTooltip("Error: Unable to Copy", event.pageX, event.pageY);
            console.error("Unable to copy text: ", err);
        });
    }

    
   updateSearchOptions() {
    const that = this
    let options = []
    if (this.globalApplicationState.base != null && this.globalApplicationState.stimulated != null){

        //Get options as []
        options = this.globalApplicationState.motifs

        }
    else{
        options = []
        this.searchBar.value = ""

    }

    // Clear existing options
    while (this.datalist.firstChild) {
        this.datalist.removeChild(this.datalist.firstChild);
    }

    // Add new options
    options.forEach(function(option) {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        that.datalist.appendChild(optionElement);
    });

    this.searchBar.appendChild(this.datalist);  

    }

    click(row){
        let fc_name = "logFC__" + this.globalApplicationState.selected_comparison
        let fdr_name = "fdr__" + this.globalApplicationState.selected_comparison
        let base_treatment = this.globalApplicationState.selected_comparison.split("_vs_")[0].split("__")[0]
        let base_run = this.globalApplicationState.selected_comparison.split("_vs_")[0].split("__")[1]
        let stim_treatment = this.globalApplicationState.selected_comparison.split("_vs_")[1].split("__")[0]
        let stim_run = this.globalApplicationState.selected_comparison.split("_vs_")[1].split("__")[1]
        let base_alpha_name = "alpha__" + base_treatment + "__" + base_run
        let stim_alpha_name = "alpha__" + stim_treatment + "__" + stim_run

        let n_rna_stim_name = "RNA_barcodes__" +stim_treatment+"__"+stim_run
        let n_rna_base_name = "RNA_barcodes__" +base_treatment+"__"+base_run
        let n_dna_stim_name = "DNA_barcodes__" +stim_treatment+"__"+stim_run
        let n_dna_base_name = "DNA_barcodes__" +base_treatment+"__"+base_run

        this.draw_barcode_n(row[n_rna_stim_name], row[n_rna_base_name], row[n_dna_stim_name], row[n_dna_base_name] )

        this.globalApplicationState.selected_motif = row.architecture.split(":")[0]
        this.searchBar.value = row.architecture.split(":")[0]
        
        this.infoSvg.select("#architecture_text").text("Architecture: " + row.architecture)
        // this.infoSvg.select("#fdr_text").text("FDR: " + (+row[fdr_name]).toFixed(this.NUM_DEC))
        this.infoSvg.select("#fdr_text").text("FDR: " + (+row[fdr_name]))

        this.infoSvg.select("#fc_text").text("Log Fold Change: " + (+row[fc_name]).toFixed(this.NUM_DEC))
        this.infoSvg.select("#basal_text").text("Basal Alpha: " + (+row[base_alpha_name]).toFixed(this.NUM_DEC))
        this.infoSvg.select("#stimulated_text").text("Stimulated Alpha: " + (+row[stim_alpha_name]).toFixed(this.NUM_DEC))
        this.selected_architecture = row.architecture
    }

    clear(){
        this.infoSvg.select("#architecture_text").text("Architecture: ")
        this.infoSvg.select("#fdr_text").text("FDR: ")
        this.infoSvg.select("#fc_text").text("Log Fold Change: ")
        this.infoSvg.select("#basal_text").text("Basal Alpha: ")
        this.infoSvg.select("#stimulated_text").text("Stimulated Alpha: ")
        this.selected_architecture = "none"
        this.rna_text.selectAll("text").remove()
        this.dna_text.selectAll("text").remove()
    }

    draw_barcode_n(n_rna_stim, n_rna_base,n_dna_stim, n_dna_base){
 
        // this.rna_dots.selectAll("circle").remove()
        this.rna_text.selectAll("text").remove()
        this.dna_text.selectAll("text").remove()


        this.rna_text.append("text")
        .attr("x", this.barcode_scale(n_rna_base))
        .attr("y", 12)
        .attr("dy", "0.3em") 
        .attr("fill", this.BASE_COLOR)
        .text(Math.floor(n_rna_base))
        .attr("text-anchor", "middle") 
        .style("font-size", "14px")

        this.rna_text.append("text")
        .attr("x", this.barcode_scale(n_rna_stim))
        .attr("y", -12)
        .attr("dy", "0.3em") 
        .attr("fill", this.STIM_COLOR)
        .text(Math.floor(n_rna_stim))
        .attr("text-anchor", "middle")
        .style("font-size", "14px") 


        this.dna_text.append("text")
        .attr("x", this.barcode_scale(n_dna_base))
        .attr("y", 12)
        .attr("dy", "0.3em") 
        .attr("fill", this.BASE_COLOR)
        .text(Math.floor(n_dna_base))
        .attr("text-anchor", "middle") 
        .style("font-size", "14px")

        this.dna_text.append("text")
        .attr("x", this.barcode_scale(n_dna_stim))
        .attr("y", -12)
        .attr("dy", "0.3em") 
        .attr("fill", this.STIM_COLOR)
        .text(Math.floor(n_dna_stim))
        .attr("text-anchor", "middle")
        .style("font-size", "14px") 
         

    }


}