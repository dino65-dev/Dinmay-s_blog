import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * InteractiveCodeBlock - A client-side code playground
 * Supports HTML, CSS, JavaScript, and Python (via Pyodide)
 * All execution happens in the browser - no server load
 * Supports numpy, matplotlib, pandas, scipy, and other scientific packages
 */
const InteractiveCodeBlock = ({ 
  language = 'javascript', 
  initialCode = '', 
  title = '' 
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [pyodideLoading, setPyodideLoading] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [loadedPackages, setLoadedPackages] = useState([]);
  const [plotImage, setPlotImage] = useState(null);
  const iframeRef = useRef(null);
  const pyodideRef = useRef(null);

  // Package mappings - some imports need different package names
  const packageMappings = {
    'numpy': 'numpy',
    'np': 'numpy',
    'matplotlib': 'matplotlib',
    'plt': 'matplotlib',
    'pandas': 'pandas',
    'pd': 'pandas',
    'scipy': 'scipy',
    'sklearn': 'scikit-learn',
    'cv2': 'opencv-python',
    'PIL': 'Pillow',
    'sympy': 'sympy',
    'networkx': 'networkx',
  };

  // Detect which packages are needed from code
  const detectRequiredPackages = (codeText) => {
    const packages = new Set();
    const importPatterns = [
      /import\s+(\w+)/g,                           // import numpy
      /from\s+(\w+)/g,                             // from numpy import
      /import\s+(\w+)\s+as\s+\w+/g,                // import numpy as np
    ];
    
    importPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(codeText)) !== null) {
        const importName = match[1];
        // Check if this import maps to a package
        Object.keys(packageMappings).forEach(key => {
          if (importName === key || importName.startsWith(key + '.')) {
            packages.add(packageMappings[key]);
          }
        });
      }
    });
    
    return Array.from(packages);
  };

  // Load Pyodide for Python execution
  const loadPyodide = useCallback(async () => {
    if (pyodideRef.current || pyodideLoading) return;
    
    setPyodideLoading(true);
    try {
      // Dynamically load Pyodide script
      if (!window.loadPyodide) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        script.async = true;
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      pyodideRef.current = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
      });
      setPyodideReady(true);
    } catch (err) {
      setError('Failed to load Python runtime: ' + err.message);
    } finally {
      setPyodideLoading(false);
    }
  }, [pyodideLoading]);

  // Initialize Pyodide when Python is selected
  useEffect(() => {
    if (language === 'python' && !pyodideRef.current && !pyodideLoading) {
      loadPyodide();
    }
  }, [language, loadPyodide, pyodideLoading]);

  // Run JavaScript code
  const runJavaScript = () => {
    setError(null);
    setOutput('');
    
    try {
      // Create a sandboxed environment
      const logs = [];
      const mockConsole = {
        log: (...args) => logs.push(args.map(a => 
          typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
        ).join(' ')),
        error: (...args) => logs.push('Error: ' + args.join(' ')),
        warn: (...args) => logs.push('Warning: ' + args.join(' ')),
        info: (...args) => logs.push('Info: ' + args.join(' ')),
      };
      
      // Execute in isolated scope
      const fn = new Function('console', code);
      const result = fn(mockConsole);
      
      if (result !== undefined) {
        logs.push('=> ' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)));
      }
      
      setOutput(logs.join('\n'));
    } catch (err) {
      setError(err.message);
    }
  };

  // Load required packages
  const loadRequiredPackages = async (packages) => {
    if (!pyodideRef.current || packages.length === 0) return;
    
    const packagesToLoad = packages.filter(pkg => !loadedPackages.includes(pkg));
    if (packagesToLoad.length === 0) return;
    
    setLoadingPackages(true);
    try {
      // Special handling for matplotlib - need micropip for some packages
      if (packagesToLoad.includes('matplotlib')) {
        await pyodideRef.current.loadPackage('micropip');
      }
      
      // Load packages
      for (const pkg of packagesToLoad) {
        try {
          if (pkg === 'scikit-learn') {
            // scikit-learn needs special handling
            const micropip = pyodideRef.current.pyimport('micropip');
            await micropip.install('scikit-learn');
          } else {
            await pyodideRef.current.loadPackage(pkg);
          }
        } catch (pkgErr) {
          console.warn(`Failed to load ${pkg}:`, pkgErr.message);
        }
      }
      
      setLoadedPackages([...loadedPackages, ...packagesToLoad]);
    } catch (err) {
      console.error('Package loading error:', err);
    } finally {
      setLoadingPackages(false);
    }
  };

  // Run Python code
  const runPython = async () => {
    if (!pyodideRef.current) {
      setError('Python runtime not loaded yet. Please wait...');
      return;
    }
    
    setError(null);
    setOutput('');
    setPlotImage(null);
    setIsRunning(true);
    
    try {
      // Detect and load required packages
      const requiredPackages = detectRequiredPackages(code);
      if (requiredPackages.length > 0) {
        await loadRequiredPackages(requiredPackages);
      }
      
      // Check if matplotlib is used
      const usesMatplotlib = code.includes('matplotlib') || code.includes('plt.');
      
      // Setup code for matplotlib if needed
      let setupCode = `
import sys
from io import StringIO
sys.stdout = StringIO()
`;
      
      if (usesMatplotlib) {
        setupCode = `
import sys
from io import StringIO, BytesIO
import base64
sys.stdout = StringIO()

# Configure matplotlib for non-interactive backend
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# Clear any existing figures
plt.close('all')

# Store all figures created during execution
_captured_figures = []

# Override plt.show() to capture the figure instead of displaying
_original_show = plt.show
def _capture_show(*args, **kwargs):
    fig = plt.gcf()
    if fig.get_axes():
        buf = BytesIO()
        fig.savefig(buf, format='png', dpi=100, bbox_inches='tight', facecolor='white', edgecolor='none')
        buf.seek(0)
        _captured_figures.append(base64.b64encode(buf.read()).decode('utf-8'))
plt.show = _capture_show

# Also override figure() to track new figures
_original_figure = plt.figure
def _tracked_figure(*args, **kwargs):
    return _original_figure(*args, **kwargs)
`;
      }
      
      // Run setup code
      pyodideRef.current.runPython(setupCode);
      
      // Run the user code
      await pyodideRef.current.runPythonAsync(code);
      
      // Get stdout content
      let stdout = pyodideRef.current.runPython('sys.stdout.getvalue()');
      
      // If matplotlib was used, capture the plot as base64 image
      if (usesMatplotlib) {
        const plotCode = `
import matplotlib.pyplot as plt
import base64
from io import BytesIO

# First check if we captured any figures from plt.show()
plot_base64 = ''
if _captured_figures:
    plot_base64 = _captured_figures[-1]  # Use the last captured figure
else:
    # No plt.show() was called, try to capture the current figure
    fig = plt.gcf()
    if fig.get_axes():  # Only if there are axes (a plot was created)
        buf = BytesIO()
        fig.savefig(buf, format='png', dpi=100, bbox_inches='tight', facecolor='white', edgecolor='none')
        buf.seek(0)
        plot_base64 = base64.b64encode(buf.read()).decode('utf-8')

plt.close('all')
plot_base64
`;
        try {
          const plotData = pyodideRef.current.runPython(plotCode);
          if (plotData) {
            setPlotImage(`data:image/png;base64,${plotData}`);
          }
        } catch (plotErr) {
          // No plot generated, that's fine
          console.log('No plot to capture:', plotErr.message);
        }
      }
      
      setOutput(stdout || (usesMatplotlib && !stdout ? '(Plot generated - see below)' : '(No output)'));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  // Run HTML/CSS code in iframe
  const runHTML = () => {
    setError(null);
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(code);
      doc.close();
    }
  };

  // Run CSS (wraps in HTML)
  const runCSS = () => {
    setError(null);
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>${code}</style>
</head>
<body>
  <div class="demo">
    <h1>CSS Demo</h1>
    <p>This is a paragraph to style.</p>
    <button>A Button</button>
    <div class="box">A Box</div>
    <ul>
      <li>List item 1</li>
      <li>List item 2</li>
      <li>List item 3</li>
    </ul>
  </div>
</body>
</html>
      `;
      doc.open();
      doc.write(htmlContent);
      doc.close();
    }
  };

  // Main run handler
  const handleRun = () => {
    setIsRunning(true);
    
    switch (language) {
      case 'javascript':
      case 'js':
        runJavaScript();
        setIsRunning(false);
        break;
      case 'python':
      case 'py':
        runPython();
        break;
      case 'html':
        runHTML();
        setIsRunning(false);
        break;
      case 'css':
        runCSS();
        setIsRunning(false);
        break;
      default:
        setError('Unsupported language: ' + language);
        setIsRunning(false);
    }
  };

  // Reset code
  const handleReset = () => {
    setCode(initialCode);
    setOutput('');
    setError(null);
    setPlotImage(null);
  };

  // Language display names
  const languageNames = {
    javascript: 'JavaScript',
    js: 'JavaScript',
    python: 'Python',
    py: 'Python',
    html: 'HTML',
    css: 'CSS'
  };

  const isVisualLanguage = ['html', 'css'].includes(language);

  return (
    <div className="interactive-code-block my-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {title || `Interactive ${languageNames[language] || language}`}
          </span>
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            {languageNames[language] || language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning || (language === 'python' && !pyodideReady && !pyodideLoading)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Running...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Run
              </>
            )}
          </button>
        </div>
      </div>

      {/* Python loading indicator */}
      {language === 'python' && pyodideLoading && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading Python runtime (Pyodide)... This may take a moment.
        </div>
      )}

      {/* Package loading indicator */}
      {language === 'python' && loadingPackages && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading packages (numpy, matplotlib, etc.)... This may take a moment for large packages.
        </div>
      )}

      {/* Loaded packages indicator */}
      {language === 'python' && loadedPackages.length > 0 && !loadingPackages && !isRunning && (
        <div className="px-4 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Loaded: {loadedPackages.join(', ')}
        </div>
      )}

      {/* Code Editor */}
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full min-h-[200px] p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-y focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          placeholder={`Enter your ${languageNames[language] || language} code here...`}
          spellCheck={false}
        />
      </div>

      {/* Output Section */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-400">
          Output
        </div>
        
        {error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-mono whitespace-pre-wrap">
            {error}
          </div>
        ) : isVisualLanguage ? (
          <iframe
            ref={iframeRef}
            className="w-full min-h-[200px] bg-white"
            sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
            title="Code output"
          />
        ) : (
          <div className="bg-gray-900">
            <div className="p-4 text-gray-100 text-sm font-mono whitespace-pre-wrap min-h-[100px]">
              {output || <span className="text-gray-500">Click "Run" to see output...</span>}
            </div>
            {/* Plot image display for matplotlib */}
            {plotImage && (
              <div className="p-4 bg-white border-t border-gray-700">
                <div className="text-xs text-gray-600 mb-2 font-medium">📊 Plot Output:</div>
                <img 
                  src={plotImage} 
                  alt="Matplotlib plot output" 
                  className="max-w-full h-auto rounded-lg shadow-md"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveCodeBlock;
