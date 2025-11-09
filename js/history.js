var currentHistoryStatistics = [];

window['history_chart_options'] = {
    showWhenNoData: true,
    plugins: new Map()
};
window['history_chart_options'].plugins.set('Piechart', {
    id: 'Piechart',
    active: true
});


async function selectHistory(elem) {

    const s_id = elem.dataset.s_id;
    const entry = await findEntryById("../data/example_statistics.json", s_id);
    const result = entry ? entry.actions : null;

    if (result) {
        currentHistoryStatistics = result;
        console.log(currentHistoryStatistics);
        //window['history_chart'].swac_comp.removeAllData();
        //window['history_chart'].swac_comp.reload();
    }
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


