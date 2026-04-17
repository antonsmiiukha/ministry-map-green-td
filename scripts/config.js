// =============================================
// Green TD — конфігурація мода
// =============================================

// --- Команди ---
var REWARD_TEAMS = [Team.green, Team.blue];
var CORE_DESTROY_TEAM = Team.sharded;

// --- Подача патронів ---
var AMMO_FEED_COUNT = 20;         // кількість подач за цикл
var AMMO_FEED_DELAY = 0.5;        // затримка перед першою подачею (сек)
var AMMO_FEED_INTERVAL = 0.2;     // інтервал подачі (сек)
var TURRET_LIQUID_CAPACITY = 10;  // мінімальна ємність рідини для турелей

// --- Нагрів турелей ---
var MAX_HEAT = 100;               // максимальний нагрів
var HEAT_GAIN_DEFAULT = 2;        // нагрів за постріл (для невказаних турелей)
var COOL_RATE = 0.1;              // охолодження за кадр (завжди)
var MAX_SLOWDOWN = 0.8;           // макс штраф до перезарядки (квадратична крива)

// Нагрів за постріл для кожної турелі
// Обернено пропорційно швидкострільності:
// швидкі турелі = мало за постріл (але часто), повільні = багато за постріл
// Базова лінія: spectre (~15 пострілів/сек) = 3
var HEAT_GAIN_MAP = {};
HEAT_GAIN_MAP[Blocks.spectre.id]     = 4;    // ~15/сек, базова лінія
HEAT_GAIN_MAP[Blocks.duo.id]         = 16;    // ~3/сек, слабка
HEAT_GAIN_MAP[Blocks.scorch.id]      = 2;    // ~10/сек, вогнемет
HEAT_GAIN_MAP[Blocks.scatter.id]     = 4;    // ~3/сек
HEAT_GAIN_MAP[Blocks.salvo.id]       = 4;    // ~6/сек (4 стволи)
HEAT_GAIN_MAP[Blocks.wave.id]        = 4;    // ~3/сек
HEAT_GAIN_MAP[Blocks.arc.id]         = 5;    // ~1.5/сек
HEAT_GAIN_MAP[Blocks.cyclone.id]     = 5;    // ~2/сек
HEAT_GAIN_MAP[Blocks.meltdown.id]    = 5;    // безперервний лазер
HEAT_GAIN_MAP[Blocks.swarmer.id]     = 6;    // ~1.5/сек
HEAT_GAIN_MAP[Blocks.hail.id]        = 16;    // ~0.75/сек
HEAT_GAIN_MAP[Blocks.fuse.id]        = 16;    // ~1.5/сек, потужна
HEAT_GAIN_MAP[Blocks.lancer.id]      = 8;    // ~0.75/сек
HEAT_GAIN_MAP[Blocks.ripple.id]      = 32    // ~0.85/сек
HEAT_GAIN_MAP[Blocks.foreshadow.id]  = 15;   // ~0.5/сек, один потужний постріл

// --- Нагороди за юнітів ---
var UNIT_REWARDS = {};
UNIT_REWARDS[UnitTypes.dagger.id]   = { copper: 1 };
UNIT_REWARDS[UnitTypes.mace.id]     = { copper: 2, lead: 1 };
UNIT_REWARDS[UnitTypes.fortress.id] = { copper: 3, lead: 1 };
UNIT_REWARDS[UnitTypes.scepter.id]  = { copper: 3, lead: 2, plastanium: 1 };
UNIT_REWARDS[UnitTypes.reign.id]    = { copper: 4, lead: 3, plastanium: 2, surgeAlloy: 1 };

UNIT_REWARDS[UnitTypes.nova.id]     = { copper: 1 };
UNIT_REWARDS[UnitTypes.pulsar.id]   = { copper: 2, lead: 1 };
UNIT_REWARDS[UnitTypes.quasar.id]   = { copper: 3, lead: 1 };
UNIT_REWARDS[UnitTypes.vela.id]     = { copper: 3, lead: 2, plastanium: 1 };
UNIT_REWARDS[UnitTypes.corvus.id]   = { copper: 4, lead: 3, plastanium: 2, surgeAlloy: 1 };

// Маппінг імен ресурсів на Items
var ITEM_MAP = {
    copper:     Items.copper,
    lead:       Items.lead,
    plastanium: Items.plastanium,
    surgeAlloy: Items.surgeAlloy
};

// --- Охолодження рідинами ---
var LIQUID_COOLING = {};
// coolFactor < 1 = менше нагріву і швидше охолодження
// cryofluid: нагрів x0.5, охолодження x2
// water: нагрів x0.75, охолодження x1.33
LIQUID_COOLING["cryofluid"] = 0.5;
LIQUID_COOLING["water"] = 0.75;
