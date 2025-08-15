'use client';

import { useState } from 'react';
import { X, Download, Share2, ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ExecutionStep {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  timestamp?: string;
  txHash?: string;
}

interface Execution {
  executionId: string;
  ruleId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  estimatedDuration?: string;
  progress?: number;
  steps?: ExecutionStep[];
  amount?: string;
  asset?: string;
  destination?: string;
  fromChain?: string;
  toChain?: string;
  fee?: string;
  txHash?: string;
}

interface ReceiptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  execution: Execution;
}

export default function ReceiptDrawer({ isOpen, onClose, execution }: ReceiptDrawerProps) {
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'PENDING':
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'FAILED':
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'completed':
        return 'text-green-600';
      case 'PENDING':
      case 'in_progress':
        return 'text-blue-600';
      case 'FAILED':
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Transaction Receipt',
          text: `Ferrow transaction ${execution.executionId}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(execution.executionId);
        alert('Execution ID copied to clipboard');
      }
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = () => {
    const receiptData = {
      executionId: execution.executionId,
      timestamp: execution.createdAt,
      status: execution.status,
      amount: execution.amount,
      asset: execution.asset,
      destination: execution.destination,
      fee: execution.fee,
      txHash: execution.txHash
    };

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ferrow-receipt-${execution.executionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full sm:w-auto sm:min-w-[500px] sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden">
        {/* Handle (mobile only) */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 sm:hidden" />
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Transaction Receipt</h2>
            <p className="text-sm text-gray-500 font-mono">
              {execution.executionId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Status Section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              {getStatusIcon(execution.status)}
              <div>
                <h3 className={`font-semibold ${getStatusColor(execution.status)}`}>
                  {execution.status === 'SUCCESS' ? 'Transaction Completed' :
                   execution.status === 'PENDING' ? 'Transaction In Progress' :
                   'Transaction Failed'}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(execution.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {execution.status === 'PENDING' && execution.progress && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{execution.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${execution.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Transaction Details */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Transaction Details</h3>
            <div className="space-y-3">
              {execution.amount && execution.asset && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-semibold">{execution.amount} {execution.asset}</span>
                </div>
              )}
              
              {execution.destination && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Destination</span>
                  <span className="font-mono text-sm text-gray-900 break-all">
                    {execution.destination.slice(0, 6)}...{execution.destination.slice(-4)}
                  </span>
                </div>
              )}
              
              {execution.fromChain && execution.toChain && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Route</span>
                  <span className="capitalize">
                    {execution.fromChain} → {execution.toChain}
                  </span>
                </div>
              )}
              
              {execution.fee && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee</span>
                  <span className="font-semibold">{execution.fee}</span>
                </div>
              )}
              
              {execution.txHash && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Transaction Hash</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">
                      {execution.txHash.slice(0, 6)}...{execution.txHash.slice(-4)}
                    </span>
                    <button className="text-blue-500 hover:text-blue-600">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Execution Steps */}
          {execution.steps && execution.steps.length > 0 && (
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Execution Steps</h3>
              <div className="space-y-3">
                {execution.steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {getStatusIcon(step.status)}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{step.name}</p>
                      {step.timestamp && (
                        <p className="text-sm text-gray-500">
                          {new Date(step.timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                    {step.txHash && (
                      <button className="text-blue-500 hover:text-blue-600">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}