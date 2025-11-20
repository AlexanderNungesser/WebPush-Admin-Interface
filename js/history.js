window['history_chart_options'] = {
    showWhenNoData: true,
    plugins: new Map([['Piechart', {
        id: 'Piechart',
        active: true
    }]]),
    xAxisAttrName: 'amount',
    yAxisAttrNames: [],
};

document.addEventListener('swac_components_complete', () => {
    const entries = document.querySelectorAll('.notification-card');
    entries.forEach(entry => entry.onclick = () => selectHistory(entry))
});

async function selectHistory(elem) {
    let req = document.getElementById('history_chart').swac_comp;
    req.removeAllData();

    const h_id = elem.dataset.h_id;
    const url = `http://localhost:8080/SmartDataAirquality/smartdata/records/view_statistics_by_history?storage=gamification&filter=history_id,eq,${h_id}`
    const response = await fetch(url);
    const json = await response.json();
    const stats = json.records[0]?.statistics
    if (!stats) return;
    stats.forEach((stat) => {
        let newset = {
            name: stat.action,
            amount: stat.amount
        };
        req.addSet(`HistoryID_${h_id}`, newset);
    });
}

async function findEntryById(jsonPath, searchId) {

    console.log(searchId);
    try {
        const response = await fetch(jsonPath);
        const data = await response.json();

        return data.find(item => item.s_id === searchId) || null;

    } catch (error) {
        console.error("Error loading statistic data: ", error);
        return null;
    }
}



