import { useEffect, useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = { targetUserId: string; compact?: boolean };

const FollowButton = ({ targetUserId, compact }: Props) => {
  const { user } = useAuth();
  const nav = useNavigate();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || user.id === targetUserId) return;
    supabase.from("follows").select("id")
      .eq("follower_id", user.id).eq("following_id", targetUserId).maybeSingle()
      .then(({ data }) => setFollowing(!!data));
  }, [user, targetUserId]);

  if (!user || user.id === targetUserId) return null;

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    if (following) {
      await supabase.from("follows").delete()
        .eq("follower_id", user.id).eq("following_id", targetUserId);
      setFollowing(false);
    } else {
      const { error } = await supabase.from("follows").insert({
        follower_id: user.id, following_id: targetUserId,
      });
      if (error) toast.error("Couldn't follow right now"); else { setFollowing(true); toast.success("Following 🌸"); }
    }
    setBusy(false);
  };

  return (
    <Button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!user) { nav("/auth"); return; } toggle(); }}
      size={compact ? "sm" : "default"}
      variant={following ? "outline" : "default"}
      className={following ? "" : "bg-gradient-rose text-primary-foreground border-0"}
    >
      {following ? <><UserCheck className="h-4 w-4" /> Following</> : <><UserPlus className="h-4 w-4" /> Follow</>}
    </Button>
  );
};

export default FollowButton;
