import * as d3 from 'd3';
import * as $ from 'jquery';
import { graph } from '../algos/mstAlgo';
import { getColors } from '../tools/helpers';

export default class Scatterplot {
    constructor(data, vis) {
        this.data = data;
        this.intialize(vis);
        this.createScatterPlot();
    }

    intialize(vis) {
        this.margins = {
            top: 30,
            right: 50,
            bottom: 50,
            left: 80,
        };

        this.width = 1200;
        this.height = 800;
        this.visWidth = this.width - this.margins.left - this.margins.right;
        this.visHeight = this.height - this.margins.top - this.margins.bottom;

        this.visContainer = d3.select(`#${vis}-vis`);
        this.svg = this.visContainer.append('svg')
            .attr('width', this.width)
            .attr('height', this.height);
    }

    createScatterPlot() {
        const color = getColors(this.data);
        let cindex;
        const keys = Object.keys(this.data[0]);
        if (keys[0] === '') cindex = 1;
        else cindex = 0;
        this.viewport = this.svg.append('g')
            .attr('transform', `translate(${this.margins.left},${this.margins.top})`);
        const visualization = this.viewport.append('g');

        const dim1X = d3.scaleLinear()
            .domain(d3.extent(this.data.map(x => Object.values(x)[cindex])))
            .range([0, this.visWidth]).nice();

        const dim2Y = d3.scaleLinear()
            .domain(d3.extent(this.data.map(x => Object.values(x)[cindex + 1])))
            .range([this.visHeight, 0]).nice();

        visualization.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${this.visHeight})`)
            .call(d3.axisBottom(dim1X));

        visualization.append('g')
            .attr('class', 'left-axis')
            .call(d3.axisLeft(dim2Y));

        visualization.append('text').text(keys[cindex])
            .attr('text-anchor', 'end')
            .attr('x', this.visWidth / 2)
            .attr('y', this.visHeight + this.margins.top);

        visualization.append('text').text(keys[cindex + 1])
            .attr('text-anchor', 'end')
            .attr('transform', 'rotate(-90)')
            .attr('x', -this.visHeight / 2 + this.margins.bottom)
            .attr('y', -this.margins.right + 10);

        const tooltip = this.visContainer.append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0)
            .style('background-color', 'white')
            .style('color', 'black')
            .style('border', 'solid')
            .style('border-width', '4px')
            .style('border-radius', '6px')
            .style('padding', '10px')
            .style('position', 'absolute');

        const mouseover = function (d) {
            tooltip
                .style('opacity', 1)
                .style('border-color', color(d.class));
            d3.select(this)
                .style('stroke', 'black')
                .style('opacity', 1);
        };

        const mousemove = function (d, i) {
            let nodeDegree = 0;
            let html = '';
            if (graph.length !== 0) {
                nodeDegree = graph.calcDegree(i);
                html = `${`Class: ${d.class}<br>ID: ${i + 1
                // eslint-disable-next-line no-bitwise
                }<br>ScreenPosition: (${~~d3.select(this).attr('cx')}, ${~~d3.select(this).attr('cy')})`
        + `<br>DataPoint: (${parseFloat(d[keys[cindex]]).toFixed(2)}, ${parseFloat(d[keys[cindex + 1]]).toFixed(2)})`
        + '<br>Degree: '}${nodeDegree}`;
            } else {
                html = `${`Class: ${d.class}<br>ID: ${i + 1
                    // eslint-disable-next-line no-bitwise
                }<br>ScreenPosition: (${~~d3.select(this).attr('cx')}, ${~~d3.select(this).attr('cy')})`
    + `<br>DataPoint: (${parseFloat(d[keys[cindex]]).toFixed(2)}, ${parseFloat(d[keys[cindex + 1]]).toFixed(2)})`}`;
            }
            tooltip
                .html(html)
                .style('left', `${parseFloat(d3.event.pageX) + 5}px`)
                .style('top', `${parseFloat(d3.event.pageY) + 5}px`);
        };

        const mouseleave = function () {
            tooltip
                .style('opacity', 0);
            d3.select(this)
                .style('stroke', 'none')
                .style('opacity', 0.8);
        };

        visualization.selectAll('dot')
            .data(this.data)
            .enter()
            .append('circle')
            .attr('cx', d => dim1X(d[keys[cindex]]))
            .attr('cy', d => dim2Y(d[keys[cindex + 1]]))
            .attr('r', '5')
            .style('fill', d => color(d.class))
            .style('stroke', 'none')
            .style('opacity', 0.8)
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseleave', mouseleave);
    }
}
