// Green TD — головний файл мода.
// Підключає модулі в спільному scope.

var modRoot = Vars.mods.getMod("green-td").root.child("scripts");

function loadScript(name){
    var code = modRoot.child(name + ".js").readString();
    eval(code);
    print("Green TD: завантажено " + name);
}

loadScript("map-check");
loadScript("rewards");
loadScript("free-turrets");
loadScript("core-explosion");
