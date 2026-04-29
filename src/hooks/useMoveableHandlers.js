import { useCallback } from 'react';

/**
 * Хук для обработки событий Moveable (только resize)
 * Интегрирован с новой логикой хранилища (silent-обновления).
 */
export function useMoveableHandlers({ blocks, setBlocks, onUpdateBlueprint, setIsTransforming }) {
    
    const handleResize = useCallback((e) => {
        const id = e.target.id === 'blueprint-img' ? 'blueprint-img' : e.target.getAttribute('data-id');
        
        if (id === 'blueprint-img') {
            e.target.style.width = `${e.width}px`;
            e.target.style.left = `${e.drag.left}px`;
            e.target.style.top = `${e.drag.top}px`;
            // Не вызываем onUpdateBlueprint здесь, чтобы не тормозить.
            // Синхронизация произойдет автоматически в будущем через другие механизмы или если добавим handleResizeEnd для него.
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

            // Во время ресайза меняем ТОЛЬКО DOM для максимальной производительности.
            // Синхронизация со стором произойдет в handleResizeEnd.
            
            // Прямое обновление DOM для мгновенного отклика
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
        
        const id = e.target.id === 'blueprint-img' ? 'blueprint-img' : e.target.getAttribute('data-id');
        if (id === 'blueprint-img') {
            onUpdateBlueprint({ 
                w: e.lastEvent.width, 
                x: e.lastEvent.drag.left, 
                y: e.lastEvent.drag.top 
            });
        } else if (id) {
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
        handleResize,
        handleResizeEnd
    };
}
