import React from 'react';
import { useBlockContext } from '@components/BlockContext';
import { getBlockStyles } from '@utils';
import { SpacingZones } from '@components/SpacingManager';
import classes from './Block.module.css';

/**
 * Block - Основной компонент отрисовки блока.
 * Используем React.memo для предотвращения лишних рендеров при изменении других блоков.
 */
const Block = React.memo(({ 
    block, blocksByParent, selectedIds, isPanning, zoom, isTransforming
}) => {
    if (!block) return null;
    
    // Получаем действия из контекста
    const { 
        onSelect, onStartDrag, onEdit, onSetAuto 
    } = useBlockContext();

    const isSelected = selectedIds.includes(block.id);
    const m = block.meta || {};
    const children = blocksByParent[block.id] || [];
    const iz = 1 / zoom;

    // Стили вычисляются только при изменении данных этого конкретного блока
    const blockStyle = getBlockStyles(block, m, isSelected, iz, isTransforming);

    return (
        <div 
            className={classes.block}
            style={blockStyle} 
            onClick={(e) => { e.stopPropagation(); onSelect(block.id); }}
            data-id={block.id}
        >
            {/* Текстовое содержимое */}
            {m.text && (
                <div 
                    className={classes.textContent}
                    style={{ 
                        '--text-color': m.color || 'white',
                        '--font-size': m.fontSize || 'inherit',
                        '--font-weight': m.fontWeight || 'normal'
                    }}
                >
                    {m.text}
                </div>
            )}

            {/* Инструменты управления отступами (только для выделенного блока) */}
            {isSelected && (
                <SpacingZones 
                    block={block} zoom={zoom} 
                    onStartDrag={onStartDrag} onSetAuto={onSetAuto} onEdit={onEdit}
                />
            )}

            {/* Рекурсивный рендеринг вложенных блоков */}
            {children.map(child => child && (
                <Block 
                    key={child.id} 
                    block={child} 
                    blocksByParent={blocksByParent}
                    selectedIds={selectedIds} 
                    isPanning={isPanning} 
                    zoom={zoom} 
                    isTransforming={isTransforming}
                />
            ))}
        </div>
    );
}, (prev, next) => {
    // Кастомная функция сравнения для максимальной точности
    // Блок должен рендериться ТОЛЬКО если изменились его данные, статус выделения или глобальные параметры (зум, панорамирование)
    const isSelectedPrev = prev.selectedIds.includes(prev.block.id);
    const isSelectedNext = next.selectedIds.includes(next.block.id);
    
    return prev.block === next.block && 
           prev.blocksByParent[prev.block.id] === next.blocksByParent[next.block.id] &&
           prev.selectedIds === next.selectedIds &&
           prev.zoom === next.zoom &&
           prev.isPanning === next.isPanning &&
           prev.isTransforming === next.isTransforming;
});

export default Block;
