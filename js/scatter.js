class Scatter{
    constructor(all_data,globalApplicationState){


        //**********************************************************************************************
        //                                      CONSTANTS 
        //**********************************************************************************************
        this.WIDTH = 1000 
        this.HEIGHT = 500
        this.MARGIN = 50

        //**********************************************************************************************
        //                                  GENERAL SET UP 
        //**********************************************************************************************
        this.globalApplicationState = globalApplicationState
        this.all_data = all_data
        this.scatter_div = d3.select("#scatter-div") 
        

        this.scatterSvg = this.scatter_div.append("svg")
        .attr('id', 'scatter_svg')
        .attr('width', this.WIDTH)
        .attr('height', this.HEIGHT)
        .style("background-color", "grey")



    }
}