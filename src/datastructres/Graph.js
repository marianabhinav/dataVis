/* eslint-disable linebreak-style */
/* eslint-disable prefer-destructuring */
import * as d3 from 'd3';

export class GraphNode {
    constructor(index, val) {
        this.index = index;
        this.x = val[0];
        this.y = val[1];
    }
}

export default class Graph {
    constructor(size) {
        this.distances = [];
        this.nodeList = Array(size);
        this.graph = Array(size).fill(null).map(() => Array(size));
    }

    addToGraph(node, parent, distance) {
        this.graph[parent][node] = distance;
        this.graph[node][parent] = distance;
        this.distances.push(distance);
    }

    addToList(index, val) {
        this.nodeList[index] = new GraphNode(index, val);
    }

    calcWeight() {
        this.distances.sort((a, b) => a - b);
        const q75 = d3.quantile(this.distances, 0.75);
        const q25 = d3.quantile(this.distances, 0.25);
        return q75 + 1.5 * (q75 - q25);
    }

    calcOutlyingMeasure(nodes) {
        let nodeDist = 0;
        nodes.forEach((element) => {
            nodeDist += this.graph[element[0]][element[1]];
        });
        return nodeDist / d3.sum(this.distances);
    }

    calcNbr(index) {
        let flag = false;
        let nbr = -1;
        for (let i = 0; i < this.graph.length; i++) {
            if (this.graph[index][i] !== undefined) {
                if (flag === true) {
                    return -1;
                }
                flag = true;
                nbr = i;
            }
        }
        return nbr;
    }

    calcOutlierNodes() {
        const weight = this.calcWeight();
        const outliers = [];
        for (let i = 0; i < this.graph.length; i++) {
            const nbr = this.calcNbr(i);
            if (nbr !== -1) {
                if (this.graph[i][nbr] > weight) {
                    outliers.push([i, nbr]);
                }
            }
        }
        return outliers;
    }

    calcDegree(index) {
        if (this.graph[index] === undefined) debugger;
        return this.graph[index].filter(String).length;
    }
}
