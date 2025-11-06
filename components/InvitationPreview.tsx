import React from 'react';

interface InvitationPreviewProps {
  htmlContent: string | null;
  isLoading: boolean;
  error: string | null;
}

const InvitationPreview: React.FC<InvitationPreviewProps> = ({ htmlContent, isLoading, error }) => {
  return (
    <div className="p-8 bg-gray-50 rounded-2xl shadow-inner h-full flex flex-col items-center justify-center">
      <h2 className="font-serif text-3xl font-bold text-gray-800 mb-6 text-center">Invitation Preview</h2>
      <div className="w-full max-w-lg h-[640px] bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 flex items-center justify-center">
        {isLoading && (
          <div className="text-center text-gray-500">
            <svg className="animate-spin mx-auto h-12 w-12 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 font-semibold">Gemini is creating magic...</p>
          </div>
        )}
        {error && !isLoading && (
          <div className="p-6 text-center text-red-600">
            <h3 className="font-bold mb-2">Oops! Something went wrong.</h3>
            <p className="text-sm">{error}</p>
          </div>
        )}
        {!isLoading && !error && htmlContent && (
          <iframe
            srcDoc={htmlContent}
            title="Invitation Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts" // Be cautious if the HTML can contain scripts
          />
        )}
        {!isLoading && !error && !htmlContent && (
          <div className="text-center text-gray-400 p-6">
            <p className="font-serif text-xl">Your beautiful invitation will appear here.</p>
            <p className="mt-2 text-sm">Fill out the form and click "Generate" to see the result.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationPreview;
