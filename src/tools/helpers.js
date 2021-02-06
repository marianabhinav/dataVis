/* eslint-disable no-param-reassign */
import * as $ from 'jquery';
import * as d3 from 'd3';

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
export function getRandomInt(min, max) {
    const minCeil = Math.ceil(min);
    const maxFloor = Math.floor(max);
    return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
}

/**
 * Checks, if values in a list of numbers are already sorted.
 */
function isSorted(arr) {
    for (let i = 1; i < arr.length; i++) {
        if (+arr[i - 1] > +arr[i]) {
            return false;
        }
    }

    return true;
}

/**
 * See: https://stackoverflow.com/a/11180172
 *
 * there appears to be a discrepancy with the way jQuery and d3 handle events
 * that causes a jQuery induced click event $("#some-d3-element").click() to
 * not dispatch to the d3 element.
 * A workaround:
 */
export function registerJQueryD3Click() {
    $.fn.d3Click = function () {
        this.each((i, e) => {
            const evt = new MouseEvent('click');
            e.dispatchEvent(evt);
        });
    };
}

/**
 * Returns the value in arr which is the n-th percentile.
 * See: https://en.wikipedia.org/w/index.php?title=Percentile&oldid=882969901
 */
export function percentile(n, arr) {
    let arr_sorted = arr;

    if (!isSorted(arr)) {
        arr_sorted = arr.sort((v1, v2) => v1 - v2);
    }

    const q_index = Math.ceil((n / 100) * arr_sorted.length) - 1;
    return arr_sorted[q_index];
}

/**
 * Checks if two arrays are equal, i.e.
 *  - have equal length
 *  - and contain the same elements
 */
export function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

/**
 * Takes a 2D-array as argument and returns the transposed array.
 */
export function arrayTranspose(array) {
    const dim0length = array.length;
    const dim1length = array.reduce((acc, curr) => Math.min(acc, curr.length), array[0].length);

    const newArray = [];
    for (let i = 0; i < dim1length; i++) {
        newArray.push([]);
    }

    for (let i = 0; i < dim0length; i++) {
        for (let j = 0; j < dim1length; j++) {
            newArray[j].push(array[i][j]);
        }
    }

    return newArray;
}

/**
 * Compute euclidean distance of two vectors, stored as arrays.
 */
export function euclideanDistance(vec1, vec2) {
    const minDim = Math.min(vec1.length, vec2.length);

    let summedSquares = 0;
    for (let i = 0; i < minDim; i++) {
        summedSquares += ((vec1[i] - vec2[i]) * (vec1[i] - vec2[i]));
    }

    return Math.sqrt(summedSquares);
}

/**
 * Clamp value to interval [min, max]
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Capitalize the first character of the string provided
*/

export function capitalize(val) {
    return val.charAt(0).toUpperCase() + val.slice(1);
}

/**
 * Calculate euclidean distance between two values
 */

export function calcEuclideanDist(x, y) {
    return Math.sqrt((x[0] - y[0]) * (x[0] - y[0]) + (x[1] - y[1]) * (x[1] - y[1]));
}

/**
 * Removes the disabled keyword from the passed string
 */

function enable(val) {
    return val.replace(/ disabled/g, '');
}

/**
 * Concatinates the disabled keyword from the passed string
 */

function disable(val) {
    if (val.search('disabled') === -1) val = val.concat(' disabled');
    return val;
}

/**
 * Toggle the visibility of the button
 */

export function toggleButtonAvailability(id, visibility) {
    if (visibility === true) {
        $(`#${id}`).attr('class', enable($(`#${id}`).attr('class')));
    } else if (visibility === false) {
        $(`#${id}`).attr('class', disable($(`#${id}`).attr('class')));
    }
}
/**
 * Hides the slider
 */
export function hideSlider(...val) {
    val.forEach((element) => {
        $(`${element}`).hide();
    });
}

/**
 * Make the slider visible
 */

export function showSlider(...val) {
    val.forEach((element) => {
        $(`${element}`).show();
    });
}

/**
 *  Determines the color scheme for the given data
 */

export function getColors(data) {
    const color = d3.scaleOrdinal().domain(data).range(d3.schemeCategory10);
    return color;
}

/**
 * Filters the data based on the columns provided
 */
export function filterData(data, columns) {
    const result = [];
    data.forEach((element) => {
        const intermediateRes = [];
        columns.forEach((column) => {
            intermediateRes.push(parseFloat(element[column]));
        });
        result.push(intermediateRes);
    });
    return result;
}

/**
 * Creates a Matrix of Size of mXn filled with 0
 */
export function createMatrix(m, n) {
    return Array.from({
        length: m,
    }, () => new Array(n).fill(0));
}
