// Coin descriptions are plain paragraphs with no headings. The first paragraph is always an overview of the coin;
// the rest each cover one topic (how it works, supply, history, ...). A paragraph's first sentence usually states its
// topic, so keywords there count three times as much as the rest. A paragraph only gets a heading when it scores 2+;
// otherwise it joins the section before it, so headings stay accurate rather than guessed.
const topics = [
  {heading: (name) => `How ${name} works`, pattern: /\b(consensus|proof[- ]of[- ](work|stake|history|staked authority|authority)|validators?|nodes?|mining|miners|blocks?|blockchain|ledger|throughput|transactions per second|smart contracts?|zero[- ]knowledge|cryptograph\w*|operates)\b/gi},
  {heading: () => 'Supply and tokenomics', pattern: /\b(supply|halvings?|halving schedule|circulating|tokenomics|inflation\w*|deflationary|burn(ed|s|ing)?|emission|minted|million coins|million tokens|token distribution|allocat\w+|vesting)\b/gi},
  {heading: (name) => `History of ${name}`, pattern: /\b(created|founded|co-?founded|founders?|launched in|launched by|proposed|origins?|inception|invented|pseudonymous|traces?)\b/gi},
  {heading: (name) => `${name} adoption`, pattern: /\b(adoption|institutional|institutions|etfs?|partnerships?|partnered|corporations?|treasury|mainstream|enterprises?|banks?)\b/gi},
  {heading: (name) => `What ${name} is used for`, pattern: /\b(gas|transaction fees|fees|governance|voting|utility|used to|used for|serves multiple functions|purchase|payments?)\b/gi},
  {heading: (name) => `How ${name} is backed`, pattern: /\b(backed|reserves?|collateral\w*|pegged|redeem\w*|attestations?|audits?)\b/gi},
  {heading: (name) => `The ${name} ecosystem`, pattern: /\b(ecosystem|defi|decentralized finance|dapps?|decentralized applications|nfts?|developers|gaming|lending|wallets?)\b/gi},
  {heading: () => 'Roadmap', pattern: /\b(roadmap|upgrades?|future|upcoming|plans? to|aims? to|evolving toward)\b/gi},
];

const countMatches = (text, pattern) => (text.match(pattern) || []).length;

const descriptionSections = (text, name) => {
  const paragraphs = text.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const [overview = '', ...rest] = paragraphs;
  const sections = [];

  rest.forEach((paragraph) => {
    const [firstSentence] = paragraph.match(/^.*?[.!?](?=\s|$)/) || [paragraph];
    const remainder = paragraph.slice(firstSentence.length);
    const scores = topics.map((topic) => 3 * countMatches(firstSentence, topic.pattern) + countMatches(remainder, topic.pattern));
    const best = scores.indexOf(Math.max(...scores));
    const topic = scores[best] >= 2 ? topics[best] : null;
    const section = topic ? sections.find((s) => s.topic === topic) : sections[sections.length - 1];

    if(section) section.paragraphs.push(paragraph);
    else sections.push({topic, heading: topic ? topic.heading(name) : `More about ${name}`, paragraphs: [paragraph]});
  });

  return {overview, sections};
};

export default descriptionSections;
