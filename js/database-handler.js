
/**
 * Class for handling the table downloads from SmartData.
 */
class DatabaseDownloader
{
    /**
     * 
     * @param {String} smartDataURL URL of the SmartData instance for example http://localhost:8080/SmartDataGewaesser
     */
    constructor(smartDataURL)
    {
        this.smartDataURL = smartDataURL + (smartDataURL.endsWith('/') ? '' : '/');
        this.cache = {};
    }

    /**
     * Downloads a table from SmartData and caches all records.
     * @param {String} storageName name of the storage that the table is in
     * @param {String} collectionName name of the table
     * @returns array of all records in the table or null if an error occured
     */
    async downloadTable(storageName, collectionName)
    {
        // Create "nodes" in cache
        let storageObj = this.cache[storageName];
        if(!storageObj)
        {
            storageObj = {};
            this.cache[storageName] = storageObj;
        }
        
        let records = storageObj[collectionName];
        if(records)
        {
            return records;
        }

        // Create URL for SmartData
        let url = this.smartDataURL;
        url += 'smartdata/records/';
        url += collectionName;
        url += '?storage=';
        url += storageName;

        // Download
        let res = await fetch(url, {method: 'GET'});
        if(res.status != 200)
        {
            alert(`Failed to load stations\nStatus: ${res.status}`);
            return;
        }

        // Save in cache and return
        records = (await res.json()).records;
        if(!records)
        {
            return null;
        }
        storageObj[collectionName] = records;
        return records;
    }

    /**
     * Downloads a table from SmartData and returns all records of that table.
     * The records will only keep the columns that are specified in `dataSourceConfig`.
     * Columns will also be renamed like specified in `dataSourceConfig`.
     * The following is an example of such a config object:
     * ```ts
     * {
     *   storage: 'smartmonitoring',
     *   collection: 'bakterien',
     *   columns:
     *   {
     *     name: 'parameter',
     *     measurement: 'messwert',
     *     date: 'datum',
     *     stationID: 'observedobject_id'
     *   }
     * }
     * ```
     * @param {Object} dataSourceConfig 
     * @returns 
     */
    async downloadConvert(dataSourceConfig)
    {
        /**
         * Helper function that creates a mapping from the columns object inside the config object.
         */
        function createColumnNameMapFromConfig(columnsConfig)
        {
            const columnNameMap = {};
            for(var key in columnsConfig)
            {
                if (columnsConfig.hasOwnProperty(key))
                {
                    columnNameMap[columnsConfig[key]] = key;
                }
            }
            return columnNameMap;
        }

        // Download table if not cached
        const records = await this.downloadTable(dataSourceConfig.storage, dataSourceConfig.collection);
        if(!records)
        {
            return null;
        }

        // Do the renaming and exclusion of unwanted columns
        const columnNameMap = createColumnNameMapFromConfig(dataSourceConfig.columns)
        const ret = [];
        for(const record of records)
        {
            const obj = {}; // obj is the new record with renamed columns
    
            // For each column
            for(var columnName in record)
            {
                if(record.hasOwnProperty(columnName))
                {
                    const mappedName = columnNameMap[columnName];
                    // If no mapping exists, skip the column
                    if(!mappedName)
                    {
                        continue;
                    }
                    obj[mappedName] = record[columnName];
                }
            }
            ret.push(obj);
        }
        return ret;
    }

    /**
     * Clears the cache so the download methods will re-download everything if called.
     */
    clearCache()
    {
        this.cache = {};
    }
}

const DataBaseHandler =
{
    db_tables:
    {
        measurements: [],
        locations: [],
        location_join_oo: [],
        stations: []
    }
};

DataBaseHandler.loadDataFromDatabase = async (config, onlyMeasurements = false) =>
{
    const downloader = new DatabaseDownloader(config.smartDataURL);
    const promises = [];
    if(!onlyMeasurements)
    {
        promises.push(downloader.downloadConvert(config.dataSources.stationsTable));
        promises.push(downloader.downloadConvert(config.dataSources.locationsTable));
        promises.push(downloader.downloadConvert(config.dataSources.joinTableLocationsStations));
    }

    for(const entry of config.dataSources.measurementsTables)
    {
        promises.push(downloader.downloadConvert(entry));
    }

    const results = await Promise.all(promises)
    
    let measurementsPromiseStartIndex = 0;
    if(!onlyMeasurements)
    {
        DataBaseHandler.db_tables.stations = results[0];
        DataBaseHandler.db_tables.locations = results[1];
        DataBaseHandler.db_tables.location_join_oo = results[2];
        measurementsPromiseStartIndex = 3;
    }
    for(let i = measurementsPromiseStartIndex; i < results.length; i++)
    {
        const records = results[i];
        if(!records)
        {
            continue;
        }
        DataBaseHandler.db_tables.measurements = DataBaseHandler.db_tables.measurements.concat(records);
    }

    downloader.clearCache();
};

DataBaseHandler.createMeasurementParameterMap = () =>
{
    const types = new Map();
    let nextTypeID = 1;
    for (const b of DataBaseHandler.db_tables.measurements)
    {
        if(!types.has(b.name))
        {
            types.set(b.name, nextTypeID);
            nextTypeID++;
        }
    }
    return types;
};

export default DataBaseHandler;
