class Heat{
    constructor(all_data,globalApplicationState){


        //**********************************************************************************************
        //                                      CONSTANTS 
        //**********************************************************************************************
        this.WIDTH = document.body.scrollWidth
        this.HEIGHT = document.body.scrollHeight //1000
        this.MARGIN_TOP = 40
        this.MARGIN_RIGHT = 210
        this.MARGIN_LEFT = 130
        this.MARGIN_BOTTOM = 200
        this.HEAT_MAP_DRAWN = false
        this.SHIFT_LEGEND_DOWN = 50
        this.LEGEND_MARGIN_LEFT = 10
        this.LEGEND_RECT_OVERLAP = 3


        //**********************************************************************************************
        //                                  GENERAL SET UP 
        //**********************************************************************************************
        const that = this

        this.globalApplicationState = globalApplicationState
        this.all_data = all_data
        this.heat_div = d3.select("#heat-div") 
        this.sort_type = "Sort By Transcription Rate"
        this.show_anonymized_data = false
        this.heat_map_drawn = false

        this.heatSvg = this.heat_div.append("svg")
        .attr('id', 'heat_svg')
        .attr('width', this.WIDTH)
        .attr('height', this.HEIGHT)
        // .style("background-color", "rgba(218, 218, 218, 0.634)")   
        
        this.g_label = this.heatSvg.append("g")

        this.searchBarMotif = document.getElementById("search_bar_motifs");
        this.datalistMotifs = document.createElement("datalist");
        this.datalistMotifs.id = "allMotifs";
        
        this.architectures = []
        this.conditions = []

        this.heatSvg.append("text")
        .attr("id", "legend_label")
        .attr("y",25)
        .attr("x", this.WIDTH - this.MARGIN_RIGHT + this.LEGEND_MARGIN_LEFT)
        .style("opacity", 0)
        .text("Transcription Rate")
     

        //Modify the names to look how we want
        for (let obj of this.all_data){
            obj.alpha = obj.alpha.split("aggregate_rpm_ratio__")[1]
            obj.alpha = obj.alpha.split("__")[0] + " " + obj.alpha.split("__")[1]
            obj.architecture = obj.architecture.split(",")[1] + ", " + obj.architecture.split(",")[2] + ", " + obj.architecture.split(",")[3]
        }
        
        // const that = this
        let motifs = [...new Set(this.all_data.map((item) => item.motif))];    
        
        motifs.forEach(function(option) {
            const optionElement = document.createElement("option");            
            optionElement.value = option;
            that.datalistMotifs.appendChild(optionElement);
        });
        this.searchBarMotif.appendChild(this.datalistMotifs); 
        
        //Set up listeners
        document.getElementById('show_anonymous_conditions_motif_check').addEventListener('change', function(){
            that.show_anonymized_data = d3.select(this).property("checked")
            if (that.heat_map_drawn){
                that.drawHeatMap(that.selectedOption, that.sort_type)
            }
        })

        document.getElementById('search_bar_motifs').addEventListener('change', function(){
            var selectedOption = d3.select(this).property("value")
            that.drawHeatMap(selectedOption, that.sort_type)
        })
        document.getElementById('search_bar_motifs').addEventListener('click', function(){
            this.value = '';
        })

        document.getElementById('option_drop_down').addEventListener('change', function(){
            var selectedOption = d3.select(this).property("value")
            if (selectedOption == "Sort By Transcription Rate"){ //Rank by RPM
                that.sort_architectures()
                that.sort_conditions()
            }
            if (selectedOption == "Sort Conditions Alphabetically"){
                that.alphabetize()
                that.sort_architectures()
            }
            if (selectedOption == "Cluster"){
                that.cluster()
            }
            that.re_draw()
            that.sort_type = selectedOption
        })
    

        //Set up initial axis
        this.x_scale = d3.scaleBand()
        .range([this.MARGIN_LEFT, this.WIDTH - this.MARGIN_RIGHT])
        this.y_scale = d3.scaleBand()
        .range([this.HEIGHT - this.MARGIN_BOTTOM, this.MARGIN_TOP])

        this.xAxis = g => g
        .attr("transform", `translate(0,${this.HEIGHT- this.MARGIN_BOTTOM })`)
        .call(d3.axisBottom(this.x_scale))
        this.yAxis = g => g
        .attr("transform", `translate(${this.MARGIN_LEFT },0)`)
        .call(d3.axisLeft(this.y_scale))

        this.x_axis = this.heatSvg.append('g').call(this.xAxis)
        this.y_axis = this.heatSvg.append('g').call(this.yAxis)


    }

    drawHeatMap(selected_option, sort_type){
        this.selectedOption = selected_option
        this.sort_type = sort_type
        this.heat_map_drawn = true
        const that = this
        this.heatSvg.selectAll("rect").remove()
        this.HEAT_MAP_DRAWN = true

        this.heatSvg
        .select("#legend_label").style("opacity", 1)
        .on("mouseover", (event, d) => {
            d3.select(".tooltip")
              .style("opacity", 1)
              .html("Transcription Rate = ∑(RNA RPM) / ∑(DNA RPM)")
              .style("left", `${event.pageX - 200}px`)
              .style("top", `${event.pageY - 70}px`)
          })
          .on("mousemove", (event, d) => {
            d3.select(".tooltip")
              .style("left", `${event.pageX -200}px`)
              .style("top", `${event.pageY - 70}px`)
          })
          .on("mouseleave", (event, d) => {
            d3.select(".tooltip")
            .style("opacity", 0)
            .style("left", "-300px")
            .style("top", "-300px")
          })




        this.filtered_data = this.all_data.filter(function(d){return d.motif == selected_option})
        this.architectures = [...new Set(this.filtered_data.map((item) => item.architecture))];   
        this.conditions = [...new Set(this.filtered_data.map((item) => item.alpha))]; 
    

        if (sort_type == "Sort By Transcription Rate"){
            this.sort_architectures()
            this.sort_conditions()    
        }
        else if (sort_type == "Sort Conditions Alphabetically"){
            this.alphabetize()
        }

        if (!this.show_anonymized_data){
            this.conditions = this.conditions.filter((d) => !d.includes("group_"))

        }

    

        const counter = new Map()
        this.conditions.forEach(c => {
            let treatment =  c.split(" ")[0]
            let run =  c.split(" ")[1]
            let key = treatment+"||"+run
            let name = that.globalApplicationState.long_name_map.get(key)

            if (counter.get(name)) {
                let cur_count = counter.get(name)
                counter.set(name, cur_count+1);
            } 
            else {
                counter.set(name, 1);
            }
        });

        this.conditions = this.conditions.map(function(c) {
            let treatment =  c.split(" ")[0]
            let run =  c.split(" ")[1]
            let key = treatment+"||"+run
            let name = that.globalApplicationState.long_name_map.get(key)
            if (counter.get(name) > 1 || run.includes("group_")){
                name = name + " (" +run + ")"
            }
            return(name)
        })

        this.x_scale
        .domain(this.conditions)
        this.y_scale
        .domain(this.architectures)

        this.x_axis.call(this.xAxis)
        .selectAll("text")
        .attr("transform", "rotate(-45) translate(-10,0)") 
        .attr("text-anchor","end")
        .attr("font-family","monospace")


        this.y_axis.call(this.yAxis)
        .attr("font-family","monospace")

       
        let max_alpha =  d3.max(this.filtered_data.map(d => +d.Value))
        let min_alpha =  d3.min(this.filtered_data.map(d => +d.Value))
        let myColor = d3.scaleSequential()
        .interpolator(d3.interpolateYlGnBu)
        .domain([min_alpha,max_alpha])

        if (!this.show_anonymized_data){
            this.filtered_data = this.filtered_data.filter((d) => !d.alpha.includes("group_"))

        }

        this.heatSvg.selectAll()
        .data(this.filtered_data)
        .enter()
        .append("rect")
          .attr("id", "heat_rect")
          .attr("x", function(d) { 
            let treatment =  d.alpha.split(" ")[0]
            let run =  d.alpha.split(" ")[1]
            let key = treatment+"||"+run
            let name = that.globalApplicationState.long_name_map.get(key)
            if (counter.get(name) > 1 || run.includes("group_")){
                name = name + " (" +run + ")"
            }
            return(that.x_scale(name))
            })
          .attr("y", function(d) { return that.y_scale(d.architecture) })
          .attr("width", that.x_scale.bandwidth() )
          .attr("height", that.y_scale.bandwidth() )
          .style("fill", function(d) { return myColor(+d.Value)} )
          .style("stroke-width", 4)
          .style("opacity", 1)
          .on("mouseover", (event, d) => {
            d3.select(".tooltip")
              .style("opacity", 1)
              .html(`Condition: ${d.alpha}<br>Architecture: ${d.architecture}<br>Transcription Rate: ${ Math.round(d.Value * 100) / 100
            }`)
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

          const legendWidth = 20; // Adjust the width as needed
          const legendHeight = 310; // Adjust the height as needed
          const numColorStops = 90; // Adjust the number of color stops as needed
          
          const legendSVG = this.heatSvg // Select a container for the legend
            .append("svg")
            .attr("width", legendWidth)
            .attr("height", legendHeight);
          
          const legendScale = d3.scaleLinear()
            .domain([min_alpha, max_alpha])
            .range([0, legendWidth]);

            let slots = []
        
          
          const gradient = d3.range(numColorStops).map(i => {
            const t = i / (numColorStops - 1);

        
            slots.push(min_alpha + t * (max_alpha - min_alpha))

            return myColor(min_alpha + t * (max_alpha - min_alpha));
          });

          

          this.heatSvg
          .selectAll()
            .data(gradient)
            .enter()
            .append("rect")
            .attr("x", this.WIDTH - this.MARGIN_RIGHT + this.LEGEND_MARGIN_LEFT )
            .attr("y", (d, i) => i * (legendHeight / (numColorStops - 1)))
            .attr("width", legendWidth )
            .attr("height", legendHeight/ (numColorStops - 1) + this.LEGEND_RECT_OVERLAP)
            .style("fill", d => d)
            .attr("transform", `translate(0,${this.SHIFT_LEGEND_DOWN})`)
            // .attr("stroke", "grey") 
            .on("mouseover", (event, d) => {
                d3.select(".tooltip")
                  .style("opacity", 1)
                  .html("Transcription Rate = ∑(RNA RPM) / ∑(DNA RPM)")
                  .style("left", `${event.pageX - 200}px`)
                  .style("top", `${event.pageY - 70}px`)
              })
              .on("mousemove", (event, d) => {
                d3.select(".tooltip")
                  .style("left", `${event.pageX -200}px`)
                  .style("top", `${event.pageY - 70}px`)
              })
              .on("mouseleave", (event, d) => {
                d3.select(".tooltip")
                .style("opacity", 0)
                .style("left", "-300px")
                .style("top", "-300px")
              })
    

            var yscale = d3.scaleLinear() 
            .domain([min_alpha, max_alpha]) 
            .range([0, legendHeight + legendHeight/ (numColorStops - 1)])
  
            var y_axis = d3.axisRight(yscale) 
            // .tickValues(slots)
            .tickSize(9)
    
            this.g_label
                .attr("transform", `translate(${this.WIDTH - this.MARGIN_RIGHT + this.LEGEND_MARGIN_LEFT + legendWidth},${this.SHIFT_LEGEND_DOWN})`) 
                .call(y_axis)

        
            
      
        }

    cluster(){
        if (this.HEAT_MAP_DRAWN){

            console.log(this.filtered_data)
            for (let obj of this.filtered_data){
                console.log("obj", obj)
            } 
        }
    }



    sort_architectures(){
        if (this.HEAT_MAP_DRAWN){

            let architecture_map = new Map()

            for (let obj of this.filtered_data){
                if (architecture_map.has(obj.architecture)){
                    architecture_map.get(obj.architecture).push(+obj.Value)
                }
                else{
                    architecture_map.set(obj.architecture, [+obj.Value])
                }
            }
            const average = array => array.reduce((a, b) => a + b) / array.length;

            architecture_map.forEach(function(value, key) {
                let avg = average(value)
                architecture_map.set(key, avg)
            })

            architecture_map = new Map([...architecture_map.entries()].sort((a, b) =>  a[1] - b[1]));
            this.architectures =  [...architecture_map.keys()]
        }
    }

    sort_conditions(){
        if (this.HEAT_MAP_DRAWN){

            let condtion_map = new Map()

            for (let obj of this.filtered_data){
                if (condtion_map.has(obj.alpha)){
                    condtion_map.get(obj.alpha).push(+obj.Value)
                }
                else{
                    condtion_map.set(obj.alpha, [+obj.Value])
                }
            }
            const average = array => array.reduce((a, b) => a + b) / array.length;

            condtion_map.forEach(function(value, key) {
                let avg = average(value)
                condtion_map.set(key, avg)
            })

            condtion_map = new Map([...condtion_map.entries()].sort((a, b) => b[1] - a[1]));
            this.conditions =  [...condtion_map.keys()]
        }
    }

    alphabetize(){
        if (this.HEAT_MAP_DRAWN){
            this.conditions = this.conditions.sort()
        }
    }

    re_draw(){
        if (this.HEAT_MAP_DRAWN){

            const that = this

            this.x_scale
            .domain(this.conditions)
            this.y_scale
            .domain(this.architectures)
            this.x_axis.call(this.xAxis)
            this.y_axis.call(this.yAxis)

            this.heatSvg.selectAll("#heat_rect")
            .transition()
            .attr("x", function(d) { return that.x_scale(d.alpha) })
            .attr("y", function(d) { return that.y_scale(d.architecture) })
        }
    }

    



}