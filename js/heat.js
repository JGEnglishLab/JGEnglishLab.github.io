class Heat{
    constructor(all_data,globalApplicationState){


        //**********************************************************************************************
        //                                      CONSTANTS 
        //**********************************************************************************************
        this.WIDTH = 1400 
        this.HEIGHT = 500
        this.MARGIN_TOP = 10
        this.MARGIN_RIGHT = 210
        this.MARGIN_LEFT = 100
        this.MARGIN_BOTTOM = 100
        this.HEAT_MAP_DRAWN = false
        this.SHIFT_LEGEND_DOWN = 50
        

        //**********************************************************************************************
        //                                  GENERAL SET UP 
        //**********************************************************************************************
        const that = this

        this.globalApplicationState = globalApplicationState
        this.all_data = all_data
        this.heat_div = d3.select("#heat-div") 
        this.sort_type = "Sort By RPM Ratio"

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

        //Modify the names to look how we want
        for (let obj of this.all_data){
            obj.alpha = obj.alpha.split("alpha__")[1]
            obj.alpha = obj.alpha.split("__")[0] + " (" + obj.alpha.split("__")[1]+")"
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
        document.getElementById('search_bar_motifs').addEventListener('change', function(){
            var selectedOption = d3.select(this).property("value")
            that.drawHeatMap(selectedOption, that.sort_type)
        })
        document.getElementById('search_bar_motifs').addEventListener('click', function(){
            this.value = '';
        })

        document.getElementById('option_drop_down').addEventListener('change', function(){
            var selectedOption = d3.select(this).property("value")
            if (selectedOption == "Sort By RPM Ratio"){ //Rank by RPM
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
        this.heatSvg.selectAll("rect").remove()
        this.HEAT_MAP_DRAWN = true


        this.filtered_data = this.all_data.filter(function(d){return d.motif == selected_option})
        this.architectures = [...new Set(this.filtered_data.map((item) => item.architecture))];   
        this.conditions = [...new Set(this.filtered_data.map((item) => item.alpha))]; 

        console.log("sort_type", sort_type)
        console.log("first", this.conditions)

        if (sort_type == "Sort By RPM Ratio"){
            this.sort_architectures()
            this.sort_conditions()    
        }
        else if (sort_type == "Sort Conditions Alphabetically"){
            this.alphabetize()
        }
        
        this.x_scale
        .domain(this.conditions)
        this.y_scale
        .domain(this.architectures)

        this.x_axis.call(this.xAxis)
        .selectAll("text")
        .attr("transform", "rotate(-45) translate(-50,0)") //TODO write a function that will get how far down you need to shift this. 
        .attr("alignment-baseline","right");

        this.y_axis.call(this.yAxis)
       
        let max_alpha =  d3.max(this.filtered_data.map(d => +d.Value))
        let min_alpha =  d3.min(this.filtered_data.map(d => +d.Value))
        let myColor = d3.scaleSequential()
        // .interpolator(d3.interpolateGreens)
        // .interpolator(d3.interpolateGnBu)
        .interpolator(d3.interpolateYlGnBu)
        .domain([min_alpha,max_alpha])


        const that = this

        this.heatSvg.selectAll()
        .data(this.filtered_data)
        .enter()
        .append("rect")
          .attr("x", function(d) { return that.x_scale(d.alpha) })
          .attr("y", function(d) { return that.y_scale(d.architecture) })
          .attr("width", that.x_scale.bandwidth() )
          .attr("height", that.y_scale.bandwidth() )
          .style("fill", function(d) { return myColor(+d.Value)} )
          .style("stroke-width", 4)
          .style("opacity", 1)

          const legendWidth = 20; // Adjust the width as needed
          const legendHeight = 310; // Adjust the height as needed
          const numColorStops = 10; // Adjust the number of color stops as needed
          
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
            .attr("x", 0)
            .attr("y", (d, i) => i * (legendHeight / (numColorStops - 1)))
            .attr("width", legendWidth )
            .attr("height", legendHeight/ (numColorStops - 1))
            .style("fill", d => d)
            .attr("transform", `translate(1200,${this.SHIFT_LEGEND_DOWN})`)
            .attr("stroke", "grey") 

            var yscale = d3.scaleLinear() 
            .domain([min_alpha, max_alpha]) 
            .range([0, legendHeight ])
  
            var y_axis = d3.axisRight(yscale) 
            .tickValues(slots)
            .tickSize(9)
    
            this.g_label
                .attr("transform", `translate(1220,${this.SHIFT_LEGEND_DOWN})`) 
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

            this.heatSvg.selectAll("rect")
            .transition()
            .attr("x", function(d) { return that.x_scale(d.alpha) })
            .attr("y", function(d) { return that.y_scale(d.architecture) })
        }
    }

    



}