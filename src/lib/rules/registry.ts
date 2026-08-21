import type { DonationRuleSet } from './types';
import { belgiumRules } from './belgium';

/**
 * All available rule sets, keyed by ISO 3166-1 alpha-2 country code.
 * To add support for a new country: implement `DonationRuleSet` in a new
 * file (see belgium.ts for the expected shape) and register it here.
 */
export const ruleSetRegistry: Record<string, DonationRuleSet> = {
  BE: belgiumRules
};

export function getRuleSet(countryCode: string): DonationRuleSet {
  const ruleSet = ruleSetRegistry[countryCode];
  if (!ruleSet) {
    throw new Error(`No donation rule set registered for country code "${countryCode}"`);
  }
  return ruleSet;
}
