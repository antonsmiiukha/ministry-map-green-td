// Система нагріву турелей.
// Нагрів при кожному пострілі, постійне охолодження.
// Квадратична крива сповільнення — плавний перехід.

var heatMap = {};
var lastAmmo = {};

// Визначити coolFactor на основі рідин
function getCoolFactor(b){
    var factor = 1.0;
    try {
        if(b.liquids != null){
            if(b.liquids.get(Liquids.cryofluid) > 0.1) factor = LIQUID_COOLING["cryofluid"];
            else if(b.liquids.get(Liquids.water) > 0.1) factor = LIQUID_COOLING["water"];
        }
    } catch(e) {}
    return factor;
}

Events.run(Trigger.update, function(){
    Groups.build.each(function(b){
        if(b == null || b.block == null) return;
        if(b.block.ammoTypes == null || b.block.ammoTypes.size == 0) return;
        if(b.reloadCounter == null) return;

        var id = b.id;
        if(heatMap[id] == null) heatMap[id] = 0;

        var coolFactor = getCoolFactor(b);

        // Охолодження — завжди
        heatMap[id] = Math.max(0, heatMap[id] - COOL_RATE / coolFactor);

        // Нагрів — тільки при реальному пострілі (totalAmmo зменшився)
        var prevAmmo = lastAmmo[id] || 0;
        var currAmmo = b.totalAmmo || 0;
        lastAmmo[id] = currAmmo;

        if(currAmmo < prevAmmo){
            heatMap[id] = Math.min(MAX_HEAT, heatMap[id] + HEAT_GAIN * coolFactor);
        }

        // Сповільнення перезарядки (квадратична крива)
        if(heatMap[id] > 0){
            var ratio = heatMap[id] / MAX_HEAT;
            var penalty = ratio * ratio * MAX_SLOWDOWN;
            b.reloadCounter = Math.max(0, b.reloadCounter - penalty);
        }
    });
});

// Бар нагріву на кожній турелі
Vars.content.blocks().each(function(block){
    if(block == null || block.ammoTypes == null || block.ammoTypes.size == 0) return;
    block.addBar("heat", function(e){
        return new Bar("Heat", Color.red, function(){
            return (heatMap[e.id] || 0) / MAX_HEAT;
        });
    });
});
