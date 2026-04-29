import { useMemo } from 'react';

/**
 * Хук для управления действиями над блоками на холсте (ресайз, заполнение, мета-данные).
 */
export const useCanvasActions = (blocks, setBlocks) => {
    
    const updateMeta = (id, key, value) => {
        requestAnimationFrame(() => {
            setBlocks(prev => prev.map(b => b && b.id === id ? {...b, meta: {...b.meta, [key]: value}} : b));
        });
    };

    const handleSize = (id, key, value) => {
        if (!id) return;
        const val = (String(value).includes('%')) ? value : (parseInt(value) || 0);
        setBlocks(prev => prev.map(b => (b && b.id === id) ? {...b, [key]: val} : b));
    };

    const handleFill = (id, side) => {
        setBlocks(prev => {
            const block = prev.find(b => b.id === id);
            if (!block || !block.parentId) return prev;
            const parent = prev.find(p => p.id === block.parentId);
            const dir = parent?.meta?.direction || 'row';
            const isMainAxis = (dir === 'row' && (side === 'left' || side === 'right')) ||
                (dir === 'column' && (side === 'top' || side === 'bottom'));

            return prev.map(b => {
                if (b.id !== id) return b;
                const newMeta = {...b.meta};
                const bCopy = {...b};
                if (isMainAxis) {
                    const currentGrow = b.meta?.flexGrow === 1;
                    newMeta.flexGrow = currentGrow ? 0 : 1;
                    newMeta.flexBasis = currentGrow ? 'auto' : '0%';
                    const dim = dir === 'row' ? 'w' : 'h';
                    delete newMeta[dim];
                    delete bCopy[dim];
                } else {
                    const dimension = dir === 'row' ? 'h' : 'w';
                    const currentFull = b.meta?.[dimension] === '100%';
                    if (currentFull) {
                        delete newMeta[dimension];
                        delete bCopy[dimension];
                    } else {
                        newMeta[dimension] = '100%';
                        bCopy[dimension] = '100%';
                    }
                    newMeta.alignSelf = currentFull ? 'auto' : 'stretch';
                }
                return {...bCopy, meta: newMeta};
            });
        });
    };

    return { updateMeta, handleSize, handleFill };
};
