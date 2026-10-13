export interface Client {
  id: number;
  ragioneSociale: string;
  codiceFiscale?: string;
  indirizzo?: string;
  citta?: string;
  provincia?: string;
  cap?: string;
  telefono?: string;
  email?: string;
  contatto?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
  totalCards: number;
}

export interface CreateClient {
  ragioneSociale: string;
  codiceFiscale?: string;
  indirizzo?: string;
  citta?: string;
  provincia?: string;
  cap?: string;
  telefono?: string;
  email?: string;
  contatto?: string;
  note?: string;
}

export interface UpdateClient {
  ragioneSociale?: string;
  codiceFiscale?: string;
  indirizzo?: string;
  citta?: string;
  provincia?: string;
  cap?: string;
  telefono?: string;
  email?: string;
  contatto?: string;
  note?: string;
}
