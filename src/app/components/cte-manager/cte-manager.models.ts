/** Which document the user is starting from when creating a new CTe (routes / API branch on this). */
export type NewCteDocumentId = 'nfe' | 'third-party-cte' | 'rural-producer' | 'other';

/**
 * “Tipo de documento originário” in the manual document form (dropdown).
 * Independent from {@link NewCteDocumentId} cards — user can refine the fiscal type here.
 */
export type OriginDocumentKindId =
  | 'other-documents'
  | 'rural-producer-note'
  | 'third-party-cte'
  | 'declaration-or-proof'
  | 'fiscal-coupon';

export const ORIGIN_DOCUMENT_TYPE_OPTIONS: ReadonlyArray<{ id: OriginDocumentKindId; label: string }> = [
  { id: 'other-documents', label: 'Outros documentos' },
  { id: 'rural-producer-note', label: 'Nota de produtor rural' },
  { id: 'third-party-cte', label: 'CTe de outra transportadora' },
  { id: 'declaration-or-proof', label: 'Declaração ou comprovante equivalente' },
  { id: 'fiscal-coupon', label: 'Cupom fiscal / NFC-e em papel' },
];

/** Payload when the user confirms “Informe os dados do documento”. */
export type NewCteOriginDocumentFormPayload = {
  originDocumentKindId: OriginDocumentKindId;
  description: string;
  documentNumber: string;
  /** Texto como digitado (ex.: `R$ 1.234,56`). Valide no backend. */
  documentValueInput: string;
  /** `yyyy-mm-dd` from `<input type="date">`. */
  issueDateIso: string;
};

/** Suggested default for the origin-document dropdown after a card pick. */
export function defaultOriginDocumentKindFromPath(path: NewCteDocumentId): OriginDocumentKindId {
  switch (path) {
    case 'third-party-cte':
      return 'third-party-cte';
    case 'rural-producer':
      return 'rural-producer-note';
    case 'other':
      return 'other-documents';
    default:
      return 'other-documents';
  }
}

/** How the user brings an NF-e in after choosing the NF-e document path. */
export type NfeIngestMethodId = 'xml-upload' | 'access-key' | 'sefaz-sync';

/** Active panel inside the New CTe → NF-e wizard. */
export type NewCteNfeWizardPanel = 'method' | 'sefaz' | 'xml-placeholder' | 'access-key-placeholder';

export type SefazNfeListRow = {
  id: string;
  emission: string;
  nfNumber: string;
  issuer: string;
  recipient: string;
  value: string;
  situation: string;
};

/** Matches the preset values used in `PERIOD_OPTIONS` (`value`). */
export type CtePeriodPreset = '' | 'hoje' | 'este-mes' | 'mes-anterior' | 'personalizado';

export type CteFilters = {
  periodPreset: CtePeriodPreset;
  /** `yyyy-mm-dd` from `<input type="date">`; only used when preset is personalizado */
  customStart: string;
  customEnd: string;
  status: string;
  /** Tomador: texto livre + sugestões (não é `<select>`). */
  customer: string;
  financialStatus: string;
  advancedEnabled: boolean;
  cteType: string;
  numberFrom: string;
  numberTo: string;
  nfNumber: string;
  remetente: string;
  destinatario: string;
};

export const createEmptyFilters = (): CteFilters => ({
  periodPreset: '',
  customStart: '',
  customEnd: '',
  status: '',
  customer: '',
  financialStatus: '',
  advancedEnabled: false,
  cteType: '',
  numberFrom: '',
  numberTo: '',
  nfNumber: '',
  remetente: '',
  destinatario: '',
});

export const NEW_CTE_DOCUMENT_CARDS: ReadonlyArray<{
  id: NewCteDocumentId;
  title: string;
  description: string;
}> = [
  {
    id: 'nfe',
    title: 'Nota fiscal eletrônica (NF-e)',
    description: 'XML, chave de acesso ou busca na SEFAZ.',
  },
  {
    id: 'third-party-cte',
    title: 'CTe de outra transportadora',
    description: 'Subcontratação, redespacho ou etapa intermediária.',
  },
  {
    id: 'rural-producer',
    title: 'Nota de produtor rural',
    description: 'Talão / nota em papel como referência da carga.',
  },
  {
    id: 'other',
    title: 'Outro documento',
    description: 'Declaração, cupom fiscal, NFC-e ou comprovante equivalente.',
  },
];

export const NFE_INGEST_METHOD_OPTIONS: ReadonlyArray<{
  id: NfeIngestMethodId;
  title: string;
  description: string;
}> = [
  {
    id: 'xml-upload',
    title: 'Enviar XML do computador',
    description: 'Arquivo autorizado (.xml) salvo na sua máquina ou rede.',
  },
  {
    id: 'access-key',
    title: 'Informar chave de acesso',
    description: 'Digite os 44 dígitos da NF-e quando você já tem a chave.',
  },
  {
    id: 'sefaz-sync',
    title: 'Buscar na SEFAZ',
    description: 'Lista notas já disponibilizadas para o seu CNPJ (via serviço no servidor).',
  },
];

export const PERIOD_OPTIONS: ReadonlyArray<{ value: CtePeriodPreset; label: string }> = [
  { value: '', label: 'Selecione um período' },
  { value: 'hoje', label: 'Hoje' },
  { value: 'este-mes', label: 'Este mês' },
  { value: 'mes-anterior', label: 'Mês anterior' },
  { value: 'personalizado', label: 'Personalizado' },
];

/** Demo rows — replace with HTTP response from your backend (SEFAZ integration lives there). */
export const MOCK_SEFAZ_NFE_ROWS: SefazNfeListRow[] = [
  {
    id: '1',
    emission: '11/05/2026',
    nfNumber: '24148',
    issuer: 'DEVOTUM INDUSTRIA E COMERCI…',
    recipient: 'FUNDACAO JOAO PAULO II',
    value: 'R$ 12.494,25',
    situation: 'Não emitido CTe',
  },
  {
    id: '2',
    emission: '10/05/2026',
    nfNumber: '24102',
    issuer: 'METALURGICA GUARAMIRIM LTDA',
    recipient: 'INDUSTRIA JUNDIAI SP',
    value: 'R$ 3.200,00',
    situation: 'Não emitido CTe',
  },
  {
    id: '3',
    emission: '09/05/2026',
    nfNumber: '99812',
    issuer: 'S.M.A INDUSTRIA E COMER.',
    recipient: 'ARMAZEM CACHOEIRA LTDA',
    value: 'R$ 890,50',
    situation: 'Não emitido CTe',
  },
];
