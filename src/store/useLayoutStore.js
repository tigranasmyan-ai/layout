import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import { nanoid } from 'nanoid';
import { DEFAULT_BLOCK_META } from '../constants';

export const useLayoutStore = create(
    temporal(
        persist(
            (set, get) => ({
                blocks: [],
                blueprint: { url: null, x: 0, y: 0, w: 1200, opacity: 0.5 },
                assets: [],
                fonts: [],
                palette: [],
                selectedId: null,

                // Actions
                setSelectedId: (id) => set({ selectedId: id }),
                
                addBlock: (parentId = null, count = 1) => {
                    const { blocks, selectedId } = get();
                    const actualParentId = parentId || selectedId;
                    const newBlocks = [];
                    for (let i = 0; i < count; i++) {
                        newBlocks.push({
                            id: 'block_' + nanoid(9),
                            parentId: actualParentId,
                            x: actualParentId ? 0 : 100 + ((blocks.length + i) * 20),
                            y: actualParentId ? 0 : 100 + ((blocks.length + i) * 20),
                            w: actualParentId ? 100 : 200,
                            h: actualParentId ? 100 : 200,
                            meta: { ...DEFAULT_BLOCK_META }
                        });
                    }
                    set({ blocks: [...blocks, ...newBlocks], selectedId: newBlocks[newBlocks.length - 1].id });
                },

                updateBlockMeta: (id, key, value) => {
                    set((state) => ({
                        blocks: state.blocks.map(b => b.id === id ? { ...b, meta: { ...(b.meta || {}), [key]: value } } : b)
                    }));
                },

                updateBlockSize: (id, key, value) => {
                    set((state) => ({
                        blocks: state.blocks.map(b => b.id === id ? { ...b, [key]: value } : b)
                    }));
                },

                setBlocks: (newBlocksOrFunc) => {
                    const newBlocks = typeof newBlocksOrFunc === 'function' ? newBlocksOrFunc(get().blocks) : newBlocksOrFunc;
                    set({ blocks: newBlocks });
                },

                setBlocksSilent: (newBlocksOrFunc) => {
                    const { pause, resume } = useLayoutStore.temporal.getState();
                    pause(); // Останавливаем запись истории
                    const newBlocks = typeof newBlocksOrFunc === 'function' ? newBlocksOrFunc(get().blocks) : newBlocksOrFunc;
                    set({ blocks: newBlocks });
                    resume(); // Возобновляем
                },

                deleteBlocks: (idsString) => {
                    if (!idsString) return;
                    const idsToDelete = idsString.split(',');
                    const { blocks } = get();
                    
                    const deleteRecursive = (ids, currentBlocks) => {
                        let res = currentBlocks;
                        ids.forEach(id => {
                            const children = res.filter(b => b && b.parentId === id);
                            if (children.length > 0) res = deleteRecursive(children.map(c => c.id), res);
                            res = res.filter(b => b && b.id !== id);
                        });
                        return res;
                    };

                    set({ blocks: deleteRecursive(idsToDelete, blocks), selectedId: null });
                },

                copyBlocks: () => {
                    const { selectedId, blocks } = get();
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

                    const blocksToCopy = getRecursive(idsToCopy, blocks);
                    window.__clipboard = JSON.parse(JSON.stringify(blocksToCopy));
                },

                pasteBlocks: () => {
                    const clipboard = window.__clipboard;
                    if (!clipboard || clipboard.length === 0) return;
                    const { blocks, selectedId } = get();
                    const targetParentId = selectedId || null;
                    const idMap = {};
                    
                    const newPastedBlocks = clipboard.map(b => {
                        const newId = 'block_' + nanoid(9);
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

                    set({ blocks: [...blocks, ...finalBlocks], selectedId: finalBlocks[0].id });
                },

                updateBlueprint: (payload) => set((state) => ({ blueprint: { ...state.blueprint, ...payload } })),
                addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),
                removeAsset: (id) => set((state) => ({ assets: state.assets.filter(a => a.id !== id) })),
                addFont: (font) => set((state) => ({ fonts: [...state.fonts, font] })),
                removeFont: (family) => set((state) => ({ fonts: state.fonts.filter(f => f.family !== family) })),
                addColor: (color) => set((state) => ({ palette: [...state.palette, color] })),
                removeColor: (name) => set((state) => ({ palette: state.palette.filter(c => c.name !== name) })),
                clearAll: () => set({ blocks: [], selectedId: null })
            }),
            {
                name: 'layout-storage',
                partialize: (state) => ({
                    blocks: state.blocks,
                    blueprint: state.blueprint,
                    assets: state.assets,
                    fonts: state.fonts,
                    palette: state.palette
                })
            }
        ),
        {
            limit: 50,
            partialize: (state) => ({ blocks: state.blocks }) // Отслеживаем только блоки для Undo/Redo
        }
    )
);
