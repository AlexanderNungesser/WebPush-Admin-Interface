var curHistory;

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
    initHistorySelection();
    initDeleteButtons();

    // const reloadBtn = document.getElementById("history-reload");
    // reloadBtn.addEventListener("click", reloadHistory);

    const reloadStatisticsBtn = document.getElementById("history-statistics-reload");
    reloadStatisticsBtn.addEventListener("click", () => { selectHistory(curHistory) });

    document.addEventListener(`swac_notification_history_reloaded`, () => { initHistorySelection(); initDeleteButtons() })
});

// Removes delete buttons for some reason
// function reloadHistory() {
//     const history = document.getElementById("notification_history");
//     history.swac_comp.reload();
// }

function initHistorySelection() {
    const entries = document.querySelectorAll('.notification-card');
    entries.forEach(entry => entry.onclick = () => selectHistory(entry))
}

function initDeleteButtons() {
    const historyCards = document.querySelectorAll('.present_main .notification-card');
    historyCards.forEach(card => {
        const type = card.dataset.type;
        const button = card.querySelector('.notif-delete-btn');
        if (type !== 'deleted' && button) {
            button.remove();
            return;
        }
        button.addEventListener("click", (event) => { event.stopPropagation(); deleteHistory(card.dataset.h_id); })
    });
}

function deleteHistory(history_id) {
    fetch(`${window.location.origin}/SmartDataAirquality/smartdata/records/history/${history_id}?storage=gamification`, {
        method: "DELETE"
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Error deleting history with ${history_id}`);
        }
        UIkit.notification({
            message: `Deletion was successful, you may need to wait a few second and reload the page to see changes take place.`,
            status: 'info',
            timeout: window.swac.config.notifyDuration,
            pos: 'top-center'
        });
    }).catch(err => {
        UIkit.notification({
            message: err,
            status: 'error',
            timeout: window.swac.config.notifyDuration,
            pos: 'top-center'
        });
    });
}

async function selectHistory(elem) {
    curHistory = elem;

    let req = document.getElementById('history_chart').swac_comp;
    req.removeAllData();

    const h_id = elem.dataset.h_id;
    const url = `${window.location.origin}/SmartDataAirquality/smartdata/records/view_statistics_by_history?storage=gamification&filter=history_id,eq,${h_id}`
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



