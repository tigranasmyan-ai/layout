import { useState, useEffect } from 'react';

export const useCanvasInteraction = (zoom, setZoom, setBlocks) => {
    const [isPanning, setIsPanning] = useState(false);
    const [draggingSpace, setDraggingSpace] = useState(null);
    const [isInteracting, setIsInteracting] = useState(false);
    const [editingSpace, setEditingSpace] = useState(null);

    // Панорамирование через Пробел
    useEffect(() => {
        const down = (e) => { if (e.code === 'Space') setIsPanning(true); };
        const up = (e) => { if (e.code === 'Space') setIsPanning(false); };
        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
    }, []);

    // Логика перетаскивания Margin/Padding
    useEffect(() => {
        if (!draggingSpace) return;
        const handleMouseMove = (e) => {
            const { id, side, type, startValue, startPos } = draggingSpace;
            const isReverse = side === 'top' || side === 'left';
            const deltaRaw = (side === 'top' || side === 'bottom' ? e.clientY : e.clientX) - startPos;
            let delta = isReverse ? (type === 'margin' ? -deltaRaw : deltaRaw) : (type === 'margin' ? deltaRaw : -deltaRaw);
            const baseVal = startValue === 'auto' ? 0 : startValue;
            const newValue = Math.max(0, baseVal + Math.round(delta / zoom));
            
            setBlocks(prev => prev.map(b => b && b.id === id ? {
                ...b,
                meta: { ...b.meta, [type]: { ...(b.meta[type] || {}), [side]: newValue } }
            } : b));
        };
        const handleMouseUp = () => { setDraggingSpace(null); setIsInteracting(false); };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
    }, [draggingSpace, zoom, setBlocks]);

    const startDraggingSpace = (e, id, type, side, val) => {
        e.stopPropagation();
        e.preventDefault();
        setIsInteracting(true);
        setDraggingSpace({ id, type, side, startValue: val, startPos: side === 'top' || side === 'bottom' ? e.clientY : e.clientX });
    };

    return {
        isPanning,
        isInteracting,
        setIsInteracting,
        editingSpace,
        setEditingSpace,
        startDraggingSpace
    };
};
