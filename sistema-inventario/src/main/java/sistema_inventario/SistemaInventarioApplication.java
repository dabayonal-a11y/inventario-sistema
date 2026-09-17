package sistema_inventario;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import sistema_inventario.model.Producto;
import sistema_inventario.repository.ProductoRepository;

@SpringBootApplication
public class SistemaInventarioApplication {

    public static void main(String[] args) {
        SpringApplication.run(SistemaInventarioApplication.class, args);
    }

    @Bean
    CommandLineRunner probarRepositorio(ProductoRepository repository) {

        return args -> {

            if (repository.count() == 0) {
                System.out.println("Cargando productos iniciales de prueba...");
                repository.save(new Producto(null, "PROD-001", "Laptop Dell Inspiron", "Tecnología", "Dell Colombia", 2850000.0, 15, 5));
                repository.save(new Producto(null, "PROD-002", "Mouse Inalámbrico Logitech", "Accesorios", "Logitech", 65000.0, 4, 10));
                repository.save(new Producto(null, "PROD-003", "Teclado Mecánico RGB", "Accesorios", "Redragon", 180000.0, 0, 5));
                repository.save(new Producto(null, "PROD-004", "Monitor 24 Pulgadas IPS", "Monitores", "LG Electronics", 620000.0, 20, 8));
                repository.save(new Producto(null, "PROD-005", "Impresora Multifuncional", "Oficina", "Epson", 890000.0, 8, 3));
            }

            System.out.println("PRODUCTOS REGISTRADOS:");

            repository.findAll().forEach(producto -> {
                System.out.println(producto.getNombre());
            });

        };
    }

}
