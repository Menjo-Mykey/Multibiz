import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Clock, LogIn, LogOut } from "lucide-react";
import { format } from "date-fns";

interface ClockRecord {
  id: string;
  clock_in: string;
  clock_out: string | null;
  total_hours: number | null;
  notes: string | null;
}

export default function ClockInOut() {
  const { user } = useAuth();
  const { selectedBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [activeRecord, setActiveRecord] = useState<ClockRecord | null>(null);
  const [todayRecords, setTodayRecords] = useState<ClockRecord[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [todaysCommission, setTodaysCommission] = useState<number>(0);

  useEffect(() => {
    if (user && selectedBusiness) {
      fetchTodayRecords();
      checkActiveRecord();
      fetchTodaysCommission();
    }
  }, [user, selectedBusiness]);

  const fetchTodayRecords = async () => {
    if (!user || !selectedBusiness) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("clock_records")
      .select("*")
      .eq("user_id", user.id)
      .eq("business_id", selectedBusiness.id)
      .gte("clock_in", today.toISOString())
      .order("clock_in", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load today's records",
        variant: "destructive",
      });
    } else {
      setTodayRecords(data || []);
    }
  };

  const fetchTodaysCommission = async () => {
    if (!user) return;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("commissions")
      .select("commission_amount, created_at")
      .eq("user_id", user.id)
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString());

    if (!error) {
      const total = (data || []).reduce(
        (sum, row: any) => sum + Number(row.commission_amount || 0),
        0
      );
      setTodaysCommission(total);
    }
  };

  const checkActiveRecord = async () => {
    if (!user || !selectedBusiness) return;

    const { data, error } = await supabase
      .from("clock_records")
      .select("*")
      .eq("user_id", user.id)
      .eq("business_id", selectedBusiness.id)
      .is("clock_out", null)
      .order("clock_in", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setActiveRecord(data);
    }
  };

  const handleClockIn = async () => {
    if (!user || !selectedBusiness) return;
    setLoading(true);

    const { error } = await supabase.from("clock_records").insert({
      user_id: user.id,
      business_id: selectedBusiness.id,
      clock_in: new Date().toISOString(),
      notes: notes || null,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to clock in",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Clocked In",
        description: "You have successfully clocked in",
      });
      setNotes("");
      await checkActiveRecord();
      await fetchTodayRecords();
    }
    setLoading(false);
  };

  const handleClockOut = async () => {
    if (!activeRecord) return;
    setLoading(true);

    const { error } = await supabase
      .from("clock_records")
      .update({
        clock_out: new Date().toISOString(),
        notes: notes || activeRecord.notes,
      })
      .eq("id", activeRecord.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to clock out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Clocked Out",
        description: "You have successfully clocked out",
      });
      setActiveRecord(null);
      setNotes("");
      await fetchTodayRecords();
    }
    setLoading(false);
  };

  const calculateHours = (clockIn: string, clockOut: string | null) => {
    if (!clockOut) return "Active";
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${hours.toFixed(2)} hours`;
  };

  const totalHoursToday = todayRecords
    .filter((r) => r.total_hours)
    .reduce((sum, r) => sum + (r.total_hours || 0), 0);

  if (!selectedBusiness) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a business first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clock In/Out</h1>
        <p className="text-muted-foreground">Track your working hours</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Current Status
            </CardTitle>
            <CardDescription>
              {activeRecord
                ? "You are currently clocked in"
                : "You are currently clocked out"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Today's Commission
              </p>
              <p className="text-2xl font-bold">
                KSh {todaysCommission.toLocaleString()}
              </p>
            </div>
            {activeRecord && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Clocked in at</p>
                <p className="text-2xl font-bold">
                  {format(new Date(activeRecord.clock_in), "h:mm a")}
                </p>
              </div>
            )}

            <Textarea
              placeholder="Add notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />

            {activeRecord ? (
              <Button
                onClick={handleClockOut}
                disabled={loading}
                variant="destructive"
                className="w-full"
                size="lg"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Clock Out
              </Button>
            ) : (
              <Button
                onClick={handleClockIn}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Clock In
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Summary</CardTitle>
            <CardDescription>Your working hours today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Hours</p>
              <p className="text-4xl font-bold">{totalHoursToday.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {todayRecords.length}{" "}
                {todayRecords.length === 1 ? "session" : "sessions"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Records</CardTitle>
          <CardDescription>All clock in/out records for today</CardDescription>
        </CardHeader>
        <CardContent>
          {todayRecords.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No records for today
            </p>
          ) : (
            <div className="space-y-4">
              {todayRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {format(new Date(record.clock_in), "h:mm a")} -{" "}
                      {record.clock_out
                        ? format(new Date(record.clock_out), "h:mm a")
                        : "Active"}
                    </p>
                    {record.notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {record.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {calculateHours(record.clock_in, record.clock_out)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
