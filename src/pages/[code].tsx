import { GetServerSideProps } from 'next';
import prisma from '../lib/prisma';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const code = params?.code as string | undefined;

  // 1. Validate param existence
  if (!code) return { notFound: true };

  // 2. Look up the Link
  const link = await prisma.link.findUnique({
    where: { code },
  });

  // 3. Check if exists and is not deleted
  if (!link || link.deleted) {
    return { notFound: true };
  }

  // 4. Validate and normalize target (prevents open-redirect to invalid protocols)
  let destination: string;
  try {
    // This will throw if the URL is invalid
    const parsed = new URL(link.target);
    // normalize to full href (removes stray whitespace)
    destination = parsed.toString();
  } catch (e) {
    return { notFound: true };
  }

  // 5. Update stats (increment clicks, set timestamp)
  // We await this to ensure the write completes before the function exits.
  // Using update with increment is atomic at DB level.
  await prisma.link.update({
    where: { id: link.id },
    data: {
      clicks: { increment: 1 },
      lastClicked: new Date(),
    },
  });

  // 6. Perform 302 Redirect
  return {
    redirect: {
      destination,
      permanent: false, // 302
    },
  };
};

// Default export required for Next.js pages (will not render because redirect occurs)
export default function RedirectEntry() {
  return null;
}
