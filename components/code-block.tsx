'use client'

import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import type { PropsWithChildren } from 'react'

// Only import the languages you need
import jsx from 'react-syntax-highlighter/dist/cjs/languages/prism/jsx'
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript'
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript'
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash'
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json'

// Register only the languages you need
SyntaxHighlighter.registerLanguage('jsx', jsx)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('bash', bash)
SyntaxHighlighter.registerLanguage('json', json)

interface Props {
  language: string
}

export default function CodeBlock({ language, children }: PropsWithChildren<Props>) {
  return (
    <div className="my-4">
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        PreTag="div"
        className="rounded-lg"
      >
        {String(children).trim()}
      </SyntaxHighlighter>
    </div>
  )
} 