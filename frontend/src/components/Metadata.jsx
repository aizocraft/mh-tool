// src/components/Metadata.jsx
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const routeMetadata = {
  '/': {
    title: '  Home | MH - Questionnaire ',
    description: 'Welcome to the MH Questionnaire platform.',
  },
  '/login': {
    title: ' Login | MH - Questionnaire ',
    description: 'Log in to access your MH Questionnaire dashboard.',
  },
  '/admin': {
    title: 'Dashboard | MH - Questionnaire ',
    description: 'Manage questionnaires and user responses.',
  },
};

const Metadata = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const meta = routeMetadata[path] || {
      title: 'MH - Questionnaire',
      description: 'Mental Health Questionnaire Platform',
    };

    // Update document title
    document.title = meta.title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = meta.description;
  }, [location]);

  return null; // This component doesn't render anything
};

export default Metadata;