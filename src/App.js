import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Importamos axios para comunicarnos con el backend
import './App.css';

// La URL base de nuestra API que está corriendo en el puerto 5000
const API_URL = 'http://localhost:5000/api/tasks';

function App() {
  // 'tasks' guardará la lista de tareas, 'setTasks' es la función para actualizarla.
  const [tasks, setTasks] = useState([]);
  // 'newTaskTitle' guardará el texto del input para la nueva tarea.
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // useEffect se ejecuta cuando el componente se carga por primera vez.
  // Es perfecto para cargar los datos iniciales.
  useEffect(() => {
    // Hacemos una petición GET a nuestra API para obtener todas las tareas.
    axios.get(API_URL)
      .then(response => {
        // Si la petición es exitosa, actualizamos el estado con las tareas recibidas.
        setTasks(response.data);
      })
      .catch(error => {
        // Si hay un error, lo mostramos en la consola.
        console.error('Hubo un error al obtener las tareas:', error);
      });
  }, []); // El array vacío asegura que esto se ejecute solo una vez.

  // Esta función se llama cuando se envía el formulario para añadir una tarea.
  const handleAddTask = (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario.
    if (!newTaskTitle.trim()) return; // No añade tareas vacías.

    // Hacemos una petición POST a la API, enviando el título de la nueva tarea.
    axios.post(API_URL, { title: newTaskTitle })
      .then(response => {
        // Si la tarea se crea con éxito, la añadimos a nuestra lista de tareas local.
        setTasks([...tasks, response.data]);
        // Limpiamos el campo de texto.
        setNewTaskTitle('');
      })
      .catch(error => {
        console.error('Hubo un error al crear la tarea:', error);
      });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Lista de Tareas (MERN) 📝</h1>
        <form onSubmit={handleAddTask} className="task-form">
          <input
            type="text"
            className="task-input"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Añadir una nueva tarea..."
          />
          <button type="submit" className="task-button">Añadir</button>
        </form>

        <ul className="task-list">
          {tasks.map(task => (
            <li key={task._id} className="task-item">
              {task.title}
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
