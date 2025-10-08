import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ApprovalRequest {
  id: string;
  type: string;
  request_data: any;
  reason: string | null;
  response_comment: string | null;
  status: string;
  created_at: string;
  requested_by: string;
  profiles: {
    full_name: string;
  };
}

export default function Approvals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [responseComment, setResponseComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRequests();
      subscribeToRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('approval_requests')
      .select(`
        *,
        profiles!requested_by (full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load approval requests",
        variant: "destructive",
      });
    } else {
      setRequests(data || []);
    }
  };

  const subscribeToRequests = () => {
    const channel = supabase
      .channel('approval-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'approval_requests',
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleApprove = async () => {
    if (!selectedRequest || !user) return;
    setLoading(true);

    const { error } = await supabase
      .from('approval_requests')
      .update({
        status: 'approved',
        approved_by: user.id,
        response_comment: responseComment,
      })
      .eq('id', selectedRequest.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Approved",
        description: "Request has been approved successfully",
      });
      setIsDialogOpen(false);
      setSelectedRequest(null);
      setResponseComment('');
      await fetchRequests();
    }
    setLoading(false);
  };

  const handleReject = async () => {
    if (!selectedRequest || !user) return;
    setLoading(true);

    const { error } = await supabase
      .from('approval_requests')
      .update({
        status: 'rejected',
        approved_by: user.id,
        response_comment: responseComment,
      })
      .eq('id', selectedRequest.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Rejected",
        description: "Request has been rejected",
      });
      setIsDialogOpen(false);
      setSelectedRequest(null);
      setResponseComment('');
      await fetchRequests();
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', label: 'Pending', icon: Clock },
      approved: { variant: 'default', label: 'Approved', icon: CheckCircle, className: 'bg-green-600' },
      rejected: { variant: 'destructive', label: 'Rejected', icon: XCircle },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      discount: 'Discount Request',
      payment: 'Payment Request',
      expense: 'Expense Approval',
      commission: 'Commission Payout',
    };
    return labels[type] || type;
  };

  const filterByStatus = (status: string) => {
    return requests.filter(r => r.status === status);
  };

  const renderRequestDetails = (request: ApprovalRequest) => {
    const data = request.request_data;
    
    switch (request.type) {
      case 'discount':
        return (
          <div className="space-y-2">
            <p><strong>Discount Amount:</strong> {data.discount_percentage}%</p>
            <p><strong>Original Amount:</strong> KSh {data.original_amount}</p>
            <p><strong>New Amount:</strong> KSh {data.new_amount}</p>
          </div>
        );
      case 'payment':
        return (
          <div className="space-y-2">
            <p><strong>Payment Type:</strong> {data.payment_type}</p>
            <p><strong>Amount:</strong> KSh {data.amount}</p>
            <p><strong>Recipient:</strong> {data.recipient}</p>
          </div>
        );
      case 'expense':
        return (
          <div className="space-y-2">
            <p><strong>Category:</strong> {data.category}</p>
            <p><strong>Amount:</strong> KSh {data.amount}</p>
            <p><strong>Description:</strong> {data.description}</p>
          </div>
        );
      default:
        return <p>Details not available</p>;
    }
  };

  const RequestCard = ({ request }: { request: ApprovalRequest }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
      setSelectedRequest(request);
      setIsDialogOpen(true);
    }}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge(request.status)}
              <Badge variant="outline">
                <DollarSign className="mr-1 h-3 w-3" />
                {getTypeLabel(request.type)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Requested by {request.profiles?.full_name || 'Unknown'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        {request.reason && (
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Reason:</p>
            <p className="text-sm text-muted-foreground">{request.reason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Approval Center</h1>
        <p className="text-muted-foreground">Review and manage approval requests</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{filterByStatus('pending').length}</CardTitle>
            <CardDescription>Pending Requests</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{filterByStatus('approved').length}</CardTitle>
            <CardDescription>Approved</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{filterByStatus('rejected').length}</CardTitle>
            <CardDescription>Rejected</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {filterByStatus('pending').length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            filterByStatus('pending').map(request => (
              <RequestCard key={request.id} request={request} />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {filterByStatus('approved').map(request => (
            <RequestCard key={request.id} request={request} />
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {filterByStatus('rejected').map(request => (
            <RequestCard key={request.id} request={request} />
          ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {requests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setSelectedRequest(null);
          setResponseComment('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRequest && getTypeLabel(selectedRequest.type)}</DialogTitle>
            <DialogDescription>
              Review and respond to this approval request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                {renderRequestDetails(selectedRequest)}
              </div>

              {selectedRequest.reason && (
                <div>
                  <Label>Reason</Label>
                  <p className="text-sm mt-1">{selectedRequest.reason}</p>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="comment">Response Comment (Optional)</Label>
                    <Textarea
                      id="comment"
                      value={responseComment}
                      onChange={(e) => setResponseComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleApprove}
                      disabled={loading}
                      className="flex-1"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      onClick={handleReject}
                      disabled={loading}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </>
              )}

              {selectedRequest.status !== 'pending' && selectedRequest.response_comment && (
                <div>
                  <Label>Response Comment</Label>
                  <p className="text-sm mt-1">{selectedRequest.response_comment}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
