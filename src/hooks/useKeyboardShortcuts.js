import { useEffect } from 'react';

/**
 * Хук для глобальных горячих клавиш
 */
export function useKeyboardShortcuts({ selectedId, deleteBlocks, onUndo, onRedo }) {
    useEffect(() => {
        const handleKeys = (e) => {
            // Delete / Backspace
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
                deleteBlocks(selectedId);
            }

            // Undo / Redo (Cmd+Z / Cmd+Shift+Z)
            if (e.metaKey || e.ctrlKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) onRedo();
                    else onUndo();
                }
            }
        };

        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [selectedId, deleteBlocks, onUndo, onRedo]);
}
