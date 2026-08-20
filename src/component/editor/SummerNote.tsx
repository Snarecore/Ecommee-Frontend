import { useEffect, useRef, useState } from 'react';

interface SummernoteEditorProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    height?: number;
}

declare global {
    interface Window {
        $: any;
        jQuery: any;
    }
}

const SummernoteEditor = ({ label, value, onChange, placeholder, height = 300 }: SummernoteEditorProps) => {
    const editorRef = useRef<HTMLTextAreaElement>(null);
    const [editorReady, setEditorReady] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadScripts = async () => {
            // Helper function to load a stylesheet
            const loadStyle = (url: string): Promise<void> => {
                return new Promise((resolve) => {
                    if (document.querySelector(`link[href="${url}"]`)) {
                        resolve();
                        return;
                    }
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = url;
                    link.onload = () => resolve();
                    link.onerror = () => resolve(); // continue anyway
                    document.head.appendChild(link);
                });
            };

            // Helper function to load a script
            const loadScript = (url: string): Promise<void> => {
                return new Promise((resolve) => {
                    if (document.querySelector(`script[src="${url}"]`)) {
                        resolve();
                        return;
                    }
                    const script = document.createElement('script');
                    script.src = url;
                    script.async = true;
                    script.onload = () => resolve();
                    script.onerror = () => resolve(); // continue anyway
                    document.body.appendChild(script);
                });
            };

            // Check if jQuery is already loaded, otherwise load it
            if (!window.$ || !window.jQuery) {
                await loadScript('https://code.jquery.com/jquery-3.6.0.min.js');
                if (window.$) {
                    window.jQuery = window.$;
                }
            }

            // Load Summernote Lite CSS & JS
            await loadStyle('https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-lite.min.css');
            
            if (window.$ && (!window.$.fn || !window.$.fn.summernote)) {
                await loadScript('https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-lite.min.js');
            }

            if (isMounted && window.$ && window.$.fn && window.$.fn.summernote) {
                setEditorReady(true);
            }
        };

        if (typeof window !== 'undefined') {
            if (window.$ && window.$.fn && window.$.fn.summernote) {
                setEditorReady(true);
            } else {
                loadScripts();
            }
        }

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!editorReady || !editorRef.current || !window.$) return;

        const $editor = window.$(editorRef.current);
        
        // Initialize Summernote
        $editor.summernote({
            placeholder: placeholder || 'Write something here...',
            height: height,
            dialogsInBody: true,
            dialogsFade: true,
            colors: [
                ['#000000', '#424242', '#636363', '#9C9C94', '#CEC6CE', '#EFEFEF', '#F7F7F7', '#FFFFFF'],
                ['#FF0000', '#FF9C00', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#9C00FF', '#FF00FF'],
                ['#F7C6CE', '#FFE7CE', '#FFEFC6', '#D6EFD6', '#CEDEE7', '#CEE7F7', '#D6D6E7', '#E7D6DE'],
                ['#E79C9C', '#FFC69C', '#FFE79C', '#B5D6A5', '#A5C6CE', '#9CC6EF', '#B5A5D6', '#D6A5BD'],
                ['#E76363', '#F7AD6B', '#FFD663', '#94BD7B', '#73A5AD', '#6BADDE', '#8C7BC6', '#C67BA5'],
                ['#CE0000', '#E79439', '#EFC631', '#6BA54A', '#4A7B8C', '#3984C6', '#634AA5', '#A54A7B'],
                ['#9C0000', '#B56308', '#BD9400', '#397B21', '#104A5A', '#085294', '#311873', '#731842'],
                ['#630000', '#7B3900', '#846300', '#295218', '#083139', '#003163', '#21104A', '#4A1031']
            ],
            fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Inter', 'Nunito', 'Roboto', 'Times New Roman', 'Verdana'],
            fontSizes: ['8', '9', '10', '11', '12', '14', '18', '24', '36', '48' , '64', '82', '150'],
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
                ['fontname', ['fontname']],
                ['fontsize', ['fontsize']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph', 'height']],
                ['table', ['table']],
                ['insert', ['link', 'picture', 'video', 'hr', 'arrows']],
                ['view', ['fullscreen', 'codeview', 'help']],
                ['undo', ['undo', 'redo']],
            ],
            buttons: {
                arrows: function (context: any) {
                    const ui = window.$.summernote.ui;
                    const arrows = ['←', '↑', '→', '↓', '↔', '↕', '↖', '↗', '↘', '↙', '↩', '↪', '↺', '↻', '➔', '➜', '➝', '➞', '➡', '➤', '➥', '➧', '➨', '➩', '➪', '➫', '➬', '➭', '➮', '➯', '➱', '➲', '➳', '➴', '➵', '➶', '➷', '➸', '➹', '➺', '➻', '➼', '➽', '➾'];
                    
                    const button = ui.buttonGroup([
                        ui.button({
                            className: 'dropdown-toggle',
                            contents: '<span style="font-size: 14px; font-weight: bold;">&rarr;</span> <span class="note-icon-caret"></span>',
                            tooltip: 'Insert Arrow',
                            data: {
                                toggle: 'dropdown'
                            }
                        }),
                        ui.dropdown({
                            className: 'dropdown-menu note-check',
                            contents: '<div style="display:grid; grid-template-columns: repeat(6, 1fr); gap: 2px; padding: 5px; width: 220px; max-height: 200px; overflow-y: auto;">' + 
                                arrows.map((arrow: string) => `<button type="button" class="note-btn btn btn-light btn-sm" data-value="${arrow}" style="padding: 5px; font-size: 16px;">${arrow}</button>`).join('') + 
                            '</div>',
                            callback: function ($dropdown: any) {
                                $dropdown.find('button').click(function (e: any) {
                                    e.preventDefault();
                                    const arrow = window.$(e.currentTarget).attr('data-value');
                                    context.invoke('editor.insertText', arrow);
                                    
                                    // Trigger onChange manually when arrow is inserted
                                    const currentContents = $editor.summernote('code');
                                    onChange(currentContents);
                                });
                            }
                        })
                    ]);
                    return button.render();
                }
            },
            callbacks: {
                onChange: (contents: string) => {
                    onChange(contents);
                }
            }
        });

        // Set initial value
        $editor.summernote('code', value || '');

        return () => {
            if ($editor.data('summernote')) {
                $editor.summernote('destroy');
            }
        };
    }, [editorReady]);

    // Sync value from props if it changes externally
    useEffect(() => {
        if (!editorReady || !editorRef.current || !window.$) return;

        const $editor = window.$(editorRef.current);
        if ($editor.data('summernote')) {
            const currentCode = $editor.summernote('code');
            if (currentCode !== value) {
                $editor.summernote('code', value || '');
            }
        }
    }, [value, editorReady]);

    if (!editorReady) {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-nunito">
                        {label}
                    </label>
                )}
                <div 
                    style={{ height: height }} 
                    className="w-full border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center text-sm text-gray-400"
                >
                    Loading rich-text editor...
                </div>
            </div>
        );
    }

    return (
        <div className="w-full summernote-editor-wrapper">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2 font-nunito">
                    {label}
                </label>
            )}
            <textarea ref={editorRef} />
            <style dangerouslySetInnerHTML={{ __html: `
                .note-editor.note-frame {
                    border: 1px solid #e5e7eb !important;
                    border-radius: 0.5rem !important;
                    overflow: visible !important;
                    background: white !important;
                    font-family: inherit !important;
                }
                .note-editor.note-frame.fullscreen {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    z-index: 9999999 !important;
                    background: white !important;
                }
                .note-toolbar {
                    background-color: #f9fafb !important;
                    border-bottom: 1px solid #e5e7eb !important;
                    padding: 5px 10px !important;
                }
                .note-btn:not(.note-color-btn) {
                    background-color: white !important;
                    border: 1px solid #d1d5db !important;
                    padding: 4px 8px !important;
                    margin-bottom: 2px !important;
                }
                .note-btn:not(.note-color-btn):hover {
                    background-color: #f3f4f6 !important;
                    border-color: #9ca3af !important;
                }
                .note-btn:not(.note-color-btn).active {
                    background-color: #e5e7eb !important;
                    border-color: #3b82f6 !important;
                }
                /* Color picker fixes */
                .note-color-palette {
                    line-height: 1 !important;
                }
                .note-color-palette div .note-color-btn {
                    width: 20px !important;
                    height: 20px !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    border: 1px solid #ccc !important;
                    display: inline-block !important;
                }
                .note-color-palette .note-color-row {
                    height: 20px !important;
                }
                .note-color .dropdown-menu .note-palette-title {
                    font-size: 12px !important;
                    margin: 2px 7px !important;
                    text-align: center !important;
                }
                .note-color .dropdown-menu {
                    min-width: 340px !important;
                }
                /* Force color buttons to show their background */
                .note-color-btn,
                button.note-color-btn {
                    border: 1px solid rgba(0,0,0,0.2) !important;
                    background-image: none !important;
                }
                .note-color-reset {
                    padding: 5px !important;
                    cursor: pointer !important;
                }
                /* Override any conflicting button styles */
                .note-color .dropdown-menu button {
                    background-image: none !important;
                    box-shadow: none !important;
                }
                .note-color .dropdown-menu .note-color-row button[data-event="backColor"],
                .note-color .dropdown-menu .note-color-row button[data-event="foreColor"] {
                    background-image: none !important;
                    box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1) !important;
                }
                /* Summernote modal dialogs */
                .note-modal {
                    z-index: 10000000 !important;
                }
                .note-modal .modal-dialog {
                    z-index: 10000001 !important;
                    position: relative !important;
                }
                .note-modal-content {
                    z-index: 10000002 !important;
                    position: relative !important;
                }
                .note-modal-backdrop {
                    z-index: 9999999 !important;
                }
                /* Ensure modal buttons are clickable */
                .note-modal .modal-footer .btn {
                    pointer-events: auto !important;
                    cursor: pointer !important;
                    z-index: 10000003 !important;
                    position: relative !important;
                }
                .note-modal .modal-body {
                    z-index: 10000002 !important;
                    position: relative !important;
                }
                .note-modal .modal-header {
                    z-index: 10000002 !important;
                    position: relative !important;
                }
                /* Higher z-index for dropdowns to appear above modals */
                .note-dropdown-menu {
                    z-index: 10000004 !important;
                }
                /* Ensure input fields in modals are accessible */
                .note-modal input,
                .note-modal textarea,
                .note-modal select {
                    z-index: 10000003 !important;
                    position: relative !important;
                }
                
                /* Restore list styles inside Summernote editor overridden by Tailwind preflight */
                .note-editable ul {
                    list-style-type: disc !important;
                    padding-left: 2rem !important;
                    margin-bottom: 1rem !important;
                }
                .note-editable ol {
                    list-style-type: decimal !important;
                    padding-left: 2rem !important;
                    margin-bottom: 1rem !important;
                }
                .note-editable ul ul, .note-editable ol ul {
                    list-style-type: circle !important;
                    margin-bottom: 0 !important;
                }
                .note-editable ol ol, .note-editable ul ol {
                    list-style-type: lower-alpha !important;
                    margin-bottom: 0 !important;
                }
                .note-editable li {
                    display: list-item !important;
                }
                
                /* Restore other typography styles overridden by Tailwind */
                .note-editable h1 { font-size: 2em !important; font-weight: bold !important; margin-bottom: 0.5em !important; line-height: 1.2 !important; }
                .note-editable h2 { font-size: 1.5em !important; font-weight: bold !important; margin-bottom: 0.5em !important; line-height: 1.2 !important; }
                .note-editable h3 { font-size: 1.17em !important; font-weight: bold !important; margin-bottom: 0.5em !important; line-height: 1.2 !important; }
                .note-editable h4 { font-size: 1em !important; font-weight: bold !important; margin-bottom: 0.5em !important; line-height: 1.2 !important; }
                .note-editable h5 { font-size: 0.83em !important; font-weight: bold !important; margin-bottom: 0.5em !important; line-height: 1.2 !important; }
                .note-editable h6 { font-size: 0.67em !important; font-weight: bold !important; margin-bottom: 0.5em !important; line-height: 1.2 !important; }
                
                .note-editable p {
                    margin-bottom: 1em !important;
                }
                
                .note-editable blockquote {
                    border-left: 4px solid #e5e7eb !important;
                    margin: 1em 0 !important;
                    padding-left: 1em !important;
                    color: #6b7280 !important;
                    font-style: italic !important;
                }
                
                .note-editable pre {
                    background-color: #f3f4f6 !important;
                    padding: 1em !important;
                    margin-bottom: 1em !important;
                    overflow: auto !important;
                    border-radius: 0.375rem !important;
                    font-family: monospace !important;
                    font-size: 0.875em !important;
                }
                
                .note-editable code {
                    background-color: #f3f4f6 !important;
                    padding: 0.2em 0.4em !important;
                    border-radius: 0.25rem !important;
                    font-family: monospace !important;
                    font-size: 0.875em !important;
                }
                
                .note-editable a {
                    color: #3b82f6 !important;
                    text-decoration: underline !important;
                }
                
                .note-editable b, .note-editable strong {
                    font-weight: bold !important;
                }
                
                .note-editable i, .note-editable em {
                    font-style: italic !important;
                }
                
                .note-editable u {
                    text-decoration: underline !important;
                }
                
                .note-editable strike, .note-editable s {
                    text-decoration: line-through !important;
                }
            `}} />
        </div>
    );
};

export default SummernoteEditor;
