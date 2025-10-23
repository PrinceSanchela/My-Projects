import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Edit, Trash2, Heart, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDemoMode } from "@/contexts/DemoContext";
import { DemoBanner } from "@/components/DemoBanner";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  user_id: string;
  comments_count: number;
  profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface Like {
  user_id: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile?: {
    full_name: string;
  };
}

const Community = () => {
  const { isDemoMode, demoPosts, demoUser } = useDemoMode();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "general"
  });
  const [postLikes, setPostLikes] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [activeComments, setActiveComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (isDemoMode) {
      setUser(demoUser);
      setPosts(demoPosts as Post[]);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [isDemoMode, demoUser, demoPosts]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    filterAndSortPosts();
  }, [posts, selectedCategory, sortBy, searchQuery]);

  const fetchPosts = async () => {
    const { data: postsData, error: postsError } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (postsError) {
      toast({ title: "Error fetching posts", variant: "destructive" });
      return;
    }

    if (!postsData || postsData.length === 0) {
      setPosts([]);
      return;
    }

    // Fetch profiles separately
    const userIds = [...new Set(postsData.map(post => post.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

    const enrichedPosts = postsData.map(post => ({
      ...post,
      profile: profilesMap.get(post.user_id)
    }));

    setPosts(enrichedPosts);
    
    // Fetch likes for all posts
    enrichedPosts.forEach(post => {
      fetchLikes(post.id);
    });
  };

  const fetchLikes = async (postId: string) => {
    const { data, error } = await supabase
      .from("community_likes")
      .select("user_id")
      .eq("post_id", postId);

    if (!error && data) {
      setPostLikes(prev => ({ ...prev, [postId]: data.length }));
      if (user) {
        setUserLikes(prev => ({ 
          ...prev, 
          [postId]: data.some((like: Like) => like.user_id === user.id) 
        }));
      }
    }
  };

  const fetchComments = async (postId: string) => {
    const { data: commentsData, error: commentsError } = await supabase
      .from("community_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (commentsError || !commentsData || commentsData.length === 0) {
      setComments(prev => ({ ...prev, [postId]: [] }));
      return;
    }

    // Fetch profiles for comment authors
    const userIds = [...new Set(commentsData.map(c => c.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

    const enrichedComments = commentsData.map(comment => ({
      ...comment,
      profile: profilesMap.get(comment.user_id)
    }));

    setComments(prev => ({ ...prev, [postId]: enrichedComments }));
  };

  const filterAndSortPosts = () => {
    let filtered = [...posts];

    if (selectedCategory !== "all") {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "popular") {
      filtered.sort((a, b) => (postLikes[b.id] || 0) - (postLikes[a.id] || 0));
    } else if (sortBy === "discussed") {
      filtered.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0));
    }

    setFilteredPosts(filtered);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Please sign in to create posts", variant: "destructive" });
      return;
    }

    if (!newPost.title || !newPost.content) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    const postData = {
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      user_id: user.id
    };

    if (editingPost) {
      const { error } = await supabase
        .from("community_posts")
        .update(postData)
        .eq("id", editingPost.id);

      if (error) {
        toast({ title: "Error updating post", variant: "destructive" });
      } else {
        toast({ title: "Post updated successfully" });
        setIsDialogOpen(false);
        setEditingPost(null);
        resetForm();
        fetchPosts();
      }
    } else {
      const { error } = await supabase
        .from("community_posts")
        .insert(postData);

      if (error) {
        toast({ title: "Error creating post", variant: "destructive" });
      } else {
        toast({ title: "Post created successfully" });
        setIsDialogOpen(false);
        resetForm();
        fetchPosts();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("community_posts")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error deleting post", variant: "destructive" });
    } else {
      toast({ title: "Post deleted successfully" });
      fetchPosts();
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setNewPost({
      title: post.title,
      content: post.content,
      category: post.category
    });
    setIsDialogOpen(true);
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      toast({ title: "Please sign in to like posts", variant: "destructive" });
      return;
    }

    const isLiked = userLikes[postId];

    if (isLiked) {
      const { error } = await supabase
        .from("community_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      if (!error) {
        fetchLikes(postId);
      }
    } else {
      const { error } = await supabase
        .from("community_likes")
        .insert({ post_id: postId, user_id: user.id });

      if (!error) {
        fetchLikes(postId);
      }
    }
  };

  const toggleComments = (postId: string) => {
    if (activeComments === postId) {
      setActiveComments(null);
    } else {
      setActiveComments(postId);
      if (!comments[postId]) {
        fetchComments(postId);
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user) {
      toast({ title: "Please sign in to comment", variant: "destructive" });
      return;
    }

    if (!newComment.trim()) {
      toast({ title: "Please enter a comment", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("community_comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        content: newComment
      });

    if (error) {
      toast({ title: "Error adding comment", variant: "destructive" });
    } else {
      setNewComment("");
      fetchComments(postId);
      fetchPosts(); // Refresh to get updated comments_count from trigger
    }
  };

  const resetForm = () => {
    setNewPost({
      title: "",
      content: "",
      category: "general"
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      general: "💬",
      workout: "💪",
      nutrition: "🥗",
      progress: "📈",
      motivation: "🔥"
    };
    return icons[category] || "💬";
  };

  return (
    <div className="min-h-screen bg-background">
      <DemoBanner />
      <Navigation />
      
      <main className={`container mx-auto px-4 ${isDemoMode ? 'pt-32' : 'pt-24'} pb-12`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Community
            </h1>
            <p className="text-muted-foreground">
              Share your journey, inspire others, and stay motivated together
            </p>
          </div>
          
          {user && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingPost(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input
                      placeholder="What's on your mind?"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Content</label>
                    <Textarea
                      placeholder="Share your thoughts, progress, or ask questions..."
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      rows={6}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={newPost.category} onValueChange={(value) => setNewPost({ ...newPost, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">💬 General</SelectItem>
                        <SelectItem value="workout">💪 Workout</SelectItem>
                        <SelectItem value="nutrition">🥗 Nutrition</SelectItem>
                        <SelectItem value="progress">📈 Progress</SelectItem>
                        <SelectItem value="motivation">🔥 Motivation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSubmit} className="w-full">
                    {editingPost ? "Update Post" : "Publish Post"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">💬 General</SelectItem>
                  <SelectItem value="workout">💪 Workout</SelectItem>
                  <SelectItem value="nutrition">🥗 Nutrition</SelectItem>
                  <SelectItem value="progress">📈 Progress</SelectItem>
                  <SelectItem value="motivation">🔥 Motivation</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="popular">Most Liked</SelectItem>
                  <SelectItem value="discussed">Most Discussed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <Avatar>
                  <AvatarFallback className="bg-gradient-primary text-background">
                    {post.profile?.full_name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{post.profile?.full_name || "Anonymous"}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {getCategoryIcon(post.category)} {post.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString()}
                  </p>
                </div>
                {user?.id === post.user_id && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(post)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(post.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold mb-2">{post.title}</h2>
              <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{post.content}</p>

              <div className="flex items-center gap-4 pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className={`gap-2 ${userLikes[post.id] ? 'text-destructive' : ''}`}
                >
                  <Heart className={`h-4 w-4 ${userLikes[post.id] ? 'fill-destructive' : ''}`} />
                  {postLikes[post.id] || 0}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleComments(post.id)}
                  className="gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  {post.comments_count || 0}
                </Button>
              </div>

              {activeComments === post.id && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  <div className="space-y-3">
                    {comments[post.id]?.map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/20">
                            {comment.profile?.full_name?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.profile?.full_name || "Anonymous"}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {user && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(post.id);
                          }
                        }}
                      />
                      <Button onClick={() => handleAddComment(post.id)}>Post</Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>

        {!user && (
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg mb-4">Sign in to join the community and share your journey</p>
            <Button onClick={() => window.location.href = "/auth"}>
              Sign In
            </Button>
          </Card>
        )}

        {filteredPosts.length === 0 && user && (
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg mb-4">No posts found. Be the first to share!</p>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Community;
