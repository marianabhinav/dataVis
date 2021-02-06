/* eslint-disable linebreak-style */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
import numeric from 'numeric';
import { filterData, createMatrix, euclideanDistance } from '../tools/helpers';

export default class Mds {
    constructor(data) {
        this.data = data;
    }

    /**
     * This code is taken from https://github.com/benfred/mds.js
     */
    mdsClassic(distances, dimensions) {
        dimensions = dimensions || 2;

        // square distances
        const M = numeric.mul(-0.5, numeric.pow(distances, 2));

        // double centre the rows/columns
        function mean(A) { return numeric.div(numeric.add.apply(null, A), A.length); }
        const rowMeans = mean(M);
        const colMeans = mean(numeric.transpose(M));
        const totalMean = mean(rowMeans);

        for (let i = 0; i < M.length; ++i) {
            for (let j = 0; j < M[0].length; ++j) {
                M[i][j] += totalMean - rowMeans[i] - colMeans[j];
            }
        }

        // take the SVD of the double centred matrix, and return the
        // points from it
        const ret = numeric.svd(M);
        const eigenValues = numeric.sqrt(ret.S);
        return ret.U.map(row => numeric.mul(row, eigenValues).splice(0, dimensions));
    }

    computeMds() {
        const columns = Object.keys(this.data[0]).filter(d => d !== 'class').filter(d => d !== '').filter(d => d !== 'id');
        const data = filterData(this.data, columns);
        const distMatrix = createMatrix(data.length, data.length);

        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j <= i; j++) {
                distMatrix[i][j] = euclideanDistance(data[i], data[j]);
                distMatrix[j][i] = distMatrix[i][j];
            }
        }
        const arr = this.mdsClassic(distMatrix);
        const resultarr = [];
        for (let i = 0; i < arr.length; i++) {
            resultarr[i] = {
                x: arr[i][0] * -1,
                y: arr[i][1] * -1,
                class: this.data[i].class,
            };
        }
        return resultarr;
    }
}
