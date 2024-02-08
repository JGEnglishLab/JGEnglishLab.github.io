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
  

Promise.all([all_data]).then( data =>
    {

      let proteins = [...new Set(data[0].map((item) => item.protein))];   

    
        let sequence = new Sequence(data[0])
        let sequence_legend = new SequenceLegend(data[0], sequence)
        let scatter = new Scatter(sequence)

        let head = new Head(proteins, sequence, sequence_legend, scatter)
        sequence.setLegend(sequence_legend)



      

      

    });