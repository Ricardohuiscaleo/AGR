import React from 'react';
import { motion } from 'framer-motion';

const steps = ['Seleccionar Horario', 'Tus Datos', 'Confirmación'];

export const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => (
  <div className="flex justify-between items-center mb-8">
    {steps.map((step, index) => (
      <React.Fragment key={step}>
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= index + 1 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-500'}`}
          >
            {currentStep > index + 1 ? '✓' : index + 1}
          </div>
          <p
            className={`mt-2 text-xs font-medium ${currentStep >= index + 1 ? 'text-blue-600' : 'text-gray-500'}`}
          >
            {step}
          </p>
        </div>
        {index < steps.length - 1 && (
          <div
            className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${currentStep > index + 1 ? 'bg-blue-600' : 'bg-gray-300'}`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);
