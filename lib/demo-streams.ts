export type DemoSource = { url: string; label: string };

// 开源可商用的公开测试流，用于验证播放链路（非正版番剧内容）。
export const DEMO_SOURCES: DemoSource[] = [
  { url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', label: 'Mux 公开 HLS 测试流' },
  { url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', label: 'Unified Streaming HLS（Tears of Steel）' },
  { url: 'https://media.w3.org/2010/05/sintel/trailer.mp4', label: 'W3C Sintel 预告片 MP4' },
  { url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4', label: 'Big Buck Bunny MP4' },
];

export function demoSourceFor(index: number): DemoSource {
  return DEMO_SOURCES[index % DEMO_SOURCES.length];
}
