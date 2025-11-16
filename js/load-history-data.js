async function loadHistoryRecords() {
    window.historyData = [];
    const baseUrl = "http://localhost:8080/SmartDataAirquality/smartdata/records";

    const mainResp = await fetch(`${baseUrl}/history?storage=gamification`);
    const mainData = await mainResp.json();

    const records = mainData.records || [];

    const result = [];

    for (const rec of records) {
        const { timestamp, notification_id } = rec;

        const date = new Date(timestamp);
        const day = date.toISOString().split("T")[0];
        const time = date.toTimeString().split(" ")[0];

        const titleUrl = `${baseUrl}/notifications?storage=gamification&filter=id,eq,${notification_id}`;
        const titleResp = await fetch(titleUrl);
        const titleData = await titleResp.json();

        const titleRecord = titleData.records?.[0] || {};
        const title = titleRecord.title || `No title for id ${notification_id}`;

        result.push({ day, time, title });
    }
    window.historyData = result;
}
loadHistoryRecords();