import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
}

export const Cards: React.FC<CardProps> = ({ title, value, icon, trend }) => {
  return (
    <div className="card card-dark h-100 p-3.5 shadow-sm">
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <span className="text-muted small font-weight-bold text-uppercase" style={{ fontSize: '0.725rem', letterSpacing: '0.04em', color: '#64748b' }}>
            {title}
          </span>
          <h3 className="mb-0 mt-2 font-weight-bold" style={{ fontSize: '1.65rem', color: '#0f172a' }}>
            {value}
          </h3>
          {trend && (
            <span className="small mt-1 d-block font-weight-semibold" style={{ color: '#16a34a', fontSize: '0.775rem' }}>
              {trend}
            </span>
          )}
        </div>
        {icon && (
          <div
            className="p-3 rounded-3 d-flex align-items-center justify-content-center"
            style={{ background: '#dbeafe', color: '#1d4ed8', width: '48px', height: '48px' }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};



