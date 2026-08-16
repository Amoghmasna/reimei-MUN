export const committees = ['DISEC', 'UNHRC', 'International Press', 'Lok Sabha', 'FIFA', 'UNSC'] as const;
export type Committee = typeof committees[number];

export const committeeInfo: Record<Committee, string> = {
  DISEC: 'Disarmament and International Security',
  UNHRC: 'United Nations Human Rights Council',
  'International Press': 'International Press Corps',
  'Lok Sabha': 'The House of the People',
  FIFA: 'Fédération Internationale de Football Association',
  UNSC: 'United Nations Security Council'
};

export const departments = [
  'Delegate Affairs',
  'Logistics',
  'Media & Design',
  'Marketing & Outreach',
  'Technical Team'
];
