/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Plus, Edit3, Trash2, Calendar, CircleDollarSign, CheckSquare, Play, RefreshCw } from 'lucide-react';
import { Service, ServiceStatus } from '../types';
import { formatCurrency, formatShortDate } from '../utils';

interface ServicesViewProps {
  services: Service[];
  onAddService: () => void;
  onEditService: (service: Service) => void;
  onDeleteService: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

type SortOption = 'date-new' | 'date-old' | 'val-high' | 'val-low';

export default function ServicesView({
  services,
  onAddService,
  onEditService,
  onDeleteService,
  onToggleStatus,
}: ServicesViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'execution' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-new');

  // Filter logic
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.clientName.toLowerCase().includes(search.toLowerCase()) ||
      service.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || service.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort logic
  const sortedServices = [...filteredServices].sort((a, b) => {
    if (sortBy === 'date-new') {
      return b.createdAt.localeCompare(a.createdAt);
    } else if (sortBy === 'date-old') {
      return a.createdAt.localeCompare(b.createdAt);
    } else if (sortBy === 'val-high') {
      return b.totalValue - a.totalValue;
    } else {
      return a.totalValue - b.totalValue;
    }
  });

  return (
    <div className="animate-fade-in flex flex-col gap-8 pb-12">
      {/* Header section with page CTA */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-sans font-black text-3xl md:text-4xl text-white tracking-tight">
            Gestão de Serviços
          </h2>
          <p className="text-sm font-medium text-stone-500 mt-1 max-w-xl">
            Gerencie projetos ativos, acompanhe entregáveis aos clientes e monitore o fluxo de produção da oficina.
          </p>
        </div>
        <button
          onClick={onAddService}
          className="bg-[#C8A46B] hover:bg-[#D8B57A] text-[#0F0F10] font-semibold text-xs uppercase tracking-wider py-2.5 px-6 flex items-center justify-center gap-1.5 transition-all self-start md:self-auto rounded"
        >
          <Plus size={16} />
          Novo Serviço
        </button>
      </header>

      {/* Interactive Filters & Search block */}
      <section className="flex flex-col md:flex-row gap-4 items-center bg-[#1C1C1C] p-4 border border-[#2B2B2B] rounded-xl">
        {/* Search */}
        <div className="relative w-full md:w-80 flex-shrink-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            placeholder="Buscar por cliente ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0F0F10] border border-[#2B2B2B] rounded-lg py-2 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-stone-500 placeholder:text-stone-600 transition-colors"
          />
        </div>

        {/* Status Pills */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`whitespace-nowrap px-4 py-1.5 font-sans font-semibold text-[10px] uppercase tracking-wider rounded-full border transition-all ${
              statusFilter === 'all'
                ? 'border-[#3A3A3A] bg-[#2B2B2B] text-[#ffffff]'
                : 'border-[#2B2B2B] text-stone-400 hover:text-white hover:border-[#3A3A3A]'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter('execution')}
            className={`whitespace-nowrap px-4 py-1.5 font-sans font-semibold text-[10px] uppercase tracking-wider rounded-full border transition-all ${
              statusFilter === 'execution'
                ? 'border-[#3A3A3A] bg-[#2B2B2B] text-[#ffffff]'
                : 'border-[#2B2B2B] text-stone-400 hover:text-white hover:border-[#3A3A3A]'
            }`}
          >
            Em Execução
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`whitespace-nowrap px-4 py-1.5 font-sans font-semibold text-[10px] uppercase tracking-wider rounded-full border transition-all ${
              statusFilter === 'completed'
                ? 'border-[#3A3A3A] bg-[#2B2B2B] text-[#ffffff]'
                : 'border-[#2B2B2B] text-stone-400 hover:text-white hover:border-[#3A3A3A]'
            }`}
          >
            Concluídos
          </button>
        </div>

        {/* Sort select */}
        <div className="w-full md:w-auto md:ml-auto flex items-center justify-between gap-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wide text-stone-500">
            Ordenar:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-[#0F0F10] border border-[#2B2B2B] text-xs font-semibold text-white py-1.5 px-3 focus:outline-none focus:border-stone-500 rounded-lg"
          >
            <option value="date-new">Mais Recente primeiro</option>
            <option value="date-old">Mais Antigo primeiro</option>
            <option value="val-high">Maior Valor monetário</option>
            <option value="val-low">Menor Valor monetário</option>
          </select>
        </div>
      </section>

      {/* Services Grid (Bento columns) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedServices.length === 0 ? (
          <div className="col-span-full bg-[#1C1C1C] p-12 text-center text-stone-500 border border-[#2B2B2B] rounded-xl">
            Nenhum serviço correspondente encontrado. Limpe os filtros ou adicione um novo registro.
          </div>
        ) : (
          sortedServices.map((service) => {
            const isExecution = service.status === 'execution';
            return (
              <article
                key={service.id}
                className="bg-[#1C1C1C] border border-[#2B2B2B] hover:border-[#3A3A3A] transition-all duration-200 rounded-xl p-5 flex flex-col justify-between relative group overflow-hidden"
              >
                {/* Decorative corner cut accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.01] rounded-bl-full pointer-events-none" />

                <div>
                  {/* Status header badge */}
                  <div className="flex justify-between items-start mb-4">
                    <button
                      onClick={() => onToggleStatus(service.id)}
                      title="Clique para alternar o status do serviço"
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[9px] uppercase tracking-wider font-extrabold cursor-pointer rounded transition-all ${
                        isExecution
                          ? 'bg-[#C8A46B] border-[#C8A46B] text-[#0F0F10] hover:bg-[#D8B57A] hover:border-[#D8B57A]'
                          : 'bg-[#3FA36C] text-white border-[#3FA36C] hover:bg-[#4DB380] hover:border-[#4DB380]'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isExecution ? 'bg-[#C8A46B]' : 'bg-[#3FA36C]'}`} />
                      {isExecution ? 'Em Execução' : 'Concluído'}
                    </button>

                    {/* Quick actions bar */}
                    <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditService(service)}
                        className="text-stone-400 hover:text-white p-1 hover:bg-[#2B2B2B] rounded"
                        title="Editar Serviço"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteService(service.id)}
                        className="text-stone-400 hover:text-red-400 p-1 hover:bg-[#2B2B2B] rounded"
                        title="Excluir Serviço"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-sans font-black text-base text-white tracking-tight mb-2">
                    {service.clientName}
                  </h3>
                  
                  <p className="text-xs text-stone-500 leading-relaxed font-normal mb-6 min-h-[48px] line-clamp-3">
                    {service.description || 'Sem descrição cadastrada do projeto.'}
                  </p>
                </div>

                {/* Footer values info */}
                <div className="flex justify-between items-end border-t border-[#2B2B2B] pt-4 mt-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-stone-600 uppercase tracking-widest font-mono">
                      Criação
                    </span>
                    <div className="flex items-center gap-1 text-stone-400 text-xs">
                      <Calendar size={12} className="text-stone-600" />
                      <span>{formatShortDate(service.createdAt)}</span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-stone-600 uppercase tracking-widest font-mono">
                      Valor
                    </span>
                    <div className="text-sm font-bold text-white tracking-widest font-sans">
                      {formatCurrency(service.totalValue)}
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
