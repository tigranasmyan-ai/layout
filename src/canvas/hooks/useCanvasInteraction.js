import { useState, useEffect } from 'react';

export const useCanvasInteraction = (zoom, setZoom, setBlocks) => {
    const [isPanning, setIsPanning] = useState(false);
    const [editingSpace, setEditingSpace] = useState(null);

    // Панорамирование через Пробел
    useEffect(() => {
        const down = (e) => { if (e.code === 'Space') setIsPanning(true); };
        const up = (e) => { if (e.code === 'Space') setIsPanning(false); };
        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
    }, []);

    return {
        isPanning,
        editingSpace,
        setEditingSpace
    };
};
