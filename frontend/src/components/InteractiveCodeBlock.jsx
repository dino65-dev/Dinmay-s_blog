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
  const [animationFrames, setAnimationFrames] = useState([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef(null);
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

  // Animation frame cycling effect
  useEffect(() => {
    if (animationFrames.length > 1 && isAnimating) {
      animationRef.current = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % animationFrames.length);
      }, 100); // 10 fps
      return () => clearInterval(animationRef.current);
    }
  }, [animationFrames, isAnimating]);

  // Run Python code
  const runPython = async () => {
    if (!pyodideRef.current) {
      setError('Python runtime not loaded yet. Please wait...');
      return;
    }
    
    setError(null);
    setOutput('');
    setPlotImage(null);
    setAnimationFrames([]);
    setCurrentFrame(0);
    setIsAnimating(false);
    setIsRunning(true);
    
    try {
      // Detect and load required packages
      const requiredPackages = detectRequiredPackages(code);
      if (requiredPackages.length > 0) {
        await loadRequiredPackages(requiredPackages);
      }
      
      // Check if matplotlib is used
      const usesMatplotlib = code.includes('matplotlib') || code.includes('plt.');
      const usesAnimation = code.includes('FuncAnimation') || code.includes('animation');
      
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
_animation_frames = []

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
      
      // For animations, we need special handling
      if (usesAnimation && usesMatplotlib) {
        // Wrap the animation code to capture frames
        const animSetup = `
from matplotlib.animation import FuncAnimation
import matplotlib.pyplot as plt
import base64
from io import BytesIO

_animation_frames = []
_original_FuncAnimation = FuncAnimation

class _CapturingAnimation:
    def __init__(self, fig, func, frames=None, init_func=None, fargs=None, save_count=None, **kwargs):
        self.fig = fig
        self.func = func
        self.frames = frames if frames is not None else range(100)
        self.init_func = init_func
        self.fargs = fargs or ()
        
        # Capture frames
        if callable(self.frames):
            frame_list = list(self.frames())
        elif hasattr(self.frames, '__iter__'):
            frame_list = list(self.frames)
        else:
            frame_list = range(self.frames)
        
        # Capture all frames - no artificial limit
        frame_list = list(frame_list)
        
        if self.init_func:
            self.init_func()
        
        for i, frame_data in enumerate(frame_list):
            self.func(frame_data, *self.fargs)
            buf = BytesIO()
            self.fig.savefig(buf, format='png', dpi=80, bbox_inches='tight', facecolor='white', edgecolor='none')
            buf.seek(0)
            _animation_frames.append(base64.b64encode(buf.read()).decode('utf-8'))
        
    def save(self, *args, **kwargs):
        pass  # No-op for now

# Monkey-patch FuncAnimation
import matplotlib.animation
matplotlib.animation.FuncAnimation = _CapturingAnimation
`;
        pyodideRef.current.runPython(animSetup);
      }
      
      // Run the user code
      await pyodideRef.current.runPythonAsync(code);
      
      // Get stdout content
      let stdout = pyodideRef.current.runPython('sys.stdout.getvalue()');
      
      // Check for animation frames first
      if (usesAnimation && usesMatplotlib) {
        try {
          const framesJson = pyodideRef.current.runPython(`
import json
json.dumps(_animation_frames)
`);
          const frames = JSON.parse(framesJson);
          if (frames && frames.length > 0) {
            setAnimationFrames(frames.map(f => `data:image/png;base64,${f}`));
            setIsAnimating(true);
            setOutput(stdout || `(Animation with ${frames.length} frames - see below)`);
            return;
          }
        } catch (animErr) {
          console.log('No animation frames captured:', animErr.message);
        }
      }
      
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
    setAnimationFrames([]);
    setCurrentFrame(0);
    setIsAnimating(false);
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
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
    <div className="interactive-code-block">
      <div className="interactive-code__header">
        <div className="interactive-code__identity">
          <div className="interactive-code__lights" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <span className="interactive-code__title">
            {title || `Interactive ${languageNames[language] || language}`}
          </span>
          <span className="interactive-code__language">
            {languageNames[language] || language}
          </span>
        </div>
        <div className="interactive-code__actions">
          <button
            type="button"
            onClick={handleReset}
            className="interactive-code__reset"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning || (language === 'python' && !pyodideReady)}
            className="interactive-code__run"
          >
            {isRunning ? (
              <>
                <svg className="spin" width="12" height="12" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".3" strokeWidth="3" />
                  <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Running...
              </>
            ) : (
              <>
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {language === 'python' && pyodideLoading ? 'Loading Python' : 'Run'}
              </>
            )}
          </button>
        </div>
      </div>

      {language === 'python' && pyodideLoading && (
        <div className="interactive-code__status">
          <svg className="spin" width="14" height="14" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
            <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Loading the Python runtime. The first launch can take a moment.
        </div>
      )}

      {language === 'python' && loadingPackages && (
        <div className="interactive-code__status interactive-code__status--packages">
          <svg className="spin" width="14" height="14" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
            <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Loading the packages used by this example.
        </div>
      )}

      {language === 'python' && loadedPackages.length > 0 && !loadingPackages && !isRunning && (
        <div className="interactive-code__status interactive-code__status--ready">
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Loaded: {loadedPackages.join(', ')}
        </div>
      )}

      <div className="interactive-code__editor">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-label={`${languageNames[language] || language} code editor`}
          placeholder={`Enter your ${languageNames[language] || language} code here...`}
          spellCheck={false}
        />
      </div>

      <div className="interactive-code__output">
        <div className="interactive-code__output-label">Output</div>
        
        {error ? (
          <div className="interactive-code__error">{error}</div>
        ) : isVisualLanguage ? (
          <iframe
            ref={iframeRef}
            className="interactive-code__frame"
            sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
            title="Code output"
          />
        ) : (
          <div className="interactive-code__result">
            <div className="interactive-code__console">
              {output || <span>Click Run to see output.</span>}
            </div>
            {animationFrames.length > 0 && (
              <div className="interactive-code__visual">
                <div className="interactive-code__visual-head">
                  <div>Animation output · {animationFrames.length} frames</div>
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsAnimating(!isAnimating)}
                    >
                      {isAnimating ? 'Pause' : 'Play'}
                    </button>
                    <span>
                      Frame {currentFrame + 1}/{animationFrames.length}
                    </span>
                  </div>
                </div>
                <img 
                  src={animationFrames[currentFrame]} 
                  alt={`Animation frame ${currentFrame + 1}`}
                  className="interactive-code__plot"
                />
                <input
                  type="range"
                  min={0}
                  max={animationFrames.length - 1}
                  value={currentFrame}
                  onChange={(e) => {
                    setIsAnimating(false);
                    setCurrentFrame(parseInt(e.target.value));
                  }}
                  aria-label="Animation frame"
                />
              </div>
            )}
            {plotImage && animationFrames.length === 0 && (
              <div className="interactive-code__visual">
                <div className="interactive-code__visual-head">Plot output</div>
                <img 
                  src={plotImage} 
                  alt="Matplotlib plot output" 
                  className="interactive-code__plot"
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
