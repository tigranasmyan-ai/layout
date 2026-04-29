import { useState, useEffect } from 'react';

/**
 * Хук для поиска и отслеживания DOM-элементов (targets) для Moveable.
 * Включает в себя небольшую задержку (debounce), чтобы дождаться рендеринга блоков.
 */
export const useSelectionTargets = (selectedId, selectedIds, blocks) => {
    const [targets, setTargets] = useState([]);

    useEffect(() => {
        if (selectedIds.length === 0 || !Array.isArray(blocks)) {
            const blueprintEl = document.getElementById('blueprint-img');
            setTargets(selectedId === 'blueprint-img' ? [blueprintEl] : []);
            return;
        }

        const timer = setTimeout(() => {
            const els = selectedIds
                .map(id => document.querySelector(`[data-id="${id}"]`))
                .filter(Boolean);
            setTargets(els);
        }, 30);

        return () => clearTimeout(timer);
    }, [selectedIds, blocks, selectedId]);

    return targets;
};
