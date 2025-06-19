import React, { useState } from 'react';

const ReservationModal = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = 'El teléfono debe tener exactamente 9 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Información de contacto</h3>
        <p className="text-gray-600">Completa tus datos para confirmar la reserva</p>
      </div>
      {/* ...rest of the form... */}
    </div>
  );
};

export default ReservationModal;
