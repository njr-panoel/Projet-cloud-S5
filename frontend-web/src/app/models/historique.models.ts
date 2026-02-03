export interface HistoriqueDto {
  id: number;
  signalementId: number;
  managerId: number;
  managerNom: string;
  action: string;
  details: string;
  date: string;
}
