import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import { common, createLowlight } from 'lowlight';
import { useTranslation } from 'react-i18next';
import {
  Bold, Italic, Strikethrough, Underline as UnderlineIcon,
  Code, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, CheckSquare,
  Heading1, Heading2, Heading3,
  Link as LinkIcon, SquareCode, Minus,
  Highlighter, Quote, Undo2, Redo2,
} from 'lucide-react';
import './editor-styles.css';

const lowlight = createLowlight(common);

// Intercept Tab so the browser doesn't steal focus / open search
const TabHandler = Extension.create({
  name: 'tabHandler',
  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        // Inside a list — indent (sink)
        if (editor.isActive('listItem') || editor.isActive('taskItem')) {
          return editor.chain().focus().sinkListItem('listItem').run()
            || editor.chain().focus().sinkListItem('taskItem').run();
        }
        // Otherwise insert a tab character
        return editor.chain().focus().insertContent('\t').run();
      },
      'Shift-Tab': ({ editor }) => {
        if (editor.isActive('listItem') || editor.isActive('taskItem')) {
          return editor.chain().focus().liftListItem('listItem').run()
            || editor.chain().focus().liftListItem('taskItem').run();
        }
        return true; // consume the event, do nothing
      },
    };
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// ── Toolbar Button ──
const ToolbarBtn: React.FC<{
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}> = ({ onClick, isActive, disabled, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-md transition-all duration-100 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed ${
      isActive
        ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200'
    }`}
  >
    {children}
  </button>
);

const Divider = () => (
  <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700/50 mx-0.5 shrink-0" />
);

const ICON = 'w-4 h-4';

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, placeholder }) => {
  const { t } = useTranslation();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false, // We use CodeBlockLowlight instead
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({ placeholder: placeholder || t('content_ph') }),
      TabHandler,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none text-base leading-relaxed text-zinc-700 dark:text-zinc-300 min-h-[320px]',
        style: "font-family: 'Inter', system-ui, -apple-system, sans-serif",
      },
    },
  });

  // Sync external content changes (e.g. when opening a different note)
  useEffect(() => {
    if (!editor) return;
    const currentHTML = editor.getHTML();
    // Only update if content actually differs (avoids cursor jumps)
    if (content !== currentHTML) {
      editor.commands.setContent(content || '', { emitUpdate: false });
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href;
    const url = window.prompt('URL', previous || 'https://');
    if (url === null) return; // cancelled
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="tiptap-editor">
      {/* ── Fixed Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800/50 -mx-1">
        {/* Undo / Redo */}
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          <Undo2 className={ICON} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <Redo2 className={ICON} />
        </ToolbarBtn>

        <Divider />

        {/* Headings */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <Heading1 className={ICON} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 className={ICON} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 className={ICON} />
        </ToolbarBtn>

        <Divider />

        {/* Text formatting */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold (⌘B)">
          <Bold className={ICON} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic (⌘I)">
          <Italic className={ICON} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline (⌘U)">
          <UnderlineIcon className={ICON} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough className={ICON} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Highlight">
          <Highlighter className={ICON} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline Code">
          <Code className={ICON} />
        </ToolbarBtn>

        <Divider />

        {/* Alignment */}
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
          <AlignLeft className={ICON} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
          <AlignCenter className={ICON} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
          <AlignRight className={ICON} />
        </ToolbarBtn>

        <Divider />

        {/* Lists */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
          <List className={ICON} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
          <ListOrdered className={ICON} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} title="Checklist">
          <CheckSquare className={ICON} />
        </ToolbarBtn>

        <Divider />

        {/* Blocks & Links */}
        <ToolbarBtn onClick={setLink} isActive={editor.isActive('link')} title="Link">
          <LinkIcon className={ICON} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Quote">
          <Quote className={ICON} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code Block">
          <SquareCode className={ICON} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
          <Minus className={ICON} />
        </ToolbarBtn>
      </div>

      {/* ── Editor Content Area ── */}
      <EditorContent editor={editor} />
    </div>
  );
};
