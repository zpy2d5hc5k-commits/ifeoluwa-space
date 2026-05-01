import { Flower2 } from "lucide-react";

const Footer = () => (
  <footer className="mt-32 border-t border-border/60 bg-primary-cream/40">
    <div className="container-editorial py-14 grid md:grid-cols-3 gap-10 text-sm">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Flower2 className="h-4 w-4 text-primary" />
          <span className="font-display text-lg">Ifeoluwa Reviews</span>
        </div>
        <p className="text-muted-foreground leading-relaxed max-w-xs">
          A quiet corner of the internet for books, skincare rituals, and the small things that make life softer.
        </p>
      </div>
      <div>
        <h4 className="font-display text-base mb-3">Wander</h4>
        <ul className="space-y-2 text-muted-foreground">
          <li>Books worth your evening</li>
          <li>Skincare slow & gentle</li>
          <li>Lifestyle musings</li>
        </ul>
      </div>
      <div>
        <h4 className="font-display text-base mb-3">A small circle</h4>
        <p className="text-muted-foreground">Membership is limited to 200 readers — to keep things intimate.</p>
      </div>
    </div>
    <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} Ifeoluwa Reviews · made with care
    </div>
  </footer>
);

export default Footer;
