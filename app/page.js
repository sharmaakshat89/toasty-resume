'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEnter = () => {
    if (['akshatresume', 'soupyresume', '220394'].includes(token)) {
      router.push('/tech-resume');
    } else {
      setError('Invalid Access Token. Are you authorized?');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleEnter();
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '1rem' }}>
      <div className="neo-box" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Tech Resume</h1>
        <p style={{ fontWeight: 'bold', marginBottom: '2rem', background: 'var(--bg-black)', color: 'white', padding: '0.5rem' }}>AUTHORIZED ACCESS ONLY</p>
        
        <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>ACCESS TOKEN</label>
          <input 
            className="neo-input" 
            value={token} 
            onChange={e => setToken(e.target.value)} 
            onKeyDown={handleKeyDown}
            type="password"
            placeholder="Enter token..."
          />
        </div>
        
        {error && <div style={{ color: 'white', background: 'var(--bg-red)', padding: '0.5rem', border: '3px solid black', fontWeight: 'bold', marginBottom: '1rem' }}>{error}</div>}
        
        <button className="neo-button" onClick={handleEnter} style={{ width: '100%', fontSize: '1.2rem', padding: '1rem' }}>ENTER SYSTEM</button>
      </div>
    </div>
  );
}