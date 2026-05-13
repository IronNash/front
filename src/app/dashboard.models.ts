export type MenuTab = 'Tela inicial' | 'CTe' | 'MDFe' | 'Relatórios';
export type ReportTab = 'CTe' | 'MDFe' | 'Cargas';

export type CteRow = {
  emission: string;
  number: string;
  type: string;
  /** Tomador (quem paga o frete) */
  customer: string;
  route: string;
  value: string;
  status: string;
  financialStatus: 'Lançado' | 'Não lançado';
  /** Número da NF-e vinculada (quando existir) */
  nfNumber: string;
  remetente: string;
  destinatario: string;
};

export type MdfeRow = {
  emission: string;
  number: string;
  route: string;
  plate: string;
  cargoValue: string;
  cargoWeight: string;
  documents: string;
  status: 'Autorizado' | 'Encerrado';
};
