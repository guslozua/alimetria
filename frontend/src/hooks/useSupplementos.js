import { useState, useEffect, useCallback, useMemo } from 'react';
import suplementosService from '../services/suplementosService';

export const useSupplementos = (filtrosIniciales = {}) => {
  const [suplementos, setSupplementos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({ limit: 20, page: 1, ...filtrosIniciales });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const [suplementoSeleccionado, setSuplementoSeleccionado] = useState(null);
  const [busquedaLocal, setBusquedaLocal] = useState('');
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const cargarSupplementos = useCallback(async (nuevosFiltros = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const filtrosFinales = { ...filtros, ...nuevosFiltros };
      console.log('Cargando suplementos con filtros:', filtrosFinales);
      
      const response = await suplementosService.listar(filtrosFinales);
      
      setSupplementos(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
      setFiltros(filtrosFinales);
      
      console.log('Suplementos cargados:', response.data.length);
    } catch (err) {
      console.error('Error cargando suplementos:', err);
      setError('Error al cargar suplementos. Intenta nuevamente.');
      setSupplementos([]);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  const cargarCategorias = useCallback(async () => {
    try {
      console.log('Cargando categorías...');
      const response = await suplementosService.listarCategorias();
      setCategorias(response.data);
      console.log('Categorías cargadas:', response.data.length);
    } catch (err) {
      console.error('Error cargando categorías:', err);
      setCategorias([]);
    }
  }, []);

  const obtenerDetalle = useCallback(async (id) => {
    try {
      setLoadingDetalle(true);
      setError(null);
      
      console.log('Obteniendo detalle del suplemento:', id);
      const response = await suplementosService.obtenerDetalle(id);
      
      setSuplementoSeleccionado(response.data);
      console.log('Detalle obtenido para:', response.data.nombre);
      
      return response.data;
    } catch (err) {
      console.error('Error obteniendo detalle:', err);
      setError('Error al obtener detalle del suplemento.');
      return null;
    } finally {
      setLoadingDetalle(false);
    }
  }, []);

  const aplicarFiltros = useCallback((nuevosFiltros) => {
    const filtrosConPaginacion = { ...nuevosFiltros, page: 1 };
    cargarSupplementos(filtrosConPaginacion);
  }, [cargarSupplementos]);

  const cambiarPagina = useCallback((nuevaPagina) => {
    cargarSupplementos({ page: nuevaPagina });
  }, [cargarSupplementos]);

  const buscar = useCallback((termino) => {
    setBusquedaLocal(termino);
    aplicarFiltros({ busqueda: termino });
  }, [aplicarFiltros]);

  const busquedaInteligente = useCallback(async (query) => {
    try {
      const response = await suplementosService.busquedaInteligente(query);
      return response.data;
    } catch (err) {
      console.error('Error en búsqueda inteligente:', err);
      return [];
    }
  }, []);

  const filtrarPorCategoria = useCallback((categoriaId) => {
    const filtro = categoriaId === 'all' ? { categoria: undefined } : { categoria: categoriaId };
    aplicarFiltros(filtro);
  }, [aplicarFiltros]);

  const filtrarPorLetra = useCallback((letra) => {
    const filtro = letra ? { letra } : { letra: undefined };
    aplicarFiltros(filtro);
  }, [aplicarFiltros]);

  const limpiarFiltros = useCallback(() => {
    setBusquedaLocal('');
    aplicarFiltros({ categoria: undefined, letra: undefined, busqueda: undefined, destacados: undefined });
  }, [aplicarFiltros]);

  const cerrarDetalle = useCallback(() => {
    setSuplementoSeleccionado(null);
  }, []);

  const estadisticas = useMemo(() => {
    return {
      totalSupplementos: suplementos.length,
      totalCategorias: categorias.length,
      suplementosDestacados: suplementos.filter(s => s.destacado).length,
      categoriaConMasSupplementos: categorias.reduce((max, cat) => 
        cat.total_suplementos > (max?.total_suplementos || 0) ? cat : max, null
      )
    };
  }, [suplementos, categorias]);

  const suplementosPorCategoria = useMemo(() => {
    return suplementos.reduce((grupos, suplemento) => {
      const categoria = suplemento.categoria_nombre || 'Sin categoría';
      if (!grupos[categoria]) {
        grupos[categoria] = [];
      }
      grupos[categoria].push(suplemento);
      return grupos;
    }, {});
  }, [suplementos]);

  useEffect(() => {
    cargarSupplementos();
    cargarCategorias();
  }, []);

  useEffect(() => {
    const { page, ...filtrosSinPage } = filtros;
    const hasFilters = Object.values(filtrosSinPage).some(value => 
      value !== undefined && value !== '' && value !== null
    );
    
    console.log('Filtros activos:', hasFilters ? filtrosSinPage : 'ninguno');
  }, [filtros]);

  return {
    suplementos,
    categorias,
    loading,
    error,
    filtros,
    pagination,
    suplementoSeleccionado,
    busquedaLocal,
    loadingDetalle,
    cargarSupplementos,
    obtenerDetalle,
    aplicarFiltros,
    cambiarPagina,
    buscar,
    busquedaInteligente,
    filtrarPorCategoria,
    filtrarPorLetra,
    limpiarFiltros,
    cerrarDetalle,
    setBusquedaLocal,
    estadisticas,
    suplementosPorCategoria,
    hayFiltrosActivos: Object.values(filtros).some(v => v !== undefined && v !== '' && v !== 1 && v !== 20),
    hayResultados: suplementos.length > 0,
    esPrimeraCarga: !loading && suplementos.length === 0 && !error,
    ...suplementosService
  };
};

export default useSupplementos;