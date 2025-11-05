/**
 * TODO 
 * UPLOAD JS CONFIGURIEREN
 */

var upload_csv_options = {
    autoUpload: false,
    uploadTargetURL: "../SmartFile/smartfile/file/map_csv_Gewaesser",
    smartDataPorter: {

        // This is where the SmartDataPorter instance expects the request
        smartDataPorterURL: "../SmartDataPorter/smartdataporter/import",
        filespaceURL: "../map_csv_Gewaesser/", // Slash at the end doesn't matter
        config: {
            importer: "HTTPImporter",
            parser: "CSVParser",
            // url: "http://lulon.ddns.net:8080/MyFilespace/test.csv", omit this attribute, it will be calculated
            server: "http://localhost:8080/",
            smartdata: "SmartDataTest",
            storage: "public",
            collection: "import_test",
            "csv.format": "EXCEL",
            "csv.delimiter": ",",
            "csv.headers": [
               "id",
               "name"
            ],
            "csv.mapping": [
               {
                  csv_column: "id",
                  db_column: "id",
                  type: "int"
               },
               {
                  csv_column: "name",
                  db_column: "name",
                  type: "string"
               }
            ]
        }
    }
};



