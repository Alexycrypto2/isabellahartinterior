import { memo } from "react";
import { useActiveProducts, useProductCategories } from "@/hooks/useProducts";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Categories = memo(() => {
  const { data: dbCategories } = useProductCategories();
  const { data: products } = useActiveProducts();

  // Use DB categories, filter out "All Products"
  const displayCategories = (dbCategories || []).filter(cat => cat.slug !== "all");

  // Count products per category
  const getCategoryCount = (slug: string) => {
    if (!products) return 0;
    return products.filter(p => p.category === slug).length;
  };

  return (
    <section className="py-24 bg-muted/30 dark:bg-muted/20">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-medium text-accent uppercase tracking-widest mb-3 block"
            >
              Browse Top-Rated on Amazon
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4"
            >
              Shop by Category
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              Curated Amazon finds for every room and style — handpicked by our design team.
            </motion.p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {displayCategories.map((category, index) => {
              const count = getCategoryCount(category.slug);
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Link
                    to={`/shop?category=${category.slug}`}
                    className="group block"
                  >
                    <div className="bg-card rounded-2xl p-6 md:p-8 text-center border border-border hover:border-accent/40 hover:shadow-lg transition-all duration-300 relative overflow-hidden dark:bg-card/80">
                      {/* Hover gradient */}
                      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative z-10">
                        <span className="text-4xl md:text-5xl mb-4 block group-hover:scale-110 transition-transform duration-300">
                          {category.icon || "📦"}
                        </span>
                        <h3 className="font-display text-base md:text-lg font-semibold text-foreground mb-1">
                          {category.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          {count} {count === 1 ? "product" : "products"}
                        </p>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Browse <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* View All CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-10"
          >
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline transition-colors"
            >
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

Categories.displayName = "Categories";

export default Categories;
