// Автоматично наповнює турелі патронами/рідиною.
// Дозволяє турелям приймати рідину для охолодження.

var turretAmmoMap = {};
var turretTimer = null;

Events.on(WorldLoadEvent, function(){
    if(turretTimer != null){
        turretTimer.cancel();
    }

    turretAmmoMap = {};
    var blocks = Vars.content.blocks();
    for(var bi = 0; bi < blocks.size; bi++){
        var block = blocks.get(bi);
        if(block == null || block.ammoTypes == null || block.ammoTypes.size == 0) continue;
        var foundKey = null;
        var foundLiquid = false;
        block.ammoTypes.each(function(k, v){
            if(foundKey == null){
                foundKey = k;
                foundLiquid = k instanceof Liquid;
            }
        });
        if(foundKey != null){
            turretAmmoMap[block.id] = {key: foundKey, liquid: foundLiquid};
        }
        if(!block.hasLiquids){
            block.hasLiquids = true;
            block.liquidCapacity = Math.max(block.liquidCapacity, TURRET_LIQUID_CAPACITY);
        }
    }

    print("Green TD: знайдено типів турелей: " + Object.keys(turretAmmoMap).length);

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
