import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Pin } from "lucide-react";

type Post = { id: string; title: string; excerpt: string | null; cover_url: string | null; category: string; created_at: string; pinned: boolean };

const cats = [
  { key: "all", label: "All" },
  { key: "book", label: "Books" },
  { key: "skincare", label: "Skincare" },
  { key: "lifestyle", label: "Lifestyle" },
];

const Blog = () => {
  const [params, setParams] = useSearchParams();
  const cat = params.get("cat") ?? "all";
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let q = supabase.from("posts").select("*").eq("published", true)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    if (cat !== "all") q = q.eq("category", cat as "book" | "skincare" | "lifestyle");
    q.then(({ data }) => { setPosts(data ?? []); setLoading(false); });
  }, [cat]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="container-editorial pt-16 pb-10 text-center">
        <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4 deco-line inline-block">The Journal</p>
        <h1 className="font-display text-5xl md:text-6xl text-balance max-w-2xl mx-auto">Entries from a soft life</h1>
      </section>

      <div className="container-editorial flex justify-center gap-2 flex-wrap mb-12">
        {cats.map((c) => (
          <button
            key={c.key}
            onClick={() => setParams(c.key === "all" ? {} : { cat: c.key })}
            className={`px-5 py-2 rounded-full text-sm transition-silk border ${
              cat === c.key ? "bg-foreground text-background border-foreground" : "border-border bg-card hover:bg-primary-cream"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <section className="container-editorial pb-20">
        {loading ? (
          <p className="text-center text-muted-foreground">Gathering pages…</p>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl mb-2">Nothing here yet</p>
            <p className="text-muted-foreground">The first entry is brewing like a slow cup of tea.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {posts.map((p, i) => (
              <Link key={p.id} to={`/post/${p.id}`} className="group block animate-float-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-primary-cream mb-5 shadow-soft">
                  {p.cover_url ? (
                    <img src={p.cover_url} alt={p.title} loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-silk duration-700" />
                  ) : (
                    <div className="h-full w-full bg-gradient-blush" />
                  )}
                  {p.pinned && (
                    <span className="absolute top-3 left-3 bg-card/90 backdrop-blur px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                      <Pin className="h-3 w-3 text-primary" /> Featured
                    </span>
                  )}
                </div>
                <p className="text-xs tracking-[0.25em] uppercase text-secondary-deep mb-2">{p.category}</p>
                <h2 className="font-display text-2xl leading-snug group-hover:text-primary transition-silk">{p.title}</h2>
                {p.excerpt && <p className="text-muted-foreground text-sm mt-2 leading-relaxed line-clamp-3">{p.excerpt}</p>}
              </Link>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default Blog;
