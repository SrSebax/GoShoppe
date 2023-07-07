// Importar las dependencias necesarias
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ModalUsuarioComponent } from '../../Modales/modal-usuario/modal-usuario.component';
import { Usuario } from 'src/app/Interfaces/usuario';
import { UsuarioService } from 'src/app/Services/usuario.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit, AfterViewInit {
  columnasCard: string[] = ['nombreCompleto', 'correo', 'rolDescripcion', 'estado', 'acciones'];
  dataInicio: Usuario[] = [];
  dataListaUsuarios: any[] = [];
  usuariosFiltrados: any[] = [];

  constructor(
    private dialog: MatDialog,
    private _usuarioServicio: UsuarioService,
    private _utilidadServicio: UtilidadService
  ) { }

  // Obtener la lista de usuarios
  obtenerUsuarios() {
    this._usuarioServicio.lista().subscribe({
      next: (data) => {
        if (data.status)
          this.dataListaUsuarios = data.value;
        else
          this._utilidadServicio.mostrarAlerta("No se encontraron datos", "Oops!")
          this.filtrarUsuarios('');
      },
      error: (e) => { }
    })
  }

  // Filtrar la lista de usuarios
  filtrarUsuarios(filtro: string) {
    if (filtro) {
      this.usuariosFiltrados = this.dataListaUsuarios.filter(usuario =>
        usuario.nombreCompleto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(filtro) ||
        usuario.correo.toLowerCase().includes(filtro) ||
        usuario.rolDescripcion.toLowerCase().includes(filtro) ||
        (usuario.esActivo && filtro.toLowerCase() === 'activo') ||
        (!usuario.esActivo && filtro.toLowerCase() === 'no activo')
      );
    } else {
      this.usuariosFiltrados = this.dataListaUsuarios;
    }
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.obtenerUsuarios();
  }

  // Abrir el modal para agregar un nuevo usuario
  nuevoUsuario() {
    this.dialog.open(ModalUsuarioComponent, {
      disableClose: true
    }).afterClosed().subscribe(resultado => {
      if (resultado === "true") this.obtenerUsuarios();
    });
  }

  // Abrir el modal para editar un usuario existente
  editarUsuario(usuario: Usuario) {
    this.dialog.open(ModalUsuarioComponent, {
      disableClose: true,
      data: usuario
    }).afterClosed().subscribe(resultado => {
      if (resultado === "true") this.obtenerUsuarios();
    });
  }

  // Eliminar un usuario
  eliminarUsuario(usuario: Usuario) {
    Swal.fire({
      title: '¿Desea eliminar el usuario?',
      text: usuario.nombreCompleto,
      icon: "warning",
      confirmButtonColor: "#d33",
      confirmButtonText: "Si, deseo eliminar",
      showCancelButton: true,
      cancelButtonColor: "#3085d6",
      cancelButtonText: "No, volver",
    }).then((resultado) => {
      if (resultado.isConfirmed) {
        this._usuarioServicio.eliminar(usuario.idUsuario).subscribe({
          next: (data) => {
            if (data.status) {
              this._utilidadServicio.mostrarAlerta("El usuario fue eliminado correctamente", "Exitoso!");
              this.obtenerUsuarios();
            } else
              this._utilidadServicio.mostrarAlerta("No se pudo eliminar el usuario", "Error!");
          },
          error: (e) => { }
        })
      }
    })
  }

  // Comprobar si un usuario está activo o no
  esActivo(valor: number): boolean {
    return valor === 1;
  }

  // Obtener la clase CSS para el estado de un usuario
  obtenerClaseEstado(esActivo: number): string {
    return esActivo === 1 ? 'img-active' : 'img-inactive';
  }

  // Obtener la imagen correspondiente a un rol de usuario
  obtenerImagen(rol: string): string {
    if (rol === 'Administrador') {
      return '../../../../../assets/images/img-usuarios/admin.png';
    } else {
      return '../../../../../assets/images/img-usuarios/empleado.png';
    }
  }
}
