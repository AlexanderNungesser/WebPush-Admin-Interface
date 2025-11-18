window['notification_form_options'] = {
    target:'notifications'
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
            opt.innerHTML =`<label><input class="uk-checkbox" name="action_${action.id}" id="action_${action.id}" type="checkbox"> ${action.action_type}</label>`
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
            <a class="uk-accordion-title" href="#">Condition ${conditionCounter++}</a>
            <div class="uk-accordion-content uk-padding-small">
                <div class="uk-margin">
                    <label class="uk-form-label" for="data_field">DATA FIELD</label>
                    <select class="uk-select" id="data_field" required>                      
                        <option value="streak">Streak</option>                  
                        <option value="value">Value</option>       
                    </select>
                </div>
                <div class="uk-margin">
                    <label class="uk-form-label" for="operator">OPERATOR</label>
                    <select class="uk-select" id="operator" required>                      
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
                    <input class="uk-input" id="threshold" type="number" required>
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
    }
    addConditionBtn.addEventListener("click", createCondition);
}

function selectTrigger(elem) {
    const triggerField = document.getElementById("trigger_id");
    console.log('selected')
    triggerField.value = elem.dataset.t_id;
    closePopup();
}
