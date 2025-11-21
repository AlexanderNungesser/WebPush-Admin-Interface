window['notification_form_swac_options'] = {
    customAfterSave: () => {
        resetNotificationForm();
        reloadNotifications();
    },
    target: 'createNotification'
}

window['trigger_form_swac_options'] = {
    customAfterSave: () => {
        resetTriggerForm();
        reloadTriggers();
    },
    target: 'createTrigger'
}

document.addEventListener('swac_components_complete', () => {
    initPopup();
    initActions();
    initTriggerForm();
    initNotificationDeleteButtons();
    initTriggerDeleteButtons();
    const reloadBtn = document.getElementById("notification-reload");
    reloadBtn.addEventListener("click", reloadNotifications);
});

function reloadNotifications() {
    const notifications = document.getElementById("all_notifications");
    notifications.swac_comp.reload();
    initNotificationDeleteButtons();
}

function initNotificationDeleteButtons() {
    const swacContainer = document.getElementById('all_notifications');
    const cards = swacContainer.querySelectorAll('.uk-card');
    cards.forEach(card => {
        const deleteButton = card.querySelector('.notif-delete-btn');
        deleteButton.addEventListener('click', () => { deleteFromDB('notifications', card.dataset.n_id) });
    });
}

function deleteFromDB(table, id) {
    fetch(`${window.location.origin}/SmartDataAirquality/smartdata/records/${table}/${id}?storage=gamification`, {
        method: "DELETE"
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Error deleting ${table} with id ${id}`);
        }
        reloadNotifications();
        reloadTriggers();
    }).catch(err => console.error(err));
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
        const response = await fetch(`${window.location.origin}/SmartDataAirquality/smartdata/records/actions?storage=gamification`);
        const actions = await response.json();
        actions.records.forEach(action => {
            const opt = document.createElement("label");
            opt.innerHTML = `<input class="uk-checkbox" name="action_${action.id}" id="action_${action.id}" type="checkbox"> ${action.action_type}`
            select.appendChild(opt);
        });

    } catch (err) {
        console.error("Error loading Actions: ", err);
    }
}

function initTriggerSelection() {
    const entries = document.querySelectorAll('.notification-card');
    entries.forEach(entry => entry.onclick = () => selectTrigger(entry))
}

function initTriggerForm() {
    const addConditionBtn = document.getElementById("add_condition_btn");
    addConditionBtn.addEventListener("click", createCondition);
    initTriggerSelection();
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
    initTriggerDeleteButtons();
}

function initTriggerDeleteButtons() {
    const swacContainer = document.getElementById('all_triggers');
    const cards = swacContainer.querySelectorAll('.uk-card');
    cards.forEach(card => {
        const deleteButton = card.querySelector('.notif-delete-btn');
        deleteButton.addEventListener('click', (event) => { event.stopPropagation(); deleteFromDB('triggers', card.dataset.t_id); });
    });
}
function selectTrigger(elem) {
    const triggerField = document.getElementById("trigger_id");
    triggerField.value = elem.dataset.t_id;
    closePopup();
}


function checkInputs() {
    const cronInput = document.getElementById("schedule_cron");
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
    } else {
        cronInput.disabled = false;
        cronInput.classList.remove("hide");
    }
}


var conditionCounter = 1;
function createCondition() {
    const conditionList = document.getElementById("conditions_list");
    const li = document.createElement("li");
    li.innerHTML = `
            <a class="uk-accordion-title" href="#">Condition ${conditionCounter}</a>
            <div class="uk-accordion-content uk-padding-small">
                <div class="uk-margin">
                    <label class="uk-form-label" for="data_field">DATA FIELD</label>             
                    <input class="uk-input" name ="data_field_${conditionCounter} "id="data_field_${conditionCounter}" type="text" placeholder="gamification:groups:xp" required>
                </div>
                <div class="uk-margin">
                    <label class="uk-form-label" for="operator">OPERATOR</label>
                    <select class="uk-select" name="operator_${conditionCounter}"id="operator_${conditionCounter}" required>                      
                        <option value="=="> == </option>                  
                        <option value="!="> != </option>                     
                        <option value=">"> > </option>                  
                        <option value=">="> >= </option>                     
                        <option value="<"> < </option>                  
                        <option value="<="> <= </option>       
                    </select>
                </div>
                <div class="uk-margin">     
                    <label class="uk-form-label" for="threshold">THRESHOLD</label>
                    <input class="uk-input" name="threshold_${conditionCounter}" id="threshold_${conditionCounter}" type="number" required>
                </div>
                <button class="uk-button uk-button-danger uk-button-small remove_condition_btn" type="button">
                    Remove
                </button>
            </div>
        `;
    conditionList.appendChild(li);

    li.querySelector(".remove_condition_btn").addEventListener("click", () => {
        li.remove();
    });
    conditionCounter++;
}