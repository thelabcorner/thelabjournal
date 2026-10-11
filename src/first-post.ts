import type { Entry } from './data'

/**
 * First public-facing essay draft. No private project names, internal
 * benchmarks, partner names, unpublished scientific claims, or personal details.
 * Source: first-person editorial direction and reviewed learning history.
 */
export const firstPost: Entry = {
  slug: 'learning-in-reverse',
  title: 'Learning in reverse: what AI changed about how I build',
  shortTitle: 'Learning in reverse',
  contextLabel: 'Journal / 001',
  topic: 'Essays',
  stage: 'Editorial draft',
  type: 'Personal essay',
  date: '2026-10-09',
  minutes: 6,
  issue: 'J–001',
  figure: 'learning',
  summary: 'I still learn by building things. AI changed which comes first: understanding the system, or having something imperfect to pull apart.',
  keywords: ['Learning', 'AI', 'Prototyping', 'Engineering', 'Research'],
  sections: [
    {
      heading: 'I have always learned by making things',
      paragraphs: [
        'I started tinkering with software through game servers and plugins. When I wanted something to work, I would read documentation, inspect examples, change the code, break it, and try again. I was rarely following a curriculum. A project gave me a reason to learn whatever was standing in the way.',
        'That approach followed me into other work. Design led to geometry. Software led to protocols and data structures. Experimental work led to control systems, measurement, and physics. I have always been willing to brute-force my way through a problem, especially when I can see the result of each attempt.',
        'For most of that time, I needed to understand enough of the underlying mechanism before I could assemble a useful version of the thing I wanted. The understanding was incomplete, of course. I was learning while building. But research usually came first, followed by an implementation that proved whether I had understood it.'
      ]
    },
    {
      heading: 'Now the first version often comes before the explanation',
      paragraphs: [
        'AI has rearranged that sequence. I can approach an unfamiliar problem, describe what I am trying to accomplish, and get a rough implementation before I have built a complete mental model of the domain. Sometimes that first pass works. Often it only appears to work. Either result gives me something concrete to investigate.',
        'I can run it, inspect the output, change an assumption, profile a slow path, or ask why two apparently equivalent approaches behave differently. The program becomes a working example of the questions I did not yet know to ask.',
        'On the surface, my process looks familiar. I still read papers, write code, test ideas, and iterate until the result is useful. The difference is where the learning begins. I used to work toward an artifact from a partial understanding. Now I often work backward from a partial artifact toward a much deeper understanding.'
      ]
    },
    {
      heading: 'An imperfect result is surprisingly useful',
      paragraphs: [
        'Consider a document-conversion experiment. A generated PDF may look accurate on screen, but selecting its text reveals that the entire page is one flat image. That first result exposes a more interesting engineering problem: preserving font information, geometry, searchable text, and native drawing objects while retaining the original layout.',
        'Or take a geometry problem. A proposed algorithm might reconstruct a smooth shape from pixels, then fall apart when the image contains a clipped boundary or antialiased edge. I can inspect exactly where it fails, compare the underlying assumptions, and design a narrower test. The failed output is more useful to me than an abstract description of a failure mode.',
        'I have had similar experiences with performance work. A proposed optimization can be elegant and still lose to the baseline. Once there is an executable comparison, I can stop arguing from intuition and start measuring. Negative results narrow the search.'
      ],
      takeaway: 'A result that looks plausible is an invitation to test it, not evidence that the problem is solved.'
    },
    {
      heading: 'The hard work moved',
      paragraphs: [
        'AI reduces the cost of producing an initial approach. That means I can investigate more approaches than I used to. It also increases the number of plausible mistakes available to me.',
        'I spend more time checking whether something is correct, which assumptions were hidden in the implementation, and whether it still works outside the example that produced it. I look for boundary cases, compare alternatives, inspect intermediate states, and ask for measurements. When a claim sounds too clean, I want the test that could prove it wrong.',
        'The useful part of this workflow is the feedback loop between a thing I can run and the explanation I am building for it. The output gives me specific questions. Research changes the model. The revised model changes the implementation. I repeat that cycle until I can explain the behavior instead of merely recognizing it.'
      ]
    },
    {
      heading: 'There is an obvious trap',
      paragraphs: [
        'It is easy to mistake access to a solution for understanding that solution. AI can produce a polished explanation for incorrect code, and code that passes one demonstration can hide serious defects. I have to be deliberate about the point where I stop asking it to produce and start asking the implementation to prove itself.',
        'That does not mean every small script deserves a research paper. The amount of verification should match what the program is supposed to do and what happens if it fails. But for the work I care most about, a plausible first pass is nowhere near finished.',
        'AI also gets things wrong in ways that are difficult to notice without some domain knowledge. I still need the fundamentals. The difference is that I can encounter a concrete reason to learn them much earlier in the process.'
      ]
    },
    {
      heading: 'What I want from the finished result',
      paragraphs: [
        'My goal is still to build something professional, reliable, and useful. I am interested in the mechanism behind the result, not only the result itself. AI lets me reach an interesting failure faster, and sometimes it gives me a head start on a solution. The rest still involves reading, debugging, testing, rejecting approaches, and refining the design.',
        'I have become more comfortable beginning before I fully understand a problem, provided I do not confuse the first working version with the final one. I would rather have a rough model I can challenge than wait until I think I understand everything well enough to start.',
        'If I cannot explain why a version works, reproduce its behavior, or describe where it fails, I still consider it a prototype.'
      ]
    }
  ]
}
