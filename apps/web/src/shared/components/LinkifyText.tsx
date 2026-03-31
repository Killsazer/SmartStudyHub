import React from 'react';

interface Props {
  text: string;
  className?: string;
}

export const LinkifyText: React.FC<Props> = ({ text, className }) => {
  if (!text) return null;

  // Matches either [Label](url) or raw http...
  const linkRegex = /(\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s]+)/g;
  const parts = text.split(linkRegex);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        // Matched markdown link
        const markdownMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (markdownMatch) {
          const label = markdownMatch[1];
          const url = markdownMatch[2];
          return (
            <a 
              key={i} 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 break-all"
            >
              {label}
            </a>
          );
        }
        
        // Matched raw URL
        if (part.match(/^https?:\/\//)) {
          return (
            <a 
              key={i} 
              href={part} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 break-all"
            >
              {part}
            </a>
          );
        }

        // Regular text
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
};
