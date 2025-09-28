import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Save, X } from "lucide-react";

interface TimeEntry {
  workItemId: string;
  workItemTitle: string;
  hours: number;
  description: string;
  date: string;
}

interface TimeLogEntryProps {
  onSave?: (entry: TimeEntry) => void;
  onCancel?: () => void;
  workItems?: { id: string; title: string; type: "project" | "om" }[];
  initialItem?: { id: string; title: string };
}

export default function TimeLogEntry({ onSave, onCancel, workItems = [], initialItem }: TimeLogEntryProps) {
  const [selectedItemId, setSelectedItemId] = useState(initialItem?.id || "");
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSave = () => {
    if (!selectedItemId || !hours) return;
    
    const selectedItem = workItems.find(item => item.id === selectedItemId);
    if (!selectedItem) return;

    const entry: TimeEntry = {
      workItemId: selectedItemId,
      workItemTitle: selectedItem.title,
      hours: parseFloat(hours),
      description,
      date
    };
    
    onSave?.(entry);
    console.log('Time entry saved:', entry);
    
    // Reset form
    setSelectedItemId("");
    setHours("");
    setDescription("");
    setDate(new Date().toISOString().split('T')[0]);
  };

  const isValid = selectedItemId && hours && parseFloat(hours) > 0;

  return (
    <Card data-testid="card-time-log-entry">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          Log Time Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="work-item">Work Item *</Label>
          <Select 
            value={selectedItemId} 
            onValueChange={setSelectedItemId}
            data-testid="select-work-item"
          >
            <SelectTrigger id="work-item">
              <SelectValue placeholder="Select work item..." />
            </SelectTrigger>
            <SelectContent>
              {workItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {item.type === "project" ? "PROJECT" : "O&M"}
                    </span>
                    <span className="truncate">{item.title}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hours">Hours *</Label>
            <Input
              id="hours"
              type="number"
              placeholder="0.0"
              step="0.5"
              min="0"
              max="24"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              data-testid="input-hours"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              data-testid="input-date"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="What did you work on? (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            data-testid="textarea-description"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleSave} 
            disabled={!isValid}
            className="flex-1"
            data-testid="button-save-time-entry"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Entry
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            data-testid="button-cancel-time-entry"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}