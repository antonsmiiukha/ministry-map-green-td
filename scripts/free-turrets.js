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

                // Знайти перший ключ
                var firstKey = null;
                var isLiquid = false;
                b.block.ammoTypes.each(function(k, v){
                    if(firstKey == null){
                        firstKey = k;
                        isLiquid = k instanceof Liquid;
                    }
                });

                if(firstKey == null) return;

                // Рідина
                if(isLiquid && b.liquids != null){
                    b.liquids.add(firstKey, b.block.liquidCapacity);
                }

                // Предмет
                if(!isLiquid && b.items != null){
                    b.handleItem(b, firstKey);
                }
            });
        } catch(e) {
            print("Green TD turret error: " + e);
        }
    }, 1, 1, -1);
});
