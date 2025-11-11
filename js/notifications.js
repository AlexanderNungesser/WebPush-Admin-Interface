document.addEventListener("DOMContentLoaded", () => {
    initPopup();
    initActions();
    initTriggerForm();
    initNotificationForm();
});

document.addEventListener('swac_components_complete', () =>{
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
    const triggerForm = document.getElementById("trigger_form");;

    if (triggerForm) {
        triggerForm.addEventListener("submit", function (event) {
            event.preventDefault();
            console.log("new trigger created")
            triggerForm.reset();
        });
    }
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
