import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const VARIABLES = ["{{product.title}}", "{{variant.title}}", "{{shop.name}}"];

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Link.configure({ openOnClick: false })],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const btn = (label: string, action: () => void, active = false) => (
    <button
      key={label}
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        action();
      }}
      style={{
        padding: "3px 8px",
        marginRight: 4,
        borderRadius: 4,
        border: "1px solid #c9cccf",
        background: active ? "#e6f4f0" : "#fff",
        color: active ? "#008060" : "#202223",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ border: "1px solid #c9cccf", borderRadius: 8, overflow: "hidden" }}>
      {/* Toolbar */}
      <div
        style={{
          padding: "6px 8px",
          background: "#f6f6f7",
          borderBottom: "1px solid #e1e3e5",
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
        }}
      >
        {btn("B", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
        {btn("I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
        {btn("U", () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"))}
        {btn("• Lista", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"))}
        <span style={{ color: "#c9cccf", margin: "0 6px" }}>|</span>
        {VARIABLES.map((v) =>
          btn(v, () => editor.chain().focus().insertContent(v).run())
        )}
      </div>
      {/* Content */}
      <div style={{ padding: "10px 12px", minHeight: 100, background: "#fff" }}>
        <EditorContent editor={editor} />
      </div>
      <style>{`.ProseMirror { outline: none; } .ProseMirror p { margin: 0 0 8px; }`}</style>
    </div>
  );
}
