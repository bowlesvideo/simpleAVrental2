'use client'

import { Suspense } from 'react'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

// Only import the languages you need
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript'
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript'
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash'
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json'
import markdown from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown'

// Register only the languages you need
SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('bash', bash)
SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('markdown', markdown)

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