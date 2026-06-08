import Link from "next/link";
import Layout from "../components/Layout";

export default function NotFound() {
    return (
        <Layout title="404 — Not Found">
            <div className="wrap">
                <p className="code">404</p>
                <h1 className="title">Page not found</h1>
                <p className="msg">The notice or page you&apos;re looking for doesn&apos;t exist.</p>
                <Link href="/" className="back">← Back to Notice Board</Link>
            </div>

            <style jsx>{`
        .wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 55vh;
          text-align: center;
          gap: 12px;
        }

        .code {
          font-family: 'Syne', sans-serif;
          font-size: 5rem;
          font-weight: 800;
          color: var(--border);
          line-height: 1;
        }

        .title {
          font-family: 'Syne', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .msg { color: var(--text-secondary); font-size: 0.9rem; }

        .back {
          margin-top: 8px;
          background: var(--accent);
          color: #fff;
          padding: 9px 22px;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          font-weight: 600;
          transition: background 0.15s;
        }

        .back:hover { background: var(--accent-alt); }
      `}</style>
        </Layout>
    );
}
