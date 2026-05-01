import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Sparkles, Leaf } from "lucide-react";
import hero from "@/assets/hero.jpg";
import books from "@/assets/books.jpg";
import skincare from "@/assets/skincare.jpg";
import lifestyle from "@/assets/lifestyle.jpg";
import { supabase } from "@/integrations/supabase/client";

type Post = { id: string; title: string; excerpt: string | null; cover_url: string | null; category: string; created_at: string };

const categories = [
  { key: "book", label: "Books", icon: BookOpen, img: books, blurb: "Slow reads, honest reviews, the kind of stories that linger." },
  { key: "skincare", label: "Skincare", icon: Sparkles, img: skincare, blurb: "Rituals over routines — what I actually reach for at night." },
  { key: "lifestyle", label: "Lifestyle", icon: Leaf, img: lifestyle, blurb: "Soft mornings, slow living, and small luxuries." },
];

const Index = () => {
  const [featured, setFeatured] = useState<Post[]>([]);

  useEffect(() => {
    supabase
      .from("posts")
      .select("id,title,excerpt,cover_url,category,created_at")
      .eq("published", true)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setFeatured(data ?? []));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-editorial pt-12 md:pt-20 pb-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-float-up">
            <p className="text-sm tracking-[0.3em] uppercase text-primary mb-6 deco-line inline-block">A Lifestyle Diary</p>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] text-balance mb-6">
              Soft pages, <em className="text-primary">slow rituals</em>, and a life worth lingering in.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md mb-8">
              Welcome to Ifeoluwa Reviews — a tender little journal where I write about the books I love,
              the skincare I trust, and the small aesthetic things that shape my days.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-rose text-primary-foreground border-0 shadow-petal">
                <Link to="/blog">Read the journal <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary/30 hover:bg-primary-cream">
                <Link to="/auth">Join the circle</Link>
              </Button>
            </div>
          </div>
          <div className="relative animate-bloom">
            <div className="absolute -inset-4 bg-gradient-blush rounded-[2rem] blur-2xl opacity-60" />
            <img
              src={hero}
              alt="Vintage book with pressed flowers, dried roses and a skincare bottle on dusty pink linen"
              width={1600} height={1200}
              className="relative rounded-[2rem] shadow-frame object-cover w-full aspect-[4/5] grain"
            />
            <div className="absolute -bottom-6 -left-6 bg-card px-5 py-3 rounded-full shadow-soft border border-border/60">
              <p className="text-xs tracking-widest uppercase text-secondary-deep">est. 2026 · 200 readers only</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-editorial py-20">
        <div className="text-center mb-14">
          <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4 deco-line inline-block">The Three Loves</p>
          <h2 className="font-display text-4xl md:text-5xl text-balance max-w-2xl mx-auto">
            What you'll find in this little corner
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map(({ key, label, icon: Icon, img, blurb }, i) => (
            <Link
              key={key}
              to={`/blog?cat=${key}`}
              className="group relative overflow-hidden rounded-[1.5rem] bg-card shadow-soft hover:shadow-petal transition-silk animate-float-up"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img src={img} alt={label} loading="lazy" width={1024} height={1024}
                  className="h-full w-full object-cover group-hover:scale-105 transition-silk duration-700" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                <Icon className="h-5 w-5 mb-2 opacity-80" />
                <h3 className="font-display text-2xl mb-1">{label}</h3>
                <p className="text-sm opacity-90 leading-relaxed">{blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED JOURNAL */}
      {featured.length > 0 && (
        <section className="container-editorial py-20">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4">From the journal</p>
              <h2 className="font-display text-4xl md:text-5xl">Latest musings</h2>
            </div>
            <Link to="/blog" className="text-sm text-primary hover:underline underline-offset-4">
              All entries →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featured.map((p) => (
              <Link key={p.id} to={`/post/${p.id}`} className="group block animate-float-up">
                <div className="aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-primary-cream mb-5 shadow-soft">
                  {p.cover_url ? (
                    <img src={p.cover_url} alt={p.title} loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-silk duration-700" />
                  ) : (
                    <div className="h-full w-full bg-gradient-blush flex items-center justify-center">
                      <Flower /></div>
                  )}
                </div>
                <p className="text-xs tracking-[0.25em] uppercase text-secondary-deep mb-2">{p.category}</p>
                <h3 className="font-display text-2xl leading-snug group-hover:text-primary transition-silk">{p.title}</h3>
                {p.excerpt && <p className="text-muted-foreground text-sm mt-2 leading-relaxed line-clamp-2">{p.excerpt}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-editorial py-24">
        <div className="relative bg-gradient-blush rounded-[2rem] p-12 md:p-20 text-center overflow-hidden grain">
          <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4 deco-line inline-block">A small circle</p>
          <h2 className="font-display text-4xl md:text-5xl text-balance max-w-2xl mx-auto mb-6">
            Only 200 seats at this little tea table.
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Sign up to comment, save your favourite reviews, and be part of an intentionally tiny community of readers and skincare lovers.
          </p>
          <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90">
            <Link to="/auth">Reserve a seat</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const Flower = () => (
  <svg viewBox="0 0 60 60" className="w-16 h-16 text-primary/40" fill="currentColor">
    <circle cx="30" cy="30" r="6" />
    <circle cx="30" cy="14" r="8" opacity="0.6" />
    <circle cx="30" cy="46" r="8" opacity="0.6" />
    <circle cx="14" cy="30" r="8" opacity="0.6" />
    <circle cx="46" cy="30" r="8" opacity="0.6" />
  </svg>
);

export default Index;
