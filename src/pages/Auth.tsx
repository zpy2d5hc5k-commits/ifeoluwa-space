import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Flower2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
  displayName: z.string().trim().min(1).max(50).optional(),
});

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) nav("/");
  }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, displayName: mode === "signup" ? displayName : undefined });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: displayName },
          },
        });
        if (error) {
          if (error.message.toLowerCase().includes("full") || error.message.includes("200")) {
            toast.error("So sorry — all 200 seats are taken!");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome to the circle ✿");
          nav("/");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) toast.error(error.message);
        else nav("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error("Google sign-in failed");
  };

  return (
    <div className="min-h-screen bg-gradient-blush grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-12 relative grain">
        <Link to="/" className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-silk text-sm">
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
        <div className="max-w-md">
          <Flower2 className="h-10 w-10 text-primary mb-6" />
          <h1 className="font-display text-5xl leading-tight mb-4">A small, soft circle.</h1>
          <p className="text-muted-foreground leading-relaxed">
            Ifeoluwa Reviews is intentionally tiny — only 200 readers ever. Once we're full, the door closes.
            Join while there's still a seat at the table.
          </p>
        </div>
        <p className="text-xs tracking-[0.3em] uppercase text-primary">Books · Skincare · Lifestyle</p>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12 bg-background">
        <form onSubmit={submit} className="w-full max-w-md">
          <h2 className="font-display text-3xl mb-2">
            {mode === "signup" ? "Reserve your seat" : "Welcome back"}
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            {mode === "signup" ? "Become one of 200 readers." : "We saved your spot."}
          </p>

          {mode === "signup" && (
            <div className="mb-4">
              <Label htmlFor="dn">Name</Label>
              <Input id="dn" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ifeoluwa" maxLength={50} required />
            </div>
          )}
          <div className="mb-4">
            <Label htmlFor="em">Email</Label>
            <Input id="em" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
          </div>
          <div className="mb-6">
            <Label htmlFor="pw">Password</Label>
            <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} maxLength={72} />
            {mode === "signup" && <p className="text-xs text-muted-foreground mt-1.5">8+ characters. We check against known leaked passwords for your safety.</p>}
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-gradient-rose text-primary-foreground border-0 shadow-petal">
            {loading ? "Just a moment…" : mode === "signup" ? "Join the circle" : "Sign in"}
          </Button>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button type="button" variant="outline" onClick={google} className="w-full border-primary/30">
            Continue with Google
          </Button>

          <p className="text-sm text-center mt-6 text-muted-foreground">
            {mode === "signup" ? "Already a member?" : "New here?"}{" "}
            <button type="button" onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="text-primary hover:underline underline-offset-4">
              {mode === "signup" ? "Sign in" : "Reserve a seat"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Auth;
