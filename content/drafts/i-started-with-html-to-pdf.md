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

## SVG was already on my mind

I've worked with vector artwork for years, especially packaging and labels. Most printers want a PDF. Unless a print company specifically asks for an Adobe Illustrator file, that's usually what I send. A properly exported PDF is still full of useful vector information. I can open it in Illustrator, select paths, move geometry around, and edit it much like the original artwork. I've been handing off files this way for a long time.

So the relationship between PDF and SVG wasn't something I discovered while working on Silica. I already knew the conversion could go in both directions. SVG artwork can become a vector PDF, and PDF drawing geometry can become SVG. They aren't identical formats, and things like fonts, effects, transparency, and page structure can complicate a conversion. But the shared language of paths, fills, strokes, clips, and transforms is familiar to me. I've always known there was a way to get from one to the other.

When Silica started producing native PDFs from HTML, that immediately suggested a practical HTML-to-SVG route. We could generate the PDF we already knew how to make, then translate its vector geometry into SVG. No need to invent another HTML layout engine first. The PDF was a perfectly reasonable intermediate format, and I had good reasons from graphic design to trust that direction.

We prototyped exactly that: HTML to Silica PDF, then PDF to SVG through either Hayro or MuPDF. Hayro interests me partly because it's written in Rust and also has a native PDF rasterizer. MuPDF gives us a mature, independent implementation to compare against. The current dual-backend SVG prototype is explicitly single-page, but it already produces real SVGs from Silica's output.

We put 94 existing Silica fixtures through the comparison rather than picking a few images that looked impressive. Rasterized through a shared SVG reader, 84 fixtures tied; MuPDF had lower pixel error in seven and Hayro in three. One nested-clipping case exposed a disagreement between SVG readers rather than an obvious winner. Hayro preserved some gradients as vectors where MuPDF introduced image content. That's the sort of thing I care about as a designer, because a file can look right and still be less useful when you open it to edit.

## Wait, this puts us in Satori territory

After seeing those SVGs, I started thinking about Vercel's Satori. It's a clever tool for turning JSX into SVG, often for things like Open Graph images. But it works within a particular subset of HTML and CSS. Silica is approaching the problem from a different direction: use an HTML rendering system to make a native PDF, then take that PDF's geometry into SVG.

That's a little absurd to me. I started with HTML-to-PDF and ended up with a credible route to the kind of output people use Satori for. And potentially a route with broader layout and styling support. I want to see whether we can beat Satori on fidelity, performance, or both. We haven't proved that comparison yet, and its supported inputs aren't identical to ours, but now it's an experiment we can actually run.

There's an important technical distinction between our current prototypes. The existing Node HTML-to-SVG route still generates its PDF through Silica's browser-observed capture, while the Rust and Blitz work demonstrates a separate browserless PDF path. Joining those paths so browserless HTML can flow all the way to SVG is still work to do. The result I'm excited about is the direction, and the SVG conversion itself is already real.

## Then I started thinking about SnapDOM

The next thought came almost immediately. If we can convert HTML into a PDF and convert that PDF into SVG, what's stopping us from rendering the PDF into an image? At that point, the same HTML could produce a PNG or JPEG as well.

I've worked with Juan Martín's SnapDOM, which captures a live DOM into SVG or raster images. It made me wonder whether Silica could eventually replace it for some of the work I've been using it for. We already have the geometry. If we can render the generated PDF extremely quickly, with good enough fidelity, that could be a serious alternative.

Hayro and MuPDF both give us ways to test the PDF-to-pixels route. In our 94-fixture comparison, Hayro's native PDF rasterizer had lower average pixel error than MuPDF's PDF rasterizer on that particular sample. That's a fidelity observation, not proof of a speed advantage. We still need to benchmark the entire HTML-to-image pipeline, including layout, PDF generation, rasterization, and encoding.

And there may be a faster way. Blitz already produces drawing commands. Maybe we can render those straight to a pixel buffer instead of serializing a PDF and parsing it again. That could skip work. Or maybe the PDF intermediate will turn out to be fast enough that the simpler pipeline wins. I don't know yet. I want to measure it.

SnapDOM has a real advantage for live pages: it can inspect the browser's computed styles and capture the state of an existing DOM. Reconstructing arbitrary live pages from HTML alone is not equivalent. Fonts, pseudo-elements, transforms, canvas, and other browser state make a fair comparison harder. But for HTML that Silica can render faithfully, the performance and fidelity contest is worth having.

## Maybe the PDF should be optional

This is where the project starts to look different to me. We could keep using PDF as an intermediate because we already have a working path through it. Or we could share the same layout and painting representation among a PDF backend, an SVG backend, and a raster backend.

PDF would remain useful for print and documents. SVG would be useful wherever I want vector graphics. PNG and JPEG would cover thumbnails, exports, and screenshots. If the native Rust or WASM path matures, we could do at least some of that without launching a browser.

The formats have different requirements, of course. Fonts, text editability, page boundaries, color handling, and raster effects don't survive every conversion unchanged. But I'm increasingly interested in an HTML rendering engine whose output isn't dictated by the file format I happened to start with.

## One engine, several kinds of work

I keep finding new uses when I follow that idea through. A design tool could take an HTML composition and export an editable-looking SVG or a press-ready PDF. A web application could generate a thumbnail or social card without launching a second browser. A server could produce documents and images from the same templates. A WASM build could run parts of that pipeline locally, while a native Rust build handles heavier batches.

The possibility of adding more formats is real because layout and paint are reusable. Each output still needs its own backend and a testable promise about what survives the conversion. For PDF I care about native text, vectors, and pages. For SVG I care about structure and how independent readers interpret it. For PNG and JPEG I care about the pixels, encoding cost, and predictable dimensions. Those are different contracts, but they can share most of the difficult work.

I originally approached this as an HTML-to-PDF conversion project. I'm now spending time thinking about whether the renderer itself is the more valuable piece. That's a much bigger engineering problem than I expected to be working on.

## What makes the prototype exciting to me

Silica is still a prototype, and I'm comfortable calling it that. But it's a really successful prototype in the areas we have exercised. It produces genuinely useful files. It has independent readers and browser references to test against. We have real numbers for specific fidelity and performance cases, and failures detailed enough to investigate rather than hand-wave away.

I'm excited by the doors that keep appearing as we solve one subsystem and discover it can be reused somewhere else. The next work is concrete: extend the browserless HTML coverage, harden SVG export, make the single-page limitation explicit until multi-page export is ready, compare a direct painter against PDF rasterization, and measure the complete path against Satori and SnapDOM on workloads each actually supports.

I expected HTML-to-PDF conversion to lead me deeper into PDF internals. It did. I didn't expect it to put me in the middle of building a general-purpose HTML rendering system, or to make PNG and SVG export feel like natural next experiments. I want to find out how far the shared renderer can go before the fidelity tests stop us.
