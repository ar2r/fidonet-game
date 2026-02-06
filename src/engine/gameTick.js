// Time costs for different actions (in minutes)
export const TIME_COSTS = {
    DEFAULT: 1,
    DIR: 1,
    CD: 1,
    TYPE: 2,
    HELP: 1,
    ATZ: 2,
    DIAL: 5,
    DOWNLOAD: 15,
    BBS_MENU: 1,
    BBS_CHAT: 10,
    TREE: 1,
    VER: 0,
    CLS: 0,
};

export function getTimeCost(command) {
    const cmd = command.trim().toUpperCase();
    if (cmd === '' || cmd === 'CLS' || cmd === 'CLEAR') return TIME_COSTS.CLS;
    if (cmd === 'VER') return TIME_COSTS.VER;
    if (cmd === 'ATZ' || cmd === 'AT&F') return TIME_COSTS.ATZ;
    if (cmd.startsWith('DIAL') || cmd.startsWith('ATDT') || cmd.startsWith('ATDP')) return TIME_COSTS.DIAL;
    if (cmd === 'DIR' || cmd === 'LS' || cmd.startsWith('DIR ')) return TIME_COSTS.DIR;
    if (cmd.startsWith('CD')) return TIME_COSTS.CD;
    if (cmd.startsWith('TYPE') || cmd.startsWith('CAT')) return TIME_COSTS.TYPE;
    if (cmd === 'HELP' || cmd === 'MANUAL') return TIME_COSTS.HELP;
    if (cmd === 'TREE') return TIME_COSTS.TREE;
    // BBS commands
    if (cmd === 'F' || cmd === 'M' || cmd === 'G' || cmd === 'Q') return TIME_COSTS.BBS_MENU;
    if (cmd === 'C') return TIME_COSTS.BBS_CHAT;
    if (cmd === '1' || cmd === '2' || cmd === '3') return TIME_COSTS.DOWNLOAD;
    return TIME_COSTS.DEFAULT;
}

export function minutesToTimeString(totalMinutes) {
    const wrapped = ((totalMinutes % 1440) + 1440) % 1440; // 0-1439
    const hours = Math.floor(wrapped / 60);
    const mins = wrapped % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function timeStringToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

export function getPhaseForTime(minutes) {
    const wrapped = ((minutes % 1440) + 1440) % 1440;
    // Day: 06:00-22:00, Night: 22:00-06:00
    if (wrapped >= 360 && wrapped < 1320) return 'day';
    return 'night';
}

export function isZMH(minutes) {
    const wrapped = ((minutes % 1440) + 1440) % 1440;
    // ZMH: 04:00-05:00 (240-300)
    return wrapped >= 240 && wrapped < 300;
}

export function computeTickEffects(currentMinutes, addedMinutes, isConnected) {
    const newMinutes = currentMinutes + addedMinutes;
    const newPhase = getPhaseForTime(newMinutes);
    const newZMH = isZMH(newMinutes);

    // Calculate day change: each 24h = 1 day
    const daysBefore = Math.floor(currentMinutes / 1440);
    const daysAfter = Math.floor(newMinutes / 1440);
    const daysAdvanced = daysAfter - daysBefore;

    // Mom's patience: decreases at night when connected
    let momPatienceDelta = 0;
    if (newPhase === 'night' && isConnected && addedMinutes > 0) {
        momPatienceDelta = -1;
    }

    return {
        newMinutes,
        newTimeString: minutesToTimeString(newMinutes),
        newPhase,
        newZMH,
        daysAdvanced,
        momPatienceDelta,
    };
}
