const STORAGE_KEY = 'flex-architect-prefs';

export const getPrefs = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch (e) {
        return {};
    }
};

let timeout = null;

export const updatePref = (key, value) => {
    const prefs = getPrefs();
    prefs[key] = value;
    
    // Дебаунсим запись, чтобы не фризить UI при скролле/зуме
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    }, 300);
};

export const getPref = (key, defaultValue) => {
    const prefs = getPrefs();
    return prefs[key] !== undefined ? prefs[key] : defaultValue;
};
