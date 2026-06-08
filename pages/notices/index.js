// pages/index.tsx
import React, { useState, useMemo } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import NoticeCard from "../components/NoticeCard";
import ConfirmModal from "../components/ConfirmModal";
import prisma from "../lib/prisma";
import { Notice, CATEGORIES } from "../lib/types";



export default function Home({ initialNotices }) {
    const router = useRouter();
    const [notices, setNotices] = useState(initialNotices);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");
    const [filterPriority, setFilterPriority] = useState("All");

    const filtered = useMemo(() => {
        return notices.filter((n) => {
            const matchSearch =
                !search ||
                n.title.toLowerCase().includes(search.toLowerCase()) ||
                n.content.toLowerCase().includes(search.toLowerCase()) ||
                n.author.toLowerCase().includes(search.toLowerCase());
            const matchCat =
                filterCategory === "All" || n.category === filterCategory;
            const matchPri =
                filterPriority === "All" || n.priority === filterPriority;
            return matchSearch && matchCat && matchPri;
        });
    }, [notices, search, filterCategory, filterPriority]);

    function handleDeleteClick(id, title) {
        setDeleteTarget({ id, title });
    }

    async function handleConfirmDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/notices/${deleteTarget.id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete");
            setNotices((prev) => prev.filter((n) => n.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (err) {
            console.error(err);
            alert("Failed to delete the notice. Please try again.");
        } finally {
            setDeleting(false);
        }
    }

    const urgentCount = notices.filter((n) => n.priority === "urgent").length;

    return (
        <Layout title="Notice Board">
            <div className="page">
                {/* Hero */}
                <div className="page-hero">
                    <div className="hero-text">
                        <h1 className="page-title">Notice Board</h1>
                        <p className="page-subtitle">
                            {notices.length === 0
                                ? "No notices yet. Be the first to post one."
                                : `${notices.length} notice${notices.length !== 1 ? "s" : ""} posted${urgentCount > 0
                                    ? ` · ${urgentCount} urgent`
                                    : ""
                                }`}
                        </p>
                    </div>
                    <button
                        className="btn-new"
                        onClick={() => router.push("/notices/new")}
                    >
                        + Post Notice
                    </button>
                </div>

                {/* Filters */}
                {notices.length > 0 && (
                    <div className="filters">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search notices…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <button className="search-clear" onClick={() => setSearch("")}>
                                    ×
                                </button>
                            )}
                        </div>

                        <select
                            className="filter-select"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>

                        <select
                            className="filter-select"
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                        >
                            <option value="All">All Priorities</option>
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="normal">Normal</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                )}

                {/* Notice Grid */}
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        {notices.length === 0 ? (
                            <>
                                <div className="empty-icon">📋</div>
                                <h3 className="empty-title">No notices yet</h3>
                                <p className="empty-msg">
                                    Post the first notice to get started.
                                </p>
                                <button
                                    className="btn-new"
                                    onClick={() => router.push("/notices/new")}
                                >
                                    Post Notice
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="empty-icon">🔍</div>
                                <h3 className="empty-title">No results found</h3>
                                <p className="empty-msg">Try adjusting your search or filters.</p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="grid">
                        {filtered.map((notice) => (
                            <NoticeCard
                                key={notice.id}
                                notice={notice}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Delete Notice?"
                message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This action cannot be undone.`}
                confirmLabel="Yes, Delete"
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteTarget(null)}
                loading={deleting}
            />

            <style jsx>{`
        .page {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .page-hero {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.6rem;
          font-weight: 900;
          background: linear-gradient(135deg, #f0edf8 30%, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
        }

        .page-subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin-top: 6px;
        }

        .btn-new {
          background: var(--accent);
          color: #0f0e11;
          border: none;
          padding: 11px 22px;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          font-weight: 700;
          transition: background 0.18s;
          white-space: nowrap;
        }

        .btn-new:hover {
          background: #d8b4fe;
        }

        .filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.9rem;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 0.9rem;
          padding: 10px 36px 10px 36px;
          outline: none;
          transition: border-color 0.18s;
          font-family: inherit;
        }

        .search-input::placeholder { color: var(--text-muted); }

        .search-input:focus {
          border-color: var(--accent);
        }

        .search-clear {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 1.2rem;
          line-height: 1;
          padding: 2px 4px;
          cursor: pointer;
        }

        .search-clear:hover { color: var(--text-primary); }

        .filter-select {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 0.88rem;
          padding: 10px 32px 10px 12px;
          outline: none;
          cursor: pointer;
          font-family: inherit;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239891ab' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          transition: border-color 0.18s;
        }

        .filter-select:focus { border-color: var(--accent); }
        .filter-select option { background: var(--bg-card); }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 16px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 80px 20px;
          text-align: center;
        }

        .empty-icon { font-size: 3rem; }

        .empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          color: var(--text-primary);
        }

        .empty-msg {
          color: var(--text-secondary);
          font-size: 0.9rem;
          max-width: 320px;
        }

        @media (max-width: 600px) {
          .page-title { font-size: 1.9rem; }
          .grid { grid-template-columns: 1fr; }
          .filters { gap: 8px; }
          .filter-select { flex: 1; }
        }
      `}</style>
        </Layout>
    );
}

export const getServerSideProps = async () => {
    const notices = await prisma.notice.findMany({
        orderBy: { createdAt: "desc" },
    });

    return {
        props: {
            initialNotices: JSON.parse(JSON.stringify(notices)),
        },
    };
};
