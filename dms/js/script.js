let all_data = d3.csv("dms/data/dms_data_wrangled.csv")
let tooltip = d3.select("body")
  .append("div")
  .attr("id", "tooltip")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("background-color", "#c1cbdb")
  .style("border-color", "#a2aab8")
  .style("border-style", "solid")
  .style("border-radius", "5px")
  .style("position", "absolute")
  .style("pointer-events", "none")
  


//   function loadSVG(svgPath, containerId) {
//     d3.xml(svgPath).then((xml) => {
//         // Append the loaded SVG content to the container
//         d3.select(`#${containerId}`).node().appendChild(xml.documentElement);
//         // Call your visualization functions after loading the SVG, if needed
//         // For example: sequence.drawHeatMap();
//     });
// }


Promise.all([all_data]).then( data =>
    {

    
    

      // loadSVG("../snake_plots/snake_oprm_human.svg", "info-div");

 
        let sequence = new Sequence(data[0])
        let info = new Info(data[0], sequence)
        sequence.setInfo(info)



        let proteins = [...new Set(data[0].map((item) => item.protein))];   
        let protein_select = document.getElementById("protein_select");
        let condition_select = document.getElementById("condition_select");


        
        for (const protein of proteins){
            var option = document.createElement("option");
            option.text = protein
            option.value = protein
            protein_select.appendChild(option);
        }
        document.getElementById('protein_select').addEventListener('change', function(){
            var selected_protein = d3.select(this).property("value")

            while (condition_select.firstChild) {
              condition_select.removeChild(condition_select.firstChild);
            }

            var default_option = document.createElement("option");
            default_option.text = "Select A Condition"
            default_option.value = "Select A Condition"
            condition_select.appendChild(default_option);


            if (selected_protein != "Select A Protein"){
              d3.select("#condition_select").style("opacity", "1").style("pointer-events", "all")
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
            }

            sequence.clear()
        })


        document.getElementById('condition_select').addEventListener('change', function(){
            var selected_option = d3.select(this).property("value")
            if (selected_option != "Select A Condition"){
              d3.select("#sort_select").style("opacity", "1").style("pointer-events", "all")
            }
            else{
              d3.select("#sort_select").style("opacity", ".5").style("pointer-events", "none")
            }
            sequence.setCondition(selected_option)
            sequence.clear()
            sequence.drawHeatMap()
        })

        document.getElementById('sort_select').addEventListener('change',function(){
          var selected_sort = d3.select(this).property("value")
          sequence.sortAA(selected_sort)

        })

      

    });