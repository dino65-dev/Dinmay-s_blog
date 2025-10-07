export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">About Dinmay's Blog</h1>
        
        <div className="prose prose-lg dark:prose-invert">
          <p>
            Welcome to my blog! This is a space where I share my thoughts, ideas, 
            and experiences about technology, coding, and life.
          </p>

          <h2>What You'll Find Here</h2>
          <ul>
            <li>Technical tutorials and guides</li>
            <li>Programming tips and tricks</li>
            <li>Web development insights</li>
            <li>Personal reflections on technology</li>
          </ul>

          <h2>About Me</h2>
          <p>
            I'm a passionate developer who loves building things for the web. 
            When I'm not coding, you can find me exploring new technologies, 
            reading tech blogs, or working on side projects.
          </p>

          <h2>Get in Touch</h2>
          <p>
            Feel free to reach out if you have questions, suggestions, or just 
            want to connect. I'd love to hear from you!
          </p>
        </div>
      </div>
    </div>
  )
}