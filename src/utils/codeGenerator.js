/**
 * Генерирует древовидную структуру из плоского списка блоков
 */
export const blocksToTree = (items) => {
    const map = {};
    items.forEach(b => {
        if (b) map[b.id] = { ...b, children: [] };
    });
    const roots = [];
    items.forEach(b => {
        if (b) {
            if (b.parentId && map[b.parentId]) {
                map[b.parentId].children.push(map[b.id]);
            } else {
                roots.push(map[b.id]);
            }
        }
    });
    return roots;
};

/**
 * Генерирует HTML код на основе дерева блоков
 */
export const generateHTML = (nodes, indent = "") => {
    return nodes.map(n => {
        const name = `box-${n.id}`;
        const tag = n.meta?.tag || 'div';
        const text = n.meta?.text || '';
        
        let children = n.children?.length ? `\n${generateHTML(n.children, indent + "  ")}${indent}` : "";
        const content = text ? (children ? `\n${indent}  ${text}${children}` : text) : children;
        
        return `${indent}<${tag} class="${name}">${content}</${tag}>`;
    }).join("\n");
};

/**
 * Генерирует CSS код на основе дерева блоков
 */
export const generateCSS = (nodes) => {
    let out = '';
    const traverse = (items) => {
        items.forEach(n => {
            const m = n.meta || {};
            const p = m.padding || { top: 0, right: 0, bottom: 0, left: 0 };
            const mar = m.margin || { top: 0, right: 0, bottom: 0, left: 0 };

            out += `.box-${n.id} {\n`;
            out += `  display: flex;\n`;
            out += `  flex-direction: ${m.direction || 'row'};\n`;
            out += `  justify-content: ${m.justify || 'flex-start'};\n`;
            out += `  align-items: ${m.align || 'flex-start'};\n`;
            out += `  flex-wrap: ${m.wrap || 'nowrap'};\n`;
            out += `  gap: ${m.gap || 0}px;\n`;

            if (m.flexGrow !== undefined) out += `  flex-grow: ${m.flexGrow};\n`;
            if (m.flexBasis !== undefined) out += `  flex-basis: ${m.flexBasis};\n`;
            if (m.alignSelf && m.alignSelf !== 'auto') out += `  align-self: ${m.alignSelf};\n`;

            const w = m.w || n.w;
            const h = m.h || n.h;
            if (w !== undefined) out += `  width: ${typeof w === 'number' ? w + 'px' : w};\n`;
            if (h !== undefined) out += `  height: ${typeof h === 'number' ? h + 'px' : h};\n`;

            out += `  padding: ${p.top}px ${p.right}px ${p.bottom}px ${p.left}px;\n`;
            out += `  margin: ${mar.top}px ${mar.right}px ${mar.bottom}px ${mar.left}px;\n`;
            
            if (m.customCss) out += `  ${m.customCss}\n`;
            
            out += `}\n\n`;
            if (n.children?.length) traverse(n.children);
        });
    };
    traverse(nodes);
    return out;
};
