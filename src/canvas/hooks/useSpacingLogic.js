import { useState, useEffect, useRef } from 'react';

export const useSpacingLogic = (zoom, setBlocks) => {
    const [draggingSpace, setDraggingSpace] = useState(null);
    const [isInteracting, setIsInteracting] = useState(false);
    
    // Используем ref для setBlocks, чтобы эффект не перезапускался при каждом изменении блоков
    const setBlocksRef = useRef(setBlocks);
    useEffect(() => {
        setBlocksRef.current = setBlocks;
    }, [setBlocks]);

    useEffect(() => {
        if (!draggingSpace) return;

        const handleMouseMove = (e) => {
            const { id, side, type, startValue, startPos } = draggingSpace;
            
            const isVertical = side === 'top' || side === 'bottom';
            const currentPos = isVertical ? e.clientY : e.clientX;
            
            const isReverse = side === 'top' || side === 'left';
            const deltaRaw = currentPos - startPos;
            const delta = isReverse ? -deltaRaw : deltaRaw;
            
            const baseVal = (startValue === 'auto' || startValue === undefined) ? 0 : parseInt(startValue);
            const newValue = Math.max(0, baseVal + Math.round(delta / zoom));
            
            // Вызываем обновление через ref
            setBlocksRef.current(prev => prev.map(b => b && b.id === id ? {
                ...b,
                meta: { 
                    ...b.meta, 
                    [type]: { ...(b.meta?.[type] || {}), [side]: newValue } 
                }
            } : b));
        };

        const handleMouseUp = () => {
            setDraggingSpace(null);
            setIsInteracting(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingSpace, zoom]); // Убрали setBlocks из зависимостей

    const startDraggingSpace = (e, id, type, side, val) => {
        e.stopPropagation();
        e.preventDefault();
        setIsInteracting(true);
        setDraggingSpace({ 
            id, type, side, 
            startValue: val, 
            startPos: (side === 'top' || side === 'bottom') ? e.clientY : e.clientX 
        });
    };

    return {
        isInteracting,
        startDraggingSpace
    };
};
