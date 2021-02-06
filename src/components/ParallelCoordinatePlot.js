/* eslint-disable eqeqeq */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-global-assign */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-loop-func */
/* eslint-disable no-undef */
import * as d3 from 'd3';
import * as $ from 'jquery';
import EdgeBundling from '../algos/EdgeBundling';
import { getColors } from '../tools/helpers';

export default class ParallelCoordinatePlot {
    constructor(data) {
        if (data !== undefined) this.data = data;
    }

    intialize() {
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

        this.visContainer = d3.select('#pcp-vis');

        this.columns = Object.keys(this.data[0]).filter(d => d !== 'class').filter(d => d !== '').filter(d => d !== 'id');

        this.x = d3.scalePoint(this.columns, [this.margins.left, this.visWidth - this.margins.right]);

        this.y = {};
        for (const i in this.columns) {
            name = this.columns[i];
            this.y[name] = d3.scaleLinear().range([this.visHeight - this.margins.bottom, this.margins.top]).domain(d3.extent(this.data, d => +d[name])).nice();
        }

        this.color = getColors(this.data);


        this.ebObject = new EdgeBundling(this.data, this.y, this.x);
        this.ebObject.clusterCentroids();
    }


    createPcp(alpha, beta) {
        const { columns } = this;
        const { x } = this;
        const { y } = this;

        this.svg = this.visContainer.append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.svg.append('g')
            .selectAll('g')
            .data(columns)
            .join('g')
            .attr('transform', d => `translate(${x(d)})`)
            .each(function (d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
            .call(g => g
                .append('text')
                .attr('x', -1)
                .attr('y', this.margins.top - 10)
                .attr('text-anchor', 'middle')
                .attr('fill', 'currentColor')
                .attr('font-size', 13)
                .text(d => d.split(' ')[0]));

        function path(d) {
            const points = d3.line()(columns.map(p => [x(p), y[p](d[p])]));
            return points;
        }
        if (alpha != 0 || beta != 0) {
            this.data.forEach((row) => {
                this.ebObject.drawBezeirCurve(row, this.color, alpha, beta);
            });
        } else {
            this.svg.append('g')
                .attr('fill', 'none')
                .selectAll('path')
                .data(this.data)
                .join('path')
                .attr('class', 'pcp-line')
                .attr('stroke', d => this.color(d.class))
                .attr('stroke-width', 1)
                .attr('d', path);
        }
    }
}
