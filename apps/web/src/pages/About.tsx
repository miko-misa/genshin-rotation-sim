import { useState } from 'react';
import type React from 'react';

type CardProps = { title: string; children: React.ReactNode };
const Card: React.FC<CardProps> = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-2 rounded-xl border border-slate-200 bg-gray-200 p-4 text-gray-900 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-24 rounded-md border border-slate-100 bg-slate-50 px-3 py-1 text-sm transition-colors hover:bg-slate-100">
          {open ? '閉じる' : '開く'}
        </button>
      </div>
      {open && <div className="mt-3 text-left">{children}</div>}
    </div>
  );
};

function Home() {
  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-start gap-6 px-4 pt-12 text-center">
      <header className="flex flex-col items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">React TailWindCSS</h1>
        </div>
      </header>

      <section className="page__content w-full max-w-xl">
        <Card title="元に戻る">
          <a href="/">ホームに戻る</a>
        </Card>
      </section>

      <footer className="page__footer"></footer>
    </div>
  );
}

export default Home;
