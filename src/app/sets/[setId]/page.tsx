import Link from "next/link";
import { notFound } from "next/navigation";
import AddCardForm from "@/components/sets/AddCardForm";
import CardGallery from "@/components/sets/CardGallery";
import SetRenameButton from "@/components/sets/SetRenameButton";
import SetActions from "@/components/sets/SetActions";
import { getSetById } from "@/lib/storage";

type SetDetailPageProps = {
  params: Promise<{ setId: string }>;
};

export default async function SetDetailPage({ params }: SetDetailPageProps) {
  const { setId } = await params;
  const setItem = await getSetById(setId);

  if (!setItem) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <header className="mb-6 space-y-3">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{setItem.name}</h1>
          <SetRenameButton setId={setItem.id} initialName={setItem.name} />
        </div>
        <p className="text-slate-600 dark:text-slate-300">{setItem.description}</p>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {setItem.cards.length} cards in this set
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href={`/study/${setItem.id}`}
            className="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900"
          >
            Start study mode
          </Link>
          <Link
            href={`/sets/${setItem.id}/batch-import`}
            className="inline-block rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-200"
          >
            Batch import
          </Link>
          <SetActions setId={setItem.id} />
        </div>
      </header>

      <div className="mb-6">
        <AddCardForm setId={setItem.id} />
      </div>

      <CardGallery setId={setItem.id} cards={setItem.cards} />
    </main>
  );
}
