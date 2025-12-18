import { loadDataIntoCondition, getConditionTemplate, initConditions, initPeriods } from './condition.js'

document.addEventListener('swac_components_complete', async () => {
    loadAchievementTiers();
    await initConditions();
    await initPeriods();
    initConditionForm();
});

async function loadAchievementTiers() {
    const tiers = Array.from(document.querySelectorAll(".tier-row-items"));
    const withoutPlaceholders = tiers.slice(3);
    for (const tier of withoutPlaceholders) {
        const conditions = await getConditionsForTrigger(tier.dataset.t_id);
        for (const condition of conditions) {
            const div = document.createElement("div");
            div.className = "tier-item";
            div.textContent = `Condition ${condition.id}`;
            div.onclick = () => clickCondition(condition.id);
            tier.prepend(div);
        };
    }
}

async function getConditionsForTrigger(triggerId) {
    try {
        const response = await fetch(`${window.location.origin}/SmartDataAirquality/smartdata/records/trigger_condition?storage=gamification&filter=trigger_id,eq,${triggerId}`);
        const entries = (await response.json()).records;

        const conditions = await Promise.all(entries.map(async entry => {
            const id = entry.condition_id;
            const conditionResponse = await fetch(`${window.location.origin}/SmartDataAirquality/smartdata/records/condition?storage=gamification&filter=id,eq,${id}`);
            return (await conditionResponse.json()).records[0];
        }));

        return conditions;
    } catch (err) {
        console.error("Error loading condition: ", err);
        return [];
    }
}

var currentConditionId;
async function clickCondition(conditionId) {
    currentConditionId = conditionId;
    const rightPanel = document.querySelector(".right-panel");
    rightPanel.classList.remove("uk-hidden")
    try {
        const response = await fetch(`${window.location.origin}/SmartDataAirquality/smartdata/records/condition?storage=gamification&filter=id,eq,${conditionId}`);
        const data = (await response.json()).records[0];
        loadDataIntoCondition(data, document.getElementById("condition_display"))
    } catch (err) {
        console.error("Error loading condition: ", err);
        return [];
    }
}

function initConditionForm() {
    const conditionDisplay = document.getElementById('condition_display');
    conditionDisplay.prepend(getConditionTemplate(0));
    document.getElementById("closePanel").addEventListener("click", closeRightPanel);

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.classList.add("uk-button", "uk-button-primary", "uk-button-small");
    const text = document.createTextNode("Save");
    saveButton.appendChild(text);
    saveButton.addEventListener("click", saveCondition);
    const container = conditionDisplay.querySelector("#buttons");
    if (container) {
        container.appendChild(saveButton);
    }
}

function closeRightPanel() {
    const rightPanel = document.querySelector(".right-panel");
    rightPanel.classList.add("uk-hidden");
}

function saveCondition() {
    UIkit.notification({
        message: `Das funktioniert noch nicht`,
        status: 'info',
        timeout: window.swac.config.notifyDuration,
        pos: 'top-center'
    });
}