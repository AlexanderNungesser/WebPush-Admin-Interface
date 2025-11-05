/**
 * Settings of the app.
 * Set the SmartData path here.
 * You can set all database tables and column names here. 
 */
export const DataMapConfig =
{
    smartDataURL: '../../SmartDataGewaesser2',
    dataSources:
    {
        measurementsTables:
        [
            {
                storage: 'smartmonitoring',
                collection: 'bakterien',
                columns:
                {
                    name: 'parameter',
                    measurement: 'messwert',
                    date: 'datum',
                    time: 'zeit',
                    stationID: 'observedobject_id'
                }
            },
            {
                storage: 'smartmonitoring',
                collection: 'guete',
                columns:
                {
                    name: 'parameter',
                    measurement: 'value',
                    date: 'date',
                    stationID: 'observedobject_id'
                }
            }
        ],
        stationsTable:
        {
            storage: 'smartmonitoring',
            collection: 'tbl_observedobject',
            columns:
            {
                id: 'id',
                name: 'name'
            }
        },
        locationsTable:
        {
            storage: 'smartmonitoring',
            collection: 'tbl_location',
            columns:
            {
                id: 'id',
                latitude: 'latitude',
                longitude: 'longitude'
            }
        },
        joinTableLocationsStations:
        {
            storage: 'smartmonitoring',
            collection: 'tbl_location_join_oo',
            columns:
            {
                id: 'id',
                locationID: 'loc_id',
                stationID: 'oo_id'
            }
        }
    }
};
