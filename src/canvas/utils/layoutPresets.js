/**
 * Логика применения пресетов и переключения flex-заполнения
 */

export const applyLayoutPreset = (prevBlocks, blockId, preset) => {
    const children = prevBlocks.filter(c => c.parentId === blockId);
    if (children.length === 0) return prevBlocks;
    
    const parent = prevBlocks.find(p => p.id === blockId);
    const dir = parent?.meta?.direction || 'row';

    return prevBlocks.map(b => {
        if (b.parentId !== blockId) return b;
        const childIndex = children.findIndex(c => c.id === b.id);

        if (preset === 'sidebar') {
            // Сайдбар: первый 33.33%, остальные делят 66.66%
            if (childIndex === 0) {
                const sPct = '33.33%';
                return { ...b, [dir === 'row' ? 'w' : 'h']: sPct, meta: { ...b.meta, flex: `0 0 ${sPct}`, flexGrow: 0, flexShrink: 0, flexBasis: sPct, maxWidth: dir === 'row' ? sPct : 'none', maxHeight: dir === 'column' ? sPct : 'none', alignSelf: 'stretch' } };
            }
            const remainingCount = children.length - 1;
            const rPct = (66.66 / remainingCount).toFixed(2) + '%';
            return { 
                ...b, 
                [dir === 'row' ? 'w' : 'h']: rPct, 
                meta: { 
                    ...b.meta, 
                    flex: `0 0 ${rPct}`, 
                    flexGrow: 0, 
                    flexShrink: 0, 
                    flexBasis: rPct,
                    maxWidth: dir === 'row' ? rPct : 'none',
                    maxHeight: dir === 'column' ? rPct : 'none',
                    alignSelf: 'stretch'
                } 
            };
        }
        if (preset === 'reset') {
            return { ...b, w: 100, h: 100, meta: { ...b.meta, flex: 'none', flexGrow: 0, flexShrink: 0, flexBasis: 'auto', maxWidth: 'none', maxHeight: 'none', alignSelf: 'auto' } };
        }
        return b;
    });
};

