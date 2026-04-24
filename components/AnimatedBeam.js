import React from 'react';
import styles from './AnimatedBeam.module.css';

export default function AnimatedBeam() {
  return (
    <div className={styles.beamContainer}>
      <svg className={styles.svg} viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d="M0,0 L100,100"
          className={styles.beamPath}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
