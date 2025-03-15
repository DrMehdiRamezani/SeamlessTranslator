
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MicrophoneButtonProps {
  isActive: boolean;
  isDisabled: boolean;
  onClick: () => void;
  className?: string;
}

const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  isActive,
  isDisabled,
  onClick,
  className
}) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  let rippleCount = 0;

  // Create ripple effect
  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    const rect = button.getBoundingClientRect();
    
    // Ripple positioned relative to click position
    const x = event.clientX - rect.left - radius;
    const y = event.clientY - rect.top - radius;
    
    const newRipple = {
      id: rippleCount++,
      x,
      y
    };
    
    setRipples([...ripples, newRipple]);
    
    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(current => current.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  // Pulse animation for active state
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      let counter = 0;
      interval = setInterval(() => {
        if (buttonRef.current && counter % 4 === 0) {
          const button = buttonRef.current;
          const diameter = Math.max(button.clientWidth, button.clientHeight);
          const radius = diameter / 2;
          
          // Center the ripple
          const x = 0;
          const y = 0;
          
          const newRipple = {
            id: rippleCount++,
            x,
            y
          };
          
          setRipples(current => [...current, newRipple]);
          
          // Remove ripple after animation completes
          setTimeout(() => {
            setRipples(current => current.filter(ripple => ripple.id !== newRipple.id));
          }, 600);
        }
        counter++;
      }, 500);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  return (
    <button
      ref={buttonRef}
      className={cn(
        "relative overflow-hidden rounded-full w-12 h-12 flex items-center justify-center transition-all",
        isActive 
          ? "bg-primary text-white shadow-lg hover:bg-primary/90" 
          : "bg-secondary text-primary hover:bg-secondary/80",
        isDisabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={(e) => {
        if (!isDisabled) {
          createRipple(e);
          onClick();
        }
      }}
      disabled={isDisabled}
      aria-label="Toggle microphone"
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple absolute bg-white/30 rounded-full"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: Math.max(buttonRef.current?.clientWidth || 0, buttonRef.current?.clientHeight || 0) * 2,
            height: Math.max(buttonRef.current?.clientWidth || 0, buttonRef.current?.clientHeight || 0) * 2,
          }}
        />
      ))}
      {isActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
    </button>
  );
};

export default MicrophoneButton;
