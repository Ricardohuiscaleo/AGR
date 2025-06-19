import React from 'react';
import ParticlesBackground from './ParticlesBackground';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <ParticlesBackground />
      <main>{children}</main>

      <style jsx>{`
        .layout {
          position: relative;
          min-height: 100vh;
          width: 100%;
        }
        main {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  );
};

export default Layout;
