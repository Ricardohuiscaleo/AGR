import React from 'react';
import { FlipWords } from '../ui/flip-words';

export function FlipWordsDemo() {
  const words = ['eficiente', 'innovadora', 'potente', 'optimizada'];

  return (
    <div className="h-[40rem] flex justify-center items-center px-4">
      <div className="text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
        Construye soluciones
        <FlipWords words={words} className="text-blue-600 dark:text-blue-400 font-bold" />
        <br />
        con tecnología RAG
      </div>
    </div>
  );
}

export default FlipWordsDemo;
