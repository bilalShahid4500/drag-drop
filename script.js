const resources = [];
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

                    // Log data with the main image dimensions from the global variable
                    console.log({
                        ...data,
                        main_image_dimensions: mainImageDimensions
                    });
                }
            });
        }

        // Position markers to the right side of the image
        element.style.left = `${imgRect.left + imgRect.width + 10}px`;
        element.style.top = `${10 + Object.keys(data).indexOf(key) * 40}px`;

        draggableContainer.appendChild(element);
    });
}

const navigateToFormStep = (stepNumber) => {
    /**
     * Hide all form steps.
     */
    document.querySelectorAll(".form-step").forEach((formStepElement) => {
        formStepElement.classList.add("d-none");
    });
    /**
     * Mark all form steps as unfinished.
     */
    document.querySelectorAll(".form-stepper-list").forEach((formStepHeader) => {
        formStepHeader.classList.add("form-stepper-unfinished");
        formStepHeader.classList.remove("form-stepper-active", "form-stepper-completed");
    });
    /**
     * Show the current form step (as passed to the function).
     */
    document.querySelector("#step-" + stepNumber).classList.remove("d-none");
    /**
     * Select the form step circle (progress bar).
     */
    const formStepCircle = document.querySelector('li[step="' + stepNumber + '"]');
    /**
     * Mark the current form step as active.
     */
    formStepCircle.classList.remove("form-stepper-unfinished", "form-stepper-completed");
    formStepCircle.classList.add("form-stepper-active");
    /**
     * Loop through each form step circles.
     * This loop will continue up to the current step number.
     * Example: If the current step is 3,
     * then the loop will perform operations for step 1 and 2.
     */
    for (let index = 0; index < stepNumber; index++) {
        /**
         * Select the form step circle (progress bar).
         */
        const formStepCircle = document.querySelector('li[step="' + index + '"]');
        /**
         * Check if the element exist. If yes, then proceed.
         */
        if (formStepCircle) {
            /**
             * Mark the form step as completed.
             */
            formStepCircle.classList.remove("form-stepper-unfinished", "form-stepper-active");
            formStepCircle.classList.add("form-stepper-completed");
        }
    }
};

document.querySelectorAll(".btn-navigate-form-step").forEach((formNavigationBtn) => {
    /**
     * Add a click event listener to the button.
     */
    formNavigationBtn.addEventListener("click", () => {
        /**
         * Get the value of the step.
         */
        const stepNumber = parseInt(formNavigationBtn.getAttribute("step_number"));
        /**
         * Call the function to navigate to the target form step.
         */
        navigateToFormStep(stepNumber);
    });
});

document.getElementById("userAccountSetupForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission
    // Get language from step 1
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
    resources.push({ step: 4, value: logoFile });

    // Log the collected values
    console.log(resources);
    document.getElementById('main-editor').style.display = 'block';
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
    document.getElementById('displayImage').addEventListener('dragover', function(event) {
        event.preventDefault();
    });
    
    document.getElementById('displayImage').addEventListener('drop', function(event) {
        event.preventDefault();
    
        const displayImage = document.getElementById('displayImage');
        const rect = displayImage.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
    
        const elementId = event.dataTransfer.getData('text/plain');
        const draggableElement = document.getElementById(elementId);
    
        if (draggableElement) {
            draggableElement.style.left = `${x - draggableElement.offsetWidth / 2}px`;
            draggableElement.style.top = `${y - draggableElement.offsetHeight / 2}px`;
    
            document.getElementById('markerContainer').appendChild(draggableElement);
    
            data[elementId].x = x;
            data[elementId].y = y;
    
            // Log data with the main image dimensions from the global variable
            console.log({
                ...data,
                main_image_dimensions: mainImageDimensions
            });
        }
    });
}