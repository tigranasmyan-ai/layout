import React, { createContext, useContext } from 'react';

const BlockContext = createContext(null);

export const BlockProvider = ({ children, actions }) => {
    return (
        <BlockContext.Provider value={actions}>
            {children}
        </BlockContext.Provider>
    );
};

export const useBlockContext = () => {
    const context = useContext(BlockContext);
    if (!context) {
        throw new Error('useBlockContext must be used within a BlockProvider');
    }
    return context;
};
