import json
import solcx
import os

try:
    solcx.install_solc('0.8.20')
except Exception:
    pass
solcx.set_solc_version('0.8.20')

print("Compiling contracts...")
compiled_sol = solcx.compile_files(
    ["contracts/TransactionRegistry.sol", "contracts/TrustScore.sol"],
    output_values=["abi", "bin"]
)

os.makedirs("frontend/src/contracts", exist_ok=True)
os.makedirs("backend/blockchain", exist_ok=True)

# Extract by specific key
registry_key = next(k for k in compiled_sol.keys() if 'TransactionRegistry' in k)
registry_interface = compiled_sol[registry_key]
registry_data = {"abi": registry_interface['abi'], "bytecode": registry_interface['bin']}
with open("frontend/src/contracts/TransactionRegistry.json", "w") as f:
    json.dump({"abi": registry_interface['abi']}, f)
with open("backend/blockchain/TransactionRegistry.json", "w") as f:
    json.dump(registry_data, f)

score_key = next(k for k in compiled_sol.keys() if 'TrustScore' in k)
score_interface = compiled_sol[score_key]
score_data = {"abi": score_interface['abi'], "bytecode": score_interface['bin']}
with open("frontend/src/contracts/TrustScore.json", "w") as f:
    json.dump({"abi": score_interface['abi']}, f)
with open("backend/blockchain/TrustScore.json", "w") as f:
    json.dump(score_data, f)

print("Saved JS and backend JSONs.")
