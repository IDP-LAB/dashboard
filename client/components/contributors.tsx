"use client"

import SocialLink from '@/components/social-link';
import React from 'react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

type Collaborator = {
    name: string
    githubUsername: string
    linkedinUrl?: string
    twitterUrl?: string
}

// 1. As informações dos colaboradores são centralizadas em um array de objetos.
const collaborators: Collaborator[] = [
  {
    name: 'João',
    githubUsername: 'Joaoanbp',
    linkedinUrl: 'https://www.linkedin.com/in/joaoanb/',
    twitterUrl: 'https://twitter.com/joaoanb_',
  },
  {
    name: 'Matheus',
    githubUsername: 'Ashu11-A',
  },
  {
    name: 'Guilherme',
    githubUsername: 'Guilh-montalvao',
  },
  {
    name: 'Marley',
    githubUsername: 'Marleyedrg',
    linkedinUrl: 'https://www.linkedin.com/in/marleyedrg/',
  },
];

export function Contributors() {
  return (
    <div className="flex flex-col items-center p-4">
      <h3 className="text-xl font-semibold mb-6">Créditos</h3>
      
      {/* 2. Usamos .map() para renderizar cada colaborador dinamicamente */}
      <div className="flex flex-wrap justify-center gap-8">
        {collaborators.map((collab) => (
          <div key={collab.githubUsername} className="flex flex-col items-center text-center">
            
            {/* 3. A imagem é buscada diretamente pela URL do avatar do GitHub */}
            <img
              src={`https://github.com/${collab.githubUsername}.png`}
              alt={`Foto de ${collab.name}`}
              className="w-24 h-24 rounded-full mb-3 border-2 border-gray-300"
            />
            <p className="font-semibold">{collab.name}</p>

            <div className="flex justify-center space-x-3 mt-2">
              {/* 4. Renderização condicional dos links sociais */}
              {collab.githubUsername && (
                <SocialLink
                  href={`https://github.com/${collab.githubUsername}`}
                  icon={<FaGithub size={28} />}
                  platformName="GitHub"
                />
              )}
              {collab.linkedinUrl && (
                <SocialLink
                  href={collab.linkedinUrl}
                  icon={<FaLinkedin size={28} />}
                  platformName="LinkedIn"
                />
              )}
              {collab.twitterUrl && (
                <SocialLink
                  href={collab.twitterUrl}
                  icon={<FaTwitter size={28} />}
                  platformName="Twitter"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}