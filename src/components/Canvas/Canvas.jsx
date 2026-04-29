import React, { useRef, useState, useMemo, useEffect } from 'react';
import Moveable from 'react-moveable';
import InfiniteViewer from "react-infinite-viewer";
import Block from '@components/Block';
import classes from './Canvas.module.css';
import { 
    useCanvasInteraction, useSpacingLogic, useMoveableHandlers, 
    useSelectionTargets, useCanvasActions 
} from '@hooks';
import EmptyState from '@components/EmptyState';
import BlueprintImg from '@components/BlueprintImg';
import FloatingToolbar from '@components/FloatingToolbar';
import { BlockProvider } from '@components/BlockContext';
import { groupBlocksByParent } from '@utils';

// Custom Ability for Spacing (could also be moved to a file)
const SpacingAbility = {
    name: "spacing",
    render(moveable, React) { return null; }
};

export default function Canvas({ 
    blocks, setBlocks, selectedId, onSelect, onAddBlock, blueprint, onUpdateBlueprint 
}) {
    const viewerRef = useRef(null);
    const moveableRef = useRef(null);
    const viewportRef = useRef(null);
    const [zoom, setZoom] = useState(1);
    const [isTransforming, setIsTransforming] = useState(false);

    // 1. Извлечение логики в хуки
    const { isPanning } = useCanvasInteraction(zoom, setZoom, setBlocks);
    const { startDraggingSpace, draggingType, isInteracting } = useSpacingLogic(zoom, setBlocks, blocks);
    const { handleResize, handleResizeEnd } = useMoveableHandlers({
        blocks, setBlocks, onUpdateBlueprint, setIsTransforming
    });
    
    const selectedIds = useMemo(() => String(selectedId || '').split(',').filter(Boolean), [selectedId]);
    const targets = useSelectionTargets(selectedId, selectedIds, blocks);
    const { updateMeta, handleSize, handleFill } = useCanvasActions(blocks, setBlocks);

    // 2. Группировка блоков
    const blocksByParent = useMemo(() => groupBlocksByParent(blocks), [blocks]);

    // 3. Синхронизация Moveable
    useEffect(() => {
        if (moveableRef.current) moveableRef.current.updateRect();
    }, [blocks, zoom, targets]);

    // 4. Подготовка действий для контекста
    const blockActions = useMemo(() => ({
        onSelect, updateMeta, handleSize, handleFill, onAddBlock,
        onStartDrag: startDraggingSpace,
        onSetAuto: (id, side) => updateMeta(id, 'margin', {
            ...(blocks.find(b => b && b.id === id)?.meta?.margin || {}),
            [side]: 'auto'
        }),
    }), [onSelect, updateMeta, handleSize, handleFill, onAddBlock, startDraggingSpace, blocks]);

    return (
        <BlockProvider actions={blockActions}>
            <div 
                className={classes.canvasMainContainer}
                onMouseDown={(e) => !isPanning && onSelect(null)}
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
                {blocks.length === 0 && <EmptyState onAdd={() => onAddBlock(null)}/>}

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
                                isTransforming={isTransforming} draggingType={draggingType}
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
                            resizable={targets.length === 1} useResizeObserver={true}
                            renderDirections={["n", "nw", "ne", "s", "sw", "se", "w", "e"]}
                            abilities={[SpacingAbility]} spacing={true}
                            keepRatio={targets.length === 1 && targets[0]?.id === 'blueprint-img'}
                            onResizeStart={() => setIsTransforming(true)}
                            onResize={handleResize} onResizeEnd={handleResizeEnd}
                        />
                    </div>
                </InfiniteViewer>

                <div className={classes.controlsOverlay}>
                    <div className={classes.zoomBadge}>{Math.round(zoom * 100)}%</div>
                    <button onClick={() => setZoom(1)} className={classes.btnPrimary}>Reset</button>
                </div>
            </div>
        </BlockProvider>
    );
}