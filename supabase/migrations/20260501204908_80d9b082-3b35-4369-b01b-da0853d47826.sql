
-- Updates (mini status posts)
CREATE TABLE public.updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Updates viewable by everyone"
  ON public.updates FOR SELECT USING (true);
CREATE POLICY "Members can create their own updates"
  ON public.updates FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors or admins can delete updates"
  ON public.updates FOR DELETE TO authenticated
  USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authors can update their own updates"
  ON public.updates FOR UPDATE TO authenticated
  USING (auth.uid() = author_id);

CREATE INDEX idx_updates_created ON public.updates (created_at DESC);
CREATE INDEX idx_updates_author ON public.updates (author_id);

-- Likes (polymorphic on target_type)
CREATE TYPE public.like_target AS ENUM ('post', 'update');

CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  target_type public.like_target NOT NULL,
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes viewable by everyone"
  ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can like as themselves"
  ON public.likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own likes"
  ON public.likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_likes_target ON public.likes (target_type, target_id);
CREATE INDEX idx_likes_user ON public.likes (user_id);

-- Follows
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id <> following_id)
);
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows viewable by everyone"
  ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow as themselves"
  ON public.follows FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow themselves"
  ON public.follows FOR DELETE TO authenticated
  USING (auth.uid() = follower_id OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_follows_follower ON public.follows (follower_id);
CREATE INDEX idx_follows_following ON public.follows (following_id);
