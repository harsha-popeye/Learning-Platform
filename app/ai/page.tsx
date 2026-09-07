import { AiStudyChat } from '@/components/ai-study-chat';

export const dynamic = 'force-dynamic';

type AiPageProps = { searchParams: { course?: string; lesson?: string } };

export default function AiPage({ searchParams }: AiPageProps) {
  const courseId = Number(searchParams.course);
  const lessonId = Number(searchParams.lesson);
  return <AiStudyChat initialCourseId={Number.isInteger(courseId) ? courseId : undefined} initialLessonId={Number.isInteger(lessonId) ? lessonId : undefined} />;
}
