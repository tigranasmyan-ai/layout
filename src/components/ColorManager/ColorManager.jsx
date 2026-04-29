import React, { useState } from 'react';
import { 
    Modal, SimpleGrid, Card, Text, ActionIcon, Group, Button, TextInput, Stack, ColorInput, Box 
} from '@mantine/core';
import { IconTrash, IconPlus, IconPalette } from '@tabler/icons-react';

export default function ColorManager({ opened, onClose, palette, onAddColor, onRemoveColor }) {
    const [newName, setNewName] = useState('');
    const [newValue, setNewValue] = useState('#4f46e5');

    const handleAdd = () => {
        const isDuplicate = palette.some(c => c.value === newValue);
        if (isDuplicate) return;

        onAddColor({ 
            name: newName.trim() || newValue, 
            value: newValue 
        });
        setNewName('');
    };

    return (
        <Modal 
            opened={opened} 
            onClose={onClose} 
            title={<Group gap="xs"><IconPalette size={20} color="#4f46e5" /><Text fw={700}>Color Manager</Text></Group>}
            radius="md"
            styles={{ content: { background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.1)' }, header: { background: '#1a1a1e' } }}
        >
            <Stack gap="md">
                <Text size="sm" c="dimmed">Define your project colors here to use them across the layout.</Text>

                <Card withBorder padding="sm" radius="md" bg="rgba(255,255,255,0.02)">
                    <Stack gap="xs">
                        <TextInput 
                            label="Color Name"
                            placeholder="e.g. Primary, Brand Blue..."
                            size="sm"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                        <ColorInput 
                            label="Color Value"
                            size="sm"
                            format="rgba"
                            value={newValue}
                            onChange={setNewValue}
                        />
                        <Button 
                            mt="xs"
                            leftSection={<IconPlus size={16} />} 
                            onClick={handleAdd}
                        >
                            Add to Palette
                        </Button>
                    </Stack>
                </Card>

                <Box>
                    <Text size="xs" fw={700} c="dimmed" mb="xs" lts="1px">MY PALETTE</Text>
                    <Stack gap={6}>
                        {palette.map(color => (
                            <Card key={color.name} withBorder padding="xs" radius="md" bg="rgba(255,255,255,0.03)">
                                <Group justify="space-between">
                                    <Group gap="xs">
                                        <Box style={{ width: 24, height: 24, borderRadius: 4, background: color.value, border: '1px solid rgba(255,255,255,0.1)' }} />
                                        <Box>
                                            <Text size="xs" fw={700}>{color.name}</Text>
                                            <Text size="10px" c="dimmed">{color.value}</Text>
                                        </Box>
                                    </Group>
                                    <ActionIcon variant="subtle" color="red" size="sm" onClick={() => onRemoveColor(color.name)}>
                                        <IconTrash size={14} />
                                    </ActionIcon>
                                </Group>
                            </Card>
                        ))}
                    </Stack>
                </Box>
            </Stack>
        </Modal>
    );
}

