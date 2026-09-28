import { AlertTriangle } from 'lucide-react';

export default function MedicalDisclaimer({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-800">Medical Disclaimer</h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              AI HealthAssist is an educational and informational prototype. Its predictions are based on the symptoms provided and should not be considered a medical diagnosis. For medical concerns, consult a qualified healthcare professional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
