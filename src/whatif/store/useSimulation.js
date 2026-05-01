import { useEffect, useState } from "react";
import { useWhatifStore } from "./whatifStore";

export function useSimulation(moduleId, calculator) {
  const inputs = useWhatifStore(s => s.inputs[moduleId]);
  const [output, setOutput] = useState(null);
  
  // Debounced calc — slider hareket ettikçe 50ms bekleyip hesapla
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputs) {
        const result = calculator(inputs);
        setOutput(result);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [JSON.stringify(inputs), calculator]);
  
  return output;
}
