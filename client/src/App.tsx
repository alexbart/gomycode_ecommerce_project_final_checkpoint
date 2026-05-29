

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

function App() {
  const healthUrl = `${apiUrl.replace(/\/$/, '')}/health`

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">MERN App Template</p>
        <h1>React frontend, TypeScript API, ready for product work.</h1>
        <p className="lede">
          Start from a clean split between the client and server, with a typed backend,
          Vite tooling, and a simple MongoDB connection flow already wired in.
        </p>

        <div className="actions">
          <a className="button button-primary" href={healthUrl} target="_blank" rel="noreferrer">
            Check API health
          </a>
          <code className="endpoint">{apiUrl}</code>
        </div>
      </section>

      <section className="grid" aria-label="Template features">
        <article className="card">
          <span className="badge">Client</span>
          <h2>Vite + React + TypeScript</h2>
          <p>
            Fast local development, typed components, and a starter layout you can replace
            with your own UI quickly.
          </p>
        </article>

        <article className="card">
          <span className="badge">Server</span>
          <h2>Express + TypeScript</h2>
          <p>
            A TS entrypoint, a reusable MongoDB connector, and a small health route for
            quick verification.
          </p>
        </article>

        <article className="card">
          <span className="badge">Workflow</span>
          <h2>One command to run both</h2>
          <p>
            Use the root scripts to install, run, and build the workspace without juggling
            separate entrypoints.
          </p>
        </article>
      </section>

      <section className="footer-strip">
        <div>
          <strong>Client dev server</strong>
          <span>Vite on the default port</span>
        </div>
        <div>
          <strong>Backend port</strong>
          <span>Set with PORT in the server env file</span>
        </div>
        <div>
          <strong>Database</strong>
          <span>Configure MONGODB_URI when you are ready</span>
        </div>
      </section>
    </main>
  )
}

export default App