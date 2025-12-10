document.addEventListener('swac_components_complete', () => {
    initConditions();
    initPeriods();
    const addConditionBtn = document.getElementById("add_condition_btn");
    addConditionBtn.addEventListener("click", createCondition);
});

var condition_types = [];
async function initConditions() {
    try {
        const response = await fetch(`${window.location.origin}/SmartDataAirquality/smartdata/records/condition_type?storage=gamification`);
        condition_types = await response.json().then(data => data.records);
    } catch (err) {
        console.error("Error loading condition: ", err);
    }
}

var condition_periods = [];
async function initPeriods() {
    try {
        const response = await fetch(`${window.location.origin}/SmartDataAirquality/smartdata/records/condition_period?storage=gamification`);
        condition_periods = await response.json().then(data => data.records);
    } catch (err) {
        console.error("Error loading condition: ", err);
    }
}

var conditionCounter = 1;
function createCondition() {
    const conditionList = document.getElementById("conditions_list");
    const newCondition = document.createElement("li");
    newCondition.innerHTML = getConditionTemplate();
    conditionList.appendChild(newCondition);
    initDataField();
    initPeriod(conditionCounter);
    newCondition.querySelector(".remove_condition_btn").addEventListener("click", () => {
        newCondition.remove();
    });
    conditionCounter++;
}

function initDataField() {
    const dataFieldSelect = document.getElementById(`data_field_${conditionCounter}`);
    condition_types.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.type;
        dataFieldSelect.appendChild(option);
    });
}

function initPeriod(id) {
    const PeriodSelect = document.getElementById(`period_${id}`);
    condition_periods.forEach(period => {
        const option = document.createElement('option');
        option.value = period.id;
        option.textContent = period.type;
        PeriodSelect.appendChild(option);
    });
}

function getConditionTemplate() {
    const template = `
            <a class="uk-accordion-title" href="#">Condition ${conditionCounter}</a>
            <div class="uk-accordion-content uk-padding-small">
                <div class="uk-margin">
                    <label class="uk-form-label" for="data_field">DATA FIELD</label>             
                    <select class="uk-select" name="data_field_${conditionCounter}" id="data_field_${conditionCounter}" onchange="dataSelectionChanged(event, ${conditionCounter})"required>
                    </select>
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
                <div class="uk-margin" id="period_div_${conditionCounter}">    
                    <label class="uk-form-label" for="period_${conditionCounter}">Select Period</label>
                    <select class="uk-select" name="period_${conditionCounter}" id="period_${conditionCounter}" onchange="periodSelectionChanged(event, ${conditionCounter})">        
                    </select>
                </div>
                <div class="uk-margin" id="period_options_${conditionCounter}">     
                </div>
                <button class="uk-button uk-button-danger uk-button-small remove_condition_btn" type="button">
                    Remove
                </button>
            </div>
        `;
    return template;
}

function dataSelectionChanged(e, conditionID) {
    const value = e.target.value;
    const periodic = condition_types.find(t => t.id == value).periodic;
    const periodDiv = document.getElementById(`period_div_${conditionID}`);
    periodDiv.innerHTML = "";
    const optionsDiv = document.getElementById(`period_options_${conditionID}`);
    optionsDiv.innerHTML = "";
    if (periodic) {
        periodDiv.innerHTML = `
            <label class="uk-form-label" for="period_${conditionID}">Select Period</label>
            <select class="uk-select" name="period_${conditionID}" id="period_${conditionID}" onchange="periodSelectionChanged(event, ${conditionID})">        
            </select>
        `;
        initPeriod(conditionID);
    }
}

function periodSelectionChanged(e, conditionID) {
    const value = e.target.value;
    const optionsDiv = document.getElementById(`period_options_${conditionID}`);
    optionsDiv.innerHTML = "";

    switch (value) {
        case "7":
            optionsDiv.innerHTML = `
                <label class="uk-form-label" for="period_date_${conditionID}">Date:</label>
                <input class="uk-input" type="date" name="period_date_${conditionID}" required>
            `;
            break;

        case "8":
            optionsDiv.innerHTML = `
                <label class="uk-form-label" for="daily_time_start_${conditionID}">Start: </label>
                <input class="uk-input" type="time" name="daily_time_start_${conditionID}" required>
                <label class="uk-form-label" for="daily_time_end_${conditionID}">End:</label>
                <input class="uk-input" type="time" name="daily_time_end_${conditionID}" required>
            `;
            break;

        case "9":
            optionsDiv.innerHTML = `
                <label class="uk-form-label" for="range_start_${conditionID}">From: </label>
                <input class="uk-input" type="datetime-local" name="range_start_${conditionID}" required>
                <label class="uk-form-label" for="range_end_${conditionID}">Until:</label>
                <input class="uk-input" type="datetime-local" name="range_end_${conditionID}" required>       
            `;
            break;

        default:
            break;
    }
}