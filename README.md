# 🖼️ Frontend – Gestión de Pacientes

Interfaz web para interactuar con la **API RESTful de pacientes desarrollada en Laravel 10 con autenticación JWT y MySQL**. Permite crear, listar, editar y eliminar pacientes de manera intuitiva y dinámica.

## 📂 Estructura de carpetas destacada

```env
|-- assets
|   |-- css
|   |   |-- styles.css
|   |-- js
|   |   |-- app.js
|   |-- img
|       |-- logo.png
|-- index.html
|-- README.md
```

- assets/css → hojas de estilo personalizadas.
- assets/js → scripts JavaScript para interacción con la API usando Axios.
- assets/img → imágenes y recursos gráficos de la aplicación.
- index.html → página principal con formulario y lista de pacientes.

## ⚙️ Tecnologías utilizadas

- **HTML5** – Estructura de la interfaz.
- **CSS3 / Bootstrap 5** – Diseño responsivo y estilos.
- **JavaScript** – Lógica del frontend.
- **Axios** – Para consumir la API RESTful de Laravel.

## 🖥️ Funcionalidades

- Registrar paciente

  - Formulario interactivo que envía una solicitud POST a /api/pacientes.
  - Validación de campos y mensajes de error en caso de datos inválidos.

- Listar pacientes

  - Solicitud GET a /api/pacientes.
  - Muestra los pacientes en una tabla responsiva con Bootstrap.

- Editar paciente

  - Botón de edición que abre un formulario con los datos del paciente.
  - Envía solicitud PUT a /api/pacientes/{id}.

- Eliminar paciente

  - Botón de eliminación que envía solicitud DELETE a /api/pacientes/{id}.
  - Confirmación antes de eliminar y mensajes dinámicos según la respuesta.

- Mensajes dinámicos
  - Éxito: "Paciente creado correctamente", "Paciente actualizado correctamente".
  - Error: "Error al crear paciente", "Error al eliminar paciente", etc.

## 📄 Cómo usar el frontend

1. Configuración previa

   - Asegúrate de que la API backend esté corriendo localmente en `http://127.0.0.1:8000`

   En mi caso, use la carpeta de localhost de XAMPP

   ```env
   file:///C:/xampp/htdocs/frontend-api/index.html
   ```

### 🛠️ Pasos para instalar y correr el proyecto

1. Clona este repositorio:

   ```bash
   git clone https://github.com/david99cartagena/sinergia-gestion-paciente-front.git
   ```

   ```bash
   cd sinergia-gestion-paciente-front
   ```

2. Abrir index.html en el navegador.

   > Si se desea usar un servidor local para pruebas, se puede abrir con **Live Server** en **VS Code**.

3. Configuración de Axios

   En `assets/js/app.js` define la URL base de la API

   ```js
   const API_BASE_URL = "http://127.0.0.1:8000/api";
   ```

## 📷 Imagenes de la Aplicacion

![](https://raw.githubusercontent.com/david99cartagena/sinergia-gestion-paciente-front/refs/heads/main/media/Screenshot_1.png)

![](https://raw.githubusercontent.com/david99cartagena/sinergia-gestion-paciente-front/refs/heads/main/media/Screenshot_2.png)

![](https://raw.githubusercontent.com/david99cartagena/sinergia-gestion-paciente-front/refs/heads/main/media/Screenshot_3.png)

![](https://raw.githubusercontent.com/david99cartagena/sinergia-gestion-paciente-front/refs/heads/main/media/Screenshot_4.png)

![](https://raw.githubusercontent.com/david99cartagena/sinergia-gestion-paciente-front/refs/heads/main/media/Screenshot_5.png)

![](https://raw.githubusercontent.com/david99cartagena/sinergia-gestion-paciente-front/refs/heads/main/media/Screenshot_6.png)
