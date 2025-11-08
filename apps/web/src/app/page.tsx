export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Lyzn Risk Exchange</h1>
        <p className="text-lg mb-4">
          Non-custodial risk exchange platform built on Solana
        </p>
        <div className="mt-8">
          <a
            href="/api/auth/signin"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sign In
          </a>
        </div>
      </div>
    </main>
  );
}

