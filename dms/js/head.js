//The Head class will have all the listeners for the inputs

class Head{
    constructor(proteins, sequence, sequence_legend, scatter, snake){
        let protein_select = document.getElementById("protein_select");
        let condition_select = document.getElementById("condition_select");
        this.heat_frequency_button_checked = false
        this.scatter_frequency_button_checked = false


        
        for (const protein of proteins){
            var option = document.createElement("option");
            option.text = protein
            option.value = protein
            protein_select.appendChild(option);
        }


        //Selecting a protein (First interaction)
        document.getElementById('protein_select').addEventListener('change', function(){
            d3.selectAll(".second-interaction").style("opacity", ".5").style("pointer-events", "none")
            d3.selectAll(".third-interaction").style("opacity", ".5").style("pointer-events", "none")
            d3.selectAll(".fourth-interaction").style("opacity", ".5").style("pointer-events", "none")
            snake.clearSnakePlot()

            //Remove all conditions
            var selected_protein = d3.select(this).property("value")
            while (condition_select.firstChild) {
              condition_select.removeChild(condition_select.firstChild);
            }
            var default_option = document.createElement("option");
            default_option.text = "Select A Condition"
            default_option.value = "Select A Condition"
            condition_select.appendChild(default_option);

            //All all Conditions corresponding to selected protein. 
            if (selected_protein != "Select A Protein"){
              snake.loadSnakePlot(selected_protein)
              d3.selectAll(".second-interaction").style("opacity", "1").style("pointer-events", "all")
              let conditions = sequence.setProtein(selected_protein)
              for (const condition of conditions){
                var option = document.createElement("option");
                option.text = condition
                option.value = condition
                condition_select.appendChild(option);
              }
            }

            sequence.clear()
            sequence_legend.clear()
            scatter.clear()
            scatter.setSecondConditionOptions("Select A Condition")
        })

        //Selecting a condition (Second interaction)
        document.getElementById('condition_select').addEventListener('change', function(){
            var selected_option = d3.select(this).property("value")
            if (selected_option != "Select A Condition"){
              d3.selectAll(".third-interaction").style("opacity", "1").style("pointer-events", "all")

            }
            else{
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



        document.getElementById('sort_select').addEventListener('change',function(){
          var selected_sort = d3.select(this).property("value")
          sequence.sortAA(selected_sort)
        })
    
        document.getElementById('condition_2_select').addEventListener('change', function(){
          var selected_condition = d3.select(this).property("value")
          if (selected_condition == "Select Second Condition"){
            d3.selectAll(".fourth-interaction").style("opacity", ".5").style("pointer-events", "none")
            sequence.heat_svg.selectAll("rect").style("cursor", "default")

          }
          else{
            d3.selectAll(".fourth-interaction").style("opacity", "1").style("pointer-events", "all")
            sequence.heat_svg.selectAll("rect").style("cursor", "pointer")


          }
          scatter.first_time_drawing_scatter = true
          scatter.drawScatter(selected_condition)
          sequence.filterHeatMap([], null)

        })

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
      const tooltip = d3.select(".tooltip");
      tooltip.style("opacity", 1)
        .html(text)
        .style("left", `0px`)
        .style("top", `50px`)
        .transition()
        .delay(1500)
        .duration(250)
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
          console.log("scatter.brushed", scatter.brushed_points)
          if (scatter.brushed_points.length !== 0){
            const csvData = convertArrayOfObjectsToCSV(scatter.brushed_points);
            exportCSV(`p_${p}--c1_${c1}--c2_${c2}-${time}--selection.csv`, csvData);
          } else{
            showTooltip("Brush over scatter plot to make selection")
          }

        })
    }
}