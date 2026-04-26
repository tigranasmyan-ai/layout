export const buildCSSObject = (nodes) => {
    let styles = {};

    const traverse = (n) => {
        let rule = {};

        if (n.children?.length || n.isGrow) {
            rule['display'] = 'flex';
        }
        if (n.children?.length > 0 && n.direction === 'column') {
            rule['flex-direction'] = 'column';
        }
        if (n.bgImage) {
            rule['background-image'] = `url('${n.bgImage}')`;
            rule['background-size'] = 'cover';
            rule['background-position'] = 'center';
        }

        // Width
        if (!n.isAutoW) {
            if (n.isGrow && n.parentDirection === 'row') {
                // omit width
            } else if (n.isFullW) {
                rule['width'] = '100%';
            } else {
                rule['width'] = `${Math.round(n.w)}px`;
            }
        }

        // Height
        if (!n.isAutoH) {
            if (n.isGrow && n.parentDirection === 'column') {
                // omit height
            } else if (n.isFullH) {
                rule['height'] = '100%';
            } else {
                rule['height'] = `${Math.round(n.h)}px`;
            }
        }

        if (n.isGrow) {
            rule['flex-grow'] = '1';
        }

        // Padding
        const pT = n.paddingTop ?? n.padding ?? 0;
        const pR = n.paddingRight ?? n.padding ?? 0;
        const pB = n.paddingBottom ?? n.padding ?? 0;
        const pL = n.paddingLeft ?? n.padding ?? 0;
        
        if (pT !== 0 || pR !== 0 || pB !== 0 || pL !== 0) {
            if (pT === pR && pT === pB && pT === pL) {
                rule['padding'] = `${pT}px`;
            } else if (pT === pB && pR === pL) {
                rule['padding'] = `${pT}px ${pR}px`;
            } else {
                rule['padding'] = `${pT}px ${pR}px ${pB}px ${pL}px`;
            }
        }

        // Margin
        const mT = n.marginTop ?? n.margin ?? 0;
        const mR = n.marginRight ?? n.margin ?? 0;
        const mB = n.marginBottom ?? n.margin ?? 0;
        const mL = n.marginLeft ?? n.margin ?? 0;
        
        const isMtA = !!n.mtA;
        const isMrA = !!n.mrA;
        const isMbA = !!n.mbA;
        const isMlA = !!n.mlA;

        if (isMtA || isMrA || isMbA || isMlA || mT !== 0 || mR !== 0 || mB !== 0 || mL !== 0) {
            const vT = isMtA ? 'auto' : `${mT}px`;
            const vR = isMrA ? 'auto' : `${mR}px`;
            const vB = isMbA ? 'auto' : `${mB}px`;
            const vL = isMlA ? 'auto' : `${mL}px`;

            if (vT === vR && vT === vB && vT === vL) {
                rule['margin'] = vT;
            } else if (vT === vB && vR === vL) {
                rule['margin'] = `${vT} ${vR}`;
            } else {
                rule['margin'] = `${vT} ${vR} ${vB} ${vL}`;
            }
        }

        // Parse manual CSS
        if (n.manualCSS) {
            const lines = n.manualCSS.split('\n');
            lines.forEach(line => {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const val = parts.slice(1).join(':').replace(';', '').trim();
                    if (key && val) {
                        rule[key] = val;
                    }
                }
            });
        }

        styles[`.${n.name}`] = rule;

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
