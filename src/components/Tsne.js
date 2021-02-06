/* eslint-disable linebreak-style */
import TSNE from 'tsne-js';
import { filterData } from '../tools/helpers';


export default class Tsne {
    constructor(data) {
        this.data = data;
    }


    computeTsne(iterations, lrate, preplex) {
        const columns = Object.keys(this.data[0]).filter(d => d !== 'class').filter(d => d !== '').filter(d => d !== 'id');
        const data = filterData(this.data, columns);

        const model = new TSNE({
            dim: 2,
            perplexity: preplex,
            learningRate: lrate,
            nIter: iterations,
            metric: 'euclidean',
        });
        model.init({
            data,
            type: 'dense',
        });
        const [error, iter] = model.run();
        const arr = model.getOutput();

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
