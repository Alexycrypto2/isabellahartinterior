import { memo } from "react";
import { categories } from "@/data/products";
import { Link } from "react-router-dom";

const Categories = memo(() => {
  const displayCategories = categories.filter(cat => cat.id !== 'all');

  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-label text-primary mb-3 block">Curated Collections</span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium text-display mb-4">Shop by Category</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Discover our carefully curated collections of timeless pieces.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {displayCategories.map((category) => (
              <Link key={category.id} to={`/categories?filter=${category.id}`} className="group">
                <div className="bg-card rounded-2xl p-8 text-center border border-border hover:border-primary/30 hover:shadow-warm transition-all duration-300">
                  <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform duration-300">{category.icon}</span>
                  <h3 className="font-display text-lg font-medium text-foreground">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

Categories.displayName = "Categories";
export default Categories;