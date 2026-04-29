import React from 'react';
import { Modal, SimpleGrid, Card, Image, Text, ActionIcon, Group, Button, FileInput, Stack, Box } from '@mantine/core';
import { IconTrash, IconPlus, IconCheck } from '@tabler/icons-react';
import classes from './AssetManager.module.css';

export default function AssetManager({ 
    opened, onClose, assets = [], onAddAsset, onRemoveAsset, onSelect, selectedAssetUrl 
}) {
    const handleFileUpload = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            onAddAsset({
                id: `asset_${Date.now()}`,
                name: file.name,
                url: e.target.result
            });
        };
        reader.readAsDataURL(file);
    };

    return (
        <Modal 
            opened={opened} onClose={onClose} 
            title="Asset Manager" size="lg"
            classNames={{ content: classes.modalContent }}
        >
            <Stack gap="md">
                <SimpleGrid cols={3} spacing="md" className={classes.grid}>
                    {assets.map(asset => {
                        const isSelected = selectedAssetUrl === asset.url;
                        return (
                            <Card 
                                key={asset.id} 
                                className={`${classes.card} ${isSelected ? classes.selected : ''}`}
                                onClick={() => onSelect(asset.url)}
                            >
                                <Card.Section className={classes.imageSection}>
                                    <Image src={asset.url} className={classes.image} alt={asset.name} />
                                    {isSelected && (
                                        <div className={classes.checkOverlay}>
                                            <IconCheck size={12} color="white" />
                                        </div>
                                    )}
                                </Card.Section>
                                
                                <Box className={classes.cardFooter}>
                                    <Group justify="space-between" wrap="nowrap">
                                        <Text size="xs" fw={700} truncate>{asset.name}</Text>
                                        <ActionIcon 
                                            variant="subtle" color="red" size="sm"
                                            onClick={(e) => { e.stopPropagation(); onRemoveAsset(asset.id); }}
                                        >
                                            <IconTrash size={14} />
                                        </ActionIcon>
                                    </Group>
                                    <Text className={classes.urlText}>{asset.url}</Text>
                                </Box>
                            </Card>
                        );
                    })}
                </SimpleGrid>

                {assets.length === 0 && (
                    <Stack align="center" className={classes.emptyContainer}>
                        <Text c="dimmed" size="sm">No assets uploaded yet</Text>
                    </Stack>
                )}

                <Box className={classes.uploadSection}>
                    <FileInput 
                        placeholder="Upload new image..." 
                        leftSection={<IconPlus size={14} />}
                        onChange={handleFileUpload}
                        accept="image/*"
                    />
                </Box>
            </Stack>
        </Modal>
    );
}
