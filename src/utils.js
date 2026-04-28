export function getBlockDepth(blockId, currentBlocks) {
    let depth = 0;
    if (!Array.isArray(currentBlocks)) return 0;
    let current = currentBlocks.find(b => b && b.id === blockId);
    while (current && current.parentId) {
        depth++;
        const pid = current.parentId;
        current = currentBlocks.find(b => b && b.id === pid);
    }
    return depth;
}

export function normalizeBlocks(blocks) {
    if (!Array.isArray(blocks)) return [];
    return blocks.map(b => {
        if (!b) return null;
        return {
            ...b,
            meta: {
                direction: b.meta?.direction || 'row',
                justify: b.meta?.justify || 'flex-start',
                align: b.meta?.align || 'flex-start',
                gap: b.meta?.gap || 0,
                padding: normalizeSpacing(b.meta?.padding),
                margin: normalizeSpacing(b.meta?.margin)
            }
        };
    }).filter(Boolean);
}

function normalizeSpacing(val) {
    if (typeof val === 'object' && val !== null) return val;
    const n = parseInt(val) || 0;
    return { top: n, right: n, bottom: n, left: n };
}

export function parseCustomCss(cssString) {
    if (!cssString) return {};
    const styles = {};
    const rules = cssString.split(';').filter(r => r.trim());
    rules.forEach(rule => {
        const [prop, val] = rule.split(':');
        if (prop && val) {
            const camelProp = prop.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            styles[camelProp] = val.trim();
        }
    });
    return styles;
}
