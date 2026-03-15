import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import PinterestSaveButton from "@/components/PinterestSaveButton";
import JsonLd from "@/components/JsonLd";
import StarRating from "@/components/StarRating";
import ProductReviewForm from "@/components/ProductReviewForm";
import { useProductBySlug, useActiveProducts } from "@/hooks/useProducts";
import { useProductReviews } from "@/hooks/useProductReviews";
import { useProductMedia } from "@/hooks/useProductMedia";
import ProductMediaGallery from "@/components/ProductMediaGallery";
import { useCart } from "@/hooks/useCart";
import { trackProductClick } from "@/lib/analytics";
import { withUtm } from "@/lib/utm";
import { resolveImageUrl } from "@/lib/imageResolver";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShoppingCart, ChevronRight, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProductBySlug(slug || "");
  const { data: reviews } = useProductReviews(product?.id || "");
  const { data: allProducts } = useActiveProducts();
  const { data: productMedia = [] } = useProductMedia(product?.id || "");
  const { addToCart, isInCart } = useCart();

  const imageUrl = product ? resolveImageUrl(product.image_url) : "";
  const productUrl = product ? `${window.location.origin}/shop/${product.slug}` : "";

  const ogTitle = product ? product.name : "";
  const ogDescription = product ? product.description : "";
  const ogImage = product ? resolveImageUrl(product.image_url) : "";
  const priceAmount = product ? product.price : "";

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen">
          <Navigation />
          <div className="container mx-auto px-6 pt-28 pb-16">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
              <Skeleton className="aspect-square rounded-2xl" />
              <div className="space-y-4 pt-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error || !product) {
    return (
      <PageTransition>
        <div className="min-h-screen">
          <Navigation />
          <div className="container mx-auto px-6 pt-28 pb-16 text-center">
            <h1 className="font-display text-3xl font-semibold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist or is no longer available.</p>
            <Button asChild className="rounded-full">
              <Link to="/shop">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Shop
              </Link>
            </Button>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: imageUrl,
    url: productUrl,
    offers: {
      "@type": "Offer",
      price: product.price.replace("$", ""),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: product.affiliate_url,
    },
    ...(product.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviews || 0,
          },
        }
      : {}),
  };

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Helmet>
          <title>{ogTitle} | Isabelle Hart Interiors</title>
          <meta property="og:type" content="product" />
          <meta property="og:title" content={ogTitle} />
          <meta property="og:description" content={ogDescription} />
          <meta property="og:image" content={ogImage} />
          <meta property="og:url" content={window.location.href} />
          <meta property="og:site_name" content="Isabelle Hart Interiors" />
          <meta property="og:price:amount" content={priceAmount} />
          <meta property="og:price:currency" content="USD" />
          <meta property="og:availability" content="in stock" />
          <meta property="product:price:amount" content={priceAmount} />
          <meta property="product:price:currency" content="USD" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={ogTitle} />
          <meta name="twitter:description" content={ogDescription} />
          <meta name="twitter:image" content={ogImage} />
          <meta name="pinterest:description" content={`${ogTitle} - ${product.price} | Shop top-rated home decor from Isabelle Hart Interiors`} />
          <meta name="description" content={ogDescription} />
        </Helmet>
        <Navigation />
        <JsonLd data={productJsonLd} />

        <div className="container mx-auto px-6 pt-28 pb-16">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-8">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/shop">Shop</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>{product.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Image Gallery */}
              <ProductMediaGallery
                media={productMedia}
                fallbackImage={imageUrl}
                productName={product.name}
                badge={product.badge}
              >
                <PinterestSaveButton
                  imageUrl={imageUrl}
                  description={`${product.name} - ${product.price}`}
                  url={productUrl}
                  price={product.price}
                  isBestseller={product.badge === "Bestseller" || product.badge === "Top Pick"}
                  isOnSale={product.badge === "Sale"}
                />
              </ProductMediaGallery>

              {/* Details */}
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                  {product.category}
                </span>
                <h1 className="font-display text-3xl md:text-4xl font-semibold mb-4">
                  {product.meta_title || product.name}
                </h1>

                {/* Rating */}
                {product.rating > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <StarRating rating={product.rating} size="md" />
                    <span className="text-sm text-muted-foreground">
                      ({product.reviews || 0} reviews)
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-semibold text-foreground">{product.price}</span>
                  {product.original_price && (
                    <span className="text-lg text-muted-foreground line-through">
                      {product.original_price}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {product.meta_description || product.description}
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full flex-1"
                    onClick={() => trackProductClick(product.id, product.name, "product-detail", "shop-button")}
                  >
                    <a
                      href={withUtm(product.affiliate_url, "product-detail", "shop-button")}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      <ExternalLink className="mr-2 w-4 h-4" />
                      Shop on Amazon
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full"
                    onClick={() => addToCart(product.id, product.name)}
                  >
                    <ShoppingCart className={`mr-2 w-4 h-4 ${isInCart(product.id) ? "text-accent" : ""}`} />
                    {isInCart(product.id) ? "In Cart" : "Add to Cart"}
                  </Button>
                </div>

                {/* Review Form */}
                <div className="border-t border-border pt-6">
                  <ProductReviewForm
                    productId={product.id}
                    productRating={product.rating || 0}
                    productReviews={product.reviews || 0}
                  />
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            {reviews && reviews.length > 0 && (
              <div className="mt-16">
                <h2 className="font-display text-2xl font-semibold mb-6">
                  Customer Reviews ({reviews.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-card rounded-xl p-5 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{review.reviewer_name}</span>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      {review.review_text && (
                        <p className="text-sm text-muted-foreground">{review.review_text}</p>
                      )}
                      <span className="text-xs text-muted-foreground mt-2 block">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* You May Also Like */}
            {(() => {
              const related = allProducts
                ?.filter((p) => p.id !== product.id && p.category === product.category)
                .slice(0, 4) || [];
              const fallback = related.length < 4
                ? allProducts?.filter((p) => p.id !== product.id && !related.find((r) => r.id === p.id)).slice(0, 4 - related.length) || []
                : [];
              const items = [...related, ...fallback];
              if (items.length === 0) return null;
              return (
                <div className="mt-16">
                  <h2 className="font-display text-2xl font-semibold mb-6">You May Also Like</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((p) => (
                      <Link
                        key={p.id}
                        to={`/shop/${p.slug}`}
                        className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-shadow"
                      >
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={resolveImageUrl(p.image_url)}
                            alt={p.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-4">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{p.category}</span>
                          <h3 className="font-medium text-sm line-clamp-1 mt-1">{p.name}</h3>
                          <span className="text-sm font-semibold mt-1 block">{p.price}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Affiliate Note */}
            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground">
                💡 As an Amazon Associate, I earn from qualifying purchases. Prices may vary.
              </p>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default ProductDetail;
