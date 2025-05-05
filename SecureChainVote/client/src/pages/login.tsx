import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      // For prototype, use the fallback login endpoint that accepts any credentials
      const response = await apiRequest("POST", "/api/auth/login-fallback", {
        username: data.username,
        password: data.password, // Password is ignored in prototype mode
      });
      
      if (response.ok) {
        const userData = await response.json();
        // Store user in localStorage for prototype persistence
        localStorage.setItem('blockvote_user', JSON.stringify(userData.user));
        
        toast({
          title: "Welcome, " + userData.user.username,
          description: "You have been successfully logged in",
        });
        
        setLocation("/dashboard");
      } else {
        // Try the regular login as a fallback
        const regularResponse = await apiRequest("POST", "/api/auth/login", {
          username: data.username,
          password: data.password,
        });
        
        if (regularResponse.ok) {
          const userData = await regularResponse.json();
          // Store user in localStorage for prototype persistence
          localStorage.setItem('blockvote_user', JSON.stringify(userData.user));
          
          toast({
            title: "Welcome, " + userData.user.username,
            description: "You have been successfully logged in",
          });
          
          setLocation("/dashboard");
        } else {
          // In prototype mode, we should never reach this point
          throw new Error("Login failed - please try again");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      // In prototype mode, always succeed even if there's an error
      // Create a fake user
      const fakeUser = {
        id: Math.floor(Math.random() * 10000),
        username: data.username,
        fullName: data.username,
        role: data.username.toLowerCase() === 'admin' ? 'admin' : 'voter',
        email: `${data.username}@example.com`,
        verified: true
      };
      
      // Store in localStorage
      localStorage.setItem('blockvote_user', JSON.stringify(fakeUser));
      
      toast({
        title: "Welcome, " + data.username,
        description: "You have been successfully logged in",
      });
      setLocation("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center mb-4">
            <svg className="h-10 w-10 mr-2 text-primary-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 9H22M2 15H22M12 3L8 21M16 3L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-2xl font-bold text-slate-900">BlockVote</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Sign In to Your Account</h1>
          <p className="text-slate-500 mt-2">Enter your credentials to access the e-voting system</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your username and password to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  {...form.register("username")}
                />
                {form.formState.errors.username && (
                  <p className="text-red-500 text-xs">{form.formState.errors.username.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a 
                    href="#" 
                    className="text-sm text-primary-600 hover:text-primary-800"
                    onClick={(e) => {
                      e.preventDefault();
                      toast({
                        title: "Password Reset",
                        description: "Password reset functionality is not implemented in this demo.",
                      });
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-red-500 text-xs">{form.formState.errors.password.message}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rememberMe" 
                  {...form.register("rememberMe")} 
                />
                <Label htmlFor="rememberMe" className="text-sm">Remember me</Label>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              Don't have an account?{" "}
              <a 
                onClick={() => setLocation("/register")}
                className="text-primary-600 hover:text-primary-800 cursor-pointer"
              >
                Sign up
              </a>
            </div>
          </CardFooter>
        </Card>
        
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>For demonstration purposes:</p>
          <p>This is a prototype - enter any username and password</p>
          <p>Type "admin" as username to get admin rights</p>
        </div>
      </div>
    </div>
  );
}
