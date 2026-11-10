import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import './journal-markdown.css'

const remarkPlugins = [remarkGfm, remarkMath]
const rehypePlugins = [rehypeKatex]

/**
 * Render editorial Markdown as semantic React elements, never injected HTML.
 * Raw HTML is deliberately disabled; Markdown is the content authority.
 * This reader is lazy-loaded only for entries with Markdown-backed sections.
 */
export function JournalMarkdown({ markdown }: { markdown: string }) {
  return (
    <div className="journal-markdown">
      <Markdown
        skipHtml
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={{
          table({ children }) {
            return <div className="journal-markdown-table-scroll"><table>{children}</table></div>
          },
        }}
      >
        {markdown}
      </Markdown>
    </div>
  )
}
