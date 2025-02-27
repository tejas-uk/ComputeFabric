/**
 * @description
 * Jobs page component that shows a list of user's compute jobs.
 * Displays job status, details, and allows filtering.
 *
 * Key features:
 * - Job list with status indicators
 * - New Job action button
 * - Status filtering (all, queued, running, completed, failed)
 *
 * @dependencies
 * - Next.js: For server component
 * - components/ui/button: For action buttons
 * - lucide-react: For icons
 *
 * @notes
 * - This is a server component by default in Next.js app router
 * - Future: Connect to real data sources via server actions
 * - Jobs would be fetched from the database in a real implementation
 */

import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

export default async function JobsPage() {
  // Sample job data (would come from server action in actual implementation)
  const jobs = [
    {
      id: "j1234-5678-90ab-cdef",
      dockerImage: "pytorch/pytorch:latest",
      command: "python train.py --epochs=10",
      status: "completed",
      createdAt: new Date("2023-04-15T10:30:00"),
      cost: 12.50,
    },
    {
      id: "j2345-6789-01bc-defg",
      dockerImage: "tensorflow/tensorflow:latest",
      command: "python inference.py --model=resnet50",
      status: "running",
      createdAt: new Date("2023-04-16T14:20:00"),
      cost: 5.75,
    },
    {
      id: "j3456-7890-12cd-efgh",
      dockerImage: "nvidia/cuda:11.7.1-base-ubuntu22.04",
      command: "python benchmark.py",
      status: "queued",
      createdAt: new Date("2023-04-17T09:15:00"),
      cost: 0,
    },
    {
      id: "j4567-8901-23de-fghi",
      dockerImage: "pytorch/pytorch:latest",
      command: "python training_script.py --dataset=imagenet",
      status: "failed",
      createdAt: new Date("2023-04-14T16:45:00"),
      cost: 3.20,
    },
  ];

  // Get status color and badge styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case "queued":
        return "bg-yellow-100 text-yellow-800";
      case "running":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search jobs..."
              className="pl-9 h-10 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            New Job
          </Button>
        </div>
      </div>

      {/* Job filters */}
      <div className="flex space-x-2">
        {["All", "Queued", "Running", "Completed", "Failed"].map((filter) => (
          <Button
            key={filter}
            variant={filter === "All" ? "outline" : "default"}
            size="sm"
            className={filter === "All" ? "border-blue-500 text-blue-600" : ""}
          >
            {filter}
          </Button>
        ))}
      </div>

      {/* Jobs table */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Job ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Docker Image
                </th>
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
                  Created
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Cost
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
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {job.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.dockerImage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.createdAt.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${job.cost.toFixed(2)}
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
      </div>
    </div>
  );
}