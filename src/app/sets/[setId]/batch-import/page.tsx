import Link from "next/link";
import { notFound } from "next/navigation";
import BatchImportForm from "@/components/sets/BatchImportForm";
import { getSetById } from "@/lib/storage";

type BatchImportPageProps = {
  params: Promise<{ setId: string }>;
};

export default async function BatchImportPage({ params }: BatchImportPageProps) {
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Batch Import: {setItem.name}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Upload photos and choose text source: .txt lines or photo filenames.
        </p>
      </header>

      <BatchImportForm setId={setItem.id} />
    </main>
  );
}
