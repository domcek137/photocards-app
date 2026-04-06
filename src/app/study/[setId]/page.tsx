import Link from "next/link";
import { notFound } from "next/navigation";
import StudySession from "@/components/study/StudySession";
import { getSetById } from "@/lib/storage";

type StudyPageProps = {
  params: Promise<{ setId: string }>;
};

export default async function StudyPage({ params }: StudyPageProps) {
  const { setId } = await params;
  const setItem = await getSetById(setId);

  if (!setItem) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <Link href={`/sets/${setItem.id}`} className="text-sm font-medium text-cyan-700">
        Back to set
      </Link>

      <header className="mb-6 mt-3">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Study: {setItem.name}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Front side shows image, flip to reveal text on the back.
        </p>
      </header>

      <StudySession key={`${setItem.id}-${setItem.cards.length}`} cards={setItem.cards} />
    </main>
  );
}
