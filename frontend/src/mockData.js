export const mockBlogPosts = [
  {
    id: '1',
    title: 'Becoming the Best Research Engineer I Can Be',
    slug: 'becoming-best-research-engineer',
    publishedDate: 'Apr 19, 2025',
    excerpt: 'My journey and goals in research engineering',
    featuredImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=500&fit=crop',
    content: '# Becoming the Best Research Engineer I Can Be\n\nThis is a journey about continuous improvement and learning.\n\n## Key Areas of Focus\n\n1. **Technical Excellence**: Mastering the fundamentals\n2. **Research Skills**: Staying current with latest developments\n3. **Communication**: Sharing knowledge effectively\n\n### Mathematical Foundations\n\nThe loss function can be expressed as:\n\n$$L(\\theta) = \\frac{1}{n}\\sum_{i=1}^{n}(y_i - f(x_i; \\theta))^2$$\n\n## Code Example\n\n```python\ndef train_model(data, epochs=100):\n    model = NeuralNetwork()\n    optimizer = Adam(lr=0.001)\n    \n    for epoch in range(epochs):\n        loss = model.forward(data)\n        optimizer.step()\n    \n    return model\n```\n\nResearch engineering requires both theoretical understanding and practical implementation skills.',
    contentType: 'markdown'
  },
  {
    id: '2',
    title: 'Flying Over Manhattan',
    slug: 'flying-over-manhattan',
    publishedDate: 'Nov 15, 2024',
    excerpt: 'An incredible aerial experience over New York City',
    featuredImage: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=500&fit=crop',
    content: '# Flying Over Manhattan\n\nThe experience of flying over Manhattan is truly breathtaking.\n\n## The Flight Path\n\nWe followed the Hudson River corridor, providing stunning views of:\n- The Statue of Liberty\n- One World Trade Center\n- Central Park\n\n### Navigation Calculations\n\nThe heading adjustment can be calculated using:\n\n$$\\theta_{new} = \\theta_{old} + \\Delta\\theta \\cdot \\frac{wind\\_speed}{ground\\_speed}$$\n\n```javascript\nfunction calculateHeading(currentHeading, windSpeed, groundSpeed) {\n  const correction = (windSpeed / groundSpeed) * 15;\n  return currentHeading + correction;\n}\n```',
    contentType: 'markdown'
  },
  {
    id: '3',
    title: 'Bay Area Commute Time Tracking',
    slug: 'bay-area-commute-time-tracking',
    publishedDate: 'Jul 21, 2024',
    excerpt: 'Analyzing commute patterns in the San Francisco Bay Area',
    featuredImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=500&fit=crop',
    content: '# Bay Area Commute Time Tracking\n\nAn analysis of commute times across different Bay Area routes.\n\n## Methodology\n\nI tracked my commute times over 6 months using GPS data.\n\n### Statistical Analysis\n\nAverage commute time: $\\mu = 45$ minutes\nStandard deviation: $\\sigma = 12$ minutes\n\nThe probability distribution follows:\n\n$$P(t) = \\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{(t-\\mu)^2}{2\\sigma^2}}$$\n\n```python\nimport numpy as np\nimport pandas as pd\n\ndef analyze_commute_data(times):\n    mean = np.mean(times)\n    std = np.std(times)\n    return {"mean": mean, "std": std}\n```',
    contentType: 'markdown'
  },
  {
    id: '4',
    title: 'First Solo Flight',
    slug: 'first-solo-flight',
    publishedDate: 'Jun 17, 2024',
    excerpt: 'The memorable day of my first solo flight',
    featuredImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=500&fit=crop',
    content: '# First Solo Flight\n\nToday marks a significant milestone - my first solo flight.\n\n## Pre-flight Checklist\n\nBefore any flight, a thorough checklist is essential:\n1. Weather briefing\n2. Aircraft inspection\n3. Flight plan filing\n\n### Lift Equation\n\nThe fundamental equation of flight:\n\n$$L = \\frac{1}{2}\\rho v^2 S C_L$$\n\nWhere:\n- $L$ is lift force\n- $\\rho$ is air density\n- $v$ is velocity\n- $S$ is wing area\n- $C_L$ is lift coefficient',
    contentType: 'markdown'
  },
  {
    id: '5',
    title: 'Understanding Neural Networks',
    slug: 'understanding-neural-networks',
    publishedDate: 'May 10, 2024',
    excerpt: 'A deep dive into neural network architectures',
    featuredImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=500&fit=crop',
    content: '# Understanding Neural Networks\n\nNeural networks are the foundation of modern AI systems.\n\n## Architecture\n\nA typical feedforward network consists of:\n- Input layer\n- Hidden layers\n- Output layer\n\n### Backpropagation\n\nThe gradient is computed using the chain rule:\n\n$$\\frac{\\partial L}{\\partial w} = \\frac{\\partial L}{\\partial a}\\frac{\\partial a}{\\partial z}\\frac{\\partial z}{\\partial w}$$\n\n```python\nclass NeuralNetwork:\n    def __init__(self, layers):\n        self.weights = [np.random.randn(y, x) \n                       for x, y in zip(layers[:-1], layers[1:])]\n        self.biases = [np.random.randn(y, 1) \n                      for y in layers[1:]]\n    \n    def forward(self, x):\n        activation = x\n        for w, b in zip(self.weights, self.biases):\n            activation = sigmoid(np.dot(w, activation) + b)\n        return activation\n```',
    contentType: 'markdown'
  }
];

export const mockAboutContent = '# About Dinmay\n\nWelcome to my personal blog where I share my thoughts, experiences, and learnings.\n\n## What I Write About\n\nI write about technology, research, aviation, and personal projects. This blog serves as a documentation of my journey and a way to share knowledge with others.\n\n## Background\n\nI\'m passionate about:\n- Machine Learning and AI\n- Software Engineering\n- Aviation\n- Data Analysis\n\nFeel free to reach out if you\'d like to discuss any of these topics!';
