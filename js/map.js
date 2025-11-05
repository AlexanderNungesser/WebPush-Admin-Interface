import { DataMapConfig } from '/FrontendGewaesserdaten/js/datamap-config.js'
import DataBaseHandler from '/FrontendGewaesserdaten/js/database-handler.js'
import Util from '/FrontendGewaesserdaten/js/util.js'


window['worldmap2d_comp_options'] = {
    clusterMarkers: true
};

/**
 * Comparator for sorting dates.
 * Dates must be strings in the format YYYY-MM-DD.
 * @param {*} a date one
 * @param {*} b date two
 * @returns 1 if a is newer than b, -1 if a is older than b, 0 if they are equal
 */
function compareDates(a, b)
{
    a = a.split('-').join('');
    b = b.split('-').join('');
    return a > b ? 1 : a < b ? -1 : 0;
}

/**
 * @param {*} stationID ID of the station you want the ID of 
 * @returns the location that belongs to the station
 */
function getLocationOfStation(stationID)
{
    let loc_link = DataBaseHandler.db_tables.location_join_oo.find(j => j.stationID === stationID);
    if(!loc_link)
    {
        return null;
    }
    return DataBaseHandler.db_tables.locations.find(l => l.id === loc_link.locationID);
}

/**
 * @param {*} stationID ID of the station 
 * @param {*} date date you want to see data of
 * @returns the closest measurement to the given date
 */
function getMeasurementDataOfStation(stationID, date)
{
    let belongingMeasurements = DataBaseHandler.db_tables.measurements.filter(b => b.stationID === stationID);
    const typeMap = new Map();
    for(const record of belongingMeasurements)
    {
        let bProps = typeMap.get(record.name);
        if(!bProps)
        {
            bProps = { date: '0000-00-00' };
            typeMap.set(record.name, bProps);
        }
        if(compareDates(record.date, bProps.date) > 0 && compareDates(record.date, date) <= 0)
        {
            // If record date is newer, update current record in map
            bProps.name = record.name;
            bProps.date = record.date;
            bProps.measurement = record.measurement;
            bProps.time = record.time;
        }
    }

    const data = [];

    for (const value of typeMap.values())
    {
        data.push(value);
    }

    return data;
}

/**
 * Makes a GeoJSON from the data in DataBaseHandler.
 * @param {*} defaultPointColor default color if no colorMap is specified
 * @param {*} colorMap color map containing a gradient
 * @param {*} measurementParameter parameter that determines which data is used for colorizing
 * @param {*} filterOptions 
 * @returns the GeoJSON
 */
function makeGeoJSON(defaultPointColor = '#666666', colorMap = null, measurementParameter = null, filterOptions = null)
{
    const geoJSONTemplate =
    {
        type: 'FeatureCollection',
        features: []
    };

    for (const record of DataBaseHandler.db_tables.stations)
    {
        let loc = getLocationOfStation(record.id);
        if(!loc)
        {
            continue;
        }
        let markerColor = defaultPointColor;
        const measurementData = getMeasurementDataOfStation(record.id, '9999-99-99');

        const popupText = ['[' + record.name + ']'];
        for (const md of measurementData)
        {
            if(colorMap && measurementParameter && md.name == measurementParameter)
            {
                const rgb = Util.getColorFromMap(colorMap, md.measurement);
                markerColor = Util.rgbToHex(rgb.r, rgb.g, rgb.b);
            }
            popupText.push('- ' + md.name + ': ' + md.measurement + ' am ' + md.date + ' um ' + md.time);
        }

        let feature = {
            type: 'Feature',
            properties: {
                loc_id: record.id,
                name: record.name,
                measurementData: measurementData,
                bindPopup: popupText,
                style: {
                    fillColor: markerColor,
                    color: '#000',
                    radius: 8,
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                }
            },
            geometry: {
                coordinates: [
                    loc.latitude,
                    loc.longitude
                ],
                type: 'Point'
            }
        }
        if(filterOptions && filterOptions.filterFn && filterOptions.filters && !filterOptions.filterFn(feature, filterOptions.filters))
        {
            continue;
        }
        geoJSONTemplate.features.push(feature);
    }
    return geoJSONTemplate;
}

/**
 * Determines whether a particular feature should be visible or not.
 * @param {*} feature each feature
 * @param {*} filters filter settings generated from HTML
 * @returns true if feature should be visible, false otherwise
 */
function filterFn(feature, filters)
{
    for (const filter of filters)
    {
        let foundMatch = false;
        for (const b of feature.properties.measurementData)
        {
            if(filter.name === b.name && b.measurement >= filter.min && b.measurement <= filter.max)
            {
                foundMatch = true;
                break;
            }
        }
        if(!foundMatch)
        {
            return false;
        }
    }
    return true;
}

window.onload = async (event) =>
{
    // Load data from URL parameters delivered by index.html
    const url = new URL(window.location.href);
    const filterEncoded = url.searchParams.get("filters");
    const colorsEncoded = url.searchParams.get("colors");
    const colorParam = url.searchParams.get("colorParam");
    let filterJson = null;
    let colorsJson = null;

    if(filterEncoded)
    {
        filterJson = JSON.parse(decodeURIComponent(filterEncoded));
    }
    if(colorsEncoded)
    {
        colorsJson = JSON.parse(decodeURIComponent(colorsEncoded));
    }

    // Download data from database
    await DataBaseHandler.loadDataFromDatabase(DataMapConfig);

    // Save Worldmap2d component for later access
    const elem_worldmap2d = document.getElementById('worldmap2d_comp');
    const worldmap2d = elem_worldmap2d.swac_comp;
    
    // Create GeoJSON from downloaded data and display it
    const geoJSON = makeGeoJSON('#666666', colorsJson, colorParam, { filterFn: filterFn, filters: filterJson});
    worldmap2d.addGeoJSON(geoJSON);

    // Remove the loading overlay
    const elem_loadingOverlay = document.getElementById('loading_overlay');
    const elem_loadingOverlaySpinner = document.getElementById('loading_overlay_spinner');
    elem_loadingOverlaySpinner.style.display = 'none';
    elem_loadingOverlay.style.display = 'none';
};
