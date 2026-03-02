
import { useState, useRef, type ButtonHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RippleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    children: React.ReactNode;
}

export default function RippleButton({ children, isLoading = false, className = '', onClick, ...props }: RippleButtonProps) {
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (buttonRef.current && !isLoading) {
            const rect = buttonRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const newRipple = { x, y, id: Date.now() };
            setRipples(prev => [...prev, newRipple]);

            if (onClick) onClick(e);

            setTimeout(() => {
                setRipples(prev => prev.filter(r => r.id !== newRipple.id));
            }, 600);
        }
    };

    return (
        <button
            ref={buttonRef}
            onClick={handleClick}
            disabled={isLoading || props.disabled}
            className={`relative overflow-hidden group ${className}`}
            {...props}
        >
            <span className={`relative z-10 flex items-center justify-center transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                {children}
            </span>

            {isLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center space-x-1">
                    <motion.div
                        className="w-1.5 h-1.5 bg-current rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                        className="w-1.5 h-1.5 bg-current rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                    />
                    <motion.div
                        className="w-1.5 h-1.5 bg-current rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                    />
                </div>
            )}

            <AnimatePresence>
                {ripples.map(ripple => (
                    <motion.span
                        key={ripple.id}
                        initial={{ scale: 0, opacity: 0.35 }}
                        animate={{ scale: 4, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="absolute bg-white/30 dark:bg-black/10 rounded-full pointer-events-none"
                        style={{
                            left: ripple.x,
                            top: ripple.y,
                            width: 100,
                            height: 100,
                            transform: 'translate(-50%, -50%)',
                        }}
                    />
                ))}
            </AnimatePresence>
        </button>
    );
}
