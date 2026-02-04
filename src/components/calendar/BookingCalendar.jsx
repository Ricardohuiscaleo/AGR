import { useState, useEffect, useRef } from 'react';
import { IntelligentLoader, FormProcessingLoader } from './IntelligentLoaders';
import { CalendarDay, TimeSlot } from './CalendarComponents';
import CountrySelector from './CountrySelector';
import { EmailValidator, PhoneValidator } from '../../lib/n8nClient';

/**
 * Componente avanzado de calendario para reservas
 * Utiliza API PHP propia para comunicarse con Google Calendar
 */
export default function BookingCalendar({
  calendarId = 'ricardo.huiscaleo@gmail.com',
  title = 'Asesoría Personalizada en Soluciones con IA',
  description = 'Selecciona fecha y hora para programar una reunión',
  accentColor = '#3B82F6',
  className = '',
  workingHoursStart = 9,
  workingHoursEnd = 22,
  slotDuration = 60, // Duración de cada slot individual en minutos
  timeZone = 'America/Santiago',
  sessionDuration = 30, // Duración real de la sesión
  sessionPrice = 'FREE',
}) {
  // Estados
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStartDate(new Date()));
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    notas: '',
  });
  const [selectedCountry, setSelectedCountry] = useState({
    code: '+56',
    country: 'CL',
    name: 'Chile',
    flag: '🇨🇱',
  });
  const [formErrors, setFormErrors] = useState({});
  const [emailWarnings, setEmailWarnings] = useState([]);
  const [phoneWarnings, setPhoneWarnings] = useState([]);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [tempBlockId, setTempBlockId] = useState(null);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(null);
  const [blockExpired, setBlockExpired] = useState(false);
  const [blockTimerId, setBlockTimerId] = useState(null);

  // Configuraciones y mensajes específicos para los loaders
  const stepProgressMessages = {
    1: {
      title: '🗓️ Explorando Disponibilidad',
      phases: [
        'Conectando con el sistema de calendario',
        'Analizando eventos existentes',
        'Calculando horarios disponibles',
        'Verificando conflictos potenciales',
        'Optimizando opciones de horario',
      ],
    },
    2: {
      title: '👤 Procesando Información',
      subtitle: 'La IA está validando y procesando tu información personal de forma segura',
      phases: [
        'Verificando información personal',
        'Validando formato de contacto',
        'Protegiendo datos sensibles',
        'Preparando perfil de reserva',
        'Finalizando validación',
      ],
    },
    3: {
      title: '💳 Finalizando Reserva',
      subtitle: 'Finalizando tu reserva con la máxima seguridad y confirmación automática',
      phases: [
        'Procesando información de pago',
        'Creando reserva definitiva',
        'Enviando confirmaciones',
        'Configurando recordatorios',
        'Sincronizando calendarios',
      ],
    },
  };

  // URLs de la API PHP - detecta automáticamente el entorno
  const API_BASE_URL =
    window.location.hostname === 'localhost'
      ? 'http://localhost:4335/api/calendar'
      : 'https://agenterag.com/api/calendar';
  const WEBHOOK_GET_AVAILABILITY = `${API_BASE_URL}/get-availability.php`;
  const WEBHOOK_CREATE_BOOKING = `${API_BASE_URL}/create-booking-service.php`;
  const WEBHOOK_CREATE_TEMP_BLOCK = `${API_BASE_URL}/temp-block-db.php?action=create`;
  const WEBHOOK_REMOVE_TEMP_BLOCK = `${API_BASE_URL}/temp-block-db.php?action=remove`;

  const TEMP_BLOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutos

  const calendarRef = useRef(null);
  const countrySelectorRef = useRef(null);
  const isClientSide = useRef(false);

  useEffect(() => {
    isClientSide.current = true;
  }, []);

  useEffect(() => {
    return () => {
      clearBlockTimer();
    };
  }, []);

  useEffect(() => {
    if (currentWeekStart && isClientSide.current) {
      loadWeekEvents(currentWeekStart);
    }
  }, [currentWeekStart, calendarId, timeZone]);

  useEffect(() => {
    if (blockExpired) {
      alert('Tu horario reservado temporalmente ha expirado. Por favor, selecciona de nuevo.');
      setCurrentStep(1);
      setSelectedSlot(null);
      setBlockExpired(false);
      if (selectedDate) {
        const slots = calculateAvailableSlots(selectedDate);
        setAvailableSlots(slots);
      }
    }
  }, [blockExpired]);

  function getWeekStartDate(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const trackInteraction = (action, details = {}) => {
    // Función simple de tracking para analytics (opcional)
    console.log(`[Analytics] ${action}:`, details);
  };

  const calculateAvailableSlots = (date) => {
    if (!date) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today || [0, 6].includes(date.getDay())) {
      return [];
    }

    const availableSlotsList = [];
    const now = new Date();

    for (let hour = workingHoursStart; hour < workingHoursEnd; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);

        if (date.toDateString() === now.toDateString() && slotStart <= now) {
          continue;
        }
        availableSlotsList.push({ start: slotStart, end: slotEnd, available: true });
      }
    }

    const busyEvents = events.filter((event) => {
      if (!event?.start?.dateTime) return false;
      const eventStart = new Date(event.start.dateTime);
      return (
        eventStart.getDate() === date.getDate() &&
        eventStart.getMonth() === date.getMonth() &&
        eventStart.getFullYear() === date.getFullYear()
      );
    });

    busyEvents.forEach((event) => {
      const eventStart = new Date(event.start.dateTime);
      const eventEnd = new Date(event.end.dateTime);
      for (let i = 0; i < availableSlotsList.length; i++) {
        const slot = availableSlotsList[i];
        if (
          (slot.start >= eventStart && slot.start < eventEnd) ||
          (slot.end > eventStart && slot.end <= eventEnd) ||
          (slot.start <= eventStart && slot.end >= eventEnd)
        ) {
          availableSlotsList[i] = { ...slot, available: false, eventSummary: event.summary };
        }
      }
    });
    return availableSlotsList.filter((slot) => slot.available);
  };

  const createTemporaryBlock = async (slot) => {
    if (tempBlockId) {
      await removeTemporaryBlock(tempBlockId, true);
    }

    try {
      setLoading(true);
      const blockData = {
        start: slot.start.toISOString(),
        end: new Date(slot.start.getTime() + sessionDuration * 60000).toISOString(),
        summary: `Reserva Temporal - ${formData.email || formData.nombre || 'Usuario Pendiente'}`,
        calendarId: calendarId,
        timeZone: timeZone,
        client_email: formData.email || null,
        client_phone: formData.telefono ? `${selectedCountry.code} ${formData.telefono}` : null,
        notes: formData.notas || null,
      };

      const response = await fetch(WEBHOOK_CREATE_TEMP_BLOCK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Incluir cookies de sesión
        body: JSON.stringify(blockData),
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error('Error response:', response.status, responseText);

        let errorData;
        try {
          // Extraer JSON de la respuesta de error
          const jsonMatch = responseText.match(/\{.*\}/);
          const jsonString = jsonMatch ? jsonMatch[0] : responseText;
          errorData = JSON.parse(jsonString);
        } catch (e) {
          errorData = {
            message: `Error ${response.status}: ${responseText.substring(0, 200)}`,
            error: 'Respuesta no JSON',
          };
        }

        throw new Error(
          errorData.message || errorData.error || `Error ${response.status} creando bloqueo`
        );
      }

      const responseText = await response.text();
      console.log('Success response (raw):', responseText);
      console.log('Response headers:', [...response.headers.entries()]);
      console.log('Response status:', response.status);
      console.log('Response URL:', response.url);

      let responseData;
      try {
        // Extraer JSON de la respuesta (puede tener HTML antes)
        const jsonMatch = responseText.match(/\{.*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : responseText;
        responseData = JSON.parse(jsonString);
      } catch (e) {
        console.error('JSON parse error:', e, 'Response:', responseText);
        throw new Error(`Respuesta inválida del servidor: ${responseText.substring(0, 100)}`);
      }
      if (responseData.id) {
        setTempBlockId(responseData.id);
        
        // DEBUG: Verificar inmediatamente si se guardó en MySQL
        setTimeout(async () => {
          try {
            const checkResponse = await fetch(`${API_BASE_URL}/verify-immediate.php?id=${responseData.id}`);
            const checkResult = await checkResponse.json();
            if (checkResult.status === 'FOUND') {
              console.log('✅ CONFIRMADO: Registro encontrado inmediatamente:', responseData.id);
              console.log('Datos:', checkResult.data);
            } else {
              console.log('❌ ERROR: Registro NO encontrado inmediatamente:', responseData.id);
              console.log('Verificación:', checkResult);
            }
          } catch (e) {
            console.log('Error verificando inmediatamente:', e);
          }
        }, 100); // Solo 100ms de delay

        startBlockTimer(TEMP_BLOCK_DURATION_MS / 1000);
        setBlockExpired(false);

        const newTempEvent = {
          id: responseData.id,
          summary: blockData.summary,
          start: { dateTime: blockData.start },
          end: { dateTime: blockData.end },
          isTempBlock: true,
        };
        setEvents((prevEvents) => [...prevEvents, newTempEvent]);
        if (selectedDate) {
          handleDateSelection(selectedDate, true);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creando bloqueo temporal:', err);
      setError(`No se pudo reservar el horario temporalmente: ${err.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeTemporaryBlock = async (blockIdToRemove = tempBlockId, silent = false) => {
    if (!blockIdToRemove) return;

    try {
      const response = await fetch(WEBHOOK_REMOVE_TEMP_BLOCK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Incluir cookies de sesión
        body: JSON.stringify({ eventId: blockIdToRemove, calendarId: calendarId }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorData.error || `Error ${response.status} eliminando bloqueo`
        );
      }

      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== blockIdToRemove));

      if (blockIdToRemove === tempBlockId) {
        setTempBlockId(null);
        if (!silent) {
          setBlockTimeRemaining(null);
        }
        clearBlockTimer();
      }
      if (selectedDate && !silent) {
        handleDateSelection(selectedDate);
      }
    } catch (err) {
      console.error('Error eliminando bloqueo temporal:', err);
      setError(`Problema al liberar el horario: ${err.message}. Intenta seleccionar de nuevo.`);
    }
  };

  const startBlockTimer = (durationSeconds) => {
    clearBlockTimer();
    setBlockExpired(false);
    let remainingTime = durationSeconds;
    setBlockTimeRemaining(remainingTime);

    const newTimerId = setInterval(() => {
      remainingTime -= 1;
      setBlockTimeRemaining(remainingTime);
      if (remainingTime <= 0) {
        clearInterval(newTimerId);
        setBlockTimerId(null);
        setBlockExpired(true);
        removeTemporaryBlock();
      }
    }, 1000);
    setBlockTimerId(newTimerId);
  };

  const clearBlockTimer = () => {
    if (blockTimerId) {
      clearInterval(blockTimerId);
      setBlockTimerId(null);
    }
  };

  const loadWeekEvents = async (weekStart, retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [1000, 2000, 5000]; // Delays progresivos

    if (typeof window === 'undefined' || !isClientSide.current) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 13);
      weekEnd.setHours(23, 59, 59, 999);

      const webhookUrl = new URL(WEBHOOK_GET_AVAILABILITY);
      webhookUrl.searchParams.append('timeMin', weekStart.toISOString());
      webhookUrl.searchParams.append('timeMax', weekEnd.toISOString());
      webhookUrl.searchParams.append('maxResults', '100');
      webhookUrl.searchParams.append('timeZone', timeZone);
      webhookUrl.searchParams.append('calendarId', calendarId);

      // Implementar timeout y control de aborto
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout

      const response = await fetch(webhookUrl.toString(), {
        method: 'GET',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`);
      }

      const responseText = await response.text();

      // Si el webhook devuelve "PRO FEATURE ONLY", crear datos simulados para desarrollo
      if (responseText.trim() === 'PRO FEATURE ONLY') {
        console.warn('Webhook devolvió PRO FEATURE ONLY - usando datos simulados para desarrollo');
        const parsedEventsData = [];
        const parseSuccessful = true;

        setEvents([]);
        setError(null);
        trackInteraction('week_loaded', {
          eventsCount: 0,
          parseSuccess: true,
          retryCount: retryCount,
          note: 'Usando datos simulados - webhook limitado',
        });
        return;
      }

      // ...existing parsing logic...
      let parsedEventsData = [];
      let parseSuccessful = false;

      if (responseText.trim().startsWith('[') && responseText.trim().endsWith(']')) {
        try {
          parsedEventsData = JSON.parse(responseText);
          if (Array.isArray(parsedEventsData)) {
            parseSuccessful = true;
          }
        } catch (e) {}
      }

      if (!parseSuccessful) {
        try {
          const data = JSON.parse(responseText);
          if (data) {
            if (data.items && Array.isArray(data.items)) {
              parsedEventsData = data.items;
              parseSuccessful = true;
            } else if (data.events && Array.isArray(data.events)) {
              parsedEventsData = data.events;
              parseSuccessful = true;
            } else if (Array.isArray(data)) {
              parsedEventsData = data;
              parseSuccessful = true;
            } else {
              for (const key in data) {
                if (
                  Array.isArray(data[key]) &&
                  data[key].length > 0 &&
                  typeof data[key][0] === 'object' &&
                  data[key][0].hasOwnProperty('start')
                ) {
                  parsedEventsData = data[key];
                  parseSuccessful = true;
                  break;
                }
              }
              if (!parseSuccessful) {
                for (const key in data) {
                  if (
                    typeof data[key] === 'string' &&
                    (data[key].includes('"start":') || data[key].includes('"id":'))
                  ) {
                    try {
                      const innerData = JSON.parse(data[key]);
                      if (Array.isArray(innerData)) {
                        parsedEventsData = innerData;
                        parseSuccessful = true;
                        break;
                      } else if (innerData.items && Array.isArray(innerData.items)) {
                        parsedEventsData = innerData.items;
                        parseSuccessful = true;
                        break;
                      }
                    } catch (e) {}
                  }
                }
              }
            }
            if (!parseSuccessful && data.id && (data.start || data.startDate)) {
              parsedEventsData = [data];
              parseSuccessful = true;
            }
          }
        } catch (e) {}
      }

      if (!parseSuccessful) {
        const match = responseText.match(/\[\s*\{[\s\S]*?\}\s*\]/s);
        if (match && match[0]) {
          try {
            parsedEventsData = JSON.parse(match[0]);
            if (Array.isArray(parsedEventsData)) {
              parseSuccessful = true;
            }
          } catch (e) {}
        }
      }

      if (!parseSuccessful) {
        parsedEventsData = [];
      }

      const validEvents = parsedEventsData.filter(
        (event) => event.start && event.start.dateTime && event.end && event.end.dateTime
      );
      if (validEvents.length !== parsedEventsData.length) {
      }

      setEvents(validEvents);
      setError(null); // Limpiar cualquier error previo
      trackInteraction('week_loaded', {
        eventsCount: validEvents.length,
        parseSuccess: parseSuccessful,
        retryCount: retryCount,
      });
    } catch (err) {
      console.error('Error cargando eventos:', err);

      // Determinar si es un error recuperable
      const isRecoverableError =
        err.name === 'AbortError' ||
        err.message.includes('Load failed') ||
        err.message.includes('fetch') ||
        err.message.includes('network') ||
        err.message.includes('timeout') ||
        (err.message.includes('Error del servidor') && err.message.includes('5'));

      // Si es un error recuperable y tenemos reintentos disponibles
      if (isRecoverableError && retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAYS[retryCount];

        // Mostrar mensaje de reintento al usuario
        setError(
          `Problemas de conexión. Reintentando automáticamente... (${retryCount + 1}/${MAX_RETRIES})`
        );

        setTimeout(() => {
          loadWeekEvents(weekStart, retryCount + 1);
        }, delay);
        return; // No ejecutar el finally aún
      }

      // Si agotamos los reintentos o es un error no recuperable
      let userMessage = 'No se pudieron cargar los eventos del calendario.';

      if (err.name === 'AbortError') {
        userMessage = 'La conexión se agotó. Verifica tu conexión a internet.';
      } else if (err.message.includes('Load failed')) {
        userMessage = 'Error de red. Verifica tu conexión a internet y reinténtalo.';
      } else if (err.message.includes('Error del servidor')) {
        userMessage = 'El servidor está temporalmente no disponible. Inténtalo en unos minutos.';
      }

      setError(userMessage);
      setEvents([]);
    } finally {
      // Solo cambiar loading a false si no vamos a reintentar
      if (retryCount >= MAX_RETRIES || !error || !error.includes('Reintentando')) {
        setLoading(false);
      }
    }
  };

  const navigateWeek = async (increment) => {
    // Loading más ligero que no bloquea la UI
    setLoading(true);
    setSelectedDate(null);
    setSelectedSlot(null);
    setAvailableSlots([]);

    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + increment * 7);
    setCurrentWeekStart(newWeekStart);

    // El loading se maneja automáticamente en loadWeekEvents
  };

  const handleDateSelection = (date, keepSelectedSlot = false) => {
    setSelectedDate(date);
    if (!keepSelectedSlot) {
      setSelectedSlot(null);
    }

    // Cálculo inmediato de slots sin delay innecesario
    const slots = calculateAvailableSlots(date);
    setAvailableSlots(slots);
    setError(null);

    trackInteraction('date_selected', { date: date.toISOString(), slotsCount: slots.length });
  };

  const handleSlotSelection = async (slot) => {
    setError(null);

    // Mostrar feedback inmediato sin loading pesado
    setSelectedSlot(slot);

    // Crear bloqueo temporal en segundo plano
    const blockCreated = await createTemporaryBlock(slot);
    if (!blockCreated) {
      setSelectedSlot(null);
    } else {
      trackInteraction('time_slot_selected', { slotStart: slot.start.toISOString() });
    }
  };

  // Función para actualizar bloqueo temporal con datos del formulario
  const updateTempBlock = async (updatedFormData) => {
    if (!tempBlockId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/temp-block-db.php?action=update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: tempBlockId,
          client_name: updatedFormData.nombre || null,
          client_email: updatedFormData.email || null,
          client_phone: updatedFormData.telefono ? `${selectedCountry.code} ${updatedFormData.telefono}` : null,
          notes: updatedFormData.notas || null
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error actualizando bloqueo temporal:', response.status, errorText);
      } else {
        console.log('✅ Bloqueo temporal actualizado correctamente');
      }
    } catch (error) {
      console.log('Error actualizando bloqueo temporal:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Para el campo teléfono, solo permitir números, espacios, guiones y el signo +
    if (name === 'telefono') {
      const sanitizedValue = value.replace(/[^0-9\s\-\+]/g, '');
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));

      // Cerrar el selector de países cuando el usuario empiece a escribir
      if (countrySelectorRef.current) {
        countrySelectorRef.current.close();
      }

      // Validar teléfono en tiempo real si tiene contenido
      if (sanitizedValue.trim().length > 0) {
        const phoneValidation = PhoneValidator.validatePhone(
          sanitizedValue,
          selectedCountry.country
        );
        setPhoneWarnings(phoneValidation.suggestions || []);

        // Si hay errores, mostrar solo el primero
        if (!phoneValidation.isValid && phoneValidation.errors.length > 0) {
          setFormErrors((prev) => ({ ...prev, telefono: phoneValidation.errors[0] }));
        } else {
          setFormErrors((prev) => ({ ...prev, telefono: null }));
        }
      } else {
        setPhoneWarnings([]);
        setFormErrors((prev) => ({ ...prev, telefono: null }));
      }
    } else if (name === 'email') {
      // Normalizar el email y validar en tiempo real
      const normalizedEmail = EmailValidator.normalize(value);
      setFormData((prev) => ({ ...prev, [name]: normalizedEmail }));

      // Validar email en tiempo real si tiene contenido
      if (normalizedEmail.trim().length > 0) {
        const emailValidation = EmailValidator.validateEmail(normalizedEmail);
        setEmailWarnings(emailValidation.warnings || []);

        // Si hay errores, mostrar solo el primero
        if (!emailValidation.isValid && emailValidation.errors.length > 0) {
          setFormErrors((prev) => ({ ...prev, email: emailValidation.errors[0] }));
        } else {
          setFormErrors((prev) => ({ ...prev, email: null }));
        }
      } else {
        setEmailWarnings([]);
        setFormErrors((prev) => ({ ...prev, email: null }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (formErrors[name] && name !== 'email') {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
    
    // Actualizar bloqueo temporal con los nuevos datos (solo si hay cambios significativos)
    if (tempBlockId && value.trim().length > 0) {
      const updatedFormData = { ...formData, [name]: value };
      updateTempBlock(updatedFormData);
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar email con el validador avanzado
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else {
      const emailValidation = EmailValidator.validateEmail(formData.email);
      if (!emailValidation.isValid) {
        errors.email = emailValidation.errors[0] || 'El email no es válido';
      }
      // Actualizar warnings aunque el email sea válido
      setEmailWarnings(emailValidation.warnings || []);
    }

    // Validar teléfono con el validador avanzado
    if (!formData.telefono.trim()) {
      errors.telefono = 'El teléfono es requerido';
    } else {
      const phoneValidation = PhoneValidator.validatePhone(
        formData.telefono,
        selectedCountry.country
      );
      if (!phoneValidation.isValid) {
        errors.telefono = phoneValidation.errors[0] || 'El teléfono no es válido';
      }
      // Actualizar sugerencias aunque el teléfono sea válido
      setPhoneWarnings(phoneValidation.suggestions || []);
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitBooking = async (e) => {
    if (e) e.preventDefault(); // Si se llama desde un submit de formulario

    if (!selectedSlot || !selectedDate) {
      setError('No se ha seleccionado fecha y hora');
      return;
    }

    setFormLoading(true);
    setError(null);
    setBookingStatus(null);

    const bookingStartTime = selectedSlot.start;
    const bookingEndTime = new Date(bookingStartTime.getTime() + sessionDuration * 60000);

    let tempBlockActuallyRemoved = false;
    if (tempBlockId) {
      try {
        const removeResponse = await fetch(WEBHOOK_REMOVE_TEMP_BLOCK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: tempBlockId, calendarId: calendarId }),
        });

        if (!removeResponse.ok) {
          const errorData = await removeResponse.json().catch(() => ({}));
          console.warn(
            `Advertencia: No se pudo eliminar el bloqueo temporal (${tempBlockId}). Error: ${errorData.error || removeResponse.status}. Continuando con la creación de la reserva...`
          );
        } else {
          tempBlockActuallyRemoved = true;
        }
      } catch (blockErr) {
        console.error('Error crítico eliminando bloqueo temporal:', blockErr);
      }
    }

    const oldTempBlockId = tempBlockId;
    clearBlockTimer();
    setTempBlockId(null);
    setBlockTimeRemaining(null);
    setBlockExpired(false);
    if (oldTempBlockId) {
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== oldTempBlockId));
    }

    const bookingDataFinal = {
      nombre: formData.nombre,
      email: formData.email,
      telefono: `${selectedCountry.code} ${formData.telefono}`,
      start: bookingStartTime.toISOString(),
      end: bookingEndTime.toISOString(),
      notas: formData.notas,
      calendarId: calendarId,
      timeZone: timeZone,
    };

    try {
      const createResponse = await fetch(WEBHOOK_CREATE_BOOKING, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Incluir cookies de sesión
        body: JSON.stringify(bookingDataFinal),
      });

      if (!createResponse.ok) {
        let errorResponseMessage = `Error ${createResponse.status} al crear la reserva.`;
        try {
          const errorData = await createResponse.json();
          errorResponseMessage = errorData.message || errorData.error || JSON.stringify(errorData);
        } catch (e) {
          const errorText = await createResponse
            .text()
            .catch(() => 'No se pudo leer el cuerpo del error de creación.');
          errorResponseMessage += ` Cuerpo no JSON: ${errorText.substring(0, 100)}...`;
        }
        throw new Error(errorResponseMessage);
      }

      const responseData = await createResponse
        .json()
        .catch(() => ({ id: 'N/A - Reserva creada, respuesta no JSON' }));

      setBookingStatus('success');
      trackInteraction('booking_success_v2_client_orchestrated', { eventId: responseData.id });

      loadWeekEvents(currentWeekStart);
    } catch (err) {
      console.error('Error final creando la reserva:', err);
      setError(err.message || 'Error al crear la reserva final.');
      setBookingStatus('error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleContinue = () => {
    if (currentStep === 1) {
      if (!selectedSlot) {
        setError('Por favor, selecciona un horario antes de continuar.');
        return;
      }
      setError(null);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateForm()) {
        const isFree =
          !sessionPrice ||
          sessionPrice.trim() === '$0' ||
          sessionPrice.toLowerCase().includes('gratis');
        if (isFree) {
          handleSubmitBooking();
        } else {
          setCurrentStep(3);
        }
      }
    }
  };

  const handleBack = async () => {
    setError(null);
    setBookingStatus(null);

    if (currentStep === 2) {
      setCurrentStep(1);
      if (tempBlockId) {
        await removeTemporaryBlock();
        setSelectedSlot(null);
      }
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  // Renderizado optimizado solo de fechas
  const renderHorizontalDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const availableDays = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const isPast = date < today;
      const isWeekend = [0, 6].includes(date.getDay());
      const isSelectable = !isPast && !isWeekend;
      const slots = isSelectable ? calculateAvailableSlots(date) : [];
      const slotsCount = slots.length;

      availableDays.push({
        date,
        isPast,
        isWeekend,
        isSelectable,
        slotsCount,
        isToday: date.toDateString() === today.toDateString(),
      });
    }

    return (
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max px-1 justify-center">
          {availableDays.map((day, index) => {
            const isSelected = selectedDate && day.date.getTime() === selectedDate.getTime();

            return (
              <button
                key={index}
                onClick={() => day.isSelectable && handleDateSelection(day.date)}
                disabled={!day.isSelectable}
                className={`
                  flex-shrink-0 w-16 h-20 p-2 rounded-lg border-2 transition-all duration-200
                  flex flex-col items-center justify-center text-center
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105'
                      : day.isSelectable
                        ? day.slotsCount > 0
                          ? 'border-green-300 bg-green-50 hover:border-green-400 hover:bg-green-100 hover:scale-105'
                          : 'border-red-300 bg-red-50'
                        : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  }
                `}
              >
                <div className={`text-lg font-bold mb-1 ${
                  isSelected ? 'text-blue-700' : day.isSelectable ? (day.slotsCount > 0 ? 'text-green-700' : 'text-red-600') : 'text-gray-400'
                }`}>
                  {day.date.getDate()}
                </div>
                <div className={`text-xs font-medium mb-1 ${
                  isSelected ? 'text-blue-600' : day.isSelectable ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {day.date.toLocaleDateString('es-CL', { weekday: 'short' }).toUpperCase()}
                </div>
                <div className={`text-xs font-semibold ${
                  isSelected ? 'text-blue-600' : day.isSelectable ? (day.slotsCount > 0 ? 'text-green-600' : 'text-red-500') : 'text-gray-400'
                }`}>
                  {day.isSelectable ? day.slotsCount : '—'}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Slots de tiempo integrados sin header redundante
  const renderIntegratedTimeSlots = () => {
    const slots = calculateAvailableSlots(selectedDate);
    if (slots.length === 0) {
      return (
        <div className="text-center py-6 text-gray-500 border-t mt-4 pt-4">
          <p className="text-sm">No hay horarios disponibles para esta fecha</p>
        </div>
      );
    }

    return (
      <div className="border-t mt-4 pt-4">
        <div className="mb-3">
          <h4 className="font-semibold text-gray-800 text-sm">
            {selectedDate.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h4>
          <p className="text-xs text-gray-600">{slots.length} horarios disponibles</p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4">
          {slots.map((slot, index) => {
            const isSelected = selectedSlot && selectedSlot.start.getTime() === slot.start.getTime();
            return (
              <button
                key={index}
                onClick={() => handleSlotSelection(slot)}
                disabled={loading}
                className={`
                  p-2 rounded-md border-2 transition-all duration-200 text-sm font-medium
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500 text-white shadow-md transform scale-105'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {slot.start.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </button>
            );
          })}
        </div>

        {selectedSlot && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-blue-900 text-sm">✓ Horario reservado</h5>
                <p className="text-xs text-blue-700">
                  {selectedSlot.start.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} • {sessionDuration} min
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedSlot(null);
                  if (tempBlockId) removeTemporaryBlock();
                }}
                className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded hover:bg-blue-100"
              >
                Cambiar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Sistema anterior mantenido para compatibilidad
  const renderHorizontalSteps = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generar 14 días disponibles
    const availableDays = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const isPast = date < today;
      const isWeekend = [0, 6].includes(date.getDay());
      const isSelectable = !isPast && !isWeekend;
      const slots = isSelectable ? calculateAvailableSlots(date) : [];
      const slotsCount = slots.length;

      availableDays.push({
        date,
        isPast,
        isWeekend,
        isSelectable,
        slotsCount,
        isToday: date.toDateString() === today.toDateString(),
      });
    }

    return (
      <div className="horizontal-calendar-container">
        {/* Navegación de semanas compacta */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateWeek(-1)}
            disabled={loading}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            <svg
              className="w-5 h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <h3 className="text-lg font-semibold text-gray-800">
            {currentWeekStart.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
          </h3>

          <button
            onClick={() => navigateWeek(1)}
            disabled={loading}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            <svg
              className="w-5 h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Grid horizontal de fechas con scroll */}
        <div className="horizontal-dates-grid overflow-x-auto pb-4 overflow-y-visible">
          <div className="flex gap-3 min-w-max px-2 justify-center py-2">
            {availableDays.map((day, index) => {
              const isSelected = selectedDate && day.date.getTime() === selectedDate.getTime();

              return (
                <button
                  key={index}
                  onClick={() => day.isSelectable && handleDateSelection(day.date)}
                  disabled={!day.isSelectable}
                  className={`
                    date-card flex-shrink-0 w-20 h-24 p-3 rounded-xl border-2 transition-all duration-200
                    flex flex-col items-center justify-center text-center
                    ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                        : day.isSelectable
                          ? day.slotsCount > 0
                            ? 'border-green-300 bg-green-50 hover:border-green-400 hover:bg-green-100 hover:scale-105 hover:shadow-md hover:-translate-y-1'
                            : 'border-red-300 bg-red-50'
                          : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  {/* Día del mes */}
                  <div
                    className={`
                    text-xl font-bold mb-1
                    ${
                      isSelected
                        ? 'text-blue-700'
                        : day.isSelectable
                          ? day.slotsCount > 0
                            ? 'text-green-700'
                            : 'text-red-600'
                          : 'text-gray-400'
                    }
                  `}
                  >
                    {day.date.getDate()}
                  </div>

                  {/* Día de la semana */}
                  <div
                    className={`
                    text-xs font-medium mb-1
                    ${
                      isSelected
                        ? 'text-blue-600'
                        : day.isSelectable
                          ? 'text-gray-600'
                          : 'text-gray-400'
                    }
                  `}
                  >
                    {day.date.toLocaleDateString('es-CL', { weekday: 'short' }).toUpperCase()}
                  </div>

                  {/* Indicador de slots */}
                  <div
                    className={`
                    text-xs font-semibold
                    ${
                      isSelected
                        ? 'text-blue-600'
                        : day.isSelectable
                          ? day.slotsCount > 0
                            ? 'text-green-600'
                            : 'text-red-500'
                          : 'text-gray-400'
                    }
                  `}
                  >
                    {day.isSelectable ? `${day.slotsCount}` : '—'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Leyenda simple */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span>Sin horarios</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span>No disponible</span>
          </div>
        </div>
      </div>
    );
  };

  // Renderizado optimizado de slots de tiempo
  const renderCompactTimeSlots = () => {
    if (!selectedDate) return null;

    const slots = calculateAvailableSlots(selectedDate);
    if (slots.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm">No hay horarios disponibles para esta fecha</p>
        </div>
      );
    }

    return (
      <div className="time-slots-container">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {selectedDate.toLocaleDateString('es-CL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </h3>
          <p className="text-sm text-gray-600">{slots.length} horarios disponibles</p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {slots.map((slot, index) => {
            const isSelected =
              selectedSlot && selectedSlot.start.getTime() === slot.start.getTime();

            return (
              <button
                key={index}
                onClick={() => handleSlotSelection(slot)}
                disabled={loading}
                className={`
                  time-slot-button p-3 rounded-lg border-2 transition-all duration-200
                  text-sm font-medium text-center
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500 text-white shadow-lg transform scale-105'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:scale-102'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {slot.start.toLocaleTimeString('es-CL', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}
              </button>
            );
          })}
        </div>

        {/* Información del slot seleccionado */}
        {selectedSlot && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">
                  ✓ Horario reservado temporalmente
                </h4>
                <p className="text-sm text-blue-700">
                  {selectedDate.toLocaleDateString('es-CL', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                  {' a las '}
                  {selectedSlot.start.toLocaleTimeString('es-CL', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' • Duración: '}
                  {sessionDuration} min
                </p>
                {blockTimeRemaining && (
                  <p className="text-xs text-blue-600 mt-1">
                    ⏱️ Tiempo restante: {Math.floor(blockTimeRemaining / 60)}:
                    {(blockTimeRemaining % 60).toString().padStart(2, '0')}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedSlot(null);
                  if (tempBlockId) removeTemporaryBlock();
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-100 transition-colors"
              >
                Cambiar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="horizontal-booking-flow">
            {loading && !events.length ? (
              <IntelligentLoader step={1} loadingState="calendar" progress={75} />
            ) : error && !events.length ? (
              <div className="py-10 text-center text-red-600 bg-red-50 p-4 rounded-md">
                <p>{error}</p>
                <button
                  onClick={() => loadWeekEvents(currentWeekStart)}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Reintentar carga
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header compacto */}
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Selecciona fecha y hora</h2>
                  <p className="text-sm text-gray-600">Elige tu horario preferido para la consultoría</p>
                </div>

                {/* Tarjeta unificada de calendario */}
                <div className="bg-white rounded-xl border shadow-sm p-4">
                  {/* Header de mes */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => navigateWeek(-1)}
                      disabled={loading}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {currentWeekStart.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button
                      onClick={() => navigateWeek(1)}
                      disabled={loading}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Grid de fechas */}
                  {renderHorizontalDates()}
                  
                  {/* Slots de tiempo integrados */}
                  {selectedDate && renderIntegratedTimeSlots()}

                  {/* Botones de navegación */}
                  <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleBack}
                      disabled={currentStep === 1 || formLoading}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      ← Atrás
                    </button>

                    {currentStep < 3 && (
                      <button
                        onClick={handleContinue}
                        disabled={formLoading || loading || (currentStep === 1 && !selectedSlot)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        {formLoading ? 'Procesando...' : 'Continuar →'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {formLoading ? (
              <FormProcessingLoader
                step={2}
                loadingState="processing"
                progress={60}
                title={stepProgressMessages[2]?.title}
                subtitle={stepProgressMessages[2]?.subtitle}
                phases={stepProgressMessages[2]?.phases}
              />
            ) : (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Información de contacto
                  </h3>
                  <p className="text-sm text-gray-600">
                    Completa tus datos para confirmar la reserva
                  </p>
                </div>

                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleContinue();
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="nombre"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
                          formErrors.nombre ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Tu nombre completo"
                        autoComplete="name"
                        disabled={formLoading}
                      />
                      {formErrors.nombre && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.nombre}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="telefono"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Teléfono *
                      </label>
                      <div className="flex">
                        <CountrySelector
                          ref={countrySelectorRef}
                          selectedCountry={selectedCountry}
                          onCountryChange={setSelectedCountry}
                        />
                        <input
                          type="tel"
                          id="telefono"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          className={`flex-1 px-3 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
                            formErrors.telefono
                              ? 'border-red-500'
                              : phoneWarnings.length > 0
                                ? 'border-blue-500'
                                : 'border-gray-300'
                          }`}
                          placeholder={
                            PhoneValidator.getPatternInfo(selectedCountry.country)?.example ||
                            '9 XXXX XXXX'
                          }
                          autoComplete="tel"
                          disabled={formLoading}
                        />
                      </div>
                      {formErrors.telefono && (
                        <p className="text-red-300 text-xs mt-1 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {formErrors.telefono}
                        </p>
                      )}
                      {!formErrors.telefono && phoneWarnings.length > 0 && (
                        <div className="mt-1">
                          {phoneWarnings.map((suggestion, index) => (
                            <p key={index} className="text-blue-600 text-xs flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              💡 {suggestion}
                            </p>
                          ))}
                        </div>
                      )}
                      {!formErrors.telefono &&
                        !phoneWarnings.length &&
                        formData.telefono.trim() &&
                        PhoneValidator.validatePhone(formData.telefono, selectedCountry.country)
                          .isValid && (
                          <p className="text-green-500 text-xs mt-1 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            ✓ Número válido para{' '}
                            {PhoneValidator.getPatternInfo(selectedCountry.country)
                              ? selectedCountry.name
                              : 'este país'}
                          </p>
                        )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
                        formErrors.email
                          ? 'border-red-500'
                          : emailWarnings.length > 0
                            ? 'border-yellow-500'
                            : 'border-gray-300'
                      }`}
                      placeholder="tu.email@empresa.com"
                      autoComplete="email"
                      disabled={formLoading}
                    />
                    {formErrors.email && (
                      <p className="text-red-300 text-xs mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {formErrors.email}
                      </p>
                    )}
                    {!formErrors.email && emailWarnings.length > 0 && (
                      <div className="mt-1">
                        {emailWarnings.map((warning, index) => (
                          <p key={index} className="text-yellow-600 text-xs flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            ⚠️ {warning}
                          </p>
                        ))}
                      </div>
                    )}
                    {!formErrors.email &&
                      !emailWarnings.length &&
                      formData.email.trim() &&
                      EmailValidator.isValidFormat(formData.email) && (
                        <p className="text-green-500 text-xs mt-1 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          ✓ Email válido{' '}
                          {EmailValidator.isPopularDomain(formData.email)
                            ? '(dominio confiable)'
                            : ''}
                        </p>
                      )}
                  </div>

                  <div>
                    <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-1">
                      Notas adicionales (opcional)
                    </label>
                    <textarea
                      id="notas"
                      name="notas"
                      value={formData.notas}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white resize-none"
                      placeholder="Cuéntanos brevemente sobre tu empresa o necesidades específicas..."
                      disabled={formLoading}
                    />
                  </div>
                </form>

                {/* Resumen de la cita */}
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <h4 className="font-semibold text-gray-800 mb-2">Resumen de tu cita</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <strong>Fecha:</strong>{' '}
                      {selectedDate?.toLocaleDateString('es-CL', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p>
                      <strong>Hora:</strong>{' '}
                      {selectedSlot?.start.toLocaleTimeString('es-CL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p>
                      <strong>Duración:</strong> {sessionDuration} minutos
                    </p>
                    <p>
                      <strong>Modalidad:</strong> Virtual (Meet)
                    </p>
                    <p>
                      <strong>Precio:</strong> {sessionPrice}
                    </p>
                  </div>
                </div>

                {/* Botones de navegación para el paso 2 */}
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={handleBack}
                    disabled={formLoading}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    ← Atrás
                  </button>

                  <button
                    onClick={handleContinue}
                    disabled={formLoading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {formLoading
                      ? 'Procesando...'
                      : !sessionPrice ||
                          sessionPrice.trim() === '$0' ||
                          sessionPrice.toLowerCase().includes('gratis') ||
                          sessionPrice.toLowerCase().includes('free')
                        ? 'Confirmar Reserva'
                        : 'Continuar →'}
                  </button>
                </div>
              </>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                Finalizar reserva
              </h3>
              <p className="text-sm text-purple-300">Revisa los detalles y confirma tu reserva</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border">
              <h4 className="font-semibold text-gray-800 mb-4">Detalles de la reserva</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">
                    <strong>Fecha:</strong>
                  </p>
                  <p className="text-gray-900">
                    {selectedDate?.toLocaleDateString('es-CL', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <strong>Hora:</strong>
                  </p>
                  <p className="text-gray-900">
                    {selectedSlot?.start.toLocaleTimeString('es-CL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <strong>Nombre:</strong>
                  </p>
                  <p className="text-gray-900">{formData.nombre}</p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <strong>Email:</strong>
                  </p>
                  <p className="text-gray-900">{formData.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <strong>Teléfono:</strong>
                  </p>
                  <p className="text-gray-900">{formData.telefono}</p>
                </div>
                <div>
                  <p className="text-gray-600">
                    <strong>Precio:</strong>
                  </p>
                  <p className="text-lg font-semibold text-green-600">{sessionPrice}</p>
                </div>
              </div>
              {formData.notas && (
                <div className="mt-4">
                  <p className="text-gray-600">
                    <strong>Notas:</strong>
                  </p>
                  <p className="text-sm text-gray-900">{formData.notas}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmitBooking}
              disabled={formLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {formLoading ? 'Procesando...' : 'Confirmar Reserva'}
            </button>

            {/* Botones de navegación para el paso 3 */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                onClick={handleBack}
                disabled={formLoading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                ← Atrás
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderStepIndicator = () => {
    const steps = ['Horario', 'Datos', 'Confirmar'];
    const isFree =
      !sessionPrice ||
      sessionPrice.trim() === '$0' ||
      sessionPrice.toLowerCase().includes('gratis');
    if (!isFree) steps[2] = 'Pago';

    return (
      <nav aria-label="Progreso de la reserva" className="mb-8">
        <ol role="list" className="flex items-center justify-center space-x-2 md:space-x-8">
          {steps.map((stepName, stepIdx) => (
            <li key={stepName} className="flex items-center">
              {currentStep > stepIdx + 1 ? (
                <div className="flex items-center text-blue-300">
                  <span className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center bg-blue-400 rounded-full">
                    <svg
                      className="w-3 h-3 md:w-5 md:h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span className="ml-1 md:ml-2 text-xs md:text-sm font-medium text-blue-300 hidden xs:inline">
                    {stepName}
                  </span>
                </div>
              ) : currentStep === stepIdx + 1 ? (
                <div className="flex items-center text-blue-300">
                  <span className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center border-2 border-blue-400 rounded-full">
                    <span className="text-blue-300 font-medium text-xs md:text-sm">
                      {stepIdx + 1}
                    </span>
                  </span>
                  <span className="ml-1 md:ml-2 text-xs md:text-sm font-medium text-blue-300 hidden xs:inline">
                    {stepName}
                  </span>
                </div>
              ) : (
                <div className="flex items-center text-gray-300">
                  <span className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center border-2 border-gray-400 rounded-full">
                    <span className="text-gray-300 font-medium text-xs md:text-sm">
                      {stepIdx + 1}
                    </span>
                  </span>
                  <span className="ml-1 md:ml-2 text-xs md:text-sm font-medium text-gray-300 hidden xs:inline">
                    {stepName}
                  </span>
                </div>
              )}
              {stepIdx !== steps.length - 1 && (
                <div className="ml-1 md:ml-4 w-4 md:w-16 h-0.5 bg-gray-400"></div>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  const renderBookingStatus = () => {
    if (bookingStatus === 'success') {
      return (
        <div className="text-center py-8 px-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-orange-600"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-green-400 to-emerald-200 bg-clip-text text-transparent">
            ¡Reserva Confirmada!
          </h3>
          <p className="text-base md:text-lg text-purple-300 mb-2 font-medium">
            Tu asesoría para el{' '}
            <span className="text-purple-500 font-semibold">
              {selectedDate?.toLocaleDateString('es-CL', {
                weekday: 'short',
                day: 'numeric',
                month: 'long',
              })}
            </span>
            {' a las '}
            <span className="text-purple-500 font-semibold">
              {selectedSlot?.start.toLocaleTimeString('es-CL', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {' ha sido confirmada.'}
          </p>
          <p className="text-sm text-purple-300 mb-6 font-medium">
            Recibirás un correo electrónico con los detalles en{' '}
            <span className="text-purple-500 font-semibold">{formData.email}</span>.
          </p>
          <button
            onClick={() => {
              setCurrentStep(1);
              setSelectedDate(null);
              setSelectedSlot(null);
              setAvailableSlots([]);
              setFormData({ nombre: '', email: '', telefono: '', notas: '' });
              setFormErrors({});
              setBookingStatus(null);
              setError(null);
              loadWeekEvents(getWeekStartDate(new Date()));
            }}
            className="py-3 px-8 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Realizar otra reserva
          </button>
        </div>
      );
    }
    if (bookingStatus === 'error') {
      return (
        <div className="text-center py-8 px-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-600"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-3 text-gray-800">Error en la Reserva</h3>
          <p className="text-red-600 mb-6">
            {error || 'No se pudo completar la reserva. Por favor, intenta de nuevo.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => {
                setBookingStatus(null);
                setError(null);
              }}
              className="py-2.5 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Volver a Intentar
            </button>
            <button
              onClick={async () => {
                setBookingStatus(null);
                setError(null);
                setCurrentStep(1);
                setSelectedDate(null);
                setSelectedSlot(null);
                if (tempBlockId) await removeTemporaryBlock(tempBlockId);
              }}
              className="py-2.5 px-6 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Seleccionar otro horario
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render principal del componente
  if (bookingStatus) {
    return (
      <div className={`w-full h-full ${className}`}>
        <div className="bg-white rounded-xl border shadow-xl p-4 sm:p-6 md:p-8 h-full">
          {renderBookingStatus()}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${className}`} ref={calendarRef}>
      {/* Contenedor principal unificado con altura completa y border radius */}
      <div className="bg-white rounded-xl border shadow-xl p-3 sm:p-6 md:p-8 space-y-4 md:space-y-8 h-full overflow-visible flex flex-col">
        {/* Header más simple */}
        <div className="text-center">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">{title}</h1>
          <p className="text-sm md:text-lg text-gray-600">{description}</p>
        </div>

        {/* Indicador de pasos horizontales */}
        {renderStepIndicator()}
        
        {/* Temporizador compacto */}
        {blockTimeRemaining && (currentStep === 1 || currentStep === 2) && (
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Horario reservado: {Math.floor(blockTimeRemaining / 60)}:{(blockTimeRemaining % 60).toString().padStart(2, '0')}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 md:p-4 bg-red-50 border-l-4 border-red-400 rounded-r-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Contenido principal con contenedor flexible que ocupa el resto del espacio */}
        <div className="flex-1 flex flex-col">{renderStepContent()}</div>
      </div>
    </div>
  );
}
