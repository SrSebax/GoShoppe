// Importar las dependencias necesarias
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Menu } from 'src/app/Interfaces/menu';
import { MenuService } from 'src/app/Services/menu.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';

// Definir el componente
@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  // Propiedades del componente
  listaMenus: Menu[] = [];
  nombreUsuario: string = "";
  rolUsuario: string = "";
  paginaActual: string = "";

  // Constructor del componente
  constructor(
    private router: Router,  // Inyectar el servicio Router
    private _menuServicio: MenuService,  // Inyectar el servicio MenuService
    private _utilidadServicio: UtilidadService  // Inyectar el servicio UtilidadService
  ) { }

  // Método de inicialización del componente
  ngOnInit(): void {
    const usuario = this._utilidadServicio.obtenerSesionUsuario();
    if (usuario != null) {
      this.nombreUsuario = usuario.nombreCompleto;
      this.rolUsuario = usuario.rolDescripcion;
      this._menuServicio.lista(usuario.idUsuario).subscribe({
        next: (data) => {
          if (data.status) this.listaMenus = data.value;
        },
        error: (e) => { }
      });
    }

    // Suscribirse a los eventos de cambio de navegación
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.paginaActual = event.urlAfterRedirects;
      });
  }

  // Método para cerrar la sesión
  cerrarSesion() {
    this._utilidadServicio.eliminarSesionUsuario();
    this.router.navigate(["login"]);
  }

  // Método para obtener la imagen según el rol del usuario
  obtenerImagen(rol: string): string {
    if (rol === 'Administrador') {
      return '../../../../../assets/images/img-usuarios/admin.png';
    } else {
      return '../../../../../assets/images/img-usuarios/empleado.png';
    }
  }

  // Método para verificar si una página está activa
  esPaginaActiva(url: string): boolean {
    return this.paginaActual === url;
  }
}
