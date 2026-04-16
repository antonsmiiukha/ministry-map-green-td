// При знищенні ядра жовтої команди — підрив усіх інших ядер на карті.

Events.on(BlockDestroyEvent, function(e){
    if(e.tile == null || e.tile.build == null) return;

    var build = e.tile.build;

    // Перевірка: чи це ядро жовтої команди
    if(build.team != Team.sharded) return;
    if(!(build.block instanceof CoreBlock)) return;

    print("Green TD: ядро жовтої команди знищено — підрив усіх ядер!");

    // Збираємо всі ядра на карті (крім жовтого, яке вже знищене)
    var cores = [];
    Groups.build.each(function(b){
        if(b.block instanceof CoreBlock && b != build){
            cores.push(b);
        }
    });

    // Підриваємо з невеликою затримкою для ефекту
    for(var i = 0; i < cores.length; i++){
        var core = cores[i];
        core.kill();
        print("Green TD: підірвано ядро " + core.team.name);
    }
});
