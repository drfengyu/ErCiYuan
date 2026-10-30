const BASE = [
  'reset',
  'theme',
  'global',
  'web',
  'base',
  'activity_tab',
  'bottom_rec',
  'nice_select',
  'order',
  'swiper-3.3.1.min',
  'pages-weixinpay',
];

export default function SiteCss({ extra = [] }: { extra?: string[] }) {
  return (
    <>
      {[...BASE, ...extra].map((name) => (
        <link key={name} rel="stylesheet" href={`/assets/css/${name}.css`} />
      ))}
    </>
  );
}
