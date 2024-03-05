//Read in data
let all_data = d3.csv("dms/data/dms_data_wrangled.csv")
let descriptor_data = d3.json("dms/data/description.json")


//Add general tool tip used for almost all tooltip interactions
d3.select("body")
  .append("div")
  .attr("id", "default_tooltip")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("background-color", "#c1cbdb")
  .style("border-color", "#a2aab8")
  .style("border-style", "solid")
  .style("border-radius", "5px")
  .style("position", "absolute")
  .style("pointer-events", "none")
  .style("font-family", "monospace")

//Add snake tool tip. Only used for showing residue number on snake plot
//Make two so both can be shown at the same time.
d3.select("body")
  .append("div")
  .attr("id", "snake_tooltip")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("background-color", "#87d69c")
  .style("border-color", "#30a14e")
  .style("border-style", "solid")
  .style("border-radius", "5px")
  .style("position", "absolute")
  .style("pointer-events", "none")
  .style("font-family", "monospace")

Promise.all([all_data, descriptor_data]).then( data =>
    {
      let proteins = [...new Set(data[0].map((item) => item.protein))];   
      let sequence = new Sequence(data[0])
      let sequence_legend = new SequenceLegend(data[0], sequence, data[1])
      let scatter = new Scatter(sequence, data[1])
      let snake = new Snake(scatter)

      let head = new Head(proteins, sequence, sequence_legend, scatter, snake, data[1])
      sequence.setLegend(sequence_legend)
      sequence.setScatter(scatter)
      sequence.setSnake(snake)
      scatter.setSnake(snake)

    });