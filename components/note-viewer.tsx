'use client';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

function formatQuestionAndAnswerNote(content: string) {
  const lines = content.split(/\r?\n/).filter(Boolean);

  if (lines[0]?.startsWith('# ')) lines.shift();

  return lines
    .map((line, index) => {
      const nextLine = lines[index + 1] ?? '';
      const numberedQuestion = /^\d+\s*[.)]\s*/.test(line);
      const isQuestion = numberedQuestion && (line.includes('?') || line.includes('Ans:') || nextLine.startsWith('Ans:'));
      const inlineAnswerIndex = line.indexOf('Ans:');

      if (/^I{1,3}\s*\.?\s*Answer/i.test(line)) return `## ${line}`;

      if (isQuestion && inlineAnswerIndex >= 0) {
        const question = line.slice(0, inlineAnswerIndex).trim();
        const answer = line.slice(inlineAnswerIndex + 4).trim();
        return `**Question: ${question}**\n\n**Answer:** ${answer}`;
      }

      if (isQuestion) return `**Question: ${line}**`;
      if (line.startsWith('Ans:')) return `**Answer:** ${line.slice(4).trim()}`;

      return line;
    })
    .join('\n\n');
}

export function NoteViewer({ title, content }: { title: string; content: string }) {
  const [progress, setProgress] = useState(0);
  const formattedContent = formatQuestionAndAnswerNote(content);

  useEffect(() => {
    const update = () => {
      const top = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, Math.round((top / max) * 100)) : 0);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return <><div className="fixed inset-x-0 top-0 z-30 h-0.5 bg-slate-200"><div className="h-full bg-primary" style={{ width: `${progress}%` }} /></div><article className="prose prose-slate mx-auto max-w-3xl px-4 pb-8 pt-6 prose-p:text-lg prose-p:leading-8 prose-h2:mt-10 prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-3"><h1 className="mb-8 text-3xl font-bold tracking-tight text-slate-900">{title}</h1><ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{formattedContent}</ReactMarkdown></article></>;
}
