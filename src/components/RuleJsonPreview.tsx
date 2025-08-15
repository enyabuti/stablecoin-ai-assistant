'use client';

import { useState } from 'react';
import { RuleJSONT } from '@/lib/llm/schema';
import { Clock, DollarSign, Repeat, TrendingUp, Edit3, Check, X } from 'lucide-react';

interface RuleJsonPreviewProps {
  rule: RuleJSONT;
  onEdit?: (rule: RuleJSONT) => void;
  onApprove?: (rule: RuleJSONT) => void;
  onReject?: () => void;
  editable?: boolean;
  className?: string;
}

export default function RuleJsonPreview({ 
  rule, 
  onEdit, 
  onApprove, 
  onReject,
  editable = false,
  className = '' 
}: RuleJsonPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRule, setEditedRule] = useState<RuleJSONT>(rule);

  const handleSaveEdit = () => {
    onEdit?.(editedRule);
    setIsEditing(false);
  };

  const getRuleIcon = () => {
    switch (rule.type) {
      case 'schedule':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'conditional':
        return <TrendingUp className="h-5 w-5 text-purple-500" />;
      default:
        return <Repeat className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatAmount = (amount: any, asset: string) => {
    const value = typeof amount === 'string' ? amount : amount?.value || '0';
    return `${value} ${asset}`;
  };

  const formatSchedule = (schedule: any) => {
    if (!schedule) return 'One-time';
    
    const { frequency, dayOfWeek, dayOfMonth, startDate } = schedule;
    
    switch (frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return `Weekly on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek || 0]}`;
      case 'monthly':
        return `Monthly on day ${dayOfMonth || 1}`;
      case 'once':
        return `Once on ${new Date(startDate).toLocaleDateString()}`;
      default:
        return frequency;
    }
  };

  const formatCondition = (condition: any) => {
    if (!condition) return null;
    
    const { type, asset, operator, threshold } = condition;
    
    if (type === 'price') {
      return `When ${asset} price ${operator === 'gt' ? '>' : operator === 'lt' ? '<' : operator === 'gte' ? '≥' : '≤'} $${threshold}`;
    }
    
    return `${type}: ${operator} ${threshold}`;
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {getRuleIcon()}
          <div>
            <h3 className="font-semibold text-gray-900">
              {rule.type === 'schedule' ? 'Scheduled Rule' : 'Conditional Rule'}
            </h3>
            <p className="text-sm text-gray-500">
              {rule.description || 'Automated stablecoin transfer'}
            </p>
          </div>
        </div>
        
        {editable && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Rule Details */}
      <div className="p-4 space-y-4">
        {/* Amount & Asset */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="font-semibold text-gray-900">
              {formatAmount(rule.amount, rule.asset)}
            </p>
          </div>
        </div>

        {/* Destination */}
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Destination</p>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-mono text-gray-700 break-all">
              {typeof rule.destination === 'string' ? rule.destination : rule.destination?.value || 'Unknown'}
            </p>
          </div>
        </div>

        {/* Chains */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">From Chain</p>
            <p className="font-medium text-gray-900 capitalize">{rule.fromChain}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">To Chain</p>
            <p className="font-medium text-gray-900 capitalize">{rule.toChain}</p>
          </div>
        </div>

        {/* Trigger */}
        <div>
          <p className="text-sm text-gray-500">Trigger</p>
          {rule.type === 'schedule' && rule.schedule ? (
            <p className="font-medium text-gray-900">{formatSchedule(rule.schedule)}</p>
          ) : rule.type === 'conditional' && rule.condition ? (
            <p className="font-medium text-gray-900">{formatCondition(rule.condition)}</p>
          ) : (
            <p className="font-medium text-gray-900">Manual execution</p>
          )}
        </div>

        {/* JSON View (for debugging) */}
        {isEditing && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Rule JSON</p>
            <textarea
              value={JSON.stringify(editedRule, null, 2)}
              onChange={(e) => {
                try {
                  setEditedRule(JSON.parse(e.target.value));
                } catch {
                  // Invalid JSON, don't update
                }
              }}
              className="w-full h-40 p-3 text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      {(onApprove || onReject || isEditing) && (
        <div className="flex gap-3 p-4 border-t border-gray-100">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveEdit}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                <Check className="h-4 w-4" />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedRule(rule);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {onReject && (
                <button
                  onClick={onReject}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
              )}
              {onApprove && (
                <button
                  onClick={() => onApprove(rule)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  <Check className="h-4 w-4" />
                  Get Quote
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}