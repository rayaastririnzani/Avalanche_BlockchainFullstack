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
    <main className="min-h-screen bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_0_40px_rgba(99,102,241,0.2)] p-8 space-y-6">

        {/* HEADER */}
        <header className="text-center space-y-1">
          <h1 className="text-3xl font-extrabold tracking-wide">
            Avalanche dApp
          </h1>
          <p className="text-sm text-white/60">
            Simple Storage Smart Contract
          </p>
        </header>

        {/* WALLET */}
        {!isConnected ? (
          <button
            onClick={() => connect({ connector: injected() })}
            disabled={isConnecting}
            className="w-full py-3 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div className="rounded-xl bg-black/40 border border-white/10 p-4 flex justify-between items-center text-sm">
            <div className="space-y-1">
              <p className="text-white/70">
                {shortenAddress(address)}
              </p>
              <p className="text-xs text-white/50">
                Chain ID: {chainId}
              </p>
            </div>
            <button
              onClick={() => disconnect()}
              className="px-3 py-1.5 rounded-lg text-xs text-red-400 border border-red-500/40 hover:bg-red-500/20 transition"
            >
              Disconnect
            </button>
          </div>
        )}

        {/* NETWORK WARNING */}
        {isConnected && isWrongNetwork && (
          <p className="text-center text-xs text-red-400">
            Please switch to Avalanche Fuji or Mainnet
          </p>
        )}

        {/* READ VALUE */}
        <div className="rounded-xl bg-black/40 border border-white/10 p-4 text-center">
          <p className="text-xs text-white/50 mb-1">Stored Value</p>
          <p className="text-2xl font-mono font-bold text-indigo-400">
            {isLoading ? '...' : value?.toString()}
          </p>
        </div>

        {/* WRITE VALUE */}
        <div className="space-y-3">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter new value"
            className="w-full p-3 rounded-xl bg-black/40 border border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <button
            onClick={handleSetValue}
            disabled={isWriting || isWrongNetwork}
            className="w-full py-3 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 transition disabled:opacity-50"
          >
            {isWriting ? 'Updating...' : 'Set Value'}
          </button>

          {txStatus && (
            <p className="text-xs text-center text-white/60">
              {txStatus}
            </p>
          )}
        </div>

        {/* FOOTER */}
        <footer className="pt-4 border-t border-white/10 text-center text-xs text-white/40">
          <p>Nama: <span className="text-white/70">Raya Astri Rinzani</span></p>
          <p>NIM: <span className="text-white/70">I231011401930</span></p>
        </footer>
      </div>
    </main>
  );
}
