/** Canonical quote/collection registry. Editorial content belongs here, not in JSX.
 * Publish only verified, intentionally selected quotations; never generate filler.
 */
export interface QuoteAuthor {
  id: string
  name: string
}
export type QuoteSourceKind = 'journal' | 'manuscript' | 'book' | 'article' | 'speech' | 'conversation' | 'other'
export type SourceVerification = 'primary' | 'secondary' | 'unverified'
export interface QuoteSource {
  kind: QuoteSourceKind
  title?: string
  url?: string
  locator?: string
  verification: SourceVerification
}
export interface Quote {
  id: string
  text: string
  authorId: string
  source?: QuoteSource
  themes: string[]
  relatedWorks?: string[]
  recordedAt?: string
  addedAt: string
  status: 'draft' | 'published'
}
export interface QuoteCollection {
  id: string
  title: string
  description?: string
  /** Deliberate editorial order. A quote can appear in multiple collections. */
  quoteIds: string[]
  status: 'draft' | 'published'
}

export const OWN_AUTHOR_ID = 'jackson-cummings'

export const quoteAuthors: QuoteAuthor[] = [
  { id: OWN_AUTHOR_ID, name: 'Jackson Cummings' },
  { id: 'lance-priebe', name: 'Lance Priebe' },
  { id: 'albert-einstein', name: 'Albert Einstein' },
  { id: 'ralph-waldo-emerson', name: 'Ralph Waldo Emerson' },
  { id: 'fernando-pessoa', name: 'Fernando Pessoa' },
  { id: 'elon-musk', name: 'Elon Musk' },
  { id: 'vincent-van-gogh', name: 'Vincent van Gogh' },
  { id: 'homer', name: 'Homer' },
  { id: 'unknown-author', name: 'Unknown author' },
  { id: 'lil-wayne', name: 'Lil Wayne' },
  { id: 'wiz-khalifa', name: 'Wiz Khalifa' },
  { id: 'apple-think-different', name: 'Apple — Think Different campaign' },
  { id: 'jack-stauber', name: 'Jack Stauber' },
  { id: 'super-duper', name: 'Super Duper' },
  { id: 'austin-byassee', name: 'Austin Byassee' },
]

// Exact wording recovered from the author's prior conversations. The source
// dates record when those statements were made, not an inferred publication date.
// External text was explicitly selected by the author and independently checked
// against its attributed author's original publication.
export const quoteRegistry: Quote[] = [
  {
    id: 'castle-before-villagers',
    text: 'don’t build the castle before you have any villagers',
    authorId: OWN_AUTHOR_ID,
    themes: ['Engineering', 'Product development', 'Prioritization'],
    recordedAt: '2026-05-11',
    addedAt: '2026-10-24',
    status: 'published',
  },
  {
    id: 'defining-success',
    text: 'Did you achieve what you would define now as success?',
    authorId: OWN_AUTHOR_ID,
    themes: ['Reflection', 'Success'],
    recordedAt: '2026-05-30',
    addedAt: '2026-10-24',
    status: 'published',
  },
  {
    id: 'change-the-world',
    text: 'I will change the world',
    authorId: OWN_AUTHOR_ID,
    themes: ['Ambition', 'Purpose'],
    recordedAt: '2024-12-20',
    addedAt: '2026-10-24',
    status: 'published',
  },
  {
    id: 'bigger-than-cannabis',
    text: 'it’s literally, it’s process chemistry. Like, this is something that’s so much bigger than just fucking cannabis',
    authorId: OWN_AUTHOR_ID,
    themes: ['Process chemistry', 'Research', 'Perspective'],
    recordedAt: '2026-10-17',
    addedAt: '2026-10-24',
    status: 'published',
  },
  {
    id: 'deep-self-worth',
    text: 'I value myself. I have a very deep self-worth',
    authorId: OWN_AUTHOR_ID,
    themes: ['Identity', 'Self-worth'],
    recordedAt: '2026-10-23',
    addedAt: '2026-10-24',
    status: 'published',
  },
  {
    id: 'lance-priebe-curiosity',
    text: 'There was no rush to make money. No investors. No deadlines. Just curiosity and a love for building things.',
    authorId: 'lance-priebe',
    source: {
      kind: 'article',
      title: 'Club Penguin — Origin Story',
      url: 'https://rocketsnail.com/games/club-penguin/',
      locator: '300 Million Players',
      verification: 'primary',
    },
    themes: ['Building', 'Curiosity', 'Independence'],
    addedAt: '2026-10-24',
    status: 'published',
  },
  {
    id: "understanding-through-not-knowing",
    text: "i understand that i don’t understand, and i go brute force until i achieve understanding.",
    authorId: OWN_AUTHOR_ID,
    themes: ["Understanding", "Learning", "Persistence"],
    recordedAt: "2026-10-19",
    addedAt: '2026-10-24',
    status: 'published',
  },
  {
    id: "think-in-systems",
    text: "don’t think in job titles. think in systems.",
    authorId: OWN_AUTHOR_ID,
    themes: ["Systems", "Identity", "Engineering"],
    recordedAt: "2026-10-19",
    addedAt: '2026-10-24',
    status: 'published',
  },
  {
    id: "elegant-engineering-interfaces",
    text: "HMIs should be just as elegant as the engineering that goes on behind the scenes.",
    authorId: OWN_AUTHOR_ID,
    themes: ["Design", "Engineering", "Interfaces"],
    recordedAt: "2025-07-29",
    addedAt: '2026-10-24',
    status: 'published',
  },
  {
    id: "change-users-world",
    text: "my goal is to build things that genuinely change a user's world for the better.",
    authorId: OWN_AUTHOR_ID,
    themes: ["Purpose", "Engineering", "Product development"],
    recordedAt: "2025-07-26",
    addedAt: '2026-10-24',
    status: 'published',
  },
  {
    id: "a-feeling-is-not-a-fact",
    text: "A feeling is not a fact, and feelings are not expected to be fact.",
    authorId: OWN_AUTHOR_ID,
    themes: ["Epistemology", "Research", "Uncertainty"],
    recordedAt: "2026-10-12",
    addedAt: '2026-10-24',
    status: 'published',
  },
  {
    id: "model-intelligence-bottleneck",
    text: "Tediousness was primarily my main bottleneck. Now my bottleneck is model intelligence.",
    authorId: OWN_AUTHOR_ID,
    themes: ["AI", "Engineering", "Productivity"],
    recordedAt: "2026-10-12",
    addedAt: '2026-10-24',
    status: 'published',
  },
  {
    id: "knowledge-becomes-ordinary",
    text: "as the world amasses knowledge, things that were once hard are simple, and they become normalized",
    authorId: OWN_AUTHOR_ID,
    themes: ["Knowledge", "Progress", "Understanding"],
    recordedAt: "2026-10-14",
    addedAt: '2026-10-24',
    status: 'published',
  },
  {
    id: "problem-in-the-cave",
    text: "the way i see it; if the solution is simply that we can ‘only discuss difficult ideas with people receptive to difficult ideas’ then the problem in the cave hasn’t been solved, atp we’ve just attuned ourselves to speak with other prisoners who have escaped but the allegory itself is about how to make those whom are still within the cave receptive. that is where the problem lies",
    authorId: OWN_AUTHOR_ID,
    themes: ["Philosophy", "Communication", "Understanding"],
    recordedAt: "2026-09-30",
    addedAt: '2026-10-24',
    status: 'published',
  },
  {
    id: "share-with-peers",
    text: "i see the notion but i will disagree in that i don't see it as cut and dry as you mention! to compress it into 'not hanging around the right people' eliminates a vast potential to share anything you've found with peers, whether you like those peers or not.",
    authorId: OWN_AUTHOR_ID,
    themes: ["Philosophy", "Communication", "Knowledge"],
    recordedAt: "2026-09-30",
    addedAt: '2026-10-24',
    status: 'published',
  },
  {
    id: "former-two-origins",
    text: "two different etymological origins yet can be distilled to the same meaning",
    authorId: OWN_AUTHOR_ID,
    themes: ["Language", "Meaning", "Understanding"],
    recordedAt: "2026-10-24",
    addedAt: '2026-10-24',
    status: 'published',
  },
  {
    id: "former-mold-image",
    text: "there is also a visual of a mold, like a formation device, being used to establish something foundational… which itself implicates a notion of “being there from the start”",
    authorId: OWN_AUTHOR_ID,
    themes: ["Language", "Meaning", "Creativity"],
    recordedAt: "2026-10-24",
    addedAt: '2026-10-24',
    status: 'published',
  },
  {
    id: "session-access-parity",
    text: "if I can access it, OXP can access it.",
    authorId: OWN_AUTHOR_ID,
    themes: ["Engineering", "Agency", "Systems"],
    recordedAt: "2026-10-20",
    addedAt: '2026-10-24',
    status: 'published',
  },
  {
    id: "human-control",
    text: "THE USER HAS FULL FUCKING CONTROL.",
    authorId: OWN_AUTHOR_ID,
    themes: ["Agency", "Engineering", "Interfaces"],
    recordedAt: "2026-10-21",
    addedAt: '2026-10-24',
    status: 'published',
  },
  {
    id: "exceed-expectations",
    text: "When I have expectations to meet, I do everything in my power to exceed them.",
    authorId: OWN_AUTHOR_ID,
    themes: ["Craft", "Ambition", "Purpose"],
    recordedAt: "2023-04-26",
    addedAt: '2026-10-24',
    status: 'published',
  },
  // Original wording recovered from the author's own posts.
  // The post's original date was not recoverable; addedAt is the archival date.
  {
    id: 'criticism-versus-understanding',
    text: 'there is far less friction behind criticism than there is behind understanding',
    authorId: OWN_AUTHOR_ID,
    themes: ['Communication', 'Understanding', 'Reflection'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'intellectual-humility-and-interpretation',
    text: 'you cannot exercise intellectual humility toward others while implicitly treating others interpretations of you as justified, simply because their interpretations are understandable\nthe understandability of an interpretation does not alone establish justification, regardless of who is interpreting whom',
    authorId: OWN_AUTHOR_ID,
    themes: ['Epistemology', 'Communication', 'Perspective'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'rarely-black-and-white',
    text: 'things are rarely as black and white as they seem,\nthere’s usually a gray that’s inbetween.\nnuance',
    authorId: OWN_AUTHOR_ID,
    themes: ['Perspective', 'Understanding', 'Philosophy'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'best-ideas-almost-impossible',
    text: '“the best ideas are almost impossible”',
    authorId: OWN_AUTHOR_ID,
    themes: ['Creativity', 'Ambition', 'Building'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'piece-of-cheese',
    text: '"people have no idea how big the piece of cheese they\'re nibbling at is”',
    authorId: OWN_AUTHOR_ID,
    themes: ['Perspective', 'Knowledge', 'Meaning'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'confident-enough-to-learn',
    text: 'confident enough to proceed, but uncertain enough to learn',
    authorId: OWN_AUTHOR_ID,
    themes: ['Uncertainty', 'Learning', 'Engineering'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'interest-as-opportunity-cost',
    text: 'interest is an opportunity cost\nthe question is whether the opportunity is worth the cost',
    authorId: OWN_AUTHOR_ID,
    themes: ['Reflection', 'Prioritization', 'Purpose'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'extend-what-you-wish',
    text: 'extend what you wish to recieve\nsow and you will reap',
    authorId: OWN_AUTHOR_ID,
    themes: ['Philosophy', 'Agency', 'Reflection'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'feel-down-stand-tall',
    text: 'feel down, stand tall',
    authorId: OWN_AUTHOR_ID,
    themes: ['Persistence', 'Reflection'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'look-closer-structure',
    text: 'Look closer, the structure is really there.',
    authorId: OWN_AUTHOR_ID,
    themes: ['Research', 'Perspective', 'Understanding'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  // Some originally private posts were explicitly selected by the author for
  // public inclusion on 2026-11-18; selection is not blanket authorization.
  // Facebook URLs are not public sources or attribution evidence.
  {
    id: 'einstein-thinking-without-words',
    text: 'I very rarely think in words at all. A thought comes, and I may try to express it in words afterwards.',
    authorId: 'albert-einstein',
    source: {
      kind: 'book',
      title: 'Max Wertheimer, Productive Thinking (Harper, 1945)',
      locator: 'Footnote, p. 184; recording a conversation with Einstein in 1916. Corroborated by Alice Calaprice, The Ultimate Quotable Einstein.',
      verification: 'secondary',
    },
    themes: ['Language', 'Thinking', 'Understanding'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'einstein-passionately-curious',
    text: 'I have no special talent. I am only passionately curious.',
    authorId: 'albert-einstein',
    source: {
      kind: 'other',
      title: 'Letter to Carl Seelig, March 11, 1952',
      locator: 'Albert Einstein Archives, 39-013. English translation.',
      verification: 'secondary',
    },
    themes: ['Curiosity', 'Learning', 'Knowledge'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'thoughts-not-written-for-you',
    text: "being able to see someone's thoughts doesn't mean those thoughts were written for you",
    authorId: OWN_AUTHOR_ID,
    themes: ["Communication", "Perspective", "Identity"],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'demonstrating-character',
    text: "the more interested someone is in being demonstrably good rather than being perceived as good, the less they need self-description\nyou do not establish your character by declaring it\nthe act of declaration, ironically, often reveals you possess the opposite what you intended to demonstrate",
    authorId: OWN_AUTHOR_ID,
    themes: ["Character", "Identity", "Integrity"],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'impressive-valuable-commercial',
    text: "producing something impressive isn't the same as producing something valuable,\nproducing something valuable isn't the same as commercial value",
    authorId: OWN_AUTHOR_ID,
    themes: ["Value", "Craft", "Product development"],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'acknowledging-confronting-solving',
    text: "acknowledging a problem is not the same as confronting it, and confronting it is not the same as solving it",
    authorId: OWN_AUTHOR_ID,
    themes: ["Action", "Responsibility", "Reflection"],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'exceptional-denial-reality',
    text: "become so exceptional that denial would require ignoring reality",
    authorId: OWN_AUTHOR_ID,
    themes: ["Ambition", "Craft", "Identity"],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'pleasure-in-the-mundane',
    text: "if you cannot find pleasure in the mundane, how will you find pleasure in the complex?",
    authorId: OWN_AUTHOR_ID,
    themes: ["Reflection", "Curiosity", "Perspective"],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'my-mind-is-a-storm',
    text: "\"My mind is a storm.\"\n\"I don't think most people would want to be me.\"\n\"They may think they'd want to be me, but they don't know, they don't understand.\"",
    authorId: 'elon-musk',
    source: {
      kind: 'conversation',
      title: 'Lex Fridman Podcast #400 — Elon Musk (November 9, 2023)',
      url: 'https://lexfridman.com/elon-musk-4-transcript/',
      locator: 'Elon Musk at approximately 02:12:50, describing his own experience',
      verification: 'primary',
    },
    themes: ["Identity", "Thinking", "Understanding"],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'cant-stop-metacognating',
    text: "i can’t stop metacognating",
    authorId: OWN_AUTHOR_ID,
    themes: ["Metacognition", "Thinking", "Identity"],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'school-answers-industry-decisions',
    text: "school rewards the right answers.\nindustry rewards the right decisions.\ndo not conflate them",
    authorId: OWN_AUTHOR_ID,
    themes: ["Engineering", "Judgment", "Learning"],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'scarcity-does-not-make-opportunity-valuable',
    text: "scarcity of opportunities doesn't increase the inherent value of an individual opportunity",
    authorId: OWN_AUTHOR_ID,
    themes: ["Value", "Judgment", "Opportunity"],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'impression-is-a-hypothesis',
    text: "an impression is a hypothesis, not privileged access to somebody else's mind",
    authorId: OWN_AUTHOR_ID,
    themes: ["Epistemology", "Perspective", "Understanding"],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'misunderstood-then-explained',
    text: "you tell people you hate being misunderstood, and then people respond by trying to explain what your own expressions really mean",
    authorId: OWN_AUTHOR_ID,
    themes: ["Communication", "Identity", "Perspective"],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'existential-and-meaning',
    text: "‘existential’ is often used as a vehicle for dread, crisis. but it only literally means ‘pertaining to existence’\nsemantic vectors are weird",
    authorId: OWN_AUTHOR_ID,
    themes: ["Language", "Meaning", "Perspective"],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'judging-ability-by-effort',
    text: "humans infer ability (partly) from how quickly another person produces something that would have required substantial effort from themselves.",
    authorId: OWN_AUTHOR_ID,
    themes: ["Perception", "Craft", "Understanding"],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'words-dont-illustrate-neurons',
    text: "words themselves don't illustrate the neurons that are firing in my head",
    authorId: OWN_AUTHOR_ID,
    themes: ["Thinking", "Language", "Understanding"],
    recordedAt: '2026-10-19',
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'demonstrate-qualities-you-expect',
    text: "people should demonstrate the qualities they expect from others",
    authorId: OWN_AUTHOR_ID,
    themes: ["Integrity", "Character", "Responsibility"],
    recordedAt: '2026-10-31',
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'minimize-not-resolve',
    text: "the key word there is minimize, not resolve",
    authorId: OWN_AUTHOR_ID,
    themes: ["Engineering", "Uncertainty", "Risk"],
    recordedAt: '2026-11-18',
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'tool-failures-preventable',
    text: "tool failures are inevitable, but many are preventable",
    authorId: OWN_AUTHOR_ID,
    themes: ["Engineering", "Reliability", "Responsibility"],
    recordedAt: '2026-10-10',
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'intellectually-justified',
    text: "I like to be intellectually justified. That's what defines me as a person",
    authorId: OWN_AUTHOR_ID,
    themes: ["Epistemology", "Identity", "Judgment"],
    recordedAt: '2026-11-13',
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'observation-not-retribution',
    text: "I am not seeking retribution. I am not seeking vindication. I am not seeking anything. I am making an observation.",
    authorId: OWN_AUTHOR_ID,
    themes: ["Judgment", "Reflection", "Responsibility"],
    recordedAt: '2026-11-13',
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'accepting-ambiguity',
    text: "there is so much ambiguity here and i am growing to be accepting of it",
    authorId: OWN_AUTHOR_ID,
    themes: ["Uncertainty", "Growth", "Perspective"],
    recordedAt: '2026-11-13',
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'one-word-makes-difference',
    text: "one word can make all the difference",
    authorId: OWN_AUTHOR_ID,
    themes: ["Language", "Communication", "Meaning"],
    recordedAt: '2026-11-10',
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'when-systems-interfere-with-progress',
    text: "I love it all the way up until it starts to interfere with my ability to actually make progress.",
    authorId: OWN_AUTHOR_ID,
    themes: ["Engineering", "Systems", "Progress"],
    recordedAt: '2026-10-13',
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'alternative-to-picking-sides',
    text: "What is the alternative, huh? What is the alternative? To pick a side",
    authorId: OWN_AUTHOR_ID,
    themes: ["Nuance", "Judgment", "Perspective"],
    recordedAt: '2026-11-13',
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'recognizing-both-extremes',
    text: "i recognize BOTH SIDES, BOTH EXTREMES. i know what i need to tell them, and what i don't need to tell them.",
    authorId: OWN_AUTHOR_ID,
    themes: ["AI", "Communication", "Judgment"],
    recordedAt: '2026-11-18',
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'emerson-what-you-are',
    text: "Don't say things. What you are stands over you the while, and thunders so that I cannot hear what you say to the contrary.",
    authorId: 'ralph-waldo-emerson',
    source: {
      kind: 'book',
      title: 'Letters and Social Aims',
      locator: 'Social Aims (1875); original passage, not the abbreviated social-media paraphrase.',
      url: 'https://www.gutenberg.org/cache/epub/71393/pg71393-images.html',
      verification: 'primary',
    },
    themes: ['Integrity', 'Character', 'Communication'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'pessoa-because-i-am-nothing',
    text: 'Because I am nothing, I can imagine myself to be anything.',
    authorId: 'fernando-pessoa',
    source: {
      kind: 'book',
      title: 'The Book of Disquiet',
      locator: 'Bernardo Soares; English translation, attributed in a Publishers Weekly review.',
      verification: 'secondary',
    },
    themes: ['Identity', 'Imagination', 'Thinking'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'van-gogh-great-fire-within-me',
    text: 'a great fire burns within me, but no one stops to warm themselves at it, and passers-by only see a wisp of smoke',
    authorId: 'vincent-van-gogh',
    source: {
      kind: 'other',
      title: 'Letter to Theo van Gogh, Cuesmes, 22–24 June 1880 (letter 155)',
      url: 'https://vangoghletters.org/vg/letters/let155/letter.html',
      locator: 'I saved a modern first-person adaptation, not a verbatim translation of the original French. In the letter, Van Gogh describes a fire in the soul and smoke from a chimney.',
      verification: 'secondary',
    },
    themes: ['Identity', 'Understanding', 'Reflection'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  // November 18: deliberately selected personal statements. Preserve the
  // author's spelling, syntax and punctuation; do not polish into aphorisms.
  {
    id: 'defensive-about-being-defensive',
    text: 'you notice yourself being defensive. then unconsciously become defensive about being defensive',
    authorId: OWN_AUTHOR_ID,
    themes: ['Metacognition', 'Self-awareness', 'Reflection'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'rationalization-as-logical-mask',
    text: 'rationalization is a great tool in engineering... but it can also become a logical mask for avoidance',
    authorId: OWN_AUTHOR_ID,
    themes: ['Engineering', 'Rationalization', 'Self-awareness'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'ambition-predates-rewards',
    text: 'ambition clearly predates any particular reward or recognition it might produce',
    authorId: OWN_AUTHOR_ID,
    themes: ['Ambition', 'Motivation', 'Purpose'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'lock-yourself-in-a-cage',
    text: 'it is contradictory to lock yourself in a cage, put the key in your pocket, and shame others for not joining you.',
    authorId: OWN_AUTHOR_ID,
    themes: ['Freedom', 'Contradiction', 'Judgment'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'coincidental-bitterisms',
    text: 'whether they were intentional on their behalf or just a bit of coincidental bitterisms, they still hold interesting weight in isolation from the person that made the claim',
    authorId: OWN_AUTHOR_ID,
    themes: ['Interpretation', 'Language', 'Perspective'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'apprehensive-toward-epistemology',
    text: 'the bulk of people as a generalization are quite apprehensive toward epistemology',
    authorId: OWN_AUTHOR_ID,
    themes: ['Epistemology', 'Understanding', 'Society'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'cave-ascent-social-cost',
    text: 'human perception is often limited to mere illusions, and true knowledge requires an intellectual journey from ignorance to enlightenment…. though that ascent has a social cost: the freed prisoner becomes alienated from those still in the cave and is mocked, threatened, or rejected.',
    authorId: OWN_AUTHOR_ID,
    themes: ['Epistemology', 'Understanding', 'Alienation'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'losing-holds-more-data',
    text: 'losing holds more data in what led to failure than winning holds in what led to success',
    authorId: OWN_AUTHOR_ID,
    themes: ['Failure', 'Learning', 'Engineering'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'everything-because-i-was',
    text: 'everything it is, it is because I was',
    authorId: OWN_AUTHOR_ID,
    themes: ['Identity', 'Legacy', 'Reflection'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'double-pendulums-swanging',
    text: "we're all just double pendulums swanging",
    authorId: OWN_AUTHOR_ID,
    themes: ['Complexity', 'Philosophy', 'Humor'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'justification-as-avoidance',
    text: 'justification can be avoidance disguised as reason - Where am I using my intelligence to defend my stagnation?',
    authorId: OWN_AUTHOR_ID,
    themes: ['Self-awareness', 'Rationalization', 'Growth'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'justify-dream-versus-delusion',
    text: 'how do you justify a dream vs a delusion?',
    authorId: OWN_AUTHOR_ID,
    themes: ['Epistemology', 'Ambition', 'Uncertainty'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  // Collected passages: source records make attribution distinctions explicit.
  // The wording below is transcribed from the author's supplied excerpts/images.
  {
    id: 'homer-bitter-experiences',
    text: 'A man who has been through bitter experiences and travelled far enjoys even his sufferings after a time',
    authorId: 'homer',
    source: {
      kind: 'book',
      title: 'The Odyssey',
      locator: 'Book XV, near lines 397–400 (Eumaeus); wording of the English translation I saved.',
      url: 'https://wist.info/homer/48328/',
      verification: 'secondary',
    },
    themes: ['Suffering', 'Experience', 'Perspective'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'burning-blamed-for-ashes',
    text: 'I was burning, while you came blaming me for the smell of ashes.',
    authorId: 'unknown-author',
    source: {
      kind: 'other',
      title: 'Unattributed circulating quotation',
      locator: 'Frequently attributed to Fyodor Dostoevsky, but no authentic source has been identified; original author unknown.',
      url: 'https://quotogeny.com/q/i-was-burning-smell-of-ashes/',
      verification: 'unverified',
    },
    themes: ['Misunderstanding', 'Suffering', 'Relationships'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'lil-wayne-running-with-it',
    text: "if you ain’t runnin with it, run from it motherfucka alright",
    authorId: 'lil-wayne',
    source: {
      kind: 'other',
      title: 'Right Above It — Lil Wayne feat. Drake',
      locator: "I kept the colloquial spelling of the lyric excerpt.",
      url: 'https://www.karafun.com/karaoke/lil-wayne/right-above-it/',
      verification: 'secondary',
    },
    themes: ['Action', 'Commitment', 'Music'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'lil-wayne-beyond-beautiful',
    text: "I promise, I should be hooked on Phonics\n\nBut anyway, I think you're bionic\n\nAnd I don't think you're beautiful, I think you're beyond it",
    authorId: 'lil-wayne',
    source: {
      kind: 'other',
      title: 'Every Girl - Young Money (2009), verse by Lil Wayne',
      locator: 'I kept the line breaks and punctuation from the image I saved.',
      url: 'https://www.lilwaynehq.com/lyrics/every-girl/',
      verification: 'secondary',
    },
    themes: ['Beauty', 'Perception', 'Music'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'wiz-khalifa-we-all-stunt',
    text: "know if i ball, we all gon' stunt",
    authorId: 'wiz-khalifa',
    source: {
      kind: 'other',
      title: 'Roll Up — Wiz Khalifa',
      locator: 'I preserved the wording I saved. The recording is also transcribed as “You know if I ball, then we all gon’ stunt.”',
      url: 'https://ohhla.com/anonymous/wiz_khal/rolling/roll_up.wiz.txt',
      verification: 'secondary',
    },
    themes: ['Community', 'Success', 'Music'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'ramanujan-fear-of-delusion',
    text: 'he was aware, but terrified of being delusional',
    authorId: 'unknown-author',
    source: {
      kind: 'other',
      title: 'Unattributed description of Srinivasa Ramanujan',
      locator: "I saved this as a description of Ramanujan, but I haven't established who originally wrote it or where it appeared.",
      verification: 'unverified',
    },
    themes: ['Self-awareness', 'Uncertainty', 'Mathematics'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'apple-heres-to-crazy-ones',
    text: "Here's to the crazy ones. The misfits. The rebels. The troublemakers. The round pegs in the square holes. The ones who see things differently. They're not fond of rules. And they have no respect for the status quo. You can quote them, disagree with them, glorify or vilify them. About the only thing you can't do is ignore them. Because they change things. They push the human race forward. And while some may see them as the crazy ones, we see genius. Because the people who are crazy enough to think they can change the world, are the ones who do.",
    authorId: 'apple-think-different',
    source: {
      kind: 'other',
      title: 'Apple, Think Different — “The Crazy Ones” (1997)',
      locator: 'Campaign copy principally credited to Rob Siltanen and Ken Segall (TBWA/Chiat/Day); associated with Steve Jobs but not solely authored by him.',
      url: 'https://tollbit.forbes.com/sites/onmarketing/2011/12/14/the-real-story-behind-apples-think-different-campaign/',
      verification: 'primary',
    },
    themes: ['Creativity', 'Nonconformity', 'Ambition'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'jack-stauber-pup-three-words',
    text: "just three little words, it's amazing how one affects the brain.... if nobody heard, then nobody had that much to gain",
    authorId: 'jack-stauber',
    source: {
      kind: 'other',
      title: 'Pup — Jack Stauber’s Micropop',
      locator: 'I kept the punctuation from the lyric excerpt I saved.',
      url: 'https://www.lyricdown.com/lrc/jack-stauber-pup-2009478',
      verification: 'secondary',
    },
    themes: ['Language', 'Perception', 'Music'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'jack-stauber-rain-awning',
    text: "see that the rain is nice, but gee, i don't really like getting wet.... what in the world? i went under the awning.... it's still raining?! i did what i was supposed to.... thats... not fair",
    authorId: 'jack-stauber',
    source: {
      kind: 'other',
      title: 'rain — Jack Stauber (2019)',
      locator: 'I transcribed this as dialogue from the animated short, not as song lyrics.',
      url: 'https://www.youtube.com/watch?v=osxJ5-_Ccp0',
      verification: 'primary',
    },
    themes: ['Expectations', 'Frustration', 'Animation'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'super-duper-got-my-wings',
    text: 'Got my wings\nYeah, I know how to fly',
    authorId: 'super-duper',
    source: {
      kind: 'other',
      title: 'I Got My Wings & A Cherry On Top — Super Duper',
      url: 'https://genius.com/Super-duper-i-got-my-wings-and-a-cherry-on-top-lyrics',
      locator: 'I saved these two lines from the song.',
      verification: 'secondary',
    },
    themes: ['Freedom', 'Growth', 'Music'],
    addedAt: '2026-11-18',
    status: 'published',
  },
  {
    id: 'austin-byassee-train-momentum',
    text: "like a train, it takes ALOT of energy to get momentum\n\nbut once you're moving, it's also takes ALOT of energy to slow down!",
    authorId: 'austin-byassee',
    source: {
      kind: 'conversation',
      title: 'A conversation with Austin Byassee — my paraphrase',
      locator: "Austin shared this train analogy with me. I've paraphrased it here, rather than presenting it as his exact words. I don't have the original date or a verbatim transcript.",
      verification: 'unverified',
    },
    themes: ['Momentum', 'Energy', 'Persistence'],
    addedAt: '2026-11-18',
    status: 'published',
  },
]

export const quoteCollectionRegistry: QuoteCollection[] = [
  {
    id: 'building-things',
    title: 'On building things',
    description: 'Original and collected statements on building, curiosity, and the relationship between ambition and execution.',
    quoteIds: ['castle-before-villagers', 'lance-priebe-curiosity', 'change-the-world', 'change-users-world', 'elegant-engineering-interfaces', 'model-intelligence-bottleneck', 'exceed-expectations', 'ambition-predates-rewards', 'losing-holds-more-data', 'apple-heres-to-crazy-ones'],
    status: 'published',
  },
  {
    id: 'questions-and-understanding',
    title: 'On questions and understanding',
    description: 'Questions about success, scientific perspective, and the work of understanding.',
    quoteIds: ['defining-success', 'bigger-than-cannabis', 'understanding-through-not-knowing', 'a-feeling-is-not-a-fact', 'knowledge-becomes-ordinary', 'former-two-origins', 'former-mold-image', 'apprehensive-toward-epistemology', 'cave-ascent-social-cost', 'justify-dream-versus-delusion', 'ramanujan-fear-of-delusion'],
    status: 'published',
  },
  {
    id: "sharing-understanding",
    title: "On sharing understanding",
    description: "Learning is not complete simply because an idea can be discussed among those who already understand it.",
    quoteIds: ["problem-in-the-cave", "share-with-peers", "understanding-through-not-knowing", "knowledge-becomes-ordinary", "cave-ascent-social-cost", "coincidental-bitterisms"],
    status: 'published',
  },
  {
    id: "systems-and-agency",
    title: "On systems and agency",
    description: "Systems thinking, human control, and the responsibility of interfaces to serve the people using them.",
    quoteIds: ["think-in-systems", "session-access-parity", "human-control", "elegant-engineering-interfaces"],
    status: 'published',
  },
  {
    id: 'interpreting-and-understanding',
    title: 'On interpreting and understanding',
    description: 'What people infer, what they can justify, and the intellectual work required to understand rather than merely criticize.',
    quoteIds: [
      'criticism-versus-understanding',
      'intellectual-humility-and-interpretation',
      'rarely-black-and-white',
      'look-closer-structure',
      'einstein-thinking-without-words',
      'emerson-what-you-are',
      'coincidental-bitterisms',
      'apprehensive-toward-epistemology',
      'lock-yourself-in-a-cage',
    ],
    status: 'published',
  },
  {
    id: 'curiosity-and-action',
    title: 'On curiosity and action',
    description: 'Being curious enough to learn, confident enough to act, and attentive to the cost of both.',
    quoteIds: [
      'confident-enough-to-learn',
      'interest-as-opportunity-cost',
      'best-ideas-almost-impossible',
      'einstein-passionately-curious',
      'extend-what-you-wish',
      'ambition-predates-rewards',
      'lil-wayne-running-with-it',
      'lil-wayne-beyond-beautiful',
      'super-duper-got-my-wings',
      'wiz-khalifa-we-all-stunt',
      'apple-heres-to-crazy-ones',
    ],
    status: 'published',
  },

  {
    id: 'thought-and-interpretation',
    title: 'On thought and interpretation',
    description: 'Perception, language, self-knowledge, and the distance between thoughts and interpretations.',
    quoteIds: [
      'words-dont-illustrate-neurons',
      'my-mind-is-a-storm',
      'van-gogh-great-fire-within-me',
      'cant-stop-metacognating',
      'thoughts-not-written-for-you',
      'impression-is-a-hypothesis',
      'misunderstood-then-explained',
      'intellectually-justified',
      'accepting-ambiguity',
      'recognizing-both-extremes',
      'pessoa-because-i-am-nothing',
      'defensive-about-being-defensive',
      'everything-because-i-was',
      'double-pendulums-swanging',
      'homer-bitter-experiences',
      'burning-blamed-for-ashes',
      'jack-stauber-pup-three-words',
      'jack-stauber-rain-awning',
    ],
    status: 'published',
  },
  {
    id: 'work-value-and-judgment',
    title: 'On work, value and judgment',
    description: 'What is worth doing, how to evaluate it, and the difference between intention and progress.',
    quoteIds: [
      'impressive-valuable-commercial',
      'school-answers-industry-decisions',
      'acknowledging-confronting-solving',
      'tool-failures-preventable',
      'minimize-not-resolve',
      'when-systems-interfere-with-progress',
      'scarcity-does-not-make-opportunity-valuable',
      'pleasure-in-the-mundane',
      'demonstrate-qualities-you-expect',
      'demonstrating-character',
      'rationalization-as-logical-mask',
      'losing-holds-more-data',
      'justification-as-avoidance',
      'lock-yourself-in-a-cage',
      'austin-byassee-train-momentum',
    ],
    status: 'published',
  },

]

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const validDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date) &&
  !Number.isNaN(Date.parse(date)) &&
  new Date(date + 'T00:00:00Z').toISOString().startsWith(date)

export function validateQuotes(
  authors: readonly QuoteAuthor[],
  quotes: readonly Quote[],
  collections: readonly QuoteCollection[],
): void {
  const seen = new Set<string>()
  const checkId = (id: string, label: string) => {
    if (!slugPattern.test(id) || seen.has(label + ':' + id)) throw new Error('Invalid or duplicate ' + label + ' ID: ' + id)
    seen.add(label + ':' + id)
  }
  for (const author of authors) {
    checkId(author.id, 'author')
    if (!author.name.trim()) throw new Error('Missing author name: ' + author.id)
  }
  const authorsById = new Set(authors.map(author => author.id))
  if (!authorsById.has(OWN_AUTHOR_ID)) throw new Error('Missing owner in quote author registry')
  const byQuote = new Map<string, Quote>()
  for (const quote of quotes) {
    checkId(quote.id, 'quote')
    if ('curationNote' in quote) throw new Error('Interpretive commentary is not allowed on quotations: ' + quote.id)
    if (!quote.text.trim() || !authorsById.has(quote.authorId)) throw new Error('Invalid text or author: ' + quote.id)
    if (!validDate(quote.addedAt) || (quote.recordedAt && !validDate(quote.recordedAt)))
      throw new Error('Invalid quote date: ' + quote.id)
    if (quote.source?.url) {
      try {
        if (!['https:', 'http:'].includes(new URL(quote.source.url).protocol)) throw new Error('Invalid protocol')
      } catch { throw new Error('Invalid source URL: ' + quote.id) }
    }
    if (quote.status === 'published' && quote.authorId !== OWN_AUTHOR_ID && !quote.source)
      throw new Error('Published external quotation requires a source: ' + quote.id)
    if (new Set(quote.themes).size !== quote.themes.length) throw new Error('Duplicate quote themes: ' + quote.id)
    if (quote.relatedWorks) for (const path of quote.relatedWorks) {
      if (!/^\/(?:posts|research)\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/.test(path))
        throw new Error('Related work must be a canonical internal journal/manuscript path: ' + quote.id)
    }
    byQuote.set(quote.id, quote)
  }
  for (const collection of collections) {
    checkId(collection.id, 'collection')
    if (!collection.title.trim()) throw new Error('Collection is missing a title: ' + collection.id)
    if (new Set(collection.quoteIds).size !== collection.quoteIds.length)
      throw new Error('Duplicate quote membership: ' + collection.id)
    for (const id of collection.quoteIds) {
      const quote = byQuote.get(id)
      if (!quote) throw new Error('Missing quote "' + id + '" in collection ' + collection.id)
      if (collection.status === 'published' && quote.status !== 'published')
        throw new Error('Published collection references a draft quotation: ' + id)
    }
  }
}
validateQuotes(quoteAuthors, quoteRegistry, quoteCollectionRegistry)

export const publishedQuotes = quoteRegistry.filter(quote => quote.status === 'published')
export const publishedCollections = quoteCollectionRegistry.filter(collection => collection.status === 'published')
export const quoteById = new Map(publishedQuotes.map(quote => [quote.id, quote]))
export const collectionById = new Map(publishedCollections.map(collection => [collection.id, collection]))
export const authorsById = new Map(quoteAuthors.map(author => [author.id, author]))
export const authorName = (id: string) => authorsById.get(id)?.name ?? 'Unknown author'
export const isOwnQuote = (quote: Quote) => quote.authorId === OWN_AUTHOR_ID
export const quoteTitle = (quote: Quote) => quote.text.length > 85
  ? quote.text.slice(0, 82).replace(/\s+\S*$/, '') + '…'
  : quote.text

const base = () => import.meta.env.BASE_URL
export const quotesPath = () => base() + 'quotes/'
export const quotePath = (id: string) => quotesPath() + encodeURIComponent(id) + '/'
export const collectionPath = (id: string) => quotesPath() + 'collections/' + encodeURIComponent(id) + '/'

export type QuoteRoute =
  | { kind: 'index' }
  | { kind: 'quote'; id: string }
  | { kind: 'collection'; id: string }
  | { kind: 'not-found' }

export function quoteRouteFromPath(path: string): QuoteRoute | null {
  const prefix = quotesPath()
  if (path === prefix || path === prefix.slice(0, -1)) return { kind: 'index' }
  if (!path.startsWith(prefix)) return null
  const suffix = path.slice(prefix.length).replace(/\/$/, '')
  if (suffix.startsWith('collections/')) {
    const id = suffix.slice('collections/'.length)
    return slugPattern.test(id) && collectionById.has(id)
      ? { kind: 'collection', id } : { kind: 'not-found' }
  }
  return slugPattern.test(suffix) && quoteById.has(suffix)
    ? { kind: 'quote', id: suffix } : { kind: 'not-found' }
}
