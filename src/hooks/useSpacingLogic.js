import { useState, useEffect, useRef } from 'react';

/**
 * useSpacingLogic - Логика перетаскивания отступов (margin/padding) на холсте.
 */
export const useSpacingLogic = (zoom, setBlocks, blocks) => {
    const [draggingSpace, setDraggingSpace] = useState(null);
    const [isInteracting, setIsInteracting] = useState(false);
    
    // Используем refs для функций, чтобы не перезапускать useEffect при каждом рендере
    const setBlocksRef = useRef(setBlocks);
    const blocksRef = useRef(blocks);

    useEffect(() => {
        setBlocksRef.current = setBlocks;
        blocksRef.current = blocks;
    }, [setBlocks, blocks]);

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
            const newValue = Math.max(0, Math.round(baseVal + delta / zoom));
            
            // Находим DOM элемент и обновляем CSS переменную напрямую
            const el = document.querySelector(`[data-id="${id}"]`);
            if (el) {
                if (type === 'margin') {
                    const varName = `--m-${side}`;
                    el.style.setProperty(varName, `${newValue}px`);
                } else {
                    // Для паддинга сложнее, так как это одна переменная --padding
                    // Получаем текущее значение или дефолт
                    const currentPadding = el.style.getPropertyValue('--padding') || '0px 0px 0px 0px';
                    const parts = currentPadding.split(' ');
                    const map = { top: 0, right: 1, bottom: 2, left: 3 };
                    parts[map[side]] = `${newValue}px`;
                    el.style.setProperty('--padding', parts.join(' '));
                }
            }

            // Сохраняем финальное состояние в локальную переменную для handleMouseUp
            lastBlocks = blocksRef.current.map(b => b && b.id === id ? {
                ...b,
                meta: { 
                    ...b.meta, 
                    [type]: { ...(b.meta?.[type] || {}), [side]: newValue } 
                }
            } : b);
        };

        const handleMouseUp = () => {
            // Финальное сохранение в историю при отпускании кнопки мыши
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
        const currentBlock = blocksRef.current.find(b => b && b.id === id);
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
