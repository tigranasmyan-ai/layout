import React, { useRef, useEffect, useState, useMemo } from 'react'
import Moveable from 'react-moveable'
import InfiniteViewer from "react-infinite-viewer"
import Block from './Block'
import { useCanvasInteraction } from './hooks/useCanvasInteraction'
import { applyLayoutPreset, toggleEdgeFill } from './utils/layoutPresets'
import { COLORS } from '../constants'
import { IconPlus } from '@tabler/icons-react'

export default function Canvas({ blocks, setBlocks, selectedId, onSelect, onAddBlock, blueprint, onUpdateBlueprint }) {
    const viewerRef = useRef(null)
    const moveableRef = useRef(null)
    const [targets, setTargets] = useState([])
    const [zoom, setZoom] = useState(1)

    // Вся сложная интерактивность теперь тут
    const { 
        isPanning, isInteracting, setIsInteracting, 
        editingSpace, setEditingSpace, startDraggingSpace 
    } = useCanvasInteraction(zoom, setZoom, setBlocks);

    // Умная группировка блоков для рендера
    const blocksByParent = useMemo(() => {
        const map = {}
        if (Array.isArray(blocks)) {
            blocks.forEach(b => { if (!b) return; const pid = b.parentId || 'root'; if (!map[pid]) map[pid] = []; map[pid].push(b); })
        }
        return map
    }, [blocks])

    const selectedIds = useMemo(() => String(selectedId || '').split(',').filter(Boolean), [selectedId]);

    // Синхронизация Moveable и выделения
    useEffect(() => {
        if (selectedIds.length === 0 || !Array.isArray(blocks)) {
            setTargets(selectedId === 'blueprint-img' ? [document.getElementById('blueprint-img')] : []);
            return;
        }
        const timer = setTimeout(() => {
            setTargets(selectedIds.map(id => document.querySelector(`[data-id="${id}"]`)).filter(Boolean));
        }, 30);
        return () => clearTimeout(timer);
    }, [selectedIds, blocks, selectedId]);

    useEffect(() => { if (moveableRef.current) moveableRef.current.updateRect(); }, [blocks, zoom]);

    // Колбеки для управления состоянием
    const updateMeta = (id, key, value) => {
        requestAnimationFrame(() => {
            setBlocks(prev => prev.map(b => b && b.id === id ? { ...b, meta: { ...b.meta, [key]: value } } : b));
        });
    };

    const updateSize = (id, key, value) => {
        const val = (String(value).includes('%')) ? value : (parseInt(value) || 0);
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, [key]: val } : b));
    };

    const handleApplyPreset = (id, preset) => setBlocks(prev => applyLayoutPreset(prev, id, preset));
    
    const handleEdgeFill = (block, axis) => {
        const { newMeta, newSizeUpdate } = toggleEdgeFill(blocks, block, axis);
        updateMeta(block.id, 'meta', newMeta); // Ошибка в логике была тут, фиксим: передаем ключи явно
        if (newMeta.flexGrow !== undefined) updateMeta(block.id, 'flexGrow', newMeta.flexGrow);
        if (newMeta.alignSelf !== undefined) updateMeta(block.id, 'alignSelf', newMeta.alignSelf);
        if (newSizeUpdate !== null) updateSize(block.id, axis, newSizeUpdate);
    };

    return (
        <div className="canvas-main-container" style={{ width: '100%', height: '100%', background: COLORS.bg, position: 'relative' }} 
            onMouseDown={(e) => { if (!isPanning) onSelect(null); }}
        >
            {blocks.length === 0 && !blueprint.url && (
                <EmptyState onAdd={() => onAddBlock(null)} />
            )}

            <InfiniteViewer ref={viewerRef} className={`viewer ${isPanning ? 'panning' : ''}`} usePinch={true} useWheelScroll={true} useMouseDrag={isPanning} zoom={zoom} onPinch={e => setZoom(e.zoom)} style={{ width: '100%', height: '100%' }}>
                <div className="viewport" style={{ width: '5000px', height: '5000px', position: 'relative' }}>
                    {blueprint.url && <BlueprintImg blueprint={blueprint} selectedId={selectedId} onSelect={onSelect} onUpdate={onUpdateBlueprint} />}

                    {(blocksByParent['root'] || []).map(block => (
                        <Block 
                            key={block.id} block={block} blocks={blocks} blocksByParent={blocksByParent}
                            selectedIds={selectedIds} isPanning={isPanning} zoom={zoom}
                            onSelect={onSelect} onUpdateMeta={updateMeta} onUpdateSize={updateSize}
                            onAddBlock={onAddBlock} onApplyPreset={handleApplyPreset}
                            onStartDrag={startDraggingSpace} onHandleEdgeFill={handleEdgeFill}
                            onSetAuto={(id, side) => updateMeta(id, 'margin', {...(blocks.find(b => b.id === id)?.meta?.margin || {}), [side]: 'auto'})}
                            onEdit={(id, type, side) => setEditingSpace({ id, type, side })}
                        />
                    ))}
                    
                    <Moveable 
                        ref={moveableRef} target={targets} zoom={1 / zoom} 
                        draggable={targets.length > 0 && targets.every(t => t.id === 'blueprint-img' || !blocks.find(x => x?.id === t.getAttribute('data-id'))?.parentId)} 
                        resizable={targets.length === 1}
                        keepRatio={targets.length === 1 && targets[0]?.id === 'blueprint-img'}
                        onDragStart={() => setIsInteracting(true)} 
                        onDrag={e => { 
                            const id = e.target.id === 'blueprint-img' ? 'blueprint-img' : e.target.getAttribute('data-id');
                            if (id === 'blueprint-img') onUpdateBlueprint({ x: e.left, y: e.top });
                            else e.target.style.left = `${e.left}px`, e.target.style.top = `${e.top}px`;
                        }} 
                        onDragEnd={e => { 
                            setIsInteracting(false); 
                            const id = e.target.id === 'blueprint-img' ? 'blueprint-img' : e.target.getAttribute('data-id');
                            if (id !== 'blueprint-img' && id) setBlocks(prev => prev.map(b => b.id === id ? { ...b, x: e.lastEvent.left, y: e.lastEvent.top } : b));
                        }} 
                        onResizeStart={() => setIsInteracting(true)} 
                        onResize={e => {
                            const id = e.target.id === 'blueprint-img' ? 'blueprint-img' : e.target.getAttribute('data-id');
                            if (id === 'blueprint-img') onUpdateBlueprint({ w: e.width, x: e.drag.left, y: e.drag.top });
                            else if (id) {
                                setBlocks(prev => prev.map(b => b.id === id ? { ...b, w: e.width, h: e.height, meta: { ...b.meta, flex: 'none', flexGrow: 0, alignSelf: 'auto', flexBasis: 'auto', maxWidth: 'none', maxHeight: 'none' }, ...(b.parentId ? {} : {x: e.drag.left, y: e.drag.top}) } : b));
                                e.target.style.width = `${e.width}px`, e.target.style.height = `${e.height}px`; 
                            }
                        }} 
                        onResizeEnd={() => setIsInteracting(false)} 
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