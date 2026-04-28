import React, { useState } from 'react'
import { 
  Modal, 
  Tabs, 
  ActionIcon, 
  CopyButton, 
  Tooltip, 
  Paper,
  Box,
  Text,
  Group,
  ScrollArea
} from '@mantine/core'
import { 
  IconCopy, 
  IconCheck, 
  IconBrandHtml5, 
  IconBrandCss3 
} from '@tabler/icons-react'

// Вспомогательная функция для сборки дерева
const blocksToTree = (items) => {
    const map = {}
    items.forEach(b => map[b.id] = { ...b, children: [] })
    const roots = []
    items.forEach(b => {
        if (b.parentId && map[b.parentId]) map[b.parentId].children.push(map[b.id])
        else roots.push(map[b.id])
    })
    return roots
}

export const generateHTML = (nodes, indent = "") => {
    return nodes.map(n => {
        const name = `box-${n.id}`;
        const tag = 'div';
        const children = n.children?.length ? `\n${generateHTML(n.children, indent + "  ")}${indent}` : "";
        return `${indent}<${tag} class="${name}">${children}</${tag}>`;
    }).join("\n");
};

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

            // Свойства гибкости
            if (m.flexGrow !== undefined) out += `  flex-grow: ${m.flexGrow};\n`;
            if (m.flexBasis !== undefined) out += `  flex-basis: ${m.flexBasis};\n`;
            if (m.alignSelf && m.alignSelf !== 'auto') out += `  align-self: ${m.alignSelf};\n`;

            // Размеры
            const w = m.w || n.w;
            const h = m.h || n.h;
            if (w !== undefined) out += `  width: ${typeof w === 'number' ? w + 'px' : w};\n`;
            if (h !== undefined) out += `  height: ${typeof h === 'number' ? h + 'px' : h};\n`;

            // Отступы (Shorthand: top right bottom left)
            out += `  padding: ${p.top}px ${p.right}px ${p.bottom}px ${p.left}px;\n`;
            out += `  margin: ${mar.top}px ${mar.right}px ${mar.bottom}px ${mar.left}px;\n`;
            
            // Пользовательский CSS
            if (m.customCss) out += `  ${m.customCss}\n`;
            
            out += `}\n\n`;
            
            if (n.children?.length) traverse(n.children);
        });
    };
    traverse(nodes);
    return out;
};

export default function CodeModal({ opened, onClose, blocks = [] }) {
    const [activeTab, setActiveTab] = useState('html')
    
    // Безопасно собираем дерево
    const tree = blocksToTree(blocks);
    
    const htmlCode = generateHTML(tree);
    const cssCode = generateCSS(tree);

    return (
        <Modal 
            opened={opened} 
            onClose={onClose} 
            title={<Text fw={700}>Project Source</Text>}
            size="xl"
            radius="md"
            padding="md"
            overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        >
            <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius="md">
                <Tabs.List mb="md">
                    <Tabs.Tab value="html" leftSection={<IconBrandHtml5 size={16} />}>HTML</Tabs.Tab>
                    <Tabs.Tab value="css" leftSection={<IconBrandCss3 size={16} />}>CSS</Tabs.Tab>
                </Tabs.List>

                <Paper p="md" withBorder bg="rgba(0,0,0,0.3)" style={{ position: 'relative' }}>
                    <Box style={{ position: 'absolute', right: 12, top: 12, zIndex: 10 }}>
                        <CopyButton value={activeTab === 'html' ? htmlCode : cssCode} timeout={2000}>
                            {({ copied, copy }) => (
                                <Tooltip label={copied ? 'Copied' : 'Copy code'} withArrow>
                                    <ActionIcon color={copied ? 'teal' : 'gray'} variant="light" onClick={copy}>
                                        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </CopyButton>
                    </Box>

                    <ScrollArea.Autosize mah={500} type="always">
                        <pre style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
                            <code>{activeTab === 'html' ? htmlCode : cssCode}</code>
                        </pre>
                    </ScrollArea.Autosize>
                </Paper>
            </Tabs>
            
            <Group justify="center" mt="md">
                <Text size="xs" c="dimmed">Source code is generated based on your custom flex styles.</Text>
            </Group>
        </Modal>
    );
}
