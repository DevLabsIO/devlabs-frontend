"use client";

import { useState } from "react";
import { useSessionContext } from "@/lib/session-context";
import { useTheme } from "next-themes";
import AuthGuard from "@/components/auth/AuthGuard";
import { GROUPS } from "@/types/auth/roles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  User,
  Bell,
  Palette,
  Monitor,
  Smartphone,
  Eye,
  RotateCcw,
} from "lucide-react";

function capitalizeWord(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export default function SettingsPage() {
  const { session } = useSessionContext();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("account");
  const [fontSize, setFontSize] = useState([16]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const applyFontSize = (size: number[]) => {
    setFontSize(size);
    document.documentElement.style.setProperty(
      "--base-font-size",
      `${size[0]}px`,
    );
  };

  const resetFontSize = () => {
    setFontSize([16]);
    document.documentElement.style.setProperty("--base-font-size", "16px");
  };

  return (
    <AuthGuard
      requiredGroups={[
        GROUPS.ADMIN,
        GROUPS.FACULTY,
        GROUPS.STUDENT,
        GROUPS.MANAGER,
      ]}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <Avatar className="h-28 w-28 mx-auto ring-4 ring-primary/20">
                      <AvatarImage src={session?.user?.image || ""} />
                      <AvatarFallback className="text-3xl font-semibold bg-gradient-to-br from-primary to-primary/80 text-white">
                        {session?.user?.name?.slice(0, 2).toUpperCase() || "US"}
                      </AvatarFallback>
                    </Avatar>
                    <Badge className="absolute -bottom-1 -right-1 bg-primary border-0">
                      {session?.user.groups[0].toUpperCase() || "User"}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">
                      {capitalizeWord(session?.user?.name || "User Name")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {session?.user?.email || "user@example.com"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <div className="rounded-xl border p-2">
                <TabsList className="grid w-full grid-cols-3 bg-transparent gap-2">
                  <TabsTrigger value="account">
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </TabsTrigger>
                  <TabsTrigger value="appearance">
                    <Palette className="h-4 w-4 mr-2" />
                    Appearance
                  </TabsTrigger>
                  <TabsTrigger disabled={true} value="notifications">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="account" className="space-y-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal details and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          disabled={true}
                          placeholder="Enter your full name"
                          defaultValue={capitalizeWord(
                            session?.user?.name || "",
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          disabled={true}
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          defaultValue={session?.user?.email || ""}
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mt-6">User Roles</h3>
                      <ul className="list-disc pl-6">
                        {session?.user.roles && (
                          <div className="flex flex-wrap gap-2">
                            {session.user.roles.map((role, index) => (
                              <Badge key={index}>{role}</Badge>
                            ))}
                          </div>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>{" "}
              <TabsContent value="appearance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" />
                      Theme & Display
                    </CardTitle>
                    <CardDescription>
                      Customize your interface appearance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <Label>Theme Mode</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {["light", "dark", "system"].map((themeOption) => (
                          <div
                            key={themeOption}
                            className={`relative cursor-pointer rounded-lg border-2 p-3 ${
                              theme === themeOption
                                ? "border-primary bg-primary/5"
                                : "border-border"
                            }`}
                            onClick={() => handleThemeChange(themeOption)}
                          >
                            <div className="flex items-center gap-2">
                              {themeOption === "light" && (
                                <Monitor className="h-4 w-4" />
                              )}
                              {themeOption === "dark" && (
                                <Smartphone className="h-4 w-4" />
                              )}
                              {themeOption === "system" && (
                                <Eye className="h-4 w-4" />
                              )}
                              <span className="capitalize text-sm font-medium">
                                {themeOption}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Font Size: {fontSize[0]}px</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetFontSize}
                          className="h-8 px-3"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reset
                        </Button>
                      </div>
                      <Slider
                        value={fontSize}
                        onValueChange={applyFontSize}
                        max={24}
                        min={12}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Small (12px)</span>
                        <span>Large (24px)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-primary" />
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {[
                      {
                        title: "Exam Reminders",
                        desc: "Get notified about upcoming exams",
                        default: true,
                      },
                      {
                        title: "Score Updates",
                        desc: "Receive notifications when results are available",
                        default: true,
                      },
                      {
                        title: "Assignment Deadlines",
                        desc: "Reminders for assignment due dates",
                        default: true,
                      },
                      {
                        title: "System Announcements",
                        desc: "Important platform updates and news",
                        default: false,
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <Label>{item.title}</Label>
                          <p className="text-sm text-muted-foreground">
                            {item.desc}
                          </p>
                        </div>
                        <Switch defaultChecked={item.default} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
