import type React from 'react';
import { useState } from 'react';
import { DndContext, closestCenter, useDraggable, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import paletteData from '../data/palette.json';
const items: Item[] = paletteData.items;
const patterns: Patterns = paletteData.patterns;



type Option = { id: string; label: string };
type Item = { id: string; label: string; pattern: string };
type Patterns = Record<string, Option[]>;

// 置いた結果
type Placed = { id: string; itemId: string; label: string; selected?: Option };

type DraggableProps = { id: string; data: Record<string, unknown>; children: React.ReactNode };
const Draggable: React.FC<DraggableProps> = ({ id, data, children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id, data });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm text-gray-900 select-none touch-none"
    >
      {children}
    </div>
  );
};

const DropZone: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const { isOver, setNodeRef } = useDroppable({ id, data: { type: 'zone' } });
  return (
    <div
      ref={setNodeRef}
      className="min-h-40 rounded-xl border border-dashed border-slate-400 bg-slate-50 p-3"
      style={{ backgroundColor: isOver ? '#e2e8f0' : undefined }}
    >
      {children}
    </div>
  );
};


function DragDrop() {
  const [placed, setPlaced] = useState<Placed | null>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    // アイテムを下枠へ
    if (active.data.current?.type === 'item' && over.id === 'drop-area') {
      const item = active.data.current.item as Item;
      setPlaced({ id: item.id, itemId: item.id, label: item.label, selected: undefined });
      return;
    }

    // オプションをスロットへ
    if (active.data.current?.type === 'option' && typeof over.id === 'string' && over.id.startsWith('slot-')) {
      const targetItemId = over.id.replace('slot-', '');
      const opt = active.data.current.option as Option;
      setPlaced((prev) => (prev && prev.id === targetItemId ? { ...prev, selected: opt } : prev));
    }
  };
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex min-h-screen w-screen flex-col items-center justify-start gap-6 px-4 pt-12 text-center">
        <header className="flex flex-col items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">React TailWindCSS</h1>
          </div>
        </header>

        {/* アイテムのパレット */}
        <section>
          <h2 className="mb-2 text-lg font-semibold">アイテム</h2>
          <div className="flex flex-wrap gap-3">
            {items.map((item) => (
              <Draggable key={item.id} id={`item-${item.id}`} data={{ type: 'item', item }}>
                {item.label}
              </Draggable>
            ))}
          </div>
        </section>

        {/* ドロップゾーン */}
        <section>
          <h2 className="mb-2 text-lg font-semibold">配置エリア</h2>
          <DropZone id="drop-area">
            {!placed && <p className="text-sm text-slate-500">ここにアイテムをドラッグ</p>}
            {placed && (
              <div className="mt-2 flex flex-col gap-3">
                {(() => {
                  const source = items.find((i) => i.id === placed.itemId);
                  return (
                    <div className="rounded-lg border border-slate-300 bg-white p-3 text-slate-900">
                      {placed.label}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {patterns[source?.pattern || '']?.map((opt) => (
                          <Draggable
                            key={`${placed.id}-opt-${opt.id}`}
                            id={`opt-${placed.id}-${opt.id}`}
                            data={{ type: 'option', option: opt }}
                          >
                            {opt.label}
                          </Draggable>
                        ))}
                      </div>
                      <div className="mt-3">
                        <Slot itemId={placed.id} selected={placed.selected} />
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </DropZone>
        </section>

        <footer className="page__footer"></footer>
      </div>
    </DndContext>
  );
}

const Slot: React.FC<{ itemId: string; selected?: Option }> = ({ itemId, selected }) => {
  const { isOver, setNodeRef } = useDroppable({ id: `slot-${itemId}`, data: { type: 'slot', itemId } });
  return (
    <div
      ref={setNodeRef}
      className="flex h-12 items-center justify-center rounded border border-dashed border-slate-400 bg-slate-100 px-3 w-64"
      style={{ backgroundColor: isOver ? '#cbd5e1' : undefined }}
    >
      {selected ? `選択: ${selected.label}` : 'ここにオプションをドロップ'}
    </div>
  );
};

export default DragDrop;
