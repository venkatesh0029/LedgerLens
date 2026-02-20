from web3 import Web3
import json
import os

# Connect to Ganache
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))
if not w3.is_connected():
    print("Cannot connect to Ganache")
    exit(1)

# Set pre-funded account as default
w3.eth.default_account = w3.eth.accounts[0]

# Load compiled contracts
def deploy_contract(filename):
    with open(f"backend/blockchain/{filename}.json", "r") as f:
        compiled_data = json.load(f)
    
    contract_class = w3.eth.contract(
        abi=compiled_data['abi'],
        bytecode=compiled_data['bytecode']
    )
    
    # Submit the transaction that deploys the contract
    print(f"Deploying {filename}...")
    tx_hash = contract_class.constructor().transact()
    
    # Wait for the transaction to be mined, and get the transaction receipt
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    print(f"{filename} deployed at: {tx_receipt.contractAddress}")
    return tx_receipt.contractAddress

registry_addr = deploy_contract("TransactionRegistry")
trust_score_addr = deploy_contract("TrustScore")

# Update frontend .env
env_path = 'frontend/.env'
print(f"Updating {env_path}")
with open(env_path, 'w') as f:
    f.write(f"REACT_APP_REGISTRY_ADDRESS={registry_addr}\n")
    f.write(f"REACT_APP_TRUST_SCORE_ADDRESS={trust_score_addr}\n")

print("Deployment complete.")
