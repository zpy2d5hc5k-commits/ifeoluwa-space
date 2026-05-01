import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "react-router-dom";
import LikeButton from "@/components/LikeButton";
import FollowButton from "@/components/FollowButton";
import { toast } from "sonner";
import { Sparkles, Trash2 } from "lucide-react";

type Profile = { id: string; display_name: string | null; avatar_url: string | null; bio: string | null };
type Update = { id: string; author_id: string; body: string; image_url: string | null; created_at: string };

const initials = (name?: string | null) =>
  (name ?? "✿").split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

const timeAgo = (iso: string) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

const Community = () => {
  const { user, isAdmin } = useAuth();
  const nav = useNavigate();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [members, setMembers] = useState<Profile[]>([]);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    const { data: ups } = await supabase
      .from("updates")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setUpdates(ups ?? []);

    const { data: profs } = await supabase
      .from("profiles")
      .select("id,display_name,avatar_url,bio")
      .order("created_at", { ascending: false });
    const byId: Record<string, Profile> = {};
    (profs ?? []).forEach((p) => { byId[p.id] = p as Profile; });
    setProfiles(byId);
    setMembers(profs ?? []);
  };

  useEffect(() => {
    document.title = "Community · Ifeoluwa Reviews";
    load();
    const ch = supabase
      .channel("updates-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "updates" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const post = async () => {
    if (!user) { nav("/auth"); return; }
    const trimmed = body.trim();
    if (!trimmed) return;
    setPosting(true);
    const { error } = await supabase.from("updates").insert({ author_id: user.id, body: trimmed });
    setPosting(false);
    if (error) toast.error(error.message); else { setBody(""); toast.success("Shared with the circle 💌"); }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("updates").delete().eq("id", id);
    if (error) toast.error(error.message); else setUpdates((u) => u.filter((x) => x.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="container-editorial pt-12 pb-8">
        <p className="text-sm tracking-[0.3em] uppercase text-primary mb-4 deco-line inline-block">The little circle</p>
        <h1 className="font-display text-4xl md:text-6xl text-balance mb-3">Whispers from the garden</h1>
        <p className="text-muted-foreground max-w-xl">A soft place to share what you're reading, glowing about, or simply feeling today.</p>
      </section>

      <section className="container-editorial pb-20 grid lg:grid-cols-[1fr_320px] gap-10">
        {/* FEED */}
        <div>
          {/* composer */}
          <div className="bg-card rounded-[1.25rem] p-5 shadow-soft border border-border/60 mb-8">
            {user ? (
              <>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value.slice(0, 500))}
                  placeholder="What's blooming today? ✿"
                  className="min-h-[90px] resize-none border-0 bg-primary-cream/50 focus-visible:ring-primary/30 font-display text-lg"
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">{body.length}/500</span>
                  <Button onClick={post} disabled={!body.trim() || posting}
                    className="bg-gradient-rose text-primary-foreground border-0">
                    <Sparkles className="h-4 w-4" /> Share
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-3">Join the circle to share an update.</p>
                <Button onClick={() => nav("/auth")} className="bg-gradient-rose text-primary-foreground border-0">Join</Button>
              </div>
            )}
          </div>

          {/* updates */}
          {updates.length === 0 ? (
            <p className="text-center text-muted-foreground py-16 font-display text-xl italic">
              No whispers yet — be the first to share something soft.
            </p>
          ) : (
            <div className="space-y-5">
              {updates.map((u) => {
                const author = profiles[u.author_id];
                const canDelete = user && (user.id === u.author_id || isAdmin);
                return (
                  <article key={u.id} className="bg-card rounded-[1.25rem] p-5 shadow-soft border border-border/60 animate-float-up">
                    <header className="flex items-start gap-3 mb-3">
                      <div className="h-11 w-11 rounded-full bg-gradient-rose flex items-center justify-center text-primary-foreground font-display text-lg shrink-0 overflow-hidden">
                        {author?.avatar_url
                          ? <img src={author.avatar_url} alt="" className="h-full w-full object-cover" />
                          : initials(author?.display_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display text-lg leading-none">{author?.display_name ?? "A reader"}</span>
                          <span className="text-xs text-muted-foreground">· {timeAgo(u.created_at)}</span>
                        </div>
                        {author?.bio && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{author.bio}</p>}
                      </div>
                      <FollowButton targetUserId={u.author_id} compact />
                    </header>
                    <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{u.body}</p>
                    <footer className="flex items-center gap-2 mt-4">
                      <LikeButton targetType="update" targetId={u.id} />
                      {canDelete && (
                        <button onClick={() => remove(u.id)}
                          className="ml-auto text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1">
                          <Trash2 className="h-3.5 w-3.5" /> remove
                        </button>
                      )}
                    </footer>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* MEMBERS SIDEBAR */}
        <aside>
          <div className="sticky top-20 bg-gradient-blush rounded-[1.5rem] p-6 border border-border/60 grain">
            <p className="text-xs tracking-[0.25em] uppercase text-primary mb-4">The circle · {members.length}/200</p>
            <h3 className="font-display text-2xl mb-5">Readers to follow</h3>
            <ul className="space-y-4">
              {members.slice(0, 10).map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-card border border-border flex items-center justify-center text-sm font-display text-primary shrink-0 overflow-hidden">
                    {m.avatar_url ? <img src={m.avatar_url} alt="" className="h-full w-full object-cover" /> : initials(m.display_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.display_name ?? "A reader"}</p>
                    {m.bio && <p className="text-xs text-muted-foreground truncate">{m.bio}</p>}
                  </div>
                  <FollowButton targetUserId={m.id} compact />
                </li>
              ))}
            </ul>
            <Link to="/blog" className="block text-center text-sm text-primary mt-6 hover:underline">
              Read the journal →
            </Link>
          </div>
        </aside>
      </section>
      <Footer />
    </div>
  );
};

export default Community;
