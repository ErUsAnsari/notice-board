import { useState, useMemo } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import NoticeCard from "../components/NoticeCard";
import ConfirmModal from "../components/ConfirmModal";
import { prisma } from "@/lib/prisma";

export default function Home({ notices: initial }) {
  const router = useRouter();
  const [notices, setNotices] = useState(initial);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterPri, setFilterPri] = useState("All");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return notices.filter((n) => {
      const matchSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q);
      const matchCat = filterCat === "All" || n.category === filterCat;
      const matchPri = filterPri === "All" || n.priority === filterPri;
      return matchSearch && matchCat && matchPri;
    });
  }, [notices, search, filterCat, filterPri]);

  function handleDeleteClick(id, title) {
    setDeleteTarget({ id, title });
  }

  // deletion only happens after the user confirms in the modal
  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/notices/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setNotices((prev) => prev.filter((n) => n.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      alert("Failed to delete the notice. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  const urgentCount = notices.filter((n) => n.priority === "Urgent").length;

  return (
    <Layout title="Notice Board">
      <div className="page">

        {/* ── Page header ── */}
        <div className="page-head">
          <div>
            <h1 className="page-title">Notice Board</h1>
            <p className="page-sub">
              {notices.length === 0
                ? "No notices posted yet."
                : `${notices.length} notice${notices.length !== 1 ? "s" : ""}${urgentCount ? ` · ${urgentCount} urgent` : ""
                }`}
            </p>
          </div>
          <button className="btn-new" onClick={() => router.push("/notices/new")}>
            + New Notice
          </button>
        </div>

        {/* ── Filters (only when notices exist) ── */}
        {notices.length > 0 && (
          <div className="filters">
            <div className="search-wrap">
              <span className="search-icon">⌕</span>
              <input
                type="text"
                className="search"
                placeholder="Search title or body…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch("")}>×</button>
              )}
            </div>

            <select className="sel" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="Exam">Exam</option>
              <option value="Event">Event</option>
              <option value="General">General</option>
            </select>

            <select className="sel" value={filterPri} onChange={(e) => setFilterPri(e.target.value)}>
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="Normal">Normal</option>
            </select>
          </div>
        )}

        {/* ── empty states ── */}
        {filtered.length === 0 ? (
          <div className="empty">
            {notices.length === 0 ? (
              <>
                <p className="empty-icon">📋</p>
                <h3 className="empty-title">No notices yet</h3>
                <p className="empty-msg">Be the first to post one.</p>
                <button className="btn-new" onClick={() => router.push("/notices/new")}>
                  Post Notice
                </button>
              </>
            ) : (
              <>
                <p className="empty-icon">🔍</p>
                <h3 className="empty-title">No results</h3>
                <p className="empty-msg">Try adjusting your search or filters.</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid">
            {filtered.map((notice) => (
              <NoticeCard key={notice.id} notice={notice} onDelete={handleDeleteClick} />
            ))}
          </div>
        )}
      </div>

      {/* confirmation modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete this notice?"
        message={`"${deleteTarget?.title}" will be permanently removed. This cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      <style jsx>{`
        .page { display: flex; flex-direction: column; gap: 28px; }

        /* Header */
        .page-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
        }

        .page-title {
          font-family: 'Syne', sans-serif;
          font-size: 2.4rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .page-sub {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-top: 4px;
        }

        .btn-new {
          background: var(--accent);
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          font-weight: 600;
          white-space: nowrap;
          transition: background 0.15s;
        }

        .btn-new:hover { background: var(--accent-alt); }

        /* Filters */
        .filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .search-wrap {
          position: relative;
          flex: 1;
          min-width: 180px;
        }

        .search-icon {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          font-size: 1rem;
          pointer-events: none;
        }

        .search {
          width: 100%;
          background: var(--bg-card);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 0.875rem;
          padding: 9px 32px 9px 30px;
          outline: none;
          transition: border-color 0.15s;
          font-family: inherit;
        }

        .search::placeholder { color: var(--text-muted); }
        .search:focus { border-color: var(--border-focus); }

        .search-clear {
          position: absolute;
          right: 9px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 1.1rem;
          line-height: 1;
          padding: 2px;
        }

        .search-clear:hover { color: var(--text-primary); }

        .sel {
          background: var(--bg-card);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 0.85rem;
          padding: 9px 28px 9px 11px;
          outline: none;
          cursor: pointer;
          font-family: inherit;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%236b6560' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 9px center;
          transition: border-color 0.15s;
        }

        .sel:focus { border-color: var(--border-focus); }
        .sel option { background: #fff; }

        /* Grid — Requirement 7: responsive on phone + desktop */
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        /* Empty state */
        .empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 80px 20px;
          text-align: center;
        }

        .empty-icon { font-size: 2.8rem; }

        .empty-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .empty-msg { color: var(--text-secondary); font-size: 0.875rem; }

        /* Responsive — Requirement 7 */
        @media (max-width: 640px) {
          .page-title { font-size: 1.8rem; }
          .grid { grid-template-columns: 1fr; }
          .sel { flex: 1; }
        }
      `}</style>
    </Layout>
  );
}

export async function getServerSideProps() {
  const notices = await prisma.notice.findMany({
    orderBy: [
      { priority: "desc" },
      { publishDate: "desc" },
    ],
  });

  return {
    props: {
      notices: JSON.parse(JSON.stringify(notices)),
    },
  };
}
