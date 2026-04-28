import React from 'react';
import { IconPlus } from '@tabler/icons-react';
import { COLORS } from '../constants';
import FloatingToolbar from './FloatingToolbar';

export default function Block({ 
    block, blocks, blocksByParent, selectedIds, isPanning, zoom, isTransforming,
    onSelect, onUpdateMeta, onUpdateSize, onAddBlock, onStartDrag, onSetAuto, onEdit, onFill
}) {
    const isSelected = selectedIds.includes(block.id);
    const m = block.meta || {};
    const children = blocksByParent[block.id] || [];

    const style = {
        position: block.parentId ? 'relative' : 'absolute',
        left: block.parentId ? undefined : block.x,
        top: block.parentId ? undefined : block.y,
        width: typeof block.w === 'number' ? `${block.w}px` : block.w,
        height: typeof block.h === 'number' ? `${block.h}px` : block.h,
        display: 'flex',
        flexDirection: m.direction || 'row',
        justifyContent: m.justify || 'flex-start',
        alignItems: m.align || 'flex-start',
        flexWrap: m.wrap || 'nowrap',
        gap: `${m.gap || 0}px`,
        padding: `${m.padding?.top || 0}px ${m.padding?.right || 0}px ${m.padding?.bottom || 0}px ${m.padding?.left || 0}px`,
        margin: `${m.margin?.top || 0}px ${m.margin?.right || 0}px ${m.margin?.bottom || 0}px ${m.margin?.left || 0}px`,
        flexGrow: m.flexGrow || 0,
        flexShrink: m.flexShrink || 0,
        flexBasis: m.flexBasis || 'auto',
        alignSelf: m.alignSelf || 'auto',
        backgroundColor: m.bgColor || 'rgba(255,255,255,0.05)',
        backgroundImage: m.bgImage ? `url(${m.bgImage})` : 'none',
        backgroundSize: m.bgSize || 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: `${m.borderRadius || 0}px`,
        border: isSelected ? '2px solid #4f46e5' : `1px solid ${m.borderColor || 'rgba(255,255,255,0.1)'}`,
        color: m.color || '#ffffff',
        fontFamily: m.fontFamily || 'Inter, sans-serif',
        fontSize: m.fontSize || '16px',
        fontWeight: m.fontWeight || '400',
        textAlign: m.textAlign || 'left',
        boxShadow: isSelected ? '0 0 20px rgba(79, 70, 229, 0.3)' : 'none',
        zIndex: isSelected ? 100 : 1,
        transition: isTransforming ? 'none' : 'all 0.1s ease-out',
        cursor: isPanning ? 'grab' : 'pointer',
        boxSizing: 'border-box',
        overflow: m.overflow || 'visible',
    };

    return (
        <div data-id={block.id} style={style} onClick={(e) => { e.stopPropagation(); onSelect(block.id); }}>
            {/* Текстовое содержимое */}
            {m.text && (
                <div style={{ width: '100%', pointerEvents: 'none', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {m.text}
                </div>
            )}

            {/* Дочерние блоки */}
            {children.map(child => (
                <Block 
                    key={child.id} block={child} blocks={blocks} blocksByParent={blocksByParent}
                    selectedIds={selectedIds} isPanning={isPanning} zoom={zoom} isTransforming={isTransforming}
                    onSelect={onSelect} onUpdateMeta={onUpdateMeta} onUpdateSize={onUpdateSize}
                    onAddBlock={onAddBlock} onStartDrag={onStartDrag} onSetAuto={onSetAuto}
                    onEdit={onEdit} onFill={onFill}
                />
            ))}

            {/* ИНТЕРАКТИВНЫЙ СЛОЙ */}
            {isSelected && !isPanning && (
                <>
                    {/* Floating Toolbar */}
                    <FloatingToolbar 
                        block={block} 
                        zoom={zoom} 
                        hasChildren={children.length > 0}
                        hasContent={children.length > 0 || !!m.text}
                        onUpdateMeta={(key, val) => onUpdateMeta(block.id, key, val)}
                        onUpdateSize={(key, val) => onUpdateSize(block.id, key, val)}
                        onAddBlock={onAddBlock}
                    />

                    {/* Кнопки добавления */}
                    <AddBtn pos="center" onClick={() => onAddBlock(block.id)} />
                    <AddBtn pos="right" onClick={() => onAddBlock(block.parentId)} />
                    <AddBtn pos="bottom" onClick={() => onAddBlock(block.parentId)} />

                    {/* Зоны отступов (только для вложенных блоков) */}
                    {block.parentId && (
                        <SpacingZones block={block} onStartDrag={onStartDrag} onSetAuto={onSetAuto} onEdit={onEdit} zoom={zoom} />
                    )}
                </>
            )}
        </div>
    );
}

const AddBtn = ({ pos, onClick }) => {
    const base = {
        position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: '#4f46e5',
        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', zIndex: 200, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        transition: 'transform 0.2s'
    };
    const styles = {
        center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
        right: { top: '50%', right: -10, transform: 'translateY(-50%)' },
        bottom: { bottom: -10, left: '50%', transform: 'translateX(-50%)' }
    };
    return (
        <button style={{ ...base, ...styles[pos] }} onClick={(e) => { e.stopPropagation(); onClick(); }} className="hover-scale">
            <IconPlus size={14} strokeWidth={3} />
        </button>
    );
};

const SpacingZones = ({ block, onStartDrag, onSetAuto, onEdit, zoom }) => {
    const m = block.meta || {};
    const sides = ['top', 'right', 'bottom', 'left'];
    return (
        <>
            {sides.map(side => (
                <React.Fragment key={side}>
                    <div className="spacing-zone margin-zone" style={getZoneStyle('margin', side, zoom)} onMouseDown={(e) => onStartDrag(block.id, 'margin', side, e)} onDoubleClick={(e) => { e.stopPropagation(); onEdit(block.id, 'margin', side); }}>
                        <AutoBtn active={m.margin?.[side] === 'auto'} onClick={() => onSetAuto(block.id, side)} />
                    </div>
                    <div className="spacing-zone padding-zone" style={getZoneStyle('padding', side, zoom)} onMouseDown={(e) => onStartDrag(block.id, 'padding', side, e)} onDoubleClick={(e) => { e.stopPropagation(); onEdit(block.id, 'padding', side); }} />
                </React.Fragment>
            ))}
        </>
    );
};

const AutoBtn = ({ active, onClick }) => (
    <div onClick={(e) => { e.stopPropagation(); onClick(); }} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 12, height: 12, borderRadius: 2, border: '1px solid #f59e0b', background: active ? '#f59e0b' : 'transparent', cursor: 'pointer', pointerEvents: 'auto' }} title="Set Auto" />
);

const getZoneStyle = (type, side, zoom) => {
    const isMargin = type === 'margin';
    const size = (isMargin ? 20 : 15) / zoom;
    const base = { position: 'absolute', zIndex: 150 };
    if (side === 'top') return { ...base, top: isMargin ? -size : 0, left: 0, width: '100%', height: size };
    if (side === 'bottom') return { ...base, bottom: isMargin ? -size : 0, left: 0, width: '100%', height: size };
    if (side === 'left') return { ...base, left: isMargin ? -size : 0, top: 0, width: size, height: '100%' };
    if (side === 'right') return { ...base, right: isMargin ? -size : 0, top: 0, width: size, height: '100%' };
    return base;
};
