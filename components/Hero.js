import React from 'react';
import { motion } from 'framer-motion';
import styles from './Hero.module.css';

export default function Hero({ children, heading, subtext, illustrationSrc }) {
  return (
    <section className={styles.hero}>
      <motion.h1 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className={styles.heading}
      >
        {heading}
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }} 
        className={styles.subtext}
      >
        {subtext}
      </motion.p>
      
      {illustrationSrc && (
        <div className={styles.illustrationWrapper}>
            <img src={illustrationSrc} alt="Hero illustration" className={styles.illustration} />
        </div>
      )}

      <div className={styles.inputGroup}>
        {children}
      </div>
    </section>
  );
}
