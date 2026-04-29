import { useCallback } from 'react';

/**
 * Хук для обработки событий Moveable (drag, resize)
 * Интегрирован с новой логикой хранилища (silent-обновления).
 */
export function useMoveableHandlers({ blocks, setBlocks, onUpdateBlueprint, setIsTransforming }) {
    
    const handleDrag = useCallback((e) => {
        const id = e.target.id === 'blueprint-img' ? 'blueprint-img' : e.target.getAttribute('data-id');
        if (id === 'blueprint-img') {
            onUpdateBlueprint({ x: e.left, y: e.top });
        } else {
            e.target.style.left = `${e.left}px`;
            e.target.style.top = `${e.top}px`;
            
            // Тихое обновление стейта во время перетаскивания (silent = true)
            setBlocks(prev => prev.map(b => b.id === id ? { ...b, x: e.left, y: e.top } : b), true);
        }
    }, [onUpdateBlueprint, setBlocks]);

    const handleDragEnd = useCallback((e) => {
        setIsTransforming(false);
        if (!e.lastEvent) return; 
        
        const id = e.target.id === 'blueprint-img' ? 'blueprint-img' : e.target.getAttribute('data-id');
        if (id !== 'blueprint-img' && id) {
            const block = blocks.find(b => b && b.id === id);
            if (block && !block.parentId) {
                // Фиксация позиции в истории по окончании движения
                setBlocks(prev => prev.map(b => b.id === id ? { ...b, x: e.lastEvent.left, y: e.lastEvent.top } : b));
            }
        }
    }, [blocks, setBlocks, setIsTransforming]);

    const handleResize = useCallback((e) => {
        const id = e.target.id === 'blueprint-img' ? 'blueprint-img' : e.target.getAttribute('data-id');
        
        if (id === 'blueprint-img') {
            onUpdateBlueprint({ w: e.width, x: e.drag.left, y: e.drag.top });
        } else if (id) {
            const block = blocks.find(b => b && b.id === id);
            const update = { 
                w: Math.max(e.width, 10), 
                h: Math.max(e.height, 10), 
                meta: { 
                    ...(block?.meta || {}),
                    flexGrow: 0, 
                    flexBasis: 'auto', 
                    alignSelf: 'auto',
                    maxWidth: 'none',
                    maxHeight: 'none'
                } 
            };

            if (!block?.parentId) {
                update.x = e.drag.left;
                update.y = e.drag.top;
            }

            // Тихое обновление стейта во время ресайза (silent = true)
            setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...update } : b), true);
            
            // Прямое обновление DOM для мгновенного отклика (производительность)
            e.target.style.width = `${update.w}px`;
            e.target.style.height = `${update.h}px`;
            if (update.x !== undefined) {
                e.target.style.left = `${update.x}px`;
                e.target.style.top = `${update.y}px`;
            }
        }
    }, [blocks, setBlocks, onUpdateBlueprint]);

    const handleResizeEnd = useCallback((e) => {
        setIsTransforming(false);
        if (!e.lastEvent) return; 
        
        const id = e.target.getAttribute('data-id');
        if (id) {
            const block = blocks.find(b => b && b.id === id);
            const update = { 
                w: Math.max(e.lastEvent.width, 10), 
                h: Math.max(e.lastEvent.height, 10),
                meta: {
                    ...(block?.meta || {}),
                    flexGrow: 0,
                    flexBasis: 'auto',
                    alignSelf: 'auto',
                    maxWidth: 'none',
                    maxHeight: 'none'
                }
            };
            if (!block?.parentId) {
                update.x = e.lastEvent.drag.left;
                update.y = e.lastEvent.drag.top;
            }
            // Фиксация финальных размеров в истории
            setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...update } : b));
        }
    }, [blocks, setBlocks, setIsTransforming]);

    return {
        handleDrag,
        handleDragEnd,
        handleResize,
        handleResizeEnd
    };
}
