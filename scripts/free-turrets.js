// Автоматично наповнює турелі патронами/рідиною кожну секунду.

var turretTimer = null;
var turretAmmoMap = {};

Events.on(WorldLoadEvent, function(){
    if(turretTimer != null){
        turretTimer.cancel();
    }

    // Побудувати словник: blockId -> {key, isLiquid}
    turretAmmoMap = {};
    Vars.content.blocks().each(function(block){
        if(block == null || block.ammoTypes == null || block.ammoTypes.size == 0) return;
        block.ammoTypes.each(function(k, v){
            if(turretAmmoMap[block.id] == null){
                turretAmmoMap[block.id] = {key: k, liquid: k instanceof Liquid};
            }
        });
    });

    print("Green TD: запуск автоподачі патронів");

    turretTimer = Timer.schedule(function(){
        Groups.build.each(function(b){
            if(b == null || b.block == null) return;

            var ammo = turretAmmoMap[b.block.id];
            if(ammo == null) return;

            try {
                if(ammo.liquid && b.liquids != null){
                    b.liquids.add(ammo.key, b.block.liquidCapacity);
                } else if(!ammo.liquid && b.items != null){
                    b.handleItem(b, ammo.key);
                }
            } catch(e) {}
        });
    }, 1, 1, -1);
});
