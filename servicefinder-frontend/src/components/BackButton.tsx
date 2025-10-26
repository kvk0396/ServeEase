import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

interface BackButtonProps {
  className?: string;
  onClick?: () => void;
}

export default function BackButton({ className, onClick }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-all duration-300 ease-in-out shadow-sm hover:shadow-md',
        className
      )}
      title="Go back"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  );
} 