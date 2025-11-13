document.addEventListener('swac_components_complete', () => {
    initPopup();
    initActions();
    initTriggerForm();
    initNotificationForm();
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
        const response = await fetch("../data/example_actions.json");
        const triggers = await response.json();

        select.innerHTML = "";

        triggers.forEach(trigger => {
            const opt = document.createElement("option");
            opt.value = trigger.id;
            opt.textContent = trigger.title;
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
                    <input class="uk-input" name="datenfeld1" type="text" placeholder="Datenfeld 1" required>
                </div>
                <div class="uk-margin">
                    <input class="uk-input" name="datenfeld2" type="text" placeholder="Datenfeld 2" required>
                </div>
                <div class="uk-margin">
                    <input class="uk-input" name="datenfeld3" type="text" placeholder="Datenfeld 3" required>
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
    const triggerForm = document.getElementById("trigger_form")
    triggerForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const jsonOutput = {
            when: {
                schedule: {
                    type: document.getElementById("schedule_type").value || "",
                    cron: document.getElementById("schedule_cron").value || "",
                    timestamp: document.getElementById("schedule_timestamp").value || ""
                },
                conditions: []
            }
        };
        const conditions = conditionList.querySelectorAll("li");
        conditions.forEach(li => {
            const inputs = li.querySelectorAll("input");
            jsonOutput.when.conditions.push({
                "datenfeld 1": inputs[0].value,
                "datenfeld 2": inputs[1].value,
                "datenfeld 3": inputs[2].value
            });
        });
        console.log(jsonOutput);
        triggerForm.reset;
    });
}

function selectTrigger(elem) {
    const triggerField = document.getElementById("trigger");
    triggerField.value = elem.dataset.t_id;
    closePopup();
}


function initNotificationForm() {
    const notificationForm = document.getElementById("notification_form");
    if (notificationForm) {
        notificationForm.addEventListener("submit", function (event) {
            event.preventDefault();
            console.log("new notification created")
            notificationForm.reset();
        });
    }
}
