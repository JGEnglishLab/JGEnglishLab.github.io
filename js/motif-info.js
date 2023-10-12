class Minfo{
    constructor(all_data,globalApplicationState){


        //**********************************************************************************************
        //                                      CONSTANTS 
        //**********************************************************************************************
        this.WIDTH = 200 
        this.HEIGHT = 500
        this.MARGIN = 50

        //**********************************************************************************************
        //                                  GENERAL SET UP 
        //**********************************************************************************************
        this.globalApplicationState = globalApplicationState
        this.all_data = all_data
        this.minfo_div = d3.select("#motif-info-div") 

        this.minfoSvg = this.minfo_div.append("svg")
        .attr('id', 'minfo_svg')
        .attr('width', this.WIDTH)
        .attr('height', this.HEIGHT)
        // .attr("transform", `translate(10,70)`) //Move below the header div
        .style("background-color", "yellow")



    }
}