import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  targetType: "post" | "update";
  targetId: string;
  size?: "sm" | "md";
};

const LikeButton = ({ targetType, targetId, size = "md" }: Props) => {
  const { user } = useAuth();
  const nav = useNavigate();
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { count: c } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("target_type", targetType)
        .eq("target_id", targetId);
      if (active) setCount(c ?? 0);

      if (user) {
        const { data } = await supabase
          .from("likes")
          .select("id")
          .eq("target_type", targetType)
          .eq("target_id", targetId)
          .eq("user_id", user.id)
          .maybeSingle();
        if (active) setLiked(!!data);
      }
    })();
    return () => { active = false; };
  }, [targetType, targetId, user]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast("Join the circle to leave a heart 🌸");
      nav("/auth");
      return;
    }
    if (busy) return;
    setBusy(true);
    if (liked) {
      const { error } = await supabase.from("likes").delete()
        .eq("target_type", targetType).eq("target_id", targetId).eq("user_id", user.id);
      if (!error) { setLiked(false); setCount((c) => Math.max(0, c - 1)); }
    } else {
      const { error } = await supabase.from("likes").insert({
        target_type: targetType, target_id: targetId, user_id: user.id,
      });
      if (!error) { setLiked(true); setCount((c) => c + 1); }
    }
    setBusy(false);
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-silk border",
        liked
          ? "bg-primary/10 border-primary/30 text-primary"
          : "bg-card border-border text-muted-foreground hover:text-primary hover:border-primary/40",
        size === "sm" && "px-2 py-1 text-xs",
      )}
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <Heart className={cn(size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4", liked && "fill-primary")} />
      <span className={cn("tabular-nums", size === "sm" ? "text-xs" : "text-sm")}>{count}</span>
    </button>
  );
};

export default LikeButton;
