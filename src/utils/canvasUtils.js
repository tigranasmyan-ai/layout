/**
 * Группирует блоки по их parentId.
 */
export const groupBlocksByParent = (blocks) => {
    const map = {};
    if (Array.isArray(blocks)) {
        blocks.forEach(b => {
            if (!b) return;
            const pid = b.parentId || 'root';
            if (!map[pid]) map[pid] = [];
            map[pid].push(b);
        });
    }
    return map;
};
