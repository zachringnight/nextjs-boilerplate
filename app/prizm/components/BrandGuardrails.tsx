'use client';

import { useState, useCallback } from 'react';
import { Shield, Check, AlertTriangle, Sparkles, X } from 'lucide-react';
import {
  validateBrandContent,
  APPROVED_PRODUCTS,
  BLOCKED_BRANDS,
  BrandValidationResult,
} from '../lib/brand-guardrails';

interface BrandGuardrailsProps {
  value: string;
  onChange: (value: string) => void;
  onValidation?: (result: BrandValidationResult) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  autoCorrect?: boolean;
  showProductList?: boolean;
}

export function BrandGuardrails({
  value,
  onChange,
  onValidation,
  placeholder = 'Enter content...',
  rows = 4,
  className = '',
  autoCorrect = true,
  showProductList = false,
}: BrandGuardrailsProps) {
  const [validationResult, setValidationResult] = useState<BrandValidationResult | null>(null);
  const [showProducts, setShowProducts] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      onChange(newValue);

      // Validate on change
      const result = validateBrandContent(newValue);
      setValidationResult(result);
      onValidation?.(result);

      // Auto-correct if enabled and corrections were found
      if (autoCorrect && result.correctionsApplied.length > 0) {
        onChange(result.correctedText);
      }
    },
    [onChange, onValidation, autoCorrect]
  );

  const handleApplyCorrections = () => {
    if (validationResult) {
      onChange(validationResult.correctedText);
    }
  };

  const getStatusIcon = () => {
    if (!validationResult || !value.trim()) return null;

    if (!validationResult.isValid) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }

    if (validationResult.correctionsApplied.length > 0) {
      return <Sparkles className="w-5 h-5 text-amber-500" />;
    }

    return <Check className="w-5 h-5 text-green-500" />;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-zinc-300">Brand Guardrails Active</span>
        </div>
        {showProductList && (
          <button
            type="button"
            onClick={() => setShowProducts(!showProducts)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            {showProducts ? 'Hide' : 'View'} Approved Products
          </button>
        )}
      </div>

      {/* Approved Products Dropdown */}
      {showProducts && (
        <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Approved Panini Products</span>
            <button
              type="button"
              onClick={() => setShowProducts(false)}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {APPROVED_PRODUCTS.map((product) => (
              <span
                key={product}
                className="text-xs bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded"
              >
                {product}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows}
          className={`w-full bg-zinc-800 border rounded-lg px-4 py-3 pr-10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-colors ${
            validationResult && !validationResult.isValid
              ? 'border-red-500 focus:ring-red-500'
              : validationResult && validationResult.correctionsApplied.length > 0
              ? 'border-amber-500 focus:ring-amber-500'
              : 'border-zinc-700 focus:ring-blue-500'
          }`}
        />
        <div className="absolute top-3 right-3">{getStatusIcon()}</div>
      </div>

      {/* Validation Messages */}
      {validationResult && validationResult.warnings.length > 0 && (
        <div className="space-y-1">
          {validationResult.warnings.map((warning, index) => (
            <div
              key={index}
              className={`flex items-start gap-2 text-sm p-2 rounded-lg ${
                warning.includes('Competitor brands detected')
                  ? 'bg-red-900/20 text-red-400 border border-red-800'
                  : warning.includes('Spelling corrections')
                  ? 'bg-amber-900/20 text-amber-400 border border-amber-800'
                  : 'bg-blue-900/20 text-blue-400 border border-blue-800'
              }`}
            >
              {warning.includes('Competitor brands detected') ? (
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Apply Corrections Button */}
      {validationResult &&
        validationResult.correctionsApplied.length > 0 &&
        !autoCorrect && (
          <button
            type="button"
            onClick={handleApplyCorrections}
            className="flex items-center gap-2 text-sm bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Apply Spelling Corrections
          </button>
        )}

      {/* Blocked Brands Warning (shown if any blocked brands in value) */}
      {validationResult && validationResult.blockedTermsFound.length > 0 && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-400">Blocked Competitor Brands</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {validationResult.blockedTermsFound.map((brand) => (
              <span
                key={brand}
                className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded line-through"
              >
                {brand}
              </span>
            ))}
          </div>
          <p className="text-xs text-red-400/80 mt-2">
            Please remove competitor brand references before submitting.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Simple validation indicator component for inline use
 */
export function BrandValidationBadge({ text }: { text: string }) {
  const result = validateBrandContent(text);

  if (!text.trim()) return null;

  return (
    <div className="flex items-center gap-1">
      {result.isValid ? (
        <>
          <Check className="w-3 h-3 text-green-500" />
          <span className="text-xs text-green-500">Brand OK</span>
        </>
      ) : (
        <>
          <AlertTriangle className="w-3 h-3 text-red-500" />
          <span className="text-xs text-red-500">Brand Issue</span>
        </>
      )}
    </div>
  );
}
