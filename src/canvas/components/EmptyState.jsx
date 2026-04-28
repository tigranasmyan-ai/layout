import React from 'react';
import { IconPlus } from '@tabler/icons-react';

const EmptyState = ({ onAdd }) => (
    <div style={{ 
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, zIndex: 10000, pointerEvents: 'none' 
    }}>
        <div onClick={onAdd} style={{ 
            padding: '24px 48px', borderRadius: 16, background: 'rgba(79, 70, 229, 0.1)', 
            border: '2px dashed #4f46e5', color: 'white', cursor: 'pointer', 
            display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
            pointerEvents: 'auto', backdropFilter: 'blur(10px)', boxShadow: '0 0 40px rgba(79, 70, 229, 0.2)' 
        }}>
            <IconPlus size={32} strokeWidth={2.5} />
            <span style={{ fontWeight: 800, letterSpacing: 1.5, fontSize: 14 }}>CREATE FIRST CONTAINER</span>
        </div>
    </div>
);

export default EmptyState;
