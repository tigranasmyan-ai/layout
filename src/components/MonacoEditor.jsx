import React, { useEffect, useRef, useState } from 'react'

let monacoLoader = null;
const loadMonaco = () => {
    if (monacoLoader) return monacoLoader;
    monacoLoader = new Promise((resolve) => {
        if (window.monaco) return resolve(window.monaco);
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs/loader.min.js';
        script.onload = () => {
            window.require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs' } });
            window.require(['vs/editor/editor.main'], () => {
                resolve(window.monaco);
            });
        };
        document.head.appendChild(script);
    });
    return monacoLoader;
};

export default function MonacoEditor({ value, onChange, blockName }) {
    const containerRef = useRef(null)
    const editorRef = useRef(null)
    const [ready, setReady] = useState(false)
    const isInternalChange = useRef(false)

    const prefix = `.${blockName} {\n`
    const suffix = `\n}`

    useEffect(() => {
        let isSubscribed = true;
        
        loadMonaco().then((monaco) => {
            if (!isSubscribed) return;
            setReady(true);
            
            setTimeout(() => {
                if (!containerRef.current || editorRef.current) return;
                
                const fullText = prefix + (value || '  ') + suffix;

                editorRef.current = monaco.editor.create(containerRef.current, {
                    value: fullText, 
                    language: 'css', 
                    theme: 'vs-dark', 
                    minimap: { enabled: false },
                    fontSize: 13, 
                    lineNumbers: "on", 
                    padding: { top: 12 }, 
                    automaticLayout: true,
                    scrollbar: { vertical: 'hidden', horizontal: 'hidden' }, 
                    renderLineHighlight: 'none',
                    backgroundColor: 'transparent'
                });

                editorRef.current.onDidChangeModelContent(() => {
                    if (isInternalChange.current) return;
                    
                    const currentVal = editorRef.current.getValue();
                    
                    // Бронированная проверка структуры
                    if (!currentVal.startsWith(prefix) || !currentVal.endsWith(suffix)) {
                        isInternalChange.current = true;
                        
                        // Пытаемся вытащить то, что осталось от кода пользователя
                        let inner = currentVal;
                        if (currentVal.includes('{')) {
                            inner = currentVal.substring(currentVal.indexOf('{') + 1);
                        }
                        if (inner.includes('}')) {
                            inner = inner.substring(0, inner.lastIndexOf('}'));
                        }
                        
                        const restored = prefix + inner.trim() + suffix;
                        editorRef.current.setValue(restored);
                        
                        // Возвращаем курсор на место, если он улетел
                        editorRef.current.setPosition({ lineNumber: 2, column: 1 });
                        
                        isInternalChange.current = false;
                        onChange(inner.trim());
                    } else {
                        const inner = currentVal.substring(prefix.length, currentVal.length - suffix.length).trim();
                        onChange(inner);
                    }
                });
            }, 50);
        });

        return () => {
            isSubscribed = false;
            if (editorRef.current) {
                editorRef.current.dispose();
                editorRef.current = null;
            }
        };
    }, [blockName]); 

    useEffect(() => {
        if (!editorRef.current) return;
        const currentInner = editorRef.current.getValue().substring(prefix.length, editorRef.current.getValue().length - suffix.length).trim();
        if (currentInner === value) return;
        
        isInternalChange.current = true;
        editorRef.current.setValue(prefix + (value || '') + suffix);
        isInternalChange.current = false;
    }, [value, blockName]);

    return (
        <div className="monaco-pro-wrapper" style={{ 
            height: '260px', 
            background: 'rgba(0,0,0,0.4)', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            border: '1px solid rgba(255,255,255,0.05)',
            position: 'relative'
        }}>
            {!ready && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1d23', zIndex: 10, color: '#4f46e5', fontSize: '12px', fontWeight: 600 }}>
                    INITIALIZING...
                </div>
            )}
            <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
        </div>
    )
}
