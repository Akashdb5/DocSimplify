export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response('Worker is running', { status: 200 });
}
