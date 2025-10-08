const apiURL = "http://localhost:8000/api"; // Ajusta la URL de tu API
const token = localStorage.getItem("jwtToken"); // JWT guardado después de login

// Configuración axios
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    // Mostrar modal de login si no hay token
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

  const loginForm = document.getElementById("loginForm");
  loginForm.addEventListener("submit", login);

  const form = document.getElementById("pacienteForm");
  form.addEventListener("submit", savePaciente);

  document.getElementById("resetForm").addEventListener("click", resetForm);
});

// Función de login
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

      // Cerrar modal
      const loginModalEl = document.getElementById("loginModal");
      const loginModal = bootstrap.Modal.getInstance(loginModalEl);
      loginModal.hide();

      loadPacientes();
      loadSelects();
    })
    .catch((err) => {
      errorDiv.textContent =
        err.response?.data?.msg || "Error al iniciar sesión";
    });
}

// Cargar pacientes
function loadPacientes() {
  axios
    .get(`${apiURL}/pacientes`)
    .then((res) => {
      const tbody = document.querySelector("#pacientesTable tbody");
      tbody.innerHTML = "";

      // Acceder al array correcto
      const pacientes = res.data.data.data;

      pacientes.forEach((p) => {
        tbody.innerHTML += `
                    <tr>
                        <td>${p.id}</td>
                        <td>${p.nombre1}</td>
                        <td>${p.apellido1}</td>
                        <td>${p.numero_documento}</td>
                        <td>${p.correo}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editPaciente(${p.id})">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="deletePaciente(${p.id})">Eliminar</button>
                        </td>
                    </tr>
                `;
      });
    })
    .catch((err) => alert(err.response?.data?.msg || err.message));
}

// Cargar datos en selects
function loadSelects() {
  // Tipo de documentos
  axios
    .get(`${apiURL}/tipo_documentos`)
    .then((res) => {
      const select = document.getElementById("tipo_documento_id");
      select.innerHTML = '<option value="">Seleccione</option>'; // limpiar y agregar placeholder
      res.data.data.forEach((td) => {
        select.innerHTML += `<option value="${td.id}">${td.nombre}</option>`;
      });
    })
    .catch((err) => console.error("Error tipo_documentos:", err));

  // Géneros
  axios
    .get(`${apiURL}/generos`)
    .then((res) => {
      const select = document.getElementById("genero_id");
      select.innerHTML = '<option value="">Seleccione</option>';
      res.data.data.forEach((g) => {
        select.innerHTML += `<option value="${g.id}">${g.nombre}</option>`;
      });
    })
    .catch((err) => console.error("Error generos:", err));

  // Departamentos
  axios
    .get(`${apiURL}/departamentos`)
    .then((res) => {
      const select = document.getElementById("departamento_id");
      select.innerHTML = '<option value="">Seleccione</option>';
      res.data.data.forEach((d) => {
        select.innerHTML += `<option value="${d.id}">${d.nombre}</option>`;
      });

      // Evento para cargar municipios según departamento
      select.addEventListener("change", (e) => {
        const deptoId = e.target.value;
        const selectMunicipio = document.getElementById("municipio_id");
        selectMunicipio.innerHTML = '<option value="">Cargando...</option>';

        if (!deptoId) {
          selectMunicipio.innerHTML =
            '<option value="">Seleccione un departamento</option>';
          return;
        }

        axios
          .get(`${apiURL}/municipios/${deptoId}`)
          .then((res) => {
            selectMunicipio.innerHTML = '<option value="">Seleccione</option>';
            res.data.data.forEach((m) => {
              selectMunicipio.innerHTML += `<option value="${m.id}">${m.nombre}</option>`;
            });
          })
          .catch((err) => {
            console.error("Error municipios:", err);
            selectMunicipio.innerHTML =
              '<option value="">Error al cargar municipios</option>';
          });
      });
    })
    .catch((err) => console.error("Error departamentos:", err));
}

// Guardar o actualizar paciente
function savePaciente(e) {
  e.preventDefault();
  const form = document.getElementById("pacienteForm");
  const formData = new FormData(form);
  const id = document.getElementById("pacienteId").value;

  const request = id
    ? axios.put(`${apiURL}/pacientes/${id}`, formData)
    : axios.post(`${apiURL}/pacientes`, formData);

  request
    .then((res) => {
      alert(res.data.message);
      resetForm();
      loadPacientes();
    })
    .catch((err) => alert(err.response.data.msg || err.message));
}

// Editar paciente
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

      // Primero seleccionar departamento
      const departamentoSelect = document.getElementById("departamento_id");
      departamentoSelect.value = p.departamento_id;

      // Cargar municipios del departamento seleccionado
      const municipioSelect = document.getElementById("municipio_id");
      municipioSelect.innerHTML = '<option value="">Cargando...</option>';
      axios
        .get(`${apiURL}/municipios/${p.departamento_id}`)
        .then((res) => {
          municipioSelect.innerHTML = '<option value="">Seleccione</option>';
          res.data.data.forEach((m) => {
            municipioSelect.innerHTML += `<option value="${m.id}">${m.nombre}</option>`;
          });

          // Finalmente seleccionar el municipio del paciente
          municipioSelect.value = p.municipio_id;
        })
        .catch((err) => {
          console.error("Error al cargar municipios:", err);
          municipioSelect.innerHTML =
            '<option value="">Error al cargar municipios</option>';
        });
    })
    .catch((err) => alert(err.response?.data?.msg || err.message));
}

// Eliminar paciente
function deletePaciente(id) {
  if (!confirm("¿Deseas eliminar este paciente?")) return;
  axios
    .delete(`${apiURL}/pacientes/${id}`)
    .then((res) => {
      alert(res.data.msg);
      loadPacientes();
    })
    .catch((err) => alert(err.response.data.msg || err.message));
}

// Reset formulario
function resetForm() {
  document.getElementById("pacienteForm").reset();
  document.getElementById("pacienteId").value = "";
}
