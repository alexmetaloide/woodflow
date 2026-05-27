/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Coins, 
  HelpCircle, 
  Wallet,
  ArrowDownCircle,
  AlertTriangle,
  Edit3
} from 'lucide-react';
import { Withdrawal, Service } from '../types';
import { formatCurrency, formatShortDate, getFortnight } from '../utils';

interface WithdrawalsViewProps {
  withdrawals: Withdrawal[];
  services: Service[];
  includeIncompleteServices: boolean;
  onToggleIncludeIncomplete: () => void;
  onAddWithdrawal: () => void;
  onDeleteWithdrawal: (id: string) => void;
  onEditWithdrawal: (withdrawal: Withdrawal) => void;
}

export default function WithdrawalsView({
  withdrawals,
  services,
  includeIncompleteServices,
  onToggleIncludeIncomplete,
  onAddWithdrawal,
  onDeleteWithdrawal,
  onEditWithdrawal,
}: WithdrawalsViewProps) {
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  // Financial status calculations
  const totalServicesValue = services.reduce((acc, curr) => acc + curr.totalValue, 0);
  const totalWithdrawals = withdrawals.reduce((acc, curr) => acc + curr.value, 0);
  
  const alreadyReceived = services
    .filter(s => s.status === 'completed')
    .reduce((acc, curr) => acc + curr.totalValue, 0);

  const activeEarningsBase = includeIncompleteServices ? totalServicesValue : alreadyReceived;
  const availableBalance = activeEarningsBase - totalWithdrawals;

  // Predict Next Fortnight (If current date is day <= 15, next is 15 of current month, else 15 or end of next month)
  const today = new Date();
  const currentDay = today.getDate();
  const monthsBR = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  let nextFortnightLabel = '';
  if (currentDay <= 15) {
    nextFortnightLabel = `15 de ${monthsBR[today.getMonth()]}, ${today.getFullYear()}`;
  } else {
    // 15th of next month
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 15);
    nextFortnightLabel = `15 de ${monthsBR[nextMonth.getMonth()]}, ${nextMonth.getFullYear()}`;
  }

  // Grouping withdrawals by Quinzena (fortnight)
  // Let's create an object of keyed grouped withdrawals
  const grouped: { [fortnight: string]: Withdrawal[] } = {};
  withdrawals.forEach((w) => {
    const key = w.fortnight || getFortnight(w.date);
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(w);
  });

  // Get grouped keys and sort them descending (newer fortnights first)
  const groupedKeys = Object.keys(grouped).sort((a, b) => {
    // Basic sorting string comparison or custom weight.
    // e.g. "2ª Quinzena - Jan/24" vs "1ª Quinzena - Fev/24"
    // Let's reverse compare keys since newer dates appear higher.
    return b.localeCompare(a); // Standard text comparison works nicely for chronologic labels inside standard format.
  });

  const selectedDeletionWithdrawal = withdrawals.find(w => w.id === deleteConfirmationId);

  return (
    <div className="animate-fade-in flex flex-col gap-8 pb-12">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#2B2B2B] pb-6">
        <div>
          <h2 className="font-sans font-black text-3xl md:text-4xl text-white tracking-tight">
            Controle de Retiradas
          </h2>
          <p className="text-sm font-medium text-stone-500 mt-1">
            Gestão do fluxo de caixa pessoal, adiantamentos e histórico de saques quinzenais.
          </p>
        </div>
        <button
          onClick={onAddWithdrawal}
          className="bg-[#C8A46B] hover:bg-[#D8B57A] text-[#0F0F10] font-semibold text-xs uppercase tracking-wider py-2.5 px-6 flex items-center justify-center gap-1.5 transition-all self-start md:self-auto rounded-lg shadow-md"
        >
          <Plus size={16} />
          Nova Retirada
        </button>
      </header>

      {/* Financial Banner / Bento Display */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Available Balance Large Widget */}
        <div className="lg:col-span-2 bg-[#1C1C1C] border border-[#2B2B2B] rounded-xl p-6 relative overflow-hidden flex flex-col justify-center min-h-[160px]">
          {/* Abstract vector icon pattern in back */}
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-stone-950/20 to-transparent pointer-events-none" />
          <div className="absolute -right-6 -top-6 text-stone-900/10 pointer-events-none">
            <Wallet size={160} />
          </div>

          <div className="relative z-10 w-full">
            <div className="flex justify-between items-start gap-4 flex-wrap w-full">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">
                Saldo Atual Disponível
              </p>
              
              <button
                onClick={() => onToggleIncludeIncomplete()}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-[#2B2B2B] hover:border-[#3A3A3A] bg-[#0F0F10] hover:bg-[#2B2B2B] transition-all text-[9.5px] font-mono text-stone-400 hover:text-white"
                title={includeIncompleteServices ? "Clique para desconsiderar serviços em execução" : "Clique para considerar serviços em execução"}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${includeIncompleteServices ? 'bg-[#3FA36C] animate-pulse' : 'bg-[#C8A46B]'}`} />
                {includeIncompleteServices ? 'Com Execução' : 'Só Concluídos'}
              </button>
            </div>
            
            <h3 className="font-sans font-black text-4xl md:text-5xl text-white tracking-tighter mt-1">
              {formatCurrency(availableBalance)}
            </h3>
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="flex items-center gap-1 text-[11px] font-medium text-stone-400 bg-[#0F0F10] px-2 py-1 rounded-lg border border-[#2B2B2B]">
                <Coins size={12} className="text-stone-500" />
                Dedução automática ativa
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                {includeIncompleteServices ? 'Tallying: Concluídos + Em Execução' : 'Tallying: Apenas Concluídos'}
              </span>
            </div>
          </div>
        </div>

        {/* Next Period Ledger Widget */}
        <div className="bg-[#1C1C1C] border border-[#2B2B2B] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">
              Próxima Quinzena
            </p>
            <p className="text-lg font-bold text-white tracking-tight leading-snug">
              {nextFortnightLabel}
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-[#2B2B2B]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-0.5">
              Retiradas Previstas
            </p>
            <p className="text-sm font-semibold text-stone-400 font-mono">
              Nenhuma agendada
            </p>
          </div>
        </div>
      </section>

      {/* Grouped Chronological History Ledger */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between pb-2 border-b border-[#2B2B2B]">
          <h3 className="font-sans font-bold text-lg text-white tracking-tight flex items-center gap-2">
            <ArrowDownCircle size={18} className="text-stone-500" />
            Histórico por Quinzena
          </h3>
          <span className="text-xs font-mono text-stone-500 px-2.5 py-0.5 bg-[#1C1C1C] rounded-md border border-[#2B2B2B]">
            {withdrawals.length} lançamentos
          </span>
        </div>

        {groupedKeys.length === 0 ? (
          <div className="bg-[#1C1C1C] border border-[#2B2B2B] p-12 text-center text-stone-500 rounded-xl">
            Nenhuma retirada cadastrada ainda. Toque em "Nova Retirada" para registrar saques quinzenais.
          </div>
        ) : (
          groupedKeys.map((fortnightKey) => {
            const list = grouped[fortnightKey] || [];
            return (
              <div key={fortnightKey} className="flex flex-col gap-2">
                {/* Fortnight Section Header */}
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-[#2B2B2B] pb-1.5">
                  {fortnightKey}
                </h4>

                <div className="flex flex-col gap-1.5">
                  {list.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#1C1C1C] border border-[#2B2B2B] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-[#3A3A3A] hover:bg-[#2B2B2B]/30 transition-all duration-200 rounded-xl relative"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className="bg-[#1C1C1C] p-2 rounded-lg border border-[#2B2B2B] shrink-0 mt-0.5">
                          <Coins size={16} className="text-stone-300" />
                        </div>
                        
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                          <div>
                            <p className="font-mono text-base font-black text-white">
                              {formatCurrency(item.value)}
                            </p>
                            <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                              {formatShortDate(item.date)}
                            </p>
                          </div>

                          <div className="sm:col-span-2">
                            <p className="text-xs text-stone-400 leading-relaxed italic pr-4">
                              {item.observation ? `"${item.observation}"` : 'Sem observação registrada.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Exclude option visible on hover desktop, or permanently on mobile */}
                      <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shrink-0 self-end sm:self-auto">
                        <button
                          onClick={() => onEditWithdrawal(item)}
                          className="text-stone-500 hover:text-white p-1.5 hover:bg-[#2B2B2B] rounded-lg"
                          title="Editar Retirada"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmationId(item.id)}
                          className="text-stone-500 hover:text-red-400 p-1.5 hover:bg-[#2B2B2B] rounded-lg"
                          title="Deletar Retirada"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Exclude Confirmation Modal overlay */}
      {deleteConfirmationId && selectedDeletionWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop screen */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setDeleteConfirmationId(null)}
          />

          <div className="bg-[#1C1C1C] border border-[#2B2B2B] rounded-xl p-6 max-w-md w-full relative z-10 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 text-red-400 mb-4 pb-2 border-b border-[#2B2B2B]">
              <AlertTriangle size={20} />
              <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-white">Confirmar Exclusão</h3>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed mb-6">
              Você está prestes a remover permanentemente a retirada selecionada do registro financeiro quinzenal. O saldo disponível na sua planilha de marcenaria será recalculado automaticamente.
            </p>

            <div className="bg-[#0F0F10] p-4 border border-[#2B2B2B] rounded-lg mb-6">
              <p className="text-sm font-black text-white font-mono">
                Valor: {formatCurrency(selectedDeletionWithdrawal.value)}
              </p>
              <p className="text-xs text-stone-500 font-mono mt-1">
                Data: {formatShortDate(selectedDeletionWithdrawal.date)}
              </p>
              {selectedDeletionWithdrawal.observation && (
                <p className="text-xs text-stone-400 italic mt-2">
                  Obs: "{selectedDeletionWithdrawal.observation}"
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 text-xs font-semibold">
              <button
                onClick={() => setDeleteConfirmationId(null)}
                className="bg-transparent hover:bg-[#2B2B2B] text-stone-400 hover:text-white border border-[#2B2B2B] px-4 py-2 uppercase tracking-wider text-[10px] font-bold rounded-lg transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteWithdrawal(selectedDeletionWithdrawal.id);
                  setDeleteConfirmationId(null);
                }}
                className="bg-red-950/40 hover:bg-red-950 text-red-200 border border-red-900/50 px-4 py-2 uppercase tracking-wider text-[10px] font-bold rounded-lg transition-all"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
