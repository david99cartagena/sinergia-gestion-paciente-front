const apiURL = "http://localhost:8000/api"; // Ajusta la URL de tu API
const token = localStorage.getItem("jwtToken"); // JWT guardado después de login

// Configuración axios
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

// Interceptor global de errores
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      Swal.fire({
        icon: "error",
        title: "Sesión expirada",
        text: "Por favor inicia sesión de nuevo.",
      });
      localStorage.removeItem("jwtToken");
      location.reload();
    }
    return Promise.reject(error);
  }
);

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    const loginModal = new bootstrap.Modal(
      document.getElementById("loginModal"),
      { backdrop: "static", keyboard: false }
    );
    loginModal.show();
  } else {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    loadPacientes();
    loadSelects();
  }

  document.getElementById("loginForm").addEventListener("submit", login);
  document
    .getElementById("pacienteForm")
    .addEventListener("submit", savePaciente);
  document.getElementById("resetForm").addEventListener("click", resetForm);

  const searchInput = document.getElementById("searchPaciente");
  let debounceTimeout;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => loadPacientes(1), 300);
  });
});

let currentPage = 1;
const perPage = 5;

// ----- LOGIN -----
function login(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const errorDiv = document.getElementById("loginError");

  axios
    .post(`${apiURL}/login`, { email, password })
    .then((res) => {
      const token = res.data.token;
      localStorage.setItem("jwtToken", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      bootstrap.Modal.getInstance(document.getElementById("loginModal")).hide();
      loadPacientes();
      loadSelects();
    })
    .catch((err) => {
      errorDiv.textContent =
        err.response?.data?.msg || "Error al iniciar sesión";
    });
}

// ----- CARGAR PACIENTES -----
function loadPacientes(page = 1) {
  currentPage = page;
  const search = document.getElementById("searchPaciente").value.trim();
  const loader = document.getElementById("loader");
  loader.style.display = "block";

  axios
    .get(`${apiURL}/pacientes`, {
      params: { page, per_page: perPage, q: search },
    })
    .then((res) => {
      loader.style.display = "none";
      const tbody = document.querySelector("#pacientesTable tbody");
      tbody.innerHTML = "";
      const pacientes = res.data.data.data;

      pacientes.forEach((p) => {
        const fotoURL = p.foto
          ? `../paciente_api/public/storage/${p.foto}`
          : "../frontend-api/assets/img/imagen-no-disponible.png";
        tbody.innerHTML += `
          <tr>
            <td>${p.id}</td>
            <td>${p.nombre1}</td>
            <td>${p.apellido1}</td>
            <td>${p.numero_documento}</td>
            <td>${p.correo}</td>
            <td>
              <img src="${fotoURL}" alt="Imagen de ${p.nombre1}" onerror="this.onerror=null; this.src='../frontend-api/assets/img/imagen-no-disponible.png';" style="width:100px; height:auto;">
            </td>
            <td>
              <button class="btn btn-sm btn-warning" onclick="editPaciente(${p.id})">Editar</button>
              <button class="btn btn-sm btn-danger" onclick="deletePaciente(${p.id})">Eliminar</button>
            </td>
          </tr>
        `;
      });

      renderPagination(res.data.data.last_page);
    })
    .catch((err) => {
      loader.style.display = "none";
      const msg =
        err.response?.data?.msg ||
        (err.response?.data?.errors
          ? JSON.stringify(err.response.data.errors)
          : err.message);
      Swal.fire({
        icon: "error",
        title: "Error al cargar pacientes",
        text: msg,
      });
    });
}

// ----- PAGINACIÓN -----
function renderPagination(totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `<li class="page-item ${i === currentPage ? "active" : ""
      }">
      <a class="page-link" href="#" onclick="loadPacientes(${i})">${i}</a>
    </li>`;
  }
}

// ----- GUARDAR O ACTUALIZAR PACIENTE -----
async function savePaciente(e) {
  e.preventDefault();
  const form = document.getElementById("pacienteForm");
  const submitBtn = form.querySelector("button[type='submit']");
  submitBtn.disabled = true;

  const nombre1 = form.nombre1.value.trim();
  const apellido1 = form.apellido1.value.trim();
  const numero_documento = form.numero_documento.value.trim();
  const correo = form.correo.value.trim();
  const tipo_documento_id = form.tipo_documento_id.value;
  const genero_id = form.genero_id.value;
  const departamento_id = form.departamento_id.value;
  const municipio_id = form.municipio_id.value;

  // Validaciones básicas
  const textRegex = /^[a-zA-Z0-9\s]+$/; // letras y números
  const docRegex = /^\d{6,15}$/; // solo números
  const emailRegex = /^[^\s@]+@[^\s@]+\.(com|co)$/;

  if (
    !nombre1 ||
    !apellido1 ||
    !numero_documento ||
    !correo ||
    !tipo_documento_id ||
    !genero_id ||
    !departamento_id ||
    !municipio_id
  ) {
    Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Por favor completa todos los campos obligatorios.",
    });
    submitBtn.disabled = false;
    return;
  }
  if (!textRegex.test(nombre1) || !textRegex.test(apellido1)) {
    Swal.fire({
      icon: "warning",
      title: "Nombre/Apellido inválido",
      text: "Solo se permiten letras y números.",
    });
    submitBtn.disabled = false;
    return;
  }
  if (!docRegex.test(numero_documento)) {
    Swal.fire({
      icon: "warning",
      title: "Documento inválido",
      text: "Solo números entre 6 y 15 dígitos.",
    });
    submitBtn.disabled = false;
    return;
  }
  if (!emailRegex.test(correo)) {
    Swal.fire({
      icon: "warning",
      title: "Correo inválido",
      text: "Debe ser un correo válido (.com o .co).",
    });
    submitBtn.disabled = false;
    return;
  }
  // Validación de imagen
  const fotoInput = document.getElementById("foto");
  if (fotoInput && fotoInput.files.length > 0) {
    const foto = fotoInput.files[0];
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxSizeMB = 5;

    if (!allowedTypes.includes(foto.type)) {
      Swal.fire({
        icon: "warning",
        title: "Tipo de archivo inválido",
        text: "Solo JPG, JPEG o PNG.",
      });
      submitBtn.disabled = false;
      return;
    }
    if (foto.size > maxSizeMB * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "Archivo demasiado grande",
        text: `Máximo ${maxSizeMB}MB.`,
      });
      submitBtn.disabled = false;
      return;
    }
  }

  const formData = new FormData();
  formData.append("nombre1", nombre1);
  formData.append("apellido1", apellido1);
  formData.append("numero_documento", numero_documento);
  formData.append("correo", correo);
  formData.append("tipo_documento_id", tipo_documento_id);
  formData.append("genero_id", genero_id);
  formData.append("departamento_id", departamento_id);
  formData.append("municipio_id", municipio_id);
  if (fotoInput && fotoInput.files.length > 0)
    formData.append("foto", fotoInput.files[0]);

  const id = form.pacienteId.value;
  const request = id
    ? axios.put(`${apiURL}/pacientes/${id}`, formData)
    : axios.post(`${apiURL}/pacientes`, formData);

  request
    .then((res) => {
      // alert(res.data.message);
      Swal.fire({
        icon: "success",
        title: res.data?.msg,
        timer: 4000,
        showConfirmButton: false,
      });
      resetForm();
      loadPacientes();
    })
    // .catch((err) => alert(err.response.data.msg || err.message));
    .catch((err) => {
      const errors = err.response?.data?.errors;
      const msg = errors
        ? Object.values(errors).flat().join("\n")
        : err.response?.data?.msg || "Error interno";
      Swal.fire({ icon: "error", title: "Oops!", text: msg });
    })
    .finally(() => (submitBtn.disabled = false));
}

// ----- EDITAR PACIENTE -----
function editPaciente(id) {
  axios
    .get(`${apiURL}/pacientes/${id}`)
    .then((res) => {
      const p = res.data.data;
      document.getElementById("pacienteId").value = p.id;
      document.getElementById("nombre1").value = p.nombre1;
      document.getElementById("apellido1").value = p.apellido1;
      document.getElementById("numero_documento").value = p.numero_documento;
      document.getElementById("correo").value = p.correo;
      document.getElementById("tipo_documento_id").value = p.tipo_documento_id;
      document.getElementById("genero_id").value = p.genero_id;
      document.getElementById("departamento_id").value = p.departamento_id;

      const municipioSelect = document.getElementById("municipio_id");
      municipioSelect.innerHTML = '<option value="">Cargando...</option>';
      axios
        .get(`${apiURL}/municipios/${p.departamento_id}`)
        .then((res) => {
          municipioSelect.innerHTML = '<option value="">Seleccione</option>';
          res.data.data.forEach(
            (m) =>
              (municipioSelect.innerHTML += `<option value="${m.id}">${m.nombre}</option>`)
          );
          municipioSelect.value = p.municipio_id;
        })
        .catch((err) => {
          // console.error("Error al cargar municipios:", err);
          municipioSelect.innerHTML =
            '<option value="">Error al cargar municipios</option>';
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar los municipios.",
          });
        });
    })
    // .catch((err) => alert(err.response?.data?.msg || err.message));
    .catch((err) =>
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.msg || "No se pudo cargar el paciente",
      })
    );
}

// ----- ELIMINAR PACIENTE -----
function deletePaciente(id) {
  Swal.fire({
    title: "¿Deseas eliminar este paciente?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .delete(`${apiURL}/pacientes/${id}`)
        .then((res) => {
          Swal.fire({
            icon: "success",
            title: "Eliminado",
            text: res.data?.msg,
            timer: 2000,
            showConfirmButton: false,
          });
          loadPacientes();
        })
        .catch((err) =>
          Swal.fire({
            icon: "error",
            title: "Error",
            text: err.response?.data?.msg || err.message,
          })
        );
    }
  });
}

// ----- RESET FORMULARIO -----
function resetForm() {
  document.getElementById("pacienteForm").reset();
  document.getElementById("pacienteId").value = "";
}

// ----- CARGAR SELECTS -----
function loadSelects() {
  axios
    .get(`${apiURL}/tipo_documentos`)
    .then((res) => {
      const select = document.getElementById("tipo_documento_id");
      select.innerHTML = '<option value="">Seleccione</option>';
      res.data.data.forEach(
        (td) =>
          (select.innerHTML += `<option value="${td.id}">${td.nombre}</option>`)
      );
    })
    .catch((err) =>
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los tipos de documentos",
      })
    );

  axios
    .get(`${apiURL}/generos`)
    .then((res) => {
      const select = document.getElementById("genero_id");
      select.innerHTML = '<option value="">Seleccione</option>';
      res.data.data.forEach(
        (g) =>
          (select.innerHTML += `<option value="${g.id}">${g.nombre}</option>`)
      );
    })
    .catch((err) =>
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los géneros",
      })
    );

  axios
    .get(`${apiURL}/departamentos`)
    .then((res) => {
      const select = document.getElementById("departamento_id");
      select.innerHTML = '<option value="">Seleccione</option>';
      res.data.data.forEach(
        (d) =>
          (select.innerHTML += `<option value="${d.id}">${d.nombre}</option>`)
      );

      select.addEventListener("change", (e) => {
        const deptoId = e.target.value;
        const selectMunicipio = document.getElementById("municipio_id");
        selectMunicipio.innerHTML = '<option value="">Cargando...</option>';
        if (!deptoId)
          return (selectMunicipio.innerHTML =
            '<option value="">Seleccione un departamento</option>');

        axios
          .get(`${apiURL}/municipios/${deptoId}`)
          .then((res) => {
            selectMunicipio.innerHTML = '<option value="">Seleccione</option>';
            res.data.data.forEach(
              (m) =>
                (selectMunicipio.innerHTML += `<option value="${m.id}">${m.nombre}</option>`)
            );
          })
          .catch((err) => {
            selectMunicipio.innerHTML =
              '<option value="">Error al cargar municipios</option>';
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "No se pudieron cargar los municipios",
            });
          });
      });
    })
    .catch((err) =>
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los departamentos",
      })
    );
}
