import { useState, useImperativeHandle, forwardRef } from 'react';

const CountrySelector = forwardRef(({ selectedCountry, onCountryChange }, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  // Exponer función para cerrar el selector desde el componente padre
  useImperativeHandle(ref, () => ({
    close: () => setIsOpen(false),
  }));

  const countries = [
    { code: '+56', country: 'CL', name: 'Chile', flag: '🇨🇱' },
    { code: '+54', country: 'AR', name: 'Argentina', flag: '🇦🇷' },
    { code: '+55', country: 'BR', name: 'Brasil', flag: '🇧🇷' },
    { code: '+57', country: 'CO', name: 'Colombia', flag: '🇨🇴' },
    { code: '+51', country: 'PE', name: 'Perú', flag: '🇵🇪' },
    { code: '+598', country: 'UY', name: 'Uruguay', flag: '🇺🇾' },
    { code: '+595', country: 'PY', name: 'Paraguay', flag: '🇵🇾' },
    { code: '+593', country: 'EC', name: 'Ecuador', flag: '🇪🇨' },
    { code: '+591', country: 'BO', name: 'Bolivia', flag: '🇧🇴' },
    { code: '+58', country: 'VE', name: 'Venezuela', flag: '🇻🇪' },
    { code: '+1', country: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
    { code: '+34', country: 'ES', name: 'España', flag: '🇪🇸' },
    { code: '+52', country: 'MX', name: 'México', flag: '🇲🇽' },
  ];

  const handleSelect = (country) => {
    onCountryChange(country);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <span className="text-lg mr-2">{selectedCountry.flag}</span>
        <span className="text-sm font-medium text-gray-700">{selectedCountry.code}</span>
        <svg
          className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 w-64 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {countries.map((country) => (
            <button
              key={country.country}
              type="button"
              onClick={() => handleSelect(country)}
              className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
            >
              <span className="text-lg mr-3">{country.flag}</span>
              <span className="text-sm font-medium text-gray-700 mr-2">{country.code}</span>
              <span className="text-sm text-gray-600">{country.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default CountrySelector;
