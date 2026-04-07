import { memo, useMemo } from "react";
import { useProductCategories, useProductCategoryAssignments } from "@/hooks/useProducts";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import livingRoomImg from "@/assets/rooms/living-room.jpg";
import bedroomImg from "@/assets/rooms/bedroom.jpg";
import bathroomImg from "@/assets/rooms/bathroom.jpg";
import kitchenImg from "@/assets/rooms/kitchen.jpg";
import homeOfficeImg from "@/assets/rooms/home-office.jpg";
import entrywayImg from "@/assets/rooms/entryway.jpg";
import outdoorPatioImg from "@/assets/rooms/outdoor-patio.jpg";

const roomImages: Record<string, string> = {
  "living-room": livingRoomImg,
  "bedroom": bedroomImg,
  "bathroom": bathroomImg,
  "kitchen": kitchenImg,
  "home-office": homeOfficeImg,
  "entryway": entrywayImg,
  "outdoor-patio": outdoorPatioImg,
};

const Categories = memo(() => {
  const { data: dbCategories } = useProductCategories();
  const { data: assignments } = useProductCategoryAssignments();

  const displayCategories = (dbCategories || []).filter(cat => cat.slug !== "all-rooms" && cat.slug !== "all");

  const getCategoryCount = (slug: string) => {
    if (!assignments) return 0;
    return assignments.filter(a => a.category_slug === slug).length;
  };

  return (
    <section className="py-24 bg-muted/30 dark:bg-muted/20">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-medium text-accent uppercase tracking-widest mb-3 block"
            >
              Shop by Room
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4"
            >
              Explore Every Room
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              Curated Amazon finds for every room — handpicked by our design team.
            </motion.p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {displayCategories.map((category, index) => {
              const count = getCategoryCount(category.slug);
              const coverImg = category.cover_image_url || roomImages[category.slug];
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
                    <div className="rounded-2xl overflow-hidden border border-border hover:border-accent/40 hover:shadow-xl transition-all duration-300 relative aspect-[4/5] group">
                      {coverImg && (
                        <img
                          src={coverImg}
                          alt={`${category.name} decor`}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                          width={400}
                          height={500}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                        <span className="text-2xl mb-1 block">{category.icon || "📦"}</span>
                        <h3 className="font-display text-lg md:text-xl font-semibold mb-0.5">
                          {category.name}
                        </h3>
                        <p className="text-xs text-white/70 mb-2">
                          {count} {count === 1 ? "product" : "products"}
                        </p>
                        {category.description && (
                          <p className="text-xs text-white/60 line-clamp-2 hidden md:block">{category.description}</p>
                        )}
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">
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
