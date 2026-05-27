/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Wrench, Coins, Save, Edit3 } from 'lucide-react';
import { Service, ServiceStatus, Withdrawal } from '../types';

interface ServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: Omit<Service, 'id'> & { id?: string }) => void;
  serviceToEdit?: Service | null;
}

export function ServiceDialog({
  isOpen,
  onClose,
  onSave,
  serviceToEdit,
}: ServiceDialogProps) {
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [status, setStatus] = useState<ServiceStatus>('execution');
  const [error, setError] = useState('');

  // Sync state if editing
  useEffect(() => {
    if (serviceToEdit) {
      setClientName(serviceToEdit.clientName);
      setDescription(serviceToEdit.description);
      setTotalValue(serviceToEdit.totalValue.toString());
      setCreatedAt(serviceToEdit.createdAt);
      setStatus(serviceToEdit.status);
    } else {
      // Default empty state, date is today
      setClientName('');
      setDescription('');
      setTotalValue('');
      setCreatedAt(new Date().toISOString().split('T')[0]);
      setStatus('execution');
    }
    setError('');
  }, [serviceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setError('Por favor, informe o nome do cliente.');
      return;
    }
    const valParsed = parseFloat(totalValue);
    if (isNaN(valParsed) || valParsed <= 0) {
      setError('Por favor, informe um valor monetário positivo válido.');
      return;
    }
    if (!createdAt) {
      setError('Por favor, informe a data de lançamento.');
      return;
    }

    onSave({
      id: serviceToEdit?.id,
      clientName: clientName.trim(),
      description: description.trim(),
      totalValue: valParsed,
      createdAt,
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-[#1C1C1C] border border-[#2B2B2B] rounded-xl w-full max-w-lg relative z-10 shadow-2xl animate-fade-in flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center px-6 py-4 border-b border-[#2B2B2B]">
          <div className="flex items-center gap-2">
            <Wrench size={18} className="text-stone-400" />
            <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-white">
              {serviceToEdit ? 'Editar Serviço' : 'Novo Serviço'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-stone-500 hover:text-white rounded transition-all">
            <X size={18} />
          </button>
        </header>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs font-semibold">
          {error && (
            <div className="bg-red-950/40 border border-red-900/55 p-3 rounded-lg text-red-300 font-medium">
              {error}
            </div>
          )}

          {/* Client Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">
              Cliente
            </label>
            <input
              type="text"
              placeholder="Ex: Silva Arquitetura, Carlos Eduardo..."
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-[#0F0F10] border border-[#2B2B2B] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-stone-500 transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Value */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">
                Valor Total (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 4500.00"
                value={totalValue}
                onChange={(e) => setTotalValue(e.target.value)}
                className="w-full bg-[#0F0F10] border border-[#2B2B2B] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-stone-500 transition-colors"
                required
              />
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">
                Data de Criação
              </label>
              <input
                type="date"
                value={createdAt}
                onChange={(e) => setCreatedAt(e.target.value)}
                className="w-full bg-[#0F0F10] border border-[#2B2B2B] text-[#9A9A9A] rounded-lg px-3 py-2 focus:outline-none focus:border-stone-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Service Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">
              Descrição do Serviço
            </label>
            <textarea
              rows={3}
              placeholder="Especifique o material, acabamento, puxadores, ferragens ou prazos de entrega..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#0F0F10] border border-[#2B2B2B] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-stone-500 transition-colors font-sans font-normal resize-none text-xs"
            />
          </div>

          {/* Status Choice */}
          <div className="flex flex-col gap-1.5 mt-1">
            <label className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">
              Status do Serviço
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('execution')}
                className={`py-2 px-3 border uppercase tracking-wider text-[10px] font-bold text-center rounded-lg transition-all ${
                  status === 'execution'
                    ? 'border-[#3A3A3A] bg-[#2B2B2B] text-[#ffffff] font-extrabold shadow'
                    : 'border-[#2B2B2B] text-stone-400 hover:text-white hover:border-[#3A3A3A] bg-transparent'
                }`}
              >
                Em Execução
              </button>

              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={`py-2 px-3 border uppercase tracking-wider text-[10px] font-bold text-center rounded-lg transition-all ${
                  status === 'completed'
                    ? 'border-[#3A3A3A] bg-[#2B2B2B] text-[#ffffff] font-extrabold shadow'
                    : 'border-[#2B2B2B] text-[#a8a8a8] hover:text-white hover:border-[#3A3A3A] bg-transparent'
                }`}
              >
                Concluído
              </button>
            </div>
          </div>

          {/* Controls Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#2B2B2B] mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-transparent text-stone-400 hover:text-white border border-[#2B2B2B] uppercase tracking-wider text-[10px] font-bold rounded-lg hover:bg-[#2B2B2B] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#C8A46B] hover:bg-[#D8B57A] text-[#0F0F10] uppercase tracking-wider text-[10px] font-black rounded-lg flex items-center gap-1 shadow-md transition-all"
            >
              <Save size={14} />
              {serviceToEdit ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface WithdrawalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (withdrawalData: Omit<Withdrawal, 'id' | 'fortnight'> & { id?: string }) => void;
  withdrawalToEdit?: Withdrawal | null;
}

export function WithdrawalDialog({
  isOpen,
  onClose,
  onSave,
  withdrawalToEdit,
}: WithdrawalDialogProps) {
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  const [observation, setObservation] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (withdrawalToEdit) {
      setValue(withdrawalToEdit.value.toString());
      setDate(withdrawalToEdit.date);
      setObservation(withdrawalToEdit.observation || '');
    } else {
      setValue('');
      setDate(new Date().toISOString().split('T')[0]);
      setObservation('');
    }
    setError('');
  }, [withdrawalToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valParsed = parseFloat(value);
    if (isNaN(valParsed) || valParsed <= 0) {
      setError('Por favor, especifique um valor maior que zero.');
      return;
    }
    if (!date) {
      setError('Por favor, informe a data correspondente.');
      return;
    }

    onSave({
      id: withdrawalToEdit?.id,
      value: valParsed,
      date,
      observation: observation.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-[#1C1C1C] border border-[#2B2B2B] rounded-xl w-full max-w-md relative z-10 shadow-2xl animate-fade-in flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center px-6 py-4 border-b border-[#2B2B2B]">
          <div className="flex items-center gap-2">
            <Coins size={18} className="text-stone-400" />
            <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-white">
              {withdrawalToEdit ? 'Editar Retirada Financeira' : 'Nova Retirada Financeira'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-stone-500 hover:text-white rounded transition-all">
            <X size={18} />
          </button>
        </header>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs font-semibold">
          {error && (
            <div className="bg-red-950/40 border border-red-900/55 p-3 rounded-lg text-red-300 font-medium">
              {error}
            </div>
          )}

          {/* Withdrawal Value */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">
              Valor do Adiantamento (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Ex: 2500.00"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-[#0F0F10] border border-[#2B2B2B] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-stone-500 transition-colors"
              required
              autoFocus
            />
          </div>

          {/* Date Choice */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">
              Data de Retirada
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#0F0F10] border border-[#2B2B2B] text-[#9A9A9A] rounded-lg px-3 py-2 focus:outline-none focus:border-stone-500 transition-colors"
              required
            />
            <span className="text-[9px] font-normal text-stone-500 italic mt-0.5 leading-relaxed">
              O app associará esta retirada à Quinzena correspondente de forma automatizada.
            </span>
          </div>

          {/* Optional Observation */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">
              Observação / Finalidade (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Adiantamento chapas de MDF, pagamento ajudante..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className="w-full bg-[#0F0F10] border border-[#2B2B2B] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-stone-500 transition-colors font-sans font-normal resize-none text-xs"
            />
          </div>

          {/* Controls Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#2B2B2B] mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-transparent text-stone-400 hover:text-white border border-[#2B2B2B] uppercase tracking-wider text-[10px] font-bold rounded-lg hover:bg-[#2B2B2B] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#C8A46B] hover:bg-[#D8B57A] text-[#0F0F10] uppercase tracking-wider text-[10px] font-black rounded-lg flex items-center gap-1 shadow-md transition-all"
            >
              {withdrawalToEdit ? <Edit3 size={14} /> : <Save size={14} />}
              {withdrawalToEdit ? 'Atualizar Retirada' : 'Confirmar Saque'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
