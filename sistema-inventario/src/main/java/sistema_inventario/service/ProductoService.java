package sistema_inventario.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import sistema_inventario.model.Producto;
import sistema_inventario.repository.ProductoRepository;

@Service
public class ProductoService {

    private final ProductoRepository repository;

    public ProductoService(ProductoRepository repository) {
        this.repository = repository;
    }

    // LISTAR
    public List<Producto> listarProductos() {
        return repository.findAll();
    }

    // BUSCAR POR ID
    public Optional<Producto> buscarPorId(Long id) {
        return repository.findById(id);
    }

    // BUSCAR POR NOMBRE (ACTIVIDAD 8)
    public List<Producto> buscarPorNombre(String nombre) {
        return repository.findByNombreContainingIgnoreCase(nombre);
    }

    // REGISTRAR
    public Producto guardarProducto(Producto producto) {
        return repository.save(producto);
    }

    // EDITAR
    public Producto actualizarProducto(Long id, Producto producto) {

        Optional<Producto> productoExistente =
                repository.findById(id);

        if (productoExistente.isPresent()) {

            Producto existente = productoExistente.get();

            existente.setCodigo(producto.getCodigo());
            existente.setNombre(producto.getNombre());
            existente.setMarca(producto.getMarca());
            existente.setCategoria(producto.getCategoria());
            existente.setProveedor(producto.getProveedor());
            existente.setPrecio(producto.getPrecio());
            existente.setCantidad(producto.getCantidad());
            existente.setStockMinimo(producto.getStockMinimo());

            return repository.save(existente);
        }

        return null;
    }

    // ELIMINAR
    public void eliminarProducto(Long id) {
        repository.deleteById(id);
    }
}