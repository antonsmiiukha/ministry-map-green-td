// Green TD — головний файл мода.

// Завантажити конфіг (тільки прості var = значення, без callback'ів)
var modRoot = Vars.mods.getMod("green-td").root.child("scripts");
eval(modRoot.child("config.js").readString());
print("Green TD: конфіг завантажено");

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

Events.on(BlockDestroyEvent, function(e){
    if(e.tile == null || e.tile.build == null) return;

    var build = e.tile.build;
    if(build.team != CORE_DESTROY_TEAM) return;
    if(!(build.block instanceof CoreBlock)) return;

    print("Green TD: ядро " + CORE_DESTROY_TEAM.name + " знищено — підрив усіх ядер!");

    var cores = [];
    Groups.build.each(function(b){
        if(b.block instanceof CoreBlock && b != build){
            cores.push(b);
        }
    });

    for(var i = 0; i < cores.length; i++){
        cores[i].kill();
    }
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
        if(b.block.ammoTypes == null || b.block.ammoTypes.size == 0) return;
        if(b.reloadCounter == null) return;

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

        // Нагрів — тільки при реальному пострілі
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

// Бар нагріву
var blocks = Vars.content.blocks();
for(var bi = 0; bi < blocks.size; bi++){
    var block = blocks.get(bi);
    if(block == null || block.ammoTypes == null || block.ammoTypes.size == 0) continue;
    block.addBar("heat", function(e){
        return new Bar("Heat", Color.red, function(){
            return (heatMap[e.id] || 0) / MAX_HEAT;
        });
    });
}

print("Green TD: мод завантажено");
