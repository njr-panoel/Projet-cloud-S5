export interface Stats {
  total: number;
  surfaceTotal: number;
  budgetTotal: number;
  completion: number; // percentage
}

export const emptyStats: Stats = {
  total: 0,
  surfaceTotal: 0,
  budgetTotal: 0,
  completion: 0
};
