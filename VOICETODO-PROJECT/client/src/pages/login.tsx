import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic } from "lucide-react";
import { useLogin } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login.mutateAsync({ username, password });
      setLocation("/");
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid username or password",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-sm shadow-material-3">
        <CardContent className="pt-8 pb-8 px-8">
          {/* App Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mic className="text-white text-2xl" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">VoiceTodo</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Smart Task Manager</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="mt-2 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="mt-2 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <Button 
              type="submit" 
              disabled={login.isPending}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-xl transition duration-200 shadow-material-2 hover:shadow-material-3"
            >
              {login.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          
        </CardContent>
      </Card>
    </div>
  );
}
