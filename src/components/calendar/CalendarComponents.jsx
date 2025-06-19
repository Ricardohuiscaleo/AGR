import { useState, useEffect, useRef } from 'react';

// Componente especializado para días del calendario con información hover sin interferir con clics
export const CalendarDay = ({
  date,
  isSelected,
  isSelectable,
  isPast,
  isWeekend,
  isTodayDate,
  availableSlots,
  onDateSelect,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const dayRef = useRef(null);

  // Nombres de días y meses
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const shortDayName = dayNames[date.getDay()].substring(0, 3);
  const fullDayName = dayNames[date.getDay()];

  // Estilos del día mejorados
  const dayClasses = `
    flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 min-h-[90px] sm:min-h-[110px] relative cursor-pointer group
    ${
      !isSelectable
        ? 'opacity-40 cursor-not-allowed bg-gray-50/50 border-gray-200'
        : 'hover:border-blue-400 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1'
    }
    ${
      isSelected
        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600 shadow-xl scale-[1.02] -translate-y-1'
        : 'bg-white border-gray-200 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50'
    }
    ${isTodayDate && !isSelected && isSelectable ? 'border-blue-500 ring-2 ring-blue-200 ring-offset-1' : ''}
    ${!isSelectable && isPast ? 'bg-gray-50 border-gray-200' : ''}
    ${!isSelectable && isWeekend ? 'bg-orange-50/30 border-orange-200' : ''}
  `;

  const handleClick = () => {
    if (isSelectable && onDateSelect) {
      onDateSelect(date);
    }
  };

  return (
    <div className="relative">
      <div
        ref={dayRef}
        className={dayClasses}
        onClick={handleClick}
        onMouseEnter={() => setShowInfo(true)}
        onMouseLeave={() => setShowInfo(false)}
      >
        <div
          className={`text-xs font-semibold text-center uppercase mb-2 tracking-wide ${isSelected ? 'text-blue-100' : 'text-gray-500 group-hover:text-blue-600'}`}
        >
          {shortDayName}
        </div>
        <div
          className={`text-xl font-bold text-center ${isSelected ? 'text-white' : 'text-gray-800 group-hover:text-blue-600'}`}
        >
          {date.getDate()}
        </div>

        {/* Indicador de selección mejorado */}
        {isSelected && (
          <div className="absolute top-3 right-3">
            <div className="w-3 h-3 rounded-full bg-white shadow-sm animate-pulse"></div>
          </div>
        )}

        {/* Indicador de slots disponibles mejorado */}
        {isSelectable && availableSlots.length > 0 && !isSelected && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-1">
              {[...Array(Math.min(3, availableSlots.length))].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm"
                ></div>
              ))}
              {availableSlots.length > 3 && (
                <span className="text-xs text-emerald-600 ml-1 font-medium">
                  +{availableSlots.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Indicador especial para hoy */}
        {isTodayDate && !isSelected && (
          <div className="absolute -top-1 -right-1">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full shadow-md border-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Panel de información flotante mejorado */}
      {showInfo && (isSelectable || !isSelectable) && (
        <div
          className="absolute z-50 bg-white shadow-2xl rounded-xl border border-gray-100 p-4 mt-3 min-w-[300px] max-w-[340px] backdrop-blur-sm"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            top: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div className="font-semibold mb-3 text-gray-800 border-b border-gray-100 pb-2 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            {fullDayName}, {date.getDate()} de {date.toLocaleDateString('es-CL', { month: 'long' })}
          </div>

          {!isSelectable ? (
            <div className="flex items-center justify-center text-gray-500 text-sm py-2">
              <span className="mr-2 text-base">{isPast ? '📅' : isWeekend ? '🏖️' : '🚫'}</span>
              {isPast ? 'Fecha pasada' : isWeekend ? 'Fin de semana' : 'No disponible'}
            </div>
          ) : availableSlots.length > 0 ? (
            <>
              <div className="text-sm mb-3 text-emerald-600 font-medium flex items-center">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm-2-9l-2-2 1.41-1.41L10 8.17l7.59-7.59L19 2l-9 9z"
                    clipRule="evenodd"
                  />
                </svg>
                {availableSlots.length}{' '}
                {availableSlots.length === 1 ? 'horario disponible' : 'horarios disponibles'}
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto custom-scrollbar">
                {availableSlots.slice(0, 8).map((slot, idx) => (
                  <div
                    key={idx}
                    className="text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-lg text-xs font-medium text-center border border-blue-100 hover:border-blue-200 transition-colors"
                  >
                    {slot.start.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                ))}
                {availableSlots.length > 8 && (
                  <div className="col-span-2 text-xs text-gray-500 mt-2 font-medium text-center bg-gray-50 rounded-lg py-1">
                    +{availableSlots.length - 8} horarios más disponibles
                  </div>
                )}
              </div>
              <div className="mt-3 text-xs text-gray-500 text-center flex items-center justify-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                Haz clic para seleccionar esta fecha
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center text-gray-500 text-sm py-2">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 008.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                  clipRule="evenodd"
                />
              </svg>
              No hay horarios disponibles
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente para slots de tiempo con mejor UX
export const TimeSlot = ({ slot, isSelected, onSlotSelect, disabled = false }) => {
  const handleClick = () => {
    if (!disabled && onSlotSelect) {
      onSlotSelect(slot);
    }
  };

  return (
    <button
      className={`w-full py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 group ${
        isSelected
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-700 focus:ring-blue-500 shadow-lg scale-105'
          : disabled
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
            : 'bg-white text-blue-600 border-gray-300 hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 focus:ring-blue-400 hover:shadow-md hover:scale-[1.02]'
      }`}
      onClick={handleClick}
      disabled={disabled}
      title={`${isSelected ? 'Horario seleccionado' : 'Seleccionar'} ${slot.start.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`}
    >
      <div className="flex items-center justify-center">
        {slot.start.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
        {isSelected && <span className="ml-2 text-xs animate-pulse">✓</span>}
      </div>
    </button>
  );
};
