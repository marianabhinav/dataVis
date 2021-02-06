import * as d3 from 'd3';
import * as $ from 'jquery';
import { graph } from '../algos/mstAlgo';

export default class ScatterplotMatrix {
    constructor(data) {
        this.data = data;
        return this.createScatterplotMatrix();
    }

    createScatterplotMatrix() {
        let columns = Object.keys(this.data[0]).filter(d => d !== 'class').filter(d => d !== '').filter(d => d !== 'id');
        const width = 960;
        const padding = 20;

        const { data } = this;
        const svg = d3.select('#scatterplotMatrix-vis').append('svg')
            .attr('viewBox', `${-padding} 0 ${width} ${width}`)
            .attr('height', width)
            .attr('width', width)
            .style('max-width', '100%')
            .style('height', 'auto')
            .style('display', 'table')
            .style('margin', '0 auto');

        columns = columns.slice(0, 5);
        columns.forEach((key) => {
            data.forEach((d) => {
                d[key] = +d[key];
            });
        });

        const subgraphSize = (width - (columns.length + 1) * padding) / columns.length + padding;

        const x = columns.map(c => d3.scaleLinear()
            .domain(d3.extent(data, d => d[c]))
            .range([padding / 2, subgraphSize - padding / 2]));
        const y = x.map(xx => xx.copy().range([subgraphSize - padding / 2, padding / 2]));
        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.class))
            .range(d3.schemeCategory10);

        const xAxis = d3.axisBottom()
            .ticks(6)
            .tickSize(subgraphSize * columns.length);
        svg.append('g').selectAll('g').data(x).join('g')
            .attr('transform', (d, i) => `translate(${i * subgraphSize},0)`)
            .each(function (d) {
                return d3.select(this).call(xAxis.scale(d));
            })
            .call(g => g.select('.domain').remove())
            .call(g => g.selectAll('.tick line').attr('stroke', '#ddd'));

        const yAxis = d3.axisLeft()
            .ticks(6)
            .tickSize(-subgraphSize * columns.length);
        svg.append('g').selectAll('g').data(y).join('g')
            .attr('transform', (d, i) =>
            // eslint-disable-next-line implicit-arrow-linebreak
                `translate(0,${i * subgraphSize})`)
            .each(function (d) {
                return d3.select(this).call(yAxis.scale(d));
            })
            .call(g => g.select('.domain').remove())
            .call(g => g.selectAll('.tick line').attr('stroke', '#ddd'));

        let counter = 0;
        const cell = svg.append('g')
            .selectAll('g')
            .data(d3.cross(d3.range(columns.length), d3.range(columns.length)))
            .join('g')
            .attr('transform', ([i, j]) => `translate(${i * subgraphSize},${j * subgraphSize})`)
            .attr('id', i => `group${++counter}`);


        cell.append('rect')
            .attr('fill', 'none')
            .attr('stroke', '#aaa')
            .attr('x', padding / 2 + 0.5)
            .attr('y', padding / 2 + 0.5)
            .attr('width', subgraphSize - padding)
            .attr('height', subgraphSize - padding);

        const tooltip = d3.select('#scatterplotMatrix-vis').append('div')
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
        + `<br>DataPoint: (${parseFloat(d3.select(this).attr('varI')).toFixed(2)}, ${parseFloat(d3.select(this).attr('varJ')).toFixed(2)})`
        + '<br>Degree: '}${nodeDegree}`;
            } else {
                html = `${`Class: ${d.class}<br>ID: ${i + 1
                    // eslint-disable-next-line no-bitwise
                }<br>ScreenPosition: (${~~d3.select(this).attr('cx')}, ${~~d3.select(this).attr('cy')})`
    + `<br>DataPoint: (${parseFloat(d3.select(this).attr('varI')).toFixed(2)}, ${parseFloat(d3.select(this).attr('varJ')).toFixed(2)})`}`;
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


        cell.each(function ([i, j]) {
            d3.select(this).selectAll('circle')
                .data(data)
                .join('circle')
                .attr('cx', d =>
                // eslint-disable-next-line implicit-arrow-linebreak
                    x[i](d[columns[i]]))
                .attr('cy', d => y[j](d[columns[j]]))
                .attr('class', `point${i}-${j}`)
                .attr('point-id', (d, index) => index)
                .attr('varI', d => d[columns[i]])
                .attr('varJ', d => d[columns[j]])
                .attr('cluster', d => d.class)
                .on('mouseover', mouseover)
                .on('mousemove', mousemove)
                .on('mouseout', mouseleave);
        });

        cell.selectAll('circle')
            .attr('r', 3)
            .attr('fill-opacity', 0.7)
            .attr('fill', d => color(d.class));

        svg.append('g')
            .style('font', 'bold 10px sans-serif')
            .selectAll('text')
            .data(columns)
            .join('text')
            .attr('transform', (d, i) => `translate(${i * subgraphSize},${i * subgraphSize})`)
            .attr('x', padding)
            .attr('y', padding)
            .attr('dy', '.71em')
            .text(d => d);
        return cell;
    }
}
