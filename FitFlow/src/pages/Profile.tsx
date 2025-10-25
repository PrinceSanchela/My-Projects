import { useState, useEffect, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase/firebaseConfig";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { updateProfile, updatePassword } from "firebase/auth";
import axios from "axios";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/utils/cropImage";

interface UserProfile {
  full_name: string;
  email: string;
  photoURL: string;
  age?: number;
  weight?: number;
  height?: number;
  waist?: number;
  hip?: number;
  bmi?: number;
  bodyFat?: number;
}

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({ full_name: "", email: "", photoURL: "" });
  const [tempProfile, setTempProfile] = useState<UserProfile>({} as UserProfile);
  const [physicalStats, setPhysicalStats] = useState<UserProfile>({} as UserProfile);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingStats, setEditingStats] = useState(false);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<File | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      const data = docSnap.data();
      if (data) {
        const bmi = data.height && data.weight ? (data.weight / ((data.height / 100) ** 2)).toFixed(1) : undefined;
        const updatedProfile: UserProfile = {
          full_name: data.full_name || user.displayName || "",
          email: user.email,
          photoURL: data.photoURL || user.photoURL || "",
          age: data.age,
          weight: data.weight,
          height: data.height,
          waist: data.waist,
          hip: data.hip,
          bmi: bmi ? parseFloat(bmi) : undefined,
          bodyFat: data.bodyFat,
        };
        setProfile(updatedProfile);
        setTempProfile(updatedProfile);
        setPhysicalStats(updatedProfile);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const onCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCropSave = async () => {
    if (!newPhoto || !croppedAreaPixels) return;
    const croppedFile = await getCroppedImg(URL.createObjectURL(newPhoto), croppedAreaPixels);
    setCroppedImage(croppedFile);
    setShowCropModal(false);
  };

  const handlePhotoUpload = async () => {
    if (!croppedImage || !user) return toast({ title: "Select a photo", variant: "destructive" });
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", croppedImage);
      formData.append("upload_preset", "fitflow_upload_img");

      const res = await axios.post("https://api.cloudinary.com/v1_1/djnehcsju/image/upload", formData, {
        onUploadProgress: progressEvent => setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total))
      });

      const photoURL = res.data.secure_url;
      await updateProfile(user, { photoURL });
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { photoURL }, { merge: true });

      setProfile(prev => ({ ...prev, photoURL }));
      setNewPhoto(null);
      setCroppedImage(null);
      setUploadProgress(0);
      toast({ title: "Profile photo updated!" });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error uploading photo", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleProfileSave = async () => {
    if (!user) return;
    try {
      const { full_name } = tempProfile;
      if (full_name !== profile.full_name) await updateProfile(user, { displayName: full_name });
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { full_name }, { merge: true });
      if (password) {
        await updatePassword(user, password);
        setPassword("");
      }
      setProfile({ ...profile, ...tempProfile });
      setEditingProfile(false);
      toast({ title: "Profile updated successfully!" });
    } catch (err: any) {
      toast({ title: "Error updating profile", description: err.message, variant: "destructive" });
    }
  };

  const handleStatsSave = async () => {
    if (!user) return;
    try {
      const { weight, height, waist, hip, age, bodyFat } = physicalStats;
      const bmi = weight && height ? parseFloat((weight / ((height / 100) ** 2)).toFixed(1)) : undefined;
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { weight, height, waist, hip, age, bodyFat, bmi }, { merge: true });
      setProfile(prev => ({ ...prev, weight, height, waist, hip, age, bodyFat, bmi }));
      setEditingStats(false);
      toast({ title: "Physical stats updated!" });
    } catch (err: any) {
      toast({ title: "Error updating stats", description: err.message, variant: "destructive" });
    }
  };

  if (!user) return <div className="text-center mt-32">Loading profile...</div>;

  const waistHipRatio = physicalStats.waist && physicalStats.hip ? (physicalStats.waist / physicalStats.hip).toFixed(2) : "-";
  const bmiCategory = profile.bmi
    ? profile.bmi < 18.5 ? "Underweight"
      : profile.bmi < 24.9 ? "Normal"
        : profile.bmi < 29.9 ? "Overweight"
          : "Obese"
    : "-";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-12 space-y-8">
        <h1 className="text-4xl font-bold mb-6">My Profile</h1>

        {/* Profile Card */}
        <Card className="p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32">
              <img
                src={croppedImage ? URL.createObjectURL(croppedImage) : profile.photoURL}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-2 border-primary"
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                  <span className="text-white font-semibold">{uploadProgress}%</span>
                </div>
              )}
            </div>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setNewPhoto(e.target.files?.[0] || null);
                setShowCropModal(true);
              }}
            />

            {/* Crop Modal with Live Circle Preview */}
            {showCropModal && newPhoto && (
              <div className="fixed inset-0 z-50 bg-black/70 flex justify-center items-center">
                <Card className="p-4 relative w-96 h-96 flex flex-col">
                  <div className="relative flex-1">
                    <Cropper
                      image={URL.createObjectURL(newPhoto)}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="round"
                      showGrid={false}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                    <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center pointer-events-none">
                      <div className="w-32 h-32 border-2 border-white rounded-full" />
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <Button onClick={handleCropSave}>Crop & Save</Button>
                    <Button variant="outline" onClick={() => setShowCropModal(false)}>Cancel</Button>
                  </div>
                </Card>
              </div>
            )}

            <Button onClick={handlePhotoUpload} disabled={!croppedImage || uploading}>
              {uploading ? "Uploading..." : "Upload Photo"}
            </Button>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                value={tempProfile.full_name}
                onChange={e => setTempProfile({ ...tempProfile, full_name: e.target.value })}
                disabled={!editingProfile}
                placeholder="Full Name"
              />
              <Input value={tempProfile.email} disabled placeholder="Email" />
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={!editingProfile}
                placeholder="New Password"
              />
            </div>
            {editingProfile ? (
              <div className="flex gap-2 mt-2">
                <Button onClick={handleProfileSave}>Save</Button>
                <Button variant="outline" onClick={() => { setTempProfile(profile); setEditingProfile(false); setPassword(""); }}>Cancel</Button>
              </div>
            ) : (
              <Button onClick={() => setEditingProfile(true)}>Edit Profile</Button>
            )}
          </div>
        </Card>

        {/* Physical Stats Card */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Physical Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Input type="number" value={physicalStats.age || ""} onChange={e => setPhysicalStats({ ...physicalStats, age: Number(e.target.value) })} disabled={!editingStats} placeholder="Age" />
            <Input type="number" value={physicalStats.weight || ""} onChange={e => setPhysicalStats({ ...physicalStats, weight: Number(e.target.value) })} disabled={!editingStats} placeholder="Weight (kg)" />
            <Input type="number" value={physicalStats.height || ""} onChange={e => setPhysicalStats({ ...physicalStats, height: Number(e.target.value) })} disabled={!editingStats} placeholder="Height (cm)" />
            <Input type="number" value={physicalStats.waist || ""} onChange={e => setPhysicalStats({ ...physicalStats, waist: Number(e.target.value) })} disabled={!editingStats} placeholder="Waist (cm)" />
            <Input type="number" value={physicalStats.hip || ""} onChange={e => setPhysicalStats({ ...physicalStats, hip: Number(e.target.value) })} disabled={!editingStats} placeholder="Hip (cm)" />
            <Input type="number" value={physicalStats.bodyFat || ""} onChange={e => setPhysicalStats({ ...physicalStats, bodyFat: Number(e.target.value) })} disabled={!editingStats} placeholder="Body Fat (%)" />
            <Input value={profile.bmi || ""} disabled placeholder={`BMI: ${bmiCategory}`} />
            <Input value={waistHipRatio} disabled placeholder="Waist/Hip Ratio" />
          </div>
          {editingStats ? (
            <div className="flex gap-2 mt-2">
              <Button onClick={handleStatsSave}>Save</Button>
              <Button variant="outline" onClick={() => { setPhysicalStats(profile); setEditingStats(false); }}>Cancel</Button>
            </div>
          ) : (
            <Button onClick={() => setEditingStats(true)} className="mt-2">Edit Stats</Button>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Profile;
