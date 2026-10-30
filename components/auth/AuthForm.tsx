'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function AuthForm({ mode, next = '/' }: { mode: 'login' | 'register'; next?: string }) {
  const router = useRouter();
  const isLogin = mode === 'login';
  const [form, setForm] = useState({ nickname: '', mobile: '', code: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [second, setSecond] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearInterval(timer.current);
    },
    [],
  );

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function sendCode() {
    setError('');
    setMessage('');
    if (!/^1[3-9]\d{9}$/.test(form.mobile)) {
      setError('请填写正确的手机号');
      return;
    }
    const res = await fetch('/api/auth/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: form.mobile }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.message || '验证码发送失败');
      return;
    }
    setMessage(`${json.message}${json.data?.code ? `：${json.data.code}` : ''}`);
    setSecond(60);
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      setSecond((s) => {
        if (s <= 1) {
          if (timer.current) window.clearInterval(timer.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch(isLogin ? '/api/auth/login' : '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || '操作失败');
        return;
      }
      router.replace(json.data?.redirect || next || '/');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="main">
      <div className="title">
        <Link href="/login" className={isLogin ? 'active' : ''}>
          登录
        </Link>
        <span>·</span>
        <Link href="/register" className={isLogin ? '' : 'active'}>
          注册
        </Link>
      </div>

      <div className="sign-up-container">
        <form onSubmit={submit}>
          {!isLogin && (
            <div className="input-prepend restyle">
              <input value={form.nickname} onChange={(e) => set('nickname', e.target.value)} type="text" placeholder="你的昵称" />
              <i className="iconfont icon-user" />
            </div>
          )}
          <div className={`input-prepend ${isLogin ? '' : 'restyle no-radius'}`}>
            <input value={form.mobile} onChange={(e) => set('mobile', e.target.value)} type="text" placeholder="手机号" />
            <i className="iconfont icon-phone" />
          </div>
          {!isLogin && (
            <div className="input-prepend restyle no-radius" style={{ position: 'relative' }}>
              <input value={form.code} onChange={(e) => set('code', e.target.value)} type="text" placeholder="验证码" />
              <i className="iconfont icon-yanzhengma" />
              <button
                type="button"
                disabled={second > 0 || busy}
                onClick={sendCode}
                style={{ position: 'absolute', right: 8, top: 12, height: 28, padding: '0 10px', background: '#3b82f6', color: '#fff', border: 0, borderRadius: 3, cursor: 'pointer' }}
              >
                {second > 0 ? `${second}s` : '获取验证码'}
              </button>
            </div>
          )}
          <div className="input-prepend">
            <input value={form.password} onChange={(e) => set('password', e.target.value)} type="password" placeholder={isLogin ? '密码' : '设置密码'} />
            <i className="iconfont icon-password" />
          </div>
          <div className="btn">
            <input type="submit" className={isLogin ? 'sign-in-button' : 'sign-up-button'} value={isLogin ? '登录' : '注册'} disabled={busy} />
          </div>
          {!isLogin && (
            <p className="sign-up-msg">
              点击 “注册” 即表示您同意并愿意遵守
              <br />
              <a href="#terms">契约</a> 和 <a href="#terms">保密条例</a>。
            </p>
          )}
        </form>

        {(message || error) && (
          <p style={{ color: error ? '#e05d5d' : '#3b82f6', fontSize: 13, marginTop: 12, wordBreak: 'break-all' }}>{error || message}</p>
        )}

        <div className="more-sign">
          <h6>演示账号</h6>
          <p style={{ fontSize: 13, color: '#666', lineHeight: '22px' }}>
            管理员：13800000000 / admin123
            <br />
            普通用户：13900000000 / demo123
          </p>
        </div>
      </div>
    </div>
  );
}
