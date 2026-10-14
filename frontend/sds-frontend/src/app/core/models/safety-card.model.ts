export interface SafetyCard {
  id: number;
  clientId: number;
  clientName: string;
  tipologia: string;
  titolo: string;
  numeroProtocollo?: string;
  enteEmittitore?: string;
  dataRilascio?: Date;
  dataScadenza?: Date;
  validitaMesi?: number;
  stato: string;
  frequenzaControllo?: string;
  osservazioni?: string;
  pdfUrl?: string;
  llmAnalyzed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSafetyCard {
  clientId: number;
  tipologia: string;
  titolo: string;
  numeroProtocollo?: string;
  enteEmittitore?: string;
  dataRilascio?: Date;
  dataScadenza?: Date;
  validitaMesi?: number;
  frequenzaControllo?: string;
  osservazioni?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  role: string;
}
