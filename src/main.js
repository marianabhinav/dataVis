/* eslint-disable no-underscore-dangle */
/* eslint-disable no-new */
import * as d3 from 'd3';
import * as $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-slider';
import 'bootstrap-slider/dist/css/bootstrap-slider.min.css';
import {
    registerJQueryD3Click, toggleButtonAvailability, hideSlider, showSlider,
} from './tools/helpers';
import { getDataPoints, loadDatasets, loadDropDown } from './tools/data-manager';
import { createMST, clearOutMeasureValuesArray, outMeasures } from './algos/mstAlgo';
import Scatterplot from './components/Scatterplot';
import ScatterplotMatrix from './components/ScatterplotMatrix';
import ParallelCoordinatePlot from './components/ParallelCoordinatePlot';
import Mds from './components/Mds';
import Tsne from './components/Tsne';
import HilbertPlot from './components/HilbertPlot';


let dataLoaded;
let objectHolder;

registerJQueryD3Click();

loadDropDown();

function clearClutterFromLastDraw() {
    hideSlider(
        '#outlyinText', '#sliderContainer',
        '#alpha', '#alphaSlider', '#beta', '#betaSlider',
        '#iterationSlider', '#iteration', '#lrateSlider', '#lrate', '#perplexitySlider', '#perplexity',
    );
    toggleButtonAvailability('showMst', false);
    toggleButtonAvailability('matshowMst', false);
    toggleButtonAvailability('project', false);
}

$('.dropdown-menu').on('click', 'a', (e) => {
    dataLoaded = loadDatasets(e.target.getAttribute('id'));
    $('#dropdown').text(e.target.text);
    clearClutterFromLastDraw();
    dataLoaded.then(() => {
        const data = getDataPoints();
        const nav = $('.tab-content .active').attr('id');

        if (nav === 'scatterplot') {
            d3.select('svg').remove();
            objectHolder = new Scatterplot(data, 'scatterplot');
            toggleButtonAvailability('showMst', true);
        }
        if (nav === 'scatterplotMatrix') {
            clearOutMeasureValuesArray();
            d3.select('svg').remove();
            objectHolder = new ScatterplotMatrix(data);
            toggleButtonAvailability('matshowMst', true);
        }
        if (nav === 'pcp') {
            d3.select('svg').remove();
            $('#alphaSlider').val(0);
            $('#betaSlider').val(0);
            $('#alpha').text('α: 0');
            $('#beta').text('β: 0');
            objectHolder = new ParallelCoordinatePlot(data);
            objectHolder.intialize();
            objectHolder.createPcp($('#alphaSlider').val(), $('#betaSlider').val());
            showSlider('#alpha', '#alphaSlider', '#beta', '#betaSlider');
        }
        if (nav === 'tSne') {
            d3.select('svg').remove();
            $('#iterationSlider').val(100);
            $('#lrateSlider').val(1);
            $('#perplexitySlider').val(5);
            $('#iteration').text('Iterations: 100');
            $('#lrate').text('ε: 1');
            $('#perplexity').text('Perplexity: 5');
            showSlider('#iterationSlider', '#iteration', '#lrateSlider', '#lrate', '#perplexitySlider', '#perplexity');
            toggleButtonAvailability('project', true);
        }
        if (nav === 'mds') {
            d3.select('svg').remove();
            objectHolder = new Mds(data);
            new Scatterplot(objectHolder.computeMds(), 'mds');
        }
        if (nav === 'hilbert') {
            d3.select('svg').remove();
            objectHolder = new HilbertPlot(data);
            objectHolder.createHilbertPlot();
        }
    });
});

$('#showMst').on('click', () => {
    const circles = $('circle');
    const pos = [];
    circles.each((id, e) => {
        pos.push([parseFloat(e.getAttribute('cx')).toFixed(2), parseFloat(e.getAttribute('cy')).toFixed(2)]);
    });
    createMST(pos);
    toggleButtonAvailability('showMst', false);
});

$('#matshowMst').on('click', () => {
    const plots = objectHolder._groups[0];
    for (let i = 0; i < plots.length; i++) {
        const circles = plots[i].children;
        const pos = [];
        for (let j = 1; j < circles.length; j++) {
            pos.push([parseFloat(circles[j].getAttribute('cx')).toFixed(2), parseFloat(circles[j].getAttribute('cy')).toFixed(2)]);
        }
        createMST(pos, `group${i + 1}`);
    }
    showSlider('#outlyinText', '#sliderContainer');
    $('#outlyinText').text(`Outlying Measure: ${d3.min(outMeasures)}`);
    $('#scaleOutMeasure').slider({
        min: d3.min(outMeasures),
        max: d3.max(outMeasures),
        step: 0.001,
        value: d3.min(outMeasures),
    });
    $('#scaleOutMeasure').on('slide', () => {
        const outText = $('#scaleOutMeasure').val();
        $('#outlyinText').text(`Outlying Measure: ${outText}`);
        for (let i = 1; i <= (outMeasures.length + 1); i++) {
            if (outMeasures[i - 1] < outText) {
                d3.select(`#group${(i).toString()}`)
                    .style('visibility', 'hidden');
            } else {
                d3.select(`#group${(i).toString()}`)
                    .style('visibility', 'visible');
            }
        }
    });
    toggleButtonAvailability('matshowMst', false);
});

$('#project').on('click', () => {
    d3.select('svg').remove();
    objectHolder = new Tsne(getDataPoints());
    new Scatterplot(objectHolder.computeTsne($('#iterationSlider').val(), $('#lrateSlider').val(), $('#perplexitySlider').val()), 'tSne');
});

$('#alphaSlider').on('change', (e) => {
    const alpha = e.target.value;
    $('#alpha').text(`α: ${alpha}`);
    d3.select('svg').remove();
    objectHolder.createPcp(alpha, $('#betaSlider').val(), getDataPoints());
});
$('#betaSlider').on('change', (e) => {
    const beta = e.target.value;
    $('#beta').text(`β: ${beta}`);
    d3.select('svg').remove();
    objectHolder.createPcp($('#alphaSlider').val(), beta, getDataPoints());
});
$('#iterationSlider').on('change', (e) => {
    $('#iteration').text(`Iterations: ${e.target.value}`);
});
$('#lrateSlider').on('change', (e) => {
    $('#lrate').text(`ε: ${e.target.value}`);
});
$('#perplexitySlider').on('change', (e) => {
    $('#perplexity').text(`Perplexity: ${e.target.value}`);
});

$('#hilbert-tab').on('click', () => {
    d3.select('#svg-container').remove();
});
