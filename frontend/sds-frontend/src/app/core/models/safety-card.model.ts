// Cliente collegato a una scheda
export interface ClientRef {
  id: number;
  ragioneSociale: string;
}

export interface SafetyCard {
  id: number;
  // Clienti collegati: la stessa scheda può essere di più clienti, o di nessuno (solo archivio)
  clients: ClientRef[];
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
  nomeFileImportato?: string;
  // Campi che l'import PDF non ha ritrovato nel testo della SDS: il dato non è stato inserito
  campiDaVerificare?: string[];
  noteVerifica?: string;
  hasPdf?: boolean;
  llmAnalyzed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSafetyCard {
  clientIds: number[];
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
  // L'utente ha controllato i dati sulla scheda PDF: toglie tutti i "da verificare"
  datiVerificati?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  role: string;
}

