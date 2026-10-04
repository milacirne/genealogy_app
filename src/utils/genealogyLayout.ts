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

export function buildGenealogyLayout(members: Person[], data: GenealogyDataset, focusFamilyId?: string): GenealogyLayout {
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

  const areSiblings = (firstId: string, secondId: string) => {
    const directlyRelated = data.siblingRelationships.some(({ personIds }) => personIds.includes(firstId) && personIds.includes(secondId));
    if (directlyRelated) return true;
    const firstParents = parentsByChild.get(firstId) ?? [];
    const secondParents = parentsByChild.get(secondId) ?? [];
    return firstParents.length > 0
      && firstParents.length === secondParents.length
      && firstParents.every((parentId) => secondParents.includes(parentId));
  };

  const incoming = new Map<string, Set<string>>();
  parentsByChild.forEach((parentIds, childId) => {
    const childUnitId = unitByPerson.get(childId);
    if (!childUnitId) return;
    const parentUnitIds = new Set(parentIds.map((id) => unitByPerson.get(id)).filter((id): id is string => Boolean(id)));
    const layoutParentUnitIds = [...parentUnitIds].filter((parentUnitId) => parentUnitId !== childUnitId);
    const primaryParentUnitIds = layoutParentUnitIds.length > 1 ? layoutParentUnitIds.slice(0, 1) : layoutParentUnitIds;
    primaryParentUnitIds.forEach((parentUnitId) => {
      units.get(parentUnitId)?.childUnitIds.add(childUnitId);
      const parents = incoming.get(childUnitId) ?? new Set<string>();
      parents.add(parentUnitId);
      incoming.set(childUnitId, parents);
    });
  });

  data.siblingRelationships.forEach(({ personIds }) => {
    const firstUnitId = unitByPerson.get(personIds[0]);
    const secondUnitId = unitByPerson.get(personIds[1]);
    if (!firstUnitId || !secondUnitId || firstUnitId === secondUnitId) return;
    const firstParents = incoming.get(firstUnitId);
    const secondParents = incoming.get(secondUnitId);
    const attachToGeneration = (unitId: string, parentUnitIds: Set<string>) => {
      parentUnitIds.forEach((parentUnitId) => units.get(parentUnitId)?.childUnitIds.add(unitId));
      incoming.set(unitId, new Set(parentUnitIds));
    };
    if (firstParents?.size && !secondParents?.size) attachToGeneration(secondUnitId, firstParents);
    else if (secondParents?.size && !firstParents?.size) attachToGeneration(firstUnitId, secondParents);
  });

  units.forEach((parentUnit) => {
    let childUnits = [...parentUnit.childUnitIds].map((id) => units.get(id)).filter((unit): unit is FamilyUnit => Boolean(unit));
    if (childUnits.length > 1) {
      const adjacency = new Map<string, Set<string>>();
      childUnits.forEach((unit) => adjacency.set(unit.id, new Set()));
      childUnits.forEach((unit, index) => childUnits.slice(index + 1).forEach((other) => {
        if (!unit.personIds.some((firstId) => other.personIds.some((secondId) => areSiblings(firstId, secondId)))) return;
        adjacency.get(unit.id)!.add(other.id);
        adjacency.get(other.id)!.add(unit.id);
      }));
      const endpoint = [...childUnits].reverse().find((unit) => adjacency.get(unit.id)?.size === 1);
      if (endpoint) {
        const ordered: FamilyUnit[] = [];
        const visited = new Set<string>();
        let current: FamilyUnit | undefined = endpoint;
        while (current) {
          ordered.push(current);
          visited.add(current.id);
          const nextId: string | undefined = [...(adjacency.get(current.id) ?? [])].find((id) => !visited.has(id));
          current = nextId ? units.get(nextId) : undefined;
        }
        childUnits = [...ordered, ...childUnits.filter((unit) => !visited.has(unit.id))];
        parentUnit.childUnitIds = new Set(childUnits.map((unit) => unit.id));
      }
    }
    childUnits.forEach((unit, index) => {
      if (unit.personIds.length !== 2) return;
      const leftNeighbor = childUnits[index - 1];
      const rightNeighbor = childUnits[index + 1];
      const facingPerson = (neighbor?: FamilyUnit) => neighbor
        ? unit.personIds.find((personId) => neighbor.personIds.some((neighborId) => areSiblings(personId, neighborId)))
        : undefined;
      const leftPerson = facingPerson(leftNeighbor);
      const rightPerson = facingPerson(rightNeighbor);
      if (leftPerson) unit.personIds = [leftPerson, ...unit.personIds.filter((id) => id !== leftPerson)];
      else if (rightPerson) unit.personIds = [...unit.personIds.filter((id) => id !== rightPerson), rightPerson];
    });
  });

  const unitPartnerGap = (unit: FamilyUnit) =>
    unit.personIds.includes("kaeden-aranthor") && unit.personIds.includes("hazel-aranthor")
      ? 136
      : GENEALOGY_LAYOUT.partnerGap;
  const unitWidth = (unit: FamilyUnit) => unit.personIds.length * GENEALOGY_LAYOUT.nodeWidth
    + Math.max(0, unit.personIds.length - 1) * unitPartnerGap(unit);
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
  let fallbackRoots = roots.length ? roots : [...units.values()];
  const focusIds = new Set(focusFamilyId ? data.lineageSeeds[focusFamilyId] ?? [] : []);
  {
    const rootByPerson = new Map<string, string>();
    fallbackRoots.forEach((unit) => unit.personIds.forEach((personId) => rootByPerson.set(personId, unit.id)));
    const adjacency = new Map<string, Set<string>>();
    data.siblingRelationships.forEach(({ personIds }) => {
      const firstRoot = rootByPerson.get(personIds[0]);
      const secondRoot = rootByPerson.get(personIds[1]);
      if (!firstRoot || !secondRoot || firstRoot === secondRoot) return;
      if (!adjacency.has(firstRoot)) adjacency.set(firstRoot, new Set());
      if (!adjacency.has(secondRoot)) adjacency.set(secondRoot, new Set());
      adjacency.get(firstRoot)!.add(secondRoot);
      adjacency.get(secondRoot)!.add(firstRoot);
    });
    const ordered: FamilyUnit[] = [];
    const globallyVisited = new Set<string>();
    fallbackRoots.forEach((root) => {
      if (globallyVisited.has(root.id)) return;
      const componentIds = new Set<string>();
      const queue = [root.id];
      while (queue.length) {
        const currentId = queue.shift()!;
        if (componentIds.has(currentId)) continue;
        componentIds.add(currentId);
        adjacency.get(currentId)?.forEach((id) => queue.push(id));
      }
      const component = fallbackRoots.filter((unit) => componentIds.has(unit.id));
      const endpoint = [...component].reverse().find((unit) => (adjacency.get(unit.id)?.size ?? 0) <= 1) ?? component[0];
      let current: FamilyUnit | undefined = endpoint;
      while (current) {
        ordered.push(current);
        globallyVisited.add(current.id);
        const nextId: string | undefined = [...(adjacency.get(current.id) ?? [])].find((id) => !globallyVisited.has(id));
        current = nextId ? units.get(nextId) : undefined;
      }
      component.filter((unit) => !globallyVisited.has(unit.id)).forEach((unit) => {
        ordered.push(unit);
        globallyVisited.add(unit.id);
      });
    });
    fallbackRoots = ordered;

    fallbackRoots.forEach((unit, index) => {
      if (unit.personIds.length !== 2) return;
      const leftRoot = fallbackRoots[index - 1];
      const rightRoot = fallbackRoots[index + 1];
      const siblingFacing = (neighbor?: FamilyUnit) => neighbor && data.siblingRelationships.find(({ personIds }) =>
        personIds.some((id) => unit.personIds.includes(id)) && personIds.some((id) => neighbor.personIds.includes(id)))?.personIds.find((id) => unit.personIds.includes(id));
      const leftPerson = siblingFacing(leftRoot);
      const rightPerson = siblingFacing(rightRoot);
      if (leftPerson && rightPerson && leftPerson !== rightPerson) unit.personIds = [leftPerson, rightPerson];
      else if (leftPerson) unit.personIds = [leftPerson, ...unit.personIds.filter((id) => id !== leftPerson)];
      else if (rightPerson) unit.personIds = [...unit.personIds.filter((id) => id !== rightPerson), rightPerson];
    });
  }
  const preferredRootOrder = focusFamilyId
    ? data.lineageRootOrder?.[focusFamilyId]
    : Object.values(data.lineageRootOrder ?? {}).flatMap((personIds) => personIds ?? []);
  if (preferredRootOrder?.length) {
    const rankFor = (unit: FamilyUnit) => Math.min(...unit.personIds
      .map((personId) => preferredRootOrder.indexOf(personId))
      .filter((rank) => rank >= 0), Number.POSITIVE_INFINITY);
    fallbackRoots = [...fallbackRoots].sort((first, second) => rankFor(first) - rankFor(second));
  }
  fallbackRoots.forEach((unit, index) => {
    if (unit.personIds.length !== 2) return;
    // A lone ancestral couple has no neighboring branch to face, so preserve
    // the explicit personA/personB order declared by its union.
    if (fallbackRoots.length === 1) return;
    const focusPerson = unit.personIds.find((id) => focusIds.has(id));
    if (!focusPerson) return;
    const partner = unit.personIds.find((id) => id !== focusPerson)!;
    unit.personIds = index < fallbackRoots.length / 2 ? [partner, focusPerson] : [focusPerson, partner];
  });
  fallbackRoots.forEach((unit, index) => {
    if (unit.personIds.length !== 2) return;
    const siblingInNeighbor = (neighbor?: FamilyUnit) => neighbor && data.siblingRelationships
      .find(({ personIds }) => personIds.some((id) => unit.personIds.includes(id)) && personIds.some((id) => neighbor.personIds.includes(id)))
      ?.personIds.find((id) => unit.personIds.includes(id));
    const leftPerson = siblingInNeighbor(fallbackRoots[index - 1]);
    const rightPerson = siblingInNeighbor(fallbackRoots[index + 1]);
    if (leftPerson && rightPerson && leftPerson === rightPerson) unit.personIds = [...unit.personIds.filter((id) => id !== rightPerson), rightPerson];
    else if (leftPerson && rightPerson) unit.personIds = [leftPerson, rightPerson];
    else if (leftPerson) unit.personIds = [leftPerson, ...unit.personIds.filter((id) => id !== leftPerson)];
    else if (rightPerson) unit.personIds = [...unit.personIds.filter((id) => id !== rightPerson), rightPerson];
  });
  const rootGap = (first: FamilyUnit, second: FamilyUnit) => {
    const shareChild = [...parentsByChild.values()].some((parentIds) =>
      parentIds.some((id) => first.personIds.includes(id)) && parentIds.some((id) => second.personIds.includes(id)));
    if (shareChild) return GENEALOGY_LAYOUT.siblingGap * 5;
    if (!focusFamilyId) {
      const firstCourts = new Set(first.personIds.map((id) => data.people.find((person) => person.id === id)?.court).filter(Boolean));
      const secondCourts = new Set(second.personIds.map((id) => data.people.find((person) => person.id === id)?.court).filter(Boolean));
      const shareCourt = [...firstCourts].some((court) => secondCourts.has(court));
      if (!shareCourt) return GENEALOGY_LAYOUT.siblingGap * 8;
    }
    return GENEALOGY_LAYOUT.siblingGap;
  };
  const forestWidth = fallbackRoots.reduce((sum, unit) => sum + subtreeWidth(unit.id), 0)
    + fallbackRoots.slice(0, -1).reduce((sum, unit, index) => sum + rootGap(unit, fallbackRoots[index + 1]), 0);
  const width = Math.max(GENEALOGY_LAYOUT.minimumCanvasWidth, forestWidth + GENEALOGY_LAYOUT.canvasPaddingX * 2);
  const positions = new Map<string, GenealogyNodePosition>();
  const placedUnits = new Set<string>();
  const edgeAlignedRoots = new Set<string>();
  let maximumDepth = 0;
  const directlyRelatedUnits = (first?: FamilyUnit, second?: FamilyUnit) => {
    if (!first || !second) return false;
    return data.siblingRelationships.some(({ personIds }) =>
      personIds.some((id) => first.personIds.includes(id)) && personIds.some((id) => second.personIds.includes(id)));
  };

  const placeUnit = (unitId: string, left: number, depth: number) => {
    const unit = units.get(unitId);
    if (!unit || placedUnits.has(unitId)) return;
    placedUnits.add(unitId);
    maximumDepth = Math.max(maximumDepth, depth);
    const subtree = subtreeWidth(unitId);
    const ownWidth = unitWidth(unit);
    let unitLeft = left + (subtree - ownWidth) / 2;
    if (depth === 0 && !unit.childUnitIds.size) {
      const rootIndex = fallbackRoots.findIndex((root) => root.id === unitId);
      const hasSiblingOnLeft = directlyRelatedUnits(unit, fallbackRoots[rootIndex - 1]);
      const hasSiblingOnRight = directlyRelatedUnits(unit, fallbackRoots[rootIndex + 1]);
      if (hasSiblingOnLeft && !hasSiblingOnRight) {
        unitLeft = left;
        edgeAlignedRoots.add(unitId);
      } else if (hasSiblingOnRight && !hasSiblingOnLeft) {
        unitLeft = left + subtree - ownWidth;
        edgeAlignedRoots.add(unitId);
      }
    }
    const top = GENEALOGY_LAYOUT.canvasPaddingTop + depth * (GENEALOGY_LAYOUT.nodeHeight + GENEALOGY_LAYOUT.generationGap);
    unit.personIds.forEach((personId, index) => positions.set(personId, {
      left: unitLeft + index * (GENEALOGY_LAYOUT.nodeWidth + unitPartnerGap(unit)),
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
  fallbackRoots.forEach((root, index) => {
    placeUnit(root.id, rootLeft, 0);
    rootLeft += subtreeWidth(root.id) + (fallbackRoots[index + 1] ? rootGap(root, fallbackRoots[index + 1]) : 0);
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
    const directChildUnitIds = new Set(directChildren.map((id) => unitByPerson.get(id)).filter((id): id is string => Boolean(id)));
    const directChildPositions = directChildren
      .map((id) => positions.get(id))
      .filter((item): item is GenealogyNodePosition => Boolean(item));
    const partneredChildUnits = [...directChildUnitIds].filter((childUnitId) => (units.get(childUnitId)?.personIds.length ?? 0) > 1).length;
    const childPositions = directChildren.length === 1 || partneredChildUnits <= 1
      ? directChildPositions
      : [...directChildUnitIds]
        .flatMap((childUnitId) => units.get(childUnitId)?.personIds ?? [])
        .map((id) => positions.get(id))
        .filter((item): item is GenealogyNodePosition => Boolean(item));
    if (ownPositions.length && childPositions.length && !edgeAlignedRoots.has(unitId)) {
      const sourceCenter = ownPositions.reduce((sum, item) => sum + item.left + item.width / 2, 0) / ownPositions.length;
      const childLeft = Math.min(...childPositions.map((item) => item.left));
      const childRight = Math.max(...childPositions.map((item) => item.left + item.width));
      const delta = sourceCenter - (childLeft + childRight) / 2;
      unit.childUnitIds.forEach((childId) => shiftSubtree(childId, delta));
    }
    unit.childUnitIds.forEach(alignDescendants);
  };
  fallbackRoots.forEach((root) => alignDescendants(root.id));

  parentsByChild.forEach((parentIds, childId) => {
    const parentUnitIds = new Set(parentIds.map((id) => unitByPerson.get(id)).filter((id): id is string => Boolean(id)));
    if (parentUnitIds.size < 2 && childId !== "kaeden-aranthor") return;
    const parentPositions = parentIds.map((id) => positions.get(id)).filter((item): item is GenealogyNodePosition => Boolean(item));
    const childPosition = positions.get(childId);
    const childUnitId = unitByPerson.get(childId);
    if (!parentPositions.length || !childPosition || !childUnitId) return;
    const parentCenter = parentPositions.reduce((sum, position) => sum + position.left + position.width / 2, 0) / parentPositions.length;
    const childCenter = childPosition.left + childPosition.width / 2;
    shiftSubtree(childUnitId, parentCenter - childCenter);
  });

  const siblingPair = (first: FamilyUnit, second: FamilyUnit) => data.siblingRelationships.find(({ personIds }) =>
    personIds.some((id) => first.personIds.includes(id)) && personIds.some((id) => second.personIds.includes(id)));
  const compactedLeafRoots = new Set<string>();
  fallbackRoots.forEach((anchor, anchorIndex) => {
    if (!anchor.childUnitIds.size) return;
    let rightUnit = anchor;
    for (let index = anchorIndex - 1; index >= 0; index -= 1) {
      const leftUnit = fallbackRoots[index];
      if (compactedLeafRoots.has(leftUnit.id)) {
        const relationship = siblingPair(leftUnit, rightUnit);
        if (relationship) {
          const leftPersonId = relationship.personIds.find((id) => leftUnit.personIds.includes(id));
          const rightPersonId = relationship.personIds.find((id) => rightUnit.personIds.includes(id));
          const leftPosition = leftPersonId ? positions.get(leftPersonId) : undefined;
          const rightPosition = rightPersonId ? positions.get(rightPersonId) : undefined;
          if (leftPosition && rightPosition) {
            const delta = leftPosition.left + leftPosition.width + GENEALOGY_LAYOUT.siblingGap - rightPosition.left;
            shiftSubtree(rightUnit.id, delta);
          }
        }
        break;
      }
      if (leftUnit.childUnitIds.size) break;
      const relationship = siblingPair(leftUnit, rightUnit);
      if (!relationship) break;
      const leftPersonId = relationship.personIds.find((id) => leftUnit.personIds.includes(id));
      const rightPersonId = relationship.personIds.find((id) => rightUnit.personIds.includes(id));
      const leftPosition = leftPersonId ? positions.get(leftPersonId) : undefined;
      const rightPosition = rightPersonId ? positions.get(rightPersonId) : undefined;
      if (!leftPosition || !rightPosition) break;
      const delta = rightPosition.left - GENEALOGY_LAYOUT.siblingGap - (leftPosition.left + leftPosition.width);
      shiftSubtree(leftUnit.id, delta);
      compactedLeafRoots.add(leftUnit.id);
      rightUnit = leftUnit;
    }
    let leftUnit = anchor;
    for (let index = anchorIndex + 1; index < fallbackRoots.length; index += 1) {
      const rightLeafUnit = fallbackRoots[index];
      if (rightLeafUnit.childUnitIds.size || compactedLeafRoots.has(rightLeafUnit.id)) break;
      const relationship = siblingPair(leftUnit, rightLeafUnit);
      if (!relationship) break;
      const leftPersonId = relationship.personIds.find((id) => leftUnit.personIds.includes(id));
      const rightPersonId = relationship.personIds.find((id) => rightLeafUnit.personIds.includes(id));
      const leftPosition = leftPersonId ? positions.get(leftPersonId) : undefined;
      const rightPosition = rightPersonId ? positions.get(rightPersonId) : undefined;
      if (!leftPosition || !rightPosition) break;
      const delta = leftPosition.left + leftPosition.width + GENEALOGY_LAYOUT.siblingGap - rightPosition.left;
      shiftSubtree(rightLeafUnit.id, delta);
      compactedLeafRoots.add(rightLeafUnit.id);
      leftUnit = rightLeafUnit;
    }
  });
  const subtreePositions = (unitId: string, visited = new Set<string>()): GenealogyNodePosition[] => {
    if (visited.has(unitId)) return [];
    visited.add(unitId);
    const unit = units.get(unitId);
    if (!unit) return [];
    return [
      ...unit.personIds.map((id) => positions.get(id)).filter((position): position is GenealogyNodePosition => Boolean(position)),
      ...[...unit.childUnitIds].flatMap((childId) => subtreePositions(childId, visited)),
    ];
  };
  fallbackRoots.slice(0, -1).forEach((leftRoot, index) => {
    const rightRoot = fallbackRoots[index + 1];
    const relationship = siblingPair(leftRoot, rightRoot);
    if (!relationship || !leftRoot.childUnitIds.size || !rightRoot.childUnitIds.size) return;
    const leftPersonId = relationship.personIds.find((id) => leftRoot.personIds.includes(id));
    const rightPersonId = relationship.personIds.find((id) => rightRoot.personIds.includes(id));
    const leftPerson = leftPersonId ? positions.get(leftPersonId) : undefined;
    const rightPerson = rightPersonId ? positions.get(rightPersonId) : undefined;
    if (!leftPerson || !rightPerson) return;
    const desiredDelta = leftPerson.left + leftPerson.width + GENEALOGY_LAYOUT.siblingGap - rightPerson.left;
    const collisionDelta = subtreePositions(leftRoot.id).flatMap((leftPosition) =>
      subtreePositions(rightRoot.id)
        .filter((rightPosition) => rightPosition.top < leftPosition.top + leftPosition.height && rightPosition.top + rightPosition.height > leftPosition.top)
        .map((rightPosition) => leftPosition.left + leftPosition.width + GENEALOGY_LAYOUT.siblingGap - rightPosition.left),
    ).reduce((maximum, delta) => Math.max(maximum, delta), Number.NEGATIVE_INFINITY);
    const delta = Math.max(desiredDelta, collisionDelta);
    if (delta < 0) shiftSubtree(rightRoot.id, delta);
  });

  // Kaeden and Hazel join two branches with different depths. Anchor each
  // spouse directly below their own parents so both ancestry trunks stay
  // straight and the union expands naturally between the two families.
  ["kaeden-aranthor", "hazel-aranthor"].forEach((childId) => {
    const parentIds = parentsByChild.get(childId) ?? [];
    const parentPositions = parentIds
      .map((id) => positions.get(id))
      .filter((position): position is GenealogyNodePosition => Boolean(position));
    const childPosition = positions.get(childId);
    if (parentPositions.length < 2 || !childPosition) return;
    const parentCenter = parentPositions.reduce((sum, position) => sum + position.left + position.width / 2, 0) / parentPositions.length;
    positions.set(childId, { ...childPosition, left: parentCenter - childPosition.width / 2 });
  });

  // Root compaction can also move Liora and Malakor after the first pass.
  // Re-anchor Aisling without disturbing Liam and Lira's sibling layout.
  ["aisling-kunst"].forEach((childId) => {
    const parentIds = parentsByChild.get(childId) ?? [];
    const parentPositions = parentIds
      .map((id) => positions.get(id))
      .filter((position): position is GenealogyNodePosition => Boolean(position));
    const childPosition = positions.get(childId);
    const childUnitId = unitByPerson.get(childId);
    if (parentPositions.length < 2 || !childPosition || !childUnitId) return;
    const parentCenter = parentPositions.reduce((sum, position) => sum + position.left + position.width / 2, 0) / parentPositions.length;
    shiftSubtree(childUnitId, parentCenter - (childPosition.left + childPosition.width / 2));
  });

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

export type SiblingKind = "fullSibling" | "halfSibling" | "directSibling";
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

  data.siblingRelationships.forEach((relationship, index) => {
    const personIds = relationship.personIds.filter((id) => memberIds.has(id));
    if (personIds.length === 2) groups.push({ id: `direct:${index}:${pairKey(personIds)}`, personIds, kind: "directSibling" });
  });

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
