window['notification_form_options'] = {
    customAfterSave: function () { reloadNotifications() },
    target: 'notifications'
}

document.addEventListener('swac_components_complete', () => {
    initPopup();
    initActions();
    initTriggerForm();
    const entries = document.querySelectorAll('.notification-card');
    entries.forEach(entry => entry.onclick = () => selectTrigger(entry))
});

function initPopup() {
    const overlay = document.getElementById("popup-overlay");
    const openBtn = document.querySelector("#open-trigger-btn");
    const closeBtn = document.getElementById("popup-close");
    if (!overlay || !openBtn || !closeBtn) return;

    openBtn.addEventListener("click", (e) => {
        e.preventDefault();
        overlay.classList.add("show");
        document.body.style.overflow = "hidden";
    });

    closeBtn.addEventListener("click", closePopup);
};

function closePopup() {
    const overlay = document.getElementById("popup-overlay");
    if (!overlay) return;
    overlay.classList.remove("show");
    document.body.style.overflow = "";
}

async function initActions() {
    const select = document.getElementById("select_actions");
    if (!select) return;

    try {
        const response = await fetch("http://localhost:8080/SmartDataAirquality/smartdata/records/actions?storage=gamification");
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

function initTriggerForm() {
    const conditionList = document.getElementById("conditions_list");
    const addConditionBtn = document.getElementById("add_condition_btn");
    let conditionCounter = 1;
    function createCondition() {
        const li = document.createElement("li");
        li.innerHTML = `
            <a class="uk-accordion-title" href="#">Condition ${conditionCounter}</a>
            <div class="uk-accordion-content uk-padding-small">
                <div class="uk-margin">
                    <label class="uk-form-label" for="data_field">DATA FIELD</label>
                    <select class="uk-select" name ="data_field__${conditionCounter}"id="data_field_${conditionCounter}" required>                      
                        <option value="streak">Streak</option>                  
                        <option value="value">Value</option>       
                    </select>
                </div>
                <div class="uk-margin">
                    <label class="uk-form-label" for="operator">OPERATOR</label>
                    <select class="uk-select" name="operator_${conditionCounter}"id="operator_${conditionCounter}" required>                      
                        <option value="="> = </option>                  
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
        conditionCounter++
    }
    addConditionBtn.addEventListener("click", createCondition);
}
function reloadNotifications() {
    console.log("test");
    const notifications = document.getElementById("all_notifications");
    notifications.swac_comp.reload();
}
function selectTrigger(elem) {
    const triggerField = document.getElementById("trigger_id");
    triggerField.value = elem.dataset.t_id;
    closePopup();
}
