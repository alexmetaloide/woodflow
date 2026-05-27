/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Service, Withdrawal } from './types';

// Format dynamic date PT-BR style
export function formatPortugueseLongDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('pt-BR', options);
}

// Format currency as R$ XX.XXX,XX
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Format short date: e.g. "28 Fev, 2026"
export function formatShortDate(dateStr: string): string {
  // Parsing date without timezone shift
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  
  const date = new Date(year, month - 1, day);
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  return `${day} ${months[month - 1]}, ${year}`;
}

// Calculate fortnight grouping, e.g. "2ª Quinzena - Fev/24"
export function getFortnight(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return '1ª Quinzena';

  const shortYear = year.toString().slice(-2);
  const monthsAbbr = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  const monthLabel = monthsAbbr[month - 1];

  const quinzena = day <= 15 ? '1ª' : '2ª';
  return `${quinzena} Quinzena - ${monthLabel}/${shortYear}`;
}

// Initial mock data to map the screenshots beautifully
export const INITIAL_SERVICES: Service[] = [
  {
    id: 's1',
    clientName: 'Silva Architects',
    description: 'Custom Oak Dining Table with matching leg architecture',
    totalValue: 8500.00,
    createdAt: '2026-05-12',
    status: 'execution'
  },
  {
    id: 's2',
    clientName: 'Studio Casa',
    description: 'Walnut Floating Shelves with integrated LED lighting warm profiles',
    totalValue: 3200.00,
    createdAt: '2026-05-18',
    status: 'execution'
  },
  {
    id: 's3',
    clientName: 'Residential',
    description: 'Kitchen Cabinetry Refit. Premium soft-close drawers and custom inserts.',
    totalValue: 15000.00,
    createdAt: '2026-04-20',
    status: 'completed'
  },
  {
    id: 's4',
    clientName: 'Marcus Aurelius',
    description: 'Custom walnut dining table with live edge. Includes 8 matching chairs with black leather upholstery.',
    totalValue: 4500.00,
    createdAt: '2026-05-02',
    status: 'execution'
  },
  {
    id: 's5',
    clientName: 'Elena Rostova',
    description: 'Restoration of antique oak roll-top desk. Replaced tambour cloth and refinished surface with tung oil.',
    totalValue: 1200.00,
    createdAt: '2026-04-10',
    status: 'completed'
  },
  {
    id: 's6',
    clientName: 'The Artisan Cafe',
    description: 'Set of 12 ash wood bar stools with mortise and tenon joinery. Matte black finish on legs.',
    totalValue: 3600.00,
    createdAt: '2026-04-25',
    status: 'execution'
  }
];

export const INITIAL_WITHDRAWALS: Withdrawal[] = [
  {
    id: 'w1',
    value: 2500.00,
    date: '2026-05-28',
    observation: 'Material para projeto Mesa de Jantar Maciça (Lote A).',
    fortnight: '2ª Quinzena - Mai/26'
  },
  {
    id: 'w2',
    value: 1800.00,
    date: '2026-05-15',
    observation: 'Manutenção de equipamentos e afiação de serras.',
    fortnight: '1ª Quinzena - Mai/26'
  },
  {
    id: 'w3',
    value: 3200.00,
    date: '2026-04-30',
    observation: 'Pagamento fornecedor de madeiras nobres (Nogueira).',
    fortnight: '2ª Quinzena - Apr/26'
  }
];
