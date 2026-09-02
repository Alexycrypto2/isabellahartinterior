import { memo } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-luxury.jpg";

const Hero = memo(() => {
  return (
    <section className="border-b border-border bg-background pt-28 md:pt-36">
      <div className="container mx-auto px-6 pb-16 md:pb-24">
        <div className="grid items-end gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-xl pb-2"
          >
            <p className="text-label mb-7 text-accent">The Isabelle Hart Journal</p>
            <h1 className="text-display max-w-lg text-6xl font-normal leading-[0.92] md:text-8xl">
              Beautiful spaces, thoughtfully styled.
            </h1>
            <p className="mt-8 max-w-md text-base leading-7 text-muted-foreground md:text-lg">
              A considered home decor journal for rooms with warmth, character, and a point of view.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 border-b border-accent pb-2 text-sm font-medium text-foreground transition-colors hover:text-accent"
              >
                Explore the journal <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                About Isabelle Hart
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
            className="relative"
          >
            <Link to="/blog" className="group block">
              <div className="aspect-[4/3] overflow-hidden bg-muted md:aspect-[5/4]">
                <img
                  src={heroImage}
                  alt="Sunlit living room with layered neutral textures"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  width={1200}
                  height={960}
                  fetchPriority="high"
                />
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-label mb-2 text-muted-foreground">Editor's note</p>
                  <h2 className="font-display text-3xl leading-tight md:text-4xl">
                    The quiet luxury of a room that feels lived in
                  </h2>
                </div>
                <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-accent transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              </div>
            </Link>
          </motion.div>
        </div>

        <div className="mt-14 grid gap-8 border-t border-border pt-7 md:grid-cols-3 md:gap-12">
          <div className="md:col-span-1">
            <p className="text-label text-muted-foreground">Inside this issue</p>
          </div>
          <Link to="/blog" className="group border-l border-border pl-5">
            <p className="text-sm text-muted-foreground">01 / Rooms</p>
            <p className="mt-2 font-display text-2xl leading-tight transition-colors group-hover:text-accent">
              A softer approach to the everyday living room
            </p>
          </Link>
          <Link to="/blog" className="group border-l border-border pl-5">
            <p className="text-sm text-muted-foreground">02 / Style guides</p>
            <p className="mt-2 font-display text-2xl leading-tight transition-colors group-hover:text-accent">
              Five details that make a home feel collected
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";

export default Hero;