window['history_chart_options'] = {
    showWhenNoData: true,
    plugins: new Map()
};
window['history_chart_options'].plugins.set('Piechart', {
    id: 'Piechart',
    active: true
});

document.addEventListener('swac_components_complete', () => {
    const entries = document.querySelectorAll('.notification-card');
    entries.forEach(entry => entry.onclick = () => selectHistory(entry))
});

async function selectHistory(elem) {

    const h_id = elem.dataset.h_id;
    const url = `http://localhost:8080/SmartDataAirquality/smartdata/records/view_statistics_by_history?storage=gamification&filter=history_id,eq,${h_id}`
    const response = await fetch(url);
    const json = await response.json();
    const stats = json.records[0].statistics
    console.log(stats)
    let req = document.getElementById('history_chart');
    req.swac_comp.removeAllData();
    req.swac_comp.addData('history', stats);
    req.swac_comp.reload();
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



