'use client';

import { SimpleAnimatedTooltip } from '../src/components/ui/animated-tooltip';

// Definir la interfaz DocumentSearchResult localmente
interface DocumentSearchResult {
  title: string;
  content: string;
  score: number;
  metadata: {
    source: string;
    [key: string]: any;
  };
}

interface SearchResultsProps {
  results: DocumentSearchResult[];
  isLoading: boolean;
}

export function SearchResults({ results, isLoading }: SearchResultsProps) {
  return (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : results.length > 0 ? (
        results.map((result, index) => (
          <SimpleAnimatedTooltip
            key={index}
            content={
              <div className="prose prose-sm max-h-[400px] overflow-y-auto">
                <h4 className="text-sm font-medium mb-1">{result.title}</h4>
                <div dangerouslySetInnerHTML={{ __html: result.content }} />
              </div>
            }
            className="w-full"
          >
            <div className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 w-full">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{result.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{result.score.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-gray-600 mt-1 line-clamp-2">
                {result.content.replace(/<[^>]*>/g, '')}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-400">{result.metadata.source}</span>
              </div>
            </div>
          </SimpleAnimatedTooltip>
        ))
      ) : (
        <div className="text-center text-gray-500">No results found.</div>
      )}
    </div>
  );
}
