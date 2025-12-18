var condition_types = [];
export async function initConditions() {
    try {
        const response = await fetch(`${window.location.origin}/SmartDataAirquality/smartdata/records/condition_type?storage=gamification`);
        condition_types = await response.json().then(data => data.records);
    } catch (err) {
        console.error("Error loading condition: ", err);
    }
}

var condition_periods = [];
export async function initPeriods() {
    try {
        const response = await fetch(`${window.location.origin}/SmartDataAirquality/smartdata/records/condition_period?storage=gamification`);
        condition_periods = await response.json().then(data => data.records);
    } catch (err) {
        console.error("Error loading condition: ", err);
    }
}

function initDataField(dataFieldSelect) {
    condition_types.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.type;
        dataFieldSelect.appendChild(option);
    });
}

function initPeriod(periodSelect) {
    condition_periods.forEach(period => {
        const option = document.createElement('option');
        option.value = period.id;
        option.textContent = period.type;
        periodSelect.appendChild(option);
    });
}

export function getConditionTemplate(conditionCounter) {
    const template = document.createElement('div');
    const suffix = conditionCounter == 0 ? '' : `_${conditionCounter}`;
    template.innerHTML = `
            <a class="uk-accordion-title">Condition${suffix}</a>
            <div class="uk-accordion-content uk-padding-small">
                <div class="uk-margin">
                    <label class="uk-form-label" for="data_field">DATA FIELD</label>             
                    <select class="uk-select" name="data_field${suffix}" id="data_field${suffix}" required>
                    </select>
                </div>
                <div class="uk-margin">
                    <label class="uk-form-label" for="operator">OPERATOR</label>
                    <select class="uk-select" name="operator${suffix}"id="operator${suffix}" required>                      
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
                    <input class="uk-input" name="threshold${suffix}" id="threshold${suffix}" type="number" required>
                </div>
                <div class="uk-margin" id="period_div${suffix}">    
                    <label class="uk-form-label" for="period${suffix}">Select Period</label>
                    <select class="uk-select" name="period${suffix}" id="period${suffix}">        
                    </select>
                </div>
                <div class="uk-margin" id="period_options${suffix}">     
                </div>
                <button class="uk-button uk-button-danger uk-button-small remove_condition_btn" type="button">
                    Remove
                </button>
            </div>
        `;

    const periodDiv = template.querySelector(`#period_div${suffix}`)
    const optionsDiv = template.querySelector(`#period_options${suffix}`);

    const data_field = template.querySelector(`#data_field${suffix}`);
    initDataField(data_field);
    data_field.onchange = (ev) => {dataSelectionChanged(ev, periodDiv, optionsDiv, suffix)};

    const period = template.querySelector(`#period${suffix}`);
    initPeriod(period);

    return template;
}

function dataSelectionChanged(e, periodDiv, optionsDiv, suffix) {
    const value = e.target.value;
    const periodic = condition_types.find(t => t.id == value).periodic;
    periodDiv.innerHTML = "";
    optionsDiv.innerHTML = "";
    if (periodic) {
        periodDiv.innerHTML = `
            <label class="uk-form-label" for="period${suffix}">Select Period</label>
            <select class="uk-select" name="period${suffix}" id="period${suffix}" onchange="">        
            </select>
        `;
        const periodSelect = periodDiv.querySelector(`#period${suffix}`);
        initPeriod(periodSelect);
        periodSelect.onchange = (ev) => {periodSelectionChanged(ev, document.querySelector(`#period_options${suffix}`, suffix))}
    }
}

function periodSelectionChanged(e, optionsDiv, suffix) {
    const value = e.target.value;
    optionsDiv.innerHTML = "";

    switch (value) {
        case "7":
            optionsDiv.innerHTML = `
                <label class="uk-form-label" for="period_date${suffix}">Date:</label>
                <input class="uk-input" type="date" name="period_date${suffix}" required>
            `;
            break;

        case "8":
            optionsDiv.innerHTML = `
                <label class="uk-form-label" for="daily_time_start${suffix}">Start: </label>
                <input class="uk-input" type="time" name="daily_time_start${suffix}" required>
                <label class="uk-form-label" for="daily_time_end${suffix}">End:</label>
                <input class="uk-input" type="time" name="daily_time_end${suffix}" required>
            `;
            break;

        case "9":
            optionsDiv.innerHTML = `
                <label class="uk-form-label" for="range_start${suffix}">From: </label>
                <input class="uk-input" type="datetime-local" name="range_start${suffix}" required>
                <label class="uk-form-label" for="range_end${suffix}">Until:</label>
                <input class="uk-input" type="datetime-local" name="range_end${suffix}" required>       
            `;
            break;

        default:
            break;
    }
}