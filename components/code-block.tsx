'use client'

import { Suspense } from 'react'
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

interface CodeBlockProps {
  language: string
  children: string
}

function CodeBlockContent({ language, children }: CodeBlockProps) {
  return (
    <SyntaxHighlighter
      language={language}
      style={oneDark}
      PreTag="div"
      className="rounded-lg"
    >
      {children.trim()}
    </SyntaxHighlighter>
  )
}

export function CodeBlock(props: CodeBlockProps) {
  return (
    <div className="my-4">
      <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-lg h-24" />}>
        <CodeBlockContent {...props} />
      </Suspense>
    </div>
  )
} 