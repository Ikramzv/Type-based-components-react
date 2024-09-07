import { motion } from "framer-motion";
import { X } from "lucide-react";
import { DragEvent, ElementRef, FormEvent, useRef, useState } from "react";
import { cn } from "./cn";

const types = ["red", "orange", "blue"] as const;

type Component = {
  id: string;
  row: number;
  col: number;
  height: number;
  type: (typeof types)[number];
};

function App() {
  const [components, setComponents] = useState<Component[]>([
    { id: "unique id", col: 2, row: 1, type: "red", height: 200 },
    { id: "unique id 2", col: 1, row: 2, type: "blue", height: 100 },
    { id: "unique id 3", col: 2, row: 1, type: "orange", height: 380 },
  ]);

  const [gridCells, setGridCells] = useState(4);

  const gridRef = useRef<ElementRef<"div">>(null);

  const [draggingId, setDragging] = useState("");
  const [droppableId, setDroppable] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();

    const target = e.target as HTMLFormElement;

    setComponents((prev) => [
      {
        col: (target.elements as any).col.value,
        row: (target.elements as any).row.value,
        type: (target.elements as any).type.value,
        height: Math.floor(Math.random() * 250),
        id: crypto.randomUUID(),
      },
      ...prev,
    ]);
  }

  function onPrev(i: number) {
    const prevIndex = i - 1;
    if (prevIndex < 0) return;
    setComponents((prev) => {
      [prev[i], prev[prevIndex]] = [prev[prevIndex], prev[i]];
      return [...prev];
    });
  }

  function onNext(i: number) {
    const nextIndex = i + 1;
    if (nextIndex > components.length - 1) return;
    setComponents((prev) => {
      [prev[i], prev[nextIndex]] = [prev[nextIndex], prev[i]];
      return [...prev];
    });
  }

  function onDragStart(e: DragEvent, component: Component) {
    const id = component.id;
    setDragging(id);
    e.dataTransfer?.setData("application/json", JSON.stringify(component));
  }
  function onDragEnd() {
    setDragging("");
    setDroppable("");
  }

  function onDragOver(e: DragEvent, component: Component) {
    e.preventDefault();
    if (draggingId !== component.id) setDroppable(component.id);
  }

  function onDrop(e: DragEvent, dest: Component) {
    e.preventDefault();

    const source = JSON.parse(
      e.dataTransfer?.getData("application/json")
    ) as Component;

    const sourceIndex = components.findIndex((c) => c.id === source.id);
    const destIndex = components.findIndex((c) => c.id === dest.id);

    if (sourceIndex === -1 || destIndex === -1) return;

    setComponents((prev) => {
      [prev[sourceIndex], prev[destIndex]] = [
        prev[destIndex],
        prev[sourceIndex],
      ];
      return [...prev];
    });
  }

  function onDrag(e: PointerEvent) {
    requestAnimationFrame(() => {
      const distance = 20;

      if (e.clientY >= window.innerHeight - distance) {
        console.log("down");
        window.scrollBy({ top: 20, behavior: "instant" });
        return;
      }

      if (e.clientY <= distance) {
        console.log("up");
        window.scrollBy({ top: -20, behavior: "smooth" });

        return;
      }
    });
  }

  function onDragLeave(component: Component) {
    if (droppableId === component.id) setDroppable("");
  }

  function onDelete(componentId: string) {
    setComponents((prev) => prev.filter((c) => c.id !== componentId));
  }

  // const emptyCells = useMemo(() => {
  //   if (!gridRef.current) return [];
  //   console.log(gridRef.current.getBoundingClientRect());
  // }, [components]);

  return (
    <>
      <form
        encType="multipart/form-data"
        onSubmit={onSubmit}
        className="flex flex-col gap-4 w-[min(400px,100%)] ml-5 mt-5 mb-14"
      >
        <div className="flex gap-4">
          <input
            type="number"
            name="col"
            min={0}
            max={4}
            placeholder="Col"
            className="input"
          />
          <input
            type="number"
            name="row"
            placeholder="Row"
            min={0}
            max={4}
            className="input"
          />
          <select name="type" id="type" className="input">
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <input
          type="number"
          min={2}
          max={12}
          className="input"
          value={gridCells}
          onChange={(e) => setGridCells(e.target.valueAsNumber)}
        />
        <button
          className="bg-black/90 hover:bg-black/70 duration-200 w-full h-9 text-center
         text-gray-100 rounded-md"
        >
          Add
        </button>
      </form>
      <div
        ref={gridRef}
        className="grid grid-cols-4 gap-4 w-full min-h-screen
      px-6 pb-8"
        style={{
          gridTemplateColumns: `repeat(${gridCells}, minmax(100px,1fr))`,
        }}
      >
        {components.map((component, i) => (
          <motion.div
            key={component.id}
            layout="position"
            data-is-dragging={`${draggingId === component.id}`}
            data-is-droppable={`${droppableId === component.id}`}
            draggable
            onDrag={onDrag}
            onDragStart={(e) => onDragStart(e as any, component)}
            onDragEnd={onDragEnd}
            onDragOver={(e) => onDragOver(e, component)}
            onDrop={(e) => onDrop(e, component)}
            onDragLeave={() => onDragLeave(component)}
            className={cn(
              "component",
              draggingId &&
                draggingId !== component.id &&
                "[&_*]:pointer-events-none",
              component.type
            )}
            style={{
              minHeight: component.height + "px",
              gridColumn: `${component.col} span`,
              gridRow: `${component.row} span`,
            }}
          >
            <span className="number">{i + 1}.</span>
            <button className="close" onClick={() => onDelete(component.id)}>
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-2 text-gray-100 mb-4">
              <button
                className="h-8 px-4 rounded-md bg-black/80 hover:bg-black"
                onClick={() => onPrev(i)}
              >
                Prev
              </button>
              <button
                className="h-8 px-4 rounded-md bg-black/80 hover:bg-black"
                onClick={() => onNext(i)}
              >
                Next
              </button>
            </div>
            {JSON.stringify(component, null, 4)}
          </motion.div>
        ))}
      </div>
    </>
  );
}

export default App;
