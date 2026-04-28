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
    onStartDrag, 
    onSetAuto, 
    onEdit,
    onFill,
    isTransforming,
    zoom 
}) => {
    if (!block) return null;
    
    const children = blocksByParent[block.id] || [];
    const isSelected = selectedIds.includes(block.id);
    const isRoot = !block.parentId;
    const m = block.meta?.margin || { top: 0, right: 0, bottom: 0, left: 0 };
    const p = block.meta?.padding || { top: 0, right: 0, bottom: 0, left: 0 };
    const customStyles = parseCustomCss(block.meta?.customCss);

    // Используем индивидуальные свойства, чтобы они не конфликтовали с сокращением flex
    const flexStyles = {
        flexGrow: isRoot ? 0 : (block.meta?.flexGrow || 0),
        flexShrink: 0, // Запрещаем браузеру насильно сжимать блок
        flexBasis: isRoot ? 'auto' : (block.meta?.flexBasis || 'auto'),
        alignSelf: isRoot ? 'auto' : (block.meta?.alignSelf || 'auto'),
        minWidth: 'auto', minHeight: 'auto',
        maxWidth: block.meta?.maxWidth || 'none',
        maxHeight: block.meta?.maxHeight || 'none'
    };

    const width = block.meta?.w || block.w;
    const height = block.meta?.h || block.h;
    const Tag = block.meta?.tag || 'div';
    const isTextTag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].includes(Tag);

    return (
        <Tag 
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
                paddingTop: p.top === 'auto' ? 'auto' : (parseInt(p.top) || 0), 
                paddingRight: p.right === 'auto' ? 'auto' : (parseInt(p.right) || 0), 
                paddingBottom: p.bottom === 'auto' ? 'auto' : (parseInt(p.bottom) || 0), 
                paddingLeft: p.left === 'auto' ? 'auto' : (parseInt(p.left) || 0),
                marginTop: m.top === 'auto' ? 'auto' : (parseInt(m.top) || 0), 
                marginRight: m.right === 'auto' ? 'auto' : (parseInt(m.right) || 0), 
                marginBottom: m.bottom === 'auto' ? 'auto' : (parseInt(m.bottom) || 0), 
                marginLeft: m.left === 'auto' ? 'auto' : (parseInt(m.left) || 0),
                background: isTextTag ? 'transparent' : 'rgba(255, 255, 255, 0.03)', 
                border: isSelected ? `2px solid ${COLORS.selected}` : (isTextTag ? '1px dashed rgba(255,255,255,0.1)' : `1px solid ${COLORS.border}`),
                boxSizing: 'border-box',
                zIndex: isRoot ? (isSelected ? 100 : 10) : 'auto',
                borderRadius: 4, 
                cursor: isPanning ? 'grab' : 'pointer',
                color: isTextTag ? 'white' : 'inherit',
                fontSize: isTextTag ? (block.meta?.fontSize || 16) : 'inherit',
                fontWeight: isTextTag ? (block.meta?.fontWeight || 400) : 'inherit',
                textAlign: block.meta?.textAlign || 'inherit',
                backgroundImage: block.meta?.bgImage ? `url(${block.meta.bgImage})` : 'none',
                backgroundSize: block.meta?.bgSize || 'cover',
                backgroundPosition: block.meta?.bgPosition || 'center',
                backgroundRepeat: 'no-repeat',
                outline: 'none',
                ...flexStyles,
                ...customStyles
            }}
        >
            {isSelected && selectedIds.length === 1 && (
                <div contentEditable={false} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 0, pointerEvents: 'none' }}>
                    <FloatingToolbar 
                        block={block} zoom={zoom} 
                        hasChildren={children.length > 0}
                        hasContent={children.length > 0 || !!block.meta?.text}
                        onUpdateMeta={(key, val) => onUpdateMeta(block.id, key, val)} 
                        onUpdateSize={(key, val) => onUpdateSize(block.id, key, val)}
                        onAddBlock={onAddBlock}
                    />
                    <div style={{ pointerEvents: isTransforming ? 'none' : 'auto' }}>
                        <SpacingControls 
                            block={block} zoom={zoom} isSelected={isSelected} isRoot={isRoot}
                            onStartDrag={(e, type, side, val) => onStartDrag(e, block.id, type, side, val)}
                            onSetAuto={(side) => onSetAuto(block.id, side)}
                            onEdit={(type, side) => onEdit(block.id, type, side)}
                            onFill={(side) => onFill(block.id, side)}
                        />
                    </div>
                </div>
            )}

            {isTextTag ? block.meta?.text : children.map(child => (
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
                    onStartDrag={onStartDrag}
                    onSetAuto={onSetAuto}
                    onEdit={onEdit}
                    onFill={onFill}
                    zoom={zoom}
                />
            ))}
        </Tag>
    );
};

export default Block;
