import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { GenealogyDataset } from "../../../types/genealogy";
import type { Person } from "../../../types/person";
import { getPeopleInLineage } from "../../../utils/genealogy";
import { buildGenealogyLayout } from "../../../utils/genealogyLayout";
import { EmptyState } from "../../ui/EmptyState/EmptyState";
import { PersonDetailsPanel } from "../PersonDetailsPanel/PersonDetailsPanel";
import { PersonNode } from "../PersonNode/PersonNode";
import { FamilyTreeConnections } from "./FamilyTreeConnections";
import "./FamilyTree.css";

const MIN_ZOOM = .6;
const MAX_ZOOM = 1.6;
const ZOOM_STEP = .05;
const VIEWPORT_UI_SAFE_TOP = 72;
const MOBILE_TREE_QUERY = "(max-width: 640px)";

const getResponsiveBaseScale = () => window.matchMedia(MOBILE_TREE_QUERY).matches ? .6 : 1;

export function FamilyTree({ familyId, data }: { familyId: string; data: GenealogyDataset }) {
  const members = useMemo(() => getPeopleInLineage(familyId, data), [familyId, data]);
  const memberIds = useMemo(() => new Set(members.map((person) => person.id)), [members]);
  const layout = useMemo(() => buildGenealogyLayout(members, data), [members, data]);
  const [selected, setSelected] = useState<Person>();
  const [baseScale] = useState(getResponsiveBaseScale);
  const [zoom, setZoom] = useState(1);
  const effectiveZoom = baseScale * zoom;
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; panX: number; panY: number } | undefined>(undefined);
  const hasCentered = useRef(false);

  const centerTree = useCallback((scale = effectiveZoom) => {
    const element = viewport.current;
    if (!element || !layout.positions.size) return;
    const bounds = [...layout.positions.values()];
    const left = Math.min(...bounds.map((item) => item.left));
    const right = Math.max(...bounds.map((item) => item.left + item.width));
    const top = Math.min(...bounds.map((item) => item.top));
    const bottom = Math.max(...bounds.map((item) => item.top + item.height));
    const usableCenterY = VIEWPORT_UI_SAFE_TOP + (element.clientHeight - VIEWPORT_UI_SAFE_TOP) / 2;
    setPanOffset({
      x: element.clientWidth / 2 - ((left + right) / 2) * scale,
      y: usableCenterY - ((top + bottom) / 2) * scale,
    });
  }, [effectiveZoom, layout.positions]);

  useLayoutEffect(() => {
    if (!layout.positions.size || hasCentered.current) return;
    hasCentered.current = true;
    const frame = requestAnimationFrame(() => centerTree(effectiveZoom));
    return () => cancelAnimationFrame(frame);
  }, [centerTree, effectiveZoom, layout.positions]);

  const changeZoom = (direction: -1 | 1) => {
    const element = viewport.current;
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((zoom + direction * ZOOM_STEP).toFixed(2))));
    if (next === zoom) return;
    if (element) {
      const nextEffectiveZoom = baseScale * next;
      const logicalCenterX = (element.clientWidth / 2 - panOffset.x) / effectiveZoom;
      const logicalCenterY = (element.clientHeight / 2 - panOffset.y) / effectiveZoom;
      setPanOffset({
        x: element.clientWidth / 2 - logicalCenterX * nextEffectiveZoom,
        y: element.clientHeight / 2 - logicalCenterY * nextEffectiveZoom,
      });
    }
    setZoom(next);
  };

  const resetZoom = () => setZoom(1);

  const beginPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, a, input, select, textarea")) return;
    const element = viewport.current;
    if (!element) return;
    drag.current = { x: event.clientX, y: event.clientY, panX: panOffset.x, panY: panOffset.y };
    setIsPanning(true);
    element.setPointerCapture(event.pointerId);
  };
  const pan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current || !viewport.current) return;
    setPanOffset({ x: drag.current.panX + event.clientX - drag.current.x, y: drag.current.panY + event.clientY - drag.current.y });
  };
  const endPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = undefined;
    setIsPanning(false);
    if (viewport.current?.hasPointerCapture(event.pointerId)) viewport.current.releasePointerCapture(event.pointerId);
  };
  if (!members.length) return <EmptyState title="Os registros genealógicos desta Casa ainda estão sendo reunidos." />;

  return (
    <div className="family-tree">
      <div className="family-tree__toolbar" aria-label="Controles da árvore">
        <button type="button" onClick={() => changeZoom(-1)} aria-label="Diminuir zoom">−</button>
        <output aria-live="polite">{Math.round(zoom * 100)}%</output>
        <button type="button" onClick={() => changeZoom(1)} aria-label="Aumentar zoom">+</button>
        <button type="button" onClick={resetZoom}>Redefinir</button>
        <button type="button" onClick={() => centerTree()}>Centralizar</button>
      </div>
      {data.isDemo && <p className="family-tree__demo">Demonstração visual · dados não canônicos</p>}
      <div
        className={`family-tree__viewport${isPanning ? " family-tree__viewport--panning" : ""}`}
        ref={viewport}
        onPointerDown={beginPan}
        onPointerMove={pan}
        onPointerUp={endPan}
        onPointerCancel={endPan}
      >
          <div className="family-tree__canvas" style={{ width: layout.width, height: layout.height, transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${effectiveZoom})` }}>
            <FamilyTreeConnections data={data} members={members} memberIds={memberIds} positions={layout.positions} width={layout.width} height={layout.height} />
            <div className="family-tree__nodes">
              {members.map((person) => {
                const position = layout.positions.get(person.id);
                if (!position) return null;
                return (
                  <div className="family-tree__node-wrap" key={person.id} style={{ left: position.left, top: position.top, width: position.width, height: position.height }}>
                    <PersonNode person={person} selected={selected?.id === person.id} onSelect={setSelected} />
                  </div>
                );
              })}
            </div>
          </div>
      </div>
      <p className="family-tree__hint">Arraste para explorar · use os controles para ajustar a escala</p>
      {selected && <PersonDetailsPanel person={selected} data={data} onClose={() => setSelected(undefined)} />}
    </div>
  );
}
