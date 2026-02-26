import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ShieldAlert, ShieldCheck, AlertCircle, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { ethers } from 'ethers';

// Placeholder Contract Address - In a real scenario, this would be the deployed testnet address
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";
// Minimal ABI to call registerTitle
const CONTRACT_ABI = [
  "function registerTitle(bytes32 _titleHash) public",
  "function isRegistered(bytes32) public view returns (bool)"
];

function App() {
  const [title, setTitle] = useState('');
  const [hindiTitle, setHindiTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Blockchain State
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [txLoading, setTxLoading] = useState(false);

  // Public Verification State
  const [lookupHash, setLookupHash] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);

  // Check if wallet is already connected
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
        }
      } catch (err) {
        console.error("Wallet connection check failed:", err);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to interact with the blockchain.");
      return;
    }
    if (isConnectingWallet) return;

    setIsConnectingWallet(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletConnected(true);
      setWalletAddress(accounts[0]);
    } catch (err) {
      console.error("Wallet connection failed:", err);
      if (err.code === -32002) {
        alert("A connection request is already pending. Please open the MetaMask extension popup to accept it.");
      } else if (err.code === 4001) {
        console.log("User rejected the wallet connection request.");
      } else {
        alert("Wallet connection failed. See console for details.");
      }
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const logToBlockchain = async () => {
    if (!window.ethereum || !walletConnected) {
      alert("Please connect your wallet first.");
      return;
    }

    setTxLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Hash the title locally (same logic the PRGI would use to verify later)
      const titleBytes = ethers.toUtf8Bytes(title.toLowerCase().trim());
      const titleHash = ethers.keccak256(titleBytes);

      console.log(`Sending transaction to register hash: ${titleHash}`);

      // Call contract
      const tx = await contract.registerTitle(titleHash);

      console.log("Transaction dispatched:", tx.hash);
      setTxHash(tx.hash);

      // Wait for confirmation
      await tx.wait();
      console.log("Transaction confirmed!");

    } catch (err) {
      console.error("Blockchain error:", err);
      if (err.reason) {
        alert(`Transaction failed: ${err.reason}`);
      } else {
        alert("Transaction rejected or failed. See console for details.");
      }
    } finally {
      setTxLoading(false);
    }
  };

  const handleHashLookup = async (e) => {
    e.preventDefault();
    if (!lookupHash || !lookupHash.startsWith("0x") || lookupHash.length !== 66) {
      alert("Please enter a valid 32-byte Keccak-256 hash (starting with 0x).");
      return;
    }

    setLookupLoading(true);
    setLookupResult(null);
    try {
      // Connect to public provider (don't need wallet connected just to read)
      let provider;
      if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        // Fallback to a public RPC if no metamask (e.g., Sepolia public RPC)
        provider = new ethers.JsonRpcProvider("https://rpc.sepolia.org");
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const isRegistered = await contract.isRegistered(lookupHash);
      setLookupResult(isRegistered);
    } catch (err) {
      console.error("Lookup error:", err);
      alert("Failed to query the blockchain network.");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!title) {
      setError('English Title Name is required');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // POST to FastAPI backend
      const response = await axios.post('http://127.0.0.1:8000/verify', {
        title: title,
        hindi_title: hindiTitle
      });
      setResult(response.data);
    } catch (err) {
      // Avoid destructuring error object to prevent UI crashes, use optional chaining securely
      const detail = err?.response?.data?.detail || err?.message || 'An error occurred while connecting to the verification engine.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Wallet Connection Bar */}
        <div className="flex justify-end mb-4">
          {walletConnected ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <span className="w-2 h-2 mr-2 bg-green-500 rounded-full"></span>
              {walletAddress.substring(0, 6)}...{walletAddress.substring(38)} connected
            </span>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnectingWallet}
              className={`text-sm font-medium transition-colors ${isConnectingWallet ? 'text-gray-400 cursor-wait' : 'text-indigo-600 hover:text-indigo-800'}`}
            >
              {isConnectingWallet ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            PRGI Title Verification
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Submit a new publication title to check compliance and uniqueness against the 160k+ registry.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Proposed English Title *</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                    placeholder="e.g., The Daily Chronicle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Hindi/Regional Title (Optional)</label>
                <div className="mt-1">
                  <input
                    type="text"
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-sans"
                    placeholder="e.g., दैनिक क्रॉनिकल"
                    value={hindiTitle}
                    onChange={(e) => setHindiTitle(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0"><AlertCircle className="h-5 w-5 text-red-400" /></div>
                    <div className="ml-3"><h3 className="text-sm font-medium text-red-800">{error}</h3></div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white transition-all ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Registry...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Search className="mr-2 h-5 w-5" /> Verify Title
                  </span>
                )}
              </button>
            </form>
          </div>

          {result && (
            <div className={`border-t-4 p-8 transition-all ${result.approved ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {result.approved ? (
                    <ShieldCheck className="h-12 w-12 text-green-600" />
                  ) : (
                    <ShieldAlert className="h-12 w-12 text-red-600" />
                  )}
                  <div>
                    <h2 className={`text-2xl font-bold ${result.approved ? 'text-green-800' : 'text-red-800'}`}>
                      {result.approved ? 'Verification Passed' : 'Verification Rejected'}
                    </h2>
                    <p className="text-sm opacity-75 mt-1">Processed in {result.inference_time_seconds}s</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-4xl font-extrabold text-gray-900">{result.probability}%</div>
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Probability</div>
                  {result.confidence_bucket && (
                    <div className="mt-2 text-sm font-bold text-gray-800">{result.confidence_bucket}</div>
                  )}
                </div>
              </div>

              {/* CONCEPT TAGS */}
              {result.tags && result.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {result.tags.map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      # {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Primary Reason:</h3>
                <p className="text-gray-700 bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-lg">
                  {result.reason}
                </p>
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Pipeline Analysis Breakdown</h4>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">A</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Hard Rule Compliance</p>
                      <p className="text-sm text-gray-500">{result.stages.A}</p>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">B</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Lexical & Phonetic Check</p>
                      <p className="text-sm text-gray-500">{result.stages.B}</p>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">C</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">AI Semantic Check</p>
                      <p className="text-sm text-gray-500">{result.stages.C}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AUDIT LINEAGE */}
              {result.model_version && (
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Audit & Lineage Data</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 font-mono bg-gray-50 p-3 rounded-lg">
                    <div><strong>Model:</strong> {result.model_version}</div>
                    <div><strong>Ruleset:</strong> {result.ruleset_version}</div>
                    <div><strong>Index Time:</strong> {result.index_timestamp}</div>
                    <div><strong>Time:</strong> {result.inference_time_seconds}s</div>
                  </div>
                </div>
              )}

              {result.top_k_matches && result.top_k_matches.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Top Similar Titles Found</h4>
                  <ul className="space-y-2">
                    {result.top_k_matches.map((match, idx) => (
                      <li key={idx} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                        <span className="font-medium text-gray-800">{match.title}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-indigo-600">{match.score}%</span>
                          <p className="text-xs text-gray-500">via {match.stage}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.suggestions && result.suggestions.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Smart Renaming Suggestions</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.suggestions.map((sug, idx) => (
                      <span key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100">
                        {sug}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* BLOCKCHAIN ACTION CALL */}
              {result.approved && (
                <div className="mt-8 border-t-2 border-green-200 pt-6">
                  <div className="bg-white p-6 rounded-xl shadow-inner border border-green-100 text-center">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Immutable Blockchain Registry</h4>
                    <p className="text-sm text-gray-600 mb-6">
                      Your title has passed verification. You may now permanently log an immutable proof-of-approval signature onto the Ethereum Testnet.
                    </p>

                    {txHash ? (
                      <div className="bg-green-50 p-4 rounded-lg flex flex-col items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                        <p className="text-green-800 font-medium">Successfully Logged to Blockchain</p>
                        <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline mt-2 flex items-center">
                          View Transaction on Sepolia Etherscan <LinkIcon className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    ) : (
                      <button
                        onClick={logToBlockchain}
                        disabled={txLoading}
                        className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${txLoading ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                      >
                        {txLoading ? 'Signing Transaction...' : 'Sign & Log Approval Hash'}
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* PUBLIC VERIFICATION PORTAL */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl overflow-hidden border-t-8 border-indigo-900">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Public Ledger Verification</h2>
            <p className="text-gray-600 mb-6">Auditors and the public can paste an SHA3 (Keccak-256) hash below to verify mathematically if a specific title has been approved and logged into the PRGI smart contract.</p>

            <form onSubmit={handleHashLookup} className="flex space-x-4">
              <input
                type="text"
                required
                className="flex-1 appearance-none border border-gray-300 rounded-xl shadow-sm px-4 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                placeholder="0x..."
                value={lookupHash}
                onChange={(e) => setLookupHash(e.target.value)}
              />
              <button
                type="submit"
                disabled={lookupLoading}
                className={`px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white transition-all ${lookupLoading ? 'bg-indigo-400' : 'bg-indigo-900 hover:bg-black'}`}
              >
                {lookupLoading ? 'Querying Chain...' : 'Lookup Hash'}
              </button>
            </form>

            {lookupResult !== null && (
              <div className={`mt-6 p-4 rounded-xl flex items-center ${lookupResult ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                {lookupResult ? (
                  <>
                    <ShieldCheck className="h-6 w-6 mr-3 text-green-600" />
                    <span className="font-semibold text-lg">Verified: This Hash exists on the PRGI Blockchain Registry.</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-6 w-6 mr-3 text-red-600" />
                    <span className="font-semibold text-lg">Not Found: This Hash has never been registered.</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
