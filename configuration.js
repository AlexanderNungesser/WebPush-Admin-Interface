/* 
 * This is the main configuration file for SWAC documentation.
 * 
 * You should only change values in these file for your setup. No need to
 * modify other files.
 */

var SWAC_config = {
    /* Language for notifications from SWAC */
    lang: 'de',
    // Connection timeout in miliseconds
    remoteTimeout: 50000,
    // Time nodifications should be displayed in miliseconds
    notifyDuration: 5000,
    /* Debugging mode for output of SWAC NOTICE and SWAC WARNING messages */
    debugmode: true,
    debug: '',
    // Backend connection settings
    datasources: [
        {
            url: "/SWACtemplate/data/[fromName]"
        },
        {
            url: "/SmartData/smartdata/[iface]/[fromName]?storage=smartmonitoring",
            interfaces: {
                get: ['GET', 'records'],
                list: ['GET', 'records'],
                defs: ['GET', 'collection'],
                create: ['POST', 'records'],
                update: ['PUT', 'records'],
                delete: ['DELETE', 'records']
            }
        },
//    {
//        url: "/SmartMonitoringBackend/observedobject/[fromName]/[iface]",
//        interfaces: {
//            get: ['GET','get'],
//            list: ['GET','list'],
//            defs: ["GET",'definition'],
//            create: ['POST','create'],
//            update: ['UPDATE','update'],
//            delete: ['DELETE','delete']
//        }
//    }
    ],
    // Options for progressive webapp
    progressive: {
        active: false,
        cachetimeout: 30, // Timeout in days after that a reload should be done or unused pages leave the cache
        precache: [
            // List files here that should be available offline for the user after first visit
            // All links below are interpreted from the app_root (e.g. /SWACtemplate)
            '/css/global.css',
            '/sites/index.html',
            '/css/index.css',
            // basic content (design pictures)
            '/content/logo.png',
            // default data
            '/manifest.json',
            '/configuration.js',
            '/data/routes.js'
        ],
        // List components here that should be precached
        components: [
            'Navigation'
        ]
    },
    // Register OnlineReactions to be used here
    onlinereactions: [
//    {
//      path: SWAC_config.swac_root + '/swac/components/Upload/UploadOnReact.js',
//      config: {}
//    }
    ]
};

/**
 * Options for swac_user component
 * Used on every page
 */
var user_options = {
    mode: 'form',
    loginurl: '../data/user/exampleuserdata.json',
    afterLoginLoc: '../sites/user_example1.html',
    afterLogoutLoc: '../sites/user.html',
    loggedinRedirects: new Map()
};
user_options.loggedinRedirects.set('user_example3.html', '../sites/user_example2.html');

// Links for footer navigation
var footerlinks = [
    {id: 1, rfrom: "*", rto: "datenschutz.html", name: "Datenschutzerklärung"},
    {id: 2, rfrom: "*", rto: "impressum.html", name: "Impressum"},
    {id: 3, rfrom: "*", rto: "haftung.html", name: "Haftungsausschluss"},
    {id: 4, rfrom: "*", rto: "http://git01-ifm-min.ad.fh-bielefeld.de/scl/2015_03_SCL_SmartMonitoring_Frontend/wikis/home", name: "Über SmartMonitoring"}
];