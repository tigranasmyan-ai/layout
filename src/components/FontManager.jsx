import React, { useState } from 'react';
import { 
    Modal, SimpleGrid, Card, Text, ActionIcon, Group, Button, TextInput, Stack, ScrollArea 
} from '@mantine/core';
import { IconTrash, IconPlus, IconCheck, IconSearch, IconTypography } from '@tabler/icons-react';

const POPULAR_FONTS = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
    'Oswald', 'Source Sans Pro', 'Slabo 27px', 'Raleway', 'PT Sans',
    'Merriweather', 'Noto Sans', 'Nunito', 'Playfair Display'
];

export default function FontManager({ opened, onClose, fonts, onAddFont, onRemoveFont }) {
    const [customFont, setCustomFont] = useState('');

    const handleAdd = (family) => {
        onAddFont({ family, category: 'sans-serif' });
        setCustomFont('');
    };

    return (
        <Modal 
            opened={opened} 
            onClose={onClose} 
            title={<Group gap="xs"><IconTypography size={20} color="#4f46e5" /><Text fw={700}>Font Manager</Text></Group>}
            size="lg"
            radius="md"
            styles={{ content: { background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.1)' }, header: { background: '#1a1a1e' } }}
        >
            <Stack gap="md">
                <Text size="sm" c="dimmed">Add Google Fonts to use them in your layout blocks.</Text>

                <Group align="flex-end">
                    <TextInput 
                        label="Add by Name"
                        placeholder="e.g. Roboto Mono"
                        style={{ flex: 1 }}
                        value={customFont}
                        onChange={(e) => setCustomFont(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && customFont && handleAdd(customFont)}
                    />
                    <Button 
                        leftSection={<IconPlus size={16} />} 
                        disabled={!customFont}
                        onClick={() => handleAdd(customFont)}
                    >
                        Add
                    </Button>
                </Group>

                <Box mt="sm">
                    <Text size="xs" fw={700} c="dimmed" mb="xs" lts="1px">MY FONTS</Text>
                    <SimpleGrid cols={2} spacing="xs">
                        {fonts.map(font => (
                            <Card key={font.family} withBorder padding="xs" radius="md" bg="rgba(255,255,255,0.03)">
                                <Group justify="space-between">
                                    <Text size="sm" fw={600} style={{ fontFamily: font.family }}>{font.family}</Text>
                                    <ActionIcon variant="subtle" color="red" size="sm" onClick={() => onRemoveFont(font.family)}>
                                        <IconTrash size={14} />
                                    </ActionIcon>
                                </Group>
                            </Card>
                        ))}
                    </SimpleGrid>
                    {fonts.length === 0 && <Text size="xs" c="dimmed" ta="center" py="xl" style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 8 }}>No custom fonts added yet</Text>}
                </Box>

                <Box mt="sm">
                    <Text size="xs" fw={700} c="dimmed" mb="xs" lts="1px">POPULAR GOOGLE FONTS</Text>
                    <ScrollArea.Autosize mah={200}>
                        <SimpleGrid cols={2} spacing="xs">
                            {POPULAR_FONTS.filter(f => !fonts.find(x => x.family === f)).map(font => (
                                <Card 
                                    key={font} withBorder padding="xs" radius="md" bg="transparent"
                                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                    className="hover-card"
                                    onClick={() => handleAdd(font)}
                                >
                                    <Group justify="space-between">
                                        <Text size="sm" style={{ fontFamily: font }}>{font}</Text>
                                        <IconPlus size={14} opacity={0.5} />
                                    </Group>
                                </Card>
                            ))}
                        </SimpleGrid>
                    </ScrollArea.Autosize>
                </Box>
            </Stack>
        </Modal>
    );
}

const Box = ({ children, style, ...props }) => <div style={{ ...style }} {...props}>{children}</div>;
