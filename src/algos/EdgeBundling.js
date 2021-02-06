/* eslint-disable linebreak-style */
/* eslint-disable prefer-destructuring */
import * as d3 from 'd3';
import * as $ from 'jquery';

export default class EdgeBundling {
    constructor(data, yScale, xScale) {
        this.data = data;
        this.dimensions = yScale;
        this.x = xScale;
        this.dimensionBundle = d3.keys(yScale)[0];
    }

    clusterCentroids() {
        const y = this.dimensions;
        const d = this.dimensionBundle;
        const clusterCentroids = d3.map();
        const noOfClusters = d3.map();

        this.data.forEach((row) => {
            const scaledValue = y[d](row[d]);
            if (!noOfClusters.has(scaledValue)) {
                noOfClusters.set(scaledValue, 0);
            }
            const count = noOfClusters.get(scaledValue);
            noOfClusters.set(scaledValue, count + 1);
        });

        this.data.forEach((row) => {
            d3.keys(y).map((p, i) => {
                const scaled = y[d](row[d]);
                if (!clusterCentroids.has(scaled)) {
                    clusterCentroids.set(scaled, d3.map());
                }
                if (!clusterCentroids.get(scaled).has(p)) {
                    clusterCentroids.get(scaled).set(p, 0);
                }
                let value = clusterCentroids.get(scaled).get(p);
                value += y[d](row[d]) / noOfClusters.get(scaled);
                clusterCentroids.get(scaled).set(p, value);
            });
        });

        this.clusterCentroids = clusterCentroids;
        return clusterCentroids;
    }

    centroids(row, beta) {
        const centroids = [];
        const { dimensions } = this;

        const dim = d3.keys(dimensions);
        const dimLength = dim.length;
        const midPoint = 0.5;
        for (let i = 0; i < dimLength; ++i) {
            const x = this.x(dim[i]);
            const y = dimensions[dim[i]](row[dim[i]]);

            const centroidVectorReal = [x, y];
            centroids.push(centroidVectorReal);

            if (i < dimLength - 1) {
                const cx = x + midPoint * (this.x(dim[i + 1]) - x);
                let cy = y + midPoint * (dimensions[dim[i + 1]](row[dim[i + 1]]) - y);
                const leftCentroid = this.clusterCentroids.get(dimensions[this.dimensionBundle](row[this.dimensionBundle])).get(dim[i]);
                const rightCentroid = this.clusterCentroids.get(dimensions[this.dimensionBundle](row[this.dimensionBundle])).get(dim[i + 1]);
                const centroid = 0.5 * (leftCentroid + rightCentroid);
                cy = centroid + (1 - beta) * (cy - centroid);
                const centroidVectorV = [cx, cy];
                centroids.push(centroidVectorV);
            }
        }
        return centroids;
    }

    controlPoints(centroids, alpha) {
        const cols = centroids.length;
        const cps = [];

        cps.push(centroids[0]);
        cps.push(([centroids[0][0] + alpha * 2 * (centroids[1][0] - centroids[0][0]), centroids[0][1]]));
        for (let col = 1; col < cols - 1; ++col) {
            const mid = centroids[col];
            const left = centroids[col - 1];
            const right = centroids[col + 1];
            const diff = [left[0] - right[0], left[1] - right[1]];
            const diffAlpha = [diff[0] * alpha, diff[1] * alpha];
            cps.push([mid[0] + diffAlpha[0], mid[1] + diffAlpha[1]]);
            cps.push(mid);
            cps.push([mid[0] - diffAlpha[0], mid[1] - diffAlpha[1]]);
        }
        cps.push([centroids[cols - 1][0] + alpha * 2 * (centroids[cols - 2][0] - centroids[cols - 1][0]), centroids[cols - 1][1]]);
        cps.push(centroids[cols - 1]);
        this.control_points = cps;
        return cps;
    }

    drawBezeirCurve(d, color, alpha, beta) {
        const centroids = this.centroids(d, beta);
        const cps = this.controlPoints(centroids, alpha);

        const path = d3.path();
        path.moveTo(cps[0][0], cps[0][1]);
        for (let i = 1; i < cps.length; i += 3) {
            path.bezierCurveTo(cps[i][0], cps[i][1], cps[i + 1][0], cps[i + 1][1], cps[i + 2][0], cps[i + 2][1]);
            d3.select('svg').call(svg => svg.append('path')
                .attr('fill', 'none')
                .attr('class', 'pcp-line')
                .attr('stroke', color(d.class))
                .attr('stroke-width', 0.8)
                .attr('d', path.toString()))
                .node();
        }
    }
}
