import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// 🌐 Cambia esta URL por la IP pública de tu backend (EC2)
const API_URL = 'http://3.87.154.186:5000/api/productos';

function App() {
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    categoria: '',
    cantidad: '',
    precio: ''
  });

  // ✅ Cargar productos al inicio
  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    try {
      const res = await axios.get(API_URL);
      setProductos(res.data);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  };

  // ✅ Manejar cambios en el formulario
  const handleChange = (e) => {
    setNuevoProducto({
      ...nuevoProducto,
      [e.target.name]: e.target.value
    });
  };

  // ✅ Agregar un nuevo producto
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(API_URL, {
        nombre: nuevoProducto.nombre,
        categoria: nuevoProducto.categoria,
        cantidad: parseInt(nuevoProducto.cantidad),
        precio: parseFloat(nuevoProducto.precio)
      });
      setProductos([...productos, res.data]);
      setNuevoProducto({ nombre: '', categoria: '', cantidad: '', precio: '' });
    } catch (error) {
      console.error('Error al agregar producto:', error);
    }
  };

  // ✅ Eliminar producto
  const eliminarProducto = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setProductos(productos.filter((prod) => prod._id !== id));
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  return (
    <div className="app-container">
      <h1>🧾 Control de Inventario</h1>

      <form className="formulario" onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre del producto"
          value={nuevoProducto.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="categoria"
          placeholder="Categoría"
          value={nuevoProducto.categoria}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="cantidad"
          placeholder="Cantidad"
          value={nuevoProducto.cantidad}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          step="0.01"
          name="precio"
          placeholder="Precio (S/)"
          value={nuevoProducto.precio}
          onChange={handleChange}
          required
        />
        <button type="submit">Agregar producto</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Cantidad</th>
            <th>Precio (S/)</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((prod) => (
            <tr key={prod._id}>
              <td>{prod.nombre}</td>
              <td>{prod.categoria}</td>
              <td>{prod.cantidad}</td>
              <td>{prod.precio}</td>
              <td>
                <button onClick={() => eliminarProducto(prod._id)}>🗑️ Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
