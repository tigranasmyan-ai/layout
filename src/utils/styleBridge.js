/**
 * StyleBridge - Единственный источник правды для превращения мета-данных блока в CSS стили.
 * Это предотвращает ошибки позиционирования и конфликты Flexbox.
 */
export const getBlockStyles = (block, m, isSelected, iz, isTransforming) => {
    const padding = m.padding || { top: 0, right: 0, bottom: 0, left: 0 };
    const margin = m.margin || { top: 0, right: 0, bottom: 0, left: 0 };

    // Проверяем, является ли блок вложенным. 
    // Если есть parentId, то это вложенный блок -> он ДОЛЖЕН быть в потоке (relative).
    const isNested = !!block.parentId;

    // Базовые стили позиционирования
    const baseStyles = {
        position: isNested ? 'relative' : 'absolute',
        // Для корневых блоков используем x/y, для вложенных - авто (чтобы работал Flex)
        left: isNested ? 'auto' : block.x,
        top: isNested ? 'auto' : block.y,
        width: m.width || block.w,
        height: m.height || block.h,
        boxSizing: 'border-box',
        zIndex: isSelected ? 10 : 1,
    };

    // Флекс-контейнер (как блок ведет себя со своими детьми)
    const flexContainerStyles = {
        display: 'flex',
        flexDirection: m.direction || 'row',
        justifyContent: m.justify || 'flex-start',
        alignItems: m.align || 'flex-start',
        flexWrap: m.wrap || 'nowrap',
        gap: m.gap || 0,
        padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
    };

    // Флекс-элемент (как блок ведет себя внутри родителя)
    const flexItemStyles = {
        flexGrow: m.flexGrow || 0,
        flexShrink: 0,
        flexBasis: m.flexBasis || 'auto',
        marginTop: margin.top === 'auto' ? 'auto' : `${margin.top}px`,
        marginRight: margin.right === 'auto' ? 'auto' : `${margin.right}px`,
        marginBottom: margin.bottom === 'auto' ? 'auto' : `${margin.bottom}px`,
        marginLeft: margin.left === 'auto' ? 'auto' : `${margin.left}px`,
    };

    // Визуальные стили
    const visualStyles = {
        backgroundColor: m.bgColor || 'rgba(255, 255, 255, 0.05)',
        borderRadius: m.borderRadius || 0,
        border: isSelected ? `${iz}px solid rgba(79, 70, 229, 0.5)` : (m.border || `${iz}px solid rgba(255, 255, 255, 0.08)`),
        transition: isTransforming ? 'none' : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'visible',
        display: 'flex', // Все блоки по умолчанию - флекс-контейнеры
    };

    return {
        ...baseStyles,
        ...flexContainerStyles,
        ...flexItemStyles,
        ...visualStyles,
    };
};
