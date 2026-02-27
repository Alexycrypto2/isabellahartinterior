import { memo } from "react";
import { Camera, Heart, Instagram } from "lucide-react";
import { motion } from "framer-motion";
import OptimizedImage from "@/components/OptimizedImage";

import ugcLivingRoom from "@/assets/ugc-living-room.jpg";
import ugcBedroom from "@/assets/ugc-bedroom.jpg";
import ugcShelfStyling from "@/assets/ugc-shelf-styling.jpg";
import ugcReadingNook from "@/assets/ugc-reading-nook.jpg";
import ugcDining from "@/assets/ugc-dining.jpg";

const customerPhotos = [
  {
    id: 1,
    image: ugcLivingRoom,
    username: "@sarah.homedecor",
    caption: "Obsessed with this rattan pendant! 😍",
    likes: 847,
    tall: true,
  },
  {
    id: 2,
    image: ugcBedroom,
    username: "@jessica.interiors",
    caption: "Morning light + chunky knit = perfection",
    likes: 1243,
    tall: false,
  },
  {
    id: 3,
    image: ugcShelfStyling,
    username: "@emily.at.home",
    caption: "Shelf styling day! Found these vases via RoomRefine",
    likes: 629,
    tall: true,
  },
  {
    id: 4,
    image: ugcReadingNook,
    username: "@cozycorner.co",
    caption: "My reading nook is finally complete ✨",
    likes: 1021,
    tall: false,
  },
  {
    id: 5,
    image: ugcDining,
    username: "@thetablesetter",
    caption: "Golden hour dinner vibes with woven placemats",
    likes: 756,
    tall: false,
  },
];

const CustomerGallery = memo(() => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="text-label text-accent mb-3 flex items-center justify-center gap-2">
              <Camera className="w-4 h-4" />
              Real Homes, Real Style
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium text-display mb-4">
              #StyledWith<span className="italic">RoomRefine</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              See how our community styles their finds. Share your own look and get featured!
            </p>
          </div>

          {/* Masonry Grid */}
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {customerPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="break-inside-avoid group relative rounded-xl overflow-hidden cursor-pointer"
              >
                <div className={photo.tall ? "aspect-[3/4]" : "aspect-square"}>
                  <OptimizedImage
                    src={photo.image}
                    alt={photo.caption}
                    width={400}
                    height={photo.tall ? 533 : 400}
                  />
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/50 transition-all duration-300 flex items-end">
                  <div className="w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-background text-sm font-medium mb-1">
                      {photo.caption}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-background/80 text-xs flex items-center gap-1">
                        <Instagram className="w-3 h-3" />
                        {photo.username}
                      </span>
                      <span className="text-background/80 text-xs flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-current" />
                        {photo.likes.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-10">
            <p className="text-muted-foreground text-sm">
              Tag <span className="font-semibold text-accent">@roomrefine</span> on Instagram to be featured
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

CustomerGallery.displayName = "CustomerGallery";

export default CustomerGallery;
