import React from 'react';
import { Box, Group, Text, TextInput, Button, FileInput, ActionIcon, Stack, Slider } from '@mantine/core';
import { IconBolt, IconPhoto, IconTrash } from '@tabler/icons-react';

export default function BlueprintSection({ blueprint, onUpdateBlueprint }) {
    const handleImageUpload = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                onUpdateBlueprint({ 
                    url: e.target.result,
                    w: img.naturalWidth 
                });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    return (
        <Box p="md" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Group justify="space-between" mb="xs">
                <Group gap={6}>
                    <IconPhoto size={14} color="#10b981" />
                    <Text size="xs" fw={700} c="dimmed">BLUEPRINT (MOCKUP)</Text>
                </Group>
                {blueprint.url && (
                    <ActionIcon size="xs" color="red" variant="subtle" onClick={() => onUpdateBlueprint({ url: null })}>
                        <IconTrash size={12} />
                    </ActionIcon>
                )}
            </Group>
            
            {!blueprint.url ? (
                <FileInput 
                    placeholder="Import image mockup..." 
                    size="xs" 
                    accept="image/*"
                    leftSection={<IconPhoto size={14} />}
                    onChange={handleImageUpload}
                />
            ) : (
                <Stack gap="xs">
                    <Group justify="space-between">
                        <Text size="10px" c="dimmed">OPACITY</Text>
                        <Text size="10px" fw={700} c="white">{Math.round(blueprint.opacity * 100)}%</Text>
                    </Group>
                    <Slider 
                        size="xs"
                        min={0} max={1} step={0.01}
                        value={blueprint.opacity}
                        onChange={(val) => onUpdateBlueprint({ opacity: val })}
                    />
                </Stack>
            )}
        </Box>
    );
}
