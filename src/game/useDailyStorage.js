const STORAGE_KEY = 'hexcode-daily';
const GC_DAYS = 7;

export function saveDailyState(date, mode, state) {
    const all = loadAll();
    all[`${date}-${mode}`] = { date, mode, ...state };
    gc(all);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function loadDailyState(date, mode) {
    const all = loadAll();
    return all[`${date}-${mode}`] ?? null;
}

function loadAll() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
}

function gc(all) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - GC_DAYS);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    for (const key of Object.keys(all)) {
        if (all[key].date < cutoffStr) {
            delete all[key];
        }
    }
}
