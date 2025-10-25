import React, { useEffect, useRef, useState } from "react";
import { db, auth } from "@/firebase/firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  Heart,
  MessageSquare,
  Share2,
  Trash,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Edit,
  Bell,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { motion, AnimatePresence } from "framer-motion";


const CLOUD_NAME = "djnehcsju";
const UPLOAD_PRESET = "ml_default";

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  text: string;
  emojis?: string[];
}

interface Media {
  url: string;
  type: "image" | "video";
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  text: string;
  hashtags?: string[];
  mediaUrls?: Media[];
  likes: string[];
  comments: Comment[];
  createdAt: any;
  emojis?: string[];
}


interface NotificationItem {
  id: string;
  postId: string;
  type: "like" | "comment" | "emoji";
  fromUser: string;
  toUserId?: string;
  text?: string;
  createdAt?: any;
}

export default function Community() {
  const postsRef = collection(db, "communityPosts");
  const notificationsRef = collection(db, "notifications");

  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [editPostTexts, setEditPostTexts] = useState<Record<string, string>>({});
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<Media[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [highlightedPost, setHighlightedPost] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const postRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // load firebase user info
  useEffect(() => {
    const u = auth.currentUser;
    if (u) {
      setUserId(u.uid);
      setUserName(u.displayName || u.email || "Anonymous");
    }
    // Also listen for auth changes (if needed)
    // const unsub = onAuthStateChanged(auth, (u) => { ... })
    // return () => unsub();
  }, []);

  // Real-time posts (ordered by createdAt desc)
  useEffect(() => {
    const q = query(postsRef, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr: Post[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Post));
        setPosts(arr);
      },
      (err) => {
        console.error("Posts snapshot error:", err);
        // If Firestore complains about required index, the console message includes a link to create it.
      }
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real-time notifications list (for current user) — simple feed of all notifications for demo
  useEffect(() => {
    const q = query(notificationsRef, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const arr: NotificationItem[] = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) } as NotificationItem))
        // If you want only notifications targeted to the signed-in user, filter by toUserId === userId
        // .filter(n => n.toUserId === userId)
        ;
      setNotifications(arr);
    });
    return () => unsub();
  }, [userId]);

  // Clean up object URLs when mediaPreviews change or component unmounts
  useEffect(() => {
    return () => {
      mediaPreviews.forEach((p) => {
        try {
          URL.revokeObjectURL(p);
        } catch { }
      });
    };
  }, [mediaPreviews]);

  /* ------------------------- Upload helpers ------------------------- */

  async function uploadToCloudinary(file: File): Promise<Media> {
    // This uses unsigned upload preset. Ensure the preset exists and is set to unsigned.
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Cloudinary upload failed (${res.status}): ${text}`);
    }
    const data = await res.json();
    if (!data.secure_url) throw new Error("Upload returned no secure_url");
    return { url: data.secure_url as string, type: file.type.startsWith("video") ? "video" : "image" };
  }

  /* ------------------------- Post CRUD ------------------------- */

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setMediaFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setMediaPreviews((prev) => [...prev, ...previews]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    setMediaFiles((prev) => [...prev, ...files]);
    setMediaPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const handleAddPost = async () => {

    if (!newPost.trim() && mediaFiles.length === 0) return;
    setLoading(true);
    try {
      // upload media first
      const uploaded: Media[] = [];
      for (const f of mediaFiles) {
        try {
          const m = await uploadToCloudinary(f);
          uploaded.push(m);
        } catch (err) {
          console.error("Media upload failed for file:", f.name, err);
          // continue with other files (or you can abort)
        }
      }

      // extract hashtags
      const hashtags = Array.from(newPost.matchAll(/#(\w+)/g), (m) => m[1]);

      await addDoc(postsRef, {
        text: newPost,
        hashtags,
        mediaUrls: uploaded,
        likes: [],
        comments: [],
        userId,
        userName,
        userPhotoURL: auth.currentUser?.photoURL || "",
        createdAt: serverTimestamp(),
        emojis: [],
      });

      // clear composer
      setNewPost("");
      setMediaFiles([]);
      setMediaPreviews([]);
    } catch (err) {
      console.error("Error adding post:", err);
      alert("Failed to add post. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await deleteDoc(doc(db, "communityPosts", postId));
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Delete failed");
    }
  };

  const handleStartEdit = (postId: string, text: string) => {
    setEditPostTexts((p) => ({ ...p, [postId]: text }));
  };

  const handleEditPost = async (postId: string) => {
    const text = editPostTexts[postId]?.trim();
    if (!text) return;
    try {
      await updateDoc(doc(db, "communityPosts", postId), { text });
      setEditPostTexts((p) => ({ ...p, [postId]: "" }));
    } catch (err) {
      console.error("Edit post failed:", err);
      alert("Failed to save post");
    }
  };

  /* ------------------------- Likes / Emojis / Notifications ------------------------- */

  const handleLike = async (post: Post) => {
    try {
      const postRef = doc(db, "communityPosts", post.id);
      const isLiked = (post.likes || []).includes(userId);
      await updateDoc(postRef, { likes: isLiked ? arrayRemove(userId) : arrayUnion(userId) });

      // create notification only when it's a new like and target isn't current user
      if (!isLiked && post.userId && post.userId !== userId) {
        await addDoc(notificationsRef, {
          postId: post.id,
          type: "like",
          fromUser: userName,
          toUserId: post.userId,
          text: "",
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  const handleEmoji = async (post: Post, emoji: string) => {
    try {
      const postRef = doc(db, "communityPosts", post.id);
      const has = (post.emojis || []).includes(emoji);
      if (has) await updateDoc(postRef, { emojis: arrayRemove(emoji) });
      else await updateDoc(postRef, { emojis: arrayUnion(emoji) });

      if (!has && post.userId && post.userId !== userId) {
        await addDoc(notificationsRef, {
          postId: post.id,
          type: "emoji",
          fromUser: userName,
          toUserId: post.userId,
          text: emoji,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("Emoji update failed:", err);
    }
  };

  /* ------------------------- Comments ------------------------- */

  const handleAddComment = async (postId: string) => {
    const txt = (commentTexts[postId] || "").trim();
    if (!txt) return;
    const comment: Comment = {
      id: Date.now().toString(),
      userId,
      userName,
      userPhotoURL: auth.currentUser?.photoURL || "",
      text: txt,
      emojis: [],
    };
    try {
      await updateDoc(doc(db, "communityPosts", postId), { comments: arrayUnion(comment) });

      // notify post owner
      const p = posts.find((pp) => pp.id === postId);
      if (p && p.userId && p.userId !== userId) {
        await addDoc(notificationsRef, {
          postId,
          type: "comment",
          fromUser: userName,
          toUserId: p.userId,
          text: txt,
          createdAt: serverTimestamp(),
        });
      }
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Add comment failed:", err);
      alert("Failed to post comment");
    }
  };

  const handleEditComment = async (postId: string, comment: Comment) => {
    const newText = prompt("Edit your comment", comment.text);
    if (!newText || newText.trim() === comment.text) return;
    try {
      const refDoc = doc(db, "communityPosts", postId);
      await updateDoc(refDoc, { comments: arrayRemove(comment) });
      await updateDoc(refDoc, { comments: arrayUnion({ ...comment, text: newText }) });
    } catch (err) {
      console.error("Edit comment failed:", err);
    }
  };

  const handleDeleteComment = async (postId: string, comment: Comment) => {
    try {
      await updateDoc(doc(db, "communityPosts", postId), { comments: arrayRemove(comment) });
    } catch (err) {
      console.error("Delete comment failed:", err);
    }
  };

  /* ------------------------- Share + Preview ------------------------- */

  const handleShare = (post: Post) => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: "Check out this post!", text: post.text, url });
    } else {
      // fallback: copy to clipboard
      navigator.clipboard?.writeText(`${post.text}\n${url}`).then(() => alert("Post copied to clipboard"));
    }
  };

  const openPreview = (media: Media[], index: number) => {
    setPreviewMedia(media);
    setPreviewIndex(index);
    setPreviewOpen(true);
    // lock scroll
    document.body.style.overflow = "hidden";
  };
  const closePreview = () => {
    setPreviewOpen(false);
    document.body.style.overflow = "";
  };
  const prevMedia = () => setPreviewIndex((p) => (p - 1 + previewMedia.length) % previewMedia.length);
  const nextMedia = () => setPreviewIndex((p) => (p + 1) % previewMedia.length);

  /* ------------------------- Render ------------------------- */

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Navigation />

      {/* Notification Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button variant="ghost" size="icon" onClick={() => setShowNotifPanel((s) => !s)}>
          <Bell size={20} />
        </Button>
      </div>

      {/* Notifications panel */}
      {showNotifPanel && (
        <div className="absolute right-4 top-16 w-80 max-h-96 overflow-y-auto bg-card/90 backdrop-blur-md border border-border rounded-lg p-4 space-y-2 z-50">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="text-sm bg-muted/50 p-2 rounded-md cursor-pointer hover:bg-muted/70"
                onClick={() => {
                  const ref = postRefs.current[n.postId];
                  if (ref) {
                    ref.scrollIntoView({ behavior: "smooth", block: "center" });
                    setHighlightedPost(n.postId);
                    setTimeout(() => setHighlightedPost(null), 2000);
                    setShowNotifPanel(false);
                  }
                }}
              >
                {n.type === "like" && <span><strong>{n.fromUser}</strong> liked your post</span>}
                {n.type === "comment" && <span><strong>{n.fromUser}</strong> commented: "{n.text}"</span>}
                {n.type === "emoji" && <span><strong>{n.fromUser}</strong> reacted {n.text}</span>}
              </div>
            ))
          )}
        </div>
      )}

      <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
        {/* Create Post */}
        <Card className={`p-6 shadow-lg bg-card/80 backdrop-blur-md border border-border rounded-2xl ${dragOver ? "border-blue-500 border-2" : ""}`}>
          <CardContent className="space-y-4">
            <Input
              ref={inputRef}
              placeholder="What's on your mind?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="bg-background/70"
            />

            <div className="flex gap-2 items-center">
              <label className="cursor-pointer flex items-center gap-1 px-3 py-1 bg-muted rounded-md">
                <ImageIcon size={16} />
                <span>Image/Video</span>
                <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleMediaChange} />
              </label>

              {mediaPreviews.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {mediaPreviews.map((src, idx) =>
                    src.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video key={idx} src={src} className="h-20 rounded-md" controls />
                    ) : (
                      <img key={idx} src={src} className="h-20 rounded-md object-cover" />
                    )
                  )}
                </div>
              )}

              <Button onClick={handleAddPost} disabled={loading} className="ml-auto bg-blue-600 text-white">
                <Upload className="mr-1 h-4 w-4" /> {loading ? "Posting..." : "Post"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts feed */}
        <AnimatePresence>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              ref={(el) => (postRefs.current[post.id] = el)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className={highlightedPost === post.id ? "border-2 border-blue-500 rounded-2xl transition-all" : ""}
            >
              <Card className="p-4 shadow-md bg-card/80 backdrop-blur-sm border border-border rounded-2xl">
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      {post.userPhotoURL && (
                        <img
                          src={post.userPhotoURL}
                          alt={post.userName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <h3 className="font-semibold">{post.userName}</h3>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleShare(post)}>
                        <Share2 size={18} />
                      </Button>
                      {post.userId === userId && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePost(post.id)}>
                            <Trash size={18} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleStartEdit(post.id, post.text)}>
                            <Edit size={18} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>


                  {editPostTexts[post.id] ? (
                    <div className="flex gap-2 mb-3">
                      <Input value={editPostTexts[post.id]} onChange={(e) => setEditPostTexts((p) => ({ ...p, [post.id]: e.target.value }))} />
                      <Button onClick={() => handleEditPost(post.id)}>Save</Button>
                    </div>
                  ) : (
                    <p className="mb-3 text-sm">
                      {post.text}{" "}
                      {post.hashtags?.map((tag) => (
                        <span key={tag} className="text-blue-500">
                          #{tag}{" "}
                        </span>
                      ))}
                    </p>
                  )}

                  {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="flex flex-col gap-2 mb-3">
                      {post.mediaUrls.map((m, idx) =>
                        m.type === "video" ? (
                          <video
                            key={idx}
                            src={m.url}
                            controls
                            className="rounded-xl max-h-80 w-full object-cover cursor-pointer"
                            onClick={() => openPreview(post.mediaUrls!, idx)}
                          />
                        ) : (
                          <img
                            key={idx}
                            src={m.url}
                            className="rounded-xl max-h-80 w-full object-cover cursor-pointer"
                            onClick={() => openPreview(post.mediaUrls!, idx)}
                          />
                        )
                      )}
                    </div>
                  )}

                  {/* Reactions */}
                  <div className="flex gap-2 mb-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEmoji(post, "❤️")}>
                      ❤️ {post.emojis?.filter((e) => e === "❤️").length || 0}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEmoji(post, "😂")}>
                      😂 {post.emojis?.filter((e) => e === "😂").length || 0}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEmoji(post, "🔥")}>
                      🔥 {post.emojis?.filter((e) => e === "🔥").length || 0}
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 mb-2">
                    <Button variant="ghost" size="sm" onClick={() => handleLike(post)}>
                      <Heart className={`mr-1 ${post.likes?.includes(userId) ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
                      {post.likes?.length || 0}
                    </Button>

                    <Button variant="ghost" size="sm" onClick={() => inputRef.current?.focus()}>
                      <MessageSquare className="mr-1 text-gray-500" />
                      {post.comments?.length || 0}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {post.comments?.map((c) => (
                      <div key={c.id} className="flex justify-between items-start bg-muted/50 p-2 rounded-md">
                        <div className="flex items-center gap-2">
                          {c.userPhotoURL && (
                            <img
                              src={c.userPhotoURL}
                              alt={c.userName}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          <span className="text-sm">
                            <strong>{c.userName}:</strong> {c.text}
                          </span>
                        </div>
                        {c.userId === userId && (
                          <div className="flex gap-1 ml-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditComment(post.id, c)}>
                              <Edit size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteComment(post.id, c)}>
                              <Trash size={14} />
                            </Button>
                          </div>
                        )}
                      </div>

                    ))}

                    <div className="flex gap-2 mt-2">
                      <Input placeholder="Add a comment..." value={commentTexts[post.id] || ""} onChange={(e) => setCommentTexts((p) => ({ ...p, [post.id]: e.target.value }))} />
                      <Button onClick={() => handleAddComment(post.id)} size="icon">
                        <Upload size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Fullscreen preview */}
      {previewOpen && previewMedia.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={closePreview}>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white" onClick={closePreview}>
              <X size={24} />
            </Button>

            {previewMedia[previewIndex].type === "video" ? (
              <video src={previewMedia[previewIndex].url} controls className="max-h-[80vh] max-w-[90vw]" />
            ) : (
              <img src={previewMedia[previewIndex].url} className="max-h-[80vh] max-w-[90vw]" />
            )}

            {previewMedia.length > 1 && (
              <>
                <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 text-white" onClick={prevMedia}>
                  <ChevronLeft size={24} />
                </Button>
                <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 text-white" onClick={nextMedia}>
                  <ChevronRight size={24} />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

