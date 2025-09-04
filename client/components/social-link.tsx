// src/components/SocialLink.tsx
import React from 'react';

// Definindo o tipo das propriedades do nosso componente
type SocialLinkProps = {
  href: string;
  icon: React.ReactNode; // React.ReactNode pode ser qualquer coisa renderizável
  platformName: string;
};

// Usando as classes do Tailwind para estilização
const SocialLink: React.FC<SocialLinkProps> = ({ href, icon, platformName }) => {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      aria-label={`Link para ${platformName}`}
      className="text-gray-600 hover:text-blue-600 transition duration-300 mx-2"
    >
      {icon}
    </a>
  );
};

export default SocialLink;