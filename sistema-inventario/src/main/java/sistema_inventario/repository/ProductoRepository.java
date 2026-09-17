package sistema_inventario.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sistema_inventario.model.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

}
