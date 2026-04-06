import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Activity, Wrench, AlertTriangle, Key, Github, Sparkles, Shield } from 'lucide-react';
import DevAIChat from '@/components/dev/DevAIChat';
import DevHealthMonitor from '@/components/dev/DevHealthMonitor';
import DevErrorLog from '@/components/dev/DevErrorLog';
import DevAPIKeyManager from '@/components/dev/DevAPIKeyManager';
import DevGitHubIntegration from '@/components/dev/DevGitHubIntegration';
import DevAutoFix from '@/components/dev/DevAutoFix';

const AdminDeveloper = () => {
  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(var(--primary)/0.85)] to-[hsl(var(--accent))] p-6 md:p-8 text-primary-foreground">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZWMzRoNnptMC0zMHY2aC02VjRoNnptMCAxNXY2aC02di02aDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-display font-bold">AI Engineer Console</h1>
                <p className="text-sm opacity-80">Intelligent diagnostics, debugging & site management</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <div className="flex items-center gap-1.5 text-xs bg-white/15 backdrop-blur-sm rounded-full px-3 py-1">
                <Shield className="h-3 w-3" /> Auto-Diagnostics
              </div>
              <div className="flex items-center gap-1.5 text-xs bg-white/15 backdrop-blur-sm rounded-full px-3 py-1">
                <Bot className="h-3 w-3" /> AI Code Analysis
              </div>
              <div className="flex items-center gap-1.5 text-xs bg-white/15 backdrop-blur-sm rounded-full px-3 py-1">
                <Activity className="h-3 w-3" /> Real-time Monitoring
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="ai-chat" className="space-y-4">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1.5 rounded-xl">
            <TabsTrigger value="ai-chat" className="gap-1.5 text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bot className="h-3.5 w-3.5" />AI Engineer
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-1.5 text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="h-3.5 w-3.5" />Health
            </TabsTrigger>
            <TabsTrigger value="autofix" className="gap-1.5 text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Wrench className="h-3.5 w-3.5" />Auto Fix
            </TabsTrigger>
            <TabsTrigger value="errors" className="gap-1.5 text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <AlertTriangle className="h-3.5 w-3.5" />Errors
            </TabsTrigger>
            <TabsTrigger value="github" className="gap-1.5 text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Github className="h-3.5 w-3.5" />GitHub
            </TabsTrigger>
            <TabsTrigger value="keys" className="gap-1.5 text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Key className="h-3.5 w-3.5" />API Keys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-chat"><DevAIChat /></TabsContent>
          <TabsContent value="health"><DevHealthMonitor /></TabsContent>
          <TabsContent value="autofix"><DevAutoFix /></TabsContent>
          <TabsContent value="errors"><DevErrorLog /></TabsContent>
          <TabsContent value="github"><DevGitHubIntegration /></TabsContent>
          <TabsContent value="keys"><DevAPIKeyManager /></TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminDeveloper;
