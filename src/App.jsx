import { useState, useCallback, useEffect, useReducer } from 'react'
import Sidebar from './components/Sidebar'
import CodeModal from './components/CodeModal'
import MonacoEditor from './components/MonacoEditor'
import Canvas from './canvas/Canvas'

import './App.css'

const initialState = {
    blocks: [],
    history: [[]],
    index: 0
};

function reducer(state, action) {
    switch (action.type) {
        case 'PUSH_BLOCKS': {
            const nextBlocks = typeof action.payload === 'function' 
                ? action.payload(state.blocks) 
                : action.payload;
            
            if (!Array.isArray(nextBlocks)) {
                console.error('❌ Error: Attempted to push non-array to blocks', nextBlocks);
                return state;
            }

            const newHistory = state.history.slice(0, state.index + 1);
            newHistory.push(nextBlocks);
            
            return {
                blocks: nextBlocks,
                history: newHistory,
                index: newHistory.length - 1
            };
        }
        case 'UNDO': {
            if (state.index <= 0) return state;
            const newIndex = state.index - 1;
            return {
                ...state,
                blocks: state.history[newIndex],
                index: newIndex
            };
        }
        case 'REDO': {
            if (state.index >= state.history.length - 1) return state;
            const newIndex = state.index + 1;
            return {
                ...state,
                blocks: state.history[newIndex],
                index: newIndex
            };
        }
        default:
            return state;
    }
}

export default function App() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [selectedId, setSelectedId] = useState(null)
    const [showCode, setShowCode] = useState(false)

    const pushToHistory = useCallback((payload) => dispatch({ type: 'PUSH_BLOCKS', payload }), []);
    const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
    const redo = useCallback(() => dispatch({ type: 'REDO' }), []);

    const addBlock = useCallback((parentId = null) => {
        const actualParentId = parentId || selectedId;
        // Более надежный ID
        const id = 'block_' + Math.random().toString(36).substr(2, 9);
        
        const newB = {
            id,
            parentId: actualParentId,
            x: actualParentId ? 0 : 100 + (state.blocks.length * 20),
            y: actualParentId ? 0 : 100 + (state.blocks.length * 20),
            w: actualParentId ? 100 : 200,
            h: actualParentId ? 100 : 200,
            meta: {
                direction: 'row',
                justify: 'flex-start',
                align: 'flex-start',
                gap: 0,
                padding: { top: 0, right: 0, bottom: 0, left: 0 },
                margin: { top: 0, right: 0, bottom: 0, left: 0 }
            }
        }
        pushToHistory([...state.blocks, newB]);
        setSelectedId(id);
    }, [selectedId, state.blocks, pushToHistory]);

    const deleteBlock = useCallback(() => {
        if (!selectedId) return;
        const toDelete = new Set([selectedId]);
        let size;
        do {
            size = toDelete.size;
            state.blocks.forEach(b => {
                if (b && b.parentId && toDelete.has(b.parentId)) {
                    toDelete.add(b.id);
                }
            });
        } while (toDelete.size > size);
        
        pushToHistory(state.blocks.filter(b => b && !toDelete.has(b.id)));
        setSelectedId(null);
    }, [selectedId, state.blocks, pushToHistory]);

    useEffect(() => {
        const handleKeys = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault()
                if (e.shiftKey) redo()
                else undo()
            }
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && !e.target.isContentEditable) {
                    e.preventDefault();
                    deleteBlock();
                }
            }
        }
        window.addEventListener('keydown', handleKeys)
        return () => window.removeEventListener('keydown', handleKeys)
    }, [undo, redo, deleteBlock])

    // Максимально безопасный поиск активного блока
    let activeBlock = null;
    try {
        if (selectedId && Array.isArray(state.blocks)) {
            activeBlock = state.blocks.find(b => b && b.id === selectedId) || null;
        }
    } catch (err) {
        console.error('❌ Critical error during block search:', err);
    }

    return (
        <div className="architect-app">
            <Sidebar
                activeShape={activeBlock ? { id: activeBlock.id, meta: activeBlock.meta || {} } : null}
                shapes={state.blocks || []}
                onShowCode={() => setShowCode(true)}
                onExport={() => {}}
                onSelect={(id) => setSelectedId(id)}
                onAddBlock={addBlock}
                onMetaUpdate={(metaUpdate) => {
                    if (!selectedId) return;
                    const next = state.blocks.map(b => 
                        b.id === selectedId ? { ...b, meta: { ...(b.meta || {}), ...metaUpdate } } : b
                    );
                    pushToHistory(next);
                }}
                onCSSUpdate={() => {}}
                MonacoComponent={MonacoEditor}
            />

            <main className="canvas-wrapper">
                <Canvas
                    blocks={state.blocks || []}
                    setBlocks={pushToHistory}
                    selectedId={selectedId}
                    onSelect={(id) => setSelectedId(id)}
                />
            </main>

            <CodeModal
                opened={showCode}
                onClose={() => setShowCode(false)}
                blocks={state.blocks || []}
            />
        </div>
    )
}
