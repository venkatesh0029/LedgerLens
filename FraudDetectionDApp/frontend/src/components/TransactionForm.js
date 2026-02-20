import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';

const TransactionForm = () => {
    const { currentAccount, registryContract } = useWeb3();
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentAccount) {
            alert("Please connect your wallet first.");
            return;
        }

        setStatus('Analyzing transaction...');

        try {
            // 1. Send data to Flask ML backend
            const response = await fetch('http://localhost:5000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error("Prediction failed");
            }

            setStatus(`ML Prediction: ${result.isFraudulent ? 'Fraudulent' : 'Safe'}. Submitting to Blockchain...`);

            // 2. Submit to Blockchain via Smart Contract
            if (registryContract) {
                const tx = await registryContract.addTransaction(
                    ethers.parseEther(amount.toString()),
                    result.timestamp,
                    result.isFraudulent,
                    result.predictionHash
                );
                await tx.wait();
                setStatus('Transaction successfully recorded on blockchain!');
                setAmount('');
            } else {
                setStatus('Smart contract not connected.');
            }

        } catch (error) {
            console.error(error);
            setStatus('Error processing transaction.');
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px 0' }}>
            <h2>New Transaction</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Amount:</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={!amount}>Process Transaction</button>
            </form>
            {status && <p>{status}</p>}
        </div>
    );
};

export default TransactionForm;
