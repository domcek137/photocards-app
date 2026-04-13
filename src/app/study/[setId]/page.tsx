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
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <div>
        <StudySession key={`${setItem.id}-${setItem.cards.length}`} cards={setItem.cards} />
      </div>
    </main>
  );
}
