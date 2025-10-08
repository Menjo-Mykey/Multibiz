import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Printer, Download } from 'lucide-react';
import { format } from 'date-fns';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface ReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessName: string;
  items: ReceiptItem[];
  total: number;
  paymentMethod: string;
  customerName?: string;
  staffName?: string;
  receiptNumber: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  open,
  onOpenChange,
  businessName,
  items,
  total,
  paymentMethod,
  customerName,
  staffName,
  receiptNumber,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
          <DialogDescription>
            Transaction completed successfully
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 print:text-black">
          {/* Business Header */}
          <div className="text-center">
            <h2 className="text-xl font-bold">{businessName}</h2>
            <p className="text-sm text-muted-foreground">All-in-One POS System</p>
          </div>

          <Separator />

          {/* Receipt Info */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Receipt #:</span>
              <span className="font-medium">{receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-medium">{format(new Date(), 'PPp')}</span>
            </div>
            {customerName && (
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-medium">{customerName}</span>
              </div>
            )}
            {staffName && (
              <div className="flex justify-between">
                <span>Staff:</span>
                <span className="font-medium">{staffName}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Items */}
          <div className="space-y-2">
            <h3 className="font-semibold">Items</h3>
            {items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-muted-foreground">
                    {item.quantity} × KSh {item.price.toLocaleString()}
                  </div>
                </div>
                <div className="font-medium">
                  KSh {item.total.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Total */}
          <div className="space-y-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>KSh {total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Payment Method:</span>
              <span className="font-medium uppercase">{paymentMethod}</span>
            </div>
          </div>

          <Separator />

          <div className="text-center text-sm text-muted-foreground">
            Thank you for your business!
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" className="flex-1" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button className="flex-1" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
