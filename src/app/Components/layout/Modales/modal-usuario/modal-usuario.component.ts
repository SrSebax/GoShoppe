// Importar las dependencias necesarias
import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Rol } from 'src/app/Interfaces/rol';
import { Usuario } from 'src/app/Interfaces/usuario';
import { RolService } from 'src/app/Services/rol.service';
import { UsuarioService } from 'src/app/Services/usuario.service';
import { UtilidadService } from 'src/app/Reutilizable/utilidad.service';

@Component({
  selector: 'app-modal-usuario',
  templateUrl: './modal-usuario.component.html',
  styleUrls: ['./modal-usuario.component.css']
})
export class ModalUsuarioComponent implements OnInit {
  // Propiedades del componente
  formularioUsuario: FormGroup;
  ocultarPassword: boolean = true;
  tituloAccion: string = "Agregar";
  botonAccion: string = "Guardar";
  listaRoles: Rol[] = [];

  // Constructor del componente
  constructor(
    private modalActual: MatDialogRef<ModalUsuarioComponent>,  // Referencia al diálogo actual
    @Inject(MAT_DIALOG_DATA) public datosUsuario: Usuario,  // Datos del usuario proporcionados al diálogo
    private fb: FormBuilder,  // FormBuilder para construir el formulario reactivo
    private _rolServicio: RolService,  // Servicio de rol para obtener la lista de roles
    private _usuarioServicio: UsuarioService,  // Servicio de usuario para guardar/editar el usuario
    private _utilidadServicio: UtilidadService  // Servicio de utilidad para mostrar alertas
  ) {
    // Inicializar el formulario reactivo y sus validadores
    this.formularioUsuario = this.fb.group({
      nombreCompleto: ["", Validators.required],
      correo: new FormControl('', [Validators.email]),
      idRol: ["", Validators.required],
      clave: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)]),
      esActivo: ["1", Validators.required]
    });

    if (this.datosUsuario != null) {
      this.tituloAccion = "Editar";
      this.botonAccion = "Actualizar";
    }

    // Obtener la lista de roles del servicio de rol
    this._rolServicio.lista().subscribe({
      next: (data) => {
        if (data.status) this.listaRoles = data.value;
      },
      error: (e) => { }
    });
  }

  // Método de inicialización del componente
  ngOnInit(): void {
    if (this.datosUsuario != null) {
      // Rellenar el formulario con los datos del usuario
      this.formularioUsuario.patchValue({
        nombreCompleto: this.datosUsuario.nombreCompleto,
        correo: this.datosUsuario.correo,
        idRol: this.datosUsuario.idRol,
        clave: this.datosUsuario.clave,
        esActivo: this.datosUsuario.esActivo.toString()
      });
    }
  }

  // Método para convertir a minúsculas el valor del campo de texto
  convertirAMinusculas(event: any) {
    const valorCampo = event.target.value;
    event.target.value = valorCampo.toLowerCase();
  }

  // Método para guardar o editar el usuario
  guardarEditar_Usuario() {
    const _usuario: Usuario = {
      idUsuario: this.datosUsuario == null ? 0 : this.datosUsuario.idUsuario,
      nombreCompleto: this.formularioUsuario.value.nombreCompleto,
      correo: this.formularioUsuario.value.correo,
      idRol: this.formularioUsuario.value.idRol,
      rolDescripcion: "",
      clave: this.formularioUsuario.value.clave,
      esActivo: parseInt(this.formularioUsuario.value.esActivo),
    }

    if (this.datosUsuario == null) {
      // Guardar el usuario mediante el servicio de usuario
      this._usuarioServicio.guardar(_usuario).subscribe({
        next: (data) => {
          if (data.status) {
            this._utilidadServicio.mostrarAlerta("El usuario fue registrado", "Exito!");
            this.modalActual.close("true");
          } else {
            this._utilidadServicio.mostrarAlerta("No se pudo registrar el usuario", "Error!");
          }
        },
        error: (e) => { }
      });
    } else {
      // Editar el usuario mediante el servicio de usuario
      this._usuarioServicio.editar(_usuario).subscribe({
        next: (data) => {
          if (data.status) {
            this._utilidadServicio.mostrarAlerta("El usuario fue editado", "Exito!");
            this.modalActual.close("true");
          } else {
            this._utilidadServicio.mostrarAlerta("No se pudo editar el usuario", "Error!");
          }
        },
        error: (e) => { }
      });
    }
  }
}
