// import { useState } from 'react';

import type React from "react";

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-xl border border-slate-200 bg-gray-200 p-4 shadow-sm text-gray-900">
    {children}
  </div>
);

function App() {
  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center gap-6 text-center px-4">
      <header className="flex flex-col items-center gap-2">
        <div>
          <h1 className="text-gray-100 text-2xl font-bold">React TailWindCSS</h1>
        </div>
      </header>

      <section className="page__content w-full max-w-xl">
        <Card>内容</Card>
      </section>

      <footer className="page__footer">
        
      </footer>
    </div>
  );
}

export default App;
