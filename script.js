let resources = [];
let recievedPreview = [];
const data = {
    "sponser_name": { x: 0, y: 0, font: "12px" },
    "person_name": { x: 0, y: 0, font: "12px" },
    "person_title": { x: 0, y: 0, font: "12px" },
    "additional_image": { x: 0, y: 0, src: "", visible: false }
};
let mainImageDimensions = {
    width: 0,
    height: 0
};

function createDraggableElements() {
    const draggableContainer = document.getElementById('draggableContainer');
    draggableContainer.innerHTML = ''; // Clear existing elements

    const displayImage = document.getElementById('displayImage');
    const imgRect = displayImage.getBoundingClientRect();

    // Update the global variable with the height and width of the main image
    mainImageDimensions.width = imgRect.width;
    mainImageDimensions.height = imgRect.height;

    Object.keys(data).forEach(key => {
        if (key === 'additional_image' && !data[key].visible) return;

        let element;
        if (key === 'additional_image') {
            // Old code for additional image drag-and-drop
            element = document.createElement('img');
            element.src = data[key].src;
            element.id = key;
            element.className = 'draggable';
            element.style.maxWidth = '100px';
            element.style.position = 'absolute';

            element.addEventListener('dragstart', function(event) {
                event.dataTransfer.setData('text/plain', key);
                event.dataTransfer.setDragImage(element, element.width / 2, element.height / 2);
            });
        } else {
            // Create the text elements with default font size
            element = document.createElement('div');
            element.id = key;
            element.className = 'draggable';
            element.textContent = key.replace('_', ' ');
            element.style.fontSize = data[key].font || '12px'; // Apply default font size

            const dropdown = document.createElement('select');
            dropdown.className = 'dropdown';
            for (let i = 9; i <= 30; i++) {
                const option = document.createElement('option');
                option.value = `${i}px`;
                option.textContent = `${i}px`;
                if (i + "px" === data[key].font) {
                    option.selected = true;
                }
                dropdown.appendChild(option);
            }

            dropdown.addEventListener('change', function() {
                element.style.fontSize = this.value;
                data[key].font = this.value;
            });

            element.appendChild(dropdown);

            // Custom drag logic for text elements
            let isDragging = false;
            let offsetX, offsetY;

            element.addEventListener('mousedown', function(event) {
                isDragging = true;
                offsetX = event.clientX - element.getBoundingClientRect().left;
                offsetY = event.clientY - element.getBoundingClientRect().top;
                document.body.style.cursor = 'move';
            });

            document.addEventListener('mousemove', function(event) {
                if (isDragging) {
                    let x = event.clientX - offsetX;
                    let y = event.clientY - offsetY;

                    // Boundary check to prevent dragging out of the main image
                    if (x < imgRect.left) x = imgRect.left;
                    if (y < imgRect.top) y = imgRect.top;
                    if (x + element.offsetWidth > imgRect.right) x = imgRect.right - element.offsetWidth;
                    if (y + element.offsetHeight > imgRect.bottom) y = imgRect.bottom - element.offsetHeight;

                    element.style.left = `${x}px`;
                    element.style.top = `${y}px`;
                }
            });

            document.addEventListener('mouseup', function() {
                if (isDragging) {
                    isDragging = false;
                    document.body.style.cursor = 'default';

                    const x = element.getBoundingClientRect().left - imgRect.left;
                    const y = element.getBoundingClientRect().top - imgRect.top;

                    data[key].x = x;
                    data[key].y = y;
                }
            });
        }
        // Position markers to the right side of the image
        element.style.left = `${imgRect.left + imgRect.width + 20}px`;
        element.style.top = `${10 + Object.keys(data).indexOf(key) * 40}px`;

        draggableContainer.appendChild(element);
    });
}

const navigateToFormStep = (stepNumber) => {
    document.querySelectorAll(".form-step").forEach((formStepElement) => {
        formStepElement.classList.add("d-none");
    });
 
    document.querySelectorAll(".form-stepper-list").forEach((formStepHeader) => {
        formStepHeader.classList.add("form-stepper-unfinished");
        formStepHeader.classList.remove("form-stepper-active", "form-stepper-completed");
    });

    document.querySelector("#step-" + stepNumber).classList.remove("d-none");
    const formStepCircle = document.querySelector('li[step="' + stepNumber + '"]');
    formStepCircle.classList.remove("form-stepper-unfinished", "form-stepper-completed");
    formStepCircle.classList.add("form-stepper-active");
    for (let index = 0; index < stepNumber; index++) {
        const formStepCircle = document.querySelector('li[step="' + index + '"]');
        if (formStepCircle) {
            formStepCircle.classList.remove("form-stepper-unfinished", "form-stepper-active");
            formStepCircle.classList.add("form-stepper-completed");
        }
    }
};

document.querySelectorAll(".btn-navigate-form-step").forEach((formNavigationBtn) => {
    formNavigationBtn.addEventListener("click", () => {
        const stepNumber = parseInt(formNavigationBtn.getAttribute("step_number"));
        if (formNavigationBtn.innerText === "Next")  {
            if (validateForm(stepNumber - 1)) {
                navigateToFormStep(stepNumber);
            }
        } else {
            navigateToFormStep(stepNumber);
        }
    });
});

document.getElementById("userAccountSetupForm").addEventListener("submit", function(event) {
    event.preventDefault(); 
    resources = [];
    const languageSelect = document.querySelector("#step-1 select");
    const languageValue = languageSelect.options[languageSelect.selectedIndex].value;
    resources.push({ step: 1, value: languageValue });
    
    // Get template category from step 2
    const categorySelect = document.querySelector("#step-2 select");
    const categoryValue = categorySelect.options[categorySelect.selectedIndex].value;
    resources.push({ step: 2, value: categoryValue });
    
    // Get file from step 3 (template selection)
    const templateFileInput = document.querySelector("#step-3 input[type='file']");
    const templateFile = templateFileInput.files.length > 0 ? templateFileInput.files : "No file selected";
    resources.push({ step: 3, value: templateFile });

    // Get file from step 4 (logo upload)
    const logoFileInput = document.querySelector("#step-4 input[type='file']");
    const logoFile = logoFileInput.files.length > 0 ? logoFileInput.files : "No file selected";
    if (logoFile == "No file selected") {
        alert(`Step 4 must be filled out`);
        return
    }

    resources.push({ step: 4, value: logoFile });

    // Log the collected values
    console.log(resources);
    document.getElementById('main-editor').style.display = 'block';
    document.getElementById('main-editor-btn').style.display = 'block';
    document.getElementById('info-wizard').style.display = 'none';
    addLogoImage();
    startImageEditing();
    attachDragAndDropEventListners();

});

function startImageEditing() {
    const displayImage = document.getElementById('displayImage');
    const editableImage = resources[2].value;
    if (editableImage) {
        const reader = new FileReader();
        reader.onload = function(e) {
            displayImage.src = e.target.result;
            displayImage.style.display = 'block';
            createDraggableElements();
        };
        reader.readAsDataURL(editableImage[0]);
    }    
}

function addLogoImage() {
    const editableLogo = resources[3].value;
    if (editableLogo[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            data.additional_image.src = e.target.result;
            data.additional_image.visible = true;
            createDraggableElements();
        }
        reader.readAsDataURL(editableLogo[0]);
    }
}

function attachDragAndDropEventListners() {
    const displayImage = document.getElementById('displayImage');
    displayImage.addEventListener('dragover', function(event) {
        event.preventDefault();
    });

    displayImage.addEventListener('drop', function(event) {
        event.preventDefault();

        const rect = displayImage.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const elementId = event.dataTransfer.getData('text/plain');
        const draggableElement = document.getElementById(elementId);

        if (draggableElement) {
            draggableElement.style.left = `${x - draggableElement.offsetWidth / 2}px`;
            draggableElement.style.top = `${y - draggableElement.offsetHeight / 2}px`;

            const markerContainer = document.getElementById('markerContainer');
            markerContainer.appendChild(draggableElement);

            data[elementId].x = x;
            data[elementId].y = y;

            // console.log({
            //     ...data,
            //     main_image_dimensions: mainImageDimensions
            // });
        }
    });
}

async function sendPreviewCall() {
    const formData = new FormData();
    formData.append('file', resources[2].value[0]);
    formData.append('data', JSON.stringify(data));
    formData.append('width', mainImageDimensions.width);
    formData.append('height', mainImageDimensions.height);
    formData.append('id', 4);

    try {
        const response = await fetch('http://localhost:8000/api/edit_image_preview', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        const reader = new FileReader();
        reader.readAsDataURL(blob); // Read the Blob as a Data URL (Base64)
        reader.onloadend = function() {
            recievedPreview = reader.result;
        };

        const modal = document.getElementById("myModal");
        const img = document.getElementById("base64Img");
        modal.style.display = "block";
        img.src = imageUrl;
    } catch (error) {
        console.error('Error:', error);
    }
}


function sendSaveCall() {
    let obj = {
        file: resources[2].value,
        data: data, 
        width: mainImageDimensions.width, 
        height: mainImageDimensions.height,
        language: resources[0].value, 
        type: resources[1].value, 
        preview: recievedPreview,
        id: 4
    }

    console.log(obj);
    const formSaveData = new FormData();
    formSaveData.append('file', resources[2].value[0]); 
    formSaveData.append('data', JSON.stringify(data)); 
    formSaveData.append('width', mainImageDimensions.width);
    formSaveData.append('height', mainImageDimensions.height);
    formSaveData.append('language', resources[0].value);
    formSaveData.append('type', resources[1].value);
    formSaveData.append('preview', recievedPreview);
    formSaveData.append('id', 4);

    fetch('http://localhost:8000/api/save_file_data', {
        method: 'POST', 
        body: formSaveData,
    })
    .then(data => {
        console.log('Success:', data);
    })
}

function validateForm(stepNumber) {
    let form = document.forms["userAccountSetupForm"];
    let field = form.querySelector(`[name='${stepNumber}']`);

    if (!field) {
        alert(`Step ${stepNumber} field not found`);
        return false;
    }

    let value = field.value;

    if (value === "" || value === null || value === "Select Language" || value === "Select Templete Category") {
        alert(`Step ${stepNumber} must be filled out`);
        return false;
    } 

    return true;
}

function closeModal() {
    const modal = document.getElementById("myModal");
    modal.style.display = "none";
}