// Selección de elementos del DOM
const uploadForm = document.getElementById('upload-form');
const audioFileInput = document.getElementById('audio-file');
const uploadArea = document.getElementById('upload-area');
const uploadText = document.getElementById('upload-text');
const resultModal = document.getElementById('resultModal');
const modalBodyContent = document.getElementById('modal-body-content');

// Manejar arrastrar y soltar en el área de carga
uploadArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', (event) => {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (event) => {
    event.preventDefault();
    uploadArea.classList.remove('dragover');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        audioFileInput.files = files; // Asignar archivo al input
        handleFileUpload();
    }
});

// Manejo de selección de archivo mediante clic
audioFileInput.addEventListener('change', handleFileUpload);

function handleFileUpload() {
    if (audioFileInput.files.length > 0) {
        uploadArea.classList.add('uploaded');
        uploadText.textContent = `Archivo seleccionado: ${audioFileInput.files[0].name}`;
    }
}

// Hacer clic en el área para seleccionar archivo
uploadArea.addEventListener('click', () => {
    audioFileInput.click();
});

// Manejar envío del formulario
uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const file = audioFileInput.files[0];
    if (!file) {
        alert('Por favor, selecciona un archivo de audio.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://localhost:8000/classify-audio', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Error en la clasificación de audio.');
        }

        const result = await response.json();
        displayResult(result);
    } catch (error) {
        console.error('Error:', error);
        modalBodyContent.innerHTML = '<p>Ocurrió un error al enviar el archivo.</p>';
        $('#resultModal').modal('show');
    }
});

// Función para mostrar el resultado formateado en el modal
function displayResult(data) {
    modalBodyContent.innerHTML = '';  // Limpiar contenido anterior

    // Crear y mostrar el estado de si es un vehículo
    const isCar = document.createElement('p');
    isCar.innerHTML = `<strong>¿Es un vehículo?:</strong> ${data.is_car ? 'Sí' : 'No'}`;
    modalBodyContent.appendChild(isCar);

    // Mostrar la clase de sonido detectada
    const classification = document.createElement('p');
    classification.innerHTML = `<strong>Clasificación:</strong> ${data.classification}`;
    modalBodyContent.appendChild(classification);

    // Crear y mostrar las probabilidades de todas las clases
    const probabilitiesTitle = document.createElement('h4');
    probabilitiesTitle.innerText = 'Probabilidades por clase:';
    modalBodyContent.appendChild(probabilitiesTitle);

    const probabilitiesList = document.createElement('ul');
    for (const [soundClass, probability] of Object.entries(data.all_classification)) {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<strong>${soundClass}:</strong> ${probability}`;
        probabilitiesList.appendChild(listItem);
    }
    modalBodyContent.appendChild(probabilitiesList);

    // Mostrar el modal
    $('#resultModal').modal('show');
}
