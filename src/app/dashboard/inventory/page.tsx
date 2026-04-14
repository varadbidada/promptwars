"use client";

import { motion } from "framer-motion";
import { Package, Truck, AlertTriangle, ArrowRightLeft, Clock, BarChart3, ShoppingBag } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, 
  Legend, ResponsiveContainer, ReferenceLine 
} from 'recharts';

export default function InventoryDashboard() {
  const stockData = [
    { id: 1, stand: "North Stand", item: "Beer", stock: 18, status: "Critical", color: "bg-red-500", text: "text-red-400", eta: "8 min" },
    { id: 2, stand: "East Stand", item: "Nachos", stock: 55, status: "OK", color: "bg-green", text: "text-green", eta: "-" },
    { id: 3, stand: "South Bar", item: "Water", stock: 9, status: "Critical", color: "bg-red-500", text: "text-red-400", eta: "5 min" },
    { id: 4, stand: "West Concourse", item: "Hot Dogs", stock: 42, status: "Low", color: "bg-amber", text: "text-amber", eta: "22 min" },
    { id: 5, stand: "VIP Lounge", item: "Wine", stock: 78, status: "OK", color: "bg-green", text: "text-green", eta: "-" }
  ];

  const forecastData = Array.from({ length: 10 }).map((_, i) => {
    // T+0 to T+90
    const isHalftime = i === 4; // T+40
    return {
      time: `T+${i * 10}`,
      Beer: Math.floor(100 + ((i * 19) % 50) + (isHalftime ? 200 : 0)),
      Water: Math.floor(80 + ((i * 13) % 30) + (isHalftime ? 120 : 0)),
      Nachos: Math.floor(50 + ((i * 23) % 40) + (isHalftime ? 150 : 0)),
    }
  });

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-navy border border-glass p-3 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <p className="text-gray-400 font-mono text-[10px] uppercase tracking-widest mb-3 border-b border-glass pb-1">{label}m Profile</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-6 mb-1.5">
              <span className="font-semibold text-sm flex items-center text-white">
                 <span className="w-2 h-2 rounded-full mr-2 shadow-sm" style={{ backgroundColor: entry.color }} />
                 {entry.name}
              </span>
              <span className="text-white font-mono text-sm font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-4 border-b border-glass gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white drop-shadow-md">Inventory Intelligence</h1>
              <p className="text-gray-400 text-sm mt-1">Real-time stock flow & predictive demand profiling</p>
          </motion.div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6 pb-12">
         
         {/* Left Column (Tables & Charts) */}
         <div className="xl:col-span-2 space-y-6">
            
            {/* Live Stock Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface/40 p-6 border border-glass rounded-xl shadow-lg">
               <h3 className="text-white font-heading font-semibold text-lg flex items-center mb-6 border-b border-glass pb-3">
                 <Package className="w-5 h-5 text-electric mr-2" />
                 Live Stock Status
               </h3>
               
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-glass text-gray-500 text-[10px] uppercase tracking-widest font-mono">
                       <th className="pb-3 font-semibold">Stand Region</th>
                       <th className="pb-3 font-semibold">Item</th>
                       <th className="pb-3 font-semibold min-w-[150px]">Active Stock Level</th>
                       <th className="pb-3 font-semibold">System Status</th>
                       <th className="pb-3 font-semibold text-right">Reorder ETA</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-glass/50">
                     {stockData.map((row, i) => (
                        <motion.tr 
                          key={row.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + (i * 0.1) }}
                          className="hover:bg-glass/10 transition-colors group"
                        >
                          <td className="py-4 text-white font-medium text-sm pr-4 whitespace-nowrap">{row.stand}</td>
                          <td className="py-4 text-gray-300 text-sm pr-4 whitespace-nowrap">{row.item}</td>
                          <td className="py-4 pr-8">
                             <div className="flex items-center space-x-3">
                                <span className={`text-[11px] font-mono font-bold w-9 ${row.text}`}>{row.stock}%</span>
                                <div className="flex-1 h-2 bg-navy rounded-full overflow-hidden border border-glass/30 shadow-inner">
                                   <motion.div 
                                      className={`h-full ${row.color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${row.stock}%` }}
                                      transition={{ duration: 1.5, delay: 0.5 + (i * 0.1), ease: "easeOut" }}
                                   />
                                </div>
                             </div>
                          </td>
                          <td className="py-4 pr-4">
                             <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                                row.status === 'Critical' ? 'bg-red-500/10 text-red-500 border border-red-500/30' :
                                row.status === 'Low' ? 'bg-amber/10 text-amber border border-amber/30' :
                                'bg-green/10 text-green border border-green/30'
                             }`}>
                                {row.status === 'Critical' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse" />}
                                {row.status}
                             </span>
                          </td>
                          <td className="py-4 text-right whitespace-nowrap">
                             <span className="text-gray-400 font-mono text-[11px] flex items-center justify-end font-semibold">
                               {row.eta !== "-" && <Clock className="w-3.5 h-3.5 mr-1.5 opacity-50" />}
                               {row.eta}
                             </span>
                          </td>
                        </motion.tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </motion.div>

            {/* Demand Forecast Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-surface/40 p-6 border border-glass rounded-xl shadow-lg">
               <h3 className="text-white font-heading font-semibold text-lg flex items-center mb-6 border-b border-glass pb-3">
                 <BarChart3 className="w-5 h-5 text-amber mr-2" />
                 Predicted Demand Overlap (Next 90 Min)
               </h3>
               <div className="h-[350px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" tick={{fill: '#9CA3AF', fontSize: 10, fontFamily: 'monospace'}} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: '#9CA3AF', fontSize: 10, fontFamily: 'monospace'}} tickLine={false} axisLine={false} dx={-10} />
                      <ChartTooltip content={<CustomChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2, strokeDasharray: '4 4' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '20px', fontWeight: 'bold' }} />
                      <ReferenceLine x="T+40" stroke="rgba(255, 184, 48, 0.4)" strokeDasharray="3 3" strokeWidth={2} label={{ position: 'top', value: 'HALFTIME SPIKE', fill: '#FFB830', fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace', dy: -10 }} />
                      
                      <Line type="monotone" dataKey="Beer" stroke="#00E5FF" strokeWidth={3} dot={{r:4, fill: '#080C1A', strokeWidth: 2}} activeDot={{r:6, fill: '#00E5FF', strokeWidth: 0, stroke: '#fff'}} animationDuration={2000} />
                      <Line type="monotone" dataKey="Nachos" stroke="#FFB830" strokeWidth={3} dot={{r:4, fill: '#080C1A', strokeWidth: 2}} activeDot={{r:6, fill: '#FFB830', strokeWidth: 0}} animationDuration={2000} />
                      <Line type="monotone" dataKey="Water" stroke="#00F0A0" strokeWidth={3} dot={{r:4, fill: '#080C1A', strokeWidth: 2}} activeDot={{r:6, fill: '#00F0A0', strokeWidth: 0}} animationDuration={2000} />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
            </motion.div>

         </div>

         {/* Right Sidebar (Action Panels & Alerts) */}
         <div className="space-y-6">
            
            {/* Smart Pre-Order Panel */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-electric/5 border border-electric/30 rounded-xl p-6 relative overflow-hidden shadow-lg">
               <div className="absolute -right-6 -top-6 w-32 h-32 bg-electric/20 rounded-full blur-[40px] pointer-events-none" />
               <div className="flex items-center space-x-3 mb-4">
                 <div className="w-10 h-10 rounded-full bg-electric/20 flex items-center justify-center border border-electric/40">
                   <ShoppingBag className="w-5 h-5 text-electric animate-pulse" />
                 </div>
                 <div>
                    <h3 className="text-white font-heading font-bold text-lg">Smart Pre-orders</h3>
                    <p className="text-[10px] text-electric font-mono tracking-widest uppercase mt-0.5 font-bold">Fulfillment Pipeline</p>
                 </div>
               </div>
               
               <p className="text-4xl font-heading font-bold text-white mb-1 tracking-tight drop-shadow-md">2,840</p>
               <p className="text-[13px] text-gray-400 mb-6 font-medium">pre-orders pending halftime execution</p>
               
               <div className="space-y-3">
                  {[
                    { item: "Beer (Draft)", count: "1,240", stand: "East Stand + Main Hub" },
                    { item: "Hot Dogs", count: "890", stand: "West Concourse" },
                    { item: "Water", count: "710", stand: "All Stands" }
                  ].map((p, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.02 }}
                      className="bg-navy/60 border border-glass p-3.5 rounded-lg flex flex-col backdrop-blur-sm transition-transform cursor-pointer"
                    >
                       <div className="flex justify-between items-center mb-1.5">
                          <span className="text-white text-[13px] font-bold">{p.item}</span>
                          <span className="text-electric text-[13px] font-mono font-bold bg-electric/10 px-2 py-0.5 rounded shadow-inner">{p.count}</span>
                       </div>
                       <span className="text-[11px] text-gray-400 font-medium tracking-wide">Pickups: {p.stand}</span>
                    </motion.div>
                  ))}
               </div>
            </motion.div>

            {/* Crowd Redirect Suggestion */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-surface/50 border border-glass rounded-xl p-6 shadow-lg group hover:border-glass/80 transition-colors relative overflow-hidden">
               <div className="absolute left-0 top-0 h-full w-1 bg-gray-500 opacity-50" />
               <h3 className="text-white font-heading font-bold text-[13px] flex items-center mb-4 uppercase tracking-widest text-gray-400">
                 <ArrowRightLeft className="w-4 h-4 mr-2" />
                 Crowd Flow Adjustment
               </h3>
               <p className="text-[14px] text-gray-300 leading-relaxed mb-4">
                 Fans seeking <strong className="text-white">beer</strong> at <span className="text-red-400 font-bold border-b border-red-500/30">North Stand (Critical)</span>
               </p>
               <div className="p-3.5 bg-electric/10 border border-electric/20 rounded-lg flex items-start space-x-3 mb-2 shadow-inner">
                 <div className="w-2 h-2 rounded-full bg-electric mt-1.5 shrink-0 animate-ping" />
                 <p className="text-[12px] text-electric leading-relaxed font-mono tracking-tight font-semibold">
                   → Redirecting 1,200 app users to <strong className="text-white bg-navy px-1.5 py-0.5 rounded ml-1 border border-glass shadow">East Stand</strong> which possesses adequate stock.
                 </p>
               </div>
            </motion.div>

            {/* Restock Alert */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-gradient-to-br from-amber/20 to-surface border border-amber/30 rounded-xl p-6 shadow-[0_10px_30px_rgba(255,184,48,0.15)] relative backdrop-blur-md">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-amber rounded-l-xl opacity-80" />
               <h3 className="text-amber font-heading font-bold text-xs flex items-center mb-3 uppercase tracking-widest drop-shadow-md">
                 <AlertTriangle className="w-4 h-4 mr-2" />
                 Active Logistics Alert
               </h3>
               <div className="flex items-center space-x-4 mt-4">
                 <div className="w-12 h-12 bg-amber/10 rounded-full flex items-center justify-center border border-amber/20 shrink-0">
                    <Truck className="w-6 h-6 text-amber drop-shadow-md" />
                 </div>
                 <div>
                    <p className="text-white font-semibold text-sm">Approaching Restock Unit</p>
                    <p className="text-amber text-xl font-mono font-black mt-0.5 tracking-tighter drop-shadow-sm">ETA: 12 MIN</p>
                 </div>
               </div>
               <div className="mt-5 bg-navy/50 border border-amber/10 p-3 rounded-lg flex items-center space-x-2">
                 <div className="w-1.5 h-1.5 bg-amber rounded-full animate-pulse" />
                 <p className="text-[11px] text-gray-300 font-mono tracking-widest uppercase">
                   Routing: Gate G service entrance
                 </p>
               </div>
            </motion.div>

         </div>
      </div>
    </>
  );
}
