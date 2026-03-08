import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import DOMPurify from "dompurify";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PinterestSaveButton from "@/components/PinterestSaveButton";
import PageTransition from "@/components/PageTransition";
import BlogCategoryLinks from "@/components/BlogCategoryLinks";
import BlogProductShowcase from "@/components/BlogProductShowcase";
import ShopTheLookInline from "@/components/ShopTheLookInline";
import JsonLd from "@/components/JsonLd";
import { useBlogPostBySlug, usePublishedBlogPosts } from "@/hooks/useBlogPosts";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trackBlogView } from "@/lib/analytics";
import { resolveImageUrl } from "@/lib/imageResolver";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPostBySlug(slug || '');
  const { data: allPosts } = usePublishedBlogPosts();

  // Track blog view
  useEffect(() => {
    if (post) {
      trackBlogView(post.id, post.title);
    }
  }, [post]);

  // Make TOC collapsible on mobile — toggle toc-open class
  useEffect(() => {
    const tocEl = document.querySelector('.blog-toc');
    if (!tocEl) return;

    // Start open on desktop, closed on mobile
    if (window.innerWidth > 768) {
      tocEl.classList.add('toc-open');
    }

    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      // Toggle when clicking the TOC header (first <p>)
      if (target.tagName === 'P' || target.closest('.blog-toc > p')) {
        tocEl.classList.toggle('toc-open');
      }
    };

    tocEl.addEventListener('click', handleClick);
    // Add cursor pointer to the header on mobile
    const header = tocEl.querySelector(':scope > p');
    if (header && window.innerWidth <= 768) {
      (header as HTMLElement).style.cursor = 'pointer';
      header.innerHTML = header.innerHTML + ' <span style="float:right;font-size:12px;">▼</span>';
    }

    return () => tocEl.removeEventListener('click', handleClick);
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-32 pb-32 container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="aspect-video rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
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

  /**
   * SECURITY: Content rendering with XSS protection
   */
  const sanitizeHtml = (html: string): string => {
    const sanitized = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'div', 'span'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel', 'style', 'loading', 'id'],
    });
    return sanitized
      .replace(/src="(\/?(src\/assets\/[^"]+))"/g, (_match, path) => {
        return `src="${resolveImageUrl(path)}"`;
      })
      .replace(/<img /g, '<img loading="lazy" ');
  };

  const relatedPosts = (() => {
    if (!allPosts) return [];
    const others = allPosts.filter(p => p.id !== post.id);
    const sameCategory = others.filter(p => p.category === post.category);
    const differentCategory = others.filter(p => p.category !== post.category);
    return [...sameCategory, ...differentCategory].slice(0, 3);
  })();

  // Extract FAQ data from content for schema markup
  const extractFaqFromContent = (content: string): { question: string; answer: string }[] => {
    const faqs: { question: string; answer: string }[] = [];
    const faqRegex = /<div class="faq-item"[^>]*>[\s\S]*?<h3[^>]*>(.*?)<\/h3>[\s\S]*?<p[^>]*>(.*?)<\/p>[\s\S]*?<\/div>/gi;
    let match;
    while ((match = faqRegex.exec(content)) !== null) {
      const question = match[1].replace(/<[^>]*>/g, '').trim();
      const answer = match[2].replace(/<[^>]*>/g, '').trim();
      if (question && answer) {
        faqs.push({ question, answer });
      }
    }
    return faqs;
  };

  const faqItems = extractFaqFromContent(post.content);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: resolveImageUrl(post.image_url),
    datePublished: post.created_at,
    dateModified: post.updated_at,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "RoomRefine",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": window.location.href,
    },
  };

  // FAQ Schema JSON-LD
  const faqJsonLd = faqItems.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  } : null;

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navigation />
        <JsonLd data={articleJsonLd} />
        {faqJsonLd && <JsonLd data={faqJsonLd} />}

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
                <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.read_time}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.image_url && (
        <section className="pb-12">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto relative">
              <img 
                src={resolveImageUrl(post.image_url)} 
                alt={`${post.title} - ${post.category} styling tips by ${post.author}`}
                className="w-full aspect-[1200/630] object-cover rounded-2xl"
                loading="lazy"
              />
              <div className="absolute top-4 right-4">
                <PinterestSaveButton
                  imageUrl={resolveImageUrl(post.image_url)}
                  description={`${post.title} | Home Styling Tips from Cozy Nest Decor`}
                  url={window.location.href}
                  size="medium"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="pb-12">
        <div className="container mx-auto px-6">
          <article 
            className="max-w-3xl mx-auto prose prose-lg prose-headings:font-display prose-headings:font-medium prose-a:text-accent blog-content"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
          />

          {/* Shop the Look - inline smart matching */}
          <div className="max-w-3xl mx-auto">
            <ShopTheLookInline 
              blogTitle={post.title}
              blogContent={post.content}
              category={post.category}
            />
          </div>

          {/* Product Showcase */}
          <div className="max-w-4xl mx-auto">
            <BlogProductShowcase category={post.category} />
          </div>

          {/* Internal Links to Product Categories */}
          <div className="max-w-3xl mx-auto">
            <BlogCategoryLinks category={post.category} />
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="font-display text-3xl font-medium text-center mb-3">
                Related Posts
              </h2>
              <p className="text-muted-foreground text-center mb-10">
                More from <span className="font-medium text-foreground">{post.category}</span> and beyond
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`} className="group">
                    <div className="rounded-2xl overflow-hidden mb-4">
                      {relatedPost.image_url ? (
                        <img 
                          src={resolveImageUrl(relatedPost.image_url)} 
                          alt={`${relatedPost.title} - ${relatedPost.category} home decor tips`}
                          className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full aspect-[4/3] bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">No image</span>
                        </div>
                      )}
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
      )}

      <Footer />
      </div>
    </PageTransition>
  );
};

export default BlogPost;
