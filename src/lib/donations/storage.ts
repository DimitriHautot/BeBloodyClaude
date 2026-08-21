import { persisted } from '../storage';
import type { Donation } from './types';

export const donations = persisted<Donation[]>('donations', []);

export function addDonation(donation: Donation): void {
  donations.update((list) => [...list, donation].sort((a, b) => a.date.localeCompare(b.date)));
}

export function removeDonation(id: string): void {
  donations.update((list) => list.filter((d) => d.id !== id));
}
