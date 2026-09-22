import Link from 'next/link';
import { timeAgo } from '@/lib/time';
import { excerpt } from '@/lib/format';

export default function ThreadRow({ t }) {
  return (
    <Link href={`/t/${t.id}`} className="thread-row">
      <img src={t.author_avatar || '/avatar.png'} alt="" className="avatar avatar-md" />
      <div className="thread-main">
        <div className="thread-title">
          {t.is_pinned ? <span title="Pinned">📌 </span> : null}
          {t.is_locked ? <span title="Locked">🔒 </span> : null}
          {t.title}
        </div>
        {t.excerpt ? <div className="thread-excerpt">{excerpt(t.excerpt)}</div> : null}
        <div className="thread-meta">
          <span className="cat-pill" style={{ '--cat': t.category_color }}>
            {t.category_name}
          </span>
          <span>
            by <strong>@{t.author}</strong>
          </span>
          <span>· {timeAgo(t.last_post_at)} </span>
        </div>
      </div>
      <div className="thread-stats">
        <span title="Replies">💬 {Math.max(0, (t.post_count ?? 1) - 1)}</span>
        <span title="Views">👁 {t.views ?? 0}</span>
      </div>
    </Link>
  );
}
