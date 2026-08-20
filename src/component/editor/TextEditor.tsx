import React from "react";
import SummernoteEditor from "./SummerNote";

interface TextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const TextEditor = ({ value, onChange }: TextEditorProps) => {
    return (
        <SummernoteEditor
            label="Description"
            value={value}
            onChange={onChange}
            placeholder="Enter product description here..."
            height={300}
        />
    );
};

export default TextEditor;
