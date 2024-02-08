//The Head class will have all the listeners for the inputs

class Head{
    constructor(proteins, sequence, sequence_legend, scatter){
        let protein_select = document.getElementById("protein_select");
        let condition_select = document.getElementById("condition_select");


        
        for (const protein of proteins){
            var option = document.createElement("option");
            option.text = protein
            option.value = protein
            protein_select.appendChild(option);
        }


        //Selecting a protein (First interaction)
        document.getElementById('protein_select').addEventListener('change', function(){

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
              d3.selectAll(".second-interaction").style("opacity", "1").style("pointer-events", "all")
              let conditions = sequence.setProtein(selected_protein)
              for (const condition of conditions){
                var option = document.createElement("option");
                option.text = condition
                option.value = condition
                condition_select.appendChild(option);
              }
            }
            else{
              d3.selectAll(".second-interaction").style("opacity", ".5").style("pointer-events", "none")
              d3.selectAll(".third-interaction").style("opacity", ".5").style("pointer-events", "none")
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
        document.getElementById('heat_select').addEventListener('change',function(){
          var selected_cell_type = d3.select(this).property("value")
          sequence.change_cells(selected_cell_type)

        })
        document.getElementById('condition_2_select').addEventListener('change', function(){
          var selected_condition = d3.select(this).property("value")
          scatter.drawScatter(selected_condition)

        })
    }
}