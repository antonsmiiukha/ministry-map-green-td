// Green TD — головний файл мода.
// Збирає всі модулі в один scope і виконує разом.

var modRoot = Vars.mods.getMod("green-td").root.child("scripts");

var scriptNames = [
    "config",
    "map-check",
    "rewards",
    "free-turrets",
    "turret-heat",
    "core-explosion"
];

var combined = "";
for(var i = 0; i < scriptNames.length; i++){
    combined += modRoot.child(scriptNames[i] + ".js").readString() + "\n";
    print("Green TD: завантажено " + scriptNames[i]);
}
eval(combined);
