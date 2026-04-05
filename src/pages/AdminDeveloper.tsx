import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code2, Github, Activity, Wrench, AlertTriangle, Key } from 'lucide-react';
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
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Developer Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered debugging, monitoring & management</p>
        </div>

        <Tabs defaultValue="health" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
            <TabsTrigger value="health" className="gap-1.5 text-xs"><Activity className="h-3.5 w-3.5" />Health</TabsTrigger>
            <TabsTrigger value="ai-chat" className="gap-1.5 text-xs"><Code2 className="h-3.5 w-3.5" />AI Debug</TabsTrigger>
            <TabsTrigger value="autofix" className="gap-1.5 text-xs"><Wrench className="h-3.5 w-3.5" />Auto Fix</TabsTrigger>
            <TabsTrigger value="errors" className="gap-1.5 text-xs"><AlertTriangle className="h-3.5 w-3.5" />Errors</TabsTrigger>
            <TabsTrigger value="github" className="gap-1.5 text-xs"><Github className="h-3.5 w-3.5" />GitHub</TabsTrigger>
            <TabsTrigger value="keys" className="gap-1.5 text-xs"><Key className="h-3.5 w-3.5" />API Keys</TabsTrigger>
          </TabsList>

          <TabsContent value="health"><DevHealthMonitor /></TabsContent>
          <TabsContent value="ai-chat"><DevAIChat /></TabsContent>
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
