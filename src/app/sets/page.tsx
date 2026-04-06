import SetCreator from "@/components/sets/SetCreator";
import SetBrowser from "@/components/sets/SetBrowser";
import { listAllTags, listSets } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function SetsPage() {
  const [sets, tags] = await Promise.all([listSets(), listAllTags()]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Card Sets</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Create multiple sets and filter quickly by tag or text.
        </p>
      </header>

      <div className="mb-6">
        <SetCreator />
      </div>

      <SetBrowser sets={sets} tags={tags} />
    </main>
  );
}
