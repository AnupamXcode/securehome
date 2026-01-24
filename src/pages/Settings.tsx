import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Moon, 
  User, 
  Phone, 
  MapPin, 
  Play,
  LogOut,
  ChevronRight,
  Users,
  Plus,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useTrustedContacts } from '@/hooks/useTrustedContacts';
import { useEvents } from '@/hooks/useEvents';
import { BottomNav } from '@/components/layout/BottomNav';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Settings() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { profile, updateProfile, isUpdating } = useProfile();
  const { contacts, addContact, deleteContact, isAdding } = useTrustedContacts();
  const { createDemoEvent, isCreatingDemo } = useEvents();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone_number || '');
      setAddress(profile.home_address || '');
    }
  }, [profile]);

  const handleSaveProfile = () => {
    updateProfile({
      name,
      phone_number: phone,
      home_address: address,
    });
    toast.success('Profile updated');
  };

  const handleToggleAlerts = (enabled: boolean) => {
    updateProfile({ alerts_enabled: enabled });
  };

  const handleToggleDemoMode = (enabled: boolean) => {
    updateProfile({ demo_mode_enabled: enabled });
  };

  const handleAddContact = () => {
    if (!newContactName || !newContactPhone) {
      toast.error('Please fill in all fields');
      return;
    }
    addContact({ name: newContactName, phone_number: newContactPhone });
    setNewContactName('');
    setNewContactPhone('');
    setContactDialogOpen(false);
    toast.success('Contact added');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container px-4 py-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary" />
            Settings
          </h1>
        </div>
      </header>

      <main className="container px-4 py-4 space-y-4">
        {/* Profile Section */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email || ''}
                disabled
                className="opacity-60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Home Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City"
                  className="pl-10"
                />
              </div>
            </div>
            <Button 
              onClick={handleSaveProfile} 
              disabled={isUpdating}
              className="w-full gradient-primary"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Trusted Contacts */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Trusted Contacts
              </CardTitle>
              <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Trusted Contact</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        placeholder="Neighbor's name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <Button 
                      onClick={handleAddContact} 
                      disabled={isAdding}
                      className="w-full gradient-primary"
                    >
                      {isAdding ? 'Adding...' : 'Add Contact'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No trusted contacts yet. Add a neighbor to notify in emergencies.
              </p>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div 
                    key={contact.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.phone_number}</p>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => deleteContact(contact.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Get alerts on your phone</p>
                </div>
              </div>
              <Switch
                checked={profile?.alerts_enabled ?? true}
                onCheckedChange={handleToggleAlerts}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Play className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Demo Mode</p>
                  <p className="text-sm text-muted-foreground">Enable simulated events</p>
                </div>
              </div>
              <Switch
                checked={profile?.demo_mode_enabled ?? true}
                onCheckedChange={handleToggleDemoMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Demo Trigger */}
        {profile?.demo_mode_enabled && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <Button 
                onClick={() => createDemoEvent()}
                disabled={isCreatingDemo}
                className="w-full gradient-primary"
              >
                <Play className="h-4 w-4 mr-2" />
                {isCreatingDemo ? 'Triggering...' : 'Trigger Demo Alert'}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Simulates a motion detection event for testing
              </p>
            </CardContent>
          </Card>
        )}

        {/* Sign Out */}
        <Button 
          variant="outline" 
          className="w-full border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}
