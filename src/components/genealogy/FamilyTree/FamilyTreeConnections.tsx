import { useMemo } from "react";
import type { GenealogyDataset } from "../../../types/genealogy";
import type { Person } from "../../../types/person";
import { deriveSiblingGroups } from "../../../utils/genealogyLayout";
import type { GenealogyNodePosition } from "../../../utils/genealogyLayout";

interface FamilyTreeConnectionsProps {
  data: GenealogyDataset;
  members: Person[];
  memberIds: Set<string>;
  positions: Map<string, GenealogyNodePosition>;
  width: number;
  height: number;
}

const centerX = (bounds: GenealogyNodePosition) => bounds.left + bounds.width / 2;
const centerY = (bounds: GenealogyNodePosition) => bounds.top + bounds.height / 2;
const bottom = (bounds: GenealogyNodePosition) => bounds.top + bounds.height;

export function FamilyTreeConnections({ data, members, memberIds, positions, width, height }: FamilyTreeConnectionsProps) {
  const connections = useMemo(() => {
    const unionPaths: { id: string; d: string }[] = [];
    const registeredPairs = new Set<string>();

    data.unions.forEach((union) => {
      const first = positions.get(union.personAId);
      const second = positions.get(union.personBId);
      if (!first || !second || !memberIds.has(union.personAId) || !memberIds.has(union.personBId)) return;
      const [left, right] = first.left <= second.left ? [first, second] : [second, first];
      unionPaths.push({ id: union.id, d: `M ${left.left + left.width} ${centerY(left)} H ${right.left}` });
      registeredPairs.add([union.personAId, union.personBId].sort().join("|"));
    });

    const families = new Map<string, { parentIds: string[]; childIds: string[] }>();
    data.parentRelationships.forEach((relationship) => {
      if (!memberIds.has(relationship.parentId) || !memberIds.has(relationship.childId)) return;
      const parentIds = data.parentRelationships
        .filter((candidate) => candidate.childId === relationship.childId && memberIds.has(candidate.parentId))
        .map((candidate) => candidate.parentId)
        .filter((id, index, ids) => ids.indexOf(id) === index)
        .sort();
      const key = parentIds.join("|");
      if (!key || families.get(key)?.childIds.includes(relationship.childId)) return;
      const group = families.get(key) ?? { parentIds, childIds: [] };
      group.childIds.push(relationship.childId);
      families.set(key, group);
    });

    const ancestryPaths: { id: string; d: string }[] = [];
    families.forEach(({ parentIds, childIds }, key) => {
      const parents = parentIds.map((id) => positions.get(id)).filter((item): item is GenealogyNodePosition => Boolean(item));
      const children = childIds.map((id) => positions.get(id)).filter((item): item is GenealogyNodePosition => Boolean(item));
      if (!parents.length || !children.length) return;

      const childTop = Math.min(...children.map((child) => child.top));
      const parentBottom = Math.max(...parents.map(bottom));
      const hasRegisteredUnion = parents.length === 2 && registeredPairs.has(parentIds.slice(0, 2).sort().join("|"));
      let sourceX = centerX(parents[0]);
      let sourceY = bottom(parents[0]);
      let parentJoin = "";

      if (parents.length > 1) {
        sourceX = parents.reduce((sum, parent) => sum + centerX(parent), 0) / parents.length;
        if (hasRegisteredUnion) {
          sourceY = parents.reduce((sum, parent) => sum + centerY(parent), 0) / parents.length;
        } else {
          sourceY = Math.min(childTop - 32, parentBottom + 24);
          parentJoin = parents.map((parent) => `M ${centerX(parent)} ${bottom(parent)} V ${sourceY} H ${sourceX}`).join(" ");
        }
      }

      if (!Number.isFinite(sourceX) || !Number.isFinite(sourceY) || childTop <= sourceY) return;

      const branchY = Math.min(childTop - 16, sourceY + Math.max(22, (childTop - sourceY) * .55));
      const childXs = children.map(centerX);
      const minX = Math.min(sourceX, ...childXs);
      const maxX = Math.max(sourceX, ...childXs);
      const trunk = `M ${sourceX} ${sourceY} V ${branchY} M ${minX} ${branchY} H ${maxX}`;
      const branches = children.map((child) => `M ${centerX(child)} ${branchY} V ${child.top}`).join(" ");
      ancestryPaths.push({ id: key, d: `${parentJoin} ${trunk} ${branches}` });
    });

    const siblingPaths = deriveSiblingGroups(members, data).flatMap((group) => {
      const siblings = group.personIds.map((id) => positions.get(id)).filter((item): item is GenealogyNodePosition => Boolean(item)).sort((a, b) => centerX(a) - centerX(b));
      if (siblings.length < 2) return [];
      return siblings.slice(0, -1).flatMap((left, index) => {
        const right = siblings[index + 1];
        const startX = left.left + left.width;
        const endX = right.left;
        if (endX <= startX) return [];
        const siblingY = (centerY(left) + centerY(right)) / 2;
        return [{ id: `${group.id}:${index}`, kind: group.kind, d: `M ${startX} ${siblingY} H ${endX}` }];
      });
    });

    return { unionPaths, ancestryPaths, siblingPaths };
  }, [data, memberIds, members, positions]);

  if (!positions.size) return null;

  return (
    <svg className="family-tree__connections" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <g data-relationship-type="union">{connections.unionPaths.map((path) => <path className="family-tree__union" d={path.d} key={path.id} />)}</g>
      <g data-relationship-type="descent">{connections.ancestryPaths.map((path) => <path className="family-tree__descent" d={path.d} key={path.id} />)}</g>
      <g data-relationship-type="sibling">{connections.siblingPaths.map((path) => <path className="family-tree__sibling" data-sibling-kind={path.kind} d={path.d} key={path.id} />)}</g>
    </svg>
  );
}
