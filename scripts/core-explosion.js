// При знищенні ядра команди CORE_DESTROY_TEAM — підрив усіх інших ядер.

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
        var core = cores[i];
        core.kill();
        print("Green TD: підірвано ядро " + core.team.name);
    }
});
