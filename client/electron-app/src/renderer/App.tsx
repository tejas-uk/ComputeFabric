/**
 * @description
 * Main React component for the ComputeFabric Electron client.
 * This provides a graphical user interface for submitting and monitoring GPU jobs.
 *
 * Key features:
 * - Form for job submission with Docker image, command, etc.
 * - Job status dashboard with filtering options
 * - Orchestrator health status indicator
 *
 * @dependencies
 * - React: For UI components and state management
 * - react-dom: For rendering the React components
 * - computeFabric: Global API exposed by preload.ts
 *
 * @notes
 * - For MVP, we use a simplified UI without complex state management
 * - The window.computeFabric API provides methods to interact with the orchestrator
 */

import React, { useState, useEffect } from 'react';

// Define TypeScript interfaces for our data structures
interface Job {
  id: string;
  userId: string;
  dockerImage: string;
  command: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  cost?: number;
}

interface SubmitJobParams {
  dockerImage: string;
  command: string;
  userId?: string;
  environmentVariables?: Record<string, string>;
  volumeMounts?: string[];
}

/**
 * Main App component
 */
function App() {
  // State for job form
  const [dockerImage, setDockerImage] = useState('pytorch/pytorch:latest');
  const [command, setCommand] = useState('python train.py');
  const [userId, setUserId] = useState('electron-user');
  
  // State for job list
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // State for health check
  const [orchestratorStatus, setOrchestratorStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  // Status message for user feedback
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check orchestrator health on component mount
  useEffect(() => {
    checkOrchestratorHealth();
    fetchJobs();
    
    // Set up a polling interval to refresh job data
    const interval = setInterval(() => {
      if (orchestratorStatus === 'online') {
        fetchJobs();
        
        // If a job is selected, refresh its details
        if (selectedJobId) {
          fetchJobDetails(selectedJobId);
        }
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [orchestratorStatus, selectedJobId]);

  /**
   * Check if the orchestrator is reachable
   */
  async function checkOrchestratorHealth() {
    try {
      // @ts-ignore - computeFabric is injected by preload.ts
      await window.computeFabric.checkHealth();
      setOrchestratorStatus('online');
    } catch (error) {
      console.error('Orchestrator health check failed:', error);
      setOrchestratorStatus('offline');
    }
  }

  /**
   * Fetch jobs from the orchestrator
   */
  async function fetchJobs() {
    try {
      // @ts-ignore - computeFabric is injected by preload.ts
      const jobList = await window.computeFabric.listJobs({ 
        userId,
        limit: 20
      });
      setJobs(jobList);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setStatusMessage('Failed to fetch job list.');
    }
  }

  /**
   * Fetch detailed information about a specific job
   */
  async function fetchJobDetails(jobId: string) {
    try {
      // @ts-ignore - computeFabric is injected by preload.ts
      const jobDetails = await window.computeFabric.getJobStatus(jobId);
      setSelectedJob(jobDetails);
    } catch (error) {
      console.error(`Failed to fetch job details for ${jobId}:`, error);
      setStatusMessage(`Failed to fetch job details.`);
    }
  }

  /**
   * Submit a new job to the orchestrator
   */
  async function handleSubmitJob(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('Submitting job...');
    
    try {
      const jobData: SubmitJobParams = {
        dockerImage,
        command,
        userId
      };
      
      // @ts-ignore - computeFabric is injected by preload.ts
      const result = await window.computeFabric.submitJob(jobData);
      
      setStatusMessage(`Job submitted successfully! Job ID: ${result.id}`);
      fetchJobs(); // Refresh job list
    } catch (error: any) {
      console.error('Job submission failed:', error);
      setStatusMessage(`Job submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Handle selecting a job from the list
   */
  function handleSelectJob(jobId: string) {
    setSelectedJobId(jobId);
    fetchJobDetails(jobId);
  }

  /**
   * Get color class for a job status
   */
  function getStatusColor(status: string) {
    switch (status) {
      case 'queued': return 'text-yellow-500';
      case 'running': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ComputeFabric GPU Job Manager</h1>
        
        <div className="flex items-center">
          <span className="mr-2">Orchestrator Status:</span>
          <span className={
            orchestratorStatus === 'online' 
              ? 'text-green-500' 
              : orchestratorStatus === 'offline' 
                ? 'text-red-500' 
                : 'text-yellow-500'
          }>
            {orchestratorStatus === 'online' ? 'Online' : 
             orchestratorStatus === 'offline' ? 'Offline' : 'Checking...'}
          </span>
          
          <button 
            onClick={checkOrchestratorHealth}
            className="ml-2 bg-gray-200 p-2 rounded text-sm"
          >
            Refresh
          </button>
        </div>
      </header>
      
      {/* Status message */}
      {statusMessage && (
        <div className="mb-6 p-4 bg-blue-50 rounded-md">
          {statusMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Job submission form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Submit New Job</h2>
          
          <form onSubmit={handleSubmitJob} className="space-y-4">
            <div>
              <label className="block mb-1">Docker Image</label>
              <input
                type="text"
                value={dockerImage}
                onChange={(e) => setDockerImage(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block mb-1">Command</label>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block mb-1">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <small className="text-gray-500">
                For MVP, a simple user identifier.
              </small>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || orchestratorStatus !== 'online'}
              className={`w-full p-2 rounded ${
                orchestratorStatus === 'online'
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Job'}
            </button>
          </form>
        </div>
        
        {/* Job list */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Jobs</h2>
          
          {jobs.length === 0 ? (
            <p className="text-gray-500">No jobs found.</p>
          ) : (
            <div className="border rounded overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Created</th>
                    <th className="p-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr 
                      key={job.id} 
                      className={`border-t ${selectedJobId === job.id ? 'bg-blue-50' : ''}`}
                    >
                      <td className="p-2">{job.id.substring(0, 8)}...</td>
                      <td className={`p-2 ${getStatusColor(job.status)}`}>{job.status}</td>
                      <td className="p-2">
                        {new Date(job.createdAt).toLocaleString()}
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => handleSelectJob(job.id)}
                          className="text-blue-500 hover:underline"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Selected job details */}
          {selectedJob && (
            <div className="mt-4 border rounded p-4">
              <h3 className="text-lg font-medium mb-2">Job Details</h3>
              
              <div className="space-y-2">
                <div>
                  <span className="font-medium">ID:</span> {selectedJob.id}
                </div>
                <div>
                  <span className="font-medium">Status:</span> 
                  <span className={getStatusColor(selectedJob.status)}>
                    {selectedJob.status}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Docker Image:</span> {selectedJob.dockerImage}
                </div>
                <div>
                  <span className="font-medium">Command:</span> {selectedJob.command}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {new Date(selectedJob.createdAt).toLocaleString()}
                </div>
                
                {selectedJob.startedAt && (
                  <div>
                    <span className="font-medium">Started:</span> {new Date(selectedJob.startedAt).toLocaleString()}
                  </div>
                )}
                
                {selectedJob.finishedAt && (
                  <div>
                    <span className="font-medium">Finished:</span> {new Date(selectedJob.finishedAt).toLocaleString()}
                  </div>
                )}
                
                {selectedJob.cost && (
                  <div>
                    <span className="font-medium">Cost:</span> ${selectedJob.cost.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;