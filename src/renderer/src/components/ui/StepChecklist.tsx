import { useEffect, useState } from 'react';
import { Check, CircleDashed } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Step {
  label: string;
  duration: number; // milliseconds it takes to complete
}

interface StepChecklistProps {
  steps: Step[];
  onComplete: () => void;
  estimatedTime?: string;
}

export function StepChecklist({ steps, onComplete, estimatedTime }: StepChecklistProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= steps.length) {
      const timer = setTimeout(onComplete, 600); // Small pause when all are done
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCurrentStep(s => s + 1);
    }, steps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, steps, onComplete]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontFamily: 'var(--font-body)' }}>
      {steps.map((step, idx) => {
        const isCompleted = currentStep > idx;
        const isActive = currentStep === idx;
        const isPending = currentStep < idx;

        return (
          <div key={idx} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            opacity: isPending ? 0.35 : 1,
            transition: 'opacity 0.3s',
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isCompleted ? 'rgba(34,197,94,0.15)' : isActive ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.3)' : isActive ? 'var(--ma-accent)' : 'rgba(255,255,255,0.1)'}`,
            }}>
              {isCompleted ? (
                <Check size={10} style={{ color: 'var(--ma-green)' }} />
              ) : isActive ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <CircleDashed size={12} style={{ color: 'var(--ma-accent)' }} />
                </motion.div>
              ) : (
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
              )}
            </div>
            <span style={{
              fontSize: 13,
              color: isCompleted ? 'rgba(255,255,255,0.8)' : isActive ? '#FFF' : 'rgba(255,255,255,0.5)',
              textDecoration: isCompleted ? 'line-through' : 'none',
              textDecorationColor: 'rgba(255,255,255,0.2)',
            }}>
              {step.label}
            </span>
          </div>
        );
      })}
      
      {estimatedTime && (
        <div style={{
          marginTop: 8, paddingTop: 14, borderTop: '1px solid var(--ma-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estimated time</span>
          <span style={{ fontSize: 11, color: 'var(--ma-accent-light)', fontFamily: 'var(--font-mono)' }}>{estimatedTime}</span>
        </div>
      )}
    </div>
  );
}
