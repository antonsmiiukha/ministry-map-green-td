// Автоматично наповнює турелі патронами/рідиною кожну секунду.

var turretTimer = null;

Events.on(WorldLoadEvent, function(){
    // Скасувати попередній таймер якщо є
    if(turretTimer != null){
        turretTimer.cancel();
    }

    print("Green TD: запуск автоподачі патронів");

    turretTimer = Timer.schedule(function(){
        try {
            Groups.build.each(function(b){
                if(b == null || b.block == null) return;

                // Перевіряємо наявність ammoTypes (ItemTurret або LiquidTurret)
                if(b.block.ammoTypes != null && b.block.ammoTypes.size > 0){
                    var keys = b.block.ammoTypes.keys();
                    if(!keys.hasNext()) return;
                    var firstKey = keys.next();

                    // Предмети
                    if(b.items != null && b.totalAmmo != null && b.totalAmmo < b.block.maxAmmo){
                        b.handleItem(b, firstKey);
                    }

                    // Рідини
                    if(b.liquids != null && firstKey instanceof Liquid){
                        b.liquids.add(firstKey, b.block.liquidCapacity);
                    }
                }
            });
        } catch(e) {
            print("Green TD turret error: " + e);
        }
    }, 1, 1, -1);
});
