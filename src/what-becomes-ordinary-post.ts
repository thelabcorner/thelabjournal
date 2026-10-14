import type { Entry } from './data'

/** Brief journal note continuing the prior learning essays. */
export const whatBecomesOrdinaryPost: Entry = {
  slug: 'what-becomes-ordinary',
  title: 'What becomes ordinary',
  shortTitle: 'What becomes ordinary',
  contextLabel: 'Journal / 004',
  topic: 'Essays',
  stage: 'Editorial draft',
  type: 'Journal note',
  date: '2026-10-14',
  minutes: 2,
  issue: 'J–004',
  figure: 'frontier',
  summary: 'Working on Nacre has me thinking about how much of what counts as difficult depends on when you happen to be alive.',
  keywords: ['Nacre', 'Learning', 'Machine learning', 'Research', 'Scientific progress'],
  sections: [
    {
      heading: 'A thought while working on Nacre',
      paragraphs: [
        'As I sit here working on Nacre, trying to reconstruct editable vector geometry from raster images, I keep thinking about how much the difficulty of a problem depends on when you happen to be alive.',
        'Somebody had to discover and formalize the mathematics we now teach in school. Once that knowledge was written down, the next generation could start further ahead. Over time, ideas that once required serious original work become things we assume an educated person knows.',
        'Machine learning feels like a current example. I was reading comments from the developers behind PerfectVector, who work on similar vectorization problems and have PhDs. I obviously cannot judge anyone’s intelligence from how they type on Reddit. What struck me was how ordinary the exchange felt. Highly technical work is becoming a more normal thing for people to learn, discuss, and participate in. I wonder how many more people can approach problems like these now than could fifteen years ago.',
        'Newton comes to mind. We associate him with gravity because he helped establish a mathematical explanation for something everyone could observe. The work was extraordinary, but so much of the foundation of mathematical physics had yet to be established. Today’s researchers work on problems that would have been difficult even to describe without centuries of accumulated discoveries.',
        'It connects to “Learning in reverse” and “The problems I can solve now.” I have been writing about how AI lets me attempt problems that would once have been out of reach. The same expansion happens across generations as knowledge becomes ordinary and new questions become accessible.',
        'I enjoy being alive to see that happen. I am working on things in Nacre that I would not have known how to approach a few years ago, and I like the thought that some of today’s difficult research may eventually be routine.'
      ]
    }
  ]
}
