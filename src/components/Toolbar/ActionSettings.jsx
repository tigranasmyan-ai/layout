import React, { useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { ToolbarButton } from './ToolbarUI';

export const ActionSettings = ({ blockId, onAddBlock }) => {
    const [showMultiAdd, setShowMultiAdd] = useState(false);

    return (
        <div style={{ display: 'flex', gap: 2, background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: 2 }}>
            <ToolbarButton onClick={() => onAddBlock(blockId)} highlight="#22c55e" title="Add 1 Block">
                <IconPlus size={16} strokeWidth={3} />
            </ToolbarButton>
            <div style={{ position: 'relative' }}>
                <ToolbarButton onClick={() => setShowMultiAdd(!showMultiAdd)} active={showMultiAdd} highlight="#22c55e" title="Multi-Add">
                    <span style={{ fontSize: 10, fontWeight: 800 }}>+N</span>
                </ToolbarButton>
                {showMultiAdd && (
                    <div style={{
                        position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                        background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                        padding: 4, display: 'flex', gap: 4, boxShadow: '0 10px 20px rgba(0,0,0,0.4)', zIndex: 3001
                    }}>
                        {[2, 3, 4, 5, 10].map(n => (
                            <ToolbarButton key={n} onClick={() => { onAddBlock(blockId, n); setShowMultiAdd(false); }} highlight="#22c55e">
                                <span style={{ fontSize: 10, fontWeight: 900 }}>{n}</span>
                            </ToolbarButton>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
