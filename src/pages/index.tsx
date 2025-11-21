import { useEffect, useState } from 'react';
import Head from 'next/head';
import CreateLinkForm from '../components/forms/CreateLinkForm';
import LinksTable from '../components/tables/LinksTable';
import { fetcher, LinkData } from '../lib/fetcher';

export default function Dashboard() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all links on mount
  const loadLinks = async () => {
    try {
      const data = await fetcher<LinkData[]>('/api/links');
      // fetcher can return null (e.g., 204/no body). Normalize to empty array.
      setLinks(data ?? []);
    } catch (err) {
      setError('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  // Handler for deleting a link
  const handleDelete = async (code: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    try {
      await fetcher(`/api/links/${code}`, { method: 'DELETE' });
      // Optimistic update or refresh
      setLinks((prev) => prev.filter((l) => l.code !== code));
    } catch (err) {
      alert('Failed to delete link');
    }
  };

  // Handler for successful creation
  const handleCreateSuccess = (newLink: LinkData) => {
    setLinks((prev) => [newLink, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>TinyLink Dashboard</title>
        <meta name="description" content="Manage your short links" />
      </Head>

      <main className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">TinyLink Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage and track your shortened URLs.</p>
        </header>

        <CreateLinkForm onSuccess={handleCreateSuccess} />

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Links</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-red-600 bg-red-50 p-4 rounded border border-red-200">{error}</div>
          ) : (
            <LinksTable links={links} onDelete={handleDelete} />
          )}
        </section>
      </main>
    </div>
  );
}
