import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Label } from './ui/label';
import api from '../utils/api';

// Memoized Icons for performance
const ImageIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    <circle cx="9" cy="9" r="2"/>
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
));

const LinkIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
));

const VideoIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/>
    <rect x="2" y="6" width="14" height="12" rx="2"/>
  </svg>
));

const CodeIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
  </svg>
));

const ListIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" x2="21" y1="6" y2="6"/>
    <line x1="8" x2="21" y1="12" y2="12"/>
    <line x1="8" x2="21" y1="18" y2="18"/>
    <line x1="3" x2="3.01" y1="6" y2="6"/>
    <line x1="3" x2="3.01" y1="12" y2="12"/>
    <line x1="3" x2="3.01" y1="18" y2="18"/>
  </svg>
));

const HeadingIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h8"/>
    <path d="M4 18V6"/>
    <path d="M12 18V6"/>
    <path d="m17 12 3-2v8"/>
  </svg>
));

const BoldIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/>
  </svg>
));

const ItalicIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" x2="10" y1="4" y2="4"/>
    <line x1="14" x2="5" y1="20" y2="20"/>
    <line x1="15" x2="9" y1="4" y2="20"/>
  </svg>
));

const QuoteIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/>
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
  </svg>
));

const TableIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18"/>
    <rect width="18" height="18" x="3" y="3" rx="2"/>
    <path d="M3 9h18"/>
    <path d="M3 15h18"/>
  </svg>
));

const UploadIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" x2="12" y1="3" y2="15"/>
  </svg>
));

const UndoIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6"/>
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
  </svg>
));

const RedoIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 7v6h-6"/>
    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>
  </svg>
));

const ChevronDownIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
));

// Memoized Line Numbers component for performance
const LineNumbers = memo(({ lineCount, cursorLine }) => {
  const lines = useMemo(() => {
    const count = Math.max(lineCount, 20);
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [lineCount]);

  return (
    <>
      {lines.map((num) => (
        <div 
          key={num} 
          className={`h-[22px] transition-colors ${cursorLine === num ? 'text-[#c9d1d9]' : ''}`}
        >
          {num}
        </div>
      ))}
    </>
  );
});

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
  const [cursorCol, setCursorCol] = useState(1);
  const textareaRef = useRef(null);
  const editorContainerRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const fileInputRef = useRef(null);
  
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
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // History for undo/redo - using ref to avoid re-renders
  const historyRef = useRef({ items: [value || ''], index: 0 });

  // Calculate line count - memoized
  const lineCount = useMemo(() => {
    return (value || '').split('\n').length;
  }, [value]);

  // Sync scroll between textarea and line numbers
  const handleScroll = useCallback((e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  }, []);

  // Track cursor position - debounced for performance
  const handleSelectionChange = useCallback(() => {
    if (textareaRef.current) {
      const cursorPos = textareaRef.current.selectionStart;
      const textBeforeCursor = (value || '').substring(0, cursorPos);
      const lineNumber = textBeforeCursor.split('\n').length;
      const currentLine = textBeforeCursor.split('\n').pop() || '';
      setCursorLine(lineNumber);
      setCursorCol(currentLine.length + 1);
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
    const history = historyRef.current;
    history.items = history.items.slice(0, history.index + 1);
    history.items.push(newValue);
    history.index = history.items.length - 1;
    
    onChange(newValue);
    
    // Set cursor position after insert
    setTimeout(() => {
      const newPos = start + textToInsert.length - selectEnd;
      textarea.focus();
      textarea.setSelectionRange(newPos - selectStart, newPos);
    }, 0);
  }, [value, onChange]);

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
    const history = historyRef.current;
    history.items = history.items.slice(0, history.index + 1);
    history.items.push(newValue);
    history.index = history.items.length - 1;
    
    onChange(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  }, [value, onChange]);

  // Insert at line start
  const insertAtLineStart = useCallback((prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const currentValue = value || '';
    
    let lineStart = start;
    while (lineStart > 0 && currentValue[lineStart - 1] !== '\n') {
      lineStart--;
    }
    
    const newValue = currentValue.substring(0, lineStart) + prefix + currentValue.substring(lineStart);
    
    // Update history
    const history = historyRef.current;
    history.items = history.items.slice(0, history.index + 1);
    history.items.push(newValue);
    history.index = history.items.length - 1;
    
    onChange(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  }, [value, onChange]);

  // Undo
  const handleUndo = useCallback(() => {
    const history = historyRef.current;
    if (history.index > 0) {
      history.index--;
      onChange(history.items[history.index]);
    }
  }, [onChange]);

  // Redo
  const handleRedo = useCallback(() => {
    const history = historyRef.current;
    if (history.index < history.items.length - 1) {
      history.index++;
      onChange(history.items[history.index]);
    }
  }, [onChange]);

  // Toolbar actions - memoized
  const toolbarActions = useMemo(() => ({
    bold: () => wrapSelection('**', '**'),
    italic: () => wrapSelection('*', '*'),
    heading1: () => insertAtLineStart('# '),
    heading2: () => insertAtLineStart('## '),
    heading3: () => insertAtLineStart('### '),
    quote: () => insertAtLineStart('> '),
    bulletList: () => insertAtLineStart('- '),
    numberedList: () => insertAtLineStart('1. '),
    inlineCode: () => wrapSelection('`', '`'),
    strikethrough: () => wrapSelection('~~', '~~'),
    horizontalRule: () => insertAtCursor('\n---\n'),
    checkbox: () => insertAtLineStart('- [ ] '),
  }), [wrapSelection, insertAtLineStart, insertAtCursor]);

  // Handle file upload
  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif', 'image/bmp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload an image (jpg, png, gif, webp, svg, avif, bmp)');
      return;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large. Maximum size is 10MB');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');
    
    try {
      let result;
      
      // Use chunked upload for files > 5MB
      if (file.size > 5 * 1024 * 1024) {
        result = await api.uploadChunked(file, setUploadProgress);
      } else {
        result = await api.uploadImage(file, setUploadProgress);
      }
      
      if (result && result.url) {
        // Get the full URL
        const fullUrl = result.url.startsWith('http') 
          ? result.url 
          : `${process.env.REACT_APP_BACKEND_URL}${result.url}`;
        
        setImageUrl(fullUrl);
        setUploadProgress(100);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.response?.data?.detail || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Handle file input change
  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  // Handle drag events
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
      setImageDialogOpen(true);
    }
  }, [handleFileUpload]);

  // Handle paste for images
  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          handleFileUpload(file);
          setImageDialogOpen(true);
        }
        break;
      }
    }
  }, [handleFileUpload]);

  // Insert image
  const handleInsertImage = useCallback(() => {
    if (imageUrl) {
      const markdown = `![${imageAlt || 'Image'}](${imageUrl})`;
      insertAtCursor(markdown);
      setImageUrl('');
      setImageAlt('');
      setUploadError('');
      setUploadProgress(0);
      setImageDialogOpen(false);
    }
  }, [imageUrl, imageAlt, insertAtCursor]);

  // Insert link
  const handleInsertLink = useCallback(() => {
    if (linkUrl) {
      const markdown = `[${linkText || linkUrl}](${linkUrl})`;
      insertAtCursor(markdown);
      setLinkUrl('');
      setLinkText('');
      setLinkDialogOpen(false);
    }
  }, [linkUrl, linkText, insertAtCursor]);

  // Insert video embed
  const handleInsertVideo = useCallback(() => {
    if (videoUrl) {
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
  }, [videoUrl, insertAtCursor]);

  // Insert code block
  const handleInsertCodeBlock = useCallback(() => {
    const codeBlock = `\n\`\`\`${codeLanguage}\n// Your code here\n\`\`\`\n`;
    insertAtCursor(codeBlock, 17 + codeLanguage.length, 5);
    setCodeBlockDialogOpen(false);
  }, [codeLanguage, insertAtCursor]);

  // Insert table
  const handleInsertTable = useCallback(() => {
    const rows = parseInt(tableRows) || 3;
    const cols = parseInt(tableCols) || 3;
    
    let table = '\n';
    table += '| ' + Array(cols).fill('Header').map((h, i) => `${h} ${i + 1}`).join(' | ') + ' |\n';
    table += '| ' + Array(cols).fill('---').join(' | ') + ' |\n';
    for (let i = 0; i < rows - 1; i++) {
      table += '| ' + Array(cols).fill('Cell').join(' | ') + ' |\n';
    }
    table += '\n';
    
    insertAtCursor(table);
    setTableDialogOpen(false);
  }, [tableRows, tableCols, insertAtCursor]);

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
  const handleContentChange = useCallback((e) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const currentLine = textBeforeCursor.split('\n').pop();
    
    if (currentLine === '/') {
      const rect = e.target.getBoundingClientRect();
      const lineHeight = 22;
      const linesAbove = textBeforeCursor.split('\n').length - 1;
      
      setBlockMenuPosition({
        top: linesAbove * lineHeight + 40,
        left: 70
      });
      setShowBlockMenu(true);
    } else {
      setShowBlockMenu(false);
    }
  }, [onChange]);

  // Interactive code dialog state
  const [interactiveDialogOpen, setInteractiveDialogOpen] = useState(false);
  const [interactiveLang, setInteractiveLang] = useState('javascript');

  // Insert interactive code block
  const handleInsertInteractiveCode = useCallback(() => {
    const sampleCode = {
      javascript: `// Try it! Edit this code and click Run\nconsole.log("Hello, World!");\n\nconst sum = (a, b) => a + b;\nconsole.log("2 + 3 =", sum(2, 3));`,
      python: `# Try it! Edit this code and click Run\nprint("Hello, World!")\n\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nfor i in range(10):\n    print(f"fib({i}) = {fibonacci(i)}")`,
      html: `<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    .container {\n      padding: 20px;\n      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n      border-radius: 10px;\n      color: white;\n      text-align: center;\n    }\n  </style>\n</head>\n<body>\n  <div class="container">\n    <h1>Hello World!</h1>\n    <p>Edit this HTML and click Run to see changes</p>\n  </div>\n</body>\n</html>`,
      css: `/* Try it! Edit and click Run to see changes */\n.demo {\n  padding: 20px;\n  font-family: sans-serif;\n}\n\nh1 {\n  color: #667eea;\n  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);\n}\n\nbutton {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n  border: none;\n  padding: 10px 20px;\n  border-radius: 5px;\n  cursor: pointer;\n}\n\n.box {\n  width: 100px;\n  height: 100px;\n  background: #f0f0f0;\n  margin: 10px;\n  animation: pulse 2s infinite;\n}\n\n@keyframes pulse {\n  0%, 100% { transform: scale(1); }\n  50% { transform: scale(1.1); }\n}`
    };
    const code = sampleCode[interactiveLang] || sampleCode.javascript;
    const interactiveBlock = `\n\`\`\`interactive-${interactiveLang}\n${code}\n\`\`\`\n`;
    insertAtCursor(interactiveBlock);
    setInteractiveDialogOpen(false);
  }, [interactiveLang, insertAtCursor]);

  // Block menu items - memoized
  const blockMenuItems = useMemo(() => [
    { icon: <HeadingIcon />, label: 'Heading 1', shortcut: '#', action: () => { insertAtCursor('# ', 2, 0); setShowBlockMenu(false); } },
    { icon: <HeadingIcon />, label: 'Heading 2', shortcut: '##', action: () => { insertAtCursor('## ', 3, 0); setShowBlockMenu(false); } },
    { icon: <HeadingIcon />, label: 'Heading 3', shortcut: '###', action: () => { insertAtCursor('### ', 4, 0); setShowBlockMenu(false); } },
    { icon: <ImageIcon />, label: 'Image', shortcut: '![]', action: () => { setImageDialogOpen(true); setShowBlockMenu(false); } },
    { icon: <CodeIcon />, label: 'Code Block', shortcut: '```', action: () => { setCodeBlockDialogOpen(true); setShowBlockMenu(false); } },
    { icon: <CodeIcon />, label: 'Interactive Code ✨', shortcut: '▶', action: () => { setInteractiveDialogOpen(true); setShowBlockMenu(false); } },
    { icon: <QuoteIcon />, label: 'Quote', shortcut: '>', action: () => { insertAtCursor('> ', 2, 0); setShowBlockMenu(false); } },
    { icon: <ListIcon />, label: 'Bullet List', shortcut: '-', action: () => { insertAtCursor('- ', 2, 0); setShowBlockMenu(false); } },
    { icon: <TableIcon />, label: 'Table', shortcut: '||', action: () => { setTableDialogOpen(true); setShowBlockMenu(false); } },
  ], [insertAtCursor]);

  return (
    <div 
      className={`flex flex-col h-full ${className}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Title Input */}
      {onTitleChange && (
        <div className="mb-6">
          <input
            type="text"
            value={title || ''}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Title"
            className="w-full text-4xl font-serif text-gray-800 dark:text-gray-200 bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0"
          />
        </div>
      )}

      {/* Main Editor Container */}
      <div className={`flex-1 rounded-lg overflow-hidden border shadow-xl transition-all ${
        isDragging 
          ? 'border-[#58a6ff] border-2 bg-[#58a6ff]/5' 
          : 'border-gray-700'
      }`}>
        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0d1117]/80 pointer-events-none">
            <div className="text-center">
              <UploadIcon />
              <p className="text-[#58a6ff] text-lg mt-2">Drop image here to upload</p>
            </div>
          </div>
        )}

        {/* Editor Header with Tabs and Settings */}
        <div className="flex items-center justify-between bg-[#0d1117] px-1 py-1">
          {/* Edit/Preview Tabs */}
          <div className="flex">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-1.5 text-sm font-medium rounded transition-all ${
                activeTab === 'edit'
                  ? 'text-white bg-[#21262d]'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-1.5 text-sm font-medium rounded transition-all ${
                activeTab === 'preview'
                  ? 'text-white bg-[#21262d]'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Preview
            </button>
          </div>

          {/* Settings */}
          <div className="flex items-center gap-1 pr-2">
            <Select value={indentType} onValueChange={setIndentType}>
              <SelectTrigger className="h-7 w-[80px] text-xs bg-transparent border-[#30363d] text-gray-300 hover:bg-[#21262d] focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#161b22] border-[#30363d]">
                <SelectItem value="spaces" className="text-gray-300 hover:bg-[#21262d]">Spaces</SelectItem>
                <SelectItem value="tabs" className="text-gray-300 hover:bg-[#21262d]">Tabs</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={indentSize} onValueChange={setIndentSize}>
              <SelectTrigger className="h-7 w-[50px] text-xs bg-transparent border-[#30363d] text-gray-300 hover:bg-[#21262d] focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#161b22] border-[#30363d]">
                <SelectItem value="2" className="text-gray-300 hover:bg-[#21262d]">2</SelectItem>
                <SelectItem value="4" className="text-gray-300 hover:bg-[#21262d]">4</SelectItem>
                <SelectItem value="8" className="text-gray-300 hover:bg-[#21262d]">8</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={softWrap} onValueChange={setSoftWrap}>
              <SelectTrigger className="h-7 w-[90px] text-xs bg-transparent border-[#30363d] text-gray-300 hover:bg-[#21262d] focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#161b22] border-[#30363d]">
                <SelectItem value="soft" className="text-gray-300 hover:bg-[#21262d]">Soft wrap</SelectItem>
                <SelectItem value="none" className="text-gray-300 hover:bg-[#21262d]">No wrap</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Editor Content Area */}
        <div 
          ref={editorContainerRef}
          className="min-h-[500px] max-h-[600px] bg-[#0d1117] overflow-hidden relative"
        >
          {activeTab === 'edit' ? (
            <div className="flex h-full">
              {/* Line Numbers */}
              <div 
                ref={lineNumbersRef}
                className="w-14 bg-[#0d1117] text-[#484f58] text-right pr-4 py-3 select-none overflow-hidden border-r border-[#21262d]"
                style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace', fontSize: '14px', lineHeight: '22px' }}
              >
                <LineNumbers lineCount={lineCount} cursorLine={cursorLine} />
              </div>

              {/* Text Editor */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={value || ''}
                  onChange={handleContentChange}
                  onKeyDown={handleKeyDown}
                  onScroll={handleScroll}
                  onPaste={handlePaste}
                  placeholder={placeholder}
                  className={`w-full h-full min-h-[500px] max-h-[600px] p-3 bg-transparent text-[#c9d1d9] resize-none outline-none
                    placeholder-[#484f58]
                    ${softWrap === 'none' ? 'whitespace-pre overflow-x-auto' : 'whitespace-pre-wrap'}`}
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                    fontSize: '14px',
                    lineHeight: '22px',
                    tabSize: parseInt(indentSize),
                    caretColor: '#58a6ff'
                  }}
                  spellCheck={false}
                />

                {/* Block Menu */}
                {showBlockMenu && (
                  <div 
                    className="absolute z-20 bg-[#161b22] border border-[#30363d] rounded-lg shadow-2xl py-1 w-56"
                    style={{ top: blockMenuPosition.top, left: blockMenuPosition.left }}
                  >
                    <div className="px-3 py-1.5 text-xs text-[#484f58] font-medium uppercase tracking-wider">
                      Insert block
                    </div>
                    {blockMenuItems.map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={item.action}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2 text-sm text-[#c9d1d9] hover:bg-[#21262d] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[#58a6ff]">{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        <span className="text-xs text-[#484f58] font-mono">{item.shortcut}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] max-h-[600px] overflow-auto p-6 bg-white dark:bg-[#0d1117]">
              {value ? (
                <div className="prose dark:prose-invert max-w-none">
                  <MarkdownRenderer content={value} />
                </div>
              ) : (
                <p className="text-[#484f58] italic">Nothing to preview yet...</p>
              )}
            </div>
          )}
        </div>

        {/* Editor Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-t border-[#21262d] text-xs text-[#484f58]">
          <div className="flex items-center gap-4">
            <span>
              Use <kbd className="px-1.5 py-0.5 bg-[#21262d] rounded text-[10px] font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-[#21262d] rounded text-[10px] font-mono">Shift</kbd> + <kbd className="px-1.5 py-0.5 bg-[#21262d] rounded text-[10px] font-mono">M</kbd> to toggle the tab key moving focus. Alternatively, use <kbd className="px-1.5 py-0.5 bg-[#21262d] rounded text-[10px] font-mono">esc</kbd> then <kbd className="px-1.5 py-0.5 bg-[#21262d] rounded text-[10px] font-mono">tab</kbd> to move to the next interactive element on the page.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>Ln {cursorLine}, Col {cursorCol}</span>
            <span className="text-[#30363d]">|</span>
            <span>{lineCount} lines</span>
          </div>
        </div>
      </div>

      {/* Quick Insert Toolbar - Below Editor */}
      <div className="flex items-center gap-1 mt-3 flex-wrap">
        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Quick insert:</span>
        
        {/* Formatting */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={toolbarActions.bold} className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                <BoldIcon />
              </button>
            </TooltipTrigger>
            <TooltipContent><p>Bold (Ctrl+B)</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={toolbarActions.italic} className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                <ItalicIcon />
              </button>
            </TooltipTrigger>
            <TooltipContent><p>Italic (Ctrl+I)</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Headings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex items-center gap-1">
              <HeadingIcon />
              <ChevronDownIcon />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white dark:bg-[#161b22] border-gray-200 dark:border-[#30363d]">
            <DropdownMenuItem onClick={toolbarActions.heading1} className="text-gray-700 dark:text-gray-300">
              <span className="font-bold text-lg">H1</span>
              <span className="ml-2 text-gray-500">Heading 1</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toolbarActions.heading2} className="text-gray-700 dark:text-gray-300">
              <span className="font-bold text-base">H2</span>
              <span className="ml-2 text-gray-500">Heading 2</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toolbarActions.heading3} className="text-gray-700 dark:text-gray-300">
              <span className="font-bold text-sm">H3</span>
              <span className="ml-2 text-gray-500">Heading 3</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={toolbarActions.quote} className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                <QuoteIcon />
              </button>
            </TooltipTrigger>
            <TooltipContent><p>Quote</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={toolbarActions.bulletList} className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                <ListIcon />
              </button>
            </TooltipTrigger>
            <TooltipContent><p>Bullet List</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={toolbarActions.inlineCode} className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                <CodeIcon />
              </button>
            </TooltipTrigger>
            <TooltipContent><p>Inline Code</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Insert Image Dialog with Upload */}
        <Dialog open={imageDialogOpen} onOpenChange={(open) => {
          setImageDialogOpen(open);
          if (!open) {
            setUploadError('');
            setUploadProgress(0);
          }
        }}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <button type="button" className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                    <ImageIcon />
                  </button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Insert Image</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="bg-white dark:bg-[#161b22] border-gray-200 dark:border-[#30363d] max-w-md">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Insert Image</DialogTitle>
              <DialogDescription className="text-gray-500 dark:text-gray-400">
                Upload an image or enter a URL directly.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Upload Section */}
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  isDragging 
                    ? 'border-[#58a6ff] bg-[#58a6ff]/10' 
                    : 'border-gray-300 dark:border-[#30363d] hover:border-[#58a6ff]'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  PNG, JPG, GIF, WebP up to 10MB
                </p>
              </div>
              
              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                    <span className="text-[#58a6ff]">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-[#21262d] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#58a6ff] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Upload Error */}
              {uploadError && (
                <p className="text-sm text-red-500">{uploadError}</p>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300 dark:border-[#30363d]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-[#161b22] px-2 text-gray-500">Or enter URL</span>
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl" className="text-gray-700 dark:text-gray-300">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1 bg-white dark:bg-[#0d1117] border-gray-300 dark:border-[#30363d] text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="imageAlt" className="text-gray-700 dark:text-gray-300">Alt Text</Label>
                <Input
                  id="imageAlt"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Description of image"
                  className="mt-1 bg-white dark:bg-[#0d1117] border-gray-300 dark:border-[#30363d] text-gray-900 dark:text-white"
                />
              </div>
              {imageUrl && (
                <div className="border border-gray-200 dark:border-[#30363d] rounded p-2 bg-gray-50 dark:bg-[#0d1117]">
                  <img src={imageUrl} alt="Preview" className="max-h-32 mx-auto" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="border-gray-300 dark:border-[#30363d] text-gray-700 dark:text-gray-300">Cancel</Button>
              </DialogClose>
              <Button onClick={handleInsertImage} disabled={!imageUrl || isUploading} className="bg-[#238636] hover:bg-[#2ea043] text-white">Insert</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <button type="button" className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                    <LinkIcon />
                  </button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Insert Link</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="bg-white dark:bg-[#161b22] border-gray-200 dark:border-[#30363d]">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Insert Link</DialogTitle>
              <DialogDescription className="text-gray-500 dark:text-gray-400">Enter the URL and optional link text.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="linkUrl" className="text-gray-700 dark:text-gray-300">URL</Label>
                <Input
                  id="linkUrl"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="mt-1 bg-white dark:bg-[#0d1117] border-gray-300 dark:border-[#30363d] text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="linkText" className="text-gray-700 dark:text-gray-300">Link Text</Label>
                <Input
                  id="linkText"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Click here"
                  className="mt-1 bg-white dark:bg-[#0d1117] border-gray-300 dark:border-[#30363d] text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="border-gray-300 dark:border-[#30363d] text-gray-700 dark:text-gray-300">Cancel</Button>
              </DialogClose>
              <Button onClick={handleInsertLink} className="bg-[#238636] hover:bg-[#2ea043] text-white">Insert</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <button type="button" className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                    <VideoIcon />
                  </button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Insert Video</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="bg-white dark:bg-[#161b22] border-gray-200 dark:border-[#30363d]">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Insert Video</DialogTitle>
              <DialogDescription className="text-gray-500 dark:text-gray-400">Enter a YouTube URL or direct video URL.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="videoUrl" className="text-gray-700 dark:text-gray-300">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="mt-1 bg-white dark:bg-[#0d1117] border-gray-300 dark:border-[#30363d] text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="border-gray-300 dark:border-[#30363d] text-gray-700 dark:text-gray-300">Cancel</Button>
              </DialogClose>
              <Button onClick={handleInsertVideo} className="bg-[#238636] hover:bg-[#2ea043] text-white">Insert</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={codeBlockDialogOpen} onOpenChange={setCodeBlockDialogOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <button type="button" className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors font-mono text-xs">
                    {'</>'}
                  </button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Insert Code Block</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="bg-white dark:bg-[#161b22] border-gray-200 dark:border-[#30363d]">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Insert Code Block</DialogTitle>
              <DialogDescription className="text-gray-500 dark:text-gray-400">Select the programming language.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="codeLanguage" className="text-gray-700 dark:text-gray-300">Language</Label>
                <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                  <SelectTrigger className="mt-1 bg-white dark:bg-[#0d1117] border-gray-300 dark:border-[#30363d] text-gray-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#161b22] border-gray-200 dark:border-[#30363d]">
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
                <Button variant="outline" className="border-gray-300 dark:border-[#30363d] text-gray-700 dark:text-gray-300">Cancel</Button>
              </DialogClose>
              <Button onClick={handleInsertCodeBlock} className="bg-[#238636] hover:bg-[#2ea043] text-white">Insert</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <button type="button" className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                    <TableIcon />
                  </button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent><p>Insert Table</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="bg-white dark:bg-[#161b22] border-gray-200 dark:border-[#30363d]">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Insert Table</DialogTitle>
              <DialogDescription className="text-gray-500 dark:text-gray-400">Choose the table dimensions.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tableRows" className="text-gray-700 dark:text-gray-300">Rows</Label>
                  <Input
                    id="tableRows"
                    type="number"
                    min="2"
                    max="20"
                    value={tableRows}
                    onChange={(e) => setTableRows(e.target.value)}
                    className="mt-1 bg-white dark:bg-[#0d1117] border-gray-300 dark:border-[#30363d] text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="tableCols" className="text-gray-700 dark:text-gray-300">Columns</Label>
                  <Input
                    id="tableCols"
                    type="number"
                    min="2"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(e.target.value)}
                    className="mt-1 bg-white dark:bg-[#0d1117] border-gray-300 dark:border-[#30363d] text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="border-gray-300 dark:border-[#30363d] text-gray-700 dark:text-gray-300">Cancel</Button>
              </DialogClose>
              <Button onClick={handleInsertTable} className="bg-[#238636] hover:bg-[#2ea043] text-white">Insert</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Direct Upload Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                type="button" 
                onClick={() => {
                  setImageDialogOpen(true);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <UploadIcon />
              </button>
            </TooltipTrigger>
            <TooltipContent><p>Upload Image</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Undo/Redo */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyRef.current.index <= 0}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <UndoIcon />
              </button>
            </TooltipTrigger>
            <TooltipContent><p>Undo (Ctrl+Z)</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleRedo}
                disabled={historyRef.current.index >= historyRef.current.items.length - 1}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <RedoIcon />
              </button>
            </TooltipTrigger>
            <TooltipContent><p>Redo (Ctrl+Y)</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex-1" />
        
        {/* File attachment hint */}
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Attach files by dragging & dropping, selecting or pasting them.
        </span>
      </div>
    </div>
  );
};

export default memo(AdvancedMarkdownEditor);
