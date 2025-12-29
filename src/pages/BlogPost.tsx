import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import PinterestSaveButton from "@/components/PinterestSaveButton";
import { blogPosts } from "@/data/blogPosts";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find(p => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-32 pb-32 container mx-auto px-6 text-center">
          <h1 className="font-display text-4xl font-medium mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The article you're looking for doesn't exist.
          </p>
          <Link to="/blog">
            <Button variant="outline" className="rounded-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="font-display text-4xl md:text-5xl font-medium mb-6 mt-8">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="font-display text-2xl md:text-3xl font-medium mb-4 mt-10">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="font-display text-xl md:text-2xl font-medium mb-3 mt-8">{line.slice(4)}</h3>;
        }
        if (line.startsWith('- **')) {
          const content = line.slice(2);
          const match = content.match(/\*\*(.+?)\*\*:?\s*(.*)/);
          if (match) {
            return (
              <li key={index} className="mb-2 ml-6 text-muted-foreground">
                <strong className="text-foreground">{match[1]}</strong>
                {match[2] && `: ${match[2]}`}
              </li>
            );
          }
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="mb-2 ml-6 text-muted-foreground">{line.slice(2)}</li>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className="text-muted-foreground leading-relaxed mb-4">{line}</p>;
      });
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-8">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Link to="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
            
            <span className="category-badge mb-4 inline-block">{post.category}</span>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium text-display mb-6 leading-tight">
              {post.title}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              {post.excerpt}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pb-8 border-b border-border">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="pb-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto relative">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full aspect-video object-cover rounded-2xl"
            />
            {/* Pinterest Save Button */}
            <div className="absolute top-4 right-4">
              <PinterestSaveButton
                imageUrl={post.image}
                description={`${post.title} | Home Styling Tips from Cozy Nest Decor`}
                url={window.location.href}
                size="medium"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container mx-auto px-6">
          <article className="max-w-3xl mx-auto prose-lg">
            {renderContent(post.content)}
          </article>
        </div>
      </section>

      {/* Related Posts */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-3xl font-medium text-center mb-10">
              More Inspiration
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {blogPosts.filter(p => p.id !== post.id).slice(0, 3).map((relatedPost) => (
                <Link key={relatedPost.id} to={`/blog/${relatedPost.id}`} className="group">
                  <div className="rounded-2xl overflow-hidden mb-4">
                    <img 
                      src={relatedPost.image} 
                      alt={relatedPost.title}
                      className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <span className="category-badge mb-2 inline-block text-[10px]">{relatedPost.category}</span>
                  <h3 className="font-display text-lg font-medium group-hover:text-primary transition-colors line-clamp-2">
                    {relatedPost.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer />
    </div>
  );
};

export default BlogPost;
