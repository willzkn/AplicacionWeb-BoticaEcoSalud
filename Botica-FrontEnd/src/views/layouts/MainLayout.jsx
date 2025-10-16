import React from 'react';
import Header from '../partials/Header';
import Footer from '../partials/Footer';
import Chatbot from '../partials/Chatbot';

function MainLayout({ children, searchTerm = '', onSearchChange, onSearchKeyPress, backgroundImageUrl = `${process.env.PUBLIC_URL}/assets/mi-fondo.JPG` }) {
  const rootStyle = backgroundImageUrl
    ? { ['--app-bg-image']: `url(${backgroundImageUrl})` }
    : undefined;
  return (
    <div className="ecosalud-root app-background" style={rootStyle}>
      <Header
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onSearchKeyPress={onSearchKeyPress}
      />
      <main className="main-center">
        {children}
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}

export default MainLayout;
