import React from 'react';
import { Button } from '@/components/ui/button';
import { Delete } from 'lucide-react';

interface PinPadProps {
  pin: string;
  onPinChange: (pin: string) => void;
  maxLength?: number;
}

export const PinPad: React.FC<PinPadProps> = ({ pin, onPinChange, maxLength = 6 }) => {
  const handleNumberClick = (num: string) => {
    if (pin.length < maxLength) {
      onPinChange(pin + num);
    }
  };

  const handleDelete = () => {
    onPinChange(pin.slice(0, -1));
  };

  const handleClear = () => {
    onPinChange('');
  };

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="space-y-4">
      {/* PIN Display */}
      <div className="flex justify-center gap-2 mb-6">
        {Array.from({ length: maxLength }).map((_, i) => (
          <div
            key={i}
            className={`h-12 w-12 rounded-lg border-2 flex items-center justify-center text-2xl font-bold ${
              i < pin.length
                ? 'bg-primary border-primary text-primary-foreground'
                : 'bg-background border-muted'
            }`}
          >
            {i < pin.length ? '•' : ''}
          </div>
        ))}
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-3">
        {numbers.slice(0, 9).map((num) => (
          <Button
            key={num}
            variant="outline"
            size="lg"
            onClick={() => handleNumberClick(num)}
            className="h-16 text-2xl font-semibold hover:bg-primary hover:text-primary-foreground"
          >
            {num}
          </Button>
        ))}
        <Button
          variant="outline"
          size="lg"
          onClick={handleClear}
          className="h-16 text-sm"
        >
          Clear
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleNumberClick('0')}
          className="h-16 text-2xl font-semibold hover:bg-primary hover:text-primary-foreground"
        >
          0
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleDelete}
          className="h-16"
        >
          <Delete className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};
