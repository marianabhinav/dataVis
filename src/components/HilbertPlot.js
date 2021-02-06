import * as d3 from 'd3';

export default class HilbertPlot {
    constructor(data) {
        this.data = data;
    }

    createHilbertPlot(key) {
        const columns = Object.keys(this.data[0]).filter(d => d !== 'class').filter(d => d !== '').filter(d => d !== 'id');
        const { data } = this;

        d3.select('#svg-container').remove();
        function hilbert(index, order) {
            function rot(n, xy, rx, ry) {
                if (ry === 0) {
                    if (rx === 1) {
                        xy[0] = (n - 1 - xy[0]);
                        xy[1] = (n - 1 - xy[1]);
                    }
                    xy.push(xy.shift());
                }
            }
            function distance2Point(d, n) {
                // eslint-disable-next-line one-var
                let rx,
                    ry,
                    t = d;
                const xy = [0, 0];

                for (let s = 1; s < n; s *= 2) {
                    rx = 1 & (t / 2);
                    ry = 1 & (t ^ rx);
                    rot(s, xy, rx, ry);
                    xy[0] += (s * rx);
                    xy[1] += (s * ry);
                    t /= 4;
                }
                return xy;
            }
            return distance2Point(index, 2 ** order);
        }

        const order = Math.ceil(data.length ** (1 / 4));

        if (key) {
            data.sort((a, b) => a[key] - b[key]);
        }

        const visContainer = d3.select('#hilbert-vis').append('div')
            .attr('id', 'svg-container');

        const width = 1000;
        const size = width / 4;

        columns.forEach((val) => {
            const values = data.map(d => parseFloat(d[val]));
            const colorScaler = d3.scaleSequential(d3.interpolateCool)
                .domain(d3.extent(values));
            const svg = visContainer.append('svg')
                .attr('id', val)
                .attr('height', size)
                .attr('width', size)
                .style('cursor', 'pointer')
                .style('display', 'inline');

            const pixelNumberWidth = Math.round((values.length ** (1 / 2)));
            const pixelWidth = Math.round(size / pixelNumberWidth);
            values.forEach((d, i) => {
                const hilbertPos = hilbert(i, order);
                svg.append('rect')
                    .attr('x', 100 + (hilbertPos[0] * pixelWidth / 2))
                    .attr('y', 50 + (hilbertPos[1] * pixelWidth / 2))
                    .attr('width', pixelWidth / 2)
                    .attr('height', pixelWidth / 2)
                    .attr('fill', colorScaler(d));
            });
            svg.on('click', () => {
                this.createHilbertPlot(svg.attr('id'));
            });
            svg.append('text')
                .text(val)
                .attr('x', 90)
                .attr('y', 40)
                .attr('fill', 'black');
        });
    }
}
