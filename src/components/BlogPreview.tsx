import { memo } from "react";
import { blogPosts } from "@/data/blogPosts";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PinterestSaveButton from "@/components/PinterestSaveButton";

const BlogPreview = memo(() => {
  const recentPosts = blogPosts.slice(0, 3);

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
            <div>
              <span className="text-label text-primary mb-3 block">Inspiration & Shop the Look</span>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium text-display mb-4">
                Style Your Space
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl">
                Get inspired with our styling guides — each post includes shoppable Amazon links.
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
            {recentPosts.map((post) => (
              <article key={post.id} className="group">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-5">
                  <Link to={`/blog/${post.id}`}>
                    <img 
                      src={post.image} 
                      alt={post.title}
                      width={400}
                      height={300}
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </Link>
                  
                  {/* Pinterest Save Button */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <PinterestSaveButton
                      imageUrl={post.image}
                      description={`${post.title} | Home Styling Tips from Cozy Nest Decor`}
                      url={window.location.origin + `/blog/${post.id}`}
                    />
                  </div>
                </div>
                
                {/* Content */}
                <Link to={`/blog/${post.id}`}>
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
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

BlogPreview.displayName = "BlogPreview";

export default BlogPreview;
