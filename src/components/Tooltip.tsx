import React from 'react';
import './Tooltip.css';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  delay?: number;
}

/**
 * Simple Tooltip component for displaying help text on hover
 * Usage: <Tooltip content="Click to send message" position="top"><button>Send</button></Tooltip>
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
  delay = 500,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`tooltip-wrapper ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div className={`tooltip tooltip-${position}`} role="tooltip">
          {content}
        </div>
      )}
    </div>
  );
};

interface TooltipGroupProps {
  children: React.ReactNode;
}

/**
 * Wrapper to group tooltips for consistent styling
 */
export const TooltipGroup: React.FC<TooltipGroupProps> = ({ children }) => {
  return <div className="tooltip-group">{children}</div>;
};
