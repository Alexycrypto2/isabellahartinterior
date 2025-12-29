import { blogPosts } from "@/data/blogPosts";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BlogPreview = () => {
  const recentPosts = blogPosts.slice(0, 3);

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
            <div>
              <span className="text-label text-primary mb-3 block">Inspiration & Tips</span>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium text-display mb-4">
                Style Your Space
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl">
                Get inspired with our latest styling guides, tips, and home decor trends.
              </p>
            </div>
            <Link to="/blog" className="mt-6 md:mt-0">
              <Button variant="outline" className="rounded-full">
                View All Posts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {/* Blog Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post, index) => (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className="group"
              >
                <article className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-warm transition-all duration-300">
                  {/* Image */}
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="category-badge">{post.category}</span>
                      <span className="text-sm text-muted-foreground">{post.readTime}</span>
                    </div>
                    
                    <h3 className="font-display text-xl font-medium mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;
