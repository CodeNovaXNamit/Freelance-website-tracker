const fs = require('fs');

const content = `
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTasks, saveTask, deleteTask, getProspects } from '../lib/api';
import { Task, Prospect } from '../types';
import { Calendar, CheckCircle, Clock, SkipForward, Edit2, Trash2, Plus, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { format, startOfToday, startOfTomorrow, endOfWeek, isBefore, addDays, startOfDay, endOfDay } from 'date-fns';
import { Link } from 'react-router-dom';

export function FollowUps() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [prospects, setProspects] = useState<Record<string, Prospect>>({});
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
  const [showNextTaskModal, setShowNextTaskModal] = useState<Task | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksData, prospectsData] = await Promise.all([
        getTasks(user!.uid),
        getProspects(user!.uid)
      ]);
      
      const pMap: Record<string, Prospect> = {};
      prospectsData.forEach(p => { pMap[p.id] = p; });
      setProspects(pMap);
      
      setTasks(tasksData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const activeTasks = useMemo(() => {
    return tasks.filter(t => t.status === 'Todo' || t.status === 'In Progress');
  }, [tasks]);

  const groupedTasks = useMemo(() => {
    const today = startOfToday().getTime();
    const tomorrow = startOfTomorrow().getTime();
    const endOfWeekTime = endOfWeek(startOfToday()).getTime();

    const groups = {
      OVERDUE: [] as Task[],
      TODAY: [] as Task[],
      TOMORROW: [] as Task[],
      THIS_WEEK: [] as Task[],
      UPCOMING: [] as Task[]
    };

    activeTasks.forEach(task => {
      const due = task.dueDate;
      if (due < today) {
        groups.OVERDUE.push(task);
      } else if (due >= today && due < tomorrow) {
        groups.TODAY.push(task);
      } else if (due >= tomorrow && due < tomorrow + 86400000) {
        groups.TOMORROW.push(task);
      } else if (due >= tomorrow + 86400000 && due <= endOfWeekTime) {
        groups.THIS_WEEK.push(task);
      } else {
        groups.UPCOMING.push(task);
      }
    });

    // Sort each group by due date
    Object.values(groups).forEach(arr => arr.sort((a, b) => a.dueDate - b.dueDate));

    return groups;
  }, [activeTasks]);

  const handleStatusChange = async (task: Task, newStatus: Task['status']) => {
    try {
      const updated = { 
        ...task, 
        status: newStatus, 
        completedAt: newStatus === 'Done' || newStatus === 'Skipped' ? Date.now() : undefined 
      };
      await saveTask(user!.uid, updated);
      
      // Update local state immediately
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...updated } : t));

      if (newStatus === 'Done') {
        setShowNextTaskModal(updated);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update task status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(user!.uid, id);
        setTasks(prev => prev.filter(t => t.id !== id));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTask || !editingTask.title) return;
    try {
      const saved = await saveTask(user!.uid, editingTask);
      setTasks(prev => {
        const exists = prev.find(t => t.id === saved.id);
        if (exists) return prev.map(t => t.id === saved.id ? saved : t);
        return [saved, ...prev];
      });
      setEditingTask(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateNextFollowUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showNextTaskModal) return;
    
    const formData = new FormData(e.currentTarget);
    const days = parseInt(formData.get('days') as string, 10) || 1;
    const notes = formData.get('notes') as string;
    
    try {
      const newTask: Partial<Task> = {
        title: \`Follow up (completed previous: \${showNextTaskModal.title})\`,
        prospectId: showNextTaskModal.prospectId,
        dueDate: addDays(startOfToday(), days).getTime(),
        priority: showNextTaskModal.priority,
        status: 'Todo',
        isFollowUp: true,
        followUpNumber: (showNextTaskModal.followUpNumber || 1) + 1,
        notes: notes
      };
      
      const saved = await saveTask(user!.uid, newTask);
      setTasks(prev => [saved, ...prev]);
      setShowNextTaskModal(null);
    } catch (err) {
      console.error(err);
      alert('Error creating next follow-up');
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#141414]" />
      </div>
    );
  }

  const renderTaskGroup = (title: string, tasks: Task[], colorClass: string) => {
    if (tasks.length === 0) return null;
    return (
      <div className="mb-8">
        <h2 className={\`text-[10px] font-bold uppercase mb-4 \${colorClass}\`}>
          {title} ({tasks.length})
        </h2>
        <div className="space-y-2">
          {tasks.map(task => {
            const prospect = task.prospectId ? prospects[task.prospectId] : null;
            return (
              <div key={task.id} className="border border-[#141414] bg-transparent p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-[#141414]/5 transition-colors">
                <div className="mb-4 sm:mb-0">
                  <div className="flex items-center space-x-2">
                    <span className={\`text-[9px] px-1.5 py-0.5 border font-bold uppercase \${
                      task.priority === 'High' ? 'border-red-600 text-red-600' : 
                      task.priority === 'Medium' ? 'border-orange-500 text-orange-600' : 
                      'border-[#141414]/50 text-[#141414]/70'
                    }\`}>
                      {task.priority}
                    </span>
                    <h3 className="font-bold text-sm uppercase text-[#141414]">{task.title}</h3>
                  </div>
                  {prospect && (
                    <div className="mt-1 flex items-center text-[10px] font-mono text-[#141414]/70">
                      <Link to={\`/prospects/\${prospect.id}\`} className="hover:underline font-bold text-[#141414] mr-2">
                        {prospect.companyName}
                      </Link>
                      {task.method && <span className="uppercase opacity-70">via {task.method}</span>}
                    </div>
                  )}
                  {task.notes && (
                    <p className="mt-2 text-[10px] font-mono text-[#141414]/60 bg-[#141414]/5 p-2 italic">
                      "{task.notes}"
                    </p>
                  )}
                  <div className="mt-2 text-[9px] font-mono uppercase text-[#141414]/50 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Due: {format(task.dueDate, 'MMM d, yyyy')}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleStatusChange(task, 'Done')} className="p-2 border border-[#141414] text-[#141414] hover:bg-green-500 hover:text-white hover:border-green-500 transition-colors tooltip" title="Mark Complete">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleStatusChange(task, 'Skipped')} className="p-2 border border-[#141414] text-[#141414] hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors" title="Skip">
                    <SkipForward className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingTask(task)} className="p-2 border border-[#141414] text-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(task.id)} className="p-2 border border-red-900/30 text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 h-full flex flex-col relative">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-[#141414]">Follow-ups & Tasks</h1>
          <p className="mt-1 text-[10px] uppercase font-bold opacity-50 tracking-widest text-[#141414]">
            {activeTasks.length} ACTIVE TASKS REQUIRED.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0">
          <button
            onClick={() => setEditingTask({
              title: '',
              dueDate: startOfToday().getTime(),
              priority: 'Medium',
              status: 'Todo',
              isFollowUp: false
            })}
            className="border border-[#141414] bg-[#141414] px-4 py-2 text-[10px] font-bold uppercase text-[#E4E3E0] hover:bg-transparent hover:text-[#141414] inline-flex items-center"
          >
            <Plus className="-ml-0.5 mr-1.5 h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4">
        {groupedTasks.OVERDUE.length === 0 && activeTasks.length === 0 && (
          <div className="text-center py-20 text-[#141414]/50 font-bold uppercase text-[10px]">
            No pending tasks. You're all caught up!
          </div>
        )}

        {renderTaskGroup('OVERDUE', groupedTasks.OVERDUE, 'text-red-600 bg-red-100 inline-block px-2 py-1')}
        {renderTaskGroup('TODAY', groupedTasks.TODAY, 'text-[#141414] bg-green-100 inline-block px-2 py-1')}
        {renderTaskGroup('TOMORROW', groupedTasks.TOMORROW, 'text-[#141414] bg-blue-100 inline-block px-2 py-1')}
        {renderTaskGroup('THIS WEEK', groupedTasks.THIS_WEEK, 'text-[#141414] bg-[#141414]/10 inline-block px-2 py-1')}
        {renderTaskGroup('UPCOMING', groupedTasks.UPCOMING, 'text-[#141414] bg-[#141414]/5 inline-block px-2 py-1')}
      </div>

      {/* Editor Modal */}
      {editingTask && (
        <div className="absolute inset-0 bg-[#E4E3E0]/90 flex items-center justify-center z-50 p-4">
          <div className="bg-[#E4E3E0] border border-[#141414] w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-lg font-bold uppercase mb-6 text-[#141414]">
              {editingTask.id ? 'Edit Task' : 'New Task'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Title *</label>
                <input 
                  type="text" 
                  value={editingTask.title || ''} 
                  onChange={e => setEditingTask({...editingTask, title: e.target.value})}
                  className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none"
                  placeholder="E.g., Send follow-up email"
                />
              </div>
              
              <div>
                <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Prospect (Optional)</label>
                <select 
                  value={editingTask.prospectId || ''} 
                  onChange={e => setEditingTask({...editingTask, prospectId: e.target.value})}
                  className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none"
                >
                  <option value="">-- No Prospect Attached --</option>
                  {Object.values(prospects).sort((a,b) => a.companyName.localeCompare(b.companyName)).map(p => (
                    <option key={p.id} value={p.id}>{p.companyName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Due Date</label>
                  <input 
                    type="date" 
                    value={format(editingTask.dueDate || Date.now(), 'yyyy-MM-dd')} 
                    onChange={e => {
                      const d = new Date(e.target.value);
                      // Adjust for local timezone to keep the selected day
                      const userTimezoneOffset = d.getTimezoneOffset() * 60000;
                      setEditingTask({...editingTask, dueDate: d.getTime() + userTimezoneOffset});
                    }}
                    className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Priority</label>
                  <select 
                    value={editingTask.priority || 'Medium'} 
                    onChange={e => setEditingTask({...editingTask, priority: e.target.value as any})}
                    className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Notes</label>
                <textarea 
                  value={editingTask.notes || ''} 
                  onChange={e => setEditingTask({...editingTask, notes: e.target.value})}
                  className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none min-h-[60px]"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 text-[10px] font-bold uppercase text-[#141414]/70 hover:text-[#141414]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEdit}
                  disabled={!editingTask.title}
                  className="border border-[#141414] bg-[#141414] px-6 py-2 text-[10px] font-bold uppercase text-[#E4E3E0] hover:bg-transparent hover:text-[#141414] disabled:opacity-50"
                >
                  Save Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Next Follow Up Modal */}
      {showNextTaskModal && (
        <div className="absolute inset-0 bg-[#141414]/80 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateNextFollowUp} className="bg-[#E4E3E0] border border-[#141414] w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center text-green-700 mb-4">
              <CheckCircle className="w-5 h-5 mr-2" />
              <h2 className="text-[12px] font-bold uppercase">Task Completed</h2>
            </div>
            <p className="text-[10px] font-mono mb-6 text-[#141414]/70">
              Would you like to schedule the next follow-up for this prospect?
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">When?</label>
                <select name="days" className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none">
                  <option value="1">Tomorrow</option>
                  <option value="2">In 2 Days</option>
                  <option value="3">In 3 Days</option>
                  <option value="7">In 1 Week</option>
                  <option value="14">In 2 Weeks</option>
                  <option value="30">In 1 Month</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[9px] font-bold uppercase text-[#141414] mb-1">Brief Note</label>
                <input name="notes" type="text" className="w-full border border-[#141414] bg-transparent px-3 py-2 text-[10px] font-mono focus:outline-none" placeholder="What's the next step?" />
              </div>
            </div>

            <div className="mt-6 flex flex-col space-y-2">
              <button type="submit" className="w-full border border-[#141414] bg-[#141414] px-4 py-2 text-[10px] font-bold uppercase text-[#E4E3E0] hover:bg-transparent hover:text-[#141414]">
                Schedule Next Follow-up
              </button>
              <button type="button" onClick={() => setShowNextTaskModal(null)} className="w-full px-4 py-2 text-[10px] font-bold uppercase text-[#141414]/60 hover:text-[#141414]">
                No, I'm done
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
`;
fs.writeFileSync('src/pages/FollowUps.tsx', content);
