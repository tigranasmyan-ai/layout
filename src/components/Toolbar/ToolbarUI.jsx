import React from 'react';

export const Divider = () => (
    <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', margin: '0 2px' }} />
);

export const ToolbarButton = ({ children, active, onClick, highlight = '#4f46e5', title }) => {
    return (
        <div 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            title={title}
            style={{
                width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '4px',
                cursor: 'pointer',
                background: active ? highlight : 'transparent',
                color: active ? 'white' : 'rgba(255,255,255,0.6)',
                transition: 'all 0.2s',
                position: 'relative'
            }}
            onMouseEnter={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
        >
            {children}
        </div>
    );
};

export const SizeInput = ({ label, value, onChange }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.4)' }}>{label}</span>
            <input 
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{
                    width: 35, background: 'transparent', border: 'none', outline: 'none',
                    color: 'white', fontSize: 11, fontWeight: 700, padding: 0
                }}
            />
        </div>
    );
};
