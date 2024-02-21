// function loadSVG(svgPath, containerId) {
//     d3.xml(svgPath).then((xml) => {
//         // Append the loaded SVG content to the container
//         d3.select(`#${containerId}`).node().appendChild(xml.documentElement);
//         // Call your visualization functions after loading the SVG, if needed
//         // For example: sequence.drawHeatMap();
//     });
// }

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

function truncateDecimals(number, digits) {
    var multiplier = Math.pow(10, digits),
        adjustedNum = number * multiplier,
        truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);

    return truncatedNum / multiplier;
};

function returnGroupings(sorting){



    let groupings = [
        {
        values: ["d1", "d2", "d3", "i1", "i2", "i3"],
        type:"Indel",
        color:"#808080" // grey
    }
]

    if (sorting == "properties"){
        groupings.push({
            values:["R", "H", "K"],
            type:"Positive Charge",
            color:"#ff0000" // Red
        })
        groupings.push({
            values:["D", "E"],
            type:"Negative Charge",
            color:"#0000ff" // Blue
        })
        groupings.push({
            values:["S", "T", "N", "Q"],
            type:"Uncharged",
            color:"#ffd700" // gold
        })
        groupings.push({
         
            values:["A", "V", "I", "L", "M", "F", "Y", "W"],
            type:"Hydrophobic",
            color:"#c71585" // violet
        })
        groupings.push({
            values:["C", "G", "P"],
            type:"Other",
            color:"#2e8b57" // sea green
        })
    }

    else if (sorting == "chemical"){
        groupings.push({
            values:["A", "G", "I", "L", "P", "V"],
            type:"Aliphatic",
            color:"#ff0000" // Red
        })
        groupings.push({
            values:["F", "W", "Y"],
            type:"Aromatic",
            color:"#0000ff" // Blue
        })
        groupings.push({
            values:["C", "M"],
            type:"Sulfer",
            color:"#ffd700" // gold
        })
        groupings.push({
            values:["S", "T"],
            type:"Hydroxyl",
            color:"#c71585" // violet
        })
        groupings.push({
            values:["R", "H", "K"],
            type:"Basic",
            color:"#2e8b57" // seagrean
        })
        groupings.push({
            values:["D", "E"],
            type:"Acidic",
            color:"#1e90ff" // dodger blue
        })
        groupings.push({
            values:["N", "Q"],
            type:"Amide",
            color:"#00ff00" // lime
        })
    }
    else if (sorting == "hydropathy"){
        groupings.push({
            values:["I", "V", "L", "F", "M", "A", "W"],
            type:"Hydrophobic",
            color:"#ff0000" // Red
        })
        groupings.push({
            values:["N", "D", "Q", "E", "K", "R"],
            type:"Hydrophilic",
            color:"#0000ff" // Blue
        })
        groupings.push({
            values:["G", "T", "S", "Y", "P", "H"],
            type:"Neutral",
            color:"#ffd700" // gold
        })
    }

    else if (sorting == "polarity"){
        groupings.push({
            values:["R", "N", "D", "Q", "E", "H", "K", "S", "T", "Y"],
            type:"Polar",
            color:"#ff0000" // Red
        })
        groupings.push({
            values:["A", "C", "G", "I", "L", "M", "F", "P", "W", "V"],
            type:"Nonpolar",
            color:"#0000ff" // Blue
        })
    }

    else if (sorting == "donor_acceptor"){
        groupings.push({
            values:["R", "K", "W"],
            type:"Hydrogen Donor",
            color:"#ff0000" // Red
        })
        groupings.push({
            values:["D", "E"],
            type:"Hydrogen Acceptor",
            color:"#0000ff" // Blue
        })
        groupings.push({
            values:["N", "Q", "H", "S", "T", "Y"],
            type:"Hydrogen Donor and Acceptor",
            color:"#ffd700" // gold
        })
        groupings.push({
            values:["A", "C", "G", "I", "L", "M", "F", "P", "V"],
            type:"None",
            color:"#c71585" // violet
        })
    }

    else if (sorting == "size"){
        groupings.push({
            values:["G", "A", "S"],
            type:"Very Small",
            color:"#ffe0e0" 
        })
        groupings.push({
            values:["C", "D", "P", "N", "T"],
            type:"Small",
            color:"#ffb5b2" 
        })
        groupings.push({
            values:["E", "V", "Q", "H"],
            type:"Medium",
            color:"#ff8980" 
        })
        groupings.push({
            values:["M", "I", "L", "K", "R"],
            type:"Large",
            color:"#ff5849" 
        })
        groupings.push({
            values:["F", "Y", "W"],
            type:"Very Large",
            color:"#ff0000" 
        })
    }

    return(groupings)

    }


// function returnGroupings(sorting){



//     let groupings = [
//         {
//         start:"d1",
//         stop:"i3",
//         type:"Indel",
//         color:"#808080" // grey
//     }
// ]

//     if (sorting == "properties"){
//         groupings.push({
//             start:"R",
//             stop:"K",
//             type:"Positive Charge",
//             color:"#ff0000" // Red
//         })
//         groupings.push({
//             start:"D",
//             stop:"E",
//             type:"Negative Charge",
//             color:"#0000ff" // Blue
//         })
//         groupings.push({
//             start:"S",
//             stop:"Q",
//             type:"Uncharged",
//             color:"#ffd700" // gold
//         })
//         groupings.push({
//             start:"A",
//             stop:"W",
//             type:"Hydrophobic",
//             color:"#c71585" // violet
//         })
//         groupings.push({
//             start:"C",
//             stop:"P",
//             type:"Other",
//             color:"#2e8b57" // sea green
//         })
//     }

//     else if (sorting == "chemical"){
//         groupings.push({
//             start:"A",
//             stop:"V",
//             type:"Aliphatic",
//             color:"#ff0000" // Red
//         })
//         groupings.push({
//             start:"F",
//             stop:"Y",
//             type:"Aromatic",
//             color:"#0000ff" // Blue
//         })
//         groupings.push({
//             start:"C",
//             stop:"M",
//             type:"Sulfer",
//             color:"#ffd700" // gold
//         })
//         groupings.push({
//             start:"S",
//             stop:"T",
//             type:"Hydroxyl",
//             color:"#c71585" // violet
//         })
//         groupings.push({
//             start:"R",
//             stop:"K",
//             type:"Basic",
//             color:"#2e8b57" // seagrean
//         })
//         groupings.push({
//             start:"D",
//             stop:"E",
//             type:"Acidic",
//             color:"#1e90ff" // dodger blue
//         })
//         groupings.push({
//             start:"N",
//             stop:"Q",
//             type:"Amide",
//             color:"#00ff00" // lime
//         })
//     }
//     else if (sorting == "hydropathy"){
//         groupings.push({
//             start:"I",
//             stop:"W",
//             type:"Hydrophobic",
//             color:"#ff0000" // Red
//         })
//         groupings.push({
//             start:"N",
//             stop:"R",
//             type:"Hydrophilic",
//             color:"#0000ff" // Blue
//         })
//         groupings.push({
//             start:"G",
//             stop:"H",
//             type:"Neutral",
//             color:"#ffd700" // gold
//         })
//     }

//     else if (sorting == "polarity"){
//         groupings.push({
//             start:"R",
//             stop:"Y",
//             type:"Polar",
//             color:"#ff0000" // Red
//         })
//         groupings.push({
//             start:"A",
//             stop:"V",
//             type:"Nonpolar",
//             color:"#0000ff" // Blue
//         })
//     }

//     else if (sorting == "donor_acceptor"){
//         groupings.push({
//             start:"R",
//             stop:"W",
//             type:"Hydrogen Donor",
//             color:"#ff0000" // Red
//         })
//         groupings.push({
//             start:"D",
//             stop:"E",
//             type:"Hydrogen Acceptor",
//             color:"#0000ff" // Blue
//         })
//         groupings.push({
//             start:"N",
//             stop:"Y",
//             type:"Hydrogen Donor and Acceptor",
//             color:"#ffd700" // gold
//         })
//         groupings.push({
//             start:"A",
//             stop:"V",
//             type:"None",
//             color:"#c71585" // violet
//         })
//     }

//     else if (sorting == "size"){
//         groupings.push({
//             start:"G",
//             stop:"S",
//             type:"Very Small",
//             color:"#ffe0e0" 
//         })
//         groupings.push({
//             start:"C",
//             stop:"T",
//             type:"Small",
//             color:"#ffb5b2" 
//         })
//         groupings.push({
//             start:"E",
//             stop:"H",
//             type:"Medium",
//             color:"#ff8980" 
//         })
//         groupings.push({
//             start:"M",
//             stop:"R",
//             type:"Large",
//             color:"#ff5849" 
//         })
//         groupings.push({
//             start:"F",
//             stop:"W",
//             type:"Very Large",
//             color:"#ff0000" 
//         })
//     }

//     return(groupings)

//     }
