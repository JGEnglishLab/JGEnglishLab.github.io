function loadSVG(svgPath, containerId) {
    d3.xml(svgPath).then((xml) => {
        // Append the loaded SVG content to the container
        d3.select(`#${containerId}`).node().appendChild(xml.documentElement);
        // Call your visualization functions after loading the SVG, if needed
        // For example: sequence.drawHeatMap();
    });
}

function returnOrder(sorting){
    let properties = ["R","H","K","D","E","S","T","N","Q","A","V","I","L","M","F","Y","W","C","G","P","d1","d2","d3","i1","i2","i3"]
    let hydropathy = ["I","V","L","F","C","M","A","W","G","T","S","Y","P","H","N","D","Q","E","K","R","d1","d2","d3","i1","i2","i3"]
    let size = ["G","A","S","C","D","P","N","T","E","V","Q","H","M","I","L","K","R","F","Y","W","d1","d2","d3","i1","i2","i3"]
    let chemical = ["A","G","I","L","P","V","F","W","Y","C","M","S","T","R","H","K","D","E","N","Q","d1","d2","d3","i1","i2","i3"]
    let donor_acceptor = ["R","K","W","D","E","N","Q","H","S","T","Y","A","C","G","I","L","M","F","P","V","d1","d2","d3","i1","i2","i3"]
    let polarity = ["R","N","D","Q","E","H","K","S","T","Y","A","C","G","I","L","M","F","P","W","V","d1","d2","d3","i1","i2","i3"]
  
    if (sorting == "properties"){
        return(properties)
    }
    else if  (sorting == "hydropathy"){
        return(hydropathy)
    }
    else if  (sorting == "size"){
        return(size)
    }
    else if  (sorting == "chemical"){
        return(chemical)
    }
    else if  (sorting == "donor_acceptor"){
        return(donor_acceptor)
    }
    else if  (sorting == "polarity"){
        return(polarity)
    }
}

function truncateDecimals(number, digits) {
    var multiplier = Math.pow(10, digits),
        adjustedNum = number * multiplier,
        truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);

    return truncatedNum / multiplier;
};

function returnGroupings(sorting){



    let groupings = [{
        start:"d1",
        stop:"i3",
        type:"Indel",
        color:"#808080" // grey
    }]

    if (sorting == "properties"){
        groupings.push({
            start:"R",
            stop:"K",
            type:"Positive Charge",
            color:"#ff0000" // Red
        })
        groupings.push({
            start:"D",
            stop:"E",
            type:"Negative Charge",
            color:"#0000ff" // Blue
        })
        groupings.push({
            start:"S",
            stop:"Q",
            type:"Uncharged",
            color:"#ffd700" // gold
        })
        groupings.push({
            start:"A",
            stop:"W",
            type:"Hydrophobic",
            color:"#c71585" // violet
        })
        groupings.push({
            start:"C",
            stop:"P",
            type:"Other",
            color:"#2e8b57" // sea green
        })
    }

    else if (sorting == "chemical"){
        groupings.push({
            start:"A",
            stop:"V",
            type:"Aliphatic",
            color:"#ff0000" // Red
        })
        groupings.push({
            start:"F",
            stop:"Y",
            type:"Aromatic",
            color:"#0000ff" // Blue
        })
        groupings.push({
            start:"C",
            stop:"M",
            type:"Sulfer",
            color:"#ffd700" // gold
        })
        groupings.push({
            start:"S",
            stop:"T",
            type:"Hydroxyl",
            color:"#c71585" // violet
        })
        groupings.push({
            start:"R",
            stop:"K",
            type:"Basic",
            color:"#2e8b57" // seagrean
        })
        groupings.push({
            start:"D",
            stop:"E",
            type:"Acidic",
            color:"#1e90ff" // dodger blue
        })
        groupings.push({
            start:"N",
            stop:"Q",
            type:"Amide",
            color:"#00ff00" // lime
        })
    }
    else if (sorting == "hydropathy"){
        groupings.push({
            start:"I",
            stop:"W",
            type:"Hydrophobic",
            color:"#ff0000" // Red
        })
        groupings.push({
            start:"N",
            stop:"R",
            type:"Hydrophilic",
            color:"#0000ff" // Blue
        })
        groupings.push({
            start:"G",
            stop:"H",
            type:"Neutral",
            color:"#ffd700" // gold
        })
    }

    else if (sorting == "polarity"){
        groupings.push({
            start:"R",
            stop:"Y",
            type:"Polar",
            color:"#ff0000" // Red
        })
        groupings.push({
            start:"A",
            stop:"V",
            type:"Nonpolar",
            color:"#0000ff" // Blue
        })
    }

    else if (sorting == "donor_acceptor"){
        groupings.push({
            start:"R",
            stop:"W",
            type:"Donor",
            color:"#ff0000" // Red
        })
        groupings.push({
            start:"D",
            stop:"E",
            type:"Acceptor",
            color:"#0000ff" // Blue
        })
        groupings.push({
            start:"N",
            stop:"Y",
            type:"Donor and Acceptor",
            color:"#ffd700" // gold
        })
        groupings.push({
            start:"A",
            stop:"V",
            type:"None",
            color:"#c71585" // violet
        })
    }

    else if (sorting == "size"){
        groupings.push({
            start:"G",
            stop:"S",
            type:"Very Small",
            color:"#ffe0e0" 
        })
        groupings.push({
            start:"C",
            stop:"T",
            type:"Small",
            color:"#ffb5b2" 
        })
        groupings.push({
            start:"E",
            stop:"H",
            type:"Medium",
            color:"#ff8980" 
        })
        groupings.push({
            start:"M",
            stop:"R",
            type:"Large",
            color:"#ff5849" 
        })
        groupings.push({
            start:"F",
            stop:"W",
            type:"Very Large",
            color:"#ff0000" 
        })
    }

    return(groupings)

    }
