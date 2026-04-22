// Mock newsroom data — original headlines, fictional outlets, realistic cadence
const NOW = Date.now();
const mins = (n) => new Date(NOW - n * 60 * 1000).toISOString();

const OUTLETS = {
  reuters:   { name: "Reuters Wire",        code: "RTR", tone: "#6aa1e0" },
  ft:        { name: "Financial Tribune",   code: "FTR", tone: "#e85a4f" },
  ap:        { name: "Associated Press",    code: "AP",  tone: "#d9b65a" },
  economist: { name: "The Globalist",       code: "GLB", tone: "#6fbf73" },
  bbc:       { name: "World Service",       code: "WSV", tone: "#a78bd9" },
  aljazeera: { name: "Levant Desk",         code: "LVT", tone: "#e8a85a" },
  kyiv:      { name: "Kyiv Independent",    code: "KYV", tone: "#8adfd9" },
  nikkei:    { name: "Nikkei Asia Report",  code: "NKA", tone: "#e87a9e" },
  guardian:  { name: "The Standard",        code: "STD", tone: "#b5c46a" },
  politico:  { name: "Capitol Brief",       code: "CAP", tone: "#d97757" },
};

const ARTICLES = [
  {
    id: "a1",
    breaking: true,
    topic: "WAR",
    region: "Eastern Europe",
    headline: "Ukraine strikes deep into occupied Crimea as long-range drone program expands",
    dek: "Kyiv says overnight strikes hit two Russian air-defense radars near Sevastopol, part of a widening campaign targeting logistics in the peninsula.",
    outlet: OUTLETS.kyiv,
    ts: mins(8),
    readMin: 4,
    entities: ["Ukraine", "Russia", "Crimea", "NATO"],
    body: "Ukrainian officials confirmed a coordinated overnight drone operation against Russian military infrastructure in occupied Crimea, with at least two S-400 radar components reported destroyed near Sevastopol. The General Staff described the strikes as part of a sustained effort to degrade Russia's air-defense coverage over the Black Sea. Russia's defense ministry acknowledged intercepting 'multiple aerial targets' but did not confirm damage. Analysts note the expanding range of Ukraine's domestic drone program, which has struck targets as far as 1,500 km from the front line in the past month. Western officials, speaking on condition of anonymity, said the campaign appears designed to force Russia to redistribute scarce air-defense assets ahead of an anticipated spring operational tempo shift.",
  },
  {
    id: "a2",
    breaking: true,
    topic: "ELECTION",
    region: "South Asia",
    headline: "Indonesian coalition fractures two weeks before parliamentary vote",
    dek: "A third party has withdrawn from the ruling bloc, throwing a tight race into further uncertainty amid protests over a fuel subsidy rollback.",
    outlet: OUTLETS.nikkei,
    ts: mins(23),
    readMin: 5,
    entities: ["Indonesia", "Jakarta", "ASEAN"],
    body: "The Nusantara Progress Party became the third coalition partner to exit the governing bloc this month, citing 'irreconcilable differences' over a planned fuel subsidy reduction. The withdrawal complicates the electoral math for the incumbent alliance, which had been polling within the margin of error against a rival bloc led by the opposition. Markets reacted cautiously, with the rupiah slipping 0.6% against the dollar in early trading. Observers warn that continued street protests over cost-of-living pressures could further depress turnout projections in contested districts across Java.",
  },
  {
    id: "a3",
    topic: "DIPLOMACY",
    region: "Middle East",
    headline: "Gulf states convene emergency session on Red Sea shipping corridor",
    dek: "Saudi Arabia and the UAE are coordinating a regional response after a fourth commercial vessel was targeted this week.",
    outlet: OUTLETS.aljazeera,
    ts: mins(47),
    readMin: 6,
    entities: ["Saudi Arabia", "UAE", "Houthis", "Yemen"],
    body: "Foreign ministers of the Gulf Cooperation Council will meet in Riyadh tomorrow to discuss a coordinated response to escalating attacks on commercial shipping in the Red Sea. The session follows a strike on a Greek-flagged tanker on Tuesday that briefly ignited a cargo fire. Shipping insurance premiums for vessels transiting the Bab al-Mandeb have risen 34% month-over-month, according to Lloyd's data. Western navies maintaining the Prosperity Guardian mission have intercepted 28 aerial threats in the past week alone.",
  },
  {
    id: "a4",
    topic: "ECONOMY",
    region: "Europe",
    headline: "EU signals 14th sanctions package will target shadow fleet insurers",
    dek: "Draft proposals circulating in Brussels would blacklist maritime underwriters suspected of servicing sanctioned Russian crude.",
    outlet: OUTLETS.ft,
    ts: mins(62),
    readMin: 7,
    entities: ["European Union", "Russia", "G7"],
    body: "European Commission drafts obtained by this outlet show the bloc's next sanctions package will for the first time directly target maritime insurance providers operating outside the G7 price cap mechanism. The move would close a loophole that has allowed an estimated 600-vessel 'shadow fleet' to transport Russian crude at prices above the $60 ceiling. Diplomats expect the package to be finalized by the June summit, though Hungary and Slovakia have signaled reservations about the insurance provisions specifically.",
  },
  {
    id: "a5",
    topic: "ELECTION",
    region: "North America",
    headline: "Canadian pollsters see tightest federal race in a decade",
    dek: "Three major tracking polls now place the top two parties within two points, with 11 weeks until election day.",
    outlet: OUTLETS.politico,
    ts: mins(88),
    readMin: 4,
    entities: ["Canada", "Ottawa"],
    body: "Canada's federal election is shaping up to be the closest in recent memory, with new tracking polls showing the governing party and its principal challenger separated by fewer than two percentage points nationally. Battleground ridings in the 905 belt around Toronto and the Lower Mainland in British Columbia will likely decide the outcome. Campaign strategists on both sides report concentrating advertising spend on voters aged 35-54, a cohort that has shown unusual volatility in this cycle.",
  },
  {
    id: "a6",
    topic: "WAR",
    region: "Middle East",
    headline: "Lebanon border sees heaviest cross-fire exchange in six weeks",
    dek: "UNIFIL reports 140 projectile crossings in 24 hours; civilian casualties reported on both sides of the Blue Line.",
    outlet: OUTLETS.bbc,
    ts: mins(104),
    readMin: 5,
    entities: ["Lebanon", "Israel", "Hezbollah", "UNIFIL"],
    body: "The United Nations Interim Force in Lebanon recorded 140 cross-border projectile events in the 24 hours ending Wednesday evening, the highest single-day total since a partial de-escalation understanding in early March. Civilian casualties were reported in villages on both sides of the Blue Line. Diplomatic cables suggest French and American envoys are coordinating a renewed mediation effort, though officials in both capitals stressed the gap between the parties remains 'substantial.'",
  },
  {
    id: "a7",
    topic: "CYBER",
    region: "Global",
    headline: "State-backed intrusion campaign targets election infrastructure in four nations",
    dek: "A joint advisory from five-eyes agencies attributes reconnaissance activity to a known APT operating from the Asia-Pacific.",
    outlet: OUTLETS.reuters,
    ts: mins(140),
    readMin: 6,
    entities: ["Five Eyes", "APT-41", "CISA"],
    body: "A joint advisory issued Wednesday by cybersecurity agencies across the Five Eyes intelligence partnership identifies an ongoing reconnaissance campaign targeting voter registration databases and tabulation vendors in four countries holding elections this year. The advisory attributes the activity with 'high confidence' to a known advanced persistent threat group. No successful intrusions into live voting systems have been reported, officials stressed, though the targeting of upstream vendors and municipal IT contractors represents a notable shift in tradecraft.",
  },
  {
    id: "a8",
    topic: "DIPLOMACY",
    region: "Asia-Pacific",
    headline: "Seoul and Tokyo announce trilateral naval exercise with US in East China Sea",
    dek: "Drill scheduled for next month will be the largest joint exercise of its kind, involving 28 surface vessels.",
    outlet: OUTLETS.nikkei,
    ts: mins(176),
    readMin: 4,
    entities: ["South Korea", "Japan", "United States", "China"],
    body: "The defense ministries of Japan and South Korea, in coordination with U.S. Indo-Pacific Command, announced a trilateral naval exercise scheduled for mid-next-month in the East China Sea. The drill will involve 28 surface vessels including one U.S. carrier strike group element, making it the largest exercise of its kind conducted by the three partners. Chinese foreign ministry officials called the exercise 'a provocative escalation' and warned of 'corresponding measures.'",
  },
  {
    id: "a9",
    topic: "ENERGY",
    region: "Europe",
    headline: "Nord Stream investigation widens to include third-country operatives",
    dek: "German federal prosecutors have issued warrants for two additional suspects believed to be outside EU territory.",
    outlet: OUTLETS.economist,
    ts: mins(210),
    readMin: 8,
    entities: ["Germany", "Nord Stream", "Russia", "Ukraine"],
    body: "Germany's federal prosecutor's office confirmed the issuance of European arrest warrants for two additional suspects in the 2022 Nord Stream pipeline sabotage, both believed to be operating outside EU jurisdiction. The move brings the known suspect count to five and marks the first public acknowledgment that investigators are pursuing leads connected to a third-country intelligence service. Berlin declined to name the country in question; sources familiar with the probe indicated a formal diplomatic demarche has been delivered.",
  },
  {
    id: "a10",
    topic: "ELECTION",
    region: "Latin America",
    headline: "Mexican state elections see record mayoral candidate violence",
    dek: "Eleven candidates have been killed since the campaign opened, prompting federal protection orders.",
    outlet: OUTLETS.ap,
    ts: mins(245),
    readMin: 5,
    entities: ["Mexico", "Sinaloa", "Guerrero"],
    body: "Mexico's federal electoral institute confirmed that eleven mayoral candidates have been killed since the official campaign period opened eleven weeks ago, a figure that exceeds all previous state election cycles in the past two decades. The interior ministry has issued expedited federal protection orders for 87 additional candidates deemed at elevated risk, primarily in the states of Guerrero, Michoacán, and parts of Sinaloa. Civil society monitors warn the violence has had a measurable chilling effect on candidacy in affected municipalities.",
  },
  {
    id: "a11",
    topic: "DIPLOMACY",
    region: "Africa",
    headline: "Sahel states formalize withdrawal from regional economic bloc",
    dek: "Mali, Burkina Faso, and Niger submit joint notification, ending a decades-long framework.",
    outlet: OUTLETS.guardian,
    ts: mins(312),
    readMin: 6,
    entities: ["Mali", "Burkina Faso", "Niger", "ECOWAS"],
    body: "The military governments of Mali, Burkina Faso, and Niger formally submitted joint notification of withdrawal from the regional economic community of West African States, ending a decades-long framework of trade and free movement. The three states had previously announced their intent to leave in January. The withdrawal takes effect after a one-year transition period under the bloc's treaty provisions. Officials from the Alliance of Sahel States confirmed plans for a new common passport and customs arrangement to enter force within the year.",
  },
  {
    id: "a12",
    topic: "ECONOMY",
    region: "Asia-Pacific",
    headline: "Japan intervenes in currency markets as yen approaches 38-year low",
    dek: "The Ministry of Finance confirmed 'decisive action' following a second consecutive session of sharp depreciation.",
    outlet: OUTLETS.nikkei,
    ts: mins(388),
    readMin: 4,
    entities: ["Japan", "Bank of Japan", "Federal Reserve"],
    body: "Japan's Ministry of Finance confirmed Wednesday that authorities had taken 'decisive action' in the foreign exchange market, a euphemism widely interpreted as direct yen-buying intervention. The yen had approached a 38-year low against the U.S. dollar in overnight trading before rebounding sharply. Vice Finance Minister for International Affairs Atsushi Mimura declined to confirm the scale of intervention but reiterated that Tokyo would act against 'excessive, speculative-driven movements.'",
  },
];

window.__ARTICLES = ARTICLES;
window.__OUTLETS = OUTLETS;

// Topic metadata
window.__TOPICS = [
  { id: "ALL",       label: "All"          },
  { id: "WAR",       label: "War"          },
  { id: "ELECTION",  label: "Elections"    },
  { id: "DIPLOMACY", label: "Diplomacy"    },
  { id: "ECONOMY",   label: "Economy"      },
  { id: "ENERGY",    label: "Energy"       },
  { id: "CYBER",     label: "Cyber"        },
];

// Relative time formatter
window.__relTime = function(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "now";
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  const d = Math.floor(h / 24);
  return d + "d ago";
};
