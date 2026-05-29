import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { useSocket } from '../context/SocketContext';

const TaskModal = ({ task, listName, projectMembers, onClose, onUpdateTask, onDeleteTask }) => {
  const socket = useSocket();
  const textareaRef = useRef(null);

  // States
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority);
  const [assignee, setAssignee] = useState(task.assignee?._id || task.assignee || '');
  const [dueDate, setDueDate] = useState('');
  
  // Comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(true);

  // Sync state
   
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setAssignee(task.assignee?._id || task.assignee || '');

    if (task.dueDate) {
      const d = new Date(task.dueDate);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setDueDate(`${year}-${month}-${day}`);
    } else {
      setDueDate('');
    }
  }, [task]);

  // Load comments
  useEffect(() => {
    const fetchComments = async () => {
      setCommentsLoading(true);
      try {
        const data = await api.getComments(task._id);
        setComments(data);
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        setCommentsLoading(false);
      }
    };
    fetchComments();
  }, [task._id]);

  // Socket listener
  useEffect(() => {
    if (!socket) return;
    const handleCommentAdded = (data) => {
      if (data.taskId === task._id) {
        setComments((prev) => {
          if (prev.some((c) => c._id === data.comment._id)) return prev;
          return [...prev, data.comment];
        });
      }
    };
    socket.on('comment:added', handleCommentAdded);
    return () => {
      socket.off('comment:added', handleCommentAdded);
    };
  }, [socket, task._id]);

  // Submit comment
  const handleCommentSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const commentData = await api.createComment(task._id, newComment.trim());
      setComments((prev) => [...prev, commentData]);
      setNewComment('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Auto-expand textarea
  const handleTextareaInput = (e) => {
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight > 150 ? 150 : el.scrollHeight) + 'px';
  };

  // Trigger task edits
  const triggerUpdate = (updates) => {
    onUpdateTask(task._id, {
      title,
      description,
      priority,
      assignee: assignee || null,
      dueDate: dueDate || null,
      ...updates
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2);
  };

  return (
    <div className="absolute inset-0 z-50 w-full h-full flex flex-col bg-background text-on-surface overflow-hidden">
        
        {/* Top bar header */}
        <header className="flex items-center justify-between px-stack-lg border-b border-outline-variant/10 h-16 bg-surface-container-lowest flex-shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose} 
              className="text-secondary font-semibold hover:underline text-xs flex items-center gap-1 cursor-pointer"
            >
              <i className="fa-solid fa-arrow-left text-sm"></i>
              <span>Back to Board</span>
            </button>
            <div className="h-4 w-[1px] bg-outline-variant/30"></div>
            <span className="text-xs text-on-surface-variant">Column: <strong className="text-on-surface">{listName}</strong></span>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface cursor-pointer">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </header>

        {/* Modal content body split columns */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left panel: Task detail configs */}
          <section className="flex-[1.5] p-stack-lg overflow-y-auto custom-scrollbar space-y-8">
            <div>
              <div className="flex items-start justify-between mb-2">
                <input
                  type="text"
                  className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight bg-transparent border border-transparent hover:border-outline-variant focus:border-secondary focus:bg-surface-container-lowest rounded-lg w-full px-2 py-1 outline-none transition-all"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => triggerUpdate({ title })}
                />
                
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-wider">
                    {listName}
                  </span>
                  <button 
                    onClick={() => {
                      if (window.confirm('Delete this task card?')) onDeleteTask(task._id);
                    }} 
                    className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-low rounded-full transition-colors text-error cursor-pointer"
                    title="Delete task card"
                  >
                    <i className="fa-solid fa-trash-can text-base"></i>
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 text-on-surface-variant text-sm mt-3 px-2">
                <div className="flex items-center gap-1.5">
                  <i className="fa-solid fa-calendar-days text-[16px]"></i>
                  <input
                    type="date"
                    className="bg-transparent border-none text-body-md font-body-md text-on-surface outline-none cursor-pointer"
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      triggerUpdate({ dueDate: e.target.value });
                    }}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <i className="fa-solid fa-flag text-[16px] text-error"></i>
                  <select
                    className="bg-transparent border-none text-body-md font-semibold text-error outline-none cursor-pointer"
                    value={priority}
                    onChange={(e) => {
                      setPriority(e.target.value);
                      triggerUpdate({ priority: e.target.value });
                    }}
                  >
                    <option value="LOW" className="text-priority-low font-normal">Low Priority</option>
                    <option value="MEDIUM" className="text-secondary-container font-normal">Medium Priority</option>
                    <option value="HIGH" className="text-error font-semibold">High Priority</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bento Grid Metadata Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
              <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-outline-variant/10">
                <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-3">Assigned Member</p>
                <div className="flex items-center gap-2">
                  {assignee ? (
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-xs">
                        {getInitials(projectMembers?.find(m => m.user?._id === assignee || m.user === assignee)?.user?.name)}
                      </div>
                      <span className="text-xs font-semibold">
                        {projectMembers?.find(m => m.user?._id === assignee || m.user === assignee)?.user?.name || 'Assignee'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-on-surface-variant italic">Unassigned</span>
                  )}
                  <select
                    className="ml-auto bg-surface-container-low border border-outline-variant/30 rounded px-2 py-1 text-xs outline-none cursor-pointer"
                    value={assignee}
                    onChange={(e) => {
                      setAssignee(e.target.value);
                      triggerUpdate({ assignee: e.target.value });
                    }}
                  >
                    <option value="">Select Assignee</option>
                    {projectMembers?.map((m) => (
                      <option key={m.user?._id || m.user} value={m.user?._id || m.user}>
                        {m.user?.name || 'Member'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-outline-variant/10">
                <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-3">Workspace Folder</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                    <i className="fa-solid fa-folder text-base"></i>
                  </div>
                  <div>
                    <p className="font-label-md text-on-surface font-semibold text-xs">Cloud Platform v2</p>
                    <p className="text-[10px] text-outline">Updated 2h ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-surface-container-lowest p-stack-lg rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-outline-variant/10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] uppercase tracking-widest text-outline font-bold">Task Description</p>
              </div>
              <textarea
                className="w-full bg-transparent border border-transparent hover:border-outline-variant/20 focus:border-secondary focus:bg-surface-container-low/20 rounded-lg p-2 text-body-lg text-on-surface leading-relaxed outline-none resize-none min-h-[120px] transition-all"
                placeholder="We need to streamline the onboarding experience..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => triggerUpdate({ description })}
              />
            </div>

            {/* Attachments mock layout */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-4">Attachments (3)</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="group relative aspect-video rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container-low cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-full h-full bg-secondary-container/10 flex items-center justify-center text-secondary font-bold text-xs">onboarding_v1.fig</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <p className="text-white text-[10px] font-bold">onboarding_v1.fig</p>
                  </div>
                </div>
                <div className="group relative aspect-video rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container-low cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-full h-full bg-error-container/10 flex items-center justify-center text-error font-bold text-xs">user_flow.pdf</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <p className="text-white text-[10px] font-bold">user_flow_diagram.pdf</p>
                  </div>
                </div>
                <div className="border-2 border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center text-outline gap-1 hover:bg-surface-container-low transition-colors cursor-pointer min-h-[60px]">
                  <i className="fa-solid fa-cloud-arrow-up text-lg"></i>
                  <span className="text-[10px] font-bold mt-1">Upload New</span>
                </div>
              </div>
            </div>
          </section>

          {/* Right panel: Comments & Activity Log */}
          <section className="w-full md:w-[420px] bg-surface-container-low border-t md:border-t-0 md:border-l border-outline-variant/20 flex flex-col flex-shrink-0 h-[60vh] md:h-auto">
            <div className="p-stack-md border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/80 backdrop-blur-md flex-shrink-0">
              <div className="flex items-center gap-2 text-on-surface">
                <i className="fa-solid fa-comments text-secondary text-lg"></i>
                <h3 className="font-headline-md text-headline-md font-bold">Activity &amp; Comments</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container-highest text-[10px] font-bold text-on-surface-variant uppercase">
                {comments.length} updates
              </span>
            </div>

            {/* Comments scroll feed */}
            <div className="flex-grow overflow-y-auto p-stack-md space-y-6 custom-scrollbar">
              {commentsLoading ? (
                <div className="text-xs text-on-surface-variant text-center py-4">Loading conversation...</div>
              ) : comments.length === 0 ? (
                <div className="text-xs text-on-surface-variant text-center py-4">No activity yet. Send a response below!</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3 fade-in">
                     <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs flex-shrink-0 border border-secondary/20">
                      {getInitials(comment.user?.name)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 text-xs">
                        <span className="font-semibold text-on-surface">{comment.user?.name || 'Member'}</span>
                        <span className="text-[10px] text-outline">
                          {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="bg-surface-container-lowest p-3 rounded-tr-xl rounded-b-xl shadow-sm border border-outline-variant/10 text-body-md text-on-surface leading-relaxed">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input Box */}
            <div className="p-stack-md bg-surface-container-lowest border-t border-outline-variant/20 flex-shrink-0">
              <form onSubmit={handleCommentSubmit} className="bg-surface-container-low rounded-xl p-2 border border-outline-variant/20 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/10 transition-all">
                <textarea 
                  ref={textareaRef}
                  className="w-full bg-transparent border-none focus:ring-0 text-body-md resize-none h-20 placeholder:text-outline font-body-md text-on-surface outline-none" 
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onInput={handleTextareaInput}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCommentSubmit(e);
                    }
                  }}
                />
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-outline-variant/10">
                  <div className="flex items-center gap-1">
                    <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors">
                      <i className="fa-solid fa-paperclip text-[18px]"></i>
                    </button>
                    <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors">
                      <i className="fa-solid fa-face-smile text-[18px]"></i>
                    </button>
                    <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors">
                      <i className="fa-solid fa-at text-[18px]"></i>
                    </button>
                  </div>
                  <button 
                    type="submit" 
                    className="bg-secondary text-white px-5 py-2 rounded-lg font-bold text-label-md flex items-center gap-2 hover:bg-secondary/90 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Send</span>
                    <i className="fa-solid fa-paper-plane text-[16px]"></i>
                  </button>
                </div>
              </form>
            </div>

          </section>
        </div>
    </div>
  );
};

export default TaskModal;
