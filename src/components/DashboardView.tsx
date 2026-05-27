/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingUp, 
  Wrench, 
  CheckCircle2, 
  DollarSign, 
  ArrowRight, 
  Plus, 
  MinusCircle, 
  Briefcase 
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Service, Withdrawal } from '../types';
import { formatCurrency, formatPortugueseLongDate } from '../utils';

interface DashboardViewProps {
  services: Service[];
  withdrawals: Withdrawal[];
  includeIncompleteServices: boolean;
  onToggleIncludeIncomplete: () => void;
  onNavigate: (view: 'dashboard' | 'services' | 'withdrawals' | 'settings') => void;
  onAddService: () => void;
  onAddWithdrawal: () => void;
}

export default function DashboardView({
  services,
  withdrawals,
  includeIncompleteServices,
  onToggleIncludeIncomplete,
  onNavigate,
  onAddService,
  onAddWithdrawal,
}: DashboardViewProps) {
  // Current local formatted date matching Portuguese locale
  const formattedToday = formatPortugueseLongDate(new Date().toISOString().split('T')[0]);

  // Financial calculations
  const totalServicesValue = services.reduce((acc, curr) => acc + curr.totalValue, 0);
  const totalWithdrawals = withdrawals.reduce((acc, curr) => acc + curr.value, 0);
  
  // Received is the value of completed services
  const alreadyReceived = services
    .filter(s => s.status === 'completed')
    .reduce((acc, curr) => acc + curr.totalValue, 0);

  // Available balance recalculation option
  const activeEarningsBase = includeIncompleteServices ? totalServicesValue : alreadyReceived;
  const availableBalance = activeEarningsBase - totalWithdrawals;

  const countExecution = services.filter(s => s.status === 'execution').length;
  const countCompleted = services.filter(s => s.status === 'completed').length;

  // Recent 3 services for quick feed
  const recentServices = [...services]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  // Monthly revenue chart data
  const monthlyMap: Record<string, number> = {};
  services.forEach(s => {
    const month = s.createdAt.slice(0, 7);
    monthlyMap[month] = (monthlyMap[month] || 0) + s.totalValue;
  });
  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => {
      const [y, m] = month.split('-');
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return { month: `${months[parseInt(m) - 1]}/${y.slice(2)}`, value };
    });

  // Status distribution for donut
  const statusData = [
    { name: 'Em Execução', value: countExecution, color: '#C8A46B' },
    { name: 'Concluído', value: countCompleted, color: '#3FA36C' },
  ].filter(d => d.value > 0);

  const chartGold = '#C8A46B';
  const chartGreen = '#3FA36C';

  return (
    <div className="animate-fade-in flex flex-col gap-8 pb-12">
      {/* Header Greeting */}
      <header className="flex flex-col gap-1">
        <h2 className="font-sans font-black text-3xl md:text-4xl text-white tracking-tight">
          Olá, Marceneiro
        </h2>
        <p className="text-sm font-medium text-stone-500 font-mono tracking-wide">
          {formattedToday}
        </p>
      </header>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Core Financial Block */}
        <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Main Available Balance (High Contrast Premium card) */}
          <div className="bg-[#1C1C1C] border border-[#2B2B2B] p-6 hover:bg-[#1C1C1C] hover:border-[#3A3A3A] transition-all duration-200 relative overflow-hidden flex flex-col justify-between h-auto min-h-[160px] rounded-xl shadow-lg shadow-black/20">
            <div className="absolute -right-3 -top-3 opacity-[0.02] pointer-events-none">
              <DollarSign size={120} className="text-white" />
            </div>
            <div className="flex justify-between items-start w-full relative z-10 gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Saldo Disponível
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleIncludeIncomplete();
                }}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-[#2B2B2B] hover:border-[#3A3A3A] bg-[#1C1C1C] hover:bg-[#2B2B2B] transition-all text-[9.5px] font-mono text-stone-400 hover:text-white"
                title={includeIncompleteServices ? "Clique para desconsiderar serviços em execução" : "Clique para considerar serviços em execução"}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${includeIncompleteServices ? 'bg-[#3FA36C] animate-pulse' : 'bg-[#C8A46B]'}`} />
                {includeIncompleteServices ? 'Com Execução' : 'Só Concluídos'}
              </button>
            </div>
            <div className="relative z-10 mt-3">
              <p className="text-3xl font-black text-white tracking-tight">
                {formatCurrency(availableBalance)}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C8A46B] animate-pulse" />
                <span className="text-[9px] uppercase font-mono text-stone-500 tracking-wider">
                  {includeIncompleteServices ? 'Calculado offline (inclui serviços em execução)' : 'Calculado offline (apenas serviços concluídos)'}
                </span>
              </div>
            </div>
          </div>

          {/* Combined Services Accumulated Value */}
          <div className="bg-[#1C1C1C] border border-[#2B2B2B] p-6 hover:bg-[#1C1C1C] hover:border-[#2B2B2B] transition-all duration-200 flex flex-col justify-between h-40 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Acumulado Serviços
            </span>
            <div>
              <p className="text-2xl font-bold text-[#F5F5F5] tracking-tight">
                {formatCurrency(totalServicesValue)}
              </p>
              <p className="text-[10px] text-stone-500 mt-1 font-mono uppercase">
                {services.length} serviços registrados
              </p>
            </div>
          </div>

          {/* Already Received Services Value */}
          <div className="bg-[#1C1C1C] border border-[#2B2B2B] p-6 hover:bg-[#1C1C1C] hover:border-[#2B2B2B] transition-all duration-200 flex flex-col justify-between h-40 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Valor Concluído
            </span>
            <div>
              <p className="text-2xl font-bold text-[#F5F5F5] tracking-tight">
                {formatCurrency(alreadyReceived)}
              </p>
              <p className="text-[10px] text-stone-500 mt-1 font-mono uppercase">
                Serviços entregues
              </p>
            </div>
          </div>

          {/* Total Withdrawals */}
          <div className="bg-[#1C1C1C] border border-[#2B2B2B] p-6 hover:bg-[#1C1C1C] hover:border-[#2B2B2B] transition-all duration-200 flex flex-col justify-between h-40 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Total de Retiradas
            </span>
            <div>
              <p className="text-2xl font-bold text-[#F5F5F5] tracking-tight">
                {formatCurrency(totalWithdrawals)}
              </p>
              <p className="text-[10px] text-stone-500 mt-1 font-mono uppercase">
                {withdrawals.length} retiradas quinzenais
              </p>
            </div>
          </div>
        </div>

        {/* Counter Panels (Execution & Completed) */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-[#1C1C1C] border border-[#2B2B2B] p-6 flex justify-between items-center hover:border-[#2B2B2B] hover:bg-[#1C1C1C] transition-all duration-200 rounded-xl">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Serviços Em Execução
              </span>
              <p className="text-4xl font-black text-white">{String(countExecution).padStart(2, '0')}</p>
            </div>
            <div className="p-3 bg-[#1C1C1C] border border-[#2B2B2B] rounded-lg">
              <Wrench size={20} className="text-stone-400" />
            </div>
          </div>

          <div className="bg-[#1C1C1C] border border-[#2B2B2B] p-6 flex justify-between items-center hover:border-[#2B2B2B] hover:bg-[#1C1C1C] transition-all duration-200 rounded-xl">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Serviços Concluídos
              </span>
              <p className="text-4xl font-black text-white">{String(countCompleted).padStart(2, '0')}</p>
            </div>
            <div className="p-3 bg-[#1C1C1C] border border-[#2B2B2B] rounded-lg">
              <CheckCircle2 size={20} className="text-stone-400" />
            </div>
          </div>
        </div>

        {/* Quick Actions (Design inspired from workspace productivity utilities) */}
        <div className="md:col-span-4 flex flex-col justify-between gap-3 bg-[#1C1C1C] border border-[#2B2B2B] p-4.5 rounded-xl">
          <button
            onClick={() => onAddService()}
            className="flex-1 w-full bg-[#C8A46B] hover:bg-[#D8B57A] text-[#0F0F10] font-semibold text-xs uppercase tracking-wider py-3 px-4 flex items-center justify-center gap-2 transition-all rounded-md shadow"
          >
            <Plus size={16} />
            Adicionar Serviço
          </button>
          
          <button
            onClick={() => onAddWithdrawal()}
            className="flex-1 w-full bg-[#1C1C1C] border border-[#2B2B2B] hover:bg-[#1C1C1C] hover:border-[#3A3A3A] text-[#F5F5F5] font-semibold text-xs uppercase tracking-wider py-3 px-4 flex items-center justify-center gap-2 transition-all rounded-md"
          >
            <MinusCircle size={16} className="text-stone-400" />
            Lançar Retirada
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-[#1C1C1C] border border-[#2B2B2B] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#2B2B2B]">
            <TrendingUp size={16} className="text-[#C8A46B]" />
            <h3 className="font-sans font-bold text-sm text-white tracking-tight uppercase">
              Receita Mensal
            </h3>
          </div>
          {monthlyData.length === 0 ? (
            <p className="text-stone-500 text-xs text-center py-8">Nenhum serviço registrado ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fill: '#9A9A9A', fontSize: 11 }} axisLine={{ stroke: '#2B2B2B' }} tickLine={false} />
                <YAxis tick={{ fill: '#9A9A9A', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#1C1C1C', border: '1px solid #2B2B2B', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#F5F5F5', fontWeight: 700 }}
                  formatter={(value: number) => [formatCurrency(value), 'Receita']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {monthlyData.map((_, i) => (
                    <Cell key={i} fill={chartGold} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Distribution Donut */}
        <div className="bg-[#1C1C1C] border border-[#2B2B2B] rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#2B2B2B]">
            <CheckCircle2 size={16} className="text-[#C8A46B]" />
            <h3 className="font-sans font-bold text-sm text-white tracking-tight uppercase">
              Distribuição
            </h3>
          </div>
          {statusData.length === 0 ? (
            <p className="text-stone-500 text-xs text-center py-8">Nenhum serviço.</p>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1C1C1C', border: '1px solid #2B2B2B', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#F5F5F5' }}
                    formatter={(value: number, name: string) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                {statusData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-[10px] text-[#9A9A9A] font-mono uppercase tracking-wider">
                      {entry.name}: {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity List */}
      <section className="mt-4">
        <div className="flex justify-between items-end mb-4 pb-2 border-b border-[#2B2B2B]">
          <h3 className="font-sans font-bold text-lg text-white tracking-tight flex items-center gap-2">
            <Briefcase size={18} className="text-stone-400" />
            Atividades Recentes
          </h3>
          <button
            onClick={() => onNavigate('services')}
            className="text-[10px] font-bold uppercase tracking-wider text-stone-400 hover:text-white flex items-center gap-1 transition-all"
          >
            Ver todos os serviços <ArrowRight size={14} />
          </button>
        </div>

        {recentServices.length === 0 ? (
          <div className="bg-[#1C1C1C] border border-[#2B2B2B] p-8 text-center text-stone-500 rounded-xl">
            Nenhum serviço registrado ainda. Toque em "Adicionar Serviço" para começar.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentServices.map((service) => {
              const isExec = service.status === 'execution';
              return (
                <div
                  key={service.id}
                  onClick={() => onNavigate('services')}
                  className="bg-[#1C1C1C] border border-[#2B2B2B] p-4 flex justify-between items-center hover:bg-[#1C1C1C] hover:border-[#3A3A3A] transition-all duration-200 cursor-pointer rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    {/* Status vertical band */}
                    <div 
                      className={`w-1 h-10 shrink-0 rounded-full ${
                        isExec ? 'bg-[#C8A46B]' : 'bg-[#3FA36C]'
                      }`} 
                    />
                    <div>
                      <p className="font-sans font-semibold text-sm text-white tracking-tight">
                        {service.clientName}
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5 line-clamp-1 max-w-[280px] md:max-w-xl">
                        {service.description || 'Sem descrição'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-mono text-sm font-bold text-white">
                      {formatCurrency(service.totalValue)}
                    </p>
                    <span 
                      className={`inline-block text-[10px] font-bold uppercase tracking-wider mt-1 ${
                        isExec ? 'text-stone-400' : 'text-stone-300 underline underline-offset-3'
                      }`}
                    >
                      {isExec ? 'Em Execução' : 'Concluído'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footnote of indexed db / offline storage sync status */}
      <footer className="mt-8 pt-6 border-t border-[#2B2B2B] text-center">
        <p className="text-stone-600 text-[10px] font-mono tracking-widest flex items-center justify-center gap-2">
          <span>● WORKSPACE PERSISTENTE LOCAL (DISPOSITIVO)</span>
        </p>
      </footer>
    </div>
  );
}
