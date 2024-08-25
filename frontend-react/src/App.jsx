import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Modal, Button } from 'react-bootstrap'; // Importing Modal and Button from Bootstrap

function App() {
  const { register, handleSubmit, setValue, reset } = useForm();
  const [curTodo, setCurTodo] = useState([]);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null); // To track the todo being edited
  const [showModal, setShowModal] = useState(false); // To control modal visibility

  // Helper function to generate a date-based ID
  const generateId = () => {
    return new Date().toISOString(); // ISO string representation of the date
  };

  // Getting all todos on mount
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/all-todos');
        setCurTodo(response.data);
      } catch (error) {
        setError('Error loading todos: ' + error.message);
      }
    };

    fetchTodos();
  }, []);

  // Adding a new todo
  const onSubmit = async ({ todo }) => {
    if (editId) {
      // Update existing todo
      try {
        const updatedTodo = { text: todo, completed: false };
        await axios.put(`http://localhost:3001/api/edit-todo/${editId}`, updatedTodo);
        setCurTodo(curTodo.map(t => (t.id === editId ? { ...t, text: todo } : t)));
        reset();
        setEditId(null);
        setShowModal(false); // Close modal after updating
      } catch (error) {
        console.error('Error updating todo:', error);
        setError('Error updating todo: ' + error.message);
      }
    } else {
      // Add new todo
      try {
        const newTodo = { id: generateId(), text: todo, completed: false };
        setCurTodo([...curTodo, newTodo]);

        await axios.post('http://localhost:3001/api/new-todos', {
          id: newTodo.id, // Send the date-based ID to the backend
          data: newTodo.text,
        });

        reset();
      } catch (error) {
        console.error('Error sending data:', error);
        setError('Error adding todo: ' + error.message);
      }
    }
  };

  // Deleting a todo
  const removeTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/all-todos/${id}`);
      setCurTodo(curTodo.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  // Toggle completion status of a todo
  const toggleCompletion = async (id, completed) => {
    try {
      const updatedCompletedStatus = !completed;
      await axios.put(`http://localhost:3001/api/edit-todo/${id}`, { completed: updatedCompletedStatus });
      setCurTodo(curTodo.map(todo => (todo.id === id ? { ...todo, completed: updatedCompletedStatus } : todo)));
    } catch (error) {
      console.error('Error toggling completion status:', error);
      setError('Error toggling completion status: ' + error.message);
    }
  };

  // Open modal for editing a todo
  const editTodo = (id, text) => {
    setEditId(id);
    setValue('todo', text); // Set the current todo text in the form
    setShowModal(true); // Show the modal
  };

  // Close modal
  const handleClose = () => {
    setShowModal(false);
    reset(); // Reset form when modal is closed
  };

  return (
    <div className="d-flex align-items-center flex-column mb-3 mt-5">
      <h1 className="p-2">Todo List API Demo</h1>

      <form className="form-example mt-3 mb-5 d-flex align-items-center justify-content-start" onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register('todo')}
          type="text"
          placeholder="Enter todo..."
          required
        />
        <input className='btn btn-primary no-border' type="submit" value="Add" />
      </form>

      {error && <p className="text-danger">{error}</p>}

      <div className="d-flex justify-content-center">
        <table className="table">
          <thead>
            <tr>
              <th className="text-end" scope="col">#</th>
              <th scope="col">Task</th>
              <th scope="col">Status</th>
              <th className="text-center" scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {curTodo.map((todo, index) => (
              <tr scope="row" key={index}>
                <td className="text-end">{index + 1}.</td>
                <td className="wrap-text">{todo.text}</td>
                <td>
                  <button
                    className={`btn ${todo.completed ? 'btn-success' : 'btn-warning'} wrap-text`}
                    onClick={() => toggleCompletion(todo.id, todo.completed)}
                  >
                    {todo.completed ? 'Completed' : 'Not Completed'}
                  </button>
                </td>
                <td className="text-start">
                  <button className="btn btn-outline-primary" onClick={() => editTodo(todo.id, todo.text)}>Edit</button>&nbsp;
                  <button className="btn btn-outline-danger" onClick={() => removeTodo(todo.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for editing todos */}
      <Modal  show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Todo</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex align-items-center justify-content-start">
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              {...register('todo')}
              type="text"
              placeholder="Edit todo..."
              required
            />
            <input type="submit" value="Update" className="mt-2 btn btn-primary no-border" />
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;

