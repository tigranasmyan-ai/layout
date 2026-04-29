import { useState, useEffect, useRef } from 'react';

export const useSpacingLogic = (zoom, setBlocksSilent, setBlocks, blocks) => {
    const [draggingSpace, setDraggingSpace] = useState(null);
    const [isInteracting, setIsInteracting] = useState(false);
    
    // Используем refs для функций
    const setBlocksSilentRef = useRef(setBlocksSilent);
    const setBlocksRef = useRef(setBlocks);
    const blocksRef = useRef(blocks);

    useEffect(() => {
        setBlocksSilentRef.current = setBlocksSilent;
        setBlocksRef.current = setBlocks;
        blocksRef.current = blocks;
    }, [setBlocksSilent, setBlocks, blocks]);

    useEffect(() => {
        if (!draggingSpace) return;

        let lastBlocks = null;

        const handleMouseMove = (e) => {
            const { id, side, type, startValue, startPos } = draggingSpace;
            
            const isVertical = side === 'top' || side === 'bottom';
            const currentPos = isVertical ? e.clientY : e.clientX;
            
            const isReverseMargin = side === 'top' || side === 'left';
            const isReversePadding = side === 'bottom' || side === 'right';
            const isReverse = type === 'margin' ? isReverseMargin : isReversePadding;
            
            const deltaRaw = currentPos - startPos;
            const delta = isReverse ? -deltaRaw : deltaRaw;
            
            const baseVal = (startValue === 'auto' || startValue === undefined) ? 0 : parseInt(startValue);
            const newValue = Math.max(0, baseVal + Math.round(delta / zoom));
            
            setBlocksSilentRef.current(prev => {
                const next = prev.map(b => b && b.id === id ? {
                    ...b,
                    meta: { 
                        ...b.meta, 
                        [type]: { ...(b.meta?.[type] || {}), [side]: newValue } 
                    }
                } : b);
                lastBlocks = next;
                return next;
            });
        };

        const handleMouseUp = () => {
            if (lastBlocks) {
                setBlocksRef.current(lastBlocks);
            }
            setDraggingSpace(null);
            setIsInteracting(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingSpace, zoom]);

    const startDraggingSpace = (id, type, side, e) => {
        // Берем значение из актуального рефа блоков
        const currentBlock = blocksRef.current.find(b => b.id === id);
        const val = currentBlock?.meta?.[type]?.[side];
        
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
        startDraggingSpace,
        draggingType: draggingSpace?.type || null
    };
};
