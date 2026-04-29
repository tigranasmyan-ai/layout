import React, {useRef, useEffect, useState, useMemo} from 'react'
import Moveable from 'react-moveable'
import InfiniteViewer from "react-infinite-viewer"
import Block from '@components/Block'
import classes from './Canvas.module.css'
import { useCanvasInteraction, useSpacingLogic, useMoveableHandlers } from '@hooks'
import {COLORS} from '@constants'

// Custom Ability for Spacing
const SpacingAbility = {
    name: "spacing",
    render(moveable, React) {
        return null;
    }
};

// Sub-components
import EmptyState from '@components/EmptyState'
import BlueprintImg from '@components/BlueprintImg'
import FloatingToolbar from '@components/FloatingToolbar'
import { BlockProvider } from '@components/BlockContext'

export default function Canvas({ 
    blocks, setBlocks, selectedId, onSelect, onAddBlock, blueprint, onUpdateBlueprint 
}) {
    const viewerRef = useRef(null)
    const moveableRef = useRef(null)
    const viewportRef = useRef(null)
    const [targets, setTargets] = useState([])
    const [zoom, setZoom] = useState(1)
    const [isTransforming, setIsTransforming] = useState(false)

    // Хуки для интерактивности
    const {isPanning, editingSpace, setEditingSpace} = useCanvasInteraction(zoom, setZoom, setBlocks);
    const {startDraggingSpace, draggingType, isInteracting} = useSpacingLogic(zoom, setBlocks, blocks);
    const {handleDrag, handleDragEnd, handleResize, handleResizeEnd} = useMoveableHandlers({
        blocks, setBlocks, onUpdateBlueprint, setIsTransforming
    });

    const blocksByParent = useMemo(() => {
        const map = {};
        if (Array.isArray(blocks)) {
            blocks.forEach(b => {
                if (!b) return;
                const pid = b.parentId || 'root';
                if (!map[pid]) map[pid] = [];
                map[pid].push(b);
            });
        }
        // Чтобы мемоизация работала, нужно, чтобы ссылки на массивы детей не менялись, 
        // если сами дети (по ссылке) те же. Но так как блоки меняются при каждом движении, 
        // мы полагаемся на кастомное сравнение в Block.memo.
        return map;
    }, [blocks]);

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

    useEffect(() => {
        if (moveableRef.current) moveableRef.current.updateRect();
    }, [blocks, zoom]);

    const updateMeta = (id, key, value) => {
        requestAnimationFrame(() => {
            setBlocks(prev => prev.map(b => b && b.id === id ? {...b, meta: {...b.meta, [key]: value}} : b));
        });
    };

    const handleSize = (id, key, value) => {
        if (!id) return;
        const val = (String(value).includes('%')) ? value : (parseInt(value) || 0);
        setBlocks(prev => prev.map(b => (b && b.id === id) ? {...b, [key]: val} : b));
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
                const newMeta = {...b.meta};
                const bCopy = {...b};
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
                return {...bCopy, meta: newMeta};
            });
        });
    };

    const blockActions = useMemo(() => ({
        onSelect, 
        updateMeta, 
        handleSize, 
        handleFill, 
        onAddBlock,
        onStartDrag: startDraggingSpace,
        onSetAuto: (id, side) => updateMeta(id, 'margin', {
            ...(blocks.find(b => b && b.id === id)?.meta?.margin || {}),
            [side]: 'auto'
        }),
        onEdit: (id, type, side) => setEditingSpace({id, type, side}),
        onSaveEdit: (val) => {
            updateMeta(editingSpace.id, editingSpace.type, {
                ...(blocks.find(b => b && b.id === editingSpace.id)?.meta?.[editingSpace.type] || {}),
                [editingSpace.side]: isNaN(parseInt(val)) ? val : parseInt(val)
            });
            setEditingSpace(null);
        }
    }), [onSelect, updateMeta, handleSize, handleFill, onAddBlock, startDraggingSpace, blocks, editingSpace]);

    return (
        <BlockProvider actions={blockActions}>
            <div 
                className={classes.canvasMainContainer}
                onMouseDown={(e) => {
                    if (!isPanning) onSelect(null);
                }}
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
                {blocks.length === 0 && (
                    <EmptyState onAdd={() => onAddBlock(null)}/>
                )}

                <InfiniteViewer
                    ref={viewerRef}
                    className={`${classes.viewer} ${isPanning ? classes.panning : ''}`}
                    usePinch={true} useWheelScroll={true} useMouseDrag={isPanning}
                    zoom={zoom} onPinch={e => setZoom(e.zoom)}
                >
                    <div className={classes.viewport} ref={viewportRef}>
                        {blueprint.url && <BlueprintImg blueprint={blueprint} selectedId={selectedId} onSelect={onSelect}/>}

                        {(blocksByParent['root'] || []).map(block => (
                            <Block
                                key={block.id} block={block} blocks={blocks} blocksByParent={blocksByParent}
                                selectedIds={selectedIds} isPanning={isPanning} zoom={zoom}
                                isTransforming={isTransforming}
                                draggingType={draggingType}
                                editingSpace={editingSpace}
                            />
                        ))}

                        {/* Плавающая панель */}
                        {selectedIds.length === 1 && !isPanning && !isInteracting && targets[0] && viewportRef.current && (
                            <div className={classes.toolbarContainer} style={{
                                left: (targets[0].getBoundingClientRect().left - viewportRef.current.getBoundingClientRect().left) / zoom,
                                top: (targets[0].getBoundingClientRect().top - viewportRef.current.getBoundingClientRect().top) / zoom,
                                width: targets[0].offsetWidth,
                                height: 0,
                            }}>
                                <div className={classes.toolbarInner}>
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

                <div className={classes.controlsOverlay}>
                    <div className={classes.zoomBadge}>{Math.round(zoom * 100)}%</div>
                    <button onClick={() => setZoom(1)} className={classes.btnPrimary}>Reset</button>
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
        </BlockProvider>
    )
}

const EditModal = ({data, onClose, onSave}) => {
    const [val, setVal] = useState('');
    return (
        <div className={classes.modalOverlay} onClick={onClose}>
            <div className={classes.modalContent} onClick={e => e.stopPropagation()}>
                <div className={classes.modalLabel}>Edit {data.type} {data.side}</div>
                <input
                    autoFocus
                    className={classes.modalInput}
                    placeholder="e.g. 20 or auto"
                    value={val}
                    onChange={e => setVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && onSave(val)}
                />
                <div className={classes.modalActions}>
                    <button onClick={onClose} className={classes.btnSecondary}>Cancel</button>
                    <button onClick={() => onSave(val)} className={classes.btnPrimary} style={{ flex: 1 }}>Save</button>
                </div>
            </div>
        </div>
    );
};
div>
        </div>
    );
};

const btnStyle = {
    background: COLORS.primary,
    border: 'none',
    color: 'white',
    padding: '5px 10px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700
}