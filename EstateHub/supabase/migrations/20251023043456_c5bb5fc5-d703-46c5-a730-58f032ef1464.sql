-- Drop the existing foreign key constraint from community_posts
ALTER TABLE public.community_posts
DROP CONSTRAINT IF EXISTS community_posts_user_id_fkey;

-- Add foreign key to profiles table instead
ALTER TABLE public.community_posts
ADD CONSTRAINT community_posts_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id)
ON DELETE CASCADE;

-- Do the same for community_comments
ALTER TABLE public.community_comments
DROP CONSTRAINT IF EXISTS community_comments_user_id_fkey;

ALTER TABLE public.community_comments
ADD CONSTRAINT community_comments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id)
ON DELETE CASCADE;