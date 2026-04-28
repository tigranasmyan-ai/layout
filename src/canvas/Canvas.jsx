import React, { useRef, useEffect, useState, useMemo } from 'react'
import Moveable from 'react-moveable'
import InfiniteViewer from "react-infinite-viewer"
import Block from './Block'
import { useCanvasInteraction } from './hooks/useCanvasInteraction'
import { useSpacingLogic } from './hooks/useSpacingLogic'
import { COLORS } from '../constants'
import { IconPlus } from '@tabler/icons-react'

export default function Canvas({ blocks, setBlocks, selectedId, onSelect, onAddBlock, blueprint, onUpdateBlueprint }) {
    const viewerRef = useRef(null)
    const moveableRef = useRef(null)
    const [targets, setTargets] = useState([])
    const [zoom, setZoom] = useState(1)
    const [isTransforming, setIsTransforming] = useState(false)


    // Разделяем интерактивность на два хука: общее управление и логика отступов
    const { isPanning, editingSpace, setEditingSpace } = useCanvasInteraction(zoom, setZoom, setBlocks);
    const { isInteracting, startDraggingSpace } = useSpacingLogic(zoom, setBlocks);

    const blocksByParent = useMemo(() => {
        const map = {}
        if (Array.isArray(blocks)) {
            blocks.forEach(b => { if (!b) return; const pid = b.parentId || 'root'; if (!map[pid]) map[pid] = []; map[pid].push(b); })
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
        const val = (String(value).includes('%')) ? value : (parseInt(value) || 0);
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, [key]: val } : b));
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
                    
                    // Удаляем размер только по главной оси
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
                    // n, s -> vertical fill
                    // w, e -> horizontal fill
                    // nw, ne, sw, se -> both
                    if (cls.includes('moveable-n') || cls.includes('moveable-s')) handleFill(selectedId, 'top');
                    if (cls.includes('moveable-w') || cls.includes('moveable-e')) handleFill(selectedId, 'left');
                }
            }}
        >
            <style>{`
                .spacing-zone { transition: opacity 0.1s, background 0.1s; opacity: 0.3; pointer-events: auto; cursor: pointer; }
                .spacing-zone:hover { opacity: 1; background: rgba(255,255,255,0.1) !important; }
                .margin-zone { border: 1px dashed rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.05); }
                .padding-zone { border: 1px dashed rgba(168, 85, 247, 0.3); background: rgba(168, 85, 247, 0.05); }
                .viewer.panning { cursor: grab !important; }
                .viewer.panning:active { cursor: grabbing !important; }
            `}</style>
            
            {blocks.length === 0 && !blueprint.url && (
                <EmptyState onAdd={() => onAddBlock(null)} />
            )}

            <InfiniteViewer 
                ref={viewerRef} 
                className={`viewer ${isPanning ? 'panning' : ''}`} 
                usePinch={true} 
                useWheelScroll={true} 
                useMouseDrag={isPanning} 
                zoom={zoom} 
                onPinch={e => setZoom(e.zoom)}
                style={{ width: '100%', height: '100%', background: '#000' }}
            >
                <div className="viewport" style={{ 
                    width: '10000px', 
                    height: '10000px', 
                    position: 'relative',
                    backgroundImage: `radial-gradient(rgba(255,255,255,0.05) 1px, transparent 0)`,
                    backgroundSize: '40px 40px',
                    backgroundPosition: '-1px -1px'
                }}>
                    {blueprint.url && <BlueprintImg blueprint={blueprint} selectedId={selectedId} onSelect={onSelect} onUpdate={onUpdateBlueprint} />}

                    {(blocksByParent['root'] || []).map(block => (
                        <Block 
                            key={block.id} block={block} blocks={blocks} blocksByParent={blocksByParent}
                            selectedIds={selectedIds} isPanning={isPanning} zoom={zoom}
                            isTransforming={isTransforming}
                            onSelect={onSelect} onUpdateMeta={updateMeta} onUpdateSize={handleSize}
                            onAddBlock={onAddBlock}
                            onStartDrag={startDraggingSpace}
                            onSetAuto={(id, side) => updateMeta(id, 'margin', {...(blocks.find(b => b.id === id)?.meta?.margin || {}), [side]: 'auto'})}
                            onEdit={(id, type, side) => setEditingSpace({ id, type, side })}
                            onFill={handleFill}
                        />
                    ))}
                    
                    <Moveable 
                        ref={moveableRef} target={targets} zoom={1 / zoom} 
                        draggable={targets.length > 0 && targets.every(t => t.id === 'blueprint-img' || !blocks.find(x => x?.id === t.getAttribute('data-id'))?.parentId)} 
                        resizable={targets.length === 1}
                        keepRatio={targets.length === 1 && targets[0]?.id === 'blueprint-img'}
                        onDragStart={() => setIsTransforming(true)} 
                        onDrag={e => { 
                            const id = e.target.id === 'blueprint-img' ? 'blueprint-img' : e.target.getAttribute('data-id');
                            if (id === 'blueprint-img') onUpdateBlueprint({ x: e.left, y: e.top });
                            else e.target.style.left = `${e.left}px`, e.target.style.top = `${e.top}px`;
                        }} 
                        onDragEnd={e => { 
                            setIsTransforming(false);
                            const id = e.target.id === 'blueprint-img' ? 'blueprint-img' : e.target.getAttribute('data-id');
                            if (id !== 'blueprint-img' && id) setBlocks(prev => prev.map(b => b.id === id ? { ...b, x: e.lastEvent.left, y: e.lastEvent.top } : b));
                        }} 
                        onResizeStart={() => setIsTransforming(true)} 
                        onResize={e => {
                            const id = e.target.id === 'blueprint-img' ? 'blueprint-img' : e.target.getAttribute('data-id');
                            if (id === 'blueprint-img') onUpdateBlueprint({ w: e.width, x: e.drag.left, y: e.drag.top });
                            else if (id) {
                                const update = { 
                                    w: Math.max(e.width, 10), 
                                    h: Math.max(e.height, 10), 
                                    meta: { 
                                        ...(blocks.find(b => b.id === id)?.meta || {}),
                                        flexGrow: 0, 
                                        flexBasis: 'auto', 
                                        alignSelf: 'auto',
                                        maxWidth: 'none',
                                        maxHeight: 'none'
                                    } 
                                };
                                if (!blocks.find(b => b.id === id)?.parentId) {
                                    update.x = e.drag.left;
                                    update.y = e.drag.top;
                                }
                                setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...update } : b));
                                e.target.style.width = `${update.w}px`;
                                e.target.style.height = `${update.h}px`;
                                if (update.x !== undefined) {
                                    e.target.style.left = `${update.x}px`;
                                    e.target.style.top = `${update.y}px`;
                                }
                            }
                        }} 
                        onResizeEnd={() => setIsTransforming(false)} 
                    />
                </div>
            </InfiniteViewer>

            <div style={{ position: 'absolute', bottom: 20, right: 20, display: 'flex', gap: 10, alignItems: 'center', zIndex: 1000 }}>
                <div style={{ background: 'rgba(30,30,35,0.8)', padding: '6px 12px', borderRadius: 20, color: 'white', fontSize: 12, fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>{Math.round(zoom * 100)}%</div>
                <button onClick={() => setZoom(1)} style={btnStyle}>Reset</button>
            </div>
        </div>
    )
}

const EmptyState = ({ onAdd }) => (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, zIndex: 10000, pointerEvents: 'none' }}>
        <div onClick={onAdd} style={{ padding: '24px 48px', borderRadius: 16, background: 'rgba(79, 70, 229, 0.1)', border: '2px dashed #4f46e5', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', pointerEvents: 'auto', backdropFilter: 'blur(10px)', boxShadow: '0 0 40px rgba(79, 70, 229, 0.2)' }}>
            <IconPlus size={32} strokeWidth={2.5} />
            <span style={{ fontWeight: 800, letterSpacing: 1.5, fontSize: 14 }}>CREATE FIRST CONTAINER</span>
        </div>
    </div>
);

const BlueprintImg = ({ blueprint, selectedId, onSelect, onUpdate }) => (
    <div id="blueprint-img" onMouseDown={(e) => { e.stopPropagation(); onSelect('blueprint-img'); }}
        style={{ position: 'absolute', left: blueprint.x, top: blueprint.y, width: blueprint.w, opacity: blueprint.opacity, pointerEvents: 'auto', cursor: 'move', zIndex: 1, border: selectedId === 'blueprint-img' ? '2px solid #10b981' : 'none' }}>
        <img src={blueprint.url} style={{ width: '100%', pointerEvents: 'none', userSelect: 'none' }} alt="mockup" />
    </div>
);

const btnStyle = { background: COLORS.primary, border: 'none', color: 'white', padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 }