import { loadDataIntoCondition, getConditionTemplate, initConditions, initPeriods } from './condition.js'

document.addEventListener('swac_components_complete', async () => {
    loadAchievementTiers();
    await initConditions();
    await initPeriods();
});

async function loadAchievementTiers() {
    const tiers = Array.from(document.querySelectorAll(".tier-row-items"));
    const withoutPlaceholders = tiers.slice(3);
    for (const tier of withoutPlaceholders) {
        tier.querySelector('.tier-item-add').addEventListener("click", () => { addCondition(tier.dataset.t_id) });
        const conditions = await getConditionsForTrigger(tier.dataset.t_id);
        for (const condition of conditions) {
            const div = document.createElement("div");
            div.className = "tier-item";
            div.textContent = `Condition ${condition.id}`;
            div.id = `condition_${condition.id}`
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
    try {
        const response = await fetch(`${window.location.origin}/SmartDataAirquality/smartdata/records/condition?storage=gamification&filter=id,eq,${conditionId}`);
        const data = (await response.json()).records[0];
        initConditionForm();
        loadDataIntoCondition(data, document.getElementById("condition_display"));

        const container = document.getElementById("condition_display");
        const title = container.querySelector(".uk-accordion-title");

        if (title) {
            const info = document.createElement("div");
            info.className = "uk-text-meta uk-margin-small-top";
            info.textContent = "Changing values here won't change the actual values in the database!";
            title.insertAdjacentElement("afterend", info);
        }

        openRightPanel();
    } catch (err) {
        console.error("Error loading condition: ", err);
        return [];
    }
}

function initConditionForm() {
    const conditionDisplay = document.getElementById('condition_display');
    conditionDisplay.innerHTML = "";
    conditionDisplay.prepend(getConditionTemplate(0));
    document.getElementById("closePanel").addEventListener("click", closeRightPanel);
    document.querySelector('.remove_condition_btn').addEventListener("click", deleteCondition);
}

function deleteCondition() {
    fetch(`${window.location.origin}/SmartDataAirquality/smartdata/records/condition/${currentConditionId}?storage=gamification`, {
        method: "DELETE"
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Error deleting condition with id ${currentConditionId}`);
        }
        document.getElementById(`condition_${currentConditionId}`).remove();
        closeRightPanel();
        UIkit.notification({
            message: `Deletion was successful`,
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

var currentTriggerId;
function addCondition(triggerId) {
    currentTriggerId = triggerId;
    initConditionForm();
    openRightPanel();
    const conditionDisplay = document.getElementById("condition_display");
    conditionDisplay.querySelector('.uk-accordion-title').innerHTML = "New Condition";
    conditionDisplay.querySelector('.remove_condition_btn').remove();
    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.classList.add("uk-button", "uk-button-primary", "uk-button-small");
    const text = document.createTextNode("Save");
    saveButton.appendChild(text);
    conditionDisplay.addEventListener("submit", e => { saveCondition(e) });
    const container = conditionDisplay.querySelector("#buttons");
    if (container) {
        container.appendChild(saveButton);
    }
}

async function saveCondition(e) {
    e.preventDefault()
    try {
        const payload = Object.fromEntries(
            [...new FormData(e.target)].map(([k, v]) => {
                if (v === "") return [k, null];
                if (!isNaN(v)) return [k, Number(v)];
                return [k, v];
            })
        );
        payload.trigger_id = Number(currentTriggerId);
        const res = await fetch(`${window.location.origin}/WebPush/webpush/admin/trigger/condition`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(err);
        }

        UIkit.notification({
            message: `Successfully created new condition`,
            status: 'info',
            timeout: window.swac.config.notifyDuration,
            pos: 'top-center'
        });

    } catch (err) {
        UIkit.notification({
            message: err,
            status: 'error',
            timeout: window.swac.config.notifyDuration,
            pos: 'top-center'
        });
    }
    closeRightPanel();
}

function closeRightPanel() {
    const rightPanel = document.querySelector(".right-panel");
    rightPanel.classList.add("uk-hidden");
}

function openRightPanel() {
    const rightPanel = document.querySelector(".right-panel");
    rightPanel.classList.remove("uk-hidden")
}
