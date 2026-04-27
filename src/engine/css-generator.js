export const buildCSSObject = (nodes) => {
    let styles = {};

    const traverse = (n) => {
        let rule = {};
        const meta = n.meta || {};
        const name = n.id.replace('shape:', 'box-');

        // Display Flex
        if (n.children?.length || meta.isGrow) {
            rule['display'] = 'flex';
        }

        // Flex Direction
        if (meta.direction === 'column') {
            rule['flex-direction'] = 'column';
        }

        // Flex Wrap
        if (meta.isWrap) {
            rule['flex-wrap'] = 'wrap';
        }

        // Justify Content
        if (meta.justify && meta.justify !== 'flex-start') {
            rule['justify-content'] = meta.justify;
        }

        // Align Items
        if (meta.align && meta.align !== 'flex-start') {
            rule['align-items'] = meta.align;
        }

        // Gap
        if (meta.gap && meta.gap !== 0) {
            rule['gap'] = `${meta.gap}px`;
        }

        // Background Image
        if (meta.bgImage) {
            rule['background-image'] = `url('${meta.bgImage}')`;
            rule['background-size'] = 'cover';
            rule['background-position'] = 'center';
        }

        // Width logic
        if (!meta.isAutoW) {
            if (meta.isFullW) {
                rule['width'] = '100%';
            } else if (!meta.isGrow) {
                rule['width'] = `${Math.round(n.w)}px`;
            }
        }

        // Height logic
        if (!meta.isAutoH) {
            if (meta.isFullH) {
                rule['height'] = '100%';
            } else if (!meta.isGrow) {
                rule['height'] = `${Math.round(n.h)}px`;
            }
        }

        // Flex Grow
        if (meta.isGrow) {
            rule['flex-grow'] = '1';
        }

        // Padding (Granular)
        const pT = meta.paddingTop ?? meta.padding ?? 0;
        const pR = meta.paddingRight ?? meta.padding ?? 0;
        const pB = meta.paddingBottom ?? meta.padding ?? 0;
        const pL = meta.paddingLeft ?? meta.padding ?? 0;
        
        if (pT !== 0 || pR !== 0 || pB !== 0 || pL !== 0) {
            if (pT === pR && pT === pB && pT === pL) rule['padding'] = `${pT}px`;
            else if (pT === pB && pR === pL) rule['padding'] = `${pT}px ${pR}px`;
            else rule['padding'] = `${pT}px ${pR}px ${pB}px ${pL}px`;
        }

        // Margin (Granular + Auto)
        const mT = meta.mtA ? 'auto' : `${meta.marginTop ?? meta.margin ?? 0}px`;
        const mR = meta.mrA ? 'auto' : `${meta.marginRight ?? meta.margin ?? 0}px`;
        const mB = meta.mbA ? 'auto' : `${meta.marginBottom ?? meta.margin ?? 0}px`;
        const mL = meta.mlA ? 'auto' : `${meta.marginLeft ?? meta.margin ?? 0}px`;

        if (mT !== '0px' || mR !== '0px' || mB !== '0px' || mL !== '0px' || meta.mtA || meta.mrA || meta.mbA || meta.mlA) {
            if (mT === mR && mT === mB && mT === mL) rule['margin'] = mT;
            else if (mT === mB && mR === mL) rule['margin'] = `${mT} ${mR}`;
            else rule['margin'] = `${mT} ${mR} ${mB} ${mL}`;
        }

        // Manual CSS overrides
        if (meta.manualCSS) {
            const lines = meta.manualCSS.split('\n');
            lines.forEach(line => {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const val = parts.slice(1).join(':').replace(';', '').trim();
                    if (key && val) rule[key] = val;
                }
            });
        }

        styles[`.${name}`] = rule;

        if (n.children?.length) {
            n.children.forEach(traverse);
        }
    };

    nodes.forEach(traverse);
    return styles;
};

export const serializeCSS = (cssObj) => {
    let cssString = '';
    for (const [selector, rules] of Object.entries(cssObj)) {
        if (Object.keys(rules).length === 0) continue;
        
        cssString += `${selector} {\n`;
        for (const [prop, val] of Object.entries(rules)) {
            cssString += `  ${prop}: ${val};\n`;
        }
        cssString += `}\n\n`;
    }
    return cssString;
};
