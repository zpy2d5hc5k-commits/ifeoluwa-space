import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Star } from "lucide-react";

type Post = { id: string; title: string; excerpt: string | null; content: string; cover_url: string | null; category: string; rating: number | null; created_at: string };

const Post = () => {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase.from("posts").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setPost(data); setLoading(false);
      if (data) document.title = `${data.title} · Ifeoluwa Reviews`;
    });
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Opening the page…</div>;
  if (!post) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container-editorial py-32 text-center">
        <h1 className="font-display text-4xl mb-4">This page got lost in the petals</h1>
        <Link to="/blog" className="text-primary hover:underline">Back to journal</Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <article className="container-editorial max-w-3xl pt-12 pb-20">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to the journal
        </Link>
        <p className="text-xs tracking-[0.3em] uppercase text-primary mb-4">{post.category}</p>
        <h1 className="font-display text-4xl md:text-6xl leading-[1.1] text-balance mb-6">{post.title}</h1>
        {post.excerpt && <p className="text-xl text-muted-foreground italic font-display mb-6">{post.excerpt}</p>}
        {post.rating != null && (
          <div className="flex gap-1 mb-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-5 w-5 ${i < (post.rating ?? 0) ? "fill-primary text-primary" : "text-border"}`} />
            ))}
          </div>
        )}
        {post.cover_url && (
          <img src={post.cover_url} alt={post.title} className="rounded-[1.5rem] w-full aspect-[16/10] object-cover mb-12 shadow-frame" />
        )}
        <div className="prose prose-lg max-w-none prose-headings:font-display prose-p:text-foreground/85 prose-p:leading-relaxed">
          {post.content.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-16 pt-8 border-t border-border">
          Posted {new Date(post.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </article>
      <Footer />
    </div>
  );
};

export default Post;
