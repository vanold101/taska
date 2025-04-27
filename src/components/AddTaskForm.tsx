
import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DatePicker } from './DatePicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeamMember } from '@/types';
import { MapPin, UserPlus, Calendar, Users, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const AddTaskForm: React.FC = () => {
  const { addTask, team } = useTaskContext();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([team.members[0]]);
  const [showAssignees, setShowAssignees] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !locationName) return;
    
    addTask({
      title,
      description,
      location: { name: locationName },
      completed: false,
      assignedTo: selectedMembers,
      createdBy: team.members[0].id,
      dueDate,
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setLocationName('');
    setDueDate(undefined);
    setSelectedMembers([team.members[0]]);
    setOpen(false);
  };

  const toggleMember = (member: TeamMember) => {
    if (selectedMembers.some(m => m.id === member.id)) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary hover:bg-primary/90">
          Add New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
              Due Date (Optional)
            </Label>
            <DatePicker 
              date={dueDate} 
              setDate={setDueDate}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2 cursor-pointer" onClick={() => setShowAssignees(!showAssignees)}>
              <Users className="h-4 w-4 text-primary" />
              Assigned Team Members
            </Label>
            
            {showAssignees && (
              <div className="bg-muted/50 p-3 rounded-md space-y-2">
                {team.members.map((member) => (
                  <div 
                    key={member.id}
                    className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                      selectedMembers.some(m => m.id === member.id) 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => toggleMember(member)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="flex-grow">{member.name}</span>
                    {selectedMembers.some(m => m.id === member.id) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedMembers.map((member) => (
                <Badge key={member.id} variant="outline" className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="text-[10px]">{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{member.name}</span>
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskForm;
