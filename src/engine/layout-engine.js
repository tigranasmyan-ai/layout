// Yoga Engine больше не используется. 
// Мы перешли на Native DOM Nesting для лучшей производительности и простоты.

export const initYogaEngine = async () => {
    return true; // Заглушка для совместимости
};

export const calculateLayout = (tree) => {
    return []; // Больше не нужно, так как вложенность теперь реальная в DOM
};

export const getYogaInstance = () => null;
