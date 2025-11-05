import { DataMapConfig } from '/FrontendGewaesserdaten/js/datamap-config.js'
import DataBaseHandler from '/FrontendGewaesserdaten/js/database-handler.js'
import GradientMap from '/FrontendGewaesserdaten/js/gradient-map.js'

let currentColorMap = null;
let currentFilterSettings = null;

/**
 * Refreshes the map in the iframe
 */
function refreshIFrameMap()
{
    const host = window.location.protocol + "//" + window.location.host;
    const url = new URL(host + '/FrontendGewaesserdaten/sites/map.html');
    // If filters are selected, set filters as URL parameter
    if(currentFilterSettings)
    {
        url.searchParams.set('filters', encodeURIComponent(JSON.stringify(currentFilterSettings)));
    }
    // If colors are selected, set colors as URL parameter
    if(currentColorMap)
    {
        url.searchParams.set('colors', encodeURIComponent(JSON.stringify(currentColorMap)));
    }
    // If color param is selected, set colorParam as URL parameter
    const colorParam = getSelectedColorizingParameter();
    if(colorParam)
    {
        url.searchParams.set('colorParam', colorParam);
    }

    const elem_iframe = document.getElementById('map_container');
    elem_iframe.src = url.href;
}

/**
 * @returns returns an array containing the current input filter values in the off canvas
 */
function getFilterSettings(measurementParams)
{
    const settings = [];
    for (const name of measurementParams.keys())
    {
        const id = measurementParams.get(name);
        const elem_checkbox = document.getElementById('filter_checkbox_' + id);
        if(!elem_checkbox.checked)
        {
            continue;
        }

        const elem_input_min = document.getElementById('filter_min_' + id);{}
        const elem_input_max = document.getElementById('filter_max_' + id);

        const minVal = elem_input_min.value;
        const maxVal = elem_input_max.value;

        if(!minVal || !maxVal)
        {
            throw new Error('Invalid value');
        }
        settings.push({
            name: name,
            min: Number.parseFloat(minVal),
            max: Number.parseFloat(maxVal)
        });
    }
    return settings;
}

/**
 * @returns creates HTML elements for filtering inside the elements with id `filter-container`
 */
function setupFilters(measurementParams)
{
    const elem_filterContainer = document.getElementById('filter-container');
    const elem_filterLoading = document.getElementById('filter-loading');

    elem_filterContainer.removeChild(elem_filterLoading);

    for (const name of measurementParams.keys())
    {
        const id = measurementParams.get(name);

        // Create elements
        const elem_labelMin = document.createElement('label');
        const elem_labelMax = document.createElement('label');
        const elem_inputMin = document.createElement('input');
        const elem_inputMax = document.createElement('input');
        const elem_divMin = document.createElement('div');
        const elem_divMax = document.createElement('div');
        const elem_form = document.createElement('form');
        const elem_checkbox = document.createElement('input');
        const elem_labelCheckbox = document.createElement('label');
        const elem_spanCheckbox = document.createElement('span');
        const elem_divMargin = document.createElement('div');

        // Configure elements
        elem_labelMin.classList.add('uk-form-label');
        elem_labelMax.classList.add('uk-form-label');

        elem_labelMin.textContent = 'Min';
        elem_labelMax.textContent = 'Max';

        elem_inputMin.classList.add('uk-input', 'uk-form-small');
        elem_inputMax.classList.add('uk-input', 'uk-form-small');

        elem_inputMin.type = 'number';
        elem_inputMin.placeholder = '0';
        elem_inputMin.id = 'filter_min_' + id;

        elem_inputMax.type = 'number';
        elem_inputMax.placeholder = '0';
        elem_inputMax.id = 'filter_max_' + id;

        elem_divMin.classList.add('uk-width-1-2@s');
        elem_divMax.classList.add('uk-width-1-2@s');

        elem_form.classList.add('uk-grid-small', 'uk-form-controls');
        elem_form.setAttribute('uk-grid', '');

        elem_checkbox.classList.add('uk-checkbox');
        elem_checkbox.type = 'checkbox';
        elem_checkbox.id = 'filter_checkbox_' + id;

        elem_labelCheckbox.classList.add('uk-form-label');

        elem_spanCheckbox.classList.add('uk-text-small');
        elem_spanCheckbox.textContent = ' ' + name;

        elem_divMargin.classList.add('uk-margin');

        // Arrange elements

        elem_divMin.appendChild(elem_labelMin);
        elem_divMin.appendChild(elem_inputMin);

        elem_divMax.appendChild(elem_labelMax);
        elem_divMax.appendChild(elem_inputMax);

        elem_form.appendChild(elem_divMin);
        elem_form.appendChild(elem_divMax);

        elem_labelCheckbox.appendChild(elem_checkbox);
        elem_labelCheckbox.appendChild(elem_spanCheckbox);

        elem_divMargin.appendChild(elem_labelCheckbox);
        elem_divMargin.appendChild(elem_form);

        elem_filterContainer.appendChild(elem_divMargin);
    }

    const elem_button = document.createElement('button');
    elem_button.classList.add('uk-button', 'uk-button-default');
    elem_button.textContent = 'Filtern';
    elem_button.onclick = () =>
    {
        let fs = null;
        try
        {
            fs = getFilterSettings(measurementParams);
        }
        catch (error)
        {
            alert('Bitte geben Sie gültige Werte im Filter ein.');
            return;
        }
        currentFilterSettings = fs;
        refreshIFrameMap();
    }
    elem_filterContainer.appendChild(elem_button);
}

/**
 * @returns the selected colorizing parameter in the dropdown list in the colorizing tab
 */
function getSelectedColorizingParameter()
{
    const elem_selectColorizingParameter = document.getElementById('select_colorizing_parameter');
    const selectedIndex = elem_selectColorizingParameter.selectedIndex;
    return elem_selectColorizingParameter.options[selectedIndex].text;
}


window.onload = async (event) =>
{
    // Init gradient map
    const gradientMap = new GradientMap('gradient_map_container', 300, 30);
    gradientMap.setup();

    // Init color gradient preview
    var ctx = gradientMap.getContext2d();
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, gradientMap.getWidth(), gradientMap.getHeight());

    // Download data from database
    await DataBaseHandler.loadDataFromDatabase(DataMapConfig, true);

    // Get unique parameters from database
    const measurementParams = DataBaseHandler.createMeasurementParameterMap();

    // Create colorizing parameter dropdown list
    const elem_selectColorizingParameter = document.getElementById('select_colorizing_parameter');
    for (const name of measurementParams.keys())
    {
        const elem_option = document.createElement('option');
        elem_option.textContent = name;
        elem_selectColorizingParameter.appendChild(elem_option);
    }

    document.getElementById('btn_colorize').onclick = () =>
    {
        let cm = null
        try
        {
            cm = gradientMap.getMapData();
        }
        catch (error)
        {
            alert('Bitte gib gültige Werte für die Farben ein.');
            return;
        }
        currentColorMap = cm;
        refreshIFrameMap();
    };
    document.getElementById('btn_preview').onclick = () => gradientMap.showPreview();

    setupFilters(measurementParams);
};
