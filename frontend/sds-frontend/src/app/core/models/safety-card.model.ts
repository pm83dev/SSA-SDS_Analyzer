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
  daysRemaining?: number;
  frequenzaControllo?: string;
  osservazioni?: string;
  frasiH?: string;
  pittogrammi?: string;
  composizioneCasSopra?: string;
  composizioneCasSotto?: string;
  composizione?: string;
  contieneDiisocianati?: boolean;
  statoFisico?: string;
  temperaturaEbollizione?: string;
  covPercent?: string;
  densita?: string;
  sdsUrl?: string;
  pdfUrl?: string;
  hasPdf?: boolean;
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
  frasiH?: string;
  pittogrammi?: string;
  composizioneCasSopra?: string;
  composizioneCasSotto?: string;
  composizione?: string;
  contieneDiisocianati?: boolean;
  statoFisico?: string;
  temperaturaEbollizione?: string;
  covPercent?: string;
  densita?: string;
  sdsUrl?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  role: string;
}

