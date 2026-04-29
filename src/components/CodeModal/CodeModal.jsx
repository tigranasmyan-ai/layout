import React, { useState } from 'react'
import { 
  Modal, Tabs, ActionIcon, CopyButton, Tooltip, Paper, Box, Text, Group, ScrollArea 
} from '@mantine/core'
import { 
  IconCopy, IconCheck, IconBrandHtml5, IconBrandCss3 
} from '@tabler/icons-react'

// Utilities
import { blocksToTree, generateHTML, generateCSS } from '@utils';
import classes from './CodeModal.module.css';

export default function CodeModal({ opened, onClose, blocks = [] }) {
    const [activeTab, setActiveTab] = useState('html')
    
    // Безопасно собираем дерево и генерируем код
    const tree = React.useMemo(() => blocksToTree(blocks), [blocks]);
    const htmlCode = React.useMemo(() => generateHTML(tree), [tree]);
    const cssCode = React.useMemo(() => generateCSS(tree), [tree]);

    return (
        <Modal 
            opened={opened} 
            onClose={onClose} 
            title={<Text fw={700}>Project Source</Text>}
            size="xl"
            radius="md"
            padding="md"
            overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
            styles={{ content: { background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.1)' }, header: { background: '#1a1a1e' } }}
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
                        <pre className={classes.codeBlock}>
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
