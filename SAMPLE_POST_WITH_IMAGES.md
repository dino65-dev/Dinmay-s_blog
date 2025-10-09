# Sample Blog Post with Images

This is a sample blog post demonstrating all the image features available in Dinmay's Blog.

## Full Width Image (Default)

![Beautiful Mountain Landscape](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200)

This is a full-width image with default styling. It automatically scales to fit the container and has rounded corners with a subtle shadow.

---

## Sized Images

### Medium Sized Image (Centered)

Here's an image with a specific width, centered on the page:

![Sunset at Beach](https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800 "width:600px center")

Notice how it's centered and has a fixed width of 600px.

### Small Image with Dimensions

![Coffee Cup](https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400 "400x300")

This image is 400px wide and 300px tall using the shorthand syntax.

---

## Floating Images

### Image Floating Right

![Code on Screen](https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400 "width:350px right")

This image floats to the right, allowing text to wrap around it. This is perfect for articles where you want to include relevant images without breaking up the text flow too much. 

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.

<div style="clear: both;"></div>

### Image Floating Left

![Workspace Setup](https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400 "width:300px left")

This image floats to the left with text wrapping on the right side. You can use this layout to create a magazine-style article with images integrated naturally into the text content.

The text flows smoothly around the image, creating an engaging reading experience. This technique works especially well for profile pictures, product images, or any visual element that complements the written content.

More text continues here to demonstrate the wrapping effect. The image stays anchored to the left while the text fills the available space on the right.

<div style="clear: both;"></div>

---

## Responsive Images

### Image with Percentage Width

![Nature Path](https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800 "max-width:80% center")

This image uses `max-width: 80%` to be responsive while not taking up the full width.

### Image with Max Width

![Mountain Peak](https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1000 "max-w:700 center")

This image has a maximum width of 700px but will scale down on smaller screens.

---

## Multiple Images in a Row

![Technology](https://images.unsplash.com/photo-1518770660439-4636190af475?w=400 "width:30%")
![Design](https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400 "width:30%")
![Innovation](https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400 "width:30%")

These three images are displayed inline with 30% width each.

---

## HTML Images (Alternative Method)

You can also use HTML directly for even more control:

<img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600" alt="Computer and Coffee" style="width: 500px; max-width: 100%; border-radius: 12px; margin: 2rem auto; display: block; box-shadow: 0 8px 16px rgba(0,0,0,0.2);" />

This gives you full CSS control over the image styling.

---

## Code Example

Here's how you write these images in markdown:

```markdown
# Default image
![Alt text](https://example.com/image.jpg)

# Sized image
![Alt text](https://example.com/image.jpg "width:600px")

# Sized with shorthand
![Alt text](https://example.com/image.jpg "600x400")

# Centered image
![Alt text](https://example.com/image.jpg "width:500px center")

# Floating right
![Alt text](https://example.com/image.jpg "width:300px right")

# Floating left
![Alt text](https://example.com/image.jpg "width:300px left")

# Responsive with percentage
![Alt text](https://example.com/image.jpg "max-width:80%")
```

---

## Best Practices

1. **Always include alt text** - Important for accessibility and SEO
2. **Use appropriate sizes** - Don't make images unnecessarily large
3. **Consider mobile users** - Use responsive widths when possible
4. **Optimize images** - Compress before uploading
5. **Use meaningful file names** - Helps with organization

---

## Conclusion

With these image features, you can create visually stunning blog posts with complete control over how images are displayed. Experiment with different layouts to find what works best for your content!

![Success](https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800 "width:700px center")

Happy blogging! 🎉
