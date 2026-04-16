// Турелі працюють без патронів та електрики.

var freeTurrets = [
    Blocks.duo, Blocks.scatter, Blocks.scorch, Blocks.hail,
    Blocks.arc, Blocks.wave, Blocks.lancer, Blocks.swarmer,
    Blocks.salvo, Blocks.fuse, Blocks.ripple, Blocks.cyclone,
    Blocks.foreshadow, Blocks.spectre, Blocks.meltdown
];

Events.on(WorldLoadEvent, function(){
    if(!isGreenTDMap()) return;

    for(var i = 0; i < freeTurrets.length; i++){
        var turret = freeTurrets[i];
        if(turret == null) continue;

        // Без патронів
        turret.hasItems = false;
        if(turret.ammoTypes != null) turret.ammoTypes.clear();
        turret.maxAmmo = 999999;

        // Без електрики
        turret.hasPower = false;
        turret.consPower = null;

        // Без рідини (wave тощо)
        turret.hasLiquids = false;
    }

    print("Green TD: турелі не потребують ресурсів");
});
