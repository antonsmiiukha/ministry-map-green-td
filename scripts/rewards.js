// Нагороди командам за знищення ворожих юнітів.

Events.on(UnitDestroyEvent, function(e){
    if(e.unit == null || e.unit.type == null) return;
    if(e.unit.team == Vars.state.rules.defaultTeam) return;

    var reward = UNIT_REWARDS[e.unit.type.id];
    if(reward == null){
        print("Немає нагороди для: " + e.unit.type.name);
        return;
    }

    for(var i = 0; i < REWARD_TEAMS.length; i++){
        var team = REWARD_TEAMS[i];
        var data = Vars.state.teams.get(team);
        if(data == null) continue;

        var core = data.core();
        if(core == null){
            print("Кор " + team.name + " не знайдено");
            continue;
        }

        for(var key in reward){
            var item = ITEM_MAP[key];
            if(item != null){
                core.items.add(item, reward[key]);
                print("+" + reward[key] + " " + key + " в " + team.name);
            }
        }
    }
});
