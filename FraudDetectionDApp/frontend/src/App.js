import React from 'react';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import TransactionForm from './components/TransactionForm';

const MainApp = () => {
  const { currentAccount, connectWallet, trustScoreContract } = useWeb3();
  const [trustScore, setTrustScore] = React.useState(null);

  React.useEffect(() => {
    const fetchScore = async () => {
      if (trustScoreContract && currentAccount) {
        try {
          const score = await trustScoreContract.getScore(currentAccount);
          const scoreVal = score !== undefined ? score.toString() : '50';
          setTrustScore(scoreVal === '0' ? '50' : scoreVal); // default to 50 if zero uninitialized
        } catch (error) {
          console.error("Error fetching score:", error);
          setTrustScore('50'); // fallback default
        }
      }
    };
    fetchScore();
  }, [trustScoreContract, currentAccount]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Decentralized Fraud Detection DApp</h1>

      <div style={{ marginBottom: '20px' }}>
        {!currentAccount ? (
          <button onClick={connectWallet} style={{ padding: '10px', fontSize: '16px' }}>
            Connect MetaMask
          </button>
        ) : (
          <div>
            <p><strong>Connected Account:</strong> {currentAccount}</p>
            <p><strong>Trust Score:</strong> {trustScore !== null ? trustScore : 'Loading...'}/100</p>
          </div>
        )}
      </div>

      {currentAccount && (
        <>
          <TransactionForm />
          {/* Placeholder for Dashboard Component */}
          <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px 0' }}>
            <h2>Dashboard</h2>
            <p>Transaction history and visualizations will appear here in the next phase.</p>
          </div>
        </>
      )}
    </div>
  );
};

function App() {
  return (
    <Web3Provider>
      <MainApp />
    </Web3Provider>
  );
}

export default App;
