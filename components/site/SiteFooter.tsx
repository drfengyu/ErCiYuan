export default function SiteFooter() {
  return (
    <footer id="footer">
      <section className="container">
        <div>
          <h4 className="hLh30">
            <span style={{ fontSize: 20, color: 'rgb(124, 213, 240)' }} className="fsize18 f-fM c-999">
              友情链接
            </span>
          </h4>
          <ul className="of flink-list">
            <li>
              <a href="https://anilist.co" target="_blank" rel="noreferrer">
                AniList
              </a>
            </li>
            <li>
              <a href="https://bgm.tv" target="_blank" rel="noreferrer">
                Bangumi
              </a>
            </li>
            <li>
              <a href="https://www.bilibili.com/" target="_blank" rel="noreferrer">
                bilibili
              </a>
            </li>
          </ul>
          <div className="clear" />
        </div>
        <div className="b-foot">
          <section className="fl col-7">
            <section className="mr20">
              <section className="b-f-link">
                <a href="https://github.com/drfengyu/ErCiYuan" target="_blank" rel="noreferrer">
                  关于我们
                </a>
                |<span>数据来源：AniList / Bangumi 公开接口，播放片段为开源可商用演示视频</span>
              </section>
              <section className="b-f-link mt10">
                <span>©20XX-2077 二刺螈 · Next.js on Vercel</span>
              </section>
            </section>
          </section>
          <aside className="fl col-3 tac mt15">
            <section className="gf-tx">
              <span>
                <img width="80" height="80" src="/assets/img/github.png" alt="github" />
              </span>
            </section>
          </aside>
          <div className="clear" />
        </div>
      </section>
    </footer>
  );
}
