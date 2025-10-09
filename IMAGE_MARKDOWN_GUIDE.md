# Image Markdown Guide for Dinmay's Blog

This guide shows you how to add images to your blog posts with full control over sizing and positioning.

## Basic Syntax

### 1. Simple Image (Full Width, Auto Height)
```markdown
![Alt text](https://example.com/image.jpg)
```
- Default: max-width 100%, auto height, rounded corners

### 2. Image with Specific Width
```markdown
![Alt text](https://example.com/image.jpg "width:500px")
```
or
```markdown
![Alt text](https://example.com/image.jpg "w:500")
```

### 3. Image with Width and Height
```markdown
![Alt text](https://example.com/image.jpg "width:600px height:400px")
```
or shorter:
```markdown
![Alt text](https://example.com/image.jpg "600x400")
```

### 4. Image with Max-Width (Responsive)
```markdown
![Alt text](https://example.com/image.jpg "max-width:80%")
```
or
```markdown
![Alt text](https://example.com/image.jpg "max-w:800")
```

## Alignment Options

### Center Alignment
```markdown
![Alt text](https://example.com/image.jpg "width:500px center")
```

### Left Alignment (Float Left)
```markdown
![Alt text](https://example.com/image.jpg "width:300px left")
```
Text will wrap around the right side of the image.

### Right Alignment (Float Right)
```markdown
![Alt text](https://example.com/image.jpg "width:300px right")
```
Text will wrap around the left side of the image.

## Combining Multiple Options

You can combine width, height, max-width, and alignment:

```markdown
![Beautiful Landscape](https://example.com/landscape.jpg "width:700px max-w:90% center")
```

## HTML Image Tags (Alternative)

You can also use HTML directly for more control:

```html
<img src="https://example.com/image.jpg" alt="Description" width="600" height="400" />
```

Or with inline styles:
```html
<img src="https://example.com/image.jpg" alt="Description" 
     style="width: 500px; max-width: 100%; border-radius: 12px; margin: 2rem auto; display: block;" />
```

## Examples in Practice

### Example 1: Hero Image (Full Width)
```markdown
# My Amazing Post

![Hero Image](https://images.unsplash.com/photo-1234567890)

This is the intro text...
```

### Example 2: Inline Image (Medium Size, Centered)
```markdown
Here's what I mean:

![Diagram](https://example.com/diagram.png "width:600px center")

As you can see in the diagram above...
```

### Example 3: Side-by-Side Images
```markdown
![Image 1](https://example.com/img1.jpg "width:48% left")
![Image 2](https://example.com/img2.jpg "width:48% right")

<div style="clear: both;"></div>

Continue with regular text...
```

### Example 4: Small Thumbnail with Text Wrap
```markdown
![Profile](https://example.com/profile.jpg "width:200px right")

This is a long paragraph that will wrap around the image on the left. 
The image will float to the right side, and the text will flow naturally 
around it, creating a nice magazine-style layout.
```

### Example 5: Gallery Style (Multiple Images)
```markdown
## Project Screenshots

![Screenshot 1](https://example.com/ss1.jpg "width:400px")
![Screenshot 2](https://example.com/ss2.jpg "width:400px")
![Screenshot 3](https://example.com/ss3.jpg "width:400px")
```

## Image Loading States

The blog automatically handles:
- ✅ Loading spinner while image loads
- ✅ Error state if image fails to load
- ✅ Smooth transitions and hover effects
- ✅ Dark mode compatibility

## Best Practices

1. **Always include alt text** for accessibility
2. **Use appropriate dimensions** - Don't make images unnecessarily large
3. **Consider mobile** - Use max-width or percentage widths for responsive design
4. **Optimize images** - Use compressed images for faster loading
5. **Use center alignment** for important showcase images
6. **Use float left/right** for small images with text wrap

## Recommended Image Sources

- Unsplash: https://unsplash.com (free high-quality photos)
- Imgur: https://imgur.com (direct image hosting)
- Your own hosting: Upload images to your server

## Quick Reference

| Syntax | Result |
|--------|--------|
| `![alt](url)` | Default image (full width) |
| `![alt](url "500x300")` | 500px wide, 300px tall |
| `![alt](url "w:600")` | 600px wide, auto height |
| `![alt](url "width:80%")` | 80% of container width |
| `![alt](url "w:500 center")` | 500px wide, centered |
| `![alt](url "w:300 left")` | 300px wide, float left |
| `![alt](url "w:300 right")` | 300px wide, float right |

---

**Note**: All images are automatically styled with rounded corners, shadows, and hover effects for a professional look.
