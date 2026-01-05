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
                    <label class="uk-form-label" for="data_field">Data Field</label>             
                    <select class="uk-select data_field" name="type_id${suffix}" id="data_field${suffix}" required>
                    </select>
                </div>
                <div class="uk-margin">
                    <label class="uk-form-label" for="operator">Operator</label>
                    <select class="uk-select operator" name="operator${suffix}"id="operator${suffix}" required>                      
                        <option value="=="> == </option>                  
                        <option value="!="> != </option>                     
                        <option value=">"> > </option>                  
                        <option value=">="> >= </option>                     
                        <option value="<"> < </option>                  
                        <option value="<="> <= </option>       
                    </select>
                </div>
                <div class="uk-margin">     
                    <label class="uk-form-label" for="threshold">Threshold</label>
                    <input class="uk-input threshold" name="threshold${suffix}" id="threshold${suffix}" type="number" required>
                </div>
                <div class="uk-margin" id="period_div${suffix}">    
                    <label class="uk-form-label" for="period${suffix}">Select Period</label>
                    <select class="uk-select period" name="period_id${suffix}" id="period${suffix}">        
                    </select>
                </div>
                <div class="uk-margin" id="period_options${suffix}">     
                </div>
                <div class="uk-margin" id="buttons${suffix}">     
                    <button class="uk-button uk-button-danger uk-button-small remove_condition_btn" type="button">
                        Remove
                    </button>
                </div>
            </div>
        `;

    const periodDiv = template.querySelector(`#period_div${suffix}`)
    const optionsDiv = template.querySelector(`#period_options${suffix}`);

    const data_field = template.querySelector(`#data_field${suffix}`);
    initDataField(data_field);
    data_field.onchange = (ev) => { dataSelectionChanged(ev, periodDiv, optionsDiv, suffix) };

    const period = template.querySelector(`#period${suffix}`);
    initPeriod(period);
    period.onchange = (ev) => { periodSelectionChanged(ev, optionsDiv, suffix) }

    return template;
}

function dataSelectionChanged(e, periodDiv, optionsDiv, suffix) {
    const value = e.target.value;
    const periodic = condition_types.find(t => t.id == value).periodic;
    periodDiv.innerHTML = "";
    optionsDiv.innerHTML = "";
    if (periodic) {
        periodDiv.innerHTML = `
            <label class="uk-form-label" for="period_id${suffix}">Select Period</label>
            <select class="uk-select period" name="period_id${suffix}" id="period${suffix}">        
            </select>
        `;
        const periodSelect = periodDiv.querySelector(`#period${suffix}`);
        initPeriod(periodSelect);
        periodSelect.onchange = (ev) => { periodSelectionChanged(ev, document.querySelector(`#period_options${suffix}`), suffix) }
    }
}

function periodSelectionChanged(e, optionsDiv, suffix) {
    const value = e.target.value;
    optionsDiv.innerHTML = "";

    switch (value) {
        case "7":
            optionsDiv.innerHTML = `
                <label class="uk-form-label" for="period_date${suffix}">Date:</label>
                <input class="uk-input date" type="date" name="period_date${suffix}" required>
            `;
            break;

        case "8":
            optionsDiv.innerHTML = `
                <label class="uk-form-label" for="daily_time_start${suffix}">Start: </label>
                <input class="uk-input time_start" type="time" name="daily_time_start${suffix}" required>
                <label class="uk-form-label" for="daily_time_end${suffix}">End:</label>
                <input class="uk-input time_end" type="time" name="daily_time_end${suffix}" required>
            `;
            break;

        case "9":
            optionsDiv.innerHTML = `
                <label class="uk-form-label" for="range_start${suffix}">From: </label>
                <input class="uk-input range_start" type="datetime-local" name="range_start${suffix}" required>
                <label class="uk-form-label" for="range_end${suffix}">Until:</label>
                <input class="uk-input range_end" type="datetime-local" name="range_end${suffix}" required>       
            `;
            break;

        default:
            break;
    }
}

export function loadDataIntoCondition(data, conditionElem) {
    try {
        const title = conditionElem.querySelector('.uk-accordion-title');
        if (title) title.textContent = `Condition ${data.id}`;

        const dataField = conditionElem.querySelector('.data_field');
        if (dataField) {
            dataField.value = data.type_id;
            dataField.dispatchEvent(new Event("change", { bubbles: true }));
        }

        const period = conditionElem.querySelector('.period');
        if (period) {
            period.value = data.period_id;
            period.dispatchEvent(new Event("change", { bubbles: true }));
        }

        const threshold = conditionElem.querySelector('.threshold');
        if (threshold) threshold.value = data.threshold;

        const operator = conditionElem.querySelector('.operator');
        if (operator) operator.value = data.operator;

        const dateStart = conditionElem.querySelector('.date');
        if (dateStart) dateStart.value = data.date_start;

        const timeStart = conditionElem.querySelector('.time_start');
        if (timeStart) timeStart.value = data.time_start;

        const timeEnd = conditionElem.querySelector('.time_end');
        if (timeEnd) timeEnd.value = data.time_end;

        const rangeStart = conditionElem.querySelector('.range_start');
        if (rangeStart) rangeStart.value = toDateTimeLocalValue(data.date_start, data.time_start)

        const rangeEnd = conditionElem.querySelector('.range_end');
        if (rangeEnd) rangeEnd.value = toDateTimeLocalValue(data.date_end, data.time_end);

    } catch (err) {
        console.error("Error loading condition data into element:", err)
    }
}

function toDateTimeLocalValue(dateStr, timeStr) {
    if (!dateStr || !timeStr) return "";

    const [y, m, d] = dateStr.split("-").map(Number);
    const [h, min] = timeStr.split(":").map(Number);

    const date = new Date(y, m - 1, d, h, min);

    const pad = n => String(n).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
        + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}