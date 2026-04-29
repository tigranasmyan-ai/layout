import React from 'react';
import { Divider, SizeInput } from '@components/Toolbar/ToolbarUI';
import { FlexSettings } from '@components/Toolbar/FlexSettings';
import { ActionSettings } from '@components/Toolbar/ActionSettings';
import classes from './FloatingToolbar.module.css';

/**
 * FloatingToolbar - Главная плавающая панель управления блоком.
 * Разделена на под-компоненты для удобства поддержки и чистоты кода.
 */
export default function FloatingToolbar({ 
    block, zoom, hasChildren, hasContent, onUpdateMeta, onUpdateSize, onAddBlock 
}) {
    if (!block) return null;
    const invZoom = 1 / zoom;

    return (
        <div 
            className={classes.toolbar}
            style={{
                transform: `translateY(calc(-100% - 45px)) scale(${invZoom})`,
                transformOrigin: 'bottom center',
            }} 
            onMouseDown={e => e.stopPropagation()}
        >
            
            {/* 1. Кнопки добавления блоков */}
            <ActionSettings blockId={block.id} onAddBlock={onAddBlock} />
            
            <Divider />

            {/* 2. Размеры блока */}
            <div className={classes.sizeInputs}>
                <SizeInput label="W" value={block.w} onChange={(val) => onUpdateSize('w', val)} />
                <SizeInput label="H" value={block.h} onChange={(val) => onUpdateSize('h', val)} />
            </div>

            {/* 3. Настройки Flexbox (показываем только если есть контент) */}
            {hasContent && (
                <FlexSettings meta={block.meta} onUpdateMeta={onUpdateMeta} />
            )}
        </div>
    );
}
