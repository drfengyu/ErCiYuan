'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatDate } from '@/lib/format';
import './comments.css';

export type CommentItem = {
  id: string;
  parentId: string;
  content: string;
  createdAt: string;
  nickname: string;
  avatar: string;
};

type TreeNode = CommentItem & { children: TreeNode[] };

function buildTree(items: CommentItem[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  for (const item of items) map.set(item.id, { ...item, children: [] });
  const roots: TreeNode[] = [];
  for (const node of map.values()) {
    const parent = node.parentId ? map.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}

export default function CommentSection({
  animeId,
  initial,
  loggedIn,
}: {
  animeId: string;
  initial: CommentItem[];
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [text, setText] = useState('');
  const [reply, setReply] = useState<{ id: string; nickname: string } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [busy, setBusy] = useState(false);

  const tree = buildTree(items);

  async function send(content: string, parentId: string) {
    if (!loggedIn) {
      router.push(`/login?next=/anime/${animeId}`);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId, content, parentId }),
      });
      const json = await res.json();
      if (!res.ok) {
        window.alert(json.message || '发表评论失败');
        return;
      }
      setItems((prev) => [json.data, ...prev]);
      setText('');
      setReplyText('');
      setReply(null);
    } finally {
      setBusy(false);
    }
  }

  function renderNode(node: TreeNode, depth: number) {
    return (
      <div key={node.id} className="author-title">
        <img src={node.avatar} width="40" height="40" className="header-img" alt="" />
        <div className="author-info">
          <span className="author-name">{node.nickname}</span>
          <span className="author-time">{formatDate(node.createdAt)}</span>
        </div>
        <div className="icon-btn" onClick={() => setReply({ id: node.id, nickname: node.nickname })}>
          💬 回复
        </div>
        <div className="talk-box">
          <p>
            {depth > 0 && node.parentId ? <span style={{ color: '#00008b' }} className="reply">回复：{node.nickname} </span> : null}
            <span className="reply">{node.content}</span>
          </p>
        </div>
        {node.children.length > 0 && <div className="reply-box">{node.children.map((child) => renderNode(child, depth + 1))}</div>}
        {reply?.id === node.id && (
          <div className="my-reply my-comment-reply">
            <div className="reply-info">
              <textarea
                className="reply-input"
                value={replyText}
                placeholder={`回复：${reply.nickname}`}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </div>
            <div className="reply-btn-box">
              <button className="comm-btn c-btn-3" type="button" disabled={busy} onClick={() => send(replyText.trim(), node.id)}>
                回复
              </button>
              <button className="comm-btn c-btn-2" style={{ marginLeft: 8 }} type="button" onClick={() => setReply(null)}>
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="my-reply">
        <div className="reply-info">
          <textarea
            className="reply-input"
            placeholder={loggedIn ? '留言，滴....' : '登录后即可发表评论'}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className="reply-btn-box">
          <button className="comm-btn c-btn-3" type="button" disabled={busy} onClick={() => send(text.trim(), '')}>
            发表评论
          </button>
        </div>
      </div>
      <div className="mt20">
        {tree.length === 0 && <p className="c-999 fsize14" style={{ padding: 12 }}>还没有评论，来抢沙发吧～</p>}
        {tree.map((node) => renderNode(node, 0))}
      </div>
    </div>
  );
}
