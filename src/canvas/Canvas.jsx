import React, { useRef, useEffect, useState, useMemo } from 'react'
import Moveable from 'react-moveable'
import InfiniteViewer from "react-infinite-viewer"
import Block from './Block'
import { useCanvasInteraction } from './hooks/useCanvasInteraction'
import { useSpacingLogic } from './hooks/useSpacingLogic'
import { useMoveableHandlers } from './hooks/useMoveableHandlers'
import { COLORS } from '../constants'

// Custom Ability for Spacing
const SpacingAbility = {
    name: "spacing",
    render(moveable, React) {
        return null;
    }
};

// Sub-components
import EmptyState from './components/EmptyState'
import BlueprintImg from './components/BlueprintImg'
import FloatingToolbar from './FloatingToolbar'

export default function Canvas({ 
    blocks, 
    setBlocks, 
    setBlocksSilent, 
    selectedId, 
    onSelect, 
    onAddBlock, 
    blueprint, 
    onUpdateBlueprint 
}) {
    const viewerRef = useRef(null)
    const moveableRef = useRef(null)
    const viewportRef = useRef(null)
    const [targets, setTargets] = useState([])
    const [zoom, setZoom] = useState(1)
    const [isTransforming, setIsTransforming] = useState(false)

    // Хуки для интерактивности
    const { isPanning, editingSpace, setEditingSpace } = useCanvasInteraction(zoom, setZoom, setBlocksSilent);
    const { startDraggingSpace, draggingType, isInteracting } = useSpacingLogic(zoom, setBlocksSilent, setBlocks, blocks);
    const { handleDrag, handleDragEnd, handleResize, handleResizeEnd } = useMoveableHandlers({ 
        blocks, setBlocks, setBlocksSilent, onUpdateBlueprint, setIsTransforming 
    });

    const blocksByParent = useMemo(() => {
        const map = {}
        if (Array.isArray(blocks)) {
            blocks.forEach(b => { 
                if (!b) return; 
                const pid = b.parentId || 'root'; 
                if (!map[pid]) map[pid] = []; 
                map[pid].push(b); 
            })
        }
        return map
    }, [blocks])

    const selectedIds = useMemo(() => String(selectedId || '').split(',').filter(Boolean), [selectedId]);

    useEffect(() => {
        if (selectedIds.length === 0 || !Array.isArray(blocks)) {
            setTargets(selectedId === 'blueprint-img' ? [document.getElementById('blueprint-img')] : []);
            return;
        }
        const timer = setTimeout(() => {
            const els = selectedIds.map(id => document.querySelector(`[data-id="${id}"]`)).filter(Boolean);
            setTargets(els);
        }, 30);
        return () => clearTimeout(timer);
    }, [selectedIds, blocks, selectedId]);

    useEffect(() => { if (moveableRef.current) moveableRef.current.updateRect(); }, [blocks, zoom]);

    const updateMeta = (id, key, value) => {
        requestAnimationFrame(() => {
            setBlocks(prev => prev.map(b => b && b.id === id ? { ...b, meta: { ...b.meta, [key]: value } } : b));
        });
    };

    const handleSize = (id, key, value) => {
        if (!id) return;
        const val = (String(value).includes('%')) ? value : (parseInt(value) || 0);
        setBlocks(prev => prev.map(b => (b && b.id === id) ? { ...b, [key]: val } : b));
    };

    const handleFill = (id, side) => {
        setBlocks(prev => {
            const block = prev.find(b => b.id === id);
            if (!block || !block.parentId) return prev;
            const parent = prev.find(p => p.id === block.parentId);
            const dir = parent?.meta?.direction || 'row';
            const isMainAxis = (dir === 'row' && (side === 'left' || side === 'right')) || 
                               (dir === 'column' && (side === 'top' || side === 'bottom'));
            
            return prev.map(b => {
                if (b.id !== id) return b;
                const newMeta = { ...b.meta };
                const bCopy = { ...b };
                if (isMainAxis) {
                    const currentGrow = b.meta?.flexGrow === 1;
                    newMeta.flexGrow = currentGrow ? 0 : 1;
                    newMeta.flexBasis = currentGrow ? 'auto' : '0%';
                    const dim = dir === 'row' ? 'w' : 'h';
                    delete newMeta[dim];
                    delete bCopy[dim];
                } else {
                    const dimension = dir === 'row' ? 'h' : 'w';
                    const currentFull = b.meta?.[dimension] === '100%';
                    if (currentFull) {
                        delete newMeta[dimension];
                        delete bCopy[dimension];
                    } else {
                        newMeta[dimension] = '100%';
                        bCopy[dimension] = '100%';
                    }
                    newMeta.alignSelf = currentFull ? 'auto' : 'stretch';
                }
                return { ...bCopy, meta: newMeta };
            });
        });
    };

    return (
        <div className="canvas-main-container" style={{ width: '100%', height: '100%', background: COLORS.bg, position: 'relative' }} 
            onMouseDown={(e) => { if (!isPanning) onSelect(null); }}
            onDoubleClick={(e) => {
                const target = e.target;
                if (target.classList.contains('moveable-control')) {
                    if (!selectedId || selectedId === 'blueprint-img') return;
                    const cls = target.className;
                    if (cls.includes('moveable-n') || cls.includes('moveable-s')) handleFill(selectedId, 'top');
                    if (cls.includes('moveable-w') || cls.includes('moveable-e')) handleFill(selectedId, 'left');
                }
            }}
        >
            <style>{`
                .spacing-zone { transition: none; opacity: 0.5; pointer-events: auto; cursor: pointer; z-index: 1000 !important; }
                .spacing-zone:hover { opacity: 1; }
                .spacing-zone:hover .spacing-handle { opacity: 1 !important; }
                .margin-zone { border: 1px solid rgba(245, 158, 11, 0.9); background: rgba(245, 158, 11, 0.3); }
                .padding-zone { border: 1px solid rgba(168, 85, 247, 0.9); background: rgba(168, 85, 247, 0.3); }
            `}</style>
            
            {blocks.length === 0 && (
                <EmptyState onAdd={() => onAddBlock(null)} />
            )}

            <InfiniteViewer 
                ref={viewerRef} 
                className={`viewer ${isPanning ? 'panning' : ''}`} 
                usePinch={true} useWheelScroll={true} useMouseDrag={isPanning} 
                zoom={zoom} onPinch={e => setZoom(e.zoom)}
                style={{ width: '100%', height: '100%', background: '#000' }}
            >
                <div className="viewport" ref={viewportRef} style={{ 
                    width: '10000px', height: '10000px', position: 'relative',
                    backgroundImage: `radial-gradient(rgba(255,255,255,0.05) 1px, transparent 0)`,
                    backgroundSize: '40px 40px', backgroundPosition: '-1px -1px'
                }}>
                    {blueprint.url && <BlueprintImg blueprint={blueprint} selectedId={selectedId} onSelect={onSelect} />}

                    {(blocksByParent['root'] || []).map(block => (
                        <Block 
                            key={block.id} block={block} blocks={blocks} blocksByParent={blocksByParent}
                            selectedIds={selectedIds} isPanning={isPanning} zoom={zoom}
                            isTransforming={isTransforming}
                            draggingType={draggingType}
                            editingSpace={editingSpace}
                            onSaveEdit={(val) => {
                                updateMeta(editingSpace.id, editingSpace.type, {
                                    ...(blocks.find(b => b && b.id === editingSpace.id)?.meta?.[editingSpace.type] || {}),
                                    [editingSpace.side]: isNaN(parseInt(val)) ? val : parseInt(val)
                                });
                                setEditingSpace(null);
                            }}
                            onSelect={onSelect} onUpdateMeta={updateMeta} onUpdateSize={handleSize}
                            onAddBlock={onAddBlock}
                            onStartDrag={startDraggingSpace}
                            onSetAuto={(id, side) => updateMeta(id, 'margin', {...(blocks.find(b => b && b.id === id)?.meta?.margin || {}), [side]: 'auto'})}
                            onEdit={(id, type, side) => setEditingSpace({ id, type, side })}
                            onFill={handleFill}
                        />
                    ))}

                    {/* Плавающая панель (теперь на уровне канваса для правильного z-index) */}
                    {selectedIds.length === 1 && !isPanning && !isInteracting && targets[0] && viewportRef.current && (
                        <div style={{
                            position: 'absolute',
                            left: (targets[0].getBoundingClientRect().left - viewportRef.current.getBoundingClientRect().left) / zoom,
                            top: (targets[0].getBoundingClientRect().top - viewportRef.current.getBoundingClientRect().top) / zoom,
                            width: targets[0].offsetWidth,
                            height: 0,
                            pointerEvents: 'none', 
                            zIndex: 999999,
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <div style={{ pointerEvents: 'auto' }}>
                                <FloatingToolbar 
                                    block={blocks.find(b => b && b.id === selectedIds[0])} 
                                    zoom={zoom} 
                                    hasChildren={(blocksByParent[selectedIds[0]] || []).length > 0}
                                    hasContent={(blocksByParent[selectedIds[0]] || []).length > 0 || !!blocks.find(b => b && b.id === selectedIds[0])?.meta?.text}
                                    onUpdateMeta={(key, val) => updateMeta(selectedIds[0], key, val)}
                                    onUpdateSize={(key, val) => handleSize(selectedIds[0], key, val)}
                                    onAddBlock={onAddBlock}
                                />
                            </div>
                        </div>
                    )}
                    
                        <Moveable 
                            ref={moveableRef} target={targets} zoom={1 / zoom} 
                            resizable={targets.length === 1}
                            useResizeObserver={true}
                            edgeDraggable={true}
                            renderDirections={["n", "nw", "ne", "s", "sw", "se", "w", "e"]}
                            abilities={[SpacingAbility]}
                            spacing={true}
                            keepRatio={targets.length === 1 && targets[0]?.id === 'blueprint-img'}
                        onResizeStart={() => setIsTransforming(true)} 
                        onResize={handleResize} 
                        onResizeEnd={handleResizeEnd} 
                    />
                </div>
            </InfiniteViewer>

            <div style={{ position: 'absolute', bottom: 20, right: 20, display: 'flex', gap: 10, alignItems: 'center', zIndex: 1000 }}>
                <div style={{ background: 'rgba(30,30,35,0.8)', padding: '6px 12px', borderRadius: 20, color: 'white', fontSize: 12, fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>{Math.round(zoom * 100)}%</div>
                <button onClick={() => setZoom(1)} style={btnStyle}>Reset</button>
            </div>

            {editingSpace && (
                <EditModal 
                    data={editingSpace} 
                    onClose={() => setEditingSpace(null)} 
                    onSave={(val) => {
                        updateMeta(editingSpace.id, editingSpace.type, {
                            ...(blocks.find(b => b && b.id === editingSpace.id)?.meta?.[editingSpace.type] || {}),
                            [editingSpace.side]: isNaN(parseInt(val)) ? val : parseInt(val)
                        });
                        setEditingSpace(null);
                    }}
                />
            )}
        </div>
    )
}

const EditModal = ({ data, onClose, onSave }) => {
    const [val, setVal] = useState('');
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000000, backdropFilter: 'blur(5px)' }} onClick={onClose}>
            <div style={{ background: '#1a1a1e', padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', minWidth: 200, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: 11, fontWeight: 900, color: 'dimmed', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Edit {data.type} {data.side}</div>
                <input 
                    autoFocus 
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '8px 12px', color: 'white', fontSize: 16, fontWeight: 700, outline: 'none' }}
                    placeholder="e.g. 20 or auto"
                    value={val}
                    onChange={e => setVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && onSave(val)}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '8px', borderRadius: 6, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={() => onSave(val)} style={{ flex: 1, padding: '8px', borderRadius: 6, background: COLORS.primary, border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Save</button>
                </div>
            </div>
        </div>
    );
};

const btnStyle = { background: COLORS.primary, border: 'none', color: 'white', padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 }