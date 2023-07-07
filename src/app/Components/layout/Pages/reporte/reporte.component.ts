// Importar las dependencias necesarias
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import * as moment from "moment";
import * as XLSX from "xlsx";

import { Reporte } from 'src/app/Interfaces/reporte';
import { VentaService } from 'src/app/Services/venta.service';

// Definir el formato de fecha personalizado
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY'
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLable: 'MMMM YYYYY'
  }
};

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.component.html',
  styleUrls: ['./reporte.component.css'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ]
})
export class ReporteComponent implements OnInit {

  formularioFiltro: FormGroup;
  listaVentasReporte: Reporte[] = [];
  columnasTabla: string[] = ['fechaRegistro', 'numeroVenta', 'tipoPago', 'total', 'producto', 'cantidad', 'precio', 'totalProducto'];
  dataVentaReporte = new MatTableDataSource(this.listaVentasReporte);
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private _ventaServicio: VentaService,
  ) {
    // Crear el formulario de filtro
    this.formularioFiltro = this.fb.group({
      fechaInicio: ["", Validators.required],
      fechaFin: ["", Validators.required]
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Asignar el paginador a la tabla de datos
    this.dataVentaReporte.paginator = this.paginacionTabla;
  }

  // Buscar las ventas según las fechas de filtro seleccionadas
  buscarVentas() {
    const _fechaInicio = moment(this.formularioFiltro.value.fechaInicio).format('DD/MM/YYYY');
    const _fechaFin = moment(this.formularioFiltro.value.fechaFin).format('DD/MM/YYYY');

    this._ventaServicio.reporte(
      _fechaInicio,
      _fechaFin
    ).subscribe({
      next: (data)=>{
        if (data.status) {
          this.listaVentasReporte = data.value;
          this.dataVentaReporte.data = data.value;
        } else {
          this.listaVentasReporte = [];
          this.dataVentaReporte.data = [];
        }
      },
      error:(e) => {}
    });
  }

  // Aplicar filtro en la tabla de datos
  aplicarFiltroTabla(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataVentaReporte.filter = filterValue.trim().toLocaleLowerCase();
  }

  // Exportar los datos de ventas a un archivo Excel
  exportarExcel() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(this.listaVentasReporte);

    // Definir los encabezados de las columnas en el archivo Excel
    ws["A1"].v = "Fecha de Registro";
    ws["B1"].v = "Número de Venta";
    ws["C1"].v = "Tipo de Pago";
    ws["D1"].v = "Total";
    ws["E1"].v = "Producto";
    ws["F1"].v = "Cantidad";
    ws["G1"].v = "Precio";
    ws["H1"].v = "Total del Producto";

    // Definir el ancho de las columnas
    const columnWidths = [
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 20 },
      { wch: 10 },
      { wch: 10 },
      { wch: 20 } 
    ];
    ws["!cols"] = columnWidths;

    // Agregar la hoja al libro de trabajo y guardar como archivo Excel
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb,"Reporte Ventas.xlsx");
  }
}
