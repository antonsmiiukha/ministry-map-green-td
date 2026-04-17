// Green TD — головний файл мода.

// Завантажити конфіг (тільки прості var = значення, без callback'ів)
var modRoot = Vars.mods.getMod("green-td").root.child("scripts");
eval(modRoot.child("config.js").readString());
print("Green TD: конфіг завантажено");

// =============================================
// Усі юніти використовують зброю crawler (самопідрив)
// =============================================

function applyCrawlerSelfDestructLoadout(){
    var crawlerWeapons = [];
    for(var wi = 0; wi < UnitTypes.crawler.weapons.size; wi++){
        crawlerWeapons.push(UnitTypes.crawler.weapons.get(wi));
    }

    var units = Vars.content.units();
    var changed = 0;
    for(var i = 0; i < units.size; i++){
        var type = units.get(i);
        if(type == null || type.weapons == null) continue;
        // Не змінюємо літаючі юніти, щоб зберегти "літачки" гравців
        if(type.flying) continue;

        type.weapons.clear();
        for(var cwi = 0; cwi < crawlerWeapons.length; cwi++){
            type.weapons.add(crawlerWeapons[cwi]);
        }
        changed++;
    }

    print("Green TD: зброю всіх юнітів замінено на crawler (" + changed + " типів)");
}

applyCrawlerSelfDestructLoadout();
Events.on(WorldLoadEvent, function(){
    applyCrawlerSelfDestructLoadout();
});

// =============================================
// Нагороди за знищення ворожих юнітів
// =============================================

Events.on(UnitDestroyEvent, function(e){
    if(e.unit == null || e.unit.type == null) return;
    if(e.unit.team == Vars.state.rules.defaultTeam) return;

    var reward = UNIT_REWARDS[e.unit.type.id];
    if(reward == null) return;

    for(var i = 0; i < REWARD_TEAMS.length; i++){
        var team = REWARD_TEAMS[i];
        var data = Vars.state.teams.get(team);
        if(data == null) continue;

        var core = data.core();
        if(core == null) continue;

        for(var key in reward){
            var item = ITEM_MAP[key];
            if(item != null){
                core.items.add(item, reward[key]);
            }
        }
    }
});

// =============================================
// Підрив ядер при знищенні ядра CORE_DESTROY_TEAM
// =============================================

var coreChainReactionActive = false;

Events.on(BlockDestroyEvent, function(e){
    if(coreChainReactionActive) return;
    if(e == null || e.tile == null) return;

    var tile = e.tile;
    var destroyedTeam = null;
    var wasCore = false;

    try {
        destroyedTeam = tile.team();
        wasCore = tile.block() instanceof CoreBlock;
    } catch(err){
        return;
    }

    if(!wasCore) return;
    if(destroyedTeam == null || destroyedTeam != CORE_DESTROY_TEAM) return;

    coreChainReactionActive = true;
    print("Green TD: ядро " + destroyedTeam.name + " знищено — глобальний підрив турелей, юнітів і ядер!");

    var buildingsToKill = [];
    Groups.build.each(function(b){
        if(b == null || b.block == null || b.team == null) return;
        var isCore = b.block instanceof CoreBlock;
        var isTurret = b.block instanceof Turret;
        if(!isCore && !isTurret) return;
        try {
            if(b.isValid()) buildingsToKill.push(b);
        } catch(err){}
    });

    for(var i = 0; i < buildingsToKill.length; i++){
        try {
            buildingsToKill[i].kill();
        } catch(err){}
    }

    var unitsToKill = [];
    Groups.unit.each(function(u){
        if(u == null) return;
        try {
            if(u.isValid()) unitsToKill.push(u);
        } catch(err){}
    });

    for(var ui = 0; ui < unitsToKill.length; ui++){
        try {
            unitsToKill[ui].kill();
        } catch(err){}
    }

    coreChainReactionActive = false;
});

// =============================================
// Автоподача патронів + рідини для турелей
// =============================================

var turretAmmoMap = {};
var turretTimer = null;

Events.on(WorldLoadEvent, function(){
    if(turretTimer != null){
        turretTimer.cancel();
    }

    // Побудувати словник амуніції
    turretAmmoMap = {};
    var blocks = Vars.content.blocks();
    for(var bi = 0; bi < blocks.size; bi++){
        var block = blocks.get(bi);
        if(block == null || block.ammoTypes == null || block.ammoTypes.size == 0) continue;

        // Зібрати перший ключ через java ArrayList (Rhino v8 не тримає JS-замикання в eval)
        var keys = new java.util.ArrayList();
        block.ammoTypes.each(function(k, v){
            if(keys.size() == 0) keys.add(k);
        });

        if(keys.size() > 0){
            var fk = keys.get(0);
            turretAmmoMap[block.id] = {key: fk, liquid: fk instanceof Liquid};
        }

        if(!block.hasLiquids){
            block.hasLiquids = true;
            block.liquidCapacity = Math.max(block.liquidCapacity, TURRET_LIQUID_CAPACITY);
        }
    }

    print("Green TD: знайдено типів турелей: " + Object.keys(turretAmmoMap).length);

    // Подача патронів
    turretTimer = Timer.schedule(function(){
        Groups.build.each(function(b){
            if(b == null || b.block == null) return;
            var ammo = turretAmmoMap[b.block.id];
            if(ammo == null) return;
            try {
                if(ammo.liquid && b.liquids != null){
                    b.liquids.add(ammo.key, b.block.liquidCapacity);
                } else if(!ammo.liquid && b.items != null){
                    for(var i = 0; i < AMMO_FEED_COUNT; i++) b.handleItem(b, ammo.key);
                }
            } catch(e) {}
        });
    }, AMMO_FEED_DELAY, AMMO_FEED_INTERVAL, -1);
});

// =============================================
// Система нагріву турелей
// =============================================

var heatMap = {};
var lastAmmo = {};

Events.run(Trigger.update, function(){
    Groups.build.each(function(b){
        if(b == null || b.block == null) return;
        if(b.reloadCounter == null) return;

        var hasAmmo = b.block.ammoTypes != null && b.block.ammoTypes.size > 0;
        var isPowerTurret = b.block.hasPower && HEAT_GAIN_MAP[b.block.id] != null;
        if(!hasAmmo && !isPowerTurret) return;

        var id = b.id;
        if(heatMap[id] == null) heatMap[id] = 0;

        var coolFactor = 1.0;
        try {
            if(b.liquids != null){
                if(b.liquids.get(Liquids.cryofluid) > 0.1) coolFactor = LIQUID_COOLING["cryofluid"];
                else if(b.liquids.get(Liquids.water) > 0.1) coolFactor = LIQUID_COOLING["water"];
            }
        } catch(e) {}

        // Охолодження — завжди
        heatMap[id] = Math.max(0, heatMap[id] - COOL_RATE / coolFactor);

        if(hasAmmo){
            // ItemTurret/LiquidTurret — нагрів по витраті патронів
            var prevAmmo = lastAmmo[id] || 0;
            var currAmmo = b.totalAmmo || 0;
            lastAmmo[id] = currAmmo;
            if(currAmmo < prevAmmo){
                var heatGain = HEAT_GAIN_MAP[b.block.id] || HEAT_GAIN_DEFAULT;
                heatMap[id] = Math.min(MAX_HEAT, heatMap[id] + heatGain * coolFactor);
            }
        } else if(isPowerTurret && b.shooting){
            // PowerTurret — нагрів кожен кадр поки стріляє
            var heatGain = (HEAT_GAIN_MAP[b.block.id] || HEAT_GAIN_DEFAULT) * 0.017;
            heatMap[id] = Math.min(MAX_HEAT, heatMap[id] + heatGain * coolFactor);
        }

        // Сповільнення перезарядки (квадратична крива)
        if(heatMap[id] > 0){
            var ratio = heatMap[id] / MAX_HEAT;
            var penalty = ratio * ratio * MAX_SLOWDOWN;
            b.reloadCounter = Math.max(0, b.reloadCounter - penalty);
        }
    });
});

// =============================================
// Подача електрики для PowerTurrets
// =============================================

Events.run(Trigger.update, function(){
    Groups.build.each(function(b){
        if(b == null || b.block == null) return;
        if(!b.block.hasPower) return;
        try { b.power.status = 1.0; } catch(e) {}
    });
});

// Бар нагріву — для всіх турелей (ammo + power)
var blocks = Vars.content.blocks();
for(var bi = 0; bi < blocks.size; bi++){
    var block = blocks.get(bi);
    if(block == null) continue;
    var hasAmmoBar = block.ammoTypes != null && block.ammoTypes.size > 0;
    var isPowerBar = block.hasPower && HEAT_GAIN_MAP[block.id] != null;
    if(!hasAmmoBar && !isPowerBar) continue;
    block.addBar("heat", function(e){
        return new Bar("Heat", Color.red, function(){
            return (heatMap[e.id] || 0) / MAX_HEAT;
        });
    });
}

print("Green TD: мод завантажено");
