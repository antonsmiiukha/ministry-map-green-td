// Турелі працюють без патронів та електрики.
// Автоматично перезаряджає турелі кожну секунду.

Events.on(WorldLoadEvent, function(){
    if(!isGreenTDMap()) return;

    // Прибрати електрику з усіх турелей
    var allTurrets = [
        Blocks.duo, Blocks.scatter, Blocks.scorch, Blocks.hail,
        Blocks.arc, Blocks.wave, Blocks.lancer, Blocks.swarmer,
        Blocks.salvo, Blocks.fuse, Blocks.ripple, Blocks.cyclone,
        Blocks.foreshadow, Blocks.spectre, Blocks.meltdown
    ];

    for(var i = 0; i < allTurrets.length; i++){
        var turret = allTurrets[i];
        if(turret == null) continue;
        turret.hasPower = false;
        turret.consPower = null;
    }

    // Автоподача патронів кожну секунду
    Timer.schedule(function(){
        if(!isGreenTDMap()) return;

        Groups.build.each(function(b){
            // ItemTurret — подати перший тип амуніції
            if(b.block instanceof ItemTurret && b.totalAmmo < b.block.maxAmmo){
                var keys = b.block.ammoTypes.keys();
                if(keys.hasNext()){
                    b.handleItem(b, keys.next());
                }
            }

            // LiquidTurret — заповнити рідиною
            if(b.block instanceof LiquidTurret && b.liquids != null){
                var keys = b.block.ammoTypes.keys();
                if(keys.hasNext()){
                    b.liquids.add(keys.next(), b.block.liquidCapacity);
                }
            }
        });
    }, 0, 1, -1);

    print("Green TD: турелі не потребують ресурсів");
});
