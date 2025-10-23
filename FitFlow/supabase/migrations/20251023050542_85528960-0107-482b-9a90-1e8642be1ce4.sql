-- Fix comments_count updates via triggers and add updated_at triggers
-- 1) updated_at triggers for posts and comments (function already exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_community_posts_updated_at'
  ) THEN
    CREATE TRIGGER update_community_posts_updated_at
    BEFORE UPDATE ON public.community_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_community_comments_updated_at'
  ) THEN
    CREATE TRIGGER update_community_comments_updated_at
    BEFORE UPDATE ON public.community_comments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 2) Comments count maintenance triggers (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.increment_post_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.community_posts
  SET comments_count = COALESCE(comments_count, 0) + 1,
      updated_at = NOW()
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_post_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.community_posts
  SET comments_count = GREATEST(COALESCE(comments_count, 1) - 1, 0),
      updated_at = NOW()
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_increment_comments_count'
  ) THEN
    CREATE TRIGGER trg_increment_comments_count
    AFTER INSERT ON public.community_comments
    FOR EACH ROW EXECUTE FUNCTION public.increment_post_comments_count();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_decrement_comments_count'
  ) THEN
    CREATE TRIGGER trg_decrement_comments_count
    AFTER DELETE ON public.community_comments
    FOR EACH ROW EXECUTE FUNCTION public.decrement_post_comments_count();
  END IF;
END $$;