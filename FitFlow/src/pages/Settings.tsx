import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bell, Moon, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [settings, setSettings] = useState({
    workoutReminders: true,
    mealTracking: false,
    communityUpdates: true,
    publicProfile: true,
    showActivity: true
  });
  const { toast } = useToast();

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({ title: "Setting updated" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mb-8">
            Customize your FitFlow experience
          </p>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Workout Reminders</p>
                    <p className="text-sm text-muted-foreground">Get notified about scheduled workouts</p>
                  </div>
                  <Switch 
                    checked={settings.workoutReminders}
                    onCheckedChange={(checked) => updateSetting('workoutReminders', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Meal Tracking</p>
                    <p className="text-sm text-muted-foreground">Reminders to log your meals</p>
                  </div>
                  <Switch 
                    checked={settings.mealTracking}
                    onCheckedChange={(checked) => updateSetting('mealTracking', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Community Updates</p>
                    <p className="text-sm text-muted-foreground">New posts and replies</p>
                  </div>
                  <Switch 
                    checked={settings.communityUpdates}
                    onCheckedChange={(checked) => updateSetting('communityUpdates', checked)}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Appearance
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Privacy
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Public Profile</p>
                    <p className="text-sm text-muted-foreground">Make your profile visible to others</p>
                  </div>
                  <Switch 
                    checked={settings.publicProfile}
                    onCheckedChange={(checked) => updateSetting('publicProfile', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Activity</p>
                    <p className="text-sm text-muted-foreground">Display your workout activity</p>
                  </div>
                  <Switch 
                    checked={settings.showActivity}
                    onCheckedChange={(checked) => updateSetting('showActivity', checked)}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
