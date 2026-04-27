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
  Group
} from '@mantine/core'
import { 
  IconCopy, 
  IconCheck, 
  IconBrandHtml5, 
  IconBrandCss3 
} from '@tabler/icons-react'
import { ScrollArea } from '@mantine/core'
import { buildCSSObject, serializeCSS } from '../engine/css-generator'

export const generateHTML = (nodes, indent = "") => {
    return nodes.map(n => {
        const name = n.id.replace('shape:', 'box-');
        const tag = n.meta?.tag || 'div';
        const children = n.children?.length ? `\n${generateHTML(n.children, indent + "  ")}${indent}` : "";
        return `${indent}<${tag} class="${name}">${children}</${tag}>`;
    }).join("\n");
};

export const generateCSS = (nodes) => {
    const cssObj = buildCSSObject(nodes);
    return serializeCSS(cssObj);
};

export default function CodeModal({ show, onClose, tree }) {
    const [activeTab, setActiveTab] = useState('html')
    const htmlCode = generateHTML(tree);
    const cssCode = generateCSS(tree);

    return (
        <Modal 
            opened={show} 
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
                <Text size="xs" c="dimmed">Source code is generated based on your live Yoga layout.</Text>
            </Group>
        </Modal>
    );
}
