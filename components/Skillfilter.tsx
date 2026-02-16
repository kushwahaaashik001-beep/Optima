'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';

interface SkillFilterProps {
  skills: string[];
  onFilterChange: (selectedSkill: string | null) => void;
}

export default function SkillFilter({ skills, onFilterChange }: SkillFilterProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleChange = (skill: string | null) => {
    setSelected(skill);
    onFilterChange(skill);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Filter className="w-4 h-4 text-slate-500" />
      <button
        onClick={() => handleChange(null)}
        className={`px-3 py-1 rounded-full text-sm ${
          selected === null
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        All
      </button>
      {skills.map((skill) => (
        <button
          key={skill}
          onClick={() => handleChange(skill)}
          className={`px-3 py-1 rounded-full text-sm ${
            selected === skill
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {skill}
        </button>
      ))}
    </div>
  );
}
