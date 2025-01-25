'use client'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import type { PropsWithChildren } from 'react'

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