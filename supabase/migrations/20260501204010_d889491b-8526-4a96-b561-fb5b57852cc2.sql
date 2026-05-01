CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INT;
  is_first BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO current_count FROM public.profiles;
  IF current_count >= 200 THEN
    RAISE EXCEPTION 'Membership is full. Ifeoluwa Reviews is limited to 200 members.';
  END IF;

  is_first := (current_count = 0);

  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN is_first THEN 'admin'::app_role ELSE 'member'::app_role END);

  RETURN NEW;
END;
$$;