/**
 * @description
 * Renders the main home page for the ComputeFabric MVP.
 * 
 * Key features:
 * - Simple placeholder content with a welcome message.
 * 
 * @notes
 * - Future expansions may include marketing or sign-up info.
 */

export default async function HomePage() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <h1 className="text-3xl font-bold mb-4">Welcome to ComputeFabric MVP</h1>
        <p className="text-gray-600">
          This is the home page. Navigate to <strong>/dashboard</strong> to view your GPU jobs or 
          check <strong>/jobs</strong> to manage tasks.
        </p>
      </div>
    );
  }
  