import { useState } from 'react';
import type React from 'react';

import { Highlight, themes } from 'prism-react-renderer';

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

type CodeBlockProps = {
  title?: string;
  language: 'tsx' | 'ts' | 'js' | 'bash' | 'json';
  code: string;
};

const CodeBlock: React.FC<CodeBlockProps> = ({ title, language, code }) => (
  <div className="mb-2 w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-slate-900 text-sm text-slate-100 shadow-sm">
    {title && (
      <div className="flex items-center justify-between border-b border-slate-700/80 bg-slate-800 px-4 py-2 text-xs tracking-wide text-slate-300 uppercase">
        <span>{title}</span>
        <span className="rounded bg-slate-700 px-2 py-0.5 font-mono text-[11px]">{language}</span>
      </div>
    )}
    <Highlight code={code.trim()} language={language} theme={themes.nightOwl}>
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <pre style={style} className="overflow-auto px-4 py-3 font-mono text-sm leading-6">
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  </div>
);

function Home() {
  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-start gap-6 px-4 pt-12 text-center">
      <header className="flex flex-col items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">React TailWindCSS</h1>
        </div>
      </header>

      <section className="page__content w-full max-w-xl">
        <Card title="カード">ここに内容を書くよ</Card>
        <Card title="TailWindCSSを複数箇所に書かなくて済む方法">
          .tsxのexportする関数の外でTailWindCSSのクラス名を書いたコンポーネントを定義しておくと便利
          <br></br>
          以下はその例
          <CodeBlock
            language="tsx"
            code={`
type CardProps = { title: string; children: React.ReactNode };
const Card: React.FC<CardProps> = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 bg-gray-200 p-4 shadow-sm text-gray-900 mb-2">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-slate-100 px-3 py-1 text-sm bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          {open ? '閉じる' : '開く'}
        </button>
      </div>
      {open && <div className="mt-3 text-left">{children}</div>}
    </div>
  );
};
            `}
          />
        </Card>
        <Card title="prism-react-rendererを使ったコードブロック">
          prism-react-rendererを用いることで、コードブロックにシンタックスハイライトを追加可能
          <CodeBlock
            language="tsx"
            code={`
import { Highlight, themes } from 'prism-react-renderer';`}
          />
          web/package.jsonに依存関係を追加する必要がある
          <CodeBlock
            language="json"
            code={`
"dependencies": {
  "prism-react-renderer": "^1.3.5",
}`}
          />
          使用したコマンド(/webディレクトリで実行)
          <CodeBlock
            language="bash"
            code={`
              pnpm add prism-react-renderer`}
          />
        </Card>
        <Card title="inputから内容を取得・表示する方法">
          <input
            type="text"
            id="input-example"
            className="mr-2 rounded-md border border-slate-300 px-2 py-1"
            placeholder="ここに入力してください"
          />
          <button
            onClick={() => {
              const input = (document.getElementById('input-example') as HTMLInputElement).value;
              const displayArea = document.getElementById('display-area');
              if (displayArea) {
                displayArea.textContent = `入力された内容: ${input}`;
              }
            }}>
            表示
          </button>
          <p id="display-area" className="mt-2 text-gray-800"></p>
        </Card>
        <Card title="ページ遷移の実装">
          <p id="display-area" className="mt-2 text-gray-800">
            ルーティングを用いて実装
          </p>
          <CodeBlock language="bash" code={`pnpm add react-router-dom`} />
          <a href="/about" className="text-blue-600 underline">
            Aboutへ移動
          </a>
        </Card>
        <Card title="DnDの実装">
          <p id="display-area" className="mt-2 text-gray-800">
            ライブラリdnd-kitを使用
          </p>
          <CodeBlock language="bash" code={`pnpm add @dnd-kit/core @dnd-kit/sortable`} />
          <a href="/drag-drop" className="text-blue-600 underline">
            ドラッグアンドドロップのページへ移動
          </a>
        </Card>
      </section>

      <footer className="page__footer"></footer>
    </div>
  );
}

export default Home;
