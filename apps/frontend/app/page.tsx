'use client';

import { useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useChainId,
} from 'wagmi';
import { injected } from '@wagmi/connectors';

// ==============================
// 🔹 CONFIG (ENV)
// ==============================
const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

if (!CONTRACT_ADDRESS) {
  throw new Error('Contract address not found in env');
}

// ==============================
// 🔹 ABI
// ==============================
const SIMPLE_STORAGE_ABI = [
  {
    inputs: [],
    name: 'getValue',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_value', type: 'uint256' }],
    name: 'setValue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// ==============================
// 🔹 UTILS
// ==============================
const shortenAddress = (addr?: string) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

export default function Page() {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  const [inputValue, setInputValue] = useState('');
  const [txStatus, setTxStatus] = useState<string | null>(null);

  const { data: value, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SIMPLE_STORAGE_ABI,
    functionName: 'getValue',
  });

  const { writeContract, isPending: isWriting } = useWriteContract();

  const handleSetValue = () => {
    if (!inputValue || isNaN(Number(inputValue))) {
      setTxStatus('Invalid input value');
      return;
    }

    setTxStatus('Transaction submitted...');

    writeContract(
      {
        address: CONTRACT_ADDRESS,
        abi: SIMPLE_STORAGE_ABI,
        functionName: 'setValue',
        args: [BigInt(inputValue)],
      },
      {
        onSuccess: () => {
          setTxStatus('Transaction success ✅');
          setInputValue('');
          refetch();
        },
        onError: (error) => {
          setTxStatus(error?.message || 'Transaction failed ❌');
        },
      }
    );
  };

  const isWrongNetwork = chainId !== 43113 && chainId !== 43114;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center text-white px-4">
      <div className="w-full max-w-md bg-slate-900/90 border border-violet-500/20 rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.15)] p-6 space-y-6">

        {/* HEADER */}
        <header className="text-center">
          <h1 className="text-2xl font-bold tracking-wide text-violet-400">
            Avalanche dApp
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Simple Storage Smart Contract
          </p>
        </header>

        {/* WALLET */}
        {!isConnected ? (
          <button
            onClick={() => connect({ connector: injected() })}
            disabled={isConnecting}
            className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 transition font-medium disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div className="flex items-center justify-between bg-slate-950 border border-violet-500/20 rounded-lg px-4 py-3 text-sm">
            <div>
              <p className="font-mono text-violet-400">
                {shortenAddress(address)}
              </p>
              <p className="text-xs text-white/40">
                Chain ID: {chainId}
              </p>
            </div>
            <button
              onClick={() => disconnect()}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Disconnect
            </button>
          </div>
        )}

        {/* NETWORK WARNING */}
        {isConnected && isWrongNetwork && (
          <p className="text-center text-xs text-red-400">
            Switch to Avalanche Fuji or Mainnet
          </p>
        )}

        {/* READ VALUE */}
        <div className="bg-slate-950 border border-violet-500/20 rounded-lg p-4 text-center">
          <p className="text-xs text-white/40 mb-1">Stored Value</p>
          <p className="text-3xl font-mono font-semibold text-violet-400">
            {isLoading ? '...' : value?.toString()}
          </p>
        </div>

        {/* WRITE VALUE */}
        <div className="space-y-3">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="New value"
            className="w-full bg-slate-950 border border-violet-500/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
          />

          <button
            onClick={handleSetValue}
            disabled={isWriting || isWrongNetwork}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition font-medium disabled:opacity-50"
          >
            {isWriting ? 'Updating...' : 'Set Value'}
          </button>

          {txStatus && (
            <p className="text-center text-xs text-white/60">
              {txStatus}
            </p>
          )}
        </div>

        {/* FOOTER */}
        <footer className="pt-4 border-t border-violet-500/20 text-center text-xs text-white/40">
          <p>
            Nama:{' '}
            <span className="text-white/70">
              Raya Astri Rinzani
            </span>
          </p>
          <p>
            NIM:{' '}
            <span className="text-white/70">
              I231011401930
            </span>
          </p>
        </footer>

      </div>
    </main>
  );
}
