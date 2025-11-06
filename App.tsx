import React, { useState } from 'react';
import InvitationForm from './components/InvitationForm';
import InvitationPreview from './components/InvitationPreview';
import { InvitationDetails } from './types';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [details, setDetails] = useState<InvitationDetails>({
    brideName: '',
    groomName: '',
    date: '',
    time: '',
    location: '',
    rsvpInfo: '',
    registryInfo: '',
    theme: 'Floral & Romantic',
  });
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDetailsChange = (field: keyof InvitationDetails, value: string) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedHtml(null);
    try {
      const html = await geminiService.createInvitation(details);
      setGeneratedHtml(html);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-gray-800">
          Bridal Shower Invitation Creator
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Design a personalized invitation with the help of AI
        </p>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        <InvitationForm 
          details={details}
          onDetailsChange={handleDetailsChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
        <InvitationPreview 
          htmlContent={generatedHtml}
          isLoading={isLoading}
          error={error}
        />
      </main>
      <footer className="text-center mt-8 text-sm text-gray-500">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
