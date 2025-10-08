import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { Scissors, Droplets } from 'lucide-react';

export const BusinessSelector: React.FC = () => {
  const { selectedBusiness, setSelectedBusiness, businesses } = useBusinessContext();

  const getBusinessIcon = (type: string) => {
    switch (type) {
      case 'triplek':
        return <Scissors className="h-4 w-4 mr-2" />;
      case 'swan':
        return <Droplets className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  const getBusinessColor = (type: string) => {
    switch (type) {
      case 'triplek':
        return 'bg-triplek text-triplek-foreground';
      case 'swan':
        return 'bg-swan text-swan-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Select
        value={selectedBusiness?.id || ''}
        onValueChange={(value) => {
          const business = businesses.find(b => b.id === value);
          setSelectedBusiness(business || null);
        }}
      >
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select a business" />
        </SelectTrigger>
        <SelectContent>
          {businesses.map((business) => (
            <SelectItem key={business.id} value={business.id}>
              <div className="flex items-center">
                {getBusinessIcon(business.type)}
                {business.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedBusiness && (
        <Badge className={getBusinessColor(selectedBusiness.type)}>
          {selectedBusiness.type === 'triplek' ? 'Barbershop' : 'Water Distribution'}
        </Badge>
      )}
    </div>
  );
};