'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import Lenis from 'lenis';
import styles from './page.module.css';
import Hero from '../components/Hero';
import AnimatedBeam from '../components/AnimatedBeam';
import heroStyles from '../components/Hero.module.css'; // Import Hero styles

export default function Home() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  const handleEnter = () => {
    if (['akshatresume', 'soupyresume', '220394'].includes(token)) {
      router.push('/tech-resume');
    } else {
      setError('Invalid Access Token. Are you authorized?');
    }
  };

  return (
    <div className={styles.page}>
      <AnimatedBeam />
      
      <motion.div style={{ y }}>
        <Hero 
          heading="That resume of yours… got more fluff than a saloon pillow."
          subtext="Seen a lotta resumes in my day. Most of ’em deserved a shorter life."
          illustrationSrc="/hero.png"
        >
          <input 
            className={heroStyles.input} 
            value={token} 
            onChange={e => setToken(e.target.value)} 
            type="password"
            placeholder="Enter token..."
          />
          <button className={heroStyles.button} onClick={handleEnter}>Get Started</button>
        </Hero>
        {error && <div className={styles.error}>{error}</div>}
      </motion.div>

      <section className={styles.trustStrip}>
          <span>TAHITI</span>
          <span>MANGOES</span>
          <span>DREAM</span>
      </section>

      <motion.section style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]) }} className={`${styles.section} ${styles.splitSection}`}>
        <div className={styles.splitText}>
          <h2>No bloat, just straight shootin’</h2>
          <p>This here resume builder ain’t gonna nickel and dime you like a saloon tab. No bloat, no nonsense just a clean, ATS-ready piece that rides straight into the shortlist.</p>
        </div>
        <div className={styles.splitIllustration}>
            <img src="/split.png" alt="Split illustration" className={styles.illustration} />
            <div className={styles.chatBubble}>Can we turn down the AC?</div>
        </div>
      </motion.section>
    </div>
  );
}
