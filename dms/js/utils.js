function writeMethodsInfo(protein, descriptor_data){
    let experiment_description = descriptor_data[protein].experiment_description
    let protein_type = descriptor_data[protein].protein_type
    let cell_type = descriptor_data[protein].cell_type
    let construct_info = descriptor_data[protein].construct
    let insertion_info = descriptor_data[protein].insertion_info
    let publication_name = descriptor_data[protein].publication_name

    let return_string = ""

    if (experiment_description !== undefined){
        return_string = return_string + "Experiment Description: " + experiment_description + "<br><br>"
    }
    if (protein_type !== undefined){
        return_string = return_string + "Protein Type: " + protein_type + "<br><br>"
    }
    if (protein_type !== undefined){
        return_string = return_string + "Publication Name (click to copy link): " + publication_name + "<br><br>"
    }
    if (cell_type !== undefined){
        return_string = return_string + "Cell Type: " + cell_type + "<br><br>"
    }
    if (construct_info !== undefined){
        return_string = return_string + "Construct: " + construct_info + "<br><br>"
    }
    if (insertion_info !== undefined){
        return_string = return_string + "Insertion Info: " + insertion_info + "<br><br>"
    }

    return_string = return_string + "Designed and Created by Samuel Himes, English Lab"

    return(return_string)
}

//When the "Effect Size" text or the axis labels of the scatter plot are highlighted 
//A tool tip pops up to describe what the condition is.
//The format of the condition object is in the description.json file
function formatConditionText(condition){
    let assay_text = "Assay Description: " + condition.assay_description + "<br><br>"
    let low_txt = "Low Effect Size: " + condition.low + "<br>"
    let high_text = "High Effect Size:  " + condition.high + "<br>"

    return assay_text + high_text + low_txt
}

//Loads in svg (Used for loading snake svg)
//svgPath should be a path to an XML file
//containerID is the div where the svg will be put.
function loadSVG(svgPath, containerId) {
    return new Promise((resolve, reject) => {
        d3.xml(svgPath).then((xml) => {
            // Append the loaded SVG content to the container
            const container = d3.select(`#${containerId}`).node();
            if (container) {
                container.appendChild(xml.documentElement);
                resolve(xml.documentElement);
            } else {
                reject(new Error(`Container with ID '${containerId}' not found`));
            }
        }).catch((error) => {
            reject(error);
        });
    });
}

//Takes single letter code and return AA name
// getFullName(A) -> Alanine
function getFullName(code){
    const aaMap = new Map([
        ['G', 'Glycine'],
        ['A', 'Alanine'],
        ['V', 'Valine'],
        ['L', 'Leucine'],
        ['I', 'IsoLeucine'],
        ['T', 'Threonine'],
        ['S', 'Serine'],
        ['M', 'Methionine'],
        ['C', 'Cystein'],
        ['P', 'Proline'],
        ['F', 'Phenylalanine'],
        ['Y', 'Tyrosine'],
        ['W', 'Tryptophane'],
        ['H', 'Histidine'],
        ['K', 'Lysine'],
        ['R', 'Argenine'],
        ['D', 'Aspartate'],
        ['E', 'Glutamate'],
        ['N', 'Asparagine'],
        ['Q', 'Glutamine'],
        ['d1', 'Single Deletion'],
        ['d2', 'Double Deletion'],
        ['d3', 'Triple Deletion'],
        ['i1', 'Single Insertion'],
        ['i2', 'Double Insertion'],
        ['i3', 'Triple Insertion'],
      ])
      return(aaMap.get(code))
}


//Takes a key word (sorting). Can be properties/hydropathy/size/chemical/donor_acceptor/polarity
//Those values are the values from the sort_select input element
//Also takes a list of the current mutations 
//Returns the given mutations in the spedified order
// returnOrder("properties", ["P","i3","R"]) -> ["R", "P", "i3"]
function returnOrder(sorting, mutations){
    const orderMap = new Map();
    orderMap.set("properties", ["R","H","K","D","E","S","T","N","Q","A","V","I","L","M","F","Y","W","C","G","P","d1","d2","d3","i1","i2","i3"])
    orderMap.set("hydropathy", ["I","V","L","F","C","M","A","W","G","T","S","Y","P","H","N","D","Q","E","K","R","d1","d2","d3","i1","i2","i3"])
    orderMap.set("size", ["G","A","S","C","D","P","N","T","E","V","Q","H","M","I","L","K","R","F","Y","W","d1","d2","d3","i1","i2","i3"])
    orderMap.set("chemical", ["A","G","I","L","P","V","F","W","Y","C","M","S","T","R","H","K","D","E","N","Q","d1","d2","d3","i1","i2","i3"])
    orderMap.set("donor_acceptor", ["R","K","W","D","E","N","Q","H","S","T","Y","A","C","G","I","L","M","F","P","V","d1","d2","d3","i1","i2","i3"])
    orderMap.set("polarity", ["R","N","D","Q","E","H","K","S","T","Y","A","C","G","I","L","M","F","P","W","V","d1","d2","d3","i1","i2","i3"])

    let orderedList = orderMap.get(sorting)
    let orderedResult = [];
    for (let i = 0; i < orderedList.length; i++) {
        if (mutations.includes(orderedList[i])) {
            orderedResult.push(orderedList[i]);
        }
    }

    return(orderedResult)
}


//Truncates number to n digits
//truncateDecimals(2.99999,2) -> 2.99
function truncateDecimals(number, digits) {
    var multiplier = Math.pow(10, digits),
        adjustedNum = number * multiplier,
        truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);

    return truncatedNum / multiplier;
};


//These were repeated alot in the code, so I just took them out to here
//defaultMouseover -> show tool tip
//defaultMousemove -> set position and text
//defaultMouseleave -> remove tool tip
//Not used in every tool tip case.
function defaultMouseover(width = "auto"){
    d3.select("#default_tooltip")
        .style("opacity", 1)
        .style("width", width)
}
function defaultMousemove(text,event,shift_x,shift_y){
    d3.select("#default_tooltip")
        .html(text)
        .style("left", `${event.pageX + shift_x}px`)
        .style("top", `${event.pageY + shift_y}px`)
}
function defaultMouseleave(){
    d3.select("#default_tooltip")
        .style("opacity", 0)
        .style("width", "auto")

}

//Takes a key word (sorting). Can be properties/hydropathy/size/chemical/donor_acceptor/polarity
//Those values are the values from the sort_select input element
//Returns a vector of object {values:[amino acid codes that match this sorting], type:"the grouping category", color:"the color"}
//Also returns a map. This map conatins all the mutation codes and their corresponding colors.
//For example map.get("i1") --> grey
function returnGroupings(sorting){
    let red = "#ff0000"
    let blue = "#0000ff"
    let gold = "#ffd700"
    let violet = "#c71585"
    let sea_green = "#2e8b57"
    let dodger_blue = "#1e90ff"
    let lime = "#00ff00"
    let very_small_color = "#ffe0e0"
    let small_color = "#ffb5b2" 
    let medium_color = "#ff8980" 
    let large_color = "#ff5849" 
    let very_large_color = "#ff0000" 

    let groupings = [
        {
        values: ["d1", "d2", "d3", "i1", "i2", "i3"],
        type:"Indel",
        color:"#808080" // grey
    }]

    if (sorting == "properties"){
        groupings.push({
            values:["R", "H", "K"],
            type:"Positive Charge",
            color:red 
        })
        groupings.push({
            values:["D", "E"],
            type:"Negative Charge",
            color:blue
        })
        groupings.push({
            values:["S", "T", "N", "Q"],
            type:"Uncharged",
            color:gold
        })
        groupings.push({
         
            values:["A", "V", "I", "L", "M", "F", "Y", "W"],
            type:"Hydrophobic",
            color:violet
        })
        groupings.push({
            values:["C", "G", "P"],
            type:"Other",
            color:sea_green
        })
    }

    else if (sorting == "chemical"){
        groupings.push({
            values:["A", "G", "I", "L", "P", "V"],
            type:"Aliphatic",
            color:red
        })
        groupings.push({
            values:["F", "W", "Y"],
            type:"Aromatic",
            color:blue
        })
        groupings.push({
            values:["C", "M"],
            type:"Sulfer",
            color:gold
        })
        groupings.push({
            values:["S", "T"],
            type:"Hydroxyl",
            color:violet
        })
        groupings.push({
            values:["R", "H", "K"],
            type:"Basic",
            color:sea_green
        })
        groupings.push({
            values:["D", "E"],
            type:"Acidic",
            color:dodger_blue
        })
        groupings.push({
            values:["N", "Q"],
            type:"Amide",
            color:lime
        })
    }
    else if (sorting == "hydropathy"){
        groupings.push({
            values:["I", "V", "L", "F", "M", "A", "W"],
            type:"Hydrophobic",
            color:red
        })
        groupings.push({
            values:["N", "D", "Q", "E", "K", "R"],
            type:"Hydrophilic",
            color:blue
        })
        groupings.push({
            values:["G", "T", "S", "Y", "P", "H"],
            type:"Neutral",
            color:gold
        })
    }

    else if (sorting == "polarity"){
        groupings.push({
            values:["R", "N", "D", "Q", "E", "H", "K", "S", "T", "Y"],
            type:"Polar",
            color:gold
        })
        groupings.push({
            values:["A", "C", "G", "I", "L", "M", "F", "P", "W", "V"],
            type:"Nonpolar",
            color:blue
        })
    }

    else if (sorting == "donor_acceptor"){
        groupings.push({
            values:["R", "K", "W"],
            type:"Hydrogen Donor",
            color:red
        })
        groupings.push({
            values:["D", "E"],
            type:"Hydrogen Acceptor",
            color:blue
        })
        groupings.push({
            values:["N", "Q", "H", "S", "T", "Y"],
            type:"Hydrogen Donor and Acceptor",
            color:gold
        })
        groupings.push({
            values:["A", "C", "G", "I", "L", "M", "F", "P", "V"],
            type:"None",
            color:violet
        })
    }

    
    else if (sorting == "size"){
        groupings.push({
            values:["G", "A", "S"],
            type:"Very Small",
            color:very_small_color 
        })
        groupings.push({
            values:["C", "D", "P", "N", "T"],
            type:"Small",
            color:small_color 
        })
        groupings.push({
            values:["E", "V", "Q", "H"],
            type:"Medium",
            color:medium_color
        })
        groupings.push({
            values:["M", "I", "L", "K", "R"],
            type:"Large",
            color:large_color
        })
        groupings.push({
            values:["F", "Y", "W"],
            type:"Very Large",
            color:very_large_color
        })
    }

    //get a map of selected grouping
    //take amino acid code as input and the color as the output
    let map = new Map();
    groupings.forEach((g) => {
        g.values.forEach((v) => {
            map.set(v, g.color)
        })
    })

    return([groupings, map])
    }

