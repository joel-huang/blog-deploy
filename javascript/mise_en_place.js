const dim = 300;
const gsize = 20;
const gdim = parseInt(dim / gsize);
const transitionTime = 100;
const imgUrl = "10452_sat.jpg"

function round(p, n) {
    return p % n < n / 2 ? p - (p % n) : p + n - (p % n);
}

function getRandomColors(x, y, size) {
    let rng = new Math.seedrandom((x+1)/(y+1)+x+y);
    let array = Array();
    for (let i = 0; i < size; i++) {
    const value = parseInt(rng() * 255);
    array.push(`rgb(${value}, ${value}, ${value})`);
    }
    return array;
}

function drawGrid(full) {
    for (let i = 0; i < gsize - 1; i++) {
    full.append("line")
        .attr("x1", (i + 1) * gdim)
        .attr("y1", 0)
        .attr("x2", (i + 1) * gdim)
        .attr("y2", dim)
        .attr("stroke", "rgba(255, 255, 255, 0.4)")
        .attr("stroke-width", 1);
    full.append("line")
        .attr("x1", 0)
        .attr("y1", (i + 1) * gdim)
        .attr("x2", dim)
        .attr("y2", (i + 1) * gdim)
        .attr("stroke", "rgba(255, 255, 255, 0.4)")
        .attr("stroke-width", 1);  
    }
}

function drawRects(vector, x, y) {
    const numRects = 8;
    const spacing = 5;
    const totalSpacing = spacing * (numRects + 1);
    const rectSize = parseInt((vector.attr("height") - totalSpacing) / numRects);
    const colors = getRandomColors(x, y, numRects);

    let rects = vector.selectAll("rect");

    for (let i = 0; i < numRects; i++) {
    let r = rects[i];
    if (r === undefined) {
        r = vector.append("rect")
        .attr("x", spacing)
        .attr("y", (i + 1) * spacing + i * rectSize)
        .attr("width", rectSize)
        .attr("height", rectSize);
    }
        r.attr("style", `fill: ${colors[i]}`);
    };
    vector.attr("width", rectSize + 2 * spacing);
    vector.attr("height", numRects * (rectSize + spacing) + spacing);
    return numRects;
}

function animateGradient(gradient) {
    if (gradient.attr("gradientTransform") === "rotate(360)") {
    gradient.attr("gradientTransform", "rotate(0)")
    }
    gradient.transition()
    .duration(2000)
    .ease(d3.easeQuadOut)
    .attr("gradientTransform", "rotate(360)")
    .on("end", animateGradient);
};

const full = d3.select("#full")
    .attr("cursor", "none")
    .attr("width", dim)
    .attr("height", dim);

const zoomed = d3.select("#zoomed")
    .attr("width", dim)
    .attr("height", dim);

const img = full.append("svg:image")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", dim)
    .attr("height", dim)
    .attr("xlink:href", imgUrl)

drawGrid(full);

const rect = full.append("rect")
    .attr("width", gdim)
    .attr("height", gdim)
    .attr("style", "fill: rgba(0, 0, 0, 0.1); stroke-width: 2; stroke: rgb(255, 255, 255);");

const magnified = zoomed.append("svg:image")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", dim * gsize)
    .attr("height", dim * gsize)
    .attr("xlink:href", imgUrl)
    .attr("image-rendering", "pixelated");

const encoder = d3.select("#encoder")
    .attr("width", parseInt(dim / 1.25))
    .attr("height", dim);

const w = encoder.attr("width");
const h = encoder.attr("height");
const px = parseInt(w / 5);
const py = 2 * px;
encoder.append("polygon")
    .attr("points", `${w-px} ${py}, ${px} ${px}, ${px} ${h-px}, ${w-px} ${h-py}`)
    .attr("fill", "rgba(0, 0, 0, 0.1)")
    .attr("stroke", "rgba(0, 0, 0, 0.6)")
    .attr("stroke-width", 2);

encoder.append("text")
    .attr("x", parseInt(w / 2))
    .attr("y", parseInt(h / 2))
    .style("text-anchor", "middle")
    .style("fill", "rgba(0, 0, 0, 0.6)")
    .style("font-size", 12)
    .text("Pre-trained encoder");

const embedding = d3.select("#embedding")
    .attr("height", dim);

let rects = drawRects(embedding, 0, 0);
embedding.append("rect")
    .attr("id", "cont")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", embedding.attr("width"))
    .attr("height", embedding.attr("height"))
    .attr("style", "fill: rgba(0, 0, 0, 0); stroke-width: 4; stroke: rgba(0, 0, 0, 0.6);");

full.on("mousemove", (event) => {
    const coords = d3.pointer( event );
    const x = round(Math.max(0, Math.min(img.attr("width") - gdim, coords[0] - parseInt(gdim / 2))), gdim);
    const y = round(Math.max(0, Math.min(img.attr("width") - gdim, coords[1] - parseInt(gdim / 2))), gdim);
    rect.transition()
    .duration(transitionTime)
    .ease(d3.easeQuadOut)
    .attr("x", x)
    .attr("y", y);

    magnified.transition()
    .duration(transitionTime)
    .ease(d3.easeQuadOut)
    .attr("x", -x * gsize)
    .attr("y", -y * gsize);
    
    drawRects(embedding, x, y);
});