/** Origin document for issuing a new MDF-e (simplified vs CTe — only the two common paths). */
export type NewMdfeDocumentSourceId = 'cte' | 'nfe';

export type NewMdfeDocumentCard = {
  id: NewMdfeDocumentSourceId;
  title: string;
  description: string;
};

export const NEW_MDFE_DOCUMENT_CARDS: readonly NewMdfeDocumentCard[] = [
  {
    id: 'cte',
    title: 'Conhecimento de transporte eletrônico',
    description: 'Quando estiver fazendo um frete para terceiros.',
  },
  {
    id: 'nfe',
    title: 'Nota fiscal eletrônica',
    description: 'Quando for transportar mercadorias próprias.',
  },
];
