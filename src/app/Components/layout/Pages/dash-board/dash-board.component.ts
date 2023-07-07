// Importar las dependencias necesarias
import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashBoardService } from 'src/app/Services/dash-board.service';

// Registrar los componentes de gráfico de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-dash-board',
  templateUrl: './dash-board.component.html',
  styleUrls: ['./dash-board.component.css']
})
export class DashBoardComponent implements OnInit {
  // Propiedades del componente
  totalIngresos: string = "0";
  totalVentas: string = "0";
  totalProductos: string = "0";

  constructor(
    private _dashboardServicio: DashBoardService  // Servicio del panel de control para obtener los datos del panel
  ) { }

  // Método para mostrar un gráfico de barras
  mostrarGrafico(labelGrafico: any[], dataGrafico: any[]) {
    const chartBarras = new Chart('chartBarras', {
      type: "bar",
      data: {
        labels: labelGrafico,
        datasets: [{
          label: "Número de Ventas",
          data: dataGrafico,
          backgroundColor: ['rgba(54, 162, 235, 0.2)'],
          borderColor: ['rgba(54, 162, 235, 1)'],
          borderWidth: 1
        }]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
  }

  // Método de inicialización del componente
  ngOnInit(): void {
    this._dashboardServicio.resumen().subscribe({
      next: (data) => {
        if (data.status) {
          // Obtener y formatear el total de ingresos
          const totalIngresosNumber = parseFloat(data.value.totalIngresos.replace(",", "."));
          if (!isNaN(totalIngresosNumber)) {
            const totalIngresosFormatted = totalIngresosNumber.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
            this.totalIngresos = totalIngresosFormatted.replace(".", ",");
          }
          this.totalVentas = data.value.totalVentas;
          this.totalProductos = data.value.totalProductos;

          // Obtener los datos del gráfico de ventas de la última semana
          const arrayData: any[] = data.value.ventasUltimaSemana;
          const labelTemp = arrayData.map((value) => value.fecha);
          const dataTemp = arrayData.map((value) => value.total);

          // Mostrar el gráfico de barras
          this.mostrarGrafico(labelTemp, dataTemp);
        }
      },
      error: (e) => { }
    });
  }
}
