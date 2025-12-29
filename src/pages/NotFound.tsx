import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import PageTransition from "@/components/PageTransition";

const NotFound = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-6">
          <span className="text-8xl mb-6 block">🏡</span>
          <h1 className="font-display text-5xl md:text-7xl font-medium mb-4">
            Oops!
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
            Looks like this page got lost in the decor shuffle. 
            Let's get you back home.
          </p>
          <Link to="/">
            <Button size="lg" className="rounded-full px-8">
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </PageTransition>
  );
};

export default NotFound;
