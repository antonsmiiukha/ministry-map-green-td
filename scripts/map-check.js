// Перевірка чи поточна мапа — Green TD.
function isGreenTDMap(){
    if(Vars.state == null || Vars.state.map == null) return false;
    var name = Vars.state.map.name();
    if(name == null) return false;
    return name.toLowerCase().indexOf("green td") != -1;
}
