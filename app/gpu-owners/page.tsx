/**
 * @description
 * GPU Owners page component that displays information about GPU providers.
 * Shows GPU specifications, availability, earnings, and registration options.
 *
 * Key features:
 * - List of registered GPUs with status
 * - GPU owner earnings tracking
 * - Options to register new GPUs
 *
 * @dependencies
 * - Next.js: For server component
 * - components/ui/button: For action buttons
 * - components/ui/card: For content cards
 * - lucide-react: For icons
 *
 * @notes
 * - This is a server component by default in Next.js app router
 * - Future: Connect to real data sources via server actions
 * - GPU provider data would be fetched from the database in a real implementation
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, Download, Plus } from "lucide-react";

export default async function GPUOwnersPage() {
  // Sample GPU provider data (would come from server action in actual implementation)
  const gpuProviders = [
    {
      id: "p1234-5678-90ab-cdef",
      ownerId: "user123",
      status: "online",
      earnings: 145.75,
      gpuSpecs: {
        name: "NVIDIA GeForce RTX 3080",
        memory: "10GB",
        vendor: "NVIDIA"
      },
      jobsCompleted: 34
    },
    {
      id: "p2345-6789-01bc-defg",
      ownerId: "user456",
      status: "offline",
      earnings: 92.40,
      gpuSpecs: {
        name: "AMD Radeon RX 6800 XT",
        memory: "16GB",
        vendor: "AMD"
      },
      jobsCompleted: 21
    },
    {
      id: "p3456-7890-12cd-efgh",
      ownerId: "user789",
      status: "busy",
      earnings: 217.60,
      gpuSpecs: {
        name: "NVIDIA Tesla V100",
        memory: "32GB",
        vendor: "NVIDIA"
      },
      jobsCompleted: 56
    }
  ];

  // Get status indicator styling
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "busy":
        return "bg-blue-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">GPU Owners</h1>
        
        <Button variant="primary">
          <Plus className="mr-2 h-4 w-4" />
          Register GPU
        </Button>
      </div>

      {/* Registration infobox */}
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="pt-6">
          <div className="flex items-start">
            <Cpu className="h-10 w-10 text-blue-500 mr-4 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-2">
                Share Your Idle GPU Power
              </h3>
              <p className="text-blue-600 mb-4">
                Install our provider app on your machine to share idle GPU resources and earn money.
                Compatible with NVIDIA, AMD, and other major GPU providers.
              </p>
              <div className="flex gap-3">
                <Button variant="primary">
                  <Download className="mr-2 h-4 w-4" />
                  Download Provider App
                </Button>
                <Button variant="outline">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GPU Providers List */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Your Registered GPUs</h2>
          
          {gpuProviders.length === 0 ? (
            <p className="text-gray-500">
              You haven't registered any GPUs yet. Download our provider app to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      GPU
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Memory
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Jobs Completed
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Earnings
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {gpuProviders.map((provider) => (
                    <tr key={provider.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`h-3 w-3 rounded-full ${getStatusIndicator(provider.status)} mr-2`}
                          ></div>
                          <span className="text-sm text-gray-900 capitalize">
                            {provider.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {provider.gpuSpecs.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {provider.gpuSpecs.memory}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {provider.jobsCompleted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${provider.earnings.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Earnings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-gray-600">Total Earnings</span>
              <span className="text-lg font-semibold">
                ${gpuProviders.reduce((sum, provider) => sum + provider.earnings, 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-gray-600">Jobs Completed</span>
              <span className="text-lg font-semibold">
                {gpuProviders.reduce((sum, provider) => sum + provider.jobsCompleted, 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active GPUs</span>
              <span className="text-lg font-semibold">
                {gpuProviders.filter(p => p.status === 'online' || p.status === 'busy').length} / {gpuProviders.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}