import type { Entry } from './data'

// Generated from content/drafts/i-started-with-html-to-pdf.md by scripts/sync-silica-post.mjs. Do not edit.
export const silicaDoorsPost: Entry = {
  "slug": "i-started-with-html-to-pdf",
  "title": "I started with HTML to PDF",
  "shortTitle": "Beyond PDF",
  "contextLabel": "Journal / 004",
  "topic": "Essays",
  "stage": "Editorial draft",
  "type": "Personal essay",
  "date": "2026-10-12",
  "minutes": 10,
  "issue": "J–004",
  "figure": "pdf",
  "summary": "Silica started as an HTML-to-PDF experiment. Now I think it could become an entire HTML rendering engine, and maybe replace tools I never intended to compete with.",
  "keywords": [
    "Silica",
    "HTML to PDF",
    "Rust",
    "Blitz",
    "SVG",
    "Satori",
    "SnapDOM",
    "Rendering engines"
  ],
  "intro": [
    "I've been working on an HTML-to-PDF conversion system called Silica, and the number of doors this one project has opened is getting kind of ridiculous.",
    "It started with a fairly specific goal. I wanted to generate proper PDFs from HTML. Native text, vector graphics, accurate layout, all of it. A PDF I could open in Illustrator and do something with, rather than a screenshot stuffed into a PDF container.",
    "That alone is an enormous problem. A browser does so much work to turn HTML and CSS into pixels that you don't really appreciate until you start pulling it apart. Fonts, layout, clipping, gradients, transforms, paint order, all the weird little interactions between them. We spent a lot of time trying to get those things right.",
    "The funny thing is that Silica is already turning into something much bigger than the thing I set out to build."
  ],
  "sections": [
    {
      "heading": "Getting rid of the browser",
      "paragraphs": [
        "One of the developments I'm most excited about is that we've found a way to generate native PDFs without running a browser.",
        "That sounds almost contradictory when the input is HTML. My first instinct was to lean on Chromium, because it's the obvious reference for what a page is supposed to look like. But carrying a browser around just to generate a PDF is a lot of machinery. I kept thinking there had to be a better way.",
        "We ended up experimenting with Rust and Blitz. Blitz brings together existing work on parsing, CSS, layout, and text, including Stylo, Taffy, and Parley. Instead of rebuilding an entire browser engine from nothing, we could use those components to interpret the document and feed its drawing information into Silica's PDF machinery.",
        "And it fucking works.",
        "One of our restricted clipping test sets reproduced the reference pixels exactly. In a warm benchmark on that path, we measured roughly 4.2 times the speed of a reused Chromium baseline. I know that doesn't mean every HTML page in existence works perfectly. What excites me is that there's a functioning browserless path at all, with native geometry coming out the other end. We also have a route into WebAssembly, which makes the whole idea even more interesting.",
        "It's still a prototype. A really successful prototype, in my opinion. I can see the thing working, inspect what it produces, and start imagining where else the same work could take us."
      ]
    },
    {
      "heading": "I've been working with PDF vectors for years",
      "paragraphs": [
        "The SVG direction felt natural to me because of my background in graphic design.",
        "I do a lot of vector artwork, especially labels and packaging. When I send artwork to a print company, the deliverable is usually a PDF. Occasionally they specifically ask for an Adobe Illustrator file, but PDFs are the normal handoff. And those aren't just flattened pictures. I can open a properly generated PDF in Illustrator, grab the paths, manipulate shapes, and work with much of the artwork as vectors.",
        "I've known for years that PDFs and SVGs have a close relationship. It goes both ways. You can turn SVG graphics into a vector PDF, and you can take the drawing geometry in a PDF and turn it back into SVG. Their internals and capabilities aren't identical, but they share so many of the same graphical ideas: paths, strokes, fills, curves, clipping, transforms. Working with one has always made the other feel familiar.",
        "So when Silica started producing native PDF geometry, HTML-to-SVG was already an obvious possibility in my head. We didn't have to figure out how to lay out HTML a second time. We could take the PDF we already knew how to produce and convert that geometry into SVG.",
        "That's what we built.",
        "We have a prototype that takes HTML, produces a Silica PDF, and converts the PDF into SVG using either Hayro or MuPDF. We even compared both converters on 94 Silica fixtures. A lot of the outputs agreed, and the differences were fascinating. There were cases where one preserved vector gradients while the other introduced raster content, plus clipping cases that behaved differently depending on the SVG reader.",
        "As somebody who actually edits vector files, that stuff is interesting to me. An image looking correct is one thing. Having usable geometry on the other side is another. It's the same reason I cared about native PDFs in the first place.",
        "And once we had HTML-to-SVG working, I started thinking about Satori."
      ]
    },
    {
      "heading": "We may have accidentally built a Satori competitor",
      "paragraphs": [
        "Vercel's Satori is a really clever library. You give it JSX, and it generates SVG. It's used for things like social images, and it makes that job remarkably convenient.",
        "But now I'm looking at Silica and thinking: hang on, we're already doing HTML to PDF to SVG. We have an HTML layout system, native vector geometry, and a route to SVG output. Why couldn't this replace Satori for a lot of the same jobs?",
        "Actually, I think it has the potential to be better.",
        "Satori supports a particular subset of HTML and CSS. Silica's ambitions are closer to rendering real HTML documents, with the possibility of broader styling and more complex layouts. If we get the browserless Blitz route and the SVG route working together, I can imagine an incredibly capable HTML-to-SVG engine that doesn't need Chromium at all.",
        "That is a wild place to end up from wanting a better PDF converter.",
        "I haven't made a head-to-head performance claim here. I have something more interesting to me right now: a working prototype and a very strong hunch about where it can go. It feels like we found a side door into a problem I'd previously associated with a completely different piece of software.",
        "And then my brain went straight to SnapDOM."
      ]
    },
    {
      "heading": "Could this replace SnapDOM too?",
      "paragraphs": [
        "I've worked with Juan Martín's SnapDOM, which captures the DOM and turns it into SVG or raster images. It's a useful library, and I've spent time digging into the performance cost of gathering styles and capturing complex pages.",
        "Now consider what Silica is doing.",
        "If I can take HTML and turn it into a native PDF, and I can take that PDF and turn it into SVG, why stop there? PDFs can be rendered into images. We could take that exact same output and produce a PNG or JPEG.",
        "Suddenly the project isn't just competing with HTML-to-PDF tools or potentially with Satori. It might be able to do work I've been using SnapDOM for, too.",
        "And I think there's a real possibility it could do that work faster and with better fidelity.",
        "Hayro and MuPDF already give us ways to render PDF geometry. We're investigating their fidelity and performance. If we can generate a PDF extremely quickly and rasterize it extremely quickly, the whole HTML-to-image pipeline becomes very interesting. That's game time, as far as I'm concerned.",
        "There's another possibility I find even more exciting. Why render the PDF at all?",
        "Blitz has already done the layout and produced drawing commands. Maybe we can paint those commands directly to a pixel buffer. We wouldn't need to write a PDF and read it back just to get pixels. That might be the faster route. Or maybe the PDF pipeline is already fast enough to win. Either way, we have multiple routes worth pursuing.",
        "SnapDOM captures a live browser DOM, which brings some different concerns about computed styles and page state. I know those details matter. They're engineering problems I want to attack, not reasons to stop imagining the outcome.",
        "I keep looking at all of this and thinking how absurd it would be if the PDF engine I started building ended up becoming my preferred replacement for both Satori and SnapDOM."
      ]
    },
    {
      "heading": "What if Silica could output basically anything?",
      "paragraphs": [
        "This is the part I keep coming back to.",
        "Imagine feeding Silica an HTML document and choosing what you want back.",
        "A PDF for a print shop. An SVG to open in Illustrator. A PNG with transparency. A JPEG for a thumbnail. Maybe other formats later. The same HTML, the same layout, the same underlying drawing information.",
        "That's fucking crazy to me.",
        "I'm used to reaching for different tools for different jobs. One system to capture a DOM node as an image. Another to generate SVG. Another to print HTML to PDF. They all overlap in some way because they're solving parts of the same underlying rendering problem.",
        "Silica could bring those jobs together.",
        "The PDF-to-SVG route we have now is a great demonstration of that idea. Longer term, I can see a shared representation of the laid-out page, with separate backends for PDF, SVG, and raster images. Rust makes the native side appealing. WebAssembly opens another set of deployment options. And Blitz gives us a way to do the HTML layout work without hauling an entire browser into every export.",
        "For a project like PresGen, where I constantly care about graphics, documents, screenshots, and editable output, the idea of owning that entire pipeline is especially appealing. I wouldn't have to treat every export format as an unrelated engineering problem.",
        "I know there will be frustrating edge cases. There always are. But that has never been the part that makes me lose interest. I like chasing the cases where the geometry breaks, where text doesn't shape correctly, where one renderer disagrees with another. Every one of those failures gives me something specific to figure out."
      ]
    },
    {
      "heading": "I love when a project does this",
      "paragraphs": [
        "What I find so exciting about Silica is how one solution keeps suggesting the next one.",
        "First I wanted native PDFs. Then we found a way to eliminate the browser with Rust and Blitz. My experience with vector artwork made PDF-to-SVG an obvious extension, so we built it. That made me think seriously about Satori. Then it occurred to me that fast PDF rasterization, or direct painting from Blitz, could put us in SnapDOM territory. And now I'm thinking about Silica as an all-around HTML rendering engine.",
        "All of that grew out of one conversion problem.",
        "This is also exactly what I was talking about in my last journal entry, about how AI has changed the problems I'm able to solve. I can follow an idea much further than I used to. The work still gets complicated, and I still have to understand what's happening, but the amount of experimentation I can push through is ridiculous compared with what used to be practical for me.",
        "I feel genuinely excited about where this one is going. Silica already works well enough to make me proud of it, and I can see several more directions I want to try. I want to get the browserless PDF and SVG paths working together, race the image-rendering approaches against each other, and find out whether my intuition about Satori and SnapDOM is right.",
        "Imagine if this thing ends up being able to take HTML and spit out practically whatever file format I want.",
        "I started with a PDF converter. Now I really want to build that."
      ]
    }
  ]
}
