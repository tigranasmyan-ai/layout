import React from 'react';
import { Modal, SimpleGrid, Card, Image, Text, ActionIcon, Group, Button, FileInput, Stack } from '@mantine/core';
import { IconTrash, IconPlus, IconCheck } from '@tabler/icons-react';

export default function AssetManager({ opened, onClose, assets, onAddAsset, onRemoveAsset, onSelect, selectedAssetUrl }) {
    const handleFileUpload = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const asset = {
                id: 'asset_' + Math.random().toString(36).substr(2, 9),
                url: e.target.result,
                name: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB'
            };
            onAddAsset(asset);
        };
        reader.readAsDataURL(file);
    };

    return (
        <Modal 
            opened={opened} 
            onClose={onClose} 
            title={<Text fw={700}>MEDIA LIBRARY</Text>}
            size="lg"
            styles={{ content: { background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.1)' }, header: { background: '#1a1a1e' } }}
        >
            <Stack gap="md">
                <FileInput 
                    placeholder="Upload new image..." 
                    leftSection={<IconPlus size={16} />} 
                    accept="image/*"
                    onChange={handleFileUpload}
                    size="sm"
                />

                {assets.length === 0 ? (
                    <Text c="dimmed" ta="center" py="xl">No images uploaded yet.</Text>
                ) : (
                    <SimpleGrid cols={3} spacing="md">
                        {assets.map((asset) => (
                            <Card 
                                key={asset.id} 
                                padding="xs" 
                                radius="md" 
                                style={{ 
                                    background: 'rgba(255,255,255,0.03)', 
                                    border: selectedAssetUrl === asset.url ? '2px solid #4f46e5' : '1px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                                onClick={() => { onSelect(asset.url); onClose(); }}
                            >
                                <Card.Section>
                                    <Image src={asset.url} height={100} fit="cover" alt={asset.name} />
                                </Card.Section>
                                
                                <Group justify="space-between" mt="xs">
                                    <Box style={{ overflow: 'hidden' }}>
                                        <Text size="10px" fw={700} truncate>{asset.name}</Text>
                                        <Text size="9px" c="dimmed">{asset.size}</Text>
                                    </Box>
                                    <ActionIcon 
                                        size="sm" 
                                        color="red" 
                                        variant="subtle" 
                                        onClick={(e) => { e.stopPropagation(); onRemoveAsset(asset.id); }}
                                    >
                                        <IconTrash size={14} />
                                    </ActionIcon>
                                </Group>
                                
                                {selectedAssetUrl === asset.url && (
                                    <Box style={{ position: 'absolute', top: 5, right: 5, background: '#4f46e5', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <IconCheck size={12} color="white" strokeWidth={4} />
                                    </Box>
                                )}
                            </Card>
                        ))}
                    </SimpleGrid>
                )}
            </Stack>
        </Modal>
    );
}

// Вспомогательный Box для обрезки текста
const Box = ({ children, style }) => <div style={{ ...style, display: 'block' }}>{children}</div>;
