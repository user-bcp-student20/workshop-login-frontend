import { describe, expect, it } from 'vitest';
import { formatTaskLabel } from './legacy-format';

describe('formatTaskLabel', () => {
  it('formats priority and owner', () => {
    expect(formatTaskLabel({ priority: 'high', owner: 'student' })).toBe('HIGH · STUDENT');
  });

  it.each([null, undefined])('keeps the missing-task label for %s', task => {
    expect(formatTaskLabel(task)).toBe('SIN-DATOS');
  });

  it('formats numeric priority and owner', () => {
    expect(formatTaskLabel({ priority: 2, owner: 7 })).toBe('2 · 7');
  });

  it.each([
    { name: 'empty task', task: {}, expected: 'NORMAL · SIN-ASIGNAR' },
    { name: 'priority only', task: { priority: 'high' }, expected: 'HIGH · SIN-ASIGNAR' },
    { name: 'owner only', task: { owner: 'student' }, expected: 'NORMAL · STUDENT' },
    { name: 'undefined priority', task: { priority: undefined, owner: 'student' }, expected: 'NORMAL · STUDENT' },
    { name: 'undefined owner', task: { priority: 'high', owner: undefined }, expected: 'HIGH · SIN-ASIGNAR' },
    { name: 'empty priority', task: { priority: '', owner: 'student' }, expected: 'NORMAL · STUDENT' },
    { name: 'empty owner', task: { priority: 'high', owner: '' }, expected: 'HIGH · SIN-ASIGNAR' },
    { name: 'zero priority', task: { priority: 0, owner: 'student' }, expected: 'NORMAL · STUDENT' },
    { name: 'zero owner', task: { priority: 'high', owner: 0 }, expected: 'HIGH · SIN-ASIGNAR' }
  ])('keeps documented fallback for $name', ({ task, expected }) => {
    expect(formatTaskLabel(task)).toBe(expected);
  });
});
