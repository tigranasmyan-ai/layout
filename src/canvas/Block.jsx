import React from 'react';
import { COLORS } from '../constants';
import { parseCustomCss } from '../utils';
import FloatingToolbar from './FloatingToolbar';
import SpacingControls from './SpacingControls';

const Block = ({ 
    block, 
    blocks, 
    blocksByParent, 
    selectedIds, 
    isPanning, 
    onSelect, 
    onUpdateMeta, 
    onUpdateSize, 
    onAddBlock, 
    onApplyPreset, 
    onStartDrag, 
    onSetAuto, 
    onEdit,
    onHandleEdgeFill,
    zoom 
}) => {
    if (!block) return null;
    
    const children = blocksByParent[block.id] || [];
    const isSelected = selectedIds.includes(block.id);
    const isRoot = !block.parentId;
    const m = block.meta?.margin || { top: 0, right: 0, bottom: 0, left: 0 };
    const p = block.meta?.padding || { top: 0, right: 0, bottom: 0, left: 0 };
    const customStyles = parseCustomCss(block.meta?.customCss);

    const parent = blocks.find(p => p.id === block.parentId);
    const parentDir = parent?.meta?.direction || 'row';

    const flexStyles = {
        flex: isRoot ? 'none' : (block.meta?.flex || '0 1 auto'),
        alignSelf: isRoot ? 'auto' : (block.meta?.alignSelf || 'auto'),
        minWidth: 0, minHeight: 0,
        maxWidth: block.meta?.maxWidth || 'none',
        maxHeight: block.meta?.maxHeight || 'none'
    };

    const width = block.w || (flexStyles.alignSelf === 'stretch' && parentDir === 'column' ? '100%' : 100);
    const height = block.h || (flexStyles.alignSelf === 'stretch' && parentDir === 'row' ? '100%' : 100);

    return (
        <div 
            key={block.id} 
            data-id={block.id} 
            className={`flex-block target ${isSelected ? 'selected' : ''}`}
            onMouseDown={(e) => {
                if (isPanning) return;
                e.stopPropagation();
                if (e.shiftKey) {
                    const currentIds = selectedIds;
                    if (currentIds.includes(block.id)) onSelect(currentIds.filter(id => id !== block.id).join(',') || null);
                    else onSelect([...currentIds, block.id].join(','));
                } else {
                    if (!isSelected || selectedIds.length > 1) onSelect(block.id);
                }
            }}
            style={{
                position: block.parentId ? 'relative' : 'absolute',
                left: block.parentId ? undefined : block.x,
                top: block.parentId ? undefined : block.y,
                width, height,
                display: 'flex', 
                flexDirection: block.meta?.direction || 'row', 
                flexWrap: block.meta?.wrap || 'nowrap',
                justifyContent: block.meta?.justify || 'flex-start', 
                alignItems: block.meta?.align || 'flex-start',
                gap: `${block.meta?.gap || 0}px`,
                paddingTop: p.top, paddingRight: p.right, paddingBottom: p.bottom, paddingLeft: p.left,
                marginTop: m.top, marginRight: m.right, marginBottom: m.bottom, marginLeft: m.left,
                background: 'rgba(255, 255, 255, 0.03)', 
                border: isSelected ? `2px solid ${COLORS.selected}` : `1px solid ${COLORS.border}`,
                boxSizing: 'border-box',
                zIndex: isRoot ? (isSelected ? 100 : 10) : 'auto',
                borderRadius: 4, 
                cursor: isPanning ? 'grab' : 'pointer',
                ...flexStyles,
                ...customStyles
            }}
        >
            {isSelected && selectedIds.length === 1 && (
                <>
                    <FloatingToolbar 
                        block={block} zoom={zoom} 
                        hasChildren={children.length > 0}
                        onUpdateMeta={(key, val) => onUpdateMeta(block.id, key, val)} 
                        onUpdateSize={(key, val) => onUpdateSize(block.id, key, val)}
                        onAddBlock={onAddBlock}
                        onToggleCss={() => {}} 
                        onApplyPreset={(preset) => onApplyPreset(block.id, preset)}
                    />
                    <SpacingControls 
                        block={block} zoom={zoom} isSelected={isSelected} isRoot={isRoot}
                        onStartDrag={(e, type, side, val) => onStartDrag(e, block.id, type, side, val)}
                        onSetAuto={(side) => onSetAuto(block.id, side)}
                        onEdit={(type, side) => onEdit(block.id, type, side)}
                    />
                    {!isRoot && (
                        <>
                            <div onClick={(e) => { e.stopPropagation(); onHandleEdgeFill(block, 'h'); }} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, cursor: 'ns-resize', zIndex: 2000 }} />
                            <div onClick={(e) => { e.stopPropagation(); onHandleEdgeFill(block, 'h'); }} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, cursor: 'ns-resize', zIndex: 2000 }} />
                            <div onClick={(e) => { e.stopPropagation(); onHandleEdgeFill(block, 'w'); }} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, cursor: 'ew-resize', zIndex: 2000 }} />
                            <div onClick={(e) => { e.stopPropagation(); onHandleEdgeFill(block, 'w'); }} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, cursor: 'ew-resize', zIndex: 2000 }} />
                        </>
                    )}
                </>
            )}
            {children.map(child => (
                <Block 
                    key={child.id}
                    block={child}
                    blocks={blocks}
                    blocksByParent={blocksByParent}
                    selectedIds={selectedIds}
                    isPanning={isPanning}
                    onSelect={onSelect}
                    onUpdateMeta={onUpdateMeta}
                    onUpdateSize={onUpdateSize}
                    onAddBlock={onAddBlock}
                    onApplyPreset={onApplyPreset}
                    onStartDrag={onStartDrag}
                    onSetAuto={onSetAuto}
                    onEdit={onEdit}
                    onHandleEdgeFill={onHandleEdgeFill}
                    zoom={zoom}
                />
            ))}
        </div>
    );
};

export default Block;
