/**
 * @description
 * Dashboard page component that serves as the main landing page for logged-in users.
 * Displays overview statistics and quick access to key features.
 *
 * Key features:
 * - Summary statistics (jobs, GPUs, balance)
 * - Recent activity indicators
 * - Quick access to common actions
 *
 * @dependencies
 * - Next.js: For server component
 * - components/ui/card: For statistic cards
 * - components/ui/button: For action buttons
 * - lucide-react: For icons
 *
 * @notes
 * - This is a server component by default in Next.js app router
 * - Future: Connect to real data sources for stats
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Cpu, DollarSign, Plus, Zap } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  // These would eventually come from real data sources (server actions)
  const stats = {
    totalJobs: 17,
    runningJobs: 3,
    activeGpus: 8,
    balance: 124.50,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        
        <Link href="/jobs">
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            New Job
          </Button>
        </Link>
      </div>

      {/* Stats overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-gray-500">
              {stats.runningJobs} currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active GPUs</CardTitle>
            <Cpu className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeGpus}</div>
            <p className="text-xs text-gray-500">
              Available for computation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.balance.toFixed(2)}</div>
            <p className="text-xs text-gray-500">
              Pay-as-you-go balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">GPU Power</CardTitle>
            <Zap className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.2 TFLOPS</div>
            <p className="text-xs text-gray-500">
              Total compute capacity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Your most recent GPU computation jobs will appear here. Submit a new job to get started.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">
              <Cpu className="mr-2 h-4 w-4" />
              Register GPU
            </Button>
            <Button className="w-full" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Submit Job
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}