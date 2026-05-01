import React from 'react';
import { formatValue } from '../../utils/format';

export function SimulationSlider({ label, value, onChange, min, max, step, format, benchmark }) {
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <label className="font-semibold text-sm text-[#0F1223]">{label}</label>
        <span className="text-[#514BEE] font-mono font-bold text-sm bg-[#F3F1FF] px-2 py-0.5 rounded">
          {formatValue(value, format)}
        </span>
      </div>
      
      <div className="relative pt-2 pb-2">
        {/* Benchmark marker */}
        {benchmark && (
          <div
            className="absolute top-0 w-[2px] h-3 bg-[#B4B4C8] border-x border-white z-0"
            style={{ left: `${((benchmark.value - min) / (max - min)) * 100}%` }}
            title={benchmark.label}
          />
        )}
        
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="w-full relative z-10 accent-[#514BEE] h-1.5 bg-[#EDEDF0] rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      {benchmark && (
        <div className="text-xs text-[#7D7DA6] mt-1 font-medium flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#B4B4C8] inline-block"></span>
          {benchmark.label}
        </div>
      )}
    </div>
  );
}
