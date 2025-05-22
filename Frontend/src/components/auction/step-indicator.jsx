import React from 'react';
import { FiCheck } from 'react-icons/fi';

export default function StepIndicator({ currentStep, totalSteps, stepTitles }) {
  return (
    <div className="mb-8 w-full">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const step = idx + 1;
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;

          return (
            <div key={step} className="flex items-center flex-1 min-w-[85px]">
              {/* Step Circle */}
              <div
                className={`flex items-center justify-center rounded-full transition-all duration-200
                  ${isActive ? 'w-12 h-12 border-4 border-teal-200 bg-teal-500 text-white' : ''}
                  ${isCompleted ? 'w-10 h-10 bg-teal-500 text-white' : ''}
                  ${!isActive && !isCompleted ? 'w-10 h-10 bg-gray-200 text-gray-500' : ''}
                `}
              >
                {isCompleted ? <FiCheck /> : <span className="font-bold">{step}</span>}
              </div>

              {/* Step Info */}
              <div className="ml-4 hidden sm:block max-md:hidden">
                <div
                  className={`font-medium ${
                    isActive || isCompleted ? 'text-teal-600' : 'text-gray-700'
                  }`}
                >
                  {stepTitles[idx]}
                </div>
                <div className="text-xs text-gray-500">
                  {isActive ? 'Current step' : isCompleted ? 'Completed' : 'Pending'}
                </div>
              </div>

              {/* Divider */}
              {step < totalSteps && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    isCompleted ? 'bg-teal-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
