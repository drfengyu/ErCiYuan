export default function MakerPic({
  name,
  src,
  width = 142,
  height = 50,
}: {
  name: string;
  src?: string | null;
  width?: number;
  height?: number;
}) {
  if (src) {
    return <img src={src} alt={name} width={width} height={height} style={{ borderRadius: 0, maxWidth: '100%' }} />;
  }
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height,
        padding: '0 8px',
        background: '#eef3fb',
        border: '1px solid #dbe6f5',
        color: '#264863',
        fontSize: Math.max(13, Math.round(height / 3.4)),
        fontWeight: 600,
        letterSpacing: 1,
        textAlign: 'center',
        boxSizing: 'border-box',
        wordBreak: 'break-all',
      }}
    >
      {name}
    </span>
  );
}
