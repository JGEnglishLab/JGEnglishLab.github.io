class Snake{
    constructor(scatter){
        /////////////////////////////////////////////////////////////////////////////////////////////////
        //                                  CONSTANTS
        /////////////////////////////////////////////////////////////////////////////////////////////////
        this.SNAKE_HOVER_OPACITY = .7
        this.SELECT_SNAKE_COLOR = "green"
        this.DEFAULT_STROKE_WIDTH = 2
        this.HIGHLIGHTED_STROKE_WIDTH = 6


        /////////////////////////////////////////////////////////////////////////////////////////////////
        //                                  GENERAL SET UP 
        /////////////////////////////////////////////////////////////////////////////////////////////////
        this.snake_div = d3.select("#snake-div")     
        this.scatter = scatter
        this.snake_drawn = false
        this.residue_clicked = false
        this.n_residue_clicks = 0
        this.clicked_position = null
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        clear()

    Removes everything from snake-div
    *////////////////////////////////////////////////////////////////////////////////////////////////
    clearSnakePlot(){
        let snakeDiv = document.getElementById("snake-div");
        snakeDiv.innerHTML = '';
        this.snake_drawn = false
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        loadSnakePlot(selected_protein)

    Loads the snake.svg if one exists for the selected protein.
    The name of the SVG will be {selected_protein}.svg
    The SVG files should all live in dms/data/snake.
    *////////////////////////////////////////////////////////////////////////////////////////////////
    loadSnakePlot(selected_protein){
        const that = this
        this.residue_clicked = false
        loadSVG(`dms/data/snake/${selected_protein}.svg`, "snake-div").then(()=>{
            that.snake_drawn = true
            let snake_svg = document.getElementById("snakeplot")
            snake_svg.style.width = '100%'
            snake_svg.style.height = '100%'
            snake_svg.style.cursor = "default"

            //#snake is the g inside of the #snakeplot svg that contains all th circles
            that.circles = d3.select("#snake").selectAll("circle");
            that.circles.style("cursor", "pointer")

            //Set rect cursor to default
            let rect = d3.select("#snake").selectAll("rect");
            rect.style("cursor", "default")

            //Set al text pointer-events to none (They are infront of circles.)
            let text = d3.select("#snake").selectAll("text")
            text.style("pointer-events", "none")

            //On click essentially we freeze mouseover events by snake setting pointer events to none
            //Set the scatter circle pointer events to all so we can see see the tool tip
            that.circles.on("click", function(){
                if (!that.residue_clicked){
                    that.clicked_position =  d3.select(this)._groups[0][0].id
                    that.residue_clicked = true;
                    that.circles.style("pointer-events", "none")
                    that.scatter.points.selectAll(".scatter-circle").style("pointer-events", "all")
                } 
            })
            that.circles.on("mouseover", function(){
                if (!that.residue_clicked){
                    d3.select("#snake_tooltip")
                        .style("opacity",1)
                        .html(`Residue: ${d3.select(this)._groups[0][0].id}`)
                        .style("left", `${event.pageX + 40}px`)
                        .style("top", `${event.pageY - 30}px`)
                    
                    //Filter the scatter plot to only show the points at mousedover position
                    that.scatter.snakeMouseover(d3.select(this)._groups[0][0].id)
                    d3.select(this).style("fill", that.SELECT_SNAKE_COLOR)
                    d3.select(this).style("opacity",that.SNAKE_HOVER_OPACITY)
                }

            })
            
            that.circles.on("mouseleave", function(){ 
                if (!that.residue_clicked){
                    d3.select("#snake_tooltip")
                        .style("opacity",0)
                    that.scatter.snakeMouseleave()
                    d3.select(this).style("fill", "white")
                    d3.select(this).style("opacity",1)
                }
            })

        }).catch((error) => {
            //This should be a 404 error if the snake.svg is not found
            this.snake_drawn = false
        });
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        highlightSnake(selected_protein)

    When a section of scatter if brushed, this function is called.
    All of the positions that are brushed are highlighted by giving them a green stroke
    *////////////////////////////////////////////////////////////////////////////////////////////////
    highlightSnake(selected_positions){
        const that = this
        if(this.snake_drawn){
            this.circles
            .style("stroke", function(){
                d3.select(this)
                if (selected_positions.includes(d3.select(this)._groups[0][0].attributes[8].nodeValue)){
                    return(that.SELECT_SNAKE_COLOR)
                }
                else{
                    return("black")
                }
            })
            .style("stroke-width", function(){
                d3.select(this)
                if (selected_positions.includes(d3.select(this)._groups[0][0].attributes[8].nodeValue)){
                    return(that.HIGHLIGHTED_STROKE_WIDTH)
                }
                else{
                    return(that.DEFAULT_STROKE_WIDTH)
                }
            })
            .style("stroke-opacity", function(){
                d3.select(this)
                if (selected_positions.includes(d3.select(this)._groups[0][0].attributes[8].nodeValue)){
                    return(that.SNAKE_HOVER_OPACITY)
                }
                else{
                    return(1)
                }
            })  
        }
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        heatMousover(point)

    Called in sequence.js when the heat map is moused over
    Not called if a residue is already clicked
    *////////////////////////////////////////////////////////////////////////////////////////////////
    heatMousover(point){
        const that = this
        if (this.snake_drawn){
            let selected_pos = point.pos

            this.circles
            .style("fill", function(){
                d3.select(this)
                if (d3.select(this)._groups[0][0].attributes[8].nodeValue === selected_pos){
                    return(that.SELECT_SNAKE_COLOR)
                }
                else{
                    return("white")
                }
            })
            .style("opacity", function(){
                d3.select(this)
                if (d3.select(this)._groups[0][0].attributes[8].nodeValue === selected_pos){
                    return(that.SNAKE_HOVER_OPACITY)
                }
                else{
                    return(1)
                }
            })  
        }
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    /*
                                        heatMousover(point)

    Called in sequence.js when mouse leaves heat map
    Not called if a residue is already clicked
    *////////////////////////////////////////////////////////////////////////////////////////////////
    heatMouseleave(){
        if (this.snake_drawn){
            let circles = d3.select("#snake").selectAll("circle");
            circles
            .style("fill", "white")
            .style("opacity",1) 
        } 
    }
}