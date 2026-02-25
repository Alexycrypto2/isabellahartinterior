import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PinterestSaveButton from "@/components/PinterestSaveButton";
import PageTransition from "@/components/PageTransition";
import Newsletter from "@/components/Newsletter";
import { usePublishedBlogPosts } from "@/hooks/useBlogPosts";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveImageUrl } from "@/lib/imageResolver";

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const { data: posts, isLoading, error } = usePublishedBlogPosts();
  const { data: dbCategories } = useCategories();
  
  const categories = ["ALL", ...(dbCategories?.map(c => c.name) || [])];
  
  const filteredPosts = activeCategory === "ALL" 
    ? posts 
    : posts?.filter(post => post.category === activeCategory);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-label text-accent mb-4 block">Inspiration & Tips</span>
            <h1 className="font-display text-5xl md:text-7xl font-medium text-display mb-6">
              Style Your Space
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get inspired with styling guides, decorating tips, and ideas to transform 
              every room in your home.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Categories */}
      <section className="py-8 bg-background border-b border-border">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === category 
                      ? "bg-accent text-accent-foreground" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[4/3] rounded-2xl" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-xl text-destructive mb-4">
                  Failed to load blog posts. Please try again.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts?.map((post) => (
                  <article key={post.id} className="group">
                    <div className="relative overflow-hidden rounded-2xl mb-5">
                      <Link to={`/blog/${post.slug}`}>
                        {post.image_url ? (
                          <img 
                            src={resolveImageUrl(post.image_url)} 
                            alt={post.title}
                            className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full aspect-[4/3] bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground">No image</span>
                          </div>
                        )}
                      </Link>
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="category-badge">
                          {post.category}
                        </span>
                      </div>
                      
                      {/* Pinterest Save Button */}
                      {post.image_url && (
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <PinterestSaveButton
                            imageUrl={resolveImageUrl(post.image_url)}
                            description={`${post.title} | Home Styling Tips from RoomRefine`}
                            url={window.location.origin + `/blog/${post.slug}`}
                          />
                        </div>
                      )}
                    </div>
                    
                    <Link to={`/blog/${post.slug}`} className="block space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground gap-3">
                        <span>{post.read_time}</span>
                        <span>•</span>
                        <span>{post.author}</span>
                      </div>
                      
                      <h2 className="font-display text-xl font-medium group-hover:text-accent transition-colors duration-300 line-clamp-2">
                        {post.title}
                      </h2>
                      
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                      
                      <span className="inline-block text-sm font-medium text-accent gold-underline">
                        Read More →
                      </span>
                    </Link>
                  </article>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredPosts?.length === 0 && (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground mb-4">
                  No posts found in this category yet.
                </p>
                <button 
                  onClick={() => setActiveCategory("ALL")}
                  className="text-accent font-medium hover:underline"
                >
                  View All Posts
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />

      <Footer />
      </div>
    </PageTransition>
  );
};

export default Blog;
