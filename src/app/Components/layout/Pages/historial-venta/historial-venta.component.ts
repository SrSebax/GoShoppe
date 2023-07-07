// Importar las dependencias necesarias
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import * as moment from "moment";

import { ModalDetalleVentaComponent } from '../../Modales/modal-detalle-venta/modal-detalle-venta.component';
import { Venta } from 'src/app/Interfaces/venta';
import { VentaService } from 'src/app/Services/venta.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';

// Formato de fecha personalizado para los componentes de fecha de Angular Material
export const MY_DATA_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY'
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLable: 'MMMM YYYYY'
  }
}

@Component({
  selector: 'app-historial-venta',
  templateUrl: './historial-venta.component.html',
  styleUrls: ['./historial-venta.component.css'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATA_FORMATS }
  ]
})
export class HistorialVentaComponent implements OnInit, AfterViewInit {
  // Propiedades del componente
  formularioBusqueda: FormGroup;
  opcionesBusqueda: any[] = [
    { value: "fecha", descripcion: "Por fechas" },
    { value: "numero", descripcion: "Número venta" },
  ]
  columnasTabla: string[] = ['fechaRegistro', 'numeroDocumento', 'tipoPago', 'total', 'accion']
  dataInicio: Venta[] = [];
  datosListaVenta = new MatTableDataSource(this.dataInicio);

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private _ventaServicio: VentaService,
    private _utilidadServicio: UtilidadService
  ) {
    // Inicializar el formulario de búsqueda
    this.formularioBusqueda = this.fb.group({
      buscarPor: ['fecha'],
      numero: [""],
      fechaInicio: [""],
      fechaFin: [""]
    });

    // Reiniciar los valores del formulario cuando cambia la opción de búsqueda
    this.formularioBusqueda.get("buscarPor")?.valueChanges.subscribe(value => {
      this.formularioBusqueda.patchValue({
        numero: "",
        fechaInicio: "",
        fechaFin: ""
      });
    });
  }

  // Método de inicialización del componente
  ngOnInit(): void {}

  // Método después de inicialización de la vista
  ngAfterViewInit(): void {}

  // Aplicar filtro a la tabla
  aplicarFiltroTabla(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.datosListaVenta.filter = filterValue.trim().toLocaleLowerCase();
  }

  // Buscar ventas
  buscarVentas() {
    let _fechaInicio: string = "";
    let _fechaFin: string = "";
    let _numeroVenta: String = "";

    if (this.formularioBusqueda.value.buscarPor === "fecha") {
      // Formatear las fechas de inicio y fin en formato 'DD/MM/YYYY'
      _fechaInicio = moment(this.formularioBusqueda.value.fechaInicio).format('DD/MM/YYYY');
      _fechaFin = moment(this.formularioBusqueda.value.fechaFin).format('DD/MM/YYYY');

      // Validar que las fechas sean válidas
      if (_fechaInicio === "Invalid date" || _fechaFin === "Invalid date") {
        this._utilidadServicio.mostrarAlerta("Debe ingresar ambas fechas", "Oops");
        return;
      }

      // Validar que se ingrese un número de venta
      if (_numeroVenta === "Invalid date") {
        this._utilidadServicio.mostrarAlerta("Debe ingresar un numero de venta", "Oops");
        return;
      }
    }

    // Llamar al servicio de venta para obtener el historial de ventas
    this._ventaServicio.historial(
      this.formularioBusqueda.value.buscarPor,
      this.formularioBusqueda.value.numero,
      _fechaInicio,
      _fechaFin
    ).subscribe({
      next: (data) => {
        if (data.status) 
          this.datosListaVenta = data.value;
      },
      error:(e) => {}
    });
  }

  // Ver el detalle de una venta
  verDetalleVenta(_venta:Venta){
    this.dialog.open(ModalDetalleVentaComponent,{
      data: _venta,
      disableClose: true,
      width: '700px'
    });
  }
}
