import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface TextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const TextEditor = ({ value, onChange }: TextEditorProps) => {
    const handleChange = (val: string) => {
        const plainText = val.replace(/<[^>]*>/g, "").trim();
        const words = plainText.split(/\s+/).filter(word => word !== "");
        if (words.length <= 800) {
            onChange(val);
        }
    };
    

    return (
        <div className="w-full hover:cursor-pointer hover:border-[var(--color-green-primary)]">
            <label className="text-sm font-medium text-gray-700">
                Description
            </label>
            <ReactQuill
                value={value}
                onChange={handleChange}
                modules={{
                    toolbar: [
                        [{ header: [2, 3, 4, false] }],
                        ["bold", "italic", "underline", "blockquote"],
                        [{ color: [] }, { background: [] }],
                        [{ font: [] }],
                        [{ align: [] }],
                        ["clean"],
                        ['link', 'image', 'video'],
                        ['underline', 'strike', 'blockquote', 'code-block'],
                        ['list', 'bullet', 'ordered'],
                        ['indent', 'outdent'],
                        ['formula', 'video'],
                        ['color', 'background', 'clear'],
                        ['font', 'size', 'height'],
                        ['direction', 'align'],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["blockquote", "code-block"],
                        [{ align: [] }],
                        ["clean"],
                    ],
                }}
                className="mt-2"
            />
        </div>
    );
};

export default TextEditor;
