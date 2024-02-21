class Snake{
    constructor(scatter){
        this.snake_div = d3.select("#snake-div")     
        this.scatter = scatter
        this.snake_drawn = false
    }

    clearSnakePlot(){
        let snakeDiv = document.getElementById("snake-div");
        snakeDiv.innerHTML = '';
        this.snake_drawn = false
    }


    
    loadSnakePlot(selected_protein){
        const that = this
        loadSVG(`dms/data/snake/${selected_protein}.svg`, "snake-div").then(()=>{
            let s = document.getElementById("snakeplot")
            s.style.width = '100%'
            s.style.height = '100%'
            s.style.cursor = "default"

            let circles = d3.select("#snake").selectAll("circle");
            let text = d3.select("#snake").selectAll("text")
            text.style("pointer-events", "none")

            circles.on("mouseover", function(){
                that.scatter.snakeMouseover(d3.select(this)._groups[0][0].id)
                d3.select(this).style("fill", "green")
            })
            circles.on("mouseleave", function(){
                that.scatter.snakeMouseleave()
                d3.select(this).style("fill", "white")

            })

            text.on("mouseover", function(){
                that.scatter.snakeMouseover(d3.select(this)._groups[0][0].id)
                d3.select(this).style("fill", "green")
            })
            text.on("mouseleave", function(){
                that.scatter.snakeMouseleave()
                d3.select(this).style("fill", "white")

            })


        }).catch((error) => {
            this.snake_drawn = false
        });


    }

    heatMousover(point){
        if (this.snake_drawn){
            let circles = d3.select("#snake").selectAll("circle");
            let selected_pos = point.pos

            circles
            .style("fill", function(){
                d3.select(this)
                if (d3.select(this)._groups[0][0].attributes[8].nodeValue === selected_pos){
                    return("green")
                }
                else{
                    return("white")
                }
            })
            .style("opacity", function(){
                d3.select(this)
                if (d3.select(this)._groups[0][0].attributes[8].nodeValue === selected_pos){
                    return(.7)
                }
                else{
                    return(1)
                }
            })  
        }
    }

    heatMouseleave(){
        if (this.snake_drawn){
            let circles = d3.select("#snake").selectAll("circle");
            circles
            .style("fill", "white")
            .style("opacity",1) 
        } 
    }


    

}