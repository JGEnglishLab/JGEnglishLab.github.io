//The Head class will have all the listeners for the inputs

class Head{
  constructor(proteins, sequence, sequence_legend, scatter, snake, descriptor_data){

    this.SHOW_TOOL_TIP_DELAY = 1500
    this.SHOW_TOOL_TIP_DURATION = 250
    this.SHIFT_SHOW_TOOL_TIP_DOWN = 50
    this.SHIFT_INFO_TOOL_TIP_DOWN = 80
    const that = this
    let condition_select = document.getElementById("condition_select");
    this.heat_frequency_button_checked = false
    this.scatter_frequency_button_checked = false

    ///////////////////////////////////////////////////////////////////////////////////////////
    //Sets all of the proteins as options in the 
    let protein_select = document.getElementById("protein_select");
    for (const protein of proteins){
        var option = document.createElement("option");
        option.text = protein
        option.value = protein
        protein_select.appendChild(option);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////
    //Selecting a protein (First interaction)
    document.getElementById('protein_select').addEventListener('change', function(){
      d3.selectAll(".second-interaction").style("opacity", ".5").style("pointer-events", "none")
      d3.selectAll(".third-interaction").style("opacity", ".5").style("pointer-events", "none")
      d3.selectAll(".fourth-interaction").style("opacity", ".5").style("pointer-events", "none")
      snake.clearSnakePlot()
      sequence.clear()
      sequence_legend.clear()
      scatter.clear()
      scatter.setSecondConditionOptions("Select A Condition")

      //Remove all conditions
      var selected_protein = d3.select(this).property("value")
      while (condition_select.firstChild) {
        condition_select.removeChild(condition_select.firstChild);
      }

      //Add Default option
      var default_option = document.createElement("option");
      default_option.text = "Select A Condition"
      default_option.value = "Select A Condition"
      condition_select.appendChild(default_option);

      if (selected_protein != "Select A Protein"){
        snake.loadSnakePlot(selected_protein)

        //Allow second-interactions
        d3.selectAll(".second-interaction").style("opacity", "1").style("pointer-events", "all")

        //Add all Conditions corresponding to selected protein. 
        let conditions = sequence.setProtein(selected_protein)
        for (const condition of conditions){
          var option = document.createElement("option");
          option.text = condition
          option.value = condition
          condition_select.appendChild(option);
        }
      }
    })

    ///////////////////////////////////////////////////////////////////////////////////////////
    //Selecting a condition (Second interaction)
    document.getElementById('condition_select').addEventListener('change', function(){
      var selected_option = d3.select(this).property("value")
      if (selected_option != "Select A Condition"){ //Allow third interactions
        d3.selectAll(".third-interaction").style("opacity", "1").style("pointer-events", "all")
      }
      else{ //Don't allow third interactions
        d3.selectAll(".third-interaction").style("opacity", ".5").style("pointer-events", "none")
      }
      
      d3.selectAll(".fourth-interaction").style("opacity", ".5").style("pointer-events", "none")
      sequence.setCondition(selected_option)
      scatter.setSecondConditionOptions(selected_option)
      sequence.clear()
      scatter.clear()
      sequence_legend.clear()
      sequence.drawHeatMap()
    })


    ///////////////////////////////////////////////////////////////////////////////////////////
    //Mouse over methods (Second interaction)
    d3.select("#methods-highlight-div")
    .on("mouseover", function(event, d){
      d3.select("#default_tooltip")
        .style("opacity", 1)
        .style("left", `0px`)
        .style("top", `${that.SHIFT_INFO_TOOL_TIP_DOWN}px`)
        .style("width", `${document.getElementById('scatter-div').getBoundingClientRect().width}px`)
        .html(writeMethodsInfo(sequence.selected_protein, descriptor_data))
      d3.select(this)
        .style("background-color", "#a2aab8")
      d3.select("#methods-text").style("color", "white")
      })
    .on("mouseleave", function(d,event){
        d3.select("#default_tooltip")
          .style("opacity", 0)
          .style("width", "auto")
        d3.select(this)
          .style("background-color", "#c1cbdb")
        d3.select("#methods-text").style("color", "black")
    })

    ///////////////////////////////////////////////////////////////////////////////////////////
    //Click on methods (Second interaction)
    //Used to copy publication link to clipboard
    d3.select("#methods-highlight-div")
    .on("click", function(){
      let cur_protein = descriptor_data[sequence.selected_protein]
      let cur_link = cur_protein.publication_link
      navigator.clipboard.writeText(cur_link);
    })

    ///////////////////////////////////////////////////////////////////////////////////////////
    //Sort Amino Acids (Third interaction)
    document.getElementById('sort_select').addEventListener('change',function(){
      var selected_sort = d3.select(this).property("value")
      sequence.sortAA(selected_sort)
    })

    ///////////////////////////////////////////////////////////////////////////////////////////
    //Show frequencies on heat map (Third interaction)
    document.getElementById('heat_frequency_button').addEventListener('click', function(){
      this.heat_frequency_button_checked = !this.heat_frequency_button_checked
      var button = d3.select(this)
      if (this.heat_frequency_button_checked){
        button.html("Show All Data")
        sequence.change_cells("circles")
        sequence_legend.addFrequencyLegend()
      } else{
        button.html("Show Frequencies")
        sequence.change_cells("squares")
        sequence_legend.clearFrequencyLegend()
      }
    })

    ///////////////////////////////////////////////////////////////////////////////////////////
    //Change percentile slider (Third interaction)

    //Change the numbers next to slider
    document.getElementById("lower-percentile-slide").addEventListener("input", function(){
      document.getElementById("lower-percentile-slide-label").innerHTML =  this.value
    });

    //Change the numbers next to slider
    document.getElementById("upper-percentile-slide").addEventListener("input", function(){
      document.getElementById("upper-percentile-slide-label").innerHTML =  this.value
    });

    //Re-calc percentiles, and 
    document.getElementById("lower-percentile-slide").addEventListener("change", function(){
      sequence.lower_percentile = this.value/100
      sequence.reCalcPercentiles()
      sequence_legend.clear()
      sequence_legend.drawLegend()
      if (sequence_legend.frequency_drawn){
        sequence_legend.addFrequencyLegend()
      }
    })
    document.getElementById("upper-percentile-slide").addEventListener("change", function(){
      sequence.upper_percentile = this.value/100
      sequence.reCalcPercentiles()
      sequence_legend.clear()
      sequence_legend.drawLegend()
      if (sequence_legend.frequency_drawn){
        sequence_legend.addFrequencyLegend()
      }
    })


    ///////////////////////////////////////////////////////////////////////////////////////////
    //Condition 2 select (Third interaction)
    document.getElementById('condition_2_select').addEventListener('change', function(){
      var selected_condition = d3.select(this).property("value")
      if (selected_condition == "Select Second Condition"){ //Don't allow 4th interactions
        d3.selectAll(".fourth-interaction").style("opacity", ".5").style("pointer-events", "none")
      }
      else{ //Allow 4th interactions
        d3.selectAll(".fourth-interaction").style("opacity", "1").style("pointer-events", "all")
      }
      scatter.first_time_drawing_scatter = true
      scatter.drawScatter(selected_condition)
      sequence.filterHeatMap([], null) // Unfilter heat map
    })


    ///////////////////////////////////////////////////////////////////////////////////////////
    //Show frequencies on scatter plot (Fourth interaction)
    document.getElementById('scatter_frequency_button').addEventListener('click', function(){
      this.scatter_frequency_button_checked = !this.scatter_frequency_button_checked
      var button = d3.select(this)
      scatter.changeCircles(this.scatter_frequency_button_checked)

      if (this.scatter_frequency_button_checked){
        button.html("Show All Data")
        scatter.drawFrequencyLegend()
      } else{
        button.html("Show Frequencies")
        scatter.clearFrequencyLegend()
      }
    })


    ///////////////////////////////////////////////////////////////////////////////////////////
    //Export selection button (Fourth interaction)
    function convertArrayOfObjectsToCSV(array) {
      let csv = '';
      // Extracting headers
      const headers = Object.keys(array[0]);
      csv += headers.join(',') + '\n';
      
      // Extracting values
      array.forEach(item => {
          const values = headers.map(header => item[header]);
          csv += values.join(',') + '\n';
      });
      
      return csv;
    }

    function exportCSV(filename, csvData) {
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      if (navigator.msSaveBlob) { // IE 10+
          navigator.msSaveBlob(blob, filename);
      } else {
          const link = document.createElement('a');
          if (link.download !== undefined) {
              const url = URL.createObjectURL(blob);
              link.setAttribute('href', url);
              link.setAttribute('download', filename);
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
          }
        }
    }

    function showTooltip(text) {
      const tooltip = d3.select("#default_tooltip");
      tooltip.style("opacity", 1)
        .html(text)
        .style("left", `0px`)
        .style("top", `${that.SHIFT_SHOW_TOOL_TIP_DOWN}px`)
        .transition()
        .delay(that.SHOW_TOOL_TIP_DELAY)
        .duration(that.SHOW_TOOL_TIP_DURATION)
        .style("opacity", 0)
    }


    document.getElementById('export_selection_button').addEventListener('click', function(){
      let p = sequence.selected_protein
      let c1 = sequence.selected_condition
      let c2 = scatter.second_condition
      let time = new Date().toLocaleTimeString('en-US', { hour12: false, 
                                                hour: "numeric", 
                                                minute: "numeric",
                                                second:"numeric"});
      if (scatter.brushed_points.length !== 0){
        showTooltip(`Exporting brushed data`)
        let csvData = convertArrayOfObjectsToCSV(scatter.brushed_points);
        exportCSV(`p_${p}--c1_${c1}--c2_${c2}-${time}--brushed_selection.csv`, csvData);
      } 
      else if (snake.residue_clicked){
        showTooltip(`Exporting data for residue #${snake.clicked_position}`)
        let residue_data = scatter.joined_data.filter(function(d){return (d.pos == snake.clicked_position)})
        if (residue_data.length == 0){
          showTooltip(`No data for residue #${snake.clicked_position}`)
        } 
        else{
          let csvData = convertArrayOfObjectsToCSV(residue_data)
          exportCSV(`p_${p}--c1_${c1}--c2_${c2}-${time}--residue_${snake.clicked_position}.csv`, csvData);
        }

      }
      else{
        showTooltip("Brush over scatter plot (or click on snakeplot if applicable) to make selection")
      }
    })


      
      
      
    ///////////////////////////////////////////////////////////////////////////////////////////
    //Click on document (Any time)

    //Clear selected residue (if one is selected) by clicking anywhere on the documnent
    document.addEventListener("mousedown", function(d){
      // If there is a residue clicked AND
      // they aren't clicking the export select button OR There is an active brush
      if (snake.residue_clicked && 
        (d.target != document.getElementById("export_selection_button") || scatter.active_brush)){ 
          snake.heatMouseleave()
          scatter.snakeMouseleave()
          snake.clicked_position = null
          snake.residue_clicked = false
          d3.select("#snake_tooltip").style("opacity", 0)
          snake.circles.style("pointer-events", "all")
          scatter.points.selectAll(".scatter-circle").style("pointer-events", "none")
      }
    })   
    }
}