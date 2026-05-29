

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

function App() {
  const healthUrl = `${apiUrl.replace(/\/$/, '')}/health`

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <section className="py-8">
        <p className="text-sm font-semibold text-indigo-600 uppercase">MERN App Template</p>
        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-gray-900">React frontend, TypeScript API, ready for product work.</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl">
          Start from a clean split between the client and server, with a typed backend,
          Vite tooling, and a simple MongoDB connection flow already wired in.
        </p>

        <div className="flex items-center gap-4 mt-6">
          <a
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md shadow hover:bg-indigo-700"
            href={healthUrl}
            target="_blank"
            rel="noreferrer"
          >
            Check API health
          </a>
          <code className="bg-gray-100 text-sm px-3 py-1 rounded-md">{apiUrl}</code>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10" aria-label="Template features">
        <article className="p-6 bg-white rounded-lg shadow">
          <span className="inline-block bg-indigo-50 text-indigo-700 px-2 py-1 text-xs rounded-full">Client</span>
          <h2 className="mt-3 text-xl font-semibold">Vite + React + TypeScript</h2>
          <p className="mt-2 text-gray-600">
            Fast local development, typed components, and a starter layout you can replace
            with your own UI quickly.
          </p>
        </article>

        <article className="p-6 bg-white rounded-lg shadow">
          <span className="inline-block bg-indigo-50 text-indigo-700 px-2 py-1 text-xs rounded-full">Server</span>
          <h2 className="mt-3 text-xl font-semibold">Express + TypeScript</h2>
          <p className="mt-2 text-gray-600">
            A TS entrypoint, a reusable MongoDB connector, and a small health route for
            quick verification.
          </p>
        </article>

        <article className="p-6 bg-white rounded-lg shadow">
          <span className="inline-block bg-indigo-50 text-indigo-700 px-2 py-1 text-xs rounded-full">Workflow</span>
          <h2 className="mt-3 text-xl font-semibold">One command to run both</h2>
          <p className="mt-2 text-gray-600">
            Use the root scripts to install, run, and build the workspace without juggling
            separate entrypoints.
          </p>
        </article>
      </section>

      <section className="mt-12 border-t pt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
        <div>
          <strong className="block text-gray-800">Client dev server</strong>
          <span>Vite on the default port</span>
        </div>
        <div>
          <strong className="block text-gray-800">Backend port</strong>
          <span>Set with PORT in the server env file</span>
        </div>
        <div>
          <strong className="block text-gray-800">Database</strong>
          <span>Configure MONGODB_URI when you are ready</span>
        </div>
      </section>
    </main>
  )
}

export default App