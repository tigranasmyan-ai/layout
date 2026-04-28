import { useState, useCallback } from 'react';
import { DEFAULT_BLOCK_META } from '../constants';

export function useBlockLogic(state, dispatch) {
    const [selectedId, setSelectedId] = useState(null);
    const [clipboard, setClipboard] = useState(null);

    const pushToHistory = useCallback((newBlocksOrFunc) => {
        dispatch({ type: 'PUSH_BLOCKS', payload: typeof newBlocksOrFunc === 'function' ? newBlocksOrFunc(state.blocks) : newBlocksOrFunc });
    }, [state.blocks, dispatch]);

    const setBlocksSilent = useCallback((newBlocksOrFunc) => {
        dispatch({ type: 'SET_BLOCKS', payload: typeof newBlocksOrFunc === 'function' ? newBlocksOrFunc(state.blocks) : newBlocksOrFunc });
    }, [state.blocks, dispatch]);

    const addBlock = useCallback((parentId = null, count = 1) => {
        const actualParentId = parentId || selectedId;
        const newBlocks = [];
        for (let i = 0; i < count; i++) {
            newBlocks.push({
                id: 'block_' + Math.random().toString(36).substr(2, 9),
                parentId: actualParentId,
                x: actualParentId ? 0 : 100 + ((state.blocks.length + i) * 20),
                y: actualParentId ? 0 : 100 + ((state.blocks.length + i) * 20),
                w: actualParentId ? 100 : 200,
                h: actualParentId ? 100 : 200,
                meta: { ...DEFAULT_BLOCK_META }
            });
        }
        pushToHistory([...state.blocks, ...newBlocks]);
        setSelectedId(newBlocks[newBlocks.length - 1].id);
    }, [selectedId, state.blocks, pushToHistory]);

    const updateBlockMeta = useCallback((id, key, value) => {
        pushToHistory(prev => prev.map(b => b && b.id === id ? { ...b, meta: { ...(b.meta || {}), [key]: value } } : b));
    }, [pushToHistory]);

    const deleteBlocks = useCallback((idsString) => {
        if (!idsString) return;
        const idsToDelete = idsString.split(',');
        const deleteRecursive = (ids, currentBlocks) => {
            let res = currentBlocks;
            ids.forEach(id => {
                const children = res.filter(b => b && b.parentId === id);
                if (children.length > 0) res = deleteRecursive(children.map(c => c.id), res);
                res = res.filter(b => b && b.id !== id);
            });
            return res;
        };
        pushToHistory(prev => deleteRecursive(idsToDelete, prev));
        setSelectedId(null);
    }, [pushToHistory]);

    const copyBlocks = useCallback(() => {
        if (!selectedId) return;
        const idsToCopy = selectedId.split(',');
        const getRecursive = (ids, currentBlocks) => {
            let res = [];
            ids.forEach(id => {
                const block = currentBlocks.find(b => b.id === id);
                if (block) {
                    res.push(block);
                    const children = currentBlocks.filter(b => b.parentId === id);
                    if (children.length > 0) res = [...res, ...getRecursive(children.map(c => c.id), currentBlocks)];
                }
            });
            return res;
        };
        const blocksToCopy = getRecursive(idsToCopy, state.blocks);
        setClipboard(JSON.parse(JSON.stringify(blocksToCopy)));
    }, [selectedId, state.blocks]);

    const pasteBlocks = useCallback(() => {
        if (!clipboard || clipboard.length === 0) return;
        const targetParentId = selectedId || null;
        const idMap = {};
        const newPastedBlocks = clipboard.map(b => {
            const newId = 'block_' + Math.random().toString(36).substr(2, 9);
            idMap[b.id] = newId;
            return { ...b, id: newId };
        });
        const finalBlocks = newPastedBlocks.map(b => {
            let newParentId = targetParentId;
            if (idMap[b.parentId]) newParentId = idMap[b.parentId];
            const isRootOfPasted = !idMap[b.parentId];
            return { 
                ...b, 
                parentId: newParentId,
                x: (isRootOfPasted && !newParentId) ? b.x + 40 : b.x,
                y: (isRootOfPasted && !newParentId) ? b.y + 40 : b.y
            };
        });
        pushToHistory([...state.blocks, ...finalBlocks]);
        setSelectedId(finalBlocks[0].id);
    }, [clipboard, selectedId, state.blocks, pushToHistory]);

    return {
        selectedId, setSelectedId,
        addBlock, updateBlockMeta, deleteBlocks,
        copyBlocks, pasteBlocks,
        pushToHistory, setBlocksSilent
    };
}
