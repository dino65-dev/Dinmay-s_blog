import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

// Icons as SVG components
const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    <circle cx="9" cy="9" r="2"/>
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
);

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const VideoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/>
    <rect x="2" y="6" width="14" height="12" rx="2"/>
  </svg>
);

const CodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
  </svg>
);

const CodeBlockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3"/>
    <polyline points="14 2 14 8 20 8"/>
    <path d="m10 13-2 2 2 2"/>
    <path d="m14 17 2-2-2-2"/>
  </svg>
);

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" x2="21" y1="6" y2="6"/>
    <line x1="8" x2="21" y1="12" y2="12"/>
    <line x1="8" x2="21" y1="18" y2="18"/>
    <line x1="3" x2="3.01" y1="6" y2="6"/>
    <line x1="3" x2="3.01" y1="12" y2="12"/>
    <line x1="3" x2="3.01" y1="18" y2="18"/>
  </svg>
);

const HeadingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h8"/>
    <path d="M4 18V6"/>
    <path d="M12 18V6"/>
    <path d="m17 12 3-2v8"/>
  </svg>
);

const BoldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/>
  </svg>
);

const ItalicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" x2="10" y1="4" y2="4"/>
    <line x1="14" x2="5" y1="20" y2="20"/>
    <line x1="15" x2="9" y1="4" y2="20"/>
  </svg>
);

const QuoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/>
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
  </svg>
);

const TableIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18"/>
    <rect width="18" height="18" x="3" y="3" rx="2"/>
    <path d="M3 9h18"/>
    <path d="M3 15h18"/>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/>
    <path d="M12 5v14"/>
  </svg>
);

const UndoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6"/>
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
  </svg>
);

const RedoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 7v6h-6"/>
    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>
  </svg>
);

const AdvancedMarkdownEditor = ({ 
  value, 
  onChange, 
  title,
  onTitleChange,
  placeholder = "Start writing your content...",
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState('edit');
  const [indentType, setIndentType] = useState('spaces');
  const [indentSize, setIndentSize] = useState('2');
  const [softWrap, setSoftWrap] = useState('soft');
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [blockMenuPosition, setBlockMenuPosition] = useState({ top: 0, left: 0 });
  const [cursorLine, setCursorLine] = useState(1);
  const textareaRef = useRef(null);
  const editorContainerRef = useRef(null);
  const lineNumbersRef = useRef(null);
  
  // Dialog states
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [codeBlockDialogOpen, setCodeBlockDialogOpen] = useState(false);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  
  // Dialog form states
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [tableRows, setTableRows] = useState('3');
  const [tableCols, setTableCols] = useState('3');

  // History for undo/redo
  const [history, setHistory] = useState([value || '']);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Calculate line numbers
  const lines = useMemo(() => {
    const content = value || '';
    return content.split('\n');
  }, [value]);

  const lineCount = lines.length;

  // Sync scroll between textarea and line numbers
  const handleScroll = useCallback((e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  }, []);

  // Track cursor position for line highlighting
  const handleSelectionChange = useCallback(() => {
    if (textareaRef.current) {
      const cursorPos = textareaRef.current.selectionStart;
      const textBeforeCursor = (value || '').substring(0, cursorPos);
      const lineNumber = textBeforeCursor.split('\n').length;
      setCursorLine(lineNumber);
    }
  }, [value]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('click', handleSelectionChange);
      textarea.addEventListener('keyup', handleSelectionChange);
      return () => {
        textarea.removeEventListener('click', handleSelectionChange);
        textarea.removeEventListener('keyup', handleSelectionChange);
      };
    }
  }, [handleSelectionChange]);

  // Insert text at cursor position
  const insertAtCursor = useCallback((textToInsert, selectStart = 0, selectEnd = 0) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = value || '';
    
    const newValue = currentValue.substring(0, start) + textToInsert + currentValue.substring(end);
    
    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newValue);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    onChange(newValue);
    
    // Set cursor position after insert
    setTimeout(() => {
      const newPos = start + textToInsert.length - selectEnd;
      textarea.focus();
      textarea.setSelectionRange(newPos - selectStart, newPos);
    }, 0);
  }, [value, onChange, history, historyIndex]);

  // Wrap selected text
  const wrapSelection = useCallback((before, after) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = value || '';
    const selectedText = currentValue.substring(start, end);
    
    const newValue = currentValue.substring(0, start) + before + selectedText + after + currentValue.substring(end);
    
    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newValue);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    onChange(newValue);
    
    // Reselect the wrapped text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  }, [value, onChange, history, historyIndex]);

  // Insert at line start
  const insertAtLineStart = useCallback((prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const currentValue = value || '';
    
    // Find the start of the current line
    let lineStart = start;
    while (lineStart > 0 && currentValue[lineStart - 1] !== '\n') {
      lineStart--;
    }
    
    const newValue = currentValue.substring(0, lineStart) + prefix + currentValue.substring(lineStart);
    
    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newValue);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    onChange(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  }, [value, onChange, history, historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      onChange(history[historyIndex - 1]);
    }
  }, [historyIndex, history, onChange]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      onChange(history[historyIndex + 1]);
    }
  }, [historyIndex, history, onChange]);

  // Toolbar actions
  const toolbarActions = {
    bold: () => wrapSelection('**', '**'),
    italic: () => wrapSelection('*', '*'),
    heading1: () => insertAtLineStart('# '),
    heading2: () => insertAtLineStart('## '),
    heading3: () => insertAtLineStart('### '),
    quote: () => insertAtLineStart('> '),
    bulletList: () => insertAtLineStart('- '),
    numberedList: () => insertAtLineStart('1. '),
    inlineCode: () => wrapSelection('`', '`'),
  };

  // Insert image
  const handleInsertImage = () => {
    if (imageUrl) {
      const markdown = `![${imageAlt || 'Image'}](${imageUrl})`;
      insertAtCursor(markdown);
      setImageUrl('');
      setImageAlt('');
      setImageDialogOpen(false);
    }
  };

  // Insert link
  const handleInsertLink = () => {
    if (linkUrl) {
      const markdown = `[${linkText || linkUrl}](${linkUrl})`;
      insertAtCursor(markdown);
      setLinkUrl('');
      setLinkText('');
      setLinkDialogOpen(false);
    }
  };

  // Insert video embed
  const handleInsertVideo = () => {
    if (videoUrl) {
      // Extract video ID for YouTube
      let embedCode = '';
      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        let videoId = '';
        if (videoUrl.includes('youtu.be/')) {
          videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
        } else {
          const urlParams = new URLSearchParams(videoUrl.split('?')[1]);
          videoId = urlParams.get('v');
        }
        if (videoId) {
          embedCode = `\n<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>\n`;
        }
      } else {
        embedCode = `\n<video controls src="${videoUrl}"></video>\n`;
      }
      insertAtCursor(embedCode);
      setVideoUrl('');
      setVideoDialogOpen(false);
    }
  };

  // Insert code block
  const handleInsertCodeBlock = () => {
    const codeBlock = `\n\`\`\`${codeLanguage}\n// Your code here\n\`\`\`\n`;
    insertAtCursor(codeBlock, 17 + codeLanguage.length, 5);
    setCodeBlockDialogOpen(false);
  };

  // Insert table
  const handleInsertTable = () => {
    const rows = parseInt(tableRows) || 3;
    const cols = parseInt(tableCols) || 3;
    
    let table = '\n';
    // Header row
    table += '| ' + Array(cols).fill('Header').map((h, i) => `${h} ${i + 1}`).join(' | ') + ' |\n';
    // Separator
    table += '| ' + Array(cols).fill('---').join(' | ') + ' |\n';
    // Data rows
    for (let i = 0; i < rows - 1; i++) {
      table += '| ' + Array(cols).fill('Cell').join(' | ') + ' |\n';
    }
    table += '\n';
    
    insertAtCursor(table);
    setTableDialogOpen(false);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          toolbarActions.bold();
          break;
        case 'i':
          e.preventDefault();
          toolbarActions.italic();
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
          break;
        case 'y':
          e.preventDefault();
          handleRedo();
          break;
        default:
          break;
      }
    }
    
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const indent = indentType === 'tabs' ? '\t' : ' '.repeat(parseInt(indentSize));
      insertAtCursor(indent);
    }
  }, [toolbarActions, handleUndo, handleRedo, insertAtCursor, indentType, indentSize]);

  // Show block menu on new line with /
  const handleContentChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Check if user typed / at the start of a line
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const currentLine = textBeforeCursor.split('\n').pop();
    
    if (currentLine === '/') {
      const rect = e.target.getBoundingClientRect();
      const lineHeight = 24; // Approximate line height
      const linesAbove = textBeforeCursor.split('\n').length - 1;
      
      setBlockMenuPosition({
        top: linesAbove * lineHeight,
        left: 60
      });
      setShowBlockMenu(true);
    } else {
      setShowBlockMenu(false);
    }
  };

  // Block menu items
  const blockMenuItems = [
    { icon: <HeadingIcon />, label: 'Heading 1', action: () => { insertAtCursor('# ', 2, 0); setShowBlockMenu(false); } },
    { icon: <HeadingIcon />, label: 'Heading 2', action: () => { insertAtCursor('## ', 3, 0); setShowBlockMenu(false); } },
    { icon: <ImageIcon />, label: 'Image', action: () => { setImageDialogOpen(true); setShowBlockMenu(false); } },
    { icon: <CodeBlockIcon />, label: 'Code Block', action: () => { setCodeBlockDialogOpen(true); setShowBlockMenu(false); } },
    { icon: <QuoteIcon />, label: 'Quote', action: () => { insertAtCursor('> ', 2, 0); setShowBlockMenu(false); } },
    { icon: <ListIcon />, label: 'Bullet List', action: () => { insertAtCursor('- ', 2, 0); setShowBlockMenu(false); } },
    { icon: <TableIcon />, label: 'Table', action: () => { setTableDialogOpen(true); setShowBlockMenu(false); } },
  ];

  // Toolbar button component
  const ToolbarButton = ({ icon, tooltip, onClick, active = false }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            className={`w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-200 hover:scale-110
              ${active 
                ? 'bg-emerald-500 border-emerald-500 text-white' 
                : 'border-emerald-500 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
              }`}
          >
            {icon}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Title Input */}
      {onTitleChange && (
        <div className="mb-4">
          <input
            type="text"
            value={title || ''}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Title"
            className="w-full text-4xl font-serif text-gray-300 bg-transparent border-none outline-none placeholder-gray-500 dark:placeholder-gray-600"
          />
        </div>
      )}

      {/* Insert Block Button & Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {/* Add Block Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setShowBlockMenu(!showBlockMenu)}
                className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-600 text-gray-400 hover:border-emerald-500 hover:text-emerald-500 transition-all duration-200"
              >
                <PlusIcon />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add block (or type / )</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Formatting Toolbar */}
        <ToolbarButton icon={<BoldIcon />} tooltip="Bold (Ctrl+B)" onClick={toolbarActions.bold} />
        <ToolbarButton icon={<ItalicIcon />} tooltip="Italic (Ctrl+I)" onClick={toolbarActions.italic} />
        <ToolbarButton icon={<HeadingIcon />} tooltip="Heading" onClick={toolbarActions.heading2} />
        
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Insert Toolbar */}
        <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
          <DialogTrigger asChild>
            <div>
              <ToolbarButton icon={<ImageIcon />} tooltip="Insert Image" onClick={() => setImageDialogOpen(true)} />
            </div>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle>Insert Image</DialogTitle>
              <DialogDescription>Enter the image URL and optional alt text.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="imageAlt">Alt Text</Label>
                <Input
                  id="imageAlt"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Description of image"
                  className="mt-1"
                />
              </div>
              {imageUrl && (
                <div className="border rounded p-2 bg-gray-50 dark:bg-gray-700">
                  <img src={imageUrl} alt="Preview" className="max-h-32 mx-auto" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleInsertImage}>Insert</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <DialogTrigger asChild>
            <div>
              <ToolbarButton icon={<LinkIcon />} tooltip="Insert Link" onClick={() => setLinkDialogOpen(true)} />
            </div>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle>Insert Link</DialogTitle>
              <DialogDescription>Enter the URL and optional link text.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="linkUrl">URL</Label>
                <Input
                  id="linkUrl"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="linkText">Link Text</Label>
                <Input
                  id="linkText"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Click here"
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleInsertLink}>Insert</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
          <DialogTrigger asChild>
            <div>
              <ToolbarButton icon={<VideoIcon />} tooltip="Insert Video" onClick={() => setVideoDialogOpen(true)} />
            </div>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle>Insert Video</DialogTitle>
              <DialogDescription>Enter a YouTube URL or direct video URL.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleInsertVideo}>Insert</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={codeBlockDialogOpen} onOpenChange={setCodeBlockDialogOpen}>
          <DialogTrigger asChild>
            <div>
              <ToolbarButton icon={<CodeIcon />} tooltip="Insert Code Block" onClick={() => setCodeBlockDialogOpen(true)} />
            </div>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle>Insert Code Block</DialogTitle>
              <DialogDescription>Select the programming language for syntax highlighting.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="codeLanguage">Language</Label>
                <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="csharp">C#</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="css">CSS</SelectItem>
                    <SelectItem value="sql">SQL</SelectItem>
                    <SelectItem value="bash">Bash</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleInsertCodeBlock}>Insert</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ToolbarButton icon={<CodeBlockIcon />} tooltip="Inline Code" onClick={toolbarActions.inlineCode} />

        <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
          <DialogTrigger asChild>
            <div>
              <ToolbarButton icon={<TableIcon />} tooltip="Insert Table" onClick={() => setTableDialogOpen(true)} />
            </div>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle>Insert Table</DialogTitle>
              <DialogDescription>Choose the table dimensions.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tableRows">Rows</Label>
                  <Input
                    id="tableRows"
                    type="number"
                    min="2"
                    max="20"
                    value={tableRows}
                    onChange={(e) => setTableRows(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="tableCols">Columns</Label>
                  <Input
                    id="tableCols"
                    type="number"
                    min="2"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleInsertTable}>Insert</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ToolbarButton icon={<ListIcon />} tooltip="Bullet List" onClick={toolbarActions.bulletList} />
        <ToolbarButton icon={<QuoteIcon />} tooltip="Quote" onClick={toolbarActions.quote} />

        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Undo/Redo */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 transition-colors"
              >
                <UndoIcon />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo (Ctrl+Z)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 transition-colors"
              >
                <RedoIcon />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Redo (Ctrl+Y)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Editor Header with Tabs and Settings */}
      <div className="flex items-center justify-between bg-gray-900 dark:bg-gray-950 rounded-t-lg border border-b-0 border-gray-700">
        {/* Edit/Preview Tabs */}
        <div className="flex">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'edit'
                ? 'text-white bg-gray-800'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'text-white bg-gray-800'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            Preview
          </button>
        </div>

        {/* Settings */}
        <div className="flex items-center gap-2 px-2">
          <Select value={indentType} onValueChange={setIndentType}>
            <SelectTrigger className="h-7 w-20 text-xs bg-transparent border-gray-600 text-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spaces">Spaces</SelectItem>
              <SelectItem value="tabs">Tabs</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={indentSize} onValueChange={setIndentSize}>
            <SelectTrigger className="h-7 w-14 text-xs bg-transparent border-gray-600 text-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="8">8</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={softWrap} onValueChange={setSoftWrap}>
            <SelectTrigger className="h-7 w-24 text-xs bg-transparent border-gray-600 text-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="soft">Soft wrap</SelectItem>
              <SelectItem value="none">No wrap</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Editor Content Area */}
      <div 
        ref={editorContainerRef}
        className="flex-1 min-h-[400px] bg-gray-900 dark:bg-gray-950 border border-gray-700 rounded-b-lg overflow-hidden relative"
      >
        {activeTab === 'edit' ? (
          <div className="flex h-full relative">
            {/* Line Numbers */}
            <div 
              ref={lineNumbersRef}
              className="w-12 bg-gray-900 dark:bg-gray-950 text-gray-500 text-right pr-3 py-3 font-mono text-sm select-none overflow-hidden border-r border-gray-700"
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace' }}
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <div 
                  key={i + 1} 
                  className={`leading-6 h-6 ${cursorLine === i + 1 ? 'text-emerald-400' : ''}`}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Text Editor */}
            <textarea
              ref={textareaRef}
              value={value || ''}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              placeholder={placeholder}
              className={`flex-1 h-full p-3 bg-transparent text-gray-100 font-mono text-sm resize-none outline-none leading-6
                ${softWrap === 'none' ? 'whitespace-pre overflow-x-auto' : 'whitespace-pre-wrap'}`}
              style={{ 
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                tabSize: parseInt(indentSize)
              }}
              spellCheck={false}
            />

            {/* Block Menu */}
            {showBlockMenu && (
              <div 
                className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2 w-48"
                style={{ top: blockMenuPosition.top + 40, left: blockMenuPosition.left }}
              >
                {blockMenuItems.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={item.action}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-emerald-500">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full overflow-auto p-6 bg-white dark:bg-gray-800">
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="text-gray-400 italic">Nothing to preview yet...</p>
            )}
          </div>
        )}
      </div>

      {/* Editor Footer */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
        <span>
          Use <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Shift</kbd> + <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">M</kbd> to toggle tab focus. Type <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">/</kbd> for block commands.
        </span>
        <span>{lineCount} lines</span>
      </div>
    </div>
  );
};

export default AdvancedMarkdownEditor;
