import React from 'react';
import { 
    IconArrowsHorizontal, 
    IconArrowsVertical,
    IconLayoutAlignLeft,
    IconLayoutAlignCenter,
    IconLayoutAlignRight,
    IconLayoutAlignTop,
    IconLayoutAlignMiddle,
    IconLayoutAlignBottom,
    IconLayoutDistributeHorizontal,
    IconFold
} from '@tabler/icons-react';
import { ToolbarButton, Divider } from './ToolbarUI';

export const FlexSettings = ({ meta, onUpdateMeta }) => {
    const { 
        direction = 'row', justify = 'flex-start', align = 'flex-start', wrap = 'nowrap'
    } = meta || {};

    return (
        <>
            <Divider />
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: 6, padding: 2 }}>
                <ToolbarButton active={direction === 'row'} onClick={() => onUpdateMeta('direction', 'row')} title="Row"><IconArrowsHorizontal size={14}/></ToolbarButton>
                <ToolbarButton active={direction === 'column'} onClick={() => onUpdateMeta('direction', 'column')} title="Column"><IconArrowsVertical size={14}/></ToolbarButton>
                <Divider />
                <ToolbarButton active={wrap === 'wrap'} onClick={() => onUpdateMeta('wrap', wrap === 'wrap' ? 'nowrap' : 'wrap')} title="Toggle Wrap">
                    <IconFold size={14} style={{ transform: wrap === 'wrap' ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
                </ToolbarButton>
            </div>
            
            <Divider />
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: 6, padding: 2 }}>
                <ToolbarButton active={justify === 'flex-start'} onClick={() => onUpdateMeta('justify', 'flex-start')}><IconLayoutAlignLeft size={14}/></ToolbarButton>
                <ToolbarButton active={justify === 'center'} onClick={() => onUpdateMeta('justify', 'center')}><IconLayoutAlignCenter size={14}/></ToolbarButton>
                <ToolbarButton active={justify === 'flex-end'} onClick={() => onUpdateMeta('justify', 'flex-end')}><IconLayoutAlignRight size={14}/></ToolbarButton>
                <ToolbarButton active={justify === 'space-between'} onClick={() => onUpdateMeta('justify', 'space-between')}><IconLayoutDistributeHorizontal size={14}/></ToolbarButton>
            </div>
            
            <Divider />
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: 6, padding: 2 }}>
                <ToolbarButton active={align === 'flex-start'} onClick={() => onUpdateMeta('align', 'flex-start')}><IconLayoutAlignTop size={14}/></ToolbarButton>
                <ToolbarButton active={align === 'center'} onClick={() => onUpdateMeta('align', 'center')}><IconLayoutAlignCenter size={14}/></ToolbarButton>
                <ToolbarButton active={align === 'flex-end'} onClick={() => onUpdateMeta('align', 'flex-end')}><IconLayoutAlignBottom size={14}/></ToolbarButton>
            </div>
        </>
    );
};
