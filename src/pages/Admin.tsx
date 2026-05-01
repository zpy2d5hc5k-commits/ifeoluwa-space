import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pin, Trash2, Users, FileText, Sparkles } from "lucide-react";
import { z } from "zod";

const postSchema = z.object({
  title: z.string().trim().min(1).max(160),
  excerpt: z.string().trim().max(300).optional(),
  content: z.string().trim().min(1).max(20000),
  cover_url: z.string().trim().url().max(500).optional().or(z.literal("")),
  category: z.enum(["book", "skincare", "lifestyle"]),
  rating: z.number().int().min(1).max(5).optional(),
});

type Post = { id: string; title: string; category: string; pinned: boolean; published: boolean; created_at: string };
type Member = { id: string; display_name: string | null; created_at: string };

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState({ posts: 0, members: 0, seatsLeft: 200 });
  const [tab, setTab] = useState<"new" | "posts" | "members">("new");

  // form
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [category, setCategory] = useState<"book" | "skincare" | "lifestyle">("book");
  const [rating, setRating] = useState<string>("");

  const refresh = async () => {
    const [{ data: p }, { data: m }] = await Promise.all([
      supabase.from("posts").select("id,title,category,pinned,published,created_at").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,display_name,created_at").order("created_at", { ascending: false }),
    ]);
    setPosts(p ?? []);
    setMembers(m ?? []);
    setStats({ posts: p?.length ?? 0, members: m?.length ?? 0, seatsLeft: 200 - (m?.length ?? 0) });
  };

  useEffect(() => { if (isAdmin) refresh(); }, [isAdmin]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container-editorial py-32 text-center">
        <h1 className="font-display text-4xl mb-3">This is the owner's quiet room</h1>
        <p className="text-muted-foreground">Only Ifeoluwa can see this page.</p>
      </div>
      <Footer />
    </div>
  );

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = postSchema.safeParse({
      title, excerpt: excerpt || undefined, content, cover_url: coverUrl || undefined,
      category, rating: rating ? parseInt(rating) : undefined,
    });
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    const { error } = await supabase.from("posts").insert({
      author_id: user.id,
      title: parsed.data.title,
      excerpt: parsed.data.excerpt ?? null,
      content: parsed.data.content,
      cover_url: parsed.data.cover_url || null,
      category: parsed.data.category,
      rating: parsed.data.rating ?? null,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Posted ✿");
      setTitle(""); setExcerpt(""); setContent(""); setCoverUrl(""); setRating("");
      refresh(); setTab("posts");
    }
  };

  const togglePin = async (p: Post) => {
    await supabase.from("posts").update({ pinned: !p.pinned }).eq("id", p.id);
    refresh();
  };
  const togglePublished = async (p: Post) => {
    await supabase.from("posts").update({ published: !p.published }).eq("id", p.id);
    refresh();
  };
  const del = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("posts").delete().eq("id", id);
    refresh();
  };
  const removeMember = async (id: string) => {
    if (!confirm("Remove this member? This cannot be undone.")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Removed"); refresh(); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container-editorial pt-12 pb-20">
        <p className="text-sm tracking-[0.3em] uppercase text-primary mb-3">Owner's Quarters</p>
        <h1 className="font-display text-5xl mb-10">Hello, Ifeoluwa ✿</h1>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <Stat icon={FileText} label="Entries posted" value={stats.posts} />
          <Stat icon={Users} label="Members joined" value={`${stats.members} / 200`} />
          <Stat icon={Sparkles} label="Seats remaining" value={stats.seatsLeft} accent />
        </div>

        <div className="flex gap-2 mb-8 border-b border-border">
          {(["new", "posts", "members"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm capitalize transition-silk border-b-2 -mb-px ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t === "new" ? "New entry" : t}
            </button>
          ))}
        </div>

        {tab === "new" && (
          <form onSubmit={create} className="grid gap-5 max-w-3xl bg-card p-8 rounded-[1.5rem] shadow-soft">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} required />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="skincare">Skincare</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rating (optional, 1–5)</Label>
                <Input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Cover image URL (optional)</Label>
              <Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://…" maxLength={500} />
            </div>
            <div>
              <Label>Excerpt</Label>
              <Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} maxLength={300} />
            </div>
            <div>
              <Label>Content (separate paragraphs with blank lines)</Label>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} required maxLength={20000} />
            </div>
            <Button type="submit" className="bg-gradient-rose text-primary-foreground border-0 w-fit shadow-petal">Publish entry</Button>
          </form>
        )}

        {tab === "posts" && (
          <div className="space-y-3">
            {posts.length === 0 ? <p className="text-muted-foreground">No posts yet.</p> :
              posts.map((p) => (
                <div key={p.id} className="flex items-center gap-4 p-4 bg-card rounded-xl shadow-soft">
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-lg truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{p.category} · {p.published ? "published" : "draft"}</p>
                  </div>
                  <Button variant={p.pinned ? "default" : "outline"} size="sm" onClick={() => togglePin(p)}>
                    <Pin className="h-3.5 w-3.5 mr-1" /> {p.pinned ? "Pinned" : "Pin"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => togglePublished(p)}>
                    {p.published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => del(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
          </div>
        )}

        {tab === "members" && (
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-4 p-4 bg-card rounded-xl shadow-soft">
                <div className="h-10 w-10 rounded-full bg-gradient-rose flex items-center justify-center text-primary-foreground font-display">
                  {(m.display_name ?? "?")[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{m.display_name ?? "Anonymous reader"}</p>
                  <p className="text-xs text-muted-foreground">Joined {new Date(m.created_at).toLocaleDateString()}</p>
                </div>
                {m.id !== user.id && (
                  <Button variant="ghost" size="icon" onClick={() => removeMember(m.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

const Stat = ({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; accent?: boolean }) => (
  <div className={`p-6 rounded-[1.25rem] shadow-soft ${accent ? "bg-gradient-blush" : "bg-card"}`}>
    <Icon className="h-5 w-5 text-primary mb-3" />
    <p className="text-3xl font-display">{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

export default Admin;
