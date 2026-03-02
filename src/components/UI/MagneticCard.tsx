
import { useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface MagneticCardProps {
    children: React.ReactNode;
    className?: string;
    intensity?: number;
}

export default function MagneticCard({ children, className = '', intensity = 15 }: MagneticCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
    const mouseX = useSpring(0, springConfig);
    const mouseY = useSpring(0, springConfig);

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [intensity, -intensity]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-intensity, intensity]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        mouseX.set(x);
        mouseY.set(y);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                mouseX.set(0);
                mouseY.set(0);
            }}
            whileTap={{ scale: 0.98 }}
            style={{
                rotateX: isHovered ? rotateX : 0,
                rotateY: isHovered ? rotateY : 0,
                transformPerspective: 1000
            }}
            className={`transition-all duration-300 ease-out ${className}`}
        >
            {children}
        </motion.div>
    );
}
