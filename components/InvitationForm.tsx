import React from 'react';
import { InvitationDetails } from '../types';

interface InvitationFormProps {
  details: InvitationDetails;
  onDetailsChange: (field: keyof InvitationDetails, value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const InputField: React.FC<{ label: string; id: keyof InvitationDetails; value: string; onChange: (id: keyof InvitationDetails, value: string) => void; required?: boolean; placeholder?: string; type?: string; as?: 'input' | 'textarea' }> = 
({ label, id, value, onChange, required = false, placeholder, type = 'text', as = 'input' }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {as === 'input' ? (
            <input
                type={type}
                id={id}
                name={id}
                value={value}
                onChange={(e) => onChange(id, e.target.value)}
                required={required}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
            />
        ) : (
            <textarea
                id={id}
                name={id}
                value={value}
                onChange={(e) => onChange(id, e.target.value)}
                required={required}
                placeholder={placeholder}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
            />
        )}
    </div>
);


const InvitationForm: React.FC<InvitationFormProps> = ({ details, onDetailsChange, onSubmit, isLoading }) => {
  const themes: InvitationDetails['theme'][] = ['Floral & Romantic', 'Modern & Minimalist', 'Rustic Charm', 'Vintage Elegance'];

  return (
    <div className="p-8 bg-white rounded-2xl shadow-lg h-full overflow-y-auto">
      <h2 className="font-serif text-3xl font-bold text-gray-800 mb-6">Create Your Invitation</h2>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
        <InputField label="Bride's Name" id="brideName" value={details.brideName} onChange={onDetailsChange} required placeholder="e.g., Jane Doe" />
        <InputField label="Groom's Name (Optional)" id="groomName" value={details.groomName || ''} onChange={onDetailsChange} placeholder="e.g., John Smith" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Event Date" id="date" value={details.date} onChange={onDetailsChange} required type="date" />
          <InputField label="Event Time" id="time" value={details.time} onChange={onDetailsChange} required type="time" />
        </div>

        <InputField label="Location / Address" id="location" value={details.location} onChange={onDetailsChange} required as="textarea" placeholder="123 Main Street, Anytown, USA" />
        <InputField label="RSVP Information" id="rsvpInfo" value={details.rsvpInfo} onChange={onDetailsChange} required as="textarea" placeholder="RSVP to Mary at (555) 123-4567 by May 1st" />
        <InputField label="Registry Information (Optional)" id="registryInfo" value={details.registryInfo || ''} onChange={onDetailsChange} as="textarea" placeholder="Registered at Crate & Barrel" />

        <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">Invitation Theme</label>
            <select
                id="theme"
                name="theme"
                value={details.theme}
                onChange={(e) => onDetailsChange('theme', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
            >
                {themes.map(theme => <option key={theme} value={theme}>{theme}</option>)}
            </select>
        </div>

        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-transform transform hover:scale-105 disabled:bg-pink-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            '✨ Generate Invitation'
          )}
        </button>
      </form>
    </div>
  );
};

export default InvitationForm;
