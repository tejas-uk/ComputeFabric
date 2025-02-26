/**
 * @description
 * A minimal React component for the Electron renderer, giving an interface to
 * submit jobs and view statuses. This is an MVP skeleton.
 *
 * Key features:
 * - Basic structure: a header, some placeholders for job submission
 * - Future expansions: job list, orchestrator integration, advanced forms
 *
 * @dependencies
 * - react
 * - Possibly axios for Orchestrator requests
 *
 * @notes
 * - In a real setup, you'd build this with webpack or Vite, generating an HTML
 *   that gets loaded by main.ts. For now, it's a conceptual skeleton.
 */

import * as React from 'react'
import { useState } from 'react'

export default function App() {
  const [dockerImage, setDockerImage] = useState('pytorch/pytorch:latest')
  const [command, setCommand] = useState('python train.py')
  const [statusMessage, setStatusMessage] = useState('No job submitted yet.')

  const handleSubmit = () => {
    // Future: Send request to Orchestrator
    setStatusMessage(`Submitted job with image=${dockerImage}, command=${command}`)
  }

  return (
    <div style={{ fontFamily: 'sans-serif', margin: '1rem' }}>
      <h1>ComputeFabric Electron Client (MVP)</h1>

      <div style={{ marginBottom: '1rem', marginTop: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Docker Image:
        </label>
        <input
          type="text"
          value={dockerImage}
          onChange={(e) => setDockerImage(e.target.value)}
          style={{ width: '300px', padding: '0.25rem' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Command:
        </label>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          style={{ width: '300px', padding: '0.25rem' }}
        />
      </div>

      <button onClick={handleSubmit} style={{ padding: '0.5rem 1rem' }}>
        Submit Job
      </button>

      <div style={{ marginTop: '1rem' }}>
        <strong>Status:</strong> {statusMessage}
      </div>
    </div>
  )
}
