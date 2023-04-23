import { React, useEffect, useState } from 'react'
import * as d3 from 'd3';
import Button from '@mui/material/Button';

import materials from '../../data/materials.json';
import {
    vizMargin, vizSize
} from '../viz_dimensions';


// transition info
const pour_duration = 2000;
const pourTransition = () => {
    return d3.transition().duration(pour_duration).ease(d3.easeCubicInOut);
}
const waterTransition = () => {
    return d3.transition().duration(3000).ease(d3.easeCubicInOut);
}

// constant axis info
const barX = d3
    .scaleBand()
    .domain(materials.map((d) => d.material))
    // .domain(['Cotton','Wool','Cellulosics','Hemp','Polyamide','Polyester'])
    .range([vizMargin.left, vizSize.width])
    .padding(0.1)
    .align(0.5);

const barXAxis = (g) =>
    g
        .attr("transform", `translate(0, ${vizSize.height})`)
        .call(d3.axisBottom().scale(barX));

const barY = d3
    .scaleLinear()
    .domain([0, d3.max(materials, (d) => d.water_use) + 15])
    .range([vizSize.height, vizMargin.top]);

const barYAxis = (g) =>
    g
        .attr("transform", `translate(${vizMargin.left}, 0)`)
        .call(d3.axisLeft().scale(barY));

// render initial chart
const render_chart = (data) => {
    // select the container
    const svg = d3.select('#material-water-svg')
        .attr("width", vizSize.width + vizMargin.left + vizMargin.right)
        .attr("height", vizSize.height + vizMargin.top + vizMargin.bottom);

    // add x axis
    svg.append("g").call(barXAxis);
    svg
        .append("text")
        .attr("x", vizSize.width / 2) // center label
        .attr("y", vizSize.height + vizMargin.bottom + vizMargin.top - 5)
        .attr("text-anchor", "middle")
        // .attr("font-size", 10)
        .text("Fabric Type");

    // add y axis
    svg.append("g").call(barYAxis);
    svg
        .append("text")
        // .attr("x", vizSize.width / 2) // center label
        // .attr("y", vizSize.height)
        // .attr("font-size", 10)
        .attr(
            "transform",
            `translate(${vizMargin.left / 2}, ${vizSize.height / 2})rotate(-90)`
        )
        .attr("text-anchor", "middle")
        .text("Water use (Liters per kg of fabric)");   
};

// render water pouring/bars growing
const render_bars = (data, updateButton) => {
    const svg = d3.select('#material-water-svg');
    // add water pouring
    svg
        .append("g")
        .attr("id", "material-water-pour-group")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("width", d => Math.pow(d.water_use, 0.5))
        .attr("x", d => barX(d.material) + barX.bandwidth() / 2 - Math.pow(d.water_use, 0.5) / 2)
        .attr("height", 10)
        .attr("fill", "lightblue")
        .transition(pourTransition())
        .attr("width", d => Math.pow(d.water_use, 0.5))
        .attr("x", d => barX(d.material) + barX.bandwidth() / 2 - Math.pow(d.water_use, 0.5) / 2)
        .attr("height", vizSize.height)
        .attr("y", d => 0)
        .attr("fill", "lightblue")
        .transition(pourTransition())
        .attr("x", d => barX(d.material) + barX.bandwidth() / 2 - Math.pow(d.water_use, 0.5) / 2)
        .attr("width", 0)
        .attr("height", 0)
        .attr("y", vizSize.height)
        .attr("fill", "lightblue");

    // add bars
    svg
        .append("g")
        .attr("id", "material-water-bar-group")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("class", "material-water-bars")
        .attr("id", d => d.material + '-water-bar')
        .attr("width", barX.bandwidth())
        .attr("x", d => barX(d.material))
        .attr("height", 0)
        .attr("y", vizSize.height)
        .attr("fill", "white")
        .attr("stroke", "transparent")
        .transition(waterTransition())
        .delay((d, i) => {
            return pour_duration / 2 + 100 * i;
        })
        .attr("height", (d) => vizSize.height - barY(d.water_use))
        .attr("y", (d) => barY(d.water_use))
        .attr("stroke", "black")
        .attr("fill", "lightblue");

    // add numbers
    svg
        .append("g")
        .attr("id", "numbers")
        .selectAll(".water-use-text")
        .data(data)
        .join("text")
        .attr('class', 'water-use-text')
        .attr("text-anchor", "middle")
        .attr("x", (d) => barX(d.material) + barX.bandwidth() / 2)
        .attr("y", vizSize.height - 5)
        .attr("opacity", 0)
        .transition(waterTransition())
        .delay((d, i) => {
            return pour_duration * 1.1 + 100 * i;
        })
        .attr("opacity", 1)
        .attr("y", (d) => barY(d.water_use) - 5)
        .text(d => d.water_use)

    // disable button after one pour
    updateButton(true);

};

export default function MaterialWaterUseViz() {
    const [waterPoured, setWaterPoured] = useState(false);

    // initial chart render
    useEffect(() => {
        render_chart(materials);
    }, []);

    return (
        <>
            <div>MaterialWaterUseViz</div>
            <Button
                id="pour-button"
                variant="contained"
                disabled = {waterPoured}
                onClick={() => { render_bars(materials,setWaterPoured) }}
            >Pour water.</Button><br/>
            <svg id="material-water-svg">
            </svg>
        </>
    )
}
