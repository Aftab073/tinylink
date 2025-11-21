import { useForm } from 'react-hook-form';
import { fetcher, LinkData } from '../../lib/fetcher';
import { useState } from 'react';

interface CreateLinkFormProps {
  onSuccess: (newLink: LinkData) => void;
}

interface FormValues {
  target: string;
  code?: string;
}

export default function CreateLinkForm({ onSuccess }: CreateLinkFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setApiError(null);
    try {
      // Clean up empty code string to undefined so backend auto-generates it
      const payload = { ...data, code: data.code || undefined };
      const newLink = await fetcher<LinkData>('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // fetcher can return null (e.g., 204 or empty body). Guard against that.
      if (!newLink) {
        throw new Error('Empty response from server');
      }

      reset();
      onSuccess(newLink);
    } catch (err: any) {
      setApiError(err?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Link</h2>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <label className="block text-sm font-medium text-gray-700 mb-1">Target URL</label>
          <input
            {...register('target', {
              required: 'URL is required',
              pattern: {
                value: /^https?:\/\/.+/,
                message: 'Must start with http:// or https://'
              }
            })}
            placeholder="https://example.com/very-long-url"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
          {errors.target && <p className="text-red-500 text-sm mt-1">{errors.target.message}</p>}
        </div>

        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Custom Code (Optional)</label>
          <input
            {...register('code', {
              pattern: {
                value: /^[A-Za-z0-9]{6,8}$/,
                message: '6-8 alphanumeric chars'
              }
            })}
            placeholder="ex: mycode"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
          {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
        </div>
      </div>

      {apiError && <div className="text-red-600 text-sm mt-3 bg-red-50 p-2 rounded">{apiError}</div>}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md disabled:opacity-50 transition-colors"
      >
        {loading ? 'Creating...' : 'Shorten URL'}
      </button>
    </form>
  );
}
