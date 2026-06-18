import React, { useState } from 'react';

const Board = ({ 
  projectData, 
  onAddList, 
  onDeleteList, 
  onAddTask, 
  onMoveTask, 
  onOpenTaskDetails,
  onOpenInviteMember,
  onNavigateBack
}) => {
  const { project, lists, tasks } = projectData;
  const [newListTitle, setNewListTitle] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [activeDragOverList, setActiveDragOverList] = useState(null);

  // New task inline state
  const [newTaskTitles, setNewTaskTitles] = useState({});
  const [activeListAddTask, setActiveListAddTask] = useState(null);

  // Submit list
  const handleAddListSubmit = (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    onAddList(newListTitle.trim());
    setNewListTitle('');
    setIsAddingList(false);
  };

  // Submit task card
  const handleAddTaskSubmit = (e, listId) => {
    e.preventDefault();
    const title = newTaskTitles[listId];
    if (!title || !title.trim()) return;
    onAddTask(listId, { title: title.trim() });
    setNewTaskTitles(prev => ({ ...prev, [listId]: '' }));
    setActiveListAddTask(null);
  };

  // Drag handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      e.target.classList.add('opacity-40');
    }, 0);
  };

  // Drag end
  const handleDragEnd = (e) => {
    e.target.classList.remove('opacity-40');
    setDraggedTaskId(null);
    setActiveDragOverList(null);
  };

  // Drag over
  const handleDragOver = (e, listId) => {
    e.preventDefault();
    if (activeDragOverList !== listId) {
      setActiveDragOverList(listId);
    }
  };

  // Drag leave
  const handleDragLeave = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX >= rect.right || e.clientY < rect.top || e.clientY >= rect.bottom) {
      setActiveDragOverList(null);
    }
  };

  // Drop
  const handleDrop = (e, targetListId) => {
    e.preventDefault();
    setActiveDragOverList(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    // Calculate index based on drop coordinates relative to other cards
    const cardElements = Array.from(e.currentTarget.querySelectorAll('.task-card'));
    let targetIndex = cardElements.length;

    for (let i = 0; i < cardElements.length; i++) {
      const rect = cardElements[i].getBoundingClientRect();
      const cardMidPoint = rect.top + rect.height / 2;
      if (e.clientY < cardMidPoint) {
        targetIndex = i;
        break;
      }
    }

    onMoveTask(taskId, targetListId, targetIndex);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2);
  };

  const getTasksForList = (listId) => {
    return tasks.filter((t) => t.list === listId || (t.list?._id && t.list?._id === listId));
  };

  return (
    <div className="flex-grow flex flex-col min-w-0 bg-surface text-on-surface min-h-0">
      {/* Board Header details */}
      <section className="p-stack-lg flex flex-col md:flex-row md:items-center justify-between border-b border-outline-variant/10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button 
              onClick={onNavigateBack} 
              className="text-secondary hover:underline text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <i className="fa-solid fa-arrow-left text-xs"></i>
              <span>Back to Projects</span>
            </button>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-primary">{project.name}</h2>
          <p className="text-on-surface-variant font-body-md">
            {project.description || 'Timeline: Q3 Core Product Release'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3 overflow-hidden">
            {project.members?.map((m) => (
              <div 
                key={m.user?._id || m.user} 
                className="inline-block h-10 w-10 rounded-full ring-2 ring-surface bg-secondary text-white flex items-center justify-center font-bold text-xs"
                title={`${m.user?.name} (${m.role})`}
              >
                {getInitials(m.user?.name)}
              </div>
            ))}
            <button 
              onClick={onOpenInviteMember}
              className="flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-surface bg-surface-container-high hover:bg-secondary-container/20 text-on-surface-variant font-bold text-xs cursor-pointer"
              title="Add Collaborator"
            >
              <i className="fa-solid fa-user-plus text-sm"></i>
            </button>
          </div>
        </div>
      </section>

      {/* Kanban Board columns lane */}
      <div className="flex-grow overflow-x-auto p-stack-lg pt-4 flex gap-stack-lg items-stretch custom-scrollbar snap-x snap-mandatory min-h-0">
        {lists.map((list) => {
          const listTasks = getTasksForList(list._id);
          const isAddingTask = activeListAddTask === list._id;

          return (
            <div 
              key={list._id} 
              className={`flex flex-col min-w-[300px] w-[85vw] md:w-80 bg-surface-container-low/50 rounded-2xl p-4 border transition-all snap-center max-h-full min-h-0 ${
                activeDragOverList === list._id ? 'border-dashed border-secondary bg-surface-container-high/50' : 'border-transparent'
              }`}
              onDragOver={(e) => handleDragOver(e, list._id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, list._id)}
            >
              <div className="flex items-center justify-between mb-stack-md flex-shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline-md text-headline-md text-on-surface">{list.name}</h3>
                  <span className="bg-surface-container-high px-2 py-0.5 rounded-full text-label-sm font-bold text-on-surface-variant">
                    {listTasks.length}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    if (window.confirm('Delete list: ' + list.name + '?')) onDeleteList(list._id);
                  }}
                  className="hover:bg-surface-container-high p-1 rounded transition-colors text-on-surface-variant cursor-pointer"
                  title="Delete column"
                >
                  <i className="fa-solid fa-trash-can text-sm"></i>
                </button>
              </div>

              {/* Lane Cards List */}
              <div className="flex-1 overflow-y-auto space-y-stack-md pr-1 min-h-[100px] custom-scrollbar">
                {listTasks.map((task) => {
                  const borderPriorityClass = 
                    task.priority === 'HIGH' ? 'border-error' :
                    task.priority === 'LOW' ? 'border-priority-low' : 'border-secondary-container';
                  
                  const priorityTextClass = 
                    task.priority === 'HIGH' ? 'bg-error/10 text-error' :
                    task.priority === 'LOW' ? 'bg-priority-low/10 text-priority-low' : 'bg-secondary-container/10 text-secondary-container';

                  return (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onOpenTaskDetails(task._id)}
                      className={`task-card bg-surface-container-lowest p-stack-md rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border-l-4 ${borderPriorityClass} hover:shadow-lg transition-all cursor-grab active:cursor-grabbing group`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${priorityTextClass}`}>
                          {task.priority || 'MEDIUM'}
                        </span>
                        <i className="fa-solid fa-grip-vertical text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity text-sm"></i>
                      </div>
                      
                      <h4 className="font-headline-md text-[16px] mb-1 text-on-surface font-semibold leading-tight">
                        {task.title}
                      </h4>
                      <p className="text-on-surface-variant text-body-md mb-stack-md line-clamp-2 leading-relaxed">
                        {task.description || 'No description added.'}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-on-surface-variant text-[12px]">
                          <i className="fa-solid fa-clock text-xs"></i>
                          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                        </div>
                        {task.assignee ? (
                          <div 
                            className="w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center text-[9px] font-bold border border-surface-container-high"
                            title={`Assigned to ${task.assignee.name}`}
                          >
                            {getInitials(task.assignee.name)}
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-dashed border-outline-variant flex items-center justify-center text-outline text-[10px]" title="Unassigned">
                            -
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Card input / inline creator */}
                {isAddingTask ? (
                  <form onSubmit={(e) => handleAddTaskSubmit(e, list._id)} className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/30 space-y-2">
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 rounded-lg border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-sm text-on-surface outline-none"
                      placeholder="Card title..."
                      value={newTaskTitles[list._id] || ''}
                      onChange={(e) => setNewTaskTitles(prev => ({ ...prev, [list._id]: e.target.value }))}
                      autoFocus
                      required
                    />
                    <div className="flex gap-2 justify-end">
                      <button 
                        type="button" 
                        onClick={() => setActiveListAddTask(null)}
                        className="px-3 py-1 text-xs bg-surface-container-high rounded text-on-surface hover:bg-outline-variant/30 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-3 py-1 text-xs bg-secondary text-white rounded font-bold cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setActiveListAddTask(list._id)}
                    className="w-full py-2 border-2 border-dashed border-outline-variant/30 rounded-xl text-on-surface-variant font-label-md flex items-center justify-center gap-2 hover:bg-white hover:border-secondary/30 transition-all cursor-pointer"
                  >
                    <i className="fa-solid fa-plus text-xs"></i>
                    <span>Add Task</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add column lane trigger button */}
        {isAddingList ? (
          <form onSubmit={handleAddListSubmit} className="flex flex-col min-w-[300px] w-80 bg-surface-container-low/50 rounded-2xl p-4 border border-outline-variant/30 space-y-3 self-start">
            <input
              type="text"
              className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all text-body-md text-on-surface outline-none"
              placeholder="Column title..."
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              autoFocus
              required
            />
            <div className="flex gap-2 justify-end">
              <button 
                type="button" 
                onClick={() => setIsAddingList(false)}
                className="px-4 py-2 bg-surface-container-high rounded-xl text-on-surface hover:bg-outline-variant/30 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-secondary text-white rounded-xl font-bold cursor-pointer"
              >
                Create
              </button>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setIsAddingList(true)}
            className="flex flex-col min-w-[300px] w-80 bg-surface-container-low/20 border-2 border-dashed border-outline-variant/30 hover:border-secondary hover:bg-secondary/5 rounded-2xl items-center justify-center p-6 transition-all cursor-pointer min-h-[140px] self-start"
          >
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-2">
              <i className="fa-solid fa-plus text-sm"></i>
            </div>
            <p className="font-semibold text-on-surface-variant">Add Column</p>
          </button>
        )}
      </div>
    </div>
  );
};

export default Board;
