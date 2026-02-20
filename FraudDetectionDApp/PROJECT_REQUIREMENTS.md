# Project Name: Decentralized Data Integrity with ML-driven Anomaly Detection

## Overview
A hybrid Blockchain-AI model for Fraud Detection and Trust Management.

## Architecture
**Users -> DApp (React) -> Flask API -> ML Engine -> Database -> Cloud (AWS/GCP)**

## Key Domains Covered
*   **Blockchain**: Smart contracts, Ethereum network, decentralization.
*   **Machine Learning**: Fraud detection, anomaly detection, user scoring.
*   **Databases**: Transaction storage, feature extraction.
*   **Networking**: API communication between blockchain nodes.
*   **Cloud Computing**: Model + API deployment.
*   **Security**: Data hashing, access control, JWT authentication.

## Semester Breakdown & Milestones

### Phase 1: Setup & Minor Project (3rd Year - Semesters 3-1 & 3-2)
*   **3-1 Milestone (Research & Blockchain)**: Smart contracts + data flow.
*   **3-2 Milestone (Minor Project Submission)**: Working blockchain demo + small dataset (E-commerce Fraud Dataset).
    *   **Output**: 
        *   A working DApp that records transactions and basic fraud labels on the blockchain.
        *   Basic visualization of transactions + trust scores.

### Phase 2: Major Project (4th Year - Semesters 4-1 & 4-2)
*   **Goal**: Add AI Intelligence + Real-time Analytics.
*   **4-1 Milestone (ML Integration + Cloud Setup)**: Real-time fraud prediction model.
*   **4-2 Milestone (Major Project Final)**: Full hybrid system + paper/report.

#### Advanced Features (Phase 2):
1.  **ML Fraud Detection Engine**:
    *   Train ML/DL models (Random Forest, XGBoost, or LSTM) on transaction data.
    *   Predict fraudulent transactions in real-time.
    *   Store only the **hash of prediction** and score on the blockchain for integrity.
2.  **Blockchain Integration**:
    *   Add smart contract-based rewards/penalties based on ML predictions.
    *   Use oracles to fetch external data securely (Chainlink or custom API).
3.  **Trust Score System**:
    *   Each user/node has a dynamic Trust Score (based on past behavior).
    *   Stored and updated via smart contracts.
4.  **Security + Cloud**:
    *   Host the ML engine and dashboard on AWS/GCP.
    *   Secure blockchain node access via MetaMask + JWT auth.
5.  **Optional: Simple Visualization Dashboard**:
    *   Real-time fraud alerts.
    *   Trust score trends.
    *   Network visualization of transactions.

## Future Expansion (If you want to go beyond)
*   Integrate **LLMs** for explaining fraud reasoning in natural language.
*   Add **federated learning** to keep data private while improving models.
*   Create a **public API** that other systems can use for "trust verification".

## Possible Research / Paper Topics
*   "Hybrid Blockchain-AI Model for Fraud Detection and Trust Management"
*   "Decentralized Data Integrity with ML-driven Anomaly Detection"
*   "Secure and Explainable AI for Transaction Analysis on Blockchain"
