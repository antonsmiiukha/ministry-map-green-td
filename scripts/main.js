var rewardTeams = [Team.green, Team.blue];

function getReward(type){
    if(type == UnitTypes.dagger)   return { copper: 2 };
    if(type == UnitTypes.mace)     return { copper: 2, lead: 1 };
    if(type == UnitTypes.fortress) return { copper: 3, lead: 1 };
    if(type == UnitTypes.scepter)  return { copper: 3, lead: 2, plastanium: 1 };
    if(type == UnitTypes.reign)    return { copper: 4, lead: 3, plastanium: 2, surgeAlloy: 1 };

    if(type == UnitTypes.nova)     return { copper: 1 };
    if(type == UnitTypes.pulsar)   return { copper: 2, lead: 1 };
    if(type == UnitTypes.quasar)   return { copper: 3, lead: 1 };
    if(type == UnitTypes.vela)     return { copper: 3, lead: 2, plastanium: 1 };
    if(type == UnitTypes.corvus)   return { copper: 4, lead: 3, plastanium: 2, surgeAlloy: 1 };

    return null;
}

var itemMap = {
    copper:     Items.copper,
    lead:       Items.lead,
    plastanium: Items.plastanium,
    surgeAlloy: Items.surgeAlloy
};

// Мод активний тільки на мапі Green TD — інакше обробник виходить.
function isGreenTDMap(){
    if(Vars.state == null || Vars.state.map == null) return false;
    var name = Vars.state.map.name();
    if(name == null) return false;
    return name.toLowerCase().indexOf("green td") != -1;
}

Events.on(UnitDestroyEvent, function(e){
    if(!isGreenTDMap()) return;
    if(e.unit == null || e.unit.type == null) return;
    if(e.unit.team == Vars.state.rules.defaultTeam) return;

    var reward = getReward(e.unit.type);
    if(reward == null){
        print("Немає нагороди для: " + e.unit.type.name);
        return;
    }

    for(var i = 0; i < rewardTeams.length; i++){
        var team = rewardTeams[i];
        var data = Vars.state.teams.get(team);
        if(data == null) continue;

        var core = data.core();
        if(core == null){
            print("Кор " + team.name + " не знайдено");
            continue;
        }

        for(var key in reward){
            var item = itemMap[key];
            if(item != null){
                core.items.add(item, reward[key]);
                print("+" + reward[key] + " " + key + " в " + team.name);
            }
        }
    }
});
