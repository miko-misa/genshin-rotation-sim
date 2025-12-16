import { useState } from 'react';

import './App.css';

type Task = {
  id: number;
  label: string;
  done: boolean;
};

const initialTasks: Task[] = [
  { id: 1, label: 'pnpm install / pnpm dev を試す', done: false },
  { id: 2, label: 'App.tsx を編集して保存→HMR を体験', done: false },
  { id: 3, label: 'useState で状態を持つコンポーネントを作る', done: false },
  { id: 4, label: 'useEffect でデータ取得を試す', done: false },
  { id: 5, label: 'Tailwind で簡単なレイアウトを組む', done: false },
];

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    );
  };

  const completedCount = tasks.filter((task) => task.done).length;

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <p className="eyebrow">Learning checklist</p>
          <h1 className="text-white font-bold">React やることリスト</h1>
        </div>
        <div className="summary">
          <span className="summary__label">進捗</span>
          <div className="summary__value">
            {completedCount} / {tasks.length}
          </div>
        </div>
      </header>

      <section className="card">
        <ul className="tasks">
          {tasks.map((task) => (
            <li key={task.id} className="tasks__item">
              <label className="tasks__label">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                />
                <span className={task.done ? 'tasks__text tasks__text--done' : 'tasks__text'}>
                  {task.label}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;
