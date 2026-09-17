package sistema_inventario.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import sistema_inventario.model.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    List<Producto> findByNombreContainingIgnoreCase(String nombre);
}
