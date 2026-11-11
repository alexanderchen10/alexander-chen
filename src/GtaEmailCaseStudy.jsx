import { useState } from 'react';

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
  { label: 'Unsubscribes', before: 10, after: 47, change: '+37', caution: true, note: 'An important tradeoff: more unsubscribes. Check audience composition, list quality and mailing frequency.' },
  { label: 'Unsubscribe rate', before: 10/4613*100, after: 47/5198*100, rate: true, caution: true, change: '+0.69 pp', note: 'Unsubscribes ÷ delivered emails. Higher is a relationship-health concern, not a performance gain.' },
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

export default function GtaEmailCaseStudy() {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [product, setProduct] = useState(0);
  const metric = metrics[selected];
  const max = Math.max(metric.before, metric.after) * 1.12;
  return <main className="main-content gta-case">
    <a href="#about" className="gta-back">← Back to experience</a>
    <header className="gta-hero" id="gta-overview">
      <p className="gta-kicker">GTA Imaging / B2B email marketing / October 2026</p>
      <h1>From opening emails<br/>to exploring products.</h1>
      <p>I redesigned GTA Imaging’s newsletter in Squarespace, connecting premium albums and seasonal print products to the ways photographers grow their businesses and strengthen client relationships.</p>
      <div className="gta-highlights"><div><strong>3.9×</strong><span>recorded clickers</span></div><div><strong>3.5×</strong><span>click rate per delivery</span></div><div><strong>6</strong><span>product categories explored</span></div></div>
      <p className="gta-small">My role: Client Success & Email Marketing Specialist · Content strategy, copywriting, newsletter design and performance analysis.</p>
    </header>
    <section id="gta-design" aria-labelledby="gta-design-title">
      <p className="gta-kicker">01 / The redesign</p><h2 id="gta-design-title">A clearer path from inspiration to product.</h2>
      <p>The previous newsletter offered useful onboarding and production information. My version brought product discovery forward: premium album options, five client gift ideas and direct links to relevant collections.</p>
      <div className="gta-screens">{['Constant Contact','Squarespace'].map((name,i)=><figure key={name}><figcaption><strong>{i ? 'After / My redesign' : 'Before / Previous campaign'}</strong><span>{name} · October {i ? '20' : '5'}, 2026</span></figcaption><button type="button" onClick={()=>setExpanded(i)} aria-label={`Enlarge ${name} campaign screenshot`}><img src={`/projects/work/gta-imaging/${i ? 'squarespace' : 'constant-contact'}.png`} alt={`${name} newsletter opening screenshot`} /><span>Enlarge screenshot ↗</span></button></figure>)}</div>
    </section>
    <section className="gta-results" id="gta-results" aria-labelledby="gta-results-title">
      <p className="gta-kicker">02 / Explore the results</p><h2 id="gta-results-title">Engagement grew faster than reach.</h2>
      <p>74 clickers versus 19: a 289% increase, while the send audience grew only 13%. Select a metric to explore the comparison.</p>
      <div className="gta-controls" role="group" aria-label="Choose comparison metric">{metrics.map((item,i)=><button key={item.label} aria-pressed={selected===i} onClick={()=>setSelected(i)}>{item.label}</button>)}</div>
      <div className={`gta-chart ${metric.caution ? 'gta-caution' : ''}`} aria-live="polite">
        <div className="gta-chart-heading"><h3>{metric.label}</h3><strong>{metric.change}</strong></div>
        {[metric.before,metric.after].map((value,i)=><div className="gta-chart-row" key={i}><div><span>{i ? 'Squarespace / Oct. 20' : 'Constant Contact / Oct. 5'}</span><strong>{format(value,metric.rate)}</strong></div><div className="gta-track"><div className={i ? 'gta-bar gta-after' : 'gta-bar'} style={{width:`${value/max*100}%`}} /></div></div>)}
        <p>{metric.note}</p>
      </div>
      <details className="gta-method"><summary>View all metrics and calculation notes</summary><div className="gta-table-wrap"><table><caption>Campaign comparison · October 5 versus October 20, 2026</caption><thead><tr><th>Metric</th><th>Constant Contact</th><th>Squarespace</th><th>Change</th></tr></thead><tbody>{metrics.map(item=><tr key={item.label}><th scope="row">{item.label}</th><td>{format(item.before,item.rate)}</td><td>{format(item.after,item.rate)}</td><td>{item.change}</td></tr>)}</tbody></table></div><p>The dashboards display a 0.4% → 1% click rate, not click-to-open rate. Their rounding and denominators differ. Rates here are recalculated from reported counts using the same denominator; changes use unrounded values. “pp” means percentage points.</p><p>Constant Contact identifies 1,369 proxy opens among 1,850 reported openers. Cross-platform tracking, audience composition, timing and content differ. This is an observed comparison of two campaigns, not a controlled test proving the redesign alone caused the change.</p></details>
    </section>
    <section id="gta-changes"><p className="gta-kicker">03 / What changed</p><h2>Design with a commercial purpose.</h2><div className="gta-table-wrap"><table><thead><tr><th>Design & messaging</th><th>Previous campaign</th><th>My redesign</th></tr></thead><tbody>{comparisons.map(row=><tr key={row[0]}>{row.map((cell,i)=>i ? <td key={i}>{cell}</td> : <th scope="row" key={i}>{cell}</th>)}</tr>)}</tbody></table></div><p>I paired a cleaner editorial layout with product imagery, material swatches and clearer calls to action. The content connected prints to practical opportunities: diversifying revenue, building premium packages and creating thoughtful client gifts.</p></section>
    <section id="gta-products"><p className="gta-kicker">04 / Product discovery</p><h2>Interest across the print portfolio.</h2><p>Previously, 17 of 19 recorded link clicks went to the designer access guide. The redesigned campaign directed engagement across six product categories, creating more opportunities for cross-selling.</p><div className="gta-products">{products.map(([label,count],i)=><button key={label} aria-pressed={product===i} onClick={()=>setProduct(i)}><span>{label}</span><strong>{count}</strong><span className="gta-product-track"><span style={{width:`${count/43*100}%`}} /></span></button>)}</div><div className="gta-product-detail" aria-live="polite"><strong>{products[product][0]} / {products[product][1]} reported link clicks</strong><a href={`https://gtaimaging.com/${products[product][2]}`} target="_blank" rel="noreferrer">Explore product category ↗</a></div><p className="gta-small">Link counts overlap and must not be added together as separate customers. Other reported destinations: homepage 27; Instagram 3.</p></section>
    <section className="gta-learnings" id="gta-next"><p className="gta-kicker">05 / Client success & next steps</p><h2>More discovery. A relationship to keep improving.</h2><div className="gta-learning-grid"><div><h3>Deeper engagement</h3><p>Click-to-open rate rose from 1.03% to 3.18%. More recorded readers explored the next step, while product-led content demonstrated how print fits their own client offerings.</p></div><div><h3>Relationship health</h3><p>Unsubscribes increased from 10 to 47, or 0.22% to 0.90% of delivered emails. Audience differences, mailing frequency and list quality need investigation before attributing this to the content.</p></div><div><h3>Measure commercial impact</h3><p>The next measures are campaign-attributed orders, promo-code redemptions, first print orders, repeat purchases, average order value and revenue per delivered email.</p></div></div><p>These results demonstrate stronger email engagement across the two campaigns. Revenue and retention gains require further attribution.</p><details className="gta-method"><summary>Campaign evidence</summary><p>Reported campaign snapshots reviewed November 11, 2026. Reports require account access.</p><a href={reports[0]} target="_blank" rel="noreferrer">Constant Contact report ↗</a><br/><a href={reports[1]} target="_blank" rel="noreferrer">Squarespace report ↗</a></details></section>
    {expanded!==null && <div className="gta-lightbox" role="dialog" aria-modal="true" aria-label="Campaign screenshot" onClick={()=>setExpanded(null)} onKeyDown={e=>{if(e.key==='Escape')setExpanded(null);}}><button autoFocus type="button" onClick={()=>setExpanded(null)}>Close ×</button><img src={`/projects/work/gta-imaging/${expanded ? 'squarespace' : 'constant-contact'}.png`} alt={`${expanded ? 'Squarespace redesign' : 'Previous Constant Contact campaign'} enlarged`} /></div>}
  </main>;
}
