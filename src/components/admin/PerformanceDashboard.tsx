"use client";

import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Target, TrendingUp, MousePointer, Award } from 'lucide-react';

const COLORS = ['#1e40af', '#16a34a', '#ea580c', '#854d0e', '#dc2626', '#4f46e5'];

interface PerformanceDashboardProps {
  postsData: any[];
  clicksData: any;
  discoveredData?: any[];
}

export default function PerformanceDashboard({ postsData, clicksData, discoveredData = [] }: PerformanceDashboardProps) {
  // Aggregate Post Data
  const { postsByDate, postsByStyle, postsByCategory } = useMemo(() => {
    const byDate: Record<string, number> = {};
    const byStyle: Record<string, number> = {};
    const byCat: Record<string, number> = {};

    postsData.forEach(p => {
      const date = p.publishedDate || 'Unknown';
      byDate[date] = (byDate[date] || 0) + 1;
      
      const style = p.style || 'UNKNOWN';
      byStyle[style] = (byStyle[style] || 0) + 1;

      const cat = p.category || 'UNKNOWN';
      byCat[cat] = (byCat[cat] || 0) + 1;
    });

    return {
      postsByDate: Object.keys(byDate).sort().map(k => ({ date: k, count: byDate[k] })),
      postsByStyle: Object.keys(byStyle).map(k => ({ name: k, value: byStyle[k] })),
      postsByCategory: Object.keys(byCat).map(k => ({ name: k, value: byCat[k] })),
    };
  }, [postsData]);

  // Aggregate Click Data
  const { totalClicks, productLeaderboard } = useMemo(() => {
    const total = clicksData?.totalClicks || 0;
    const pClicks = clicksData?.productClicks || {};
    
    // Sort products by clicks
    const leaderboard = Object.keys(pClicks)
      .map(key => {
        // Find product name if we can from recent clicks
        const recent = clicksData?.recentClicks?.find((r: any) => r.productId === key);
        return { 
          id: key, 
          name: recent ? recent.productName : key, 
          clicks: pClicks[key] 
        };
      })
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5); // Top 5

    return { totalClicks: total, productLeaderboard: leaderboard };
  }, [clicksData]);

  // Extract pending discovered products
  const pendingQueue = useMemo(() => {
    return discoveredData.filter(d => d.status === 'pending');
  }, [discoveredData]);

  // Find the winning Style
  const winningStyle = postsByStyle.length > 0 ? postsByStyle.reduce((prev, current) => (prev.value > current.value) ? prev : current) : null;

  return (
    <div className="space-y-6">
      
      {/* Alert if Pending Discovery */}
      {pendingQueue.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Agent de découverte actif : {pendingQueue.length} {pendingQueue.length > 1 ? 'nouveaux produits en attente' : 'nouveau produit en attente'} d'être générés.
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  {pendingQueue.map((p, idx) => (
                    <li key={idx}><strong>{p.name}</strong> - <em>{p.category}</em> (ASIN: {p.asin})</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-700">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Articles Publiés</p>
            <p className="text-2xl font-bold text-gray-900">{postsData.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg text-green-700">
            <MousePointer size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Clics Générés</p>
            <p className="text-2xl font-bold text-gray-900">{totalClicks}</p>
          </div>
        </div>

        <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 shadow-sm flex items-center gap-4">
          <div className="bg-amber-200 p-3 rounded-lg text-amber-800">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm text-amber-800 font-medium whitespace-nowrap">Style Actuel Gagnant</p>
            <p className="text-xl font-bold text-amber-900">{winningStyle?.name || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-lg text-purple-700">
            <Target size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Mode Agent</p>
            <p className="text-lg font-bold text-purple-700">Auto-Optimisé</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1 : Publications over time */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Volume de Publication par Jour</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={postsByDate}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="count" fill="#1e40af" radius={[4, 4, 0, 0]} name="Articles" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 : Content Styles Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Répartition des Formats (Styles)</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={postsByStyle}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {postsByStyle.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Leaderboards */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-bold">🏆 Top Produits qui Convertissent (Leaderboard)</h3>
        </div>
        <div className="p-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Clics</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productLeaderboard.map((prod, idx) => (
                <tr key={prod.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-6 w-6 text-gray-400 font-bold">
                        #{idx + 1}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{prod.name}</div>
                        <div className="text-xs text-gray-500">ID: {prod.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {prod.clicks} clics
                    </span>
                  </td>
                </tr>
              ))}
              {productLeaderboard.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-gray-500 text-sm">
                    Pas encore assez de données de clics pour établir un classement.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
