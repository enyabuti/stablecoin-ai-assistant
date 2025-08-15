'use client';

import { useState } from 'react';
import { ChatComposer } from '@/components/ChatComposer';
import RuleJsonPreview from '@/components/RuleJsonPreview';
import { QuoteCard } from '@/components/QuoteCard';
import ReceiptDrawer from '@/components/ReceiptDrawer';
import { StickyActionBar } from '@/components/mobile/StickyActionBar';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { RuleJSONT } from '@/lib/llm/schema';
import { Quote } from '@/lib/routing/router';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

type FlowStep = 'chat' | 'rule' | 'quote' | 'confirm' | 'receipt';

interface Execution {
  executionId: string;
  ruleId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  estimatedDuration?: string;
  progress?: number;
  steps?: any[];
  amount?: string;
  asset?: string;
  destination?: string;
  fromChain?: string;
  toChain?: string;
  fee?: string;
  txHash?: string;
}

export default function GoldenFlowPage() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('chat');
  const [rule, setRule] = useState<RuleJSONT | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [execution, setExecution] = useState<Execution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRuleParsed = (parsedRule: RuleJSONT) => {
    setRule(parsedRule);
    setCurrentStep('rule');
    setError(null);
  };

  const handleRuleApproved = async (approvedRule: RuleJSONT) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/rules/route-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ruleJSON: approvedRule })
      });

      if (!response.ok) {
        throw new Error('Failed to get quote');
      }

      const data = await response.json();
      setQuote(data.quote);
      setCurrentStep('quote');
    } catch (error) {
      setError('Failed to get quote. Please try again.');
      console.error('Quote error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuoteConfirmed = async () => {
    if (!quote) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/rules/execute-now', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': `flow-${Date.now()}-${Math.random().toString(36).substring(2)}`
        },
        body: JSON.stringify({ ruleId: 'demo-rule-123' })
      });

      if (!response.ok) {
        throw new Error('Failed to execute rule');
      }

      const data = await response.json();
      
      // Create execution object from response
      const newExecution: Execution = {
        executionId: data.executionId,
        ruleId: 'demo-rule-123',
        status: data.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedDuration: '2-5 minutes',
        progress: data.execution?.progress || 25,
        steps: data.execution?.steps || [],
        amount: typeof rule?.amount === 'string' ? rule.amount : rule?.amount?.value?.toString(),
        asset: rule?.asset,
        destination: typeof rule?.destination === 'string' ? rule.destination : rule?.destination?.value,
        fromChain: rule?.fromChain,
        toChain: rule?.toChain,
        fee: `$${quote.feeEstimateUsd.toFixed(3)}`
      };
      
      setExecution(newExecution);
      setCurrentStep('receipt');
    } catch (error) {
      setError('Failed to execute rule. Please try again.');
      console.error('Execution error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'rule':
        setCurrentStep('chat');
        setRule(null);
        break;
      case 'quote':
        setCurrentStep('rule');
        setQuote(null);
        break;
      case 'confirm':
        setCurrentStep('quote');
        break;
      case 'receipt':
        setCurrentStep('quote');
        setExecution(null);
        break;
    }
    setError(null);
  };

  const handleReset = () => {
    setCurrentStep('chat');
    setRule(null);
    setQuote(null);
    setExecution(null);
    setError(null);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'chat': return 'Describe Your Rule';
      case 'rule': return 'Review Rule';
      case 'quote': return 'Review Quote';
      case 'confirm': return 'Confirm Transaction';
      case 'receipt': return 'Transaction Receipt';
      default: return 'Create Rule';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'chat': return 'Tell us what you want to automate in plain English';
      case 'rule': return 'Review and edit your automation rule';
      case 'quote': return 'Review the routing and fees for your transaction';
      case 'confirm': return 'Confirm and execute your rule';
      case 'receipt': return 'Your transaction has been processed';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-[calc(env(safe-area-inset-bottom)+120px)] sm:pb-8">
      {/* Mobile Header */}
      <MobileHeader 
        title={getStepTitle()} 
      />

      {/* Desktop Header */}
      <div className="hidden sm:block bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{getStepTitle()}</h1>
              <p className="text-gray-600 mt-1">{getStepDescription()}</p>
            </div>
            {currentStep !== 'chat' && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center">
            {['chat', 'rule', 'quote', 'receipt'].map((step, index) => {
              const stepNumber = index + 1;
              const isActive = currentStep === step;
              const isCompleted = ['chat', 'rule', 'quote', 'receipt'].indexOf(currentStep) > index;
              
              return (
                <div key={step} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${isActive ? 'bg-blue-600 text-white' : 
                      isCompleted ? 'bg-green-500 text-white' : 
                      'bg-gray-200 text-gray-600'}
                  `}>
                    {stepNumber}
                  </div>
                  {index < 3 && (
                    <div className={`
                      h-1 w-12 mx-2 rounded
                      ${isCompleted || (isActive && index < ['chat', 'rule', 'quote', 'receipt'].indexOf(currentStep)) 
                        ? 'bg-green-500' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Chat Step */}
        {currentStep === 'chat' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <ChatComposer
              onRuleParsed={handleRuleParsed}
              onError={setError}
            />
          </div>
        )}

        {/* Rule Step */}
        {currentStep === 'rule' && rule && (
          <RuleJsonPreview
            rule={rule}
            onApprove={handleRuleApproved}
            onReject={handleBack}
            editable
            onEdit={setRule}
          />
        )}

        {/* Quote Step */}
        {currentStep === 'quote' && quote && (
          <div className="space-y-6">
            <QuoteCard
              quote={quote}
              onConfirm={handleQuoteConfirmed}
              isLoading={isLoading}
              variant="desktop"
              className="sm:block hidden"
            />
            
            {/* Mobile Quote Display */}
            <div className="sm:hidden bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    ${quote.feeEstimateUsd.toFixed(3)}
                  </div>
                  <div className="text-sm text-gray-500">Est. Fee</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {quote.etaSeconds < 60 ? `${quote.etaSeconds}s` : `${Math.round(quote.etaSeconds / 60)}m`}
                  </div>
                  <div className="text-sm text-gray-500">ETA</div>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Route</span>
                  <span className="font-medium capitalize">{quote.chain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Explanation</span>
                  <span className="font-medium text-right max-w-48">{quote.explanation}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing...</h3>
            <p className="text-gray-600">Please wait while we process your request.</p>
          </div>
        )}
      </div>

      {/* Mobile Sticky Action Bar */}
      {currentStep === 'quote' && quote && !isLoading && (
        <StickyActionBar
          fee={`$${quote.feeEstimateUsd.toFixed(3)}`}
          eta={quote.etaSeconds < 60 ? `${quote.etaSeconds}s` : `${Math.round(quote.etaSeconds / 60)}m`}
          onConfirm={handleQuoteConfirmed}
          confirmText="Hold to Execute"
        />
      )}

      {/* Receipt Drawer */}
      {execution && (
        <ReceiptDrawer
          isOpen={currentStep === 'receipt'}
          onClose={handleReset}
          execution={execution}
        />
      )}
    </div>
  );
}