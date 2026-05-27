/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ServiceStatus = 'execution' | 'completed';

export interface Service {
  id: string;
  clientName: string;
  description: string;
  totalValue: number;
  createdAt: string; // YYYY-MM-DD
  status: ServiceStatus;
}

export interface Withdrawal {
  id: string;
  value: number;
  date: string; // YYYY-MM-DD
  observation?: string;
  fortnight: string; // e.g., "2ª Quinzena - Mar/26"
}

export interface FinancialSummary {
  totalServicesValue: number;
  alreadyReceived: number;
  totalWithdrawals: number;
  availableBalance: number;
  servicesInExecutionCount: number;
  servicesCompletedCount: number;
}
