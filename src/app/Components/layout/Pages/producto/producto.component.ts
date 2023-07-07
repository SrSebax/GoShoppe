// Importar las dependencias necesarias
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalProductoComponent } from '../../Modales/modal-producto/modal-producto.component';
import { Producto } from 'src/app/Interfaces/producto';
import { ProductoService } from 'src/app/Services/producto.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit, AfterViewInit {
  // Propiedades del componente
  columnasTablas: string[] = ['nombre', 'categoria', 'stock', 'precio', 'estado', 'acciones'];
  dataInicio: Producto[] = [];
  dataListaProductos: any[] = [];
  productosFiltrados: any[] = [];

  constructor(
    private dialog: MatDialog,
    private _productoServicio: ProductoService,
    private _utilidadServicio: UtilidadService
  ) {}

  // Obtener la lista de productos
  obtenerProductos() {
    this._productoServicio.lista().subscribe({
      next: (data) => {
        if (data.status)
          this.dataListaProductos = data.value;
        else
          this._utilidadServicio.mostrarAlerta("No se encontraron datos", "Oops!");
          this.filtrarProductos('');
      },
      error: (e) => { }
    });
  }

  // Método de inicialización del componente
  ngOnInit(): void {
    this.obtenerProductos();
  }

  // Método después de inicialización de la vista
  ngAfterViewInit(): void {
    this.obtenerProductos();
  }

  // Filtrar los productos por nombre, categoría y estado
  filtrarProductos(filtro: string) {
    if (filtro) {
      const filtroLowerCase = filtro.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      this.productosFiltrados = this.dataListaProductos.filter(producto =>
        producto.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(filtroLowerCase) ||
        producto.descripcionCategoria.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(filtroLowerCase) ||
        (producto.esActivo && filtroLowerCase === 'activo') ||
        (!producto.esActivo && filtroLowerCase === 'no activo')
      );
    } else {
      this.productosFiltrados = this.dataListaProductos;
    }
  }

  // Abrir el diálogo para agregar un nuevo producto
  nuevoProducto() {
    this.dialog.open(ModalProductoComponent, {
      disableClose: true
    }).afterClosed().subscribe(resultado => {
      if (resultado === "true") this.obtenerProductos();
    });
  }

  // Abrir el diálogo para editar un producto existente
  editarProducto(producto: Producto) {
    this.dialog.open(ModalProductoComponent, {
      disableClose: true,
      data: producto
    }).afterClosed().subscribe(resultado => {
      if (resultado === "true") this.obtenerProductos();
    });
  }

  // Eliminar un producto
  eliminarProducto(producto: Producto) {
    Swal.fire({
      title: '¿Desea eliminar el producto?',
      text: producto.nombre,
      icon: "warning",
      confirmButtonColor: "#d33",
      confirmButtonText: "Si, deseo eliminar",
      showCancelButton: true,
      cancelButtonColor: "#3085d6",
      cancelButtonText: "No, volver",
    }).then((resultado) => {
      if (resultado.isConfirmed) {
        this._productoServicio.eliminar(producto.idProducto).subscribe({
          next: (data) => {
            if (data.status) {
              this._utilidadServicio.mostrarAlerta("El producto fue eliminado correctamente", "Success");
              this.obtenerProductos();
            } else
              this._utilidadServicio.mostrarAlerta("No se pudo eliminar el producto", "Error!");
          },
          error: (e) => { }
        });
      }
    });
  }

  // Verificar si un producto está activo
  esActivo(valor: number): boolean {
    return valor === 1;
  }

  // Obtener la clase CSS correspondiente al estado de un producto (activo o inactivo)
  obtenerClaseEstado(esActivo: number): string {
    return esActivo === 1 ? 'img-active' : 'img-inactive';
  }

  // Obtener la ruta de la imagen correspondiente a la descripción de la categoría
  obtenerImagen(descripcionCategoria: string): string {
    let rutaImagen: string;

    switch (descripcionCategoria) {
      case 'Frutas y verduras':
        rutaImagen = '../../../../../assets/images/img-productos/frutas-y-verduras.png';
        break;
      case 'Carnes y embutidos':
        rutaImagen = '../../../../../assets/images/img-productos/carnes-y-embutidos.png';
        break;
      case 'Panadería':
        rutaImagen = '../../../../../assets/images/img-productos/panaderia.png';
        break;
      case 'Lácteos':
        rutaImagen = '../../../../../assets/images/img-productos/lacteos.png';
        break;
      case 'Bebidas':
        rutaImagen = '../../../../../assets/images/img-productos/bebidas.png';
        break;
      case 'Cuidado personal':
        rutaImagen = '../../../../../assets/images/img-productos/cuidado-personal.png';
        break;
      case 'Artículos de limpieza':
        rutaImagen = '../../../../../assets/images/img-productos/articulos-limpieza.png';
        break;
      case 'Dulces y snacks':
        rutaImagen = '../../../../../assets/images/img-productos/dulces-y-snacks.png';
        break;
      case 'Productos para el hogar':
        rutaImagen = '../../../../../assets/images/img-productos/productos-hogar.png';
        break;
      case 'Abarrotes':
        rutaImagen = '../../../../../assets/images/img-productos/abarrotes.png';
        break;
      case 'Cigarrillos y licores':
        rutaImagen = '../../../../../assets/images/img-productos/cigarrillos-y-licor.png';
        break;
      case 'Mascotas':
        rutaImagen = '../../../../../assets/images/img-productos/mascotas.png';
        break;
      case 'Seccion bebés':
        rutaImagen = '../../../../../assets/images/img-productos/seccion-bebes.png';
        break;
      case 'Utiles y papelería':
        rutaImagen = '../../../../../assets/images/img-productos/utiles-y-papeleria.png';
        break;
      default:
        rutaImagen = '';
        break;
    }
    return rutaImagen;
  }
}
