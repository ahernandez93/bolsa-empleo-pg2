"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
    Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Link as LinkIcon,
    Heading1, Heading2, SplitSquareHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
    value?: string;            // HTML
    onChange: (html: string) => void;
    className?: string;
    placeholder?: string;
};

export default function Wysiwyg({ value = "", onChange, className, placeholder }: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: true,
                autolink: true,
                HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
            }),
        ],
        content: value || "",
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class:
                    "min-h-[180px] px-3 py-2 rounded-md border bg-background outline-none focus-visible:ring-2 focus-visible:ring-ring prose prose-slate max-w-none dark:prose-invert",
            },
        },
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
    });

    // mientras se inicializa, no pintes nada pesado
    if (!editor) {
        return <div className={cn("min-h-[180px] rounded-md border px-3 py-2", className)} />;
    }

    const isEmpty = editor.isEmpty;

    return (
        <div className={cn("space-y-2", className)}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1">
                <Toggle pressed={editor.isActive("bold")} onPressedChange={() => editor.chain().focus().toggleBold().run()} aria-label="Negrita">
                    <Bold className="h-4 w-4" />
                </Toggle>
                <Toggle pressed={editor.isActive("italic")} onPressedChange={() => editor.chain().focus().toggleItalic().run()} aria-label="Cursiva">
                    <Italic className="h-4 w-4" />
                </Toggle>
                <Toggle pressed={editor.isActive("underline")} onPressedChange={() => editor.chain().focus().toggleUnderline().run()} aria-label="Subrayado">
                    <UnderlineIcon className="h-4 w-4" />
                </Toggle>

                <span className="mx-1 h-5 w-px bg-border" />

                <Button type="button" variant={editor.isActive("heading", { level: 1 }) ? "default" : "outline"} size="icon"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Título H1">
                    <Heading1 className="h-4 w-4" />
                </Button>
                <Button type="button" variant={editor.isActive("heading", { level: 2 }) ? "default" : "outline"} size="icon"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Título H2">
                    <Heading2 className="h-4 w-4" />
                </Button>

                <span className="mx-1 h-5 w-px bg-border" />

                <Button type="button" variant={editor.isActive("bulletList") ? "default" : "outline"} size="icon"
                    onClick={() => editor.chain().focus().toggleBulletList().run()} title="Lista">
                    <List className="h-4 w-4" />
                </Button>
                <Button type="button" variant={editor.isActive("orderedList") ? "default" : "outline"} size="icon"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Lista numerada">
                    <ListOrdered className="h-4 w-4" />
                </Button>

                <span className="mx-1 h-5 w-px bg-border" />

                <Button type="button" variant="outline" size="icon" title="Insertar enlace"
                    onClick={() => {
                        const url = prompt("URL del enlace:");
                        if (!url) return;
                        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
                    }}>
                    <LinkIcon className="h-4 w-4" />
                </Button>

                <span className="mx-1 h-5 w-px bg-border" />

                <Button type="button" variant="outline" size="icon" title="Separador"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                    <SplitSquareHorizontal className="h-4 w-4" />
                </Button>
            </div>

            {/* Editor + placeholder overlay */}
            <div className="relative">
                {isEmpty && (
                    <div className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground">
                        {placeholder || "Describe responsabilidades, requisitos, beneficios..."}
                    </div>
                )}
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
