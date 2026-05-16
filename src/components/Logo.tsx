import { motion } from 'framer-motion';

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <motion.div 
      className={`relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-400 overflow-hidden shadow-lg ${className}`}
      whileHover={{ scale: 1.05, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div 
        className="absolute inset-0 bg-zinc-950 rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-950 z-10">
        <path d="M4 19.5C4 18.837 4.53726 18.3 5.2 18.3H18.8C19.4627 18.3 20 18.837 20 19.5C20 20.163 19.4627 20.7 18.8 20.7H5.2C4.53726 20.7 4 20.163 4 19.5Z" fill="currentColor"/>
        <path d="M12.9238 3.52984L18.8369 8.26127C19.4998 8.79159 19.6105 9.75704 19.0833 10.4132L12.5297 18.5694C12.0025 19.2255 11.0371 19.3353 10.3742 18.805L4.46114 14.0736C3.79822 13.5433 3.68748 12.5778 4.21471 11.9217L10.7683 3.76551C11.2955 3.10935 12.2609 2.99953 12.9238 3.52984Z" fill="currentColor"/>
      </svg>
    </motion.div>
  );
}
