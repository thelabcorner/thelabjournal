---
title: "I started with HTML to PDF"
date: 2026-10-12
author: "Jackson Cummings"
status: draft
slug: i-started-with-html-to-pdf
category: "Essays"
summary: "Silica began as a native HTML-to-PDF experiment. Rust and Blitz opened a browserless path, and now SVG, images, and DOM capture look like parts of the same rendering problem."
tags: ["Silica", "HTML to PDF", "Rust", "Blitz", "SVG", "Satori", "SnapDOM", "Rendering engines"]
---

# I started with HTML to PDF

Silica began as a native HTML-to-PDF experiment. Rust and Blitz opened a browserless path, and now SVG, images, and DOM capture look like parts of the same rendering problem.

## The PDF problem was already big enough

I started working on Silica because I wanted a better way to turn HTML into a native PDF. That sounds like a fairly specific problem until you start trying to reproduce what a browser actually draws. Layout, fonts, clipping, transforms, gradients, paint order, pagination, and image decoding all become your problem. If you get one of them slightly wrong, a document can look fine in one example and fall apart in the next.

I also care about what is inside the file. Flattening a page into a screenshot and putting it in a PDF container is easy compared with preserving real text and vector geometry. You can make something that looks correct at a glance and discover that it has no useful structure. I wanted the output to remain a document.

We had a Chromium-based route, and Chromium is an excellent reference for how HTML should render. But shipping or launching a browser to produce a file comes with a lot of machinery. I kept wondering how much of it we actually needed for the work Silica was doing.

## We found a way to remove the browser

The experiment that changed my view of the project was using Rust and Blitz to do the layout and painting work without running Chromium. Blitz already assembles serious pieces of browser technology: HTML parsing, Stylo for CSS, Taffy for layout, Parley for text, and a paint layer that produces drawing commands. That gave us a foundation to build on rather than another attempt to reproduce CSS from scratch.

We connected that work to Silica's native PDF output and built a browserless path, including a WebAssembly route. On the restricted fixtures we could prove, it produced native vector PDFs that matched the reference pixels exactly. In one warm clipping benchmark, the Blitz path was about 4.2 times faster than the reused Chromium baseline. Those are fixture-specific measurements, but seeing exact output without a browser was enough to make me rethink the architecture.

There's still a large gap between that result and replacing Chromium for arbitrary HTML. Complex text and fonts, the full CSS surface, images, effects, and pagination have to survive the same standard of testing. I'm not treating a clean box-and-clip benchmark as proof that we have built a complete browser. Still, we proved that a real portion of this problem can be solved without one.

## Then SVG became a serious possibility

Once we could produce a good native PDF, another question started bothering me. Could we turn the same HTML into SVG? We already had the layout and drawing information. It seemed wasteful to treat the PDF as an endpoint when so much of the work needed for vector export had already happened.

We prototyped an HTML-to-SVG API that first emits a Silica PDF and then converts it through either Hayro or MuPDF. Hayro is especially interesting because it is written in Rust and offers both SVG conversion and native raster rendering. MuPDF gives us a different, mature implementation to compare against. The current dual-backend prototype is deliberately limited, including explicit single-page handling, but it already produces actual SVGs from Silica's PDF output.

We put 94 existing Silica fixtures through the comparison instead of selecting a few screenshots that looked impressive. In a shared SVG rasterizer, 84 fixtures tied; MuPDF had lower pixel error in seven and Hayro in three. One nested-clipping case exposed a disagreement between SVG readers rather than a simple broken-exporter verdict. Hayro also preserved some gradients as vectors where MuPDF introduced image content. It's exactly the sort of detail that would disappear if we judged the experiment from one demo.

I like that this leaves us with more questions than a single winner. SVG can contain paths, clips, gradients, embedded images, and glyph outlines. Glyph outlines look right but aren't editable text. Different consumers interpret difficult SVG structures differently. A useful exporter needs to care about those differences.

## I wasn't expecting to think about Satori

Vercel's Satori is one of the tools I've used when I need to generate SVG-based graphics from a component. It is particularly useful for things like Open Graph images. It also has a deliberately narrower contract: static JSX, a subset of HTML and CSS, and a layout system based on Yoga. It doesn't promise to reproduce everything a browser would render.

Silica could eventually occupy a different part of that space. A renderer with broader HTML and CSS understanding could accept real document markup and produce vector output without forcing everything through Satori's supported subset. We may even be able to make it faster or more faithful on particular classes of documents. That's a hypothesis I want to benchmark, not a victory I'm claiming over Satori.

The current SVG prototype passes through PDF and, in its existing node route, uses Silica's browser-observed capture. The separate Blitz work is what makes a future browserless path plausible. Combining them correctly is unfinished work. The more interesting long-term design may be to take one validated display list and send it straight to PDF or SVG, with no unnecessary conversion between formats.

## And then there's SnapDOM

I've also spent time working around Juan Martín's SnapDOM. It solves a related problem from the other direction: take a live browser DOM, capture its appearance, and export SVG or raster images. Its browser access is an advantage when the page depends on computed styles, pseudo-elements, fonts, and a live application state. I've investigated parts of its capture performance myself, particularly the cost of collecting and processing styles.

Now I keep wondering whether Silica could handle some of the same jobs. If Silica can turn the HTML into a faithful drawing representation and render it to pixels quickly enough, we might have an alternative for DOM-to-image capture. We could rasterize the generated PDF through Hayro or MuPDF, or avoid the PDF round trip and render Blitz's drawing commands directly.

Replacing SnapDOM outright would require much more than a fast PDF renderer. Capturing an already-running application's exact visual state is different from laying out a fresh HTML string. We would need to preserve browser-computed information where necessary, and compare real pages containing fonts, pseudo-elements, shadows, transforms, canvas content, and complicated clipping. Then we would need to measure total capture time, including the style work and image encoding, against SnapDOM on the same input.

I still find the possibility ridiculous in a good way. A PDF experiment has given me a reason to revisit a DOM screenshot problem from a completely different angle.

## Maybe the PDF should be optional

I can see at least two practical routes to PNG and JPEG. The first is already close to hand: generate the native PDF and use a fast renderer to turn it into pixels. We have been measuring Hayro and MuPDF for exactly this reason. Hayro's native PDF rasterizer had lower average pixel error than MuPDF's PDF rasterizer across the 94-fixture comparison we ran, though that isn't yet a portable speed or quality guarantee.

The second route is more appealing architecturally. If Blitz has already produced the positioned drawing commands, why serialize them into PDF only to parse them again? A direct raster backend could paint the same scene into a pixel buffer. That should remove an encode/decode step, although only an end-to-end benchmark will tell us whether it is faster once fonts, images, compositing, and memory allocation are included.

With that kind of separation, PDF becomes one output choice. SVG preserves vector structure for import or inspection. PNG preserves lossless pixels and transparency. JPEG is useful when file size matters more than exact pixels. The output format can be chosen after the expensive layout work, instead of deciding the entire rendering architecture up front.

## One engine, several kinds of work

I keep finding new uses when I follow that idea through. A design tool could take an HTML composition and export an editable-looking SVG or a press-ready PDF. A web application could generate a thumbnail or social card without launching a second browser. A server could produce documents and images from the same templates. A WASM build could run parts of that pipeline locally, while a native Rust build handles heavier batches.

The possibility of adding more formats is real because layout and paint are reusable. Each output still needs its own backend and a testable promise about what survives the conversion. For PDF I care about native text, vectors, and pages. For SVG I care about structure and how independent readers interpret it. For PNG and JPEG I care about the pixels, encoding cost, and predictable dimensions. Those are different contracts, but they can share most of the difficult work.

I originally approached this as an HTML-to-PDF conversion project. I'm now spending time thinking about whether the renderer itself is the more valuable piece. That's a much bigger engineering problem than I expected to be working on.

## What makes the prototype exciting to me

Silica is still a prototype, and I'm comfortable calling it that. But it's a really successful prototype in the areas we have exercised. It produces genuinely useful files. It has independent readers and browser references to test against. We have real numbers for specific fidelity and performance cases, and failures detailed enough to investigate rather than hand-wave away.

I'm excited by the doors that keep appearing as we solve one subsystem and discover it can be reused somewhere else. The next work is concrete: extend the browserless HTML coverage, harden SVG export, make the single-page limitation explicit until multi-page export is ready, compare a direct painter against PDF rasterization, and measure the complete path against Satori and SnapDOM on workloads each actually supports.

I expected HTML-to-PDF conversion to lead me deeper into PDF internals. It did. I didn't expect it to put me in the middle of building a general-purpose HTML rendering system, or to make PNG and SVG export feel like natural next experiments. I want to find out how far the shared renderer can go before the fidelity tests stop us.
