import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Error",
        description: "New passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    // Password update logic would go here
    toast({
      title: "Password Updated",
      description: "Your password has been successfully changed.",
    });
    
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };
  
  const handleSaveBlockchainSettings = () => {
    toast({
      title: "Settings Updated",
      description: "Blockchain settings have been updated successfully.",
    });
  };
  
  const handleSaveNotificationSettings = () => {
    toast({
      title: "Settings Updated",
      description: "Notification preferences have been updated successfully.",
    });
  };
  
  const handleResetSettings = () => {
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your account and system preferences</p>
      </div>
      
      <Tabs defaultValue="account" className="mb-6">
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" defaultValue="Admin Johnson" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" defaultValue="admin" readOnly className="bg-slate-50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="admin@blockvote.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" defaultValue="System Administrator" readOnly className="bg-slate-50" />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to enhance security</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      name="currentPassword"
                      type="password" 
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      name="newPassword"
                      type="password" 
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword"
                      type="password" 
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">Update Password</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add additional security to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Two-Factor Authentication</h4>
                    <p className="text-sm text-slate-500">Protect your account with an additional security layer</p>
                  </div>
                  <Switch id="twoFactorAuth" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="blockchain">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Configuration</CardTitle>
              <CardDescription>Customize blockchain network settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="consensusAlgorithm">Consensus Algorithm</Label>
                  <Select defaultValue="poa">
                    <SelectTrigger>
                      <SelectValue placeholder="Select consensus algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="poa">Proof of Authority (PoA)</SelectItem>
                      <SelectItem value="pow">Proof of Work (PoW)</SelectItem>
                      <SelectItem value="pos">Proof of Stake (PoS)</SelectItem>
                      <SelectItem value="pbft">Practical Byzantine Fault Tolerance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="blockTime">Block Generation Time (seconds)</Label>
                  <Input id="blockTime" type="number" defaultValue="30" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="transactionsPerBlock">Transactions Per Block</Label>
                  <Input id="transactionsPerBlock" type="number" defaultValue="10" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="miningDifficulty">Mining Difficulty (PoW only)</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (0000)</SelectItem>
                      <SelectItem value="medium">Medium (00000)</SelectItem>
                      <SelectItem value="high">High (000000)</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="enableValidation" defaultChecked />
                  <Label htmlFor="enableValidation">Enable real-time chain validation</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleResetSettings}>Reset to Defaults</Button>
              <Button onClick={handleSaveBlockchainSettings}>Save Configuration</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage your notification settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Election Start/End</h4>
                    <p className="text-sm text-slate-500">Notify when elections start or end</p>
                  </div>
                  <Switch id="electionNotify" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium mb-1">New Block Created</h4>
                    <p className="text-sm text-slate-500">Notify when new blocks are added to the chain</p>
                  </div>
                  <Switch id="blockNotify" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Voter Registration</h4>
                    <p className="text-sm text-slate-500">Notify when new voters register</p>
                  </div>
                  <Switch id="voterNotify" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium mb-1">System Alerts</h4>
                    <p className="text-sm text-slate-500">Notify about critical system events</p>
                  </div>
                  <Switch id="systemNotify" defaultChecked />
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-3">Notification Methods</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Email Notifications</h4>
                        <p className="text-sm text-slate-500">Receive notifications via email</p>
                      </div>
                      <Switch id="emailNotify" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium mb-1">In-App Notifications</h4>
                        <p className="text-sm text-slate-500">Receive notifications in the application</p>
                      </div>
                      <Switch id="inAppNotify" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="ml-auto" 
                onClick={handleSaveNotificationSettings}
              >
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>System configuration and maintenance options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>System Maintenance</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline">
                      <i className="fas fa-database mr-2"></i>
                      Export Blockchain Data
                    </Button>
                    <Button variant="outline">
                      <i className="fas fa-sync mr-2"></i>
                      Synchronize Nodes
                    </Button>
                    <Button variant="outline">
                      <i className="fas fa-chart-line mr-2"></i>
                      Generate Reports
                    </Button>
                    <Button variant="outline">
                      <i className="fas fa-shield-alt mr-2"></i>
                      Security Audit
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="systemMode">System Mode</Label>
                    <Select defaultValue="production">
                      <SelectTrigger>
                        <SelectValue placeholder="Select system mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="readonly">Read-Only</SelectItem>
                        <SelectItem value="debug">Debug</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-3 text-destructive">Danger Zone</h3>
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-red-800 mb-1">Reset Blockchain</h4>
                      <p className="text-sm text-red-600 mb-3">This will delete all blocks and transactions. This action cannot be undone.</p>
                      <Button variant="destructive" size="sm">Reset Blockchain</Button>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-red-800 mb-1">Clear All Data</h4>
                      <p className="text-sm text-red-600 mb-3">This will delete all system data including users, elections, and the blockchain. This action cannot be undone.</p>
                      <Button variant="destructive" size="sm">Clear All Data</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
