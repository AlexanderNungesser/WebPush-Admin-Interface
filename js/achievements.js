import { loadDataIntoCondition, getConditionTemplate, initConditions, initPeriods } from './condition.js'

document.addEventListener('swac_components_complete', async () => {
    loadAchievementTiers();
    initAchievementAddButton();
    document.getElementById("closePanel").addEventListener("click", closeRightPanel);
    await initConditions();
    await initPeriods();
});

function initAchievementAddButton() {
    const addButton = document.querySelector(".uk-accordion-title.add");
    addButton.addEventListener("click", openAchievementForm);

    const achievementForm = document.getElementById("achievement_form");
    achievementForm.addEventListener("submit", e => {
        saveForm(e, `${window.location.origin}/WebPush/webpush/admin/achievement`);
        document.getElementById("achievement_form").reset();
    });
}

function openAchievementForm() {
    const conditionForm = document.getElementById('condition_form');
    if (!conditionForm.classList.contains("uk-hidden")) {
        conditionForm.classList.add("uk-hidden")
    }
    const achievementForm = document.getElementById('achievement_form');
    achievementForm.classList.remove("uk-hidden");
    openRightPanel();
}

async function loadAchievementTiers() {
    const tiers = Array.from(document.querySelectorAll(".tier-row-items"));
    const withoutPlaceholders = tiers.slice(3);
    for (const tier of withoutPlaceholders) {
        tier.querySelector(".tier-item.add").addEventListener("click", () => { addCondition(tier.dataset.t_id) });
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
        loadDataIntoCondition(data, document.getElementById("form_display"));
        disableConditionForm();
        openRightPanel();
    } catch (err) {
        console.error("Error loading condition: ", err);
        return [];
    }
}

function initConditionForm() {
    const achievementForm = document.getElementById('achievement_form');
    if (!achievementForm.classList.contains("uk-hidden")) {
        achievementForm.classList.add("uk-hidden")
    }
    const conditionForm = document.getElementById('condition_form');
    conditionForm.innerHTML = "";
    conditionForm.prepend(getConditionTemplate(0));
    conditionForm.classList.remove("uk-hidden");
    document.getElementById("closePanel").addEventListener("click", closeRightPanel);
    document.querySelector('.remove_condition_btn').addEventListener("click", deleteCondition);
}

function disableConditionForm() {
    const conditionForm = document.getElementById('condition_form');
    const inputs = conditionForm.querySelectorAll('input, select, textarea')
    inputs.forEach(el => {
        el.disabled = true;
    });
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
    const conditionForm = document.getElementById("condition_form");
    conditionForm.querySelector('.uk-accordion-title').innerHTML = "New Condition";
    conditionForm.querySelector('.remove_condition_btn').remove();
    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.classList.add("uk-button", "uk-button-primary", "uk-button-small");
    const text = document.createTextNode("Save");
    saveButton.appendChild(text);
    conditionForm.addEventListener("submit", e => { saveForm(e, `${window.location.origin}/WebPush/webpush/admin/trigger/condition/${currentTriggerId}`) });
    const container = conditionForm.querySelector("#buttons");
    if (container) {
        container.appendChild(saveButton);
    }
}

async function saveForm(e, url) {
    e.preventDefault()
    try {
        const payload = Object.fromEntries(
            [...new FormData(e.target)].map(([k, v]) => {
                if (v === "") return [k, null];
                if (!isNaN(v)) return [k, Number(v)];
                return [k, v];
            })
        );
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const text = await res.text();
            const message = text || `${res.status} ${res.statusText}`;
            throw new Error(message);
        }

        UIkit.notification({
            message: `Successfully created`,
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
    window.location.reload();
}

function closeRightPanel() {
    const rightPanel = document.querySelector(".right_panel");
    rightPanel.classList.add("uk-hidden");
}

function openRightPanel() {
    const rightPanel = document.querySelector(".right_panel");
    rightPanel.classList.remove("uk-hidden")
}
