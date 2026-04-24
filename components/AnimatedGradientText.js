import React from 'react';
import styles from './AnimatedGradientText.module.css';

export default function AnimatedGradientText({ children }) {
  return (
    <span className={styles.animatedGradientText}>
      {children}
    </span>
  );
}
