import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Flower2 } from "lucide-react";

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const nav = useNavigate();

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `text-sm tracking-wide transition-silk ${isActive ? "text-primary" : "text-foreground/70 hover:text-primary"}`;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/60">
      <div className="container-editorial flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <Flower2 className="h-5 w-5 text-primary group-hover:rotate-12 transition-silk" />
          <span className="font-display text-xl">Ifeoluwa <span className="italic text-primary">Reviews</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={linkCls}>Home</NavLink>
          <NavLink to="/blog" className={linkCls}>Journal</NavLink>
          <NavLink to="/community" className={linkCls}>Community</NavLink>
          <NavLink to="/blog?cat=book" className={linkCls}>Books</NavLink>
          <NavLink to="/blog?cat=skincare" className={linkCls}>Skincare</NavLink>
          <NavLink to="/blog?cat=lifestyle" className={linkCls}>Lifestyle</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {isAdmin && (
                <Button variant="ghost" size="sm" onClick={() => nav("/admin")}>Admin</Button>
              )}
              <Button variant="outline" size="sm" onClick={async () => { await signOut(); nav("/"); }}>
                Sign out
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => nav("/auth")} className="bg-gradient-rose text-primary-foreground border-0">
              Join
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
