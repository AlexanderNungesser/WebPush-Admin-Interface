import { initConditions, initPeriods, getConditionTemplate } from "./condition.js";

window['notification_form_swac_options'] = {
    customAfterSave: () => {
        resetNotificationForm();
        reloadNotifications();
    },
    target: 'notification'
}

window['trigger_form_swac_options'] = {
    customAfterSave: () => {
        resetTriggerForm();
        reloadTriggers();
    },
    target: 'trigger'
}

document.addEventListener('swac_components_complete', async () => {
    initPopup();
    initActions();
    initTriggerSelection();
    initNotificationDeleteButtons();
    initTriggerDeleteButtons();
    initConditions();
    initPeriods();
    document.addEventListener(`swac_all_notifications_reloaded`, () => { initNotificationDeleteButtons(); })
    document.addEventListener(`swac_all_triggers_reloaded`, () => { initTriggerDeleteButtons(); })
    document.getElementById("add_condition_btn").addEventListener("click", createCondition);
    const reloadBtn = document.getElementById("notification-reload");
    reloadBtn.addEventListener("click", reloadNotifications);
});

function reloadNotifications() {
    const notifications = document.getElementById("all_notifications");
    notifications.swac_comp.reload();
}

function initNotificationDeleteButtons() {
    const swacContainer = document.getElementById('all_notifications');
    const cards = swacContainer.querySelectorAll('.uk-card');
    cards.forEach(card => {
        card.addEventListener('click', (event) => { event.stopPropagation(); printNotificationData(card.dataset.n_id) });
        const deleteButton = card.querySelector('.notif-delete-btn');
        deleteButton.addEventListener('click', (event) => { event.stopPropagation(); deleteFromDB('notification', card.dataset.n_id) });
    });
}

function deleteFromDB(table, id) {
    fetch(`${window.location.origin}/SmartDataAirquality/smartdata/records/${table}/${id}?storage=gamification`, {
        method: "DELETE"
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Error deleting ${table} with id ${id}`);
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

function resetNotificationForm() {
    const triggerForm = document.getElementById("notification_form");
    triggerForm.reset();
}

function initPopup() {
    const overlay = document.getElementById("popup-overlay");
    const openBtn = document.getElementById("open-trigger-btn");
    const closeBtn = document.getElementById("popup-close");
    const reloadBtn = document.getElementById("popup-reload");
    if (!overlay || !openBtn || !closeBtn) return;

    openBtn.addEventListener("click", (e) => {
        e.preventDefault();
        overlay.classList.add("show");
        document.body.style.overflow = "hidden";
    });

    closeBtn.addEventListener("click", closePopup);

    reloadBtn.addEventListener("click", reloadTriggers);

    const cronInput = document.getElementById("schedule_cron");
    cronInput.addEventListener("input", checkInputs);

    const timeInput = document.getElementById("schedule_timestamp");
    timeInput.addEventListener("input", checkInputs);

    document.addEventListener(`swac_all_triggers_reloaded`, initTriggerSelection)
};

function closePopup() {
    const overlay = document.getElementById("popup-overlay");
    overlay.classList.remove("show");
    document.body.style.overflow = "";
    resetTriggerForm();
}

async function initActions() {
    const select = document.getElementById("select_actions");
    if (!select) return;

    try {
        const response = await fetch(`${window.location.origin}/SmartDataAirquality/smartdata/records/action?storage=gamification`);
        const actions = await response.json();
        actions.records.forEach(action => {
            const option = document.createElement('option');
            option.value = action.id;
            option.textContent = action.title;
            select.appendChild(option);
        });

    } catch (err) {
        console.error("Error loading Actions: ", err);
    }
}

function initTriggerSelection() {
    const entries = document.querySelectorAll('.notification-card');
    entries.forEach(entry => entry.onclick = () => selectTrigger(entry))
}

function resetTriggerForm() {
    const conditionList = document.getElementById("conditions_list");
    while (conditionList.firstChild) {
        conditionList.removeChild(conditionList.firstChild);
    }
    conditionCounter = 1;

    const triggerForm = document.getElementById("trigger_form");
    triggerForm.reset();
    checkInputs();
}

function reloadTriggers() {
    const notifications = document.getElementById("all_triggers");
    notifications.swac_comp.reload();
}

function initTriggerDeleteButtons() {
    const swacContainer = document.getElementById('all_triggers');
    const cards = swacContainer.querySelectorAll('.uk-card');
    cards.forEach(card => {
        const deleteButton = card.querySelector('.notif-delete-btn');
        deleteButton.addEventListener('click', (event) => { event.stopPropagation(); deleteTrigger(card.dataset.t_id); });
    });
}

function deleteTrigger(id) {
    fetch(`${window.location.origin}/WebPush/webpush/admin/trigger/${id}`, {
        method: "DELETE"
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Error deleting trigger with id ${id}`);
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
function selectTrigger(elem) {
    const triggerField = document.getElementById("trigger_id");
    triggerField.value = elem.dataset.t_id;
    closePopup();
}

var conditionCounter = 1;
function createCondition() {
    const conditionList = document.getElementById("conditions_list");
    const newCondition = getConditionTemplate(conditionCounter);
    conditionList.appendChild(newCondition);
    newCondition.querySelector(".remove_condition_btn").addEventListener("click", () => {
        newCondition.remove();
    });
    conditionCounter++;
}

function checkInputs() {
    const cronInput = document.getElementById("schedule_cron");
    const cronHelp = document.getElementById("help_cron");
    const timeInput = document.getElementById("schedule_timestamp");
    if (cronInput.value.trim() !== "") {
        timeInput.disabled = true;
        timeInput.classList.add("hide");
    } else {
        timeInput.disabled = false;
        timeInput.classList.remove("hide");
    }
    if (timeInput.value.trim() !== "") {
        cronInput.disabled = true;
        cronInput.classList.add("hide");
        cronHelp.disabled = true;
        cronHelp.classList.add("hide");
    } else {
        cronInput.disabled = false;
        cronInput.classList.remove("hide");
        cronHelp.disabled = false;
        cronHelp.classList.remove("hide");
    }
}

async function printNotificationData(id) {
    try {

        const notifRes = await fetch(`${window.location.origin}/SmartDataAirquality/smartdata/records/notification?storage=gamification&filter=id,eq,${id}`);
        if (!notifRes.ok) throw new Error("Notification not found");
        const notification = await notifRes.json();

        const triggerId = notification.records[0].trigger_id;
        if (!triggerId) throw new Error("Notification has no triggerId");

        const triggerRes = await fetch(`${window.location.origin}/SmartDataAirquality/smartdata/records/trigger?storage=gamification&filter=id,eq,${triggerId}`);
        if (!triggerRes.ok) throw new Error("Trigger not found");
        const trigger = await triggerRes.json();

        const mappingRes = await fetch(`${window.location.origin}/SmartDataAirquality/smartdata/records/trigger_condition?storage=gamification&filter=trigger_id,eq,${triggerId}`);
        if (!mappingRes.ok) throw new Error("Could not load trigger-condition mapping");
        const conditionMappings = await mappingRes.json();

        const conditions = [];
        for (const map of conditionMappings.records) {
            const condRes = await fetch(`${window.location.origin}/SmartDataAirquality/smartdata/records/condition?storage=gamification&filter=id,eq,${map.condition_id}`);
            if (condRes.ok) {
                condResJson = await condRes.json()
                conditions.push(condResJson.records[0]);
            }
        }

        const result = {
            notification_id: id,
            ...notification.records[0],
            trigger: {
                ...trigger.records[0],
                conditions: conditions
            }
        };
        console.log(`=====NOTIFICATIONDETAILS=====\n`, JSON.stringify(result, null, 2), "\n", `============================`);
        return result;

    } catch (err) {
        console.error("Error getting notification details:", err.message);
    }
}
