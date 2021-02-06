/* eslint-disable linebreak-style */
/* eslint-disable import/no-mutable-exports */
import * as d3 from 'd3';
import * as $ from 'jquery';
import Graph from '../datastructres/Graph';
import { calcEuclideanDist } from '../tools/helpers';

export let graph = [];
export let outMeasures = [];

export function clearOutMeasureValuesArray() {
    outMeasures = [];
}

export function createMST(data, gp) {
    let minDist = 10000;
    let minIndex = -1;
    let dist = 0;
    const size = data.length;
    graph = [];
    graph = new Graph(size);
    const start = Math.floor(Math.random() * size);
    const Q = Array(size).fill(null).map(() => [minIndex, minDist]);
    const checked = [];

    let selected = start;
    checked.push(start);
    Q[start] = [-1, 0];

    graph.addToList(selected, data[start]);

    let view = 'g';
    if (gp !== undefined) {
        view = `#${gp}`;
    }

    while (checked.length < size) {
        for (let i = 0; i < size; i++) {
            if (!checked.includes(i)) {
                dist = calcEuclideanDist(data[selected], data[i]);
                if (dist < Q[i][1]) {
                    Q[i][0] = selected;
                    Q[i][1] = dist;
                }
                if (Q[i][1] < minDist) {
                    // eslint-disable-next-line prefer-destructuring
                    minDist = Q[i][1];
                    minIndex = i;
                }
            }
        }
        checked.push(minIndex);

        graph.addToList(minIndex, data[minIndex]);
        graph.addToGraph(minIndex, Q[minIndex][0], parseFloat(minDist.toFixed(2)));

        d3.select(view)
            .data(data)
            .lower()
            .append('line')
            .attr('x1', data[minIndex][0])
            .attr('y1', data[minIndex][1])
            .attr('x2', data[Q[minIndex][0]][0])
            .attr('y2', data[Q[minIndex][0]][1])
            .attr('stroke-width', 1)
            .attr('stroke', 'black')
            .style('opacity', 0.7);

        selected = minIndex;
        minDist = 10000;
        minIndex = -1;
    }

    const outliers = graph.calcOutlierNodes();
    const outMeasure = graph.calcOutlyingMeasure(outliers);
    console.log(`Outlying Measure: ${outMeasure}`);

    outMeasures.push(outMeasure);

    outliers.forEach((element) => {
        const currentNode = graph.nodeList[element[0]];

        d3.select(view)
            .append('circle')
            .attr('cx', currentNode.x)
            .attr('cy', currentNode.y)
            .attr('r', 10)
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-width', 2);
    });
}
