document.addEventListener('swac_components_complete', () => {
    loadAchievementTiers();
});

async function loadAchievementTiers(){
    const tiers = Array.from(document.querySelectorAll(".tier-row-items"));
    const withoutPlaceholders = tiers.slice(3);
    for (const tier of withoutPlaceholders) {
        const conditions = await getConditionsForTrigger(tier.dataset.t_id);
        for (const condition of conditions) {
            const div = document.createElement("div");
            div.className = "tier-item";
            div.textContent = `Condition ${condition.id}`;
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

function clickCondition(conditionId){
    console.log("clicked", conditionId)
}