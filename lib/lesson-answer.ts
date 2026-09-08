const OUT_OF_SYLLABUS = 'NOT FOUND\nThe answer is not available in the provided study material.';

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'can', 'do', 'does', 'for', 'from', 'how', 'i', 'in', 'is', 'it', 'of', 'on', 'or', 'the', 'this', 'that', 'to', 'was', 'what', 'when', 'where', 'which', 'who', 'why', 'with', 'you', 'your',
]);

type QuestionAnswer = { question: string; answer: string };
type Candidate = { text: string; score: number };
export type StudyDocument = { id: number; title: string; content: string };

function tokens(value: string) {
  return Array.from(new Set(value.toLowerCase().match(/[a-z0-9]+/g)?.filter((token) => token.length > 2 && !STOP_WORDS.has(token)) ?? []));
}

function score(questionTokens: string[], text: string) {
  const textTokens = new Set(tokens(text));
  const matches = questionTokens.filter((token) => textTokens.has(token));
  return questionTokens.length ? matches.length / questionTokens.length : 0;
}

function isQuestion(paragraph: string) {
  const normalized = paragraph.replace(/\*\*/g, '').replace(/^#{1,6}\s*/, '').trim();
  const isPrompt = /^(?:discuss|explain|describe|analyse|analyze|critically\s+(?:analyse|analyze|discuss|examine)|compare|contrast|comment|write|bring\s+out|elaborate|trace|evaluate|examine)\b/i.test(normalized);
  return normalized.length < 600 && ((/^\d+\s*[.)]\s+/.test(normalized)) || normalized.endsWith('?') || isPrompt);
}

function isSectionHeading(paragraph: string) {
  return /^(?:#{1,6}\s*)?(?:[IVXLC]+|PART\s+\d+)\.?\s/i.test(paragraph.trim());
}

function cleanQuestion(question: string) {
  return question.replace(/^#{1,6}\s*/, '').replace(/^\d+\s*[.)]\s*/, '').trim();
}

function questionAnswers(content: string) {
  // Notes may separate a question and answer with either blank lines or a
  // single line break, so retrieve them line-by-line instead of assuming one
  // Markdown format.
  const paragraphs = content.split(/\r?\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const pairs: QuestionAnswer[] = [];
  let question = '';
  let answer: string[] = [];

  const savePair = () => {
    if (question && answer.length) pairs.push({ question, answer: answer.join('\n\n') });
  };

  for (const paragraph of paragraphs) {
    if (isSectionHeading(paragraph)) {
      savePair();
      question = '';
      answer = [];
    } else if (isQuestion(paragraph)) {
      savePair();
      question = cleanQuestion(paragraph);
      answer = [];
    } else if (question) {
      answer.push(paragraph);
    }
  }
  savePair();
  return pairs;
}

function authorFromTitle(documentName: string, questionTokens: string[]) {
  const asksForAuthor = questionTokens.some((token) => ['author', 'writer', 'wrote', 'written', 'playwright'].includes(token));
  if (!asksForAuthor) return undefined;
  const author = documentName.split(/\s+[—–-]\s+/).at(-1)?.trim();
  return author && author !== documentName ? author : undefined;
}

function bestQuestionAnswer(content: string, questionTokens: string[]) {
  const ranked = questionAnswers(content)
    .map((pair) => ({ pair, questionScore: score(questionTokens, pair.question), answerScore: score(questionTokens, pair.answer) }))
    .sort((first, second) => (second.questionScore + second.answerScore) - (first.questionScore + first.answerScore));
  const best = ranked[0];
  // Prefer the answer that belongs to a matching document question. When the
  // wording only partly overlaps, require matching evidence in its answer too.
  const isSupported = best && (best.questionScore > 0.5 || (best.questionScore >= 0.5 && best.answerScore >= 0.25));
  return isSupported ? best.pair.answer : undefined;
}

function focusedAnswer(answer: string, questionTokens: string[]) {
  const sentences = answer
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  if (sentences.length <= 3) return answer;

  const relevant = sentences
    .map((text, index) => ({ text, index, score: score(questionTokens, text) }))
    .filter((candidate) => candidate.score > 0)
    .sort((first, second) => second.score - first.score || first.index - second.index)
    .slice(0, 3)
    .sort((first, second) => first.index - second.index)
    .map((candidate) => candidate.text);

  // A matching document answer may use different wording. In that case, use
  // its opening explanation rather than returning unrelated text elsewhere.
  return (relevant.length ? relevant : sentences.slice(0, 3)).join(' ');
}

function sourceSentences(content: string) {
  const answerOnly = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !/^#{1,6}\s/.test(line) && !isSectionHeading(line) && !isQuestion(line))
    .join(' ');
  return answerOnly
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 20 && !isQuestion(sentence));
}

function bestRelevantSentence(content: string, questionTokens: string[]) {
  const sentences = sourceSentences(content);
  const ranked: Candidate[] = sentences
    .map((text) => ({ text, score: score(questionTokens, text) }))
    .sort((first, second) => second.score - first.score);
  const best = ranked[0];
  return best && best.score >= 0.5 ? best.text : undefined;
}

function comparisonEntities(question: string) {
  const ignored = new Set(['Compare', 'What', 'Which', 'How', 'Who', 'Why', 'Explain', 'Discuss', 'Analyse', 'Analyze', 'Describe', 'Role', 'Approach', 'Social', 'Change']);
  return Array.from(new Set(Array.from(question.matchAll(/\b[A-Z][a-z]+\b/g), (match) => match[0])
    .filter((entity) => !ignored.has(entity))));
}

function comparisonAnswer(content: string, question: string, questionTokens: string[]) {
  if (!/\b(compare|comparison|contrast|difference|different|similar|similarity)\b/i.test(question)) return undefined;
  const entities = comparisonEntities(question);
  if (entities.length < 2) return undefined;

  const sentences = sourceSentences(content);
  const parts: string[] = [];
  const missing: string[] = [];
  for (const entity of entities) {
    const entityTokens = tokens(entity);
    const entitySentences = sentences
      .filter((sentence) => sentence.toLowerCase().includes(entity.toLowerCase()))
      .map((text) => ({ text, score: score(Array.from(new Set([...entityTokens, ...questionTokens])), text) }))
      .sort((first, second) => second.score - first.score)
      .slice(0, 2)
      .map((candidate) => candidate.text);
    if (entitySentences.length) parts.push(`${entity}: ${entitySentences.join(' ')}`);
    else missing.push(entity);
  }

  if (!parts.length) return undefined;
  const contrast = sentences.find((sentence) => entities.every((entity) => sentence.toLowerCase().includes(entity.toLowerCase())) && /\b(contrast|whereas|while)\b/i.test(sentence));
  if (contrast) parts.push(`Main contrast: ${contrast}`);
  // A partial comparison is completed by the cross-chapter retriever instead
  // of incorrectly claiming the other subject is absent from all material.
  if (missing.length) return undefined;
  return parts.join('\n\n');
}

/**
 * Retrieves an answer only from the supplied lesson document. It first uses
 * the document's question-and-answer structure, then falls back to one closely
 * matching source sentence. No external knowledge or model-generated claims
 * are added.
 */
export function answerFromLesson(noteId: number, documentName: string, content: string, question: string) {
  // Keep the note id in the function contract so every response is tied to the
  // selected lesson, even though the document itself contains the retrieval data.
  void noteId;
  const questionTokens = tokens(question);
  if (!questionTokens.length) return OUT_OF_SYLLABUS;

  const comparison = comparisonAnswer(content, question, questionTokens);
  const author = authorFromTitle(documentName, questionTokens);
  const matchedDocumentAnswer = bestQuestionAnswer(content, questionTokens);
  const answer = comparison
    ?? author
    ?? (matchedDocumentAnswer ? focusedAnswer(matchedDocumentAnswer, questionTokens) : undefined)
    ?? bestRelevantSentence(content, questionTokens);
  if (!answer) return OUT_OF_SYLLABUS;

  const shortened = answer.length > 1800 ? `${answer.slice(0, 1800).trimEnd()}…` : answer;
  return shortened;
}

function documentScore(document: StudyDocument, questionTokens: string[], preferredNoteId?: number) {
  const titleScore = score(questionTokens, document.title);
  const contentScore = score(questionTokens, document.content);
  const preferredBonus = document.id === preferredNoteId ? 0.1 : 0;
  return (titleScore * 2) + contentScore + preferredBonus;
}

/**
 * Searches every available study document before reporting a missing answer.
 * A selected chapter is only a tie-breaker; it never limits the search scope.
 */
export function answerFromDocuments(documents: StudyDocument[], question: string, preferredNoteId?: number) {
  const questionTokens = tokens(question);
  if (!questionTokens.length) return OUT_OF_SYLLABUS;

  const rankedDocuments = documents
    .map((document) => ({ document, score: documentScore(document, questionTokens, preferredNoteId) }))
    .filter((candidate) => candidate.score >= 0.5)
    .sort((first, second) => second.score - first.score);
  const answers = rankedDocuments
    .map(({ document }) => ({ document, answer: answerFromLesson(document.id, document.title, document.content, question) }))
    .filter((candidate) => candidate.answer !== OUT_OF_SYLLABUS);
  if (!answers.length) return OUT_OF_SYLLABUS;

  const isComparison = /\b(compare|comparison|contrast|difference|different|similar|similarity)\b/i.test(question);
  if (!isComparison) return answers[0].answer;

  // Comparison questions may need evidence from different chapters. Keep the
  // result compact and label chapters only when more than one contributes.
  const uniqueAnswers = answers.filter((candidate, index, all) => all.findIndex((item) => item.answer === candidate.answer) === index).slice(0, 3);
  if (uniqueAnswers.length === 1) return uniqueAnswers[0].answer;
  return uniqueAnswers.map(({ document, answer }) => `${document.title}:\n${answer}`).join('\n\n');
}

export { OUT_OF_SYLLABUS };
