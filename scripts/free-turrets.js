// Автоматично наповнює турелі патронами/рідиною кожну секунду.

var turretTimer = null;

Events.on(WorldLoadEvent, function(){
    if(turretTimer != null){
        turretTimer.cancel();
    }

    print("Green TD: запуск автоподачі патронів");

    turretTimer = Timer.schedule(function(){
        try {
            Groups.build.each(function(b){
                if(b == null || b.block == null) return;
                if(b.block.ammoTypes == null || b.block.ammoTypes.size == 0) return;

                // ItemTurret — подати предмет
                if(b.items != null && b.totalAmmo < b.block.maxAmmo){
                    var fed = false;
                    b.block.ammoTypes.each(function(k, v){
                        if(!fed){
                            b.handleItem(b, k);
                            fed = true;
                        }
                    });
                }

                // LiquidTurret — долити рідину
                if(b.liquids != null){
                    b.block.ammoTypes.each(function(k, v){
                        if(k instanceof Liquid){
                            b.liquids.add(k, b.block.liquidCapacity);
                        }
                    });
                }
            });
        } catch(e) {
            print("Green TD turret error: " + e);
        }
    }, 1, 1, -1);
});
