import { families } from "../data/families";
import { lineageBoundaries } from "../data/lineageBoundaries";
import { lineageSeeds } from "../data/lineageSeeds";
import { parentRelationships } from "../data/parentRelationships";
import { people } from "../data/people";
import { siblingRelationships } from "../data/siblingRelationships";
import { unions } from "../data/unions";
import type { Family } from "../types/family";
import type { GenealogyDataset } from "../types/genealogy";
import type { Person } from "../types/person";

export const genealogyData: GenealogyDataset = {
  people,
  parentRelationships,
  unions,
  siblingRelationships,
  lineageSeeds,
  lineageBoundaries,
};

export const getGenealogyForFamily = (_familyId: string): GenealogyDataset => genealogyData;

const personMap = (data: GenealogyDataset) => new Map(data.people.map((person) => [person.id, person]));

export const getPerson = (personId: string, data: GenealogyDataset = genealogyData): Person | undefined =>
  personMap(data).get(personId);

const resolve = (ids: Iterable<string>, data: GenealogyDataset): Person[] => {
  const byId = personMap(data);
  return [...ids].map((id) => byId.get(id)).filter((person): person is Person => Boolean(person));
};

export const getParents = (personId: string, data: GenealogyDataset = genealogyData): Person[] =>
  resolve(data.parentRelationships.filter((relation) => relation.childId === personId).map((relation) => relation.parentId), data);

export const getChildren = (personId: string, data: GenealogyDataset = genealogyData): Person[] =>
  resolve(data.parentRelationships.filter((relation) => relation.parentId === personId).map((relation) => relation.childId), data);

const parentIds = (personId: string, data: GenealogyDataset): Set<string> =>
  new Set(data.parentRelationships.filter((relation) => relation.childId === personId).map((relation) => relation.parentId));

export const getSiblings = (personId: string, data: GenealogyDataset = genealogyData): Person[] => {
  const parents = parentIds(personId, data);
  const inferred = data.people.filter((candidate) => {
    const candidateParents = parentIds(candidate.id, data);
    return candidate.id !== personId && parents.size > 0 && candidateParents.size === parents.size && [...parents].every((id) => candidateParents.has(id));
  });
  const directIds = new Set<string>();
  const directQueue = [personId];
  while (directQueue.length) {
    const current = directQueue.shift()!;
    data.siblingRelationships.forEach((relationship) => {
      if (!relationship.personIds.includes(current)) return;
      relationship.personIds.forEach((id) => {
        if (id === personId || directIds.has(id)) return;
        directIds.add(id);
        directQueue.push(id);
      });
    });
  }
  return resolve(new Set([...inferred.map((person) => person.id), ...directIds]), data);
};

export const getHalfSiblings = (personId: string, data: GenealogyDataset = genealogyData): Person[] => {
  const parents = parentIds(personId, data);
  return data.people.filter((candidate) => {
    if (candidate.id === personId) return false;
    const candidateParents = parentIds(candidate.id, data);
    const shared = [...candidateParents].filter((id) => parents.has(id)).length;
    return shared > 0 && shared < Math.max(parents.size, candidateParents.size);
  });
};

export const getPeopleInLineage = (familyId: string, data: GenealogyDataset = genealogyData): Person[] => {
  const seeds = data.lineageSeeds[familyId] ?? [];
  const boundaries = new Set(data.lineageBoundaries?.[familyId] ?? []);
  const seen = new Set(seeds);
  const queue = [...seeds];
  while (queue.length) {
    const current = queue.shift()!;
    if (boundaries.has(current)) continue;
    const related = data.parentRelationships.flatMap((relation) =>
      relation.parentId === current ? [relation.childId] : relation.childId === current ? [relation.parentId] : [],
    );
    data.unions.forEach((union) => {
      if (union.personAId === current) related.push(union.personBId);
      if (union.personBId === current) related.push(union.personAId);
    });
    related.forEach((id) => { if (!seen.has(id)) { seen.add(id); queue.push(id); } });
  }
  return resolve(seen, data);
};

export const getLineages = (personId: string, data: GenealogyDataset = genealogyData): Family[] => {
  const heritage = new Set([personId]);
  const queue = [personId];
  while (queue.length) {
    const current = queue.shift()!;
    getParents(current, data).forEach((parent) => {
      if (!heritage.has(parent.id)) { heritage.add(parent.id); queue.push(parent.id); }
    });
  }
  return families.filter((family) => (data.lineageSeeds[family.id] ?? []).some((seedId) => heritage.has(seedId)));
};

export const getGenerations = (members: Person[], data: GenealogyDataset): Person[][] => {
  const memberIds = new Set(members.map((person) => person.id));
  const levels = new Map<string, number>();
  const levelFor = (id: string, trail = new Set<string>()): number => {
    if (levels.has(id)) return levels.get(id)!;
    if (trail.has(id)) return 0;
    const nextTrail = new Set(trail).add(id);
    const parents = data.parentRelationships.filter((relation) => relation.childId === id && memberIds.has(relation.parentId));
    const level = parents.length ? Math.max(...parents.map((relation) => levelFor(relation.parentId, nextTrail))) + 1 : 0;
    levels.set(id, level);
    return level;
  };
  members.forEach((person) => levelFor(person.id));
  data.unions.forEach((union) => {
    if (!memberIds.has(union.personAId) || !memberIds.has(union.personBId)) return;
    const level = Math.max(levels.get(union.personAId) ?? 0, levels.get(union.personBId) ?? 0);
    levels.set(union.personAId, level);
    levels.set(union.personBId, level);
  });
  const maximum = Math.max(0, ...levels.values());
  return Array.from({ length: maximum + 1 }, (_, level) => members.filter((person) => levels.get(person.id) === level));
};
