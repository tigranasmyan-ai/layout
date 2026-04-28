import { useEffect } from 'react';

export function useKeyboardShortcuts({ selectedId, deleteBlocks, onUndo, onRedo, onCopy, onPaste }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Игнорируем, если пользователь печатает в текстовом поле
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }

            const isMod = e.ctrlKey || e.metaKey;

            // Delete
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                deleteBlocks(selectedId);
            }

            // Undo (Ctrl+Z)
            if (isMod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
                e.preventDefault();
                onUndo();
            }

            // Redo (Ctrl+Shift+Z or Ctrl+Y)
            if ((isMod && e.shiftKey && e.key.toLowerCase() === 'z') || (isMod && e.key.toLowerCase() === 'y')) {
                e.preventDefault();
                onRedo();
            }

            // Copy (Ctrl+C)
            if (isMod && e.key.toLowerCase() === 'c') {
                e.preventDefault();
                onCopy();
            }

            // Paste (Ctrl+V)
            if (isMod && e.key.toLowerCase() === 'v') {
                e.preventDefault();
                onPaste();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, deleteBlocks, onUndo, onRedo, onCopy, onPaste]);
}
