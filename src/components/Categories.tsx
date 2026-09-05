import { memo, useMemo } from "react";
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

const editorialRooms = [
  { slug: "living-room", name: "Living Room", description: "Layouts, furniture, and details for the room everyone gathers in.", image: livingRoomImg },
  { slug: "bedroom", name: "Bedroom", description: "Calming layers and thoughtful details for better rest.", image: bedroomImg },
  { slug: "kitchen", name: "Kitchen", description: "Practical styling ideas for a kitchen that feels like home.", image: kitchenImg },
  { slug: "bathroom", name: "Bathroom", description: "Small luxuries and clever storage for everyday rituals.", image: bathroomImg },
  { slug: "home-office", name: "Home Office", description: "Focused, comfortable spaces with a point of view.", image: homeOfficeImg },
  { slug: "entryway", name: "Entryway", description: "Welcoming first impressions and smart solutions.", image: entrywayImg },
];

const Categories = memo(() => {

  return (
    <section className="border-b border-border bg-secondary py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 flex flex-col justify-between gap-5 md:mb-16 md:flex-row md:items-end">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-medium text-accent uppercase tracking-widest mb-3 block"
            >
              Explore by room
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4"
            >
              Rooms with a point of view
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              Ideas, palettes, and practical details for the spaces where life happens.
            </motion.p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {editorialRooms.map((category, index) => {
              const coverImg = category.image;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Link
                    to={`/rooms/${category.slug}`}
                    className="group block"
                  >
                    <div className="group relative aspect-[4/5] overflow-hidden border border-border transition-all duration-300 hover:border-accent/40 hover:shadow-xl">
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
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/15 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-background md:p-5">
                        <h3 className="font-display mb-0.5 text-lg font-normal md:text-2xl">
                          {category.name}
                        </h3>
                        <p className="text-xs text-background/75 mb-2">
                          Explore the room
                        </p>
                         <p className="hidden text-xs text-background/70 line-clamp-2 md:block">{category.description}</p>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1">
                           Explore <ArrowRight className="w-3 h-3" />
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
              to="/rooms"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline transition-colors"
            >
              Browse the room library <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

Categories.displayName = "Categories";

export default Categories;
