import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

export function Footer() {
  return (
    &lt;footer className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"&gt;
      &lt;div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"&gt;
        &lt;div className="grid grid-cols-1 md:grid-cols-3 gap-8"&gt;
          {/* Brand */}
          &lt;div&gt;
            &lt;h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"&gt;
              Dinmay's Blog
            &lt;/h3&gt;
            &lt;p className="text-sm text-gray-600 dark:text-gray-400"&gt;
              Sharing thoughts, ideas, and stories about technology, coding, and life.
            &lt;/p&gt;
          &lt;/div&gt;

          {/* Quick Links */}
          &lt;div&gt;
            &lt;h4 className="font-semibold mb-4"&gt;Quick Links&lt;/h4&gt;
            &lt;ul className="space-y-2 text-sm"&gt;
              &lt;li&gt;
                &lt;Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"&gt;
                  Home
                &lt;/Link&gt;
              &lt;/li&gt;
              &lt;li&gt;
                &lt;Link href="/posts" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"&gt;
                  All Posts
                &lt;/Link&gt;
              &lt;/li&gt;
              &lt;li&gt;
                &lt;Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"&gt;
                  About
                &lt;/Link&gt;
              &lt;/li&gt;
              &lt;li&gt;
                &lt;Link href="/admin" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"&gt;
                  Admin
                &lt;/Link&gt;
              &lt;/li&gt;
            &lt;/ul&gt;
          &lt;/div&gt;

          {/* Social */}
          &lt;div&gt;
            &lt;h4 className="font-semibold mb-4"&gt;Connect&lt;/h4&gt;
            &lt;div className="flex space-x-4"&gt;
              &lt;a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"&gt;
                &lt;Github className="w-5 h-5" /&gt;
              &lt;/a&gt;
              &lt;a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"&gt;
                &lt;Twitter className="w-5 h-5" /&gt;
              &lt;/a&gt;
              &lt;a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"&gt;
                &lt;Linkedin className="w-5 h-5" /&gt;
              &lt;/a&gt;
              &lt;a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"&gt;
                &lt;Mail className="w-5 h-5" /&gt;
              &lt;/a&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;

        &lt;div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400"&gt;
          &lt;p&gt;&copy; {new Date().getFullYear()} Dinmay's Blog. All rights reserved.&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/footer&gt;
  )
}