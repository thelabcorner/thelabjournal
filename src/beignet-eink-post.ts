import type { Entry } from './data'

/** A personal research candidate inspired by a beignet image-fitting demo. */
export const beignetEinkPost: Entry = {
  slug: 'neural-fields-and-e-ink',
  title: 'A neural field made me think about E Ink',
  shortTitle: 'Neural fields and E Ink',
  contextLabel: 'Research note / 002',
  topic: 'Research',
  stage: 'Concept',
  type: 'Journal research note',
  date: '2026-10-21',
  minutes: 4,
  issue: 'R–002',
  figure: 'signals',
  summary: 'An image-fitting demo reminded me of an E Ink refresh, and now I want to know whether multiresolution, physics-aware optimization could help design electrophoretic display waveforms.',
  keywords: ['E Ink', 'Neural fields', 'Fourier features', 'Electrophoretic displays', 'Optimization', 'Research candidates'],
  sections: [
    {
      heading: 'A weird connection while scrolling',
      paragraphs: [
        'I came across a post by Brandon Zhao introducing beignet, a neural field architecture. The teaser showed an image of a pastry being reconstructed while a loss curve dropped. Watching the picture acquire structure and sharpness immediately reminded me of an E Ink display refreshing. I have no idea why my brain made that connection so quickly, but now I cannot unsee it.',
        'The resemblance is mostly visual. The beignet demo shows a numerical representation being fitted to an image; an electrophoretic display changes its appearance by moving charged pigment particles under an electric field. Still, the resemblance got me wondering whether there might be a useful connection in the mathematics of how an image reaches a desired state.'
      ]
    },
    {
      heading: 'Why beignet caught my attention',
      paragraphs: [
        'Zhao and colleagues built beignet around a trainable multiresolution Fourier feature pyramid. Their paper focuses on physics-informed neural networks for partial differential equations, including efficient spatial derivatives and control over the representation bandlimit. The image-fitting teaser is a nice way to see that representation learning at work.',
        'Electrophoretic display updates are a control problem with physical constraints. Voltage pulses change particle distributions, and the visible result depends on more than the requested final pixel value. The current optical state, previous transitions, material response, and driving waveform can all matter. That makes me curious about predicting the display response rather than treating each update as a simple instruction to replace one image with another.'
      ]
    },
    {
      heading: 'The research candidate',
      paragraphs: [
        'I would like to investigate a physics-aware model that predicts an E Ink panel’s optical response to candidate drive waveforms. A multiresolution representation could then separate large-scale image error from edge and fine-detail error while a controller searches for an update sequence. The idea is to borrow the representation and optimization principles from beignet, with electrophoretic transport and measurable display behavior providing the actual physical model.',
        'There is an important implementation question here: the optimized solution has to translate into voltage waveforms that real display hardware can produce. Spatially coarse and fine error terms do not automatically imply a coarse-to-fine sequence of physical refreshes. I would want the model to account for state history, residual ghosting, nearby-pixel interactions where relevant, and the cost of extra driving pulses.'
      ]
    },
    {
      heading: 'What I would test first',
      paragraphs: [
        'I would start small: one panel, repeatable image transitions, controlled lighting, and recorded optical response over time. First characterize how the panel reacts to its existing update modes. Then compare a conventional waveform baseline against an experimentally calibrated predictive model, and finally against the same model with a multiresolution error objective. That would isolate whether the Fourier-pyramid idea adds anything beyond better physical calibration.',
        'The measurements I would care about are final image error, ghosting over repeated transitions, time to a readable image, visible flicker, and electrical energy per update. I would include solid fills, sharp edges, text, and halftone patterns. If a proposed method only makes an animation look smoother while requiring more flashes or energy, that is useful to know too.',
        'For now this is a research candidate from a moment of curiosity, not an implemented display controller. The first question is whether a learned, physically constrained response model can predict the actual transitions well enough to make waveform optimization worthwhile. I kind of love that a pastry reconstruction on X sent me down this path.',
        'Source: Brandon Zhao et al., “Fourier Feature Pyramids for Physics-Informed Neural Networks” (2026), arXiv:2605.24278. https://arxiv.org/abs/2605.24278'
      ]
    }
  ]
}