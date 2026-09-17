package sistema_inventario.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import sistema_inventario.model.Producto;
import sistema_inventario.service.ProductoService;

@RestController
@CrossOrigin(origins = "*")
public class ProductoController {

    private final ProductoService service;

    public ProductoController(ProductoService service) {
        this.service = service;
    }

    // GET - LISTAR TODOS
    @GetMapping("/productos")
    public List<Producto> listarProductos() {
        return service.listarProductos();
    }

    // GET - BUSCAR POR ID
    @GetMapping("/productos/{id}")
    public Producto buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id).orElse(null);
    }

    // POST - REGISTRAR
    @PostMapping("/productos")
    public Producto guardarProducto(
            @RequestBody Producto producto) {

        return service.guardarProducto(producto);
    }

    // PUT - EDITAR
    @PutMapping("/productos/{id}")
    public Producto actualizarProducto(
            @PathVariable Long id,
            @RequestBody Producto producto) {

        return service.actualizarProducto(id, producto);
    }

    // DELETE - ELIMINAR
    @DeleteMapping("/productos/{id}")
    public void eliminarProducto(@PathVariable Long id) {

        service.eliminarProducto(id);
    }

    // CLASE 9 - ENDPOINTS DE APRENDIZAJE
    @GetMapping("/categorias")
    public String listarCategorias() {
        return "Lista de categorias";
    }

    @GetMapping("/proveedores")
    public String listarProveedores() {
        return "Lista de proveedores";
    }
}