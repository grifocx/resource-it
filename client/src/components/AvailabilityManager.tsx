import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Save, Settings } from "lucide-react";

interface AvailabilityData {
  weeklyHours: number;
  currentCapacity: number;
  outOfOffice: {
    start: string;
    end: string;
    reason: string;
  }[];
}

interface AvailabilityManagerProps {
  initialData?: AvailabilityData;
  onSave?: (data: AvailabilityData) => void;
}

export default function AvailabilityManager({ initialData, onSave }: AvailabilityManagerProps) {
  const [weeklyHours, setWeeklyHours] = useState(initialData?.weeklyHours || 40);
  const [capacity, setCapacity] = useState([initialData?.currentCapacity || 80]);
  const [oooStart, setOooStart] = useState("");
  const [oooEnd, setOooEnd] = useState("");
  const [oooReason, setOooReason] = useState("");
  const [outOfOffice, setOutOfOffice] = useState(initialData?.outOfOffice || []);

  const handleSave = () => {
    const data: AvailabilityData = {
      weeklyHours,
      currentCapacity: capacity[0],
      outOfOffice
    };
    onSave?.(data);
    console.log('Availability updated:', data);
  };

  const addOutOfOffice = () => {
    if (!oooStart || !oooEnd) return;
    
    const newEntry = {
      start: oooStart,
      end: oooEnd,
      reason: oooReason || "Out of office"
    };
    
    setOutOfOffice([...outOfOffice, newEntry]);
    setOooStart("");
    setOooEnd("");
    setOooReason("");
  };

  const removeOutOfOffice = (index: number) => {
    setOutOfOffice(outOfOffice.filter((_, i) => i !== index));
  };

  const getCapacityStatus = (cap: number) => {
    if (cap >= 90) return { label: "At Capacity", color: "bg-red-500" };
    if (cap >= 70) return { label: "Busy", color: "bg-yellow-500" };
    if (cap >= 40) return { label: "Available", color: "bg-green-500" };
    return { label: "Light Load", color: "bg-blue-500" };
  };

  const status = getCapacityStatus(capacity[0]);

  return (
    <Card data-testid="card-availability-manager">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Manage Your Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-md">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${status.color}`} />
            <span className="font-medium">{status.label}</span>
          </div>
          <div className="text-sm text-muted-foreground font-mono">
            {capacity[0]}% capacity
          </div>
        </div>

        {/* Weekly Hours */}
        <div className="space-y-2">
          <Label htmlFor="weekly-hours">Weekly Hours</Label>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input
              id="weekly-hours"
              type="number"
              min="1"
              max="60"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              className="w-20"
              data-testid="input-weekly-hours"
            />
            <span className="text-sm text-muted-foreground">hours per week</span>
          </div>
        </div>

        {/* Capacity Slider */}
        <div className="space-y-3">
          <Label>Current Capacity: {capacity[0]}%</Label>
          <Slider
            value={capacity}
            onValueChange={setCapacity}
            max={100}
            min={0}
            step={5}
            className="w-full"
            data-testid="slider-capacity"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Available</span>
            <span>Fully Booked</span>
          </div>
        </div>

        {/* Out of Office */}
        <div className="space-y-3">
          <Label>Out of Office</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="date"
                placeholder="Start date"
                value={oooStart}
                onChange={(e) => setOooStart(e.target.value)}
                data-testid="input-ooo-start"
              />
            </div>
            <div>
              <Input
                type="date"
                placeholder="End date"
                value={oooEnd}
                onChange={(e) => setOooEnd(e.target.value)}
                data-testid="input-ooo-end"
              />
            </div>
          </div>
          <Input
            placeholder="Reason (optional)"
            value={oooReason}
            onChange={(e) => setOooReason(e.target.value)}
            data-testid="input-ooo-reason"
          />
          <Button 
            size="sm" 
            variant="outline" 
            onClick={addOutOfOffice}
            disabled={!oooStart || !oooEnd}
            data-testid="button-add-ooo"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Add Time Off
          </Button>
        </div>

        {/* Existing Out of Office */}
        {outOfOffice.length > 0 && (
          <div className="space-y-2">
            <Label>Scheduled Time Off</Label>
            <div className="space-y-2">
              {outOfOffice.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="text-sm">
                    <span className="font-mono">{entry.start}</span>
                    <span className="mx-2 text-muted-foreground">to</span>
                    <span className="font-mono">{entry.end}</span>
                    {entry.reason && (
                      <span className="ml-2 text-muted-foreground">({entry.reason})</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeOutOfOffice(index)}
                    data-testid={`button-remove-ooo-${index}`}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full" data-testid="button-save-availability">
          <Save className="h-4 w-4 mr-2" />
          Update Availability
        </Button>
      </CardContent>
    </Card>
  );
}