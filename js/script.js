import helpers from './helper.js';

// let scaleColor = d3.scaleOrdinal() 
//   .domain([1,2,3,4,5])
//   .range(["#845EC2",  
//   "#D65DB1",  
//   "#FF6F91", 
//   "#FF9671" ,
//   "#FFC75F" 
// ]);

//Color blind friendly
let scaleColor = d3.scaleOrdinal() 
  .domain([5,4,3,2,1])
  .range(["#648FFF",  
  "#785EF0",  
  "#DC267F", 
  "#FE6100" ,
  "#FFB000" 
]);


class TwoWayMap {
  constructor() {
     this.map = {}; // Initialize an empty object as the map
     this.reverseMap = {};
  }
  get(key) { return this.map[key]; }
  revGet(key) { return this.reverseMap[key]; }
  set(key, value) { 
     this.map[key] = value; 
     this.reverseMap[value] = key;
  }
  unset(key) { 
     delete this.reverseMap[this.map[key]]; // Remove the reverse mapping
     delete this.map[key];
  }
}

function showLoadingAnimation() {
  d3.select("#loading-container").style("display", "block");
}

// Hide the loading animation
function hideLoadingAnimation() {
  d3.select("#loading-container").style("display", "none");
}


const globalApplicationState = {
    brushed_data: [],
    brushed: false,
    base: null,
    stimulated: null,
    base_runs: [],
    base_treatments: [],
    stim_runs: [],
    stim_treatments: [],
    motifs: [],
    selected_comparison: "none",
    selected_motif: "none",
    scaleColor: scaleColor,
    controls_checked: false,
    top_5_checked: false,
    min_RNA: 2,
    min_DNA: 2,
    concentration_map: new Map(),
    time_map: new Map(),
    cell_map: new Map(),
    long_name_map: new Map(),
    display_name_map: new TwoWayMap(), //display_name takes shortname||treatment                                         


  };

let all_data = d3.csv("./data/current_runs.csv")
let sequences = d3.csv("./data/sequences.csv")
let meta_data = d3.csv("./data/current_runs_meta_data.csv")
let alpha_data = d3.csv("./data/current_runs_alpha_data.csv")


let tooltip = d3.select("body")
  .attr("id", "tooltip")
  .append("div")
  .style("opacity", 0)
  .attr("id", "tool_tip_div")
  .attr("class", "tooltip")
  .style("position", "absolute")

d3.selectAll('#motif-wrapper-div').style("opacity", 0).style("pointer-events", "none")
// d3.selectAll('#treatment-wrapper-div').style("opacity", 0).style("pointer-events", "none")


// d3.select("#motif_view_button").on("click", function() {
//   d3.select("#motif-wrapper-div").style("opacity", 1).style("pointer-events", "all")
//   d3.select("#treatment-wrapper-div").style("opacity", 0).style("pointer-events", "none")
//   d3.select("#header-div").style("pointer-events", "all")
// });

d3.select("#treatment_view_button").on("click", function() {
  d3.select("#treatment-wrapper-div").style("opacity", 1).style("pointer-events", "all")
  d3.select("#motif-wrapper-div").style("opacity", 0).style("pointer-events", "none")
  d3.select("#header-div").style("pointer-events", "all")
});


Promise.all([all_data, sequences, meta_data, alpha_data]).then( data =>
    {
        for (let i=0; i<data[2].length; i++){

          // Call these functions when loading data
          showLoadingAnimation();
    

          let id = data[2][i]["treatment"] + "||" + data[2][i]["run_name"]
          let cur_time = data[2][i]["time"]
          let cur_cell_type = data[2][i]["cell_type"]
          let cur_long_name = data[2][i]["long_name"]
          let cur_concentration = data[2][i]["concentration"]

          globalApplicationState.concentration_map.set(id, cur_concentration)
          globalApplicationState.time_map.set(id, cur_time)
          globalApplicationState.cell_map.set(id, cur_cell_type)
          globalApplicationState.long_name_map.set(id, cur_long_name)

        }

        let columns = Object.keys(data[0][0])


        //Get all the base and stim treatments that were involved in a comparison
        var base_runs = []
        var base_treatments = []
        var stim_runs = []
        var stim_treatments = []

        //Get alpha columns for the heat map
        var alpha_columns = []
        alpha_columns.push("architecture")
        alpha_columns.push("motif")

        var heat_data = structuredClone(data[0]);

        



        for (let i = 0; i < columns.length; i++) {
          if (!columns[i].startsWith("alpha_") && columns[i]!= "architecture" && columns[i]!= "motif"){
            heat_data.forEach((obj) => delete obj[columns[i]]);
          }
         

          if (columns[i].startsWith("logFC__")){
            let cur_comp = columns[i]

            cur_comp = cur_comp.replace("logFC__", "")
            cur_comp = cur_comp.replace(".csv", "")

            let base_treatment = cur_comp.split("_vs_")[0].split("__")[0]
            let base_run = cur_comp.split("_vs_")[0].split("__")[1]

            let stim_treatment = cur_comp.split("_vs_")[1].split("__")[0]
            let stim_run = cur_comp.split("_vs_")[1].split("__")[1]

            base_runs.push(base_run)
            base_treatments.push(base_treatment)
            stim_runs.push(stim_run)
            stim_treatments.push(stim_treatment)

            globalApplicationState.base_runs.push(base_run)
            globalApplicationState.base_treatments.push(base_treatment)
            globalApplicationState.stim_runs.push(stim_run)
            globalApplicationState.stim_treatments.push(stim_treatment)
          }
        }

    base_runs.forEach((base_run, index) => {
      let base_treatment = base_treatments[index];
      let stim_treatment = stim_treatments[index];
      let stim_run = stim_runs[index];

      let stim_key = stim_treatment+"||"+stim_run
      let base_key = base_treatment+"||"+base_run

      let display_treatment_stim = stim_treatment
      let display_treatment_base = base_treatment

      try {
        if (globalApplicationState.long_name_map.get(stim_key) != undefined && 
        globalApplicationState.long_name_map.get(stim_key) != "None" &&
        globalApplicationState.long_name_map.get(stim_key) != ""
        ){
          display_treatment_stim = globalApplicationState.long_name_map.get(stim_key)
        }
      } catch (error) {
      }

      try {
        if (globalApplicationState.long_name_map.get(base_key) != undefined && 
        globalApplicationState.long_name_map.get(base_key) != "None" &&
        globalApplicationState.long_name_map.get(base_key) != ""
        ){
          display_treatment_base = globalApplicationState.long_name_map.get(base_key)
        }
      } catch (error) {
      }

      let display_stim_name = display_treatment_stim + "\t(" + stim_run + ")"
      let display_base_name = display_treatment_base + "\t(" + base_run + ")"
      globalApplicationState.display_name_map.set(stim_key, display_stim_name)
      globalApplicationState.display_name_map.set(base_key, display_base_name)
    });

        hideLoadingAnimation()

        let volcano = new Volcano(data[0], globalApplicationState, helpers)
        let alpha = new Alpha(data[0], globalApplicationState, volcano, helpers)
        let info = new Info(data[0], data[1], globalApplicationState, volcano, alpha, helpers)
        let heat = new Heat(data[3], globalApplicationState)
        let scatter = new Scatter(data[0], globalApplicationState)
        let minfo = new Minfo(data[0], globalApplicationState)

        volcano.set_info(info)
        volcano.set_alpha(alpha)
        alpha.set_info(info)


    });










