import React, { useState, useRef, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DatePicker } from './DatePicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RecurrencePattern, RotationPattern, TeamMember } from '@/types';
import { MapPin, Calendar, Users, Check, RotateCcw, ChevronDown, ChevronUp, RefreshCw, MoveUp, MoveDown, PlusCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from "sonner";

const AddTaskForm: React.FC = () => {
  const { addTask, team, currentUser, currentTeam } = useTaskContext();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>(currentUser ? [currentUser] : []);
  const [showAssignees, setShowAssignees] = useState(false);
  const formContentRef = useRef<HTMLDivElement>(null);
  
  // Recurrence fields
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [interval, setInterval] = useState(1);
  const [showRecurrenceOptions, setShowRecurrenceOptions] = useState(false);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1]); // Monday is 1, Sunday is 0
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [recurringMonth, setRecurringMonth] = useState(0); // January is 0
  const [recurringDay, setRecurringDay] = useState(1);
  
  // Rotation fields
  const [isRotationEnabled, setIsRotationEnabled] = useState(false);
  const [rotationMembers, setRotationMembers] = useState<TeamMember[]>([]);
  const [showRotationOptions, setShowRotationOptions] = useState(false);

  // Add automatic scrolling to bottom when form content changes
  useEffect(() => {
    if (open && formContentRef.current) {
      // Add a small delay to ensure the DOM has updated
      setTimeout(() => {
        if (formContentRef.current) {
          formContentRef.current.scrollTop = 0;
        }
      }, 100);
    }
  }, [open, isRecurring, showRecurrenceOptions, isRotationEnabled, showRotationOptions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !locationName || !currentUser || !currentTeam) {
      toast.error(currentTeam ? 'Please fill in required fields' : 'No team selected');
      return;
    }
    
    // Create the recurrence pattern if enabled
    let recurrence: RecurrencePattern | undefined;
    
    if (isRecurring && dueDate) {
      switch (recurrenceType) {
        case 'daily':
          recurrence = { type: 'daily', interval };
          break;
        case 'weekly':
          recurrence = { type: 'weekly', interval, daysOfWeek };
          break;
        case 'monthly':
          recurrence = { type: 'monthly', interval, dayOfMonth };
          break;
        case 'yearly':
          recurrence = { type: 'yearly', interval, month: recurringMonth, day: recurringDay };
          break;
        default:
          recurrence = { type: 'none', interval: 0 };
      }
    }
    
    // Create rotation pattern if enabled
    let rotation: RotationPattern | undefined;
    if (isRecurring && isRotationEnabled && rotationMembers.length > 0) {
      rotation = {
        enabled: true,
        memberIds: rotationMembers.map(m => m.id),
        currentIndex: 0
      };
    }
    
    // If rotation is enabled, set the first person in the rotation as the assignee
    const assignees = isRotationEnabled && rotationMembers.length > 0 
      ? [rotationMembers[0]] 
      : selectedMembers;
    
    addTask({
      title,
      description,
      location: { name: locationName },
      completed: false,
      assignedTo: assignees,
      createdBy: currentUser.id,
      createdAt: new Date(),
      dueDate,
      recurrence,
      rotation,
      teamId: currentTeam.id // Add team ID to associate task with current team
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setLocationName('');
    setDueDate(undefined);
    setSelectedMembers(currentUser ? [currentUser] : []);
    setIsRecurring(false);
    setShowRecurrenceOptions(false);
    setIsRotationEnabled(false);
    setRotationMembers([]);
    setShowRotationOptions(false);
    setOpen(false);
  };

  const toggleMember = (member: TeamMember) => {
    if (selectedMembers.some(m => m.id === member.id)) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };
  
  const toggleRotationMember = (member: TeamMember) => {
    if (rotationMembers.some(m => m.id === member.id)) {
      setRotationMembers(rotationMembers.filter(m => m.id !== member.id));
    } else {
      setRotationMembers([...rotationMembers, member]);
    }
  };
  
  const moveRotationMember = (index: number, direction: 'up' | 'down') => {
    if (index < 0 || index >= rotationMembers.length) return;
    
    const newMembers = [...rotationMembers];
    if (direction === 'up' && index > 0) {
      // Swap with previous item
      [newMembers[index - 1], newMembers[index]] = [newMembers[index], newMembers[index - 1]];
    } else if (direction === 'down' && index < rotationMembers.length - 1) {
      // Swap with next item
      [newMembers[index], newMembers[index + 1]] = [newMembers[index + 1], newMembers[index]];
    }
    
    setRotationMembers(newMembers);
  };
  
  const toggleDayOfWeek = (day: number) => {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter(d => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day]);
    }
  };

  // For monthly recurrence, update dayOfMonth when due date changes
  React.useEffect(() => {
    if (dueDate) {
      setDayOfMonth(dueDate.getDate());
      setRecurringMonth(dueDate.getMonth());
      setRecurringDay(dueDate.getDate());
    }
  }, [dueDate]);

  // Disable rotation if not recurring
  React.useEffect(() => {
    if (!isRecurring) {
      setIsRotationEnabled(false);
      setShowRotationOptions(false);
    }
  }, [isRecurring]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {currentTeam ? (
        <DialogTrigger asChild>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Button className="w-full bg-gradient-to-r from-[#4F46E5] to-[#7E69AB] hover:from-[#4F46E5]/90 hover:to-[#7E69AB]/90 font-inter font-semibold text-base shadow-md flex items-center justify-center gap-2 py-6">
              <PlusCircle className="h-5 w-5" />
              Add New Task to {currentTeam.name}
            </Button>
          </motion.div>
        </DialogTrigger>
      ) : (
        <Button 
          className="w-full bg-muted text-muted-foreground cursor-not-allowed"
          onClick={() => toast.error('Please select a team first')}
          disabled
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Select a Team First
        </Button>
      )}
      
      <DialogContent 
        className="sm:max-w-md max-h-[90vh] flex flex-col"
        style={{ overflowY: 'hidden' }}
      >
        <DialogHeader className="sticky top-0 bg-background z-10 pb-2">
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Create a new task for your team
          </DialogDescription>
        </DialogHeader>
        
        <div 
          ref={formContentRef}
          className="overflow-y-auto pr-2 flex-1 custom-scrollbar"
          style={{ 
            maxHeight: 'calc(90vh - 150px)',
            scrollbarWidth: 'thin',
            scrollbarColor: 'hsl(var(--border)) transparent'
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4 mt-4 pb-2">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details..."
                className="min-h-24 resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Location
              </Label>
              <Input
                id="location"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Where will this task be done?"
                className="w-full"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Due Date {isRecurring ? '(First Occurrence)' : '(Optional)'}
              </Label>
              <DatePicker 
                date={dueDate} 
                setDate={setDueDate}
                className="w-full"
              />
            </div>
            
            {/* Recurrence Section */}
            <div className="space-y-2 pb-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isRecurring" 
                  checked={isRecurring}
                  onCheckedChange={(checked) => {
                    setIsRecurring(!!checked);
                    if (checked) setShowRecurrenceOptions(true);
                  }}
                />
                <div className="flex items-center gap-2">
                  <Label 
                    htmlFor="isRecurring" 
                    className="flex items-center gap-2 cursor-pointer text-sm font-medium"
                  >
                    <RotateCcw className="h-4 w-4 text-primary" />
                    This is a recurring task
                  </Label>
                  {isRecurring && (
                    <Button 
                      type="button"
                      variant="ghost" 
                      className="h-6 w-6 p-0" 
                      onClick={() => setShowRecurrenceOptions(!showRecurrenceOptions)}
                    >
                      {showRecurrenceOptions ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  )}
                </div>
              </div>
              
              {isRecurring && showRecurrenceOptions && (
                <div className="bg-muted/50 p-3 rounded-md space-y-3 mt-2">
                  <div className="space-y-1">
                    <Label htmlFor="recurrenceType" className="text-xs">Repeat</Label>
                    <Select 
                      value={recurrenceType} 
                      onValueChange={(value: any) => setRecurrenceType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="interval" className="text-xs">Every</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="interval"
                        type="number" 
                        min={1} 
                        max={99}
                        value={interval} 
                        onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                        className="w-16" 
                      />
                      <span className="text-sm">
                        {recurrenceType === 'daily' && (interval === 1 ? 'day' : 'days')}
                        {recurrenceType === 'weekly' && (interval === 1 ? 'week' : 'weeks')}
                        {recurrenceType === 'monthly' && (interval === 1 ? 'month' : 'months')}
                        {recurrenceType === 'yearly' && (interval === 1 ? 'year' : 'years')}
                      </span>
                    </div>
                  </div>
                  
                  {recurrenceType === 'weekly' && (
                    <div className="space-y-1">
                      <Label className="text-xs">On these days</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
                          // Adjust index so Monday is 1 and Sunday is 0
                          const dayValue = index === 0 ? 0 : index;
                          return (
                            <Button
                              key={index}
                              type="button"
                              variant={daysOfWeek.includes(dayValue) ? "default" : "outline"}
                              className={`h-8 w-8 p-0 rounded-full text-xs ${
                                daysOfWeek.includes(dayValue) 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'text-muted-foreground'
                              }`}
                              onClick={() => toggleDayOfWeek(dayValue)}
                            >
                              {day}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {recurrenceType === 'monthly' && dueDate && (
                    <div className="text-xs text-muted-foreground">
                      Will repeat on day {dayOfMonth} of each month
                    </div>
                  )}
                  
                  {recurrenceType === 'yearly' && dueDate && (
                    <div className="text-xs text-muted-foreground">
                      Will repeat every {format(dueDate, 'MMMM d')} each year
                    </div>
                  )}
                </div>
              )}
              
              {/* Rotation Section */}
              {isRecurring && (
                <div className="mt-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isRotating" 
                      checked={isRotationEnabled}
                      onCheckedChange={(checked) => {
                        setIsRotationEnabled(!!checked);
                        if (checked) {
                          setShowRotationOptions(true);
                          if (rotationMembers.length === 0 && selectedMembers.length > 0) {
                            // Initialize rotation with current assignees
                            setRotationMembers([...selectedMembers]);
                          }
                        }
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <Label 
                        htmlFor="isRotating" 
                        className="flex items-center gap-2 cursor-pointer text-sm font-medium"
                      >
                        <RefreshCw className="h-4 w-4 text-primary" />
                        Rotate responsibility
                      </Label>
                      {isRotationEnabled && (
                        <Button 
                          type="button"
                          variant="ghost" 
                          className="h-6 w-6 p-0" 
                          onClick={() => setShowRotationOptions(!showRotationOptions)}
                        >
                          {showRotationOptions ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {isRotationEnabled && showRotationOptions && (
                    <div className="mt-2 bg-muted/50 p-3 rounded-md space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs flex items-center gap-1.5">
                          <RefreshCw className="h-3 w-3" />
                          Team members in rotation order
                        </Label>
                        
                        <div className="space-y-2 mt-2">
                          {rotationMembers.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-2 text-center">
                              Select team members to include in the rotation below
                            </p>
                          ) : (
                            <div className="space-y-1.5">
                              {rotationMembers.map((member, index) => (
                                <div 
                                  key={member.id}
                                  className="flex items-center justify-between bg-background p-2 rounded-md border border-border"
                                >
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                                      {index + 1}
                                    </Badge>
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={member.avatar} alt={member.name} />
                                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{member.name}</span>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => moveRotationMember(index, 'up')}
                                      disabled={index === 0}
                                    >
                                      <MoveUp className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => moveRotationMember(index, 'down')}
                                      disabled={index === rotationMembers.length - 1}
                                    >
                                      <MoveDown className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="pt-2 text-xs text-muted-foreground">
                            <p className="font-medium mb-1">How it works</p>
                            <p>Each time a task recurs, responsibility will automatically rotate to the next person in the list.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2 cursor-pointer" onClick={() => setShowAssignees(!showAssignees)}>
                <Users className="h-4 w-4 text-primary" />
                {isRotationEnabled ? "Select Team Members for Rotation" : "Assigned Team Members"}
              </Label>
              
              {showAssignees && (
                <div className="bg-muted/50 p-3 rounded-md space-y-2">
                  {team.map((member) => (
                    <div 
                      key={member.id}
                      className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                        isRotationEnabled 
                          ? rotationMembers.some(m => m.id === member.id) 
                            ? 'bg-accent/10 border border-accent/20' 
                            : 'hover:bg-muted'
                          : selectedMembers.some(m => m.id === member.id) 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'hover:bg-muted'
                      }`}
                      onClick={() => isRotationEnabled 
                        ? toggleRotationMember(member)
                        : toggleMember(member)
                      }
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="flex-grow">{member.name}</span>
                      {isRotationEnabled 
                        ? rotationMembers.some(m => m.id === member.id) && (
                            <Check className="h-4 w-4 text-accent" />
                          )
                        : selectedMembers.some(m => m.id === member.id) && (
                            <Check className="h-4 w-4 text-primary" />
                          )
                      }
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mt-2">
                {isRotationEnabled ? (
                  rotationMembers.length > 0 ? (
                    <Badge variant="outline" className="bg-accent/10 border-accent/20 text-accent">
                      {rotationMembers.length} member{rotationMembers.length !== 1 ? 's' : ''} in rotation
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      No rotation members selected
                    </Badge>
                  )
                ) : (
                  selectedMembers.map((member) => (
                    <Badge key={member.id} variant="outline" className="flex items-center gap-1">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="text-[10px]">{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{member.name}</span>
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </form>
        </div>
        
        <div className="flex justify-end gap-2 pt-2 bg-background z-10 border-t border-border mt-2 py-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="submit"
            onClick={handleSubmit}
            disabled={(isRecurring && !dueDate) || (isRotationEnabled && rotationMembers.length === 0)}
            className="bg-gradient-to-r from-[#4F46E5] to-[#7E69AB] hover:from-[#4F46E5]/90 hover:to-[#7E69AB]/90"
          >
            Add Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskForm;
