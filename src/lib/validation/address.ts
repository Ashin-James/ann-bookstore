/**
 * US Address & State Validation Engine
 * 50 States, District of Columbia, and US Territories
 */

export interface USState {
  code: string;
  name: string;
}

export const US_STATES: USState[] = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'VI', name: 'Virgin Islands' },
  { code: 'GU', name: 'Guam' },
];

/**
 * Validates US ZIP codes: 5 digits (e.g. 97201) or ZIP+4 (e.g. 97201-1234)
 */
export function validateUSZip(zip: string): boolean {
  if (!zip) return false;
  const cleaned = zip.trim();
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(cleaned);
}

/**
 * Validates whether state code or name is a recognized US state/territory
 */
export function validateUSState(stateCode: string): boolean {
  if (!stateCode) return false;
  const upper = stateCode.trim().toUpperCase();
  return US_STATES.some((s) => s.code === upper || s.name.toUpperCase() === upper);
}

export interface USAddressInput {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  country?: string;
}

export function validateUSAddress(input: Partial<USAddressInput>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!input.fullName || input.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name.';
  }
  if (!input.addressLine1 || input.addressLine1.trim().length < 3) {
    errors.addressLine1 = 'Please enter your street address.';
  }
  if (!input.city || input.city.trim().length < 2) {
    errors.city = 'Please enter your city.';
  }
  if (!input.state || !validateUSState(input.state)) {
    errors.state = 'Please select a valid US state or territory.';
  }
  if (!input.zip || !validateUSZip(input.zip)) {
    errors.zip = 'Please enter a valid 5-digit US ZIP code or ZIP+4.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
