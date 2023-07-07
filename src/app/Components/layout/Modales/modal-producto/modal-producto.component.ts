// Importar las dependencias necesarias
import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Categoria } from 'src/app/Interfaces/categoria';
import { Producto } from 'src/app/Interfaces/producto';
import { CategoriaService } from 'src/app/Services/categoria.service';
import { ProductoService } from 'src/app/Services/producto.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';

@Component({
  selector: 'app-modal-producto',
  templateUrl: './modal-producto.component.html',
  styleUrls: ['./modal-producto.component.css']
})
export class ModalProductoComponent implements OnInit {
  // Propiedades del componente
  formularioProducto: FormGroup;
  tituloAccion: string = "Agregar";
  botonAccion: string = "Guardar";
  listaCategorias: Categoria[] = [];

  // Constructor del componente
  constructor(
    private modalActual: MatDialogRef<ModalProductoComponent>,  // Referencia al diálogo actual
    @Inject(MAT_DIALOG_DATA) public datosProducto: Producto,  // Datos del producto proporcionados al diálogo
    private fb: FormBuilder,  // FormBuilder para construir el formulario reactivo
    private _categoriaServicio: CategoriaService,  // Servicio de categoría para obtener la lista de categorías
    private _productoServicio: ProductoService,  // Servicio de producto para guardar/editar el producto
    private _utilidadServicio: UtilidadService  // Servicio de utilidad para mostrar alertas
  ) {
    // Inicializar el formulario reactivo y sus validadores
    this.formularioProducto = this.fb.group({
      nombre: ['', Validators.required],
      idCategoria: ['', Validators.required],
      stock: ['', Validators.required],
      precio: ['', Validators.required],
      esActivo: ['', Validators.required]
    });

    if (this.datosProducto != null) {
      this.tituloAccion = "Editar";
      this.botonAccion = "Actualizar";
    }

    // Obtener la lista de categorías del servicio de categoría
    this._categoriaServicio.lista().subscribe({
      next: (data) => {
        if (data.status) this.listaCategorias = data.value;
      },
      error: (e) => { }
    });
  }

  // Método de inicialización del componente
  ngOnInit(): void {
    if (this.datosProducto != null) {
      // Rellenar el formulario con los datos del producto
      this.formularioProducto.patchValue({
        nombre: this.datosProducto.nombre,
        idCategoria: this.datosProducto.idCategoria,
        stock: this.datosProducto.stock,
        precio: this.datosProducto.precio,
        esActivo: this.datosProducto.esActivo.toString()
      });
    }
  }

  // Método para guardar o editar el producto
  guardarEditar_Producto() {
    const _producto: Producto = {
      idProducto: this.datosProducto == null ? 0 : this.datosProducto.idProducto,
      nombre: this.formularioProducto.value.nombre,
      idCategoria: this.formularioProducto.value.idCategoria,
      descripcionCategoria: "",
      precio: this.formularioProducto.value.precio,
      stock: this.formularioProducto.value.stock,
      esActivo: parseInt(this.formularioProducto.value.esActivo),
    }

    if (this.datosProducto == null) {
      // Guardar el producto mediante el servicio de producto
      this._productoServicio.guardar(_producto).subscribe({
        next: (data) => {
          if (data.status) {
            this._utilidadServicio.mostrarAlerta("El producto fue registrado", "Exito!");
            this.modalActual.close("true");
          } else {
            this._utilidadServicio.mostrarAlerta("No se pudo registrar el producto", "Error!");
          }
        },
        error: (e) => { }
      });
    } else {
      // Editar el producto mediante el servicio de producto
      this._productoServicio.editar(_producto).subscribe({
        next: (data) => {
          if (data.status) {
            this._utilidadServicio.mostrarAlerta("El producto fue editado", "Exito!");
            this.modalActual.close("true");
          } else {
            this._utilidadServicio.mostrarAlerta("No se pudo editar el producto", "Error!");
          }
        },
        error: (e) => { }
      });
    }
  }
}
