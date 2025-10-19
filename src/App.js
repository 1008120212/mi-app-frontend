import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://3.87.154.186:5000/api/productos';

function App() {
  const [productos, setProductos] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '', categoria: 'Bebidas', proveedor: '', cantidad: '', coste: '', precio: ''
  });
  const [productoInfo, setProductoInfo] = useState(null);
  const [verInhabilitados, setVerInhabilitados] = useState(false);

  const categorias = ['Bebidas','Alimentos','Conservas','Snacks','Lácteos','Aseo','Otros'];

  useEffect(() => { obtenerProductos(); }, []);

  const obtenerProductos = async () => {
    try {
      const res = await axios.get(API_URL);
      setProductos(res.data);
    } catch (error) { console.error(error); }
  };

  const agregarProducto = async e => {
    e.preventDefault();
    try {
      await axios.post(API_URL, {...nuevoProducto, cantidad: parseInt(nuevoProducto.cantidad||0), coste: parseFloat(nuevoProducto.coste||0), precio: parseFloat(nuevoProducto.precio||0)});
      setNuevoProducto({ nombre: '', categoria: 'Bebidas', proveedor: '', cantidad: '', coste: '', precio: '' });
      filtrarPorCategoria(categoriaFiltro);
    } catch (error) { console.error(error); }
  };

  const filtrarPorCategoria = async categoria => {
    if (categoria === '') { obtenerProductos(); setVerInhabilitados(false); return; }
    try {
      const res = await axios.get(`${API_URL}/categoria/${categoria}`);
      setProductos(res.data);
      setVerInhabilitados(false);
    } catch (error) { console.error(error); }
  };

  const actualizarStock = async (id, cantidad) => {
    if (!cantidad) return;
    try {
      await axios.put(`${API_URL}/stock/${id}`, { cantidad: parseInt(cantidad) });
      filtrarPorCategoria(categoriaFiltro);
    } catch (error) { console.error(error); }
  };

  const cambiarEstado = async (id, habilitado) => {
    try {
      await axios.put(`${API_URL}/estado/${id}`, { habilitado });
      verInhabilitados ? filtrarInhabilitados() : filtrarPorCategoria(categoriaFiltro);
    } catch (error) { console.error(error); }
  };

  const guardarCambiosProducto = async () => {
    if (!productoInfo) return;
    try {
      await axios.put(`${API_URL}/editar/${productoInfo._id}`, productoInfo);
      setProductoInfo(null);
      verInhabilitados ? filtrarInhabilitados() : filtrarPorCategoria(categoriaFiltro);
    } catch (error) { console.error(error); }
  };

  const filtrarInhabilitados = async () => {
    try {
      const res = await axios.get(API_URL);
      setProductos(res.data.filter(p => !p.habilitado));
      setVerInhabilitados(true);
    } catch (error) { console.error(error); }
  };

  const volverPanelPrincipal = () => {
    setVerInhabilitados(false);
    filtrarPorCategoria(categoriaFiltro);
  };

  return (
    <div className="app-container">
      <h1>📦 Sistema de Control de Inventario</h1>

      {/* Botón productos inhabilitados */}
      <div style={{margin: '10px'}}>
        {!verInhabilitados
          ? <button onClick={filtrarInhabilitados}>Productos Inhabilitados</button>
          : <button onClick={volverPanelPrincipal}>Volver al Inventario</button>
        }
      </div>

      {/* Formulario agregar producto */}
      <form onSubmit={agregarProducto} className="formulario">
        <input type="text" placeholder="Nombre del producto" value={nuevoProducto.nombre}
          onChange={e=>setNuevoProducto({...nuevoProducto, nombre:e.target.value})} required />
        <select value={nuevoProducto.categoria} onChange={e=>setNuevoProducto({...nuevoProducto, categoria:e.target.value})}>
          {categorias.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <input type="text" placeholder="Proveedor" value={nuevoProducto.proveedor}
          onChange={e=>setNuevoProducto({...nuevoProducto, proveedor:e.target.value})} />
        <input type="number" placeholder="Cantidad" value={nuevoProducto.cantidad} 
          onChange={e=>setNuevoProducto({...nuevoProducto, cantidad:e.target.value})} />
        <input type="number" placeholder="Costo" value={nuevoProducto.coste} 
          onChange={e=>setNuevoProducto({...nuevoProducto, coste:e.target.value})} />
        <input type="number" placeholder="Precio" value={nuevoProducto.precio} 
          onChange={e=>setNuevoProducto({...nuevoProducto, precio:e.target.value})} />
        <button type="submit">➕ Agregar Producto</button>
      </form>

      {/* Filtro por categoría */}
      <div className="filtro">
        <label>Filtrar por categoría: </label>
        <select value={categoriaFiltro} onChange={e=>{setCategoriaFiltro(e.target.value); filtrarPorCategoria(e.target.value)}}>
          <option value="">Todas</option>
          {categorias.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Tabla productos */}
      <h2>📋 Inventario Actual</h2>
      <table>
        <thead>
          <tr><th>Nombre</th><th>Cantidad</th><th>Estado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {productos.map(p=>(
            <tr key={p._id}>
              <td>{p.nombre}</td>
              <td>{p.cantidad}</td>
              <td style={{color:p.habilitado?'green':'red'}}>{p.habilitado?'Activo ✅':'Inactivo ⚠️'}</td>
              <td>
                <input type="number" placeholder="Cantidad" style={{width:'60px'}} 
                  onChange={e=>p.tempCantidad=e.target.value}/>
                <button onClick={()=>actualizarStock(p._id,p.tempCantidad||0)}>Actualizar Stock</button>
                <button onClick={()=>cambiarEstado(p._id,!p.habilitado)}>{p.habilitado?'Deshabilitar':'Habilitar'}</button>
                <button onClick={()=>setProductoInfo(p)}>Info</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal info editable */}
      {productoInfo && (
        <div className="modal">
          <h3>Editar Producto: {productoInfo.nombre}</h3>
          <label>Proveedor:</label>
          <input type="text" placeholder="Proveedor" value={productoInfo.proveedor}
            onChange={e=>setProductoInfo({...productoInfo, proveedor:e.target.value})} />
          <label>Cantidad:</label>
          <input type="number" placeholder="Cantidad" value={productoInfo.cantidad} 
            onChange={e=>setProductoInfo({...productoInfo, cantidad:e.target.value})} />
          <label>Costo:</label>
          <input type="number" placeholder="Costo" value={productoInfo.coste} 
            onChange={e=>setProductoInfo({...productoInfo, coste:e.target.value})} />
          <label>Precio:</label>
          <input type="number" placeholder="Precio" value={productoInfo.precio} 
            onChange={e=>setProductoInfo({...productoInfo, precio:e.target.value})} />
          <label>Fecha Registro:</label>
          <input type="text" value={new Date(productoInfo.fechaRegistro).toLocaleString()} readOnly />
          <label>Categoría:</label>
          <select value={productoInfo.categoria} onChange={e=>setProductoInfo({...productoInfo, categoria:e.target.value})}>
            {categorias.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <div style={{marginTop:'10px'}}>
            <button onClick={guardarCambiosProducto}>Guardar Cambios</button>
            <button onClick={()=>setProductoInfo(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
