/**
 * Static demo content for the dashboard shell. Replace with HTTP services when the API exists.
 */
import type { CteRow, MdfeRow } from './dashboard.models';

export const DEMO_MENU_ITEMS = ['Tela inicial', 'CTe', 'MDFe', 'Relatórios'] as const;

export const DEMO_REPORT_TABS = ['CTe', 'MDFe', 'Cargas'] as const;

const CORE_CTE: CteRow[] = [
  {
    emission: '05/05/2026',
    number: '70',
    type: 'Normal',
    customer: 'TECNOTEMPERA T. TERMICA',
    route: 'Guaramirim/SC - Jundiai/SP',
    value: 'R$ 1.100,00',
    status: 'Manifestado',
    financialStatus: 'Lançado',
    nfNumber: '45231',
    remetente: 'Metalurgica Guaramirim LTDA',
    destinatario: 'Industria Jundiai SP',
  },
  {
    emission: '05/05/2026',
    number: '69',
    type: 'Normal',
    customer: 'DEVOTUM INDUSTRIA E COM.',
    route: 'Guaramirim/SC - Cachoeira/BA',
    value: 'R$ 4.150,00',
    status: 'Manifestado',
    financialStatus: 'Não lançado',
    nfNumber: '1050',
    remetente: 'DEVOTUM INDUSTRIA E COM.',
    destinatario: 'Distribuidora Cachoeira BA',
  },
  {
    emission: '05/05/2026',
    number: '68',
    type: 'Normal',
    customer: 'DEVOTUM INDUSTRIA E COM.',
    route: 'Guaramirim/SC - Cachoeira/BA',
    value: 'R$ 2.500,00',
    status: 'Manifestado',
    financialStatus: 'Lançado',
    nfNumber: '998877',
    remetente: 'Transportadora Sul LTDA',
    destinatario: 'DEVOTUM INDUSTRIA E COM.',
  },
  {
    emission: '27/04/2026',
    number: '67',
    type: 'Normal',
    customer: 'S.M.A INDUSTRIA E COMER.',
    route: 'Guaramirim/SC - Cachoeira/BA',
    value: 'R$ 10,50',
    status: 'Manifestado',
    financialStatus: 'Não lançado',
    nfNumber: '66001',
    remetente: 'S.M.A INDUSTRIA E COMER.',
    destinatario: 'Armazem Cachoeira LTDA',
  },
];

function extraCteRows(): CteRow[] {
  const list: CteRow[] = [];
  for (let i = 1; i <= 42; i++) {
    const inMay = i > 16;
    const emission = inMay ? '11/05/2026' : '16/04/2026';
    const status = i % 9 === 0 ? 'Autorizado' : 'Manifestado';
    list.push({
      emission,
      number: String(20 + i),
      type: 'Normal',
      customer: i % 2 === 0 ? 'DEVOTUM INDUSTRIA E COM.' : 'TECNOTEMPERA T. TERMICA',
      route: 'Guaramirim/SC - Jundiai/SP',
      value: `R$ ${150 + i * 45},00`,
      status,
      financialStatus: i % 4 === 0 ? 'Não lançado' : 'Lançado',
      nfNumber: String(50000 + i),
      remetente: 'Remetente demo',
      destinatario: 'Destinatário demo',
    });
  }
  return list;
}

export const DEMO_CTE_ROWS: CteRow[] = [...CORE_CTE, ...extraCteRows()];

const CORE_MDFE: MdfeRow[] = [
  {
    emission: '05/05/2026',
    number: '34',
    route: 'SC - SP',
    plate: 'TBM-6J14',
    cargoValue: 'R$ 200.000,00',
    cargoWeight: '440,00',
    documents: '1 CTe',
    status: 'Autorizado',
  },
  {
    emission: '05/05/2026',
    number: '33',
    route: 'SC - SP',
    plate: 'QJN-9E92',
    cargoValue: 'R$ 127.592,08',
    cargoWeight: '855,93',
    documents: '1 CTe',
    status: 'Autorizado',
  },
  {
    emission: '05/05/2026',
    number: '32',
    route: 'SC - SP',
    plate: 'GGB-2J23',
    cargoValue: 'R$ 152.476,60',
    cargoWeight: '1.132,86',
    documents: '1 CTe',
    status: 'Autorizado',
  },
  {
    emission: '27/04/2026',
    number: '31',
    route: 'SC - SP',
    plate: 'QJN-9E92',
    cargoValue: 'R$ 48.097,49',
    cargoWeight: '244,57',
    documents: '2 CTes',
    status: 'Encerrado',
  },
];

function extraMdfeRows(): MdfeRow[] {
  const list: MdfeRow[] = [];
  for (let i = 10; i <= 32; i++) {
    const inMay = i >= 20;
    const emission = inMay ? '09/05/2026' : '20/04/2026';
    const status = i % 10 === 0 ? 'Encerrado' : 'Autorizado';
    list.push({
      emission,
      number: String(i),
      route: 'SC - SP',
      plate: `DEM-${i}A23`,
      cargoValue: `R$ ${(8000 + i * 1200).toLocaleString('pt-BR')},00`,
      cargoWeight: `${100 + i}`,
      documents: '1 CTe',
      status,
    });
  }
  return list;
}

export const DEMO_MDFE_ROWS: MdfeRow[] = [...CORE_MDFE, ...extraMdfeRows()];
