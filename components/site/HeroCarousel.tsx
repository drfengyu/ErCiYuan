'use client';

import { useEffect, useState } from 'react';

export type SlideItem = { id: string; title: string; imageUrl: string; linkUrl: string; color: string };

export default function HeroCarousel({ items }: { items: SlideItem[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;
  const total = items.length;
  const height = 420;
  const go = (next: number) => setIndex((next + total) % total);

  return (
    <div className="i-slide" style={{ height }}>
      <div className="swiper-container" style={{ height }}>
        <div
          className="swiper-wrapper"
          style={{
            width: `${total * 100}%`,
            transform: `translateX(-${(index * 100) / total}%)`,
            transition: 'transform .5s ease',
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="swiper-slide"
              style={{ width: `${100 / total}%`, height, background: item.color }}
            >
              <a href={item.linkUrl || '#'} style={{ display: 'block', height: '100%' }}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </a>
            </div>
          ))}
        </div>
        <a
          className="s-arrow arrow-left"
          href="#prev"
          title="上一张"
          onClick={(e) => {
            e.preventDefault();
            go(index - 1);
          }}
        />
        <a
          className="s-arrow arrow-right"
          href="#next"
          title="下一张"
          onClick={(e) => {
            e.preventDefault();
            go(index + 1);
          }}
        />
        <div className="pagination">
          {items.map((item, i) => (
            <a
              key={item.id}
              className={`swiper-pagination-switch ${i === index ? 'swiper-active-switch' : ''}`}
              href="#dot"
              title={item.title}
              onClick={(e) => {
                e.preventDefault();
                go(i);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
