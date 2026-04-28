import React, { useRef, useEffect, useState, useMemo } from 'react'
import Moveable from 'react-moveable'
import InfiniteViewer from "react-infinite-viewer"
import Block from './Block'
import { useCanvasInteraction } from './hooks/useCanvasInteraction'
import { useSpacingLogic } from './hooks/useSpacingLogic'
import { useMoveableHandlers } from './hooks/useMoveableHandlers'
import { COLORS } from '../constants'

// Sub-components
import EmptyState from './components/EmptyState'
import BlueprintImg from './components/BlueprintImg'

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
    const [targets, setTargets] = useState([])
    const [zoom, setZoom] = useState(1)
    const [isTransforming, setIsTransforming] = useState(false)

    // Хуки для интерактивности
    const { isPanning, setEditingSpace } = useCanvasInteraction(zoom, setZoom, setBlocksSilent);
    const { startDraggingSpace } = useSpacingLogic(zoom, setBlocksSilent);
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
                usePinch={true} useWheelScroll={true} useMouseDrag={isPanning} 
                zoom={zoom} onPinch={e => setZoom(e.zoom)}
                style={{ width: '100%', height: '100%', background: '#000' }}
            >
                <div className="viewport" style={{ 
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
                        onDrag={handleDrag} 
                        onDragEnd={handleDragEnd} 
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
        </div>
    )
}

const btnStyle = { background: COLORS.primary, border: 'none', color: 'white', padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 700 }