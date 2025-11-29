window['statistics_chart_options'] = {
    showWhenNoData: true,
    plugins: new Map([['Piechart', {
        id: 'Piechart',
        active: true
    }]]),
    xAxisAttrName: 'amount',
    yAxisAttrNames: [],
};

document.addEventListener('swac_components_complete', () => {
    initChartSelection();
    initChart();
    loadFurtherStatistics();

    const statsReloadBtn = document.getElementById("statistics-reload");
    statsReloadBtn.addEventListener("click", initChart);

    const furStatsReloadBtn = document.getElementById("further-statistics-reload");
    furStatsReloadBtn.addEventListener("click", loadFurtherStatistics);
});

function initChartSelection() {
    const select = document.getElementById("data-select");
    select.addEventListener("change", (event) => {
        const selectedValue = event.target.value;
        updateChart(selectedValue);
    });
}

function initChart() {
    const select = document.getElementById("data-select");
    updateChart(select.value);
}

async function updateChart(view) {
    let req = document.getElementById('statistics_chart').swac_comp;
    req.removeAllData();

    const url = `${window.location.origin}/SmartDataAirquality/smartdata/records/${view}?storage=gamification`
    const response = await fetch(url);
    const json = await response.json();
    if (!json.records[0]) return;
    const stats = json.records[0].result.actions
    if (!stats) return;
    stats.forEach((stat) => {
        let newset = {
            name: stat.action,
            amount: stat.amount
        };
        req.addSet(`generalStatistics`, newset);
    });

    updateChartDescriptionValues(json.records[0].result.since, json.records[0].result.sent_notifications)
}

async function loadFurtherStatistics() {
    //sent notifications
    let url = `${window.location.origin}/SmartDataAirquality/smartdata/records/view_sent_notifications?storage=gamification`
    let response = await fetch(url);
    let json = await response.json();
    document.getElementById("stat-notifications").textContent = json.records.length;

    //total groups(devices)
    url = `${window.location.origin}/SmartDataAirquality/smartdata/records/group?storage=gamification`
    response = await fetch(url);
    json = await response.json();
    document.getElementById("stat-groups").textContent = json.records.length;

    //total users
    url = `${window.location.origin}/SmartDataAirquality/smartdata/records/member?storage=gamification`
    response = await fetch(url);
    json = await response.json();
    document.getElementById("stat-members").textContent = json.records.length;
}

function updateChartDescriptionValues(sinceTimestamp, amount) {
    const date = new Date(sinceTimestamp);
    const options = {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    };
    const formattedDate = date.toLocaleString("en-GB", options);

    const timestampEl = document.getElementById("desc-timestamp");
    const amountEl = document.getElementById("desc-amount");

    timestampEl.textContent = formattedDate;
    amountEl.textContent = amount.toLocaleString();
}
