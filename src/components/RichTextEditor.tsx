import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { NodeSelection } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  ExternalLink,
  Pencil,
  Unlink,
  Trash2,
  Upload,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: (insertImage: (url: string, alt?: string) => void) => void;
}

const RichTextEditor = ({ content, onChange, onImageUpload }: RichTextEditorProps) => {
  const [editingLink, setEditingLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [editingImage, setEditingImage] = useState(false);
  const [resizingImage, setResizingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageWidth, setImageWidth] = useState('');
  const [imageHeight, setImageHeight] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4 cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your blog post...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4',
      },
      handleClickOn: (view, pos, node) => {
        if (node.type.name !== 'image') return false;
        const { state, dispatch } = view;
        dispatch(state.tr.setSelection(NodeSelection.create(state.doc, pos)));
        return true;
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const requestImage = useCallback((applyImage: (url: string, alt?: string) => void) => {
    if (onImageUpload) {
      onImageUpload((url: string, alt?: string) => applyImage(url, alt));
      return;
    }

    const url = window.prompt('Enter image URL:');
    if (!url) return;

    const alt = window.prompt('Enter image alt text (optional):') || '';
    applyImage(url, alt);
  }, [onImageUpload]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;

    requestImage((url, alt) => {
      editor.chain().focus().setImage({ src: url, alt: alt || '' }).run();
    });
  }, [editor, requestImage]);

  const handleEditLink = useCallback(() => {
    if (!editor) return;
    const href = editor.getAttributes('link').href || '';
    setLinkUrl(href);
    setEditingLink(true);
  }, [editor]);

  const handleSaveLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setEditingLink(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const handleRemoveLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setEditingLink(false);
    setLinkUrl('');
  }, [editor]);

  const handleStartEditImage = useCallback(() => {
    if (!editor) return;
    const attrs = editor.getAttributes('image');
    setImageUrl(attrs.src || '');
    setImageAlt(attrs.alt || '');
    setEditingImage(true);
  }, [editor]);

  const handleSaveImage = useCallback(() => {
    if (!editor) return;
    if (!imageUrl.trim()) return;

    editor.chain().focus().updateAttributes('image', { src: imageUrl.trim(), alt: imageAlt.trim() }).run();
    setEditingImage(false);
  }, [editor, imageUrl, imageAlt]);

  const handleReplaceImage = useCallback(() => {
    if (!editor) return;

    requestImage((url, alt) => {
      const currentAlt = editor.getAttributes('image').alt || '';
      editor
        .chain()
        .focus()
        .updateAttributes('image', { src: url, alt: alt ?? currentAlt })
        .run();
      setEditingImage(false);
    });
  }, [editor, requestImage]);

  const handleRemoveImage = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().deleteSelection().run();
    setEditingImage(false);
    setImageUrl('');
    setImageAlt('');
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <BubbleMenu editor={editor} shouldShow={({ editor }) => editor.isActive('link')}>
        <div className="bg-popover border border-border rounded-lg shadow-lg p-2 flex items-center gap-2 max-w-[400px]">
          {editingLink ? (
            <div className="flex items-center gap-1.5 w-full">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveLink()}
                placeholder="https://..."
                className="flex-1 text-xs px-2 py-1 border border-input rounded bg-background text-foreground min-w-[180px]"
                autoFocus
              />
              <Button type="button" variant="default" size="sm" onClick={handleSaveLink} className="text-xs h-7 px-2">
                Save
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingLink(false)} className="text-xs h-7 px-2">
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={editor.getAttributes('link').href}>
                {editor.getAttributes('link').href}
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={() => window.open(editor.getAttributes('link').href, '_blank')} className="h-7 w-7 p-0" title="Open link">
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleEditLink} className="h-7 w-7 p-0" title="Edit link">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleRemoveLink} className="h-7 w-7 p-0 text-destructive" title="Remove link">
                <Unlink className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </BubbleMenu>

      <BubbleMenu editor={editor} shouldShow={({ editor }) => editor.isActive('image')}>
        <div className="bg-popover border border-border rounded-lg shadow-lg p-2 flex flex-col gap-2 min-w-[280px] max-w-[420px]">
          {editingImage ? (
            <>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Image URL"
                className="text-xs px-2 py-1 border border-input rounded bg-background text-foreground"
                autoFocus
              />
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Alt text"
                className="text-xs px-2 py-1 border border-input rounded bg-background text-foreground"
              />
              <div className="flex items-center gap-1">
                <Button type="button" size="sm" className="text-xs h-7 px-2" onClick={handleSaveImage}>Save</Button>
                <Button type="button" variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => setEditingImage(false)}>Cancel</Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleStartEditImage} title="Edit image URL and alt text">
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
              <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleReplaceImage} title="Replace image file">
                <Upload className="h-3.5 w-3.5 mr-1" />
                Replace
              </Button>
              <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive" onClick={handleRemoveImage} title="Remove image">
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Remove
              </Button>
            </div>
          )}
        </div>
      </BubbleMenu>

      <div className="border-b p-2 flex flex-wrap gap-1 bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1 self-center" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1 self-center" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-muted' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1 self-center" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={setLink}
          className={editor.isActive('link') ? 'bg-muted' : ''}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addImage}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1 self-center" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
