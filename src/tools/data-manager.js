import * as d3 from 'd3';
import * as $ from 'jquery';
import { capitalize } from './helpers';

const files = ['artificial',
    'education',
    'iris_labeled',
    'mtcars',
    'wine_labeled'];

let dataPoints = [];

function setDataPoints(data) {
    dataPoints.push(data);
}

export function getDataPoints() {
    return dataPoints;
}

export function loadDatasets(fileName) {
    dataPoints = [];
    const csvFileName = `datasets/${fileName}_norm.csv`;
    const rVal = d3.csv(csvFileName, (data) => {
        setDataPoints(data);
    });
    return rVal;
}

export function loadDropDown() {
    files.forEach((element) => {
        $('.dropdown-menu').append(`<a id=${element} class="dropdown-item" href="#">${capitalize(element)} Dataset</a>`);
    });
}
