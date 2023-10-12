class Heat{
    constructor(all_data,globalApplicationState){


        //**********************************************************************************************
        //                                      CONSTANTS 
        //**********************************************************************************************
        this.WIDTH = 1200 
        this.HEIGHT = 500
        this.MARGIN_TOP = 10
        this.MARGIN_RIGHT = 10
        this.MARGIN_LEFT = 100
        this.MARGIN_BOTTOM = 100
        

        //**********************************************************************************************
        //                                  GENERAL SET UP 
        //**********************************************************************************************
        this.globalApplicationState = globalApplicationState
        this.all_data = all_data
        this.heat_div = d3.select("#heat-div") 

        this.heatSvg = this.heat_div.append("svg")
        .attr('id', 'heat_svg')
        .attr('width', this.WIDTH)
        .attr('height', this.HEIGHT)
        // .style("background-color", "rgba(218, 218, 218, 0.634)")

        this.searchBarMotif = document.getElementById("search_bar_motifs");
        this.datalistMotifs = document.createElement("datalist");
        this.datalistMotifs.id = "allMotifs";



        //Modify the names to look how we want
        for (let obj of this.all_data){
            obj.alpha = obj.alpha.split("alpha__")[1]
            obj.alpha = obj.alpha.split("__")[0] + " (" + obj.alpha.split("__")[1]+")"
            obj.architecture = obj.architecture.split(",")[1] + ", " + obj.architecture.split(",")[2] + ", " + obj.architecture.split(",")[3]
        }

        const that = this
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
            that.drawHeatMap(selectedOption)
        })
        document.getElementById('search_bar_motifs').addEventListener('click', function(){
            this.value = '';
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

    drawHeatMap(selected_option){
        this.heatSvg.selectAll("rect").remove()

        console.log("selected option", selected_option)


        let filtered_data = this.all_data.filter(function(d){return d.motif == selected_option})
        var architectures = [...new Set(filtered_data.map((item) => item.architecture))];   
        var conditions = [...new Set(filtered_data.map((item) => item.alpha))]; 
        
        architectures.sort()
        architectures = this.cluster_architectures(filtered_data)
        conditions = this.cluster_conditions(filtered_data)

        // conditions.sort()

        this.x_scale
        .domain(conditions)
        this.y_scale
        .domain(architectures)

        this.x_axis.call(this.xAxis)
        .selectAll("text")
        .attr("transform", "rotate(-45) translate(-50,0)") //TODO write a function that will get how far down you need to shift this. 
        .attr("alignment-baseline","right");

        this.y_axis.call(this.yAxis)
       
        let max_alpha =  d3.max(filtered_data.map(d => d.Value))
        let min_alpha =  d3.min(filtered_data.map(d => d.Value))


        var myColor = d3.scaleSequential()
        .interpolator(d3.interpolateGreens)
        .domain([min_alpha,max_alpha])


        const that = this


        this.heatSvg.selectAll()
        .data(filtered_data)

        .enter()
        .append("rect")
          .attr("x", function(d) { return that.x_scale(d.alpha) })
          .attr("y", function(d) { return that.y_scale(d.architecture) })
          .attr("width", that.x_scale.bandwidth() )
          .attr("height", that.y_scale.bandwidth() )
          .style("fill", function(d) { return myColor(d.Value)} )
        //   .style("stroke-width", 4)
          .style("stroke", "none")
          .style("opacity", 1)
        // .on("mouseover", mouseover)
        // .on("mousemove", mousemove)
        // .on("mouseleave", mouseleave)
    // })
    

    }

    cluster_architectures(filtered_data){
        let architecture_map = new Map()

        for (let obj of filtered_data){
            if (architecture_map.has(obj.architecture)){
                architecture_map.get(obj.architecture).push(+obj.Value)
            }
            else{
                architecture_map.set(obj.architecture, [+obj.Value])
            }
        }
        const average = array => array.reduce((a, b) => a + b) / array.length;

        architecture_map.forEach(function(value, key) {
            console.log(key + " = " + value);
            let avg = average(value)
            architecture_map.set(key, avg)
        })

        architecture_map = new Map([...architecture_map.entries()].sort((a, b) => b[1] - a[1]));

        return architecture_map.keys();

    }

    cluster_architectures(filtered_data){
        let architecture_map = new Map()

        for (let obj of filtered_data){
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
        return architecture_map.keys();
    }

    cluster_conditions(filtered_data){
        let condtion_map = new Map()

        for (let obj of filtered_data){
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
        return condtion_map.keys();
    }


}