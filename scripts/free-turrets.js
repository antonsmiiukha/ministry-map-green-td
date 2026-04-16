// Автоматично наповнює турелі патронами/рідиною кожну секунду.

Events.on(WorldLoadEvent, function(){
    print("Green TD: запуск автоподачі патронів");

    Timer.schedule(function(){
        Groups.build.each(function(b){
            if(b == null || b.block == null) return;

            // ItemTurret — подати предмет
            if(b.block instanceof ItemTurret && b.totalAmmo < b.block.maxAmmo){
                var keys = b.block.ammoTypes.keys();
                if(keys.hasNext()){
                    b.handleItem(b, keys.next());
                }
            }

            // LiquidTurret — долити рідину
            if(b.block instanceof LiquidTurret && b.liquids != null){
                var keys = b.block.ammoTypes.keys();
                if(keys.hasNext()){
                    b.liquids.add(keys.next(), b.block.liquidCapacity);
                }
            }
        });
    }, 0, 1, -1);
});
