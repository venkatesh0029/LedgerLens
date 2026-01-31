import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/contexts/wallet-context";
import { switchToSepolia } from "@/lib/web3";
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function WalletConnect() {
  const { 
    isConnected, 
    address, 
    balance, 
    chainName, 
    isCorrectNetwork,
    connect, 
    disconnect, 
    isConnecting, 
    error 
  } = useWallet();
  const { toast } = useToast();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const openEtherscan = () => {
    if (address) {
      window.open(`https://sepolia.etherscan.io/address/${address}`, "_blank");
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToSepolia();
      toast({
        title: "Network Switched",
        description: "Successfully switched to Sepolia Testnet",
      });
    } catch (err: any) {
      toast({
        title: "Network Switch Failed",
        description: err.message || "Failed to switch network",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (error) {
      toast({
        title: "Wallet Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (!isConnected) {
    return (
      <Button
        onClick={connect}
        disabled={isConnecting}
        variant="default"
        className="gap-2"
        data-testid="button-connect-wallet"
      >
        <Wallet className="h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" data-testid="button-wallet-menu">
          <Wallet className="h-4 w-4" />
          <span className="font-mono" data-testid="text-wallet-address">{formatAddress(address!)}</span>
          {!isCorrectNetwork && (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          )}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64" data-testid="dropdown-wallet-menu">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="text-sm font-normal text-muted-foreground">Connected Wallet</span>
          <span className="font-mono text-xs" data-testid="text-wallet-full-address">{formatAddress(address!)}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="px-2 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Network</span>
            <div className="flex items-center gap-2">
              <Badge 
                variant={isCorrectNetwork ? "default" : "destructive"} 
                className="text-xs"
                data-testid="badge-network"
              >
                {chainName}
              </Badge>
              {!isCorrectNetwork && (
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6" 
                  onClick={handleSwitchNetwork}
                  title="Switch to Sepolia"
                  data-testid="button-switch-network"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-muted-foreground">Balance</span>
            <span className="text-sm font-mono" data-testid="text-wallet-balance">{balance} ETH</span>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={copyAddress} data-testid="button-copy-address">
          <Copy className="h-4 w-4 mr-2" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openEtherscan} data-testid="button-view-etherscan">
          <ExternalLink className="h-4 w-4 mr-2" />
          View on Etherscan
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={disconnect} 
          className="text-destructive focus:text-destructive"
          data-testid="button-disconnect-wallet"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
