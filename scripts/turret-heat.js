// Система нагріву турелей.
// Чим більше турель стріляє — тим повільніше перезаряджається.
// Коли не стріляє — охолоджується.

var heatMap = {};
var MAX_HEAT = 100;
var HEAT_GAIN = 15;       // нагрів за цикл стрільби
var COOL_RATE = 5;        // охолодження за цикл простою
var MAX_SLOWDOWN = 0.75;  // максимальне уповільнення (75% при макс нагріві)
var TICK_INTERVAL = 0.2;  // інтервал перевірки (секунди)

var heatTimer = null;

Events.on(WorldLoadEvent, function(){
    if(heatTimer != null){
        heatTimer.cancel();
    }

    heatMap = {};
    print("Green TD: система нагріву турелей активна");

    heatTimer = Timer.schedule(function(){
        try {
            Groups.build.each(function(b){
                if(b == null || b.block == null) return;
                if(b.block.ammoTypes == null || b.block.ammoTypes.size == 0) return;

                var id = b.id;
                if(heatMap[id] == null) heatMap[id] = 0;

                // Нагрів / охолодження
                if(b.wasShooting){
                    heatMap[id] = Math.min(MAX_HEAT, heatMap[id] + HEAT_GAIN * TICK_INTERVAL);
                } else {
                    heatMap[id] = Math.max(0, heatMap[id] - COOL_RATE * TICK_INTERVAL);
                }

                // Уповільнення перезарядки пропорційно нагріву
                if(heatMap[id] > 0){
                    var heatRatio = heatMap[id] / MAX_HEAT;
                    var penalty = heatRatio * MAX_SLOWDOWN * TICK_INTERVAL * 60;
                    b.reload = Math.max(0, b.reload - penalty);
                }
            });
        } catch(e) {
            print("Green TD heat error: " + e);
        }
    }, 1, TICK_INTERVAL, -1);
});
