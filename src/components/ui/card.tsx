import React from 'react';

interface CardProps {
  title: string;
  description: string;
  icon?: string;
  iconClass?: string;
  className?: string;
  hoverEffect?: boolean;
  children?: React.ReactNode;
}

export function Card({
  title,
  description,
  icon,
  iconClass = '',
  className = '',
  hoverEffect = true,
  children,
}: CardProps) {
  return (
    <div
      className={`card-container bg-opacity-10 backdrop-filter backdrop-blur-sm border border-opacity-20 rounded-xl overflow-hidden transition-all duration-300 ${
        hoverEffect ? 'hover:translate-y-[-5px] hover:shadow-xl' : ''
      } ${className}`}
    >
      <div className="card-content p-6">
        {icon && (
          <div className="card-icon-container mb-4">
            <div className={`card-icon text-3xl ${iconClass}`}>{icon}</div>
          </div>
        )}
        <h3 className="card-title text-xl font-bold mb-2">{title}</h3>
        <p className="card-description text-sm opacity-80 mb-4">{description}</p>
        {children && <div className="card-children mt-4">{children}</div>}
      </div>
      <style jsx>{`
        .card-container {
          background-color: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .card-container:hover {
          background-color: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
        }

        /* Estilos para tema oscuro */
        :global(html[data-theme='dark']) .card-container {
          background-color: rgba(30, 30, 50, 0.15);
          border-color: rgba(255, 255, 255, 0.08);
        }

        :global(html[data-theme='dark']) .card-container:hover {
          background-color: rgba(30, 30, 50, 0.25);
          border-color: rgba(255, 255, 255, 0.12);
        }

        /* Estilos para tema claro */
        :global(html[data-theme='light']) .card-container {
          background-color: rgba(255, 255, 255, 0.8);
          border-color: rgba(0, 0, 0, 0.05);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        :global(html[data-theme='light']) .card-container:hover {
          background-color: rgba(255, 255, 255, 0.9);
          border-color: rgba(0, 0, 0, 0.08);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
