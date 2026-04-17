// Автоматично наповнює турелі патронами/рідиною.
// Дозволяє турелям приймати рідину для охолодження.

var turretAmmoMap = {};
var turretTimer = null;

Events.on(WorldLoadEvent, function(){
    if(turretTimer != null){
        turretTimer.cancel();
    }

    // Побудувати словник амуніції + дозволити рідину
    turretAmmoMap = {};
    Vars.content.blocks().each(function(block){
        if(block == null || block.ammoTypes == null || block.ammoTypes.size == 0) return;
        block.ammoTypes.each(function(k, v){
            if(turretAmmoMap[block.id] == null){
                turretAmmoMap[block.id] = {key: k, liquid: k instanceof Liquid};
            }
        });
        if(!block.hasLiquids){
            block.hasLiquids = true;
            block.liquidCapacity = Math.max(block.liquidCapacity, TURRET_LIQUID_CAPACITY);
        }
    });

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
