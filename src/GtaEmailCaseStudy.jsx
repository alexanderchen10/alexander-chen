import { useEffect, useRef, useState } from 'react';
import { beforeEmail, afterEmail } from './GtaEmailPreviews';
import './GtaEmailCaseStudy.css';

const reports = [
  'https://app.constantcontact.com/pages/campaigns/email-reporting/activity/abaf58aa-d0a0-4ce8-b5da-06f318614855',
  'https://shallot-puma-wrsj.squarespace.com/config/marketing/campaigns/sent/6ad6225dd56a842efdf4d64b',
];
const metrics = [
  { label: 'Clickers', before: 19, after: 74, change: '+289.5%', note: '55 more recorded clickers, on a send audience only 12.8% larger.' },
  { label: 'Click rate', before: 19/4613*100, after: 74/5198*100, rate: true, change: '+245.6%', note: 'Clickers ÷ delivered emails. A consistent denominator gives a 3.5× increase.' },
  { label: 'Click-to-open rate', before: 19/1850*100, after: 74/2324*100, rate: true, change: '+210.0%', note: 'Clickers ÷ reported openers. Approximately 3.1× as many recorded readers took the next step.' },
  { label: 'Openers', before: 1850, after: 2324, change: '+25.6%', note: '474 more reported openers. Privacy and proxy opens limit interpretation.' },
  { label: 'Open rate', before: 1850/4613*100, after: 2324/5198*100, rate: true, change: '+4.6 pp', note: 'Reported openers ÷ delivered emails. Click engagement grew much faster than opens.' },
  { label: 'Emails sent', before: 4892, after: 5516, change: '+12.8%', note: 'The larger audience explains only part of the growth in clickers.' },
  { label: 'Delivered', before: 4613, after: 5198, change: '+12.7%', note: '585 more emails delivered successfully.' },
  { label: 'Delivery rate', before: 4613/4892*100, after: 5198/5516*100, rate: true, change: '−0.1 pp', note: 'Essentially unchanged at about 94%. Delivery did not materially improve.' },
];
const format = (value, rate) => rate ? `${value.toFixed(2)}%` : value.toLocaleString('en-CA');
const comparisons = [
  ['Visual style', 'Dense text, coloured promotional panels, bold centred headings', 'White space, larger editorial typography, cleaner sections'],
  ['Main focus', 'Discount, ordering instructions, designer launch and operational updates', 'Premium albums, client gift ideas and seasonal product discovery'],
  ['Product presentation', 'Product photos alongside detailed instructions', 'Product imagery and material swatches paired with benefits'],
  ['Calls to action', 'Engagement concentrated on downloading an access guide', 'Direct links to albums, ornaments and individual gift categories'],
  ['Customer value', 'Explains products and how to order', 'Shows how products fit photography packages and client relationships'],
];
const products = [['Ornaments',43,'ornaments'],['Albums',32,'albums'],['Bragbooks',26,'bragbook'],['Magnets',23,'magnets'],['Photographic prints',22,'photographic-prints'],['Calendars',21,'calendars']];

function useComparisonMotion(dependency = 0) {
  const ref = useRef(null);
  const manual = useRef(false);
  const [progress, setProgress] = useState(0);
  const [replay, setReplay] = useState(0);
  useEffect(() => {
    let frame, timer;
    manual.current = false;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setProgress(reduced ? 1 : 0);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (reduced) return;
      timer = window.setTimeout(() => {
        let start;
        const tick = (time) => {
          if (manual.current) return;
          start ??= time;
          const t = Math.min(1, (time - start) / 2200);
          setProgress(1 - Math.pow(1 - t, 3));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      }, 500);
    }, {threshold: .35});
    if (ref.current) observer.observe(ref.current);
    return () => {observer.disconnect();cancelAnimationFrame(frame);clearTimeout(timer);};
  }, [dependency, replay]);
  return {ref, progress, setProgress: value => {manual.current=true;setProgress(value);}, replay: () => setReplay(value => value + 1)};
}

function EmailWalkthrough({index}) {
  const frame = useRef(null);
  const shell = useRef(null);
  const [scale, setScale] = useState(.7);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const label = index ? 'Squarespace' : 'Constant Contact';
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / 650)));
    if (shell.current) observer.observe(shell.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!playing) return;
    let animation, previous;
    const tick = time => {
      const el = frame.current?.contentDocument?.scrollingElement;
      if (!el) {animation=requestAnimationFrame(tick);return;}
      const max=el.scrollHeight-el.clientHeight;
      if (max<=0) {setPlaying(false);return;}
      el.scrollTop += previous ? Math.min(time-previous,50)*.055 : 0;
      previous=time;
      setPosition(Math.min(100,el.scrollTop/max*100));
      if (el.scrollTop>=max-2) {setPlaying(false);return;}
      animation=requestAnimationFrame(tick);
    };
    animation=requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animation);
  }, [playing]);
  const restart=()=>{const el=frame.current?.contentDocument?.scrollingElement;if(el)el.scrollTop=0;setPosition(0);setPlaying(true);};
  const scrub=value=>{setPlaying(false);setPosition(value);const el=frame.current?.contentDocument?.scrollingElement;if(el)el.scrollTop=(el.scrollHeight-el.clientHeight)*value/100;};
  return <figure className="gta-walkthrough">
    <figcaption><span>{index ? 'After / My redesign' : 'Before / Previous campaign'}</span><strong>{label}</strong><small>October {index ? '20' : '5'}, 2026</small></figcaption>
    <div className="gta-email-window" ref={shell} onPointerDown={()=>setPlaying(false)} onWheel={()=>setPlaying(false)}>
      <iframe ref={frame} title={`${label} full email — scroll to explore`} srcDoc={index ? afterEmail : beforeEmail} sandbox="allow-same-origin" referrerPolicy="no-referrer" style={{width:650,height:480/scale,transform:`scale(${scale})`}} onLoad={()=>{const el=frame.current?.contentWindow;el?.addEventListener('scroll',()=>{const d=frame.current?.contentDocument?.scrollingElement;if(d&&d.scrollHeight>d.clientHeight)setPosition(d.scrollTop/(d.scrollHeight-d.clientHeight)*100);},{passive:true});}} />
    </div>
    <div className="gta-play-controls"><button type="button" onClick={()=>playing ? setPlaying(false) : position>98 ? restart() : setPlaying(true)}>{playing ? 'Ⅱ Pause walkthrough' : '▷ Play walkthrough'}</button><button type="button" onClick={restart} aria-label={`Replay ${label} walkthrough`}>↺</button><input type="range" min="0" max="100" step=".1" value={position} onChange={e=>scrub(Number(e.target.value))} aria-label={`${label} email scroll position`} /></div>
    <p>Scroll inside to explore the complete email, or press play for a guided scroll.</p>
  </figure>;
}

export default function GtaEmailCaseStudy() {
  const [selected,setSelected]=useState(0);
  const [product,setProduct]=useState(0);
  const hero=useComparisonMotion();
  const chart=useComparisonMotion(selected);
  const metric=metrics[selected];
  const value=metric.before+(metric.after-metric.before)*chart.progress;
  const display=(n,rate)=>format(rate ? n : Math.round(n),rate);
  const max=Math.max(metric.before,metric.after)*1.15;
  return <main className="main-content gta-case gta-case-v2">
    <a href="#experience" className="gta-back">← GTA Imaging / Professional experience</a>
    <header className="gta-hero">
      <p className="gta-kicker">GTA Imaging / Campaign 01 / October 2026</p>
      <h1>Email campaign<br/>improvements.</h1>
      <p>I redesigned a B2B newsletter to help professional photographers discover print products, build premium packages and create thoughtful client gifts.</p>
      <div className="gta-live-label"><span/> From Constant Contact to Squarespace</div>
      <div className="gta-highlights gta-countups" ref={hero.ref}>
        {[metrics[0],metrics[1],metrics[2]].map(item=><div key={item.label}><span className="gta-baseline">{display(item.before,item.rate)} <span aria-hidden="true">↗</span></span><strong aria-hidden="true">{display(item.before+(item.after-item.before)*hero.progress,item.rate)}</strong><span className="sr-only">{item.label}: {display(item.before,item.rate)} to {display(item.after,item.rate)}</span><span>{item.label.toLowerCase()}</span><small>Constant Contact → Squarespace</small></div>)}
      </div>
      <button className="gta-text-button" type="button" onClick={hero.replay}>↺ Replay the improvement</button>
      <p className="gta-small">My role: Client Success & Email Marketing Specialist · Content strategy, copywriting, newsletter design and performance analysis.</p>
    </header>
    <nav className="gta-chapter-links" aria-label="Campaign chapters"><a href="#gta-context">01 / The opportunity</a><a href="#gta-changes">02 / What changed</a><a href="#gta-results">03 / The results</a></nav>
    <section id="gta-context"><p className="gta-kicker">01 / The opportunity</p><h2>Turn readers into product explorers.</h2><p>The existing newsletter provided useful onboarding and production information. I wanted to make the next step easier: connect albums and seasonal gifts to the services photographers could offer their own clients.</p><div className="gta-context-strip"><div><strong>Business goal</strong><p>Support product discovery and cross-selling.</p></div><div><strong>Audience</strong><p>Professional photographers across Canada.</p></div><div><strong>Creative approach</strong><p>Editorial design, product benefits and direct calls to action.</p></div></div></section>
    <section id="gta-changes"><p className="gta-kicker">02 / What changed</p><h2>A clearer path from inspiration to product.</h2><div className="gta-table-wrap"><table><thead><tr><th>Design & messaging</th><th>Previous campaign</th><th>My redesign</th></tr></thead><tbody>{comparisons.map(row=><tr key={row[0]}>{row.map((cell,i)=>i ? <td key={i}>{cell}</td> : <th scope="row" key={i}>{cell}</th>)}</tr>)}</tbody></table></div><p>I paired a cleaner editorial layout with product imagery, material swatches and clearer calls to action. The content connected print products to premium packages, repeat business and thoughtful client gifts.</p><div className="gta-screens"><EmailWalkthrough index={0}/><EmailWalkthrough index={1}/></div></section>
    <section id="gta-results" className="gta-results"><p className="gta-kicker">03 / Explore the results</p><h2>Small audience growth.<br/>A much bigger step in engagement.</h2><p>74 clickers versus 19: a 289% increase, on a send audience only 13% larger. Choose a metric, replay the change or drag the comparison slider.</p>
      <div className="gta-controls" role="group" aria-label="Choose comparison metric">{metrics.map((item,i)=><button key={item.label} aria-pressed={selected===i} onClick={()=>setSelected(i)}>{item.label}</button>)}</div>
      <div className="gta-story-chart" ref={chart.ref}>
        <div className="gta-story-heading"><div><p className="gta-kicker">{metric.label} / Two campaign snapshots</p><h3 aria-hidden="true">{display(value,metric.rate)}</h3><span className="sr-only">{metric.label}: {display(metric.before,metric.rate)} to {display(metric.after,metric.rate)}</span></div><div className="gta-lift"><strong>{metric.change}</strong><span>{selected===7 ? 'essentially unchanged' : 'observed change'}</span></div></div>
        <div className="gta-dot-plot" aria-label={`${metric.label}: Constant Contact ${display(metric.before,metric.rate)}, Squarespace ${display(metric.after,metric.rate)}`}><div className="gta-dot-axis"/><span className="gta-dot-baseline" style={{left:`${metric.before/max*100}%`}}/><div className="gta-dot-connector" style={{left:`${Math.min(metric.before,value)/max*100}%`,width:`${Math.abs(value-metric.before)/max*100}%`}}/><span className="gta-dot-current" style={{left:`${value/max*100}%`}}/><div className="gta-axis-ticks"><span>0{metric.rate?'%':''}</span><span>{display(max/2,metric.rate)}</span><span>{display(max,metric.rate)}</span></div></div>
        <div className="gta-endpoints"><div><small>Before / Constant Contact · Oct. 5</small><strong>{display(metric.before,metric.rate)}</strong></div><span aria-hidden="true">↗</span><div><small>After / Squarespace · Oct. 20</small><strong>{display(metric.after,metric.rate)}</strong></div></div>
        <div className="gta-comparison-scrub"><button type="button" onClick={chart.replay}>↺ Replay</button><input type="range" min="0" max="100" value={Math.round(chart.progress*100)} onChange={e=>chart.setProgress(Number(e.target.value)/100)} aria-label="Animate between Constant Contact and Squarespace results"/><span>Drag to compare</span></div><p>{metric.note}</p><small className="gta-small">Animation illustrates the difference between two snapshots; intermediate values are not additional campaign observations.</small>
      </div>
      <details className="gta-method"><summary>All metrics & how they were calculated</summary><div className="gta-table-wrap"><table><caption>October 5 versus October 20, 2026</caption><thead><tr><th>Metric</th><th>Constant Contact</th><th>Squarespace</th><th>Change</th></tr></thead><tbody>{metrics.map(item=><tr key={item.label}><th scope="row">{item.label}</th><td>{display(item.before,item.rate)}</td><td>{display(item.after,item.rate)}</td><td>{item.change}</td></tr>)}</tbody></table></div><p>The dashboard’s 0.4% → 1% is click rate, not click-to-open rate. Rates here use the same denominator: clickers ÷ deliveries for click rate; clickers ÷ reported openers for click-to-open rate. Changes use unrounded values. “pp” means percentage points.</p><p>Constant Contact identifies 1,369 proxy opens among 1,850 reported openers. Tracking methods, audience, timing and content differ. This comparison does not isolate the redesign’s causal effect or establish revenue and retention gains.</p></details>
    </section>
    <section><p className="gta-kicker">04 / Product discovery</p><h2>Interest across the print portfolio.</h2><p>Previously, 17 of 19 recorded link clicks went to the designer access guide. The redesigned campaign directed engagement across six product categories, creating more opportunities for cross-selling.</p><div className="gta-products">{products.map(([label,count],i)=><button key={label} aria-pressed={product===i} onClick={()=>setProduct(i)}><span>{label}</span><strong>{count}</strong><span className="gta-product-track"><span style={{width:`${count/43*100}%`}}/></span></button>)}</div><div className="gta-product-detail" aria-live="polite"><strong>{products[product][0]} / {products[product][1]} reported link clicks</strong><a href={`https://gtaimaging.com/${products[product][2]}`} target="_blank" rel="noreferrer">Explore product category ↗</a></div><p className="gta-small">Link counts overlap; they are not separate customers. Other destinations: homepage 27; Instagram 3.</p></section>
    <section className="gta-learnings"><p className="gta-kicker">05 / Client success & next steps</p><h2>Discovery is the start of the relationship.</h2><div className="gta-learning-grid"><div><h3>Deeper engagement</h3><p>Click-to-open rate rose from 1.03% to 3.18%. More recorded readers explored products that could fit their own client offerings.</p></div><div><h3>Useful customer content</h3><p>The newsletter framed print as a way to diversify revenue, build premium packages and strengthen client relationships.</p></div><div><h3>Measure commercial impact</h3><p>Next: attributed orders, promo-code redemptions, first print orders, repeat purchases, average order value and revenue per delivered email.</p></div></div><p>These results show stronger email engagement. Revenue and retention impact require further attribution.</p><details className="gta-method"><summary>Campaign evidence</summary><p>Campaign snapshots reviewed November 11, 2026. Reports require account access. Walkthroughs reproduce the sent layouts; access details and recipient-specific links are omitted.</p><a href={reports[0]} target="_blank" rel="noreferrer">Constant Contact report ↗</a><br/><a href={reports[1]} target="_blank" rel="noreferrer">Squarespace report ↗</a></details></section>
  </main>;
}
