import type { GenealogyDataset } from "../types/genealogy";
import type { Person } from "../types/person";

export const GENEALOGY_LAYOUT = {
  nodeWidth: 200,
  nodeHeight: 64,
  partnerGap: 56,
  siblingGap: 64,
  generationGap: 92,
  canvasPaddingX: 96,
  canvasPaddingTop: 76,
  canvasPaddingBottom: 64,
  minimumCanvasWidth: 1088,
  minimumCanvasHeight: 432,
} as const;

export interface GenealogyNodePosition {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface GenealogyLayout {
  positions: Map<string, GenealogyNodePosition>;
  width: number;
  height: number;
}

interface FamilyUnit {
  id: string;
  personIds: string[];
  childUnitIds: Set<string>;
}

const pairKey = (ids: string[]) => [...ids].sort().join("|");

export function buildGenealogyLayout(members: Person[], data: GenealogyDataset): GenealogyLayout {
  if (!members.length) return { positions: new Map(), width: GENEALOGY_LAYOUT.minimumCanvasWidth, height: GENEALOGY_LAYOUT.minimumCanvasHeight };
  const memberIds = new Set(members.map((person) => person.id));
  const units = new Map<string, FamilyUnit>();
  const unitByPerson = new Map<string, string>();

  data.unions.forEach((union) => {
    if (!memberIds.has(union.personAId) || !memberIds.has(union.personBId)) return;
    const id = `union:${union.id}`;
    units.set(id, { id, personIds: [union.personAId, union.personBId], childUnitIds: new Set() });
    if (!unitByPerson.has(union.personAId)) unitByPerson.set(union.personAId, id);
    if (!unitByPerson.has(union.personBId)) unitByPerson.set(union.personBId, id);
  });

  const parentsByChild = new Map<string, string[]>();
  data.parentRelationships.forEach(({ parentId, childId }) => {
    if (!memberIds.has(parentId) || !memberIds.has(childId)) return;
    const parents = parentsByChild.get(childId) ?? [];
    if (!parents.includes(parentId)) parents.push(parentId);
    parentsByChild.set(childId, parents);
  });

  parentsByChild.forEach((parentIds) => {
    if (parentIds.length < 2 || parentIds.some((id) => unitByPerson.has(id))) return;
    const id = `parents:${pairKey(parentIds)}`;
    units.set(id, { id, personIds: parentIds, childUnitIds: new Set() });
    parentIds.forEach((personId) => unitByPerson.set(personId, id));
  });

  members.forEach((person) => {
    if (unitByPerson.has(person.id)) return;
    const id = `person:${person.id}`;
    units.set(id, { id, personIds: [person.id], childUnitIds: new Set() });
    unitByPerson.set(person.id, id);
  });

  const incoming = new Map<string, Set<string>>();
  parentsByChild.forEach((parentIds, childId) => {
    const childUnitId = unitByPerson.get(childId);
    if (!childUnitId) return;
    const parentUnitIds = new Set(parentIds.map((id) => unitByPerson.get(id)).filter((id): id is string => Boolean(id)));
    parentUnitIds.forEach((parentUnitId) => {
      if (parentUnitId === childUnitId) return;
      units.get(parentUnitId)?.childUnitIds.add(childUnitId);
      const parents = incoming.get(childUnitId) ?? new Set<string>();
      parents.add(parentUnitId);
      incoming.set(childUnitId, parents);
    });
  });

  const unitWidth = (unit: FamilyUnit) => unit.personIds.length * GENEALOGY_LAYOUT.nodeWidth
    + Math.max(0, unit.personIds.length - 1) * GENEALOGY_LAYOUT.partnerGap;
  const widthMemo = new Map<string, number>();
  const subtreeWidth = (unitId: string, trail = new Set<string>()): number => {
    if (widthMemo.has(unitId)) return widthMemo.get(unitId)!;
    const unit = units.get(unitId);
    if (!unit || trail.has(unitId)) return 0;
    const nextTrail = new Set(trail).add(unitId);
    const children = [...unit.childUnitIds];
    const childrenWidth = children.reduce((sum, childId) => sum + subtreeWidth(childId, nextTrail), 0)
      + Math.max(0, children.length - 1) * GENEALOGY_LAYOUT.siblingGap;
    const width = Math.max(unitWidth(unit), childrenWidth);
    widthMemo.set(unitId, width);
    return width;
  };

  const roots = [...units.values()].filter((unit) => !incoming.get(unit.id)?.size);
  const fallbackRoots = roots.length ? roots : [...units.values()];
  const forestWidth = fallbackRoots.reduce((sum, unit) => sum + subtreeWidth(unit.id), 0)
    + Math.max(0, fallbackRoots.length - 1) * GENEALOGY_LAYOUT.siblingGap;
  const width = Math.max(GENEALOGY_LAYOUT.minimumCanvasWidth, forestWidth + GENEALOGY_LAYOUT.canvasPaddingX * 2);
  const positions = new Map<string, GenealogyNodePosition>();
  const placedUnits = new Set<string>();
  let maximumDepth = 0;

  const placeUnit = (unitId: string, left: number, depth: number) => {
    const unit = units.get(unitId);
    if (!unit || placedUnits.has(unitId)) return;
    placedUnits.add(unitId);
    maximumDepth = Math.max(maximumDepth, depth);
    const subtree = subtreeWidth(unitId);
    const ownWidth = unitWidth(unit);
    const unitLeft = left + (subtree - ownWidth) / 2;
    const top = GENEALOGY_LAYOUT.canvasPaddingTop + depth * (GENEALOGY_LAYOUT.nodeHeight + GENEALOGY_LAYOUT.generationGap);
    unit.personIds.forEach((personId, index) => positions.set(personId, {
      left: unitLeft + index * (GENEALOGY_LAYOUT.nodeWidth + GENEALOGY_LAYOUT.partnerGap),
      top,
      width: GENEALOGY_LAYOUT.nodeWidth,
      height: GENEALOGY_LAYOUT.nodeHeight,
    }));

    const children = [...unit.childUnitIds];
    const childrenWidth = children.reduce((sum, childId) => sum + subtreeWidth(childId), 0)
      + Math.max(0, children.length - 1) * GENEALOGY_LAYOUT.siblingGap;
    let childLeft = left + (subtree - childrenWidth) / 2;
    children.forEach((childId) => {
      placeUnit(childId, childLeft, depth + 1);
      childLeft += subtreeWidth(childId) + GENEALOGY_LAYOUT.siblingGap;
    });
  };

  let rootLeft = (width - forestWidth) / 2;
  fallbackRoots.forEach((root) => {
    placeUnit(root.id, rootLeft, 0);
    rootLeft += subtreeWidth(root.id) + GENEALOGY_LAYOUT.siblingGap;
  });

  const shiftSubtree = (unitId: string, delta: number, shifted = new Set<string>()) => {
    if (shifted.has(unitId)) return;
    shifted.add(unitId);
    const unit = units.get(unitId);
    if (!unit) return;
    unit.personIds.forEach((personId) => {
      const position = positions.get(personId);
      if (position) positions.set(personId, { ...position, left: position.left + delta });
    });
    unit.childUnitIds.forEach((childId) => shiftSubtree(childId, delta, shifted));
  };

  const aligned = new Set<string>();
  const alignDescendants = (unitId: string) => {
    if (aligned.has(unitId)) return;
    aligned.add(unitId);
    const unit = units.get(unitId);
    if (!unit?.childUnitIds.size) return;
    const ownPositions = unit.personIds.map((id) => positions.get(id)).filter((item): item is GenealogyNodePosition => Boolean(item));
    const directChildren = [...parentsByChild.entries()]
      .filter(([, parentIds]) => parentIds.some((parentId) => unitByPerson.get(parentId) === unitId))
      .map(([childId]) => childId)
      .filter((childId) => unit.childUnitIds.has(unitByPerson.get(childId) ?? ""));
    const childPositions = directChildren.map((id) => positions.get(id)).filter((item): item is GenealogyNodePosition => Boolean(item));
    if (ownPositions.length && childPositions.length) {
      const sourceCenter = ownPositions.reduce((sum, item) => sum + item.left + item.width / 2, 0) / ownPositions.length;
      const childLeft = Math.min(...childPositions.map((item) => item.left));
      const childRight = Math.max(...childPositions.map((item) => item.left + item.width));
      const delta = sourceCenter - (childLeft + childRight) / 2;
      unit.childUnitIds.forEach((childId) => shiftSubtree(childId, delta));
    }
    unit.childUnitIds.forEach(alignDescendants);
  };
  fallbackRoots.forEach((root) => alignDescendants(root.id));

  members.forEach((person) => {
    if (positions.has(person.id)) return;
    positions.set(person.id, { left: rootLeft, top: GENEALOGY_LAYOUT.canvasPaddingTop, width: GENEALOGY_LAYOUT.nodeWidth, height: GENEALOGY_LAYOUT.nodeHeight });
    rootLeft += GENEALOGY_LAYOUT.nodeWidth + GENEALOGY_LAYOUT.siblingGap;
  });

  const height = Math.max(
    GENEALOGY_LAYOUT.minimumCanvasHeight,
    GENEALOGY_LAYOUT.canvasPaddingTop + (maximumDepth + 1) * GENEALOGY_LAYOUT.nodeHeight
      + maximumDepth * GENEALOGY_LAYOUT.generationGap + GENEALOGY_LAYOUT.canvasPaddingBottom,
  );
  const leftmost = Math.min(...[...positions.values()].map((position) => position.left));
  if (leftmost < GENEALOGY_LAYOUT.canvasPaddingX) {
    const correction = GENEALOGY_LAYOUT.canvasPaddingX - leftmost;
    positions.forEach((position, id) => positions.set(id, { ...position, left: position.left + correction }));
  }
  const rightmost = Math.max(...[...positions.values()].map((position) => position.left + position.width));
  return { positions, width: Math.max(width, rightmost + GENEALOGY_LAYOUT.canvasPaddingX), height };
}

export type SiblingKind = "fullSibling" | "halfSibling";
export interface SiblingGroup { id: string; personIds: string[]; kind: SiblingKind }

export function deriveSiblingGroups(members: Person[], data: GenealogyDataset): SiblingGroup[] {
  const memberIds = new Set(members.map((person) => person.id));
  const parents = new Map<string, Set<string>>();
  members.forEach((person) => parents.set(person.id, new Set()));
  data.parentRelationships.forEach(({ parentId, childId }) => {
    if (memberIds.has(parentId) && memberIds.has(childId)) parents.get(childId)?.add(parentId);
  });

  const full = new Map<string, string[]>();
  parents.forEach((ids, personId) => {
    if (!ids.size) return;
    const key = pairKey([...ids]);
    const group = full.get(key) ?? [];
    group.push(personId);
    full.set(key, group);
  });
  const groups: SiblingGroup[] = [...full.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([id, personIds]) => ({ id: `full:${id}`, personIds, kind: "fullSibling" as const }));

  const fullPairs = new Set(groups.flatMap((group) => group.personIds.flatMap((id, index) => group.personIds.slice(index + 1).map((other) => pairKey([id, other])))));
  const halfEdges = new Map<string, Set<string>>();
  members.forEach((person, index) => members.slice(index + 1).forEach((other) => {
    const relationKey = pairKey([person.id, other.id]);
    if (fullPairs.has(relationKey)) return;
    const first = parents.get(person.id) ?? new Set();
    const second = parents.get(other.id) ?? new Set();
    if (![...first].some((id) => second.has(id))) return;
    if (!halfEdges.has(person.id)) halfEdges.set(person.id, new Set());
    if (!halfEdges.has(other.id)) halfEdges.set(other.id, new Set());
    halfEdges.get(person.id)!.add(other.id);
    halfEdges.get(other.id)!.add(person.id);
  }));
  const visited = new Set<string>();
  halfEdges.forEach((_, start) => {
    if (visited.has(start)) return;
    const queue = [start];
    const personIds: string[] = [];
    while (queue.length) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      personIds.push(current);
      halfEdges.get(current)?.forEach((id) => queue.push(id));
    }
    if (personIds.length > 1) groups.push({ id: `half:${personIds.sort().join("|")}`, personIds, kind: "halfSibling" });
  });
  return groups;
}
