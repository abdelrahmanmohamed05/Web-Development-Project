import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, CheckCircle2, Layers3, Plus, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "../layouts/AppLayout";
import api from "../api/client";

const blankTask = { title: "", description: "", status: "todo", priority: "medium", list_id: "" };

function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "", priority: "" });
  const [formData, setFormData] = useState(blankTask);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [error, setError] = useState("");
  const [dragOverStatus, setDragOverStatus] = useState("");
  const [viewMode, setViewMode] = useState("kanban");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [loading, setLoading] = useState(true);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    return params.toString();
  }, [filters]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === "done").length;
    const inProgress = tasks.filter((task) => task.status === "in_progress").length;
    const highPriority = tasks.filter((task) => task.priority === "high").length;
    return { total, completed, inProgress, highPriority };
  }, [tasks]);

  const statusColumns = useMemo(() => [{ key: "todo", title: "To Do" }, { key: "in_progress", title: "In Progress" }, { key: "done", title: "Done" }], []);
  const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
  const priorityDistribution = useMemo(() => {
    const low = tasks.filter((task) => task.priority === "low").length;
    const medium = tasks.filter((task) => task.priority === "medium").length;
    const high = tasks.filter((task) => task.priority === "high").length;
    const total = low + medium + high || 1;
    return { low: Math.round((low / total) * 100), medium: Math.round((medium / total) * 100), high: Math.round((high / total) * 100) };
  }, [tasks]);

  const upcomingTasks = useMemo(
    () => tasks.filter((task) => task.due_date).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()).slice(0, 5),
    [tasks]
  );

  const fetchTasks = async () => {
    const response = await api.get(`/tasks${queryString ? `?${queryString}` : ""}`);
    setTasks(response.data);
  };

  const fetchLists = async () => {
    const response = await api.get("/lists");
    setLists(response.data);
  };

  useEffect(() => {
    Promise.all([fetchTasks(), fetchLists()])
      .catch(() => setError("Unable to load tasks right now."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTasks().catch(() => setError("Filter request failed."));
  }, [queryString]);

  const submitTask = async (event) => {
    event.preventDefault();
    setError("");
    try {
      if (activeTaskId) await api.put(`/tasks/${activeTaskId}`, { ...formData, list_id: formData.list_id || null });
      else await api.post("/tasks", { ...formData, list_id: formData.list_id || null });
      setFormData(blankTask);
      setActiveTaskId(null);
      setShowTaskModal(false);
      toast.success(activeTaskId ? "Task updated" : "Task created");
      await fetchTasks();
    } catch {
      setError("Task save failed.");
    }
  };

  const editTask = (task) => {
    setActiveTaskId(task.id);
    setFormData({ title: task.title, description: task.description || "", status: task.status, priority: task.priority, list_id: task.list_id || "" });
    setShowTaskModal(true);
  };

  const removeTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      toast.success("Task deleted");
      await fetchTasks();
    } catch {
      setError("Task delete failed.");
    }
  };

  const addList = async () => {
    const name = newListName.trim();
    if (!name) return;
    try {
      await api.post("/lists", { name });
      setNewListName("");
      toast.success("List created");
      await fetchLists();
    } catch {
      setError("Could not create list.");
    }
  };

  const onDragStart = (event, task) => event.dataTransfer.setData("taskId", String(task.id));

  const onDropToColumn = async (event, status) => {
    event.preventDefault();
    setDragOverStatus("");
    const taskId = event.dataTransfer.getData("taskId");
    const task = tasks.find((item) => String(item.id) === taskId);
    if (!task || task.status === status) return;
    try {
      await api.put(`/tasks/${task.id}`, { status });
      toast.success("Task moved");
      await fetchTasks();
    } catch {
      setError("Could not move task.");
    }
  };

  const dueTone = (dueDate) => {
    if (!dueDate) return "neutral";
    const diffDays = (new Date(dueDate).getTime() - Date.now()) / 86400000;
    if (diffDays < 0) return "danger";
    if (diffDays < 2) return "warning";
    return "safe";
  };

  const priorityClass = (priority) => (priority === "high" ? "priority-high" : priority === "medium" ? "priority-medium" : priority === "low" ? "priority-low" : "priority-urgent");
  const progressByTask = (task) => (task.status === "done" ? 100 : task.status === "in_progress" ? 65 : 25);

  return (
    <AppLayout title="Task Dashboard">
      {error && <div className="alert alert-danger py-2">{error}</div>}

      {loading ? (
        <div className="row g-3 mb-4">
          <div className="col-12"><div className="skeleton-panel" /></div>
          <div className="col-md-6"><div className="skeleton-panel" /></div>
          <div className="col-md-6"><div className="skeleton-panel" /></div>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-6 col-xl-3"><div className="metric-card"><p>Total Tasks</p><h3>{stats.total}</h3></div></div>
            <div className="col-md-6 col-xl-3"><div className="metric-card"><p>Completed</p><h3>{stats.completed}</h3></div></div>
            <div className="col-md-6 col-xl-3"><div className="metric-card"><p>In Progress</p><h3>{stats.inProgress}</h3></div></div>
            <div className="col-md-6 col-xl-3"><div className="metric-card"><p>High Priority</p><h3>{stats.highPriority}</h3></div></div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-lg-8">
              <div className="glass-panel p-3 h-100">
                <div className="d-flex justify-content-between align-items-center mb-3"><h5 className="mb-0">Progress Overview</h5><span className="badge rounded-pill text-bg-info">{completionRate}% complete</span></div>
                <div className="progress advanced-progress mb-3"><div className="progress-bar" style={{ width: `${completionRate}%` }} /></div>
                <div className="row g-2">
                  <div className="col-4"><div className="mini-stat"><p>To Do</p><strong>{stats.total - stats.inProgress - stats.completed}</strong></div></div>
                  <div className="col-4"><div className="mini-stat"><p>Doing</p><strong>{stats.inProgress}</strong></div></div>
                  <div className="col-4"><div className="mini-stat"><p>Done</p><strong>{stats.completed}</strong></div></div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="glass-panel p-3 h-100">
                <h5 className="mb-3"><CalendarDays size={16} className="me-2" />Upcoming Deadlines</h5>
                {upcomingTasks.length ? upcomingTasks.map((task) => <div className="calendar-row" key={`cal-${task.id}`}><span>{new Date(task.due_date).toLocaleDateString()}</span><p>{task.title}</p></div>) : <p className="text-secondary mb-0">No due dates yet.</p>}
              </div>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-lg-6">
              <div className="glass-panel p-3 h-100">
                <h5 className="mb-3">Priority Distribution</h5>
                <div className="priority-row"><span>Low</span><div className="priority-bar"><div className="priority-fill low" style={{ width: `${priorityDistribution.low}%` }} /></div><strong>{priorityDistribution.low}%</strong></div>
                <div className="priority-row"><span>Medium</span><div className="priority-bar"><div className="priority-fill medium" style={{ width: `${priorityDistribution.medium}%` }} /></div><strong>{priorityDistribution.medium}%</strong></div>
                <div className="priority-row mb-0"><span>High</span><div className="priority-bar"><div className="priority-fill high" style={{ width: `${priorityDistribution.high}%` }} /></div><strong>{priorityDistribution.high}%</strong></div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="glass-panel p-3 h-100 d-flex flex-column justify-content-center">
                <div className="progress-ring-wrap">
                  <div className="progress-ring"><span>{completionRate}%</span></div>
                  <div><h6 className="mb-1">Completion Ring</h6><p className="text-secondary mb-0">Live completion score of your board.</p></div>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div className="d-flex gap-2">
              <button className={`view-switch ${viewMode === "kanban" ? "active" : ""}`} type="button" onClick={() => setViewMode("kanban")}><Layers3 size={15} /> Kanban</button>
              <button className={`view-switch ${viewMode === "list" ? "active" : ""}`} type="button" onClick={() => setViewMode("list")}><CheckCircle2 size={15} /> List</button>
            </div>
            <button className="btn btn-primary rounded-pill px-3" type="button" onClick={() => { setActiveTaskId(null); setFormData(blankTask); setShowTaskModal(true); }}><Plus size={15} className="me-1" /> New Task</button>
          </div>

          <div className="d-flex gap-2 mb-3 flex-wrap glass-strip">
            <input className="form-control filter-input" placeholder="Search tasks..." value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} />
            <select className="form-select filter-select" value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}><option value="">All status</option><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="done">Done</option></select>
            <select className="form-select filter-select" value={filters.priority} onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}><option value="">All priority</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
            <button className="btn btn-outline-primary rounded-pill" type="button" onClick={addList}>New list</button>
            <input className="form-control new-list-input" placeholder="List name..." value={newListName} onChange={(e) => setNewListName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addList(); } }} />
          </div>

          {!tasks.length ? (
            <div className="empty-state glass-panel"><Sparkles size={24} /><h5>No tasks yet</h5><p>Create your first task to start your premium workflow.</p><button className="btn btn-primary rounded-pill" type="button" onClick={() => setShowTaskModal(true)}>Create First Task</button></div>
          ) : (
            <AnimatePresence mode="wait">
              {viewMode === "list" ? (
                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="row g-3">
                    {tasks.map((task) => (
                      <div className="col-md-6 col-lg-4" key={task.id}>
                        <div className={`card h-100 shadow-sm task-card ${priorityClass(task.priority)}`}>
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2"><h5 className="card-title mb-0">{task.title}</h5><span className={`priority-badge ${priorityClass(task.priority)}`}>{task.priority}</span></div>
                            <p className="card-text">{task.description || "No description"}</p>
                            <div className="task-progress mb-2"><div style={{ width: `${progressByTask(task)}%` }} /></div>
                            <div className="avatar-stack mb-2"><span>A</span><span>B</span><span>C</span></div>
                            <p className={`mb-1 due-${dueTone(task.due_date)}`}>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No date"}</p>
                            <p className="mb-1"><strong>Status:</strong> {task.status}</p>
                            <p className="mb-3"><strong>List:</strong> {task.list_name || "Uncategorized"}</p>
                            <div className="d-flex gap-2"><button className="btn btn-sm btn-outline-primary rounded-pill" type="button" onClick={() => editTask(task)}>Edit</button><button className="btn btn-sm btn-outline-danger rounded-pill" type="button" onClick={() => removeTask(task.id)}>Delete</button></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="kanban" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="kanban-board mt-2">
                    <div className="row g-3">
                      {statusColumns.map((column) => (
                        <div className="col-lg-4" key={column.key}>
                          <div className={`kanban-column ${dragOverStatus === column.key ? "drag-over" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragOverStatus(column.key); }} onDragLeave={() => setDragOverStatus("")} onDrop={(event) => onDropToColumn(event, column.key)}>
                            <h6 className="kanban-title">{column.title}</h6>
                            {tasks.filter((task) => task.status === column.key).map((task) => (
                              <div key={`kanban-${task.id}`} className={`kanban-card ${priorityClass(task.priority)}`} draggable onDragStart={(event) => onDragStart(event, task)}>
                                <p className="mb-1 fw-semibold">{task.title}</p>
                                <small className="text-secondary d-block mb-2">{task.list_name || "Uncategorized"}</small>
                                <span className={`priority-badge ${priorityClass(task.priority)}`}>{task.priority}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </>
      )}

      <AnimatePresence>
        {showTaskModal && (
          <motion.div className="task-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="task-modal-panel" initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 280, opacity: 0 }}>
              <h5 className="mb-3">{activeTaskId ? "Edit task" : "Create task"}</h5>
              <form className="row g-2" onSubmit={submitTask}>
                <div className="col-12 floating-field"><input className="form-control" placeholder=" " value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /><label>Title</label></div>
                <div className="col-12 floating-field"><textarea className="form-control" placeholder=" " value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /><label>Description</label></div>
                <div className="col-6"><select className="form-select" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="done">Done</option></select></div>
                <div className="col-6"><select className="form-select" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
                <div className="col-12"><select className="form-select" value={formData.list_id} onChange={(e) => setFormData({ ...formData, list_id: e.target.value })}><option value="">No List</option>{lists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}</select></div>
                <div className="col-12 d-flex gap-2 mt-3"><button className="btn btn-primary rounded-pill flex-grow-1" type="submit">{activeTaskId ? "Save Changes" : "Create Task"}</button><button className="btn btn-outline-light rounded-pill" type="button" onClick={() => setShowTaskModal(false)}>Cancel</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

export default DashboardPage;
