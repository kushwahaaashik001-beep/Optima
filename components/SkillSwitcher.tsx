'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SkillSwitcherProps {
  selectedSkill: string;
  onSkillChange: (skill: string) => void;
}

export default function SkillSwitcher({ selectedSkill, onSkillChange }: SkillSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const skills = [
    'all',
    'React Developer',
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'DevOps Engineer',
    'Data Scientist',
    'AI/ML Engineer',
    'Mobile App Developer',
    'UI/UX Designer',
    'Product Manager',
    'Digital Marketer',
  ];

  const handleSelect = (skill: string) => {
    onSkillChange(skill);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-blue-300 focus:outline-none"
      >
        <span>{selectedSkill === 'all' ? 'All Skills' : selectedSkill}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {skills.map((skill) => (
            <button
              key={skill}
              onClick={() => handleSelect(skill)}
              className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${
                selectedSkill === skill ? 'bg-blue-100 text-blue-700' : 'text-slate-700'
              }`}
            >
              {skill === 'all' ? 'All Skills' : skill}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
