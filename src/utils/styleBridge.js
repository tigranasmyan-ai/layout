/**
 * StyleBridge - Единственный источник правды для превращения мета-данных блока в CSS стили.
 * Это предотвращает ошибки позиционирования и конфликты Flexbox.
 */
export const getBlockStyles = (block, m, isSelected, iz, isTransforming) => {
    const padding = m.padding || { top: 0, right: 0, bottom: 0, left: 0 };
    const margin = m.margin || { top: 0, right: 0, bottom: 0, left: 0 };
    const isNested = !!block.parentId;

    return {
        '--pos': isNested ? 'relative' : 'absolute',
        '--left': isNested ? 'auto' : `${block.x}px`,
        '--top': isNested ? 'auto' : `${block.y}px`,
        '--width': m.width || (typeof block.w === 'number' ? `${block.w}px` : block.w),
        '--height': m.height || (typeof block.h === 'number' ? `${block.h}px` : block.h),
        '--z-index': isSelected ? 10 : 1,
        
        '--flex-dir': m.direction || 'row',
        '--justify': m.justify || 'flex-start',
        '--align': m.align || 'flex-start',
        '--flex-wrap': m.wrap || 'nowrap',
        '--gap': `${m.gap || 0}px`,
        '--padding': `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
        
        '--flex-grow': m.flexGrow || 0,
        '--flex-basis': m.flexBasis || 'auto',
        '--m-top': margin.top === 'auto' ? 'auto' : `${margin.top}px`,
        '--m-right': margin.right === 'auto' ? 'auto' : `${margin.right}px`,
        '--m-bottom': margin.bottom === 'auto' ? 'auto' : `${margin.bottom}px`,
        '--m-left': margin.left === 'auto' ? 'auto' : `${margin.left}px`,
        
        '--bg-color': m.bgColor || 'rgba(255, 255, 255, 0.05)',
        '--bg-image': m.bgImage ? `url(${m.bgImage})` : 'none',
        '--bg-size': m.bgSize || 'cover',
        '--bg-position': m.bgPosition || 'center',
        '--border-radius': `${m.borderRadius || 0}px`,
        '--border': isSelected ? `${iz}px solid rgba(79, 70, 229, 0.5)` : (m.border || `${iz}px solid rgba(255, 255, 255, 0.08)`),
    };
};
