let resources = [];
let recievedPreview = [];
const data = {
    "sponser_name": { x: 0, y: 0, font: "12px", bold: false, italic: false },
    "person_name": { x: 0, y: 0, font: "12px", bold: false, italic: false },
    "person_title": { x: 0, y: 0, font: "12px", bold: false, italic: false }
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
            element.style.fontSize = data[key].font || '12px';
            element.style.fontWeight = data[key].bold ? 'bold' : 'normal';
            element.style.fontStyle = data[key].italic ? 'italic' : 'normal';

            const controlContainer = document.createElement('div');
            controlContainer.className = 'control-container';

            // Font size dropdown
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

            // Bold button
            const boldButton = document.createElement('button');
            boldButton.className = 'control-button';
            boldButton.textContent = 'B';
            boldButton.style.fontWeight = 'bold';

            boldButton.addEventListener('click', function() {
                data[key].bold = !data[key].bold;
                element.style.fontWeight = data[key].bold ? 'bold' : 'normal';
            });

            // Italic button
            const italicButton = document.createElement('button');
            italicButton.className = 'control-button';
            italicButton.textContent = 'I';
            italicButton.style.fontStyle = 'italic';

            italicButton.addEventListener('click', function() {
                data[key].italic = !data[key].italic;
                element.style.fontStyle = data[key].italic ? 'italic' : 'normal';
            });

            // Append controls
            controlContainer.appendChild(dropdown);
            controlContainer.appendChild(boldButton);
            controlContainer.appendChild(italicButton);
            element.appendChild(controlContainer);

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

        setTimeout(() => {
            element.style.top = `${10 + Object.keys(data).indexOf(key) * 40}px`;
        });
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

    if (categoryValue === "Coupon Template") {
        data["coupon_amount"] = { x: 0, y: 0, font: "12px", visible: true, bold: false, italic: false };
    }
    data["additional_image"] = { x: 0, y: 0, src: "", visible: false };

    // Log the collected values
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
            setTimeout(()=> {
                createDraggableElements();
            },200)
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
            setTimeout(()=> {
                createDraggableElements();
            },200)
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

    const additionalImage = document.getElementById('additional_image');
    const imgRect = additionalImage.getBoundingClientRect();

    const formData = new FormData();
    formData.append('file', resources[2].value[0]);
    formData.append('additional_image', resources[3].value[0]); 
    formData.append('data', JSON.stringify(data));
    formData.append('width', mainImageDimensions.width);
    formData.append('additional_image_height', imgRect.height);
    formData.append('additional_image_width', imgRect.width);
    formData.append('height', mainImageDimensions.height);
    formData.append('user_id', 4);

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
        recievedPreview = blob;

        const modal = document.getElementById("myModal");
        const img = document.getElementById("base64Img");
        modal.style.display = "block";
        img.src = imageUrl;
    } catch (error) {
        console.error('Error:', error);
    }
}


function sendSaveCall() {
    const additionalImage = document.getElementById('additional_image');
    const imgRect = additionalImage.getBoundingClientRect();

    const formSaveData = new FormData();
    formSaveData.append('file', resources[2].value[0]); 
    formSaveData.append('additional_image', resources[3].value[0]); 
    formSaveData.append('data', JSON.stringify(data));
    formSaveData.append('width', mainImageDimensions.width);
    formSaveData.append('height', mainImageDimensions.height);
    formSaveData.append('additional_image_height', imgRect.height);
    formSaveData.append('additional_image_width', imgRect.width);
    formSaveData.append('language', resources[0].value);
    formSaveData.append('type', resources[1].value);
    formSaveData.append('preview', recievedPreview);
    formSaveData.append('user_id', 4);

    fetch('http://localhost:8000/api/save_file_data', {
        method: 'POST', 
        body: formSaveData,
    })
    .then(data => {
        console.log('Success:', data);
        closeModal();
        showToaster('File saved.')
    })
}

function showToaster(message) {
    const toaster = document.getElementById('toaster');
    toaster.innerHTML = message;
    toaster.className = "toaster show";

    setTimeout(function() {
        toaster.className = toaster.className.replace("show", "");
    }, 3000); // Hide after 3 seconds
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