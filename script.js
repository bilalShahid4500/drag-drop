const data = {
    "sponser_name": { x: 0, y: 0, font: "12px" },
    "person_name": { x: 0, y: 0, font: "12px" },
    "person_title": { x: 0, y: 0, font: "12px" },
    "additional_image": { x: 0, y: 0, src: "", visible: false }
};

document.getElementById('imageInput').addEventListener('change', function() {
    const fileInput = document.getElementById('imageInput');
    const displayImage = document.getElementById('displayImage');

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();

        reader.onload = function(e) {
            displayImage.src = e.target.result;
            displayImage.style.display = 'block';

            // Trigger re-positioning of draggable elements after image is loaded
            createDraggableElements();
        }

        reader.readAsDataURL(fileInput.files[0]);
    }
});

document.getElementById('additionalImageInput').addEventListener('change', function() {
    const fileInput = document.getElementById('additionalImageInput');

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();

        reader.onload = function(e) {
            data.additional_image.src = e.target.result;
            data.additional_image.visible = true;

            createDraggableElements();
        }

        reader.readAsDataURL(fileInput.files[0]);
    }
});

function createDraggableElements() {
    const draggableContainer = document.getElementById('draggableContainer');
    draggableContainer.innerHTML = ''; // Clear existing elements

    const displayImage = document.getElementById('displayImage');
    const imgWidth = displayImage.clientWidth;

    Object.keys(data).forEach(key => {
        if (key === 'additional_image' && !data[key].visible) return;

        let element;
        if (key === 'additional_image') {
            element = document.createElement('img');
            element.src = data[key].src;
            element.id = key;
            element.className = 'draggable';
            element.style.width = '100px';  // Set initial size
            element.style.height = 'auto';  // Maintain aspect ratio
        } else {
            element = document.createElement('div');
            element.id = key;
            element.className = 'draggable';
            element.textContent = key.replace('_', ' ');

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
        }

        element.style.left = `${imgWidth + 10}px`;
        element.style.top = `${10 + Object.keys(data).indexOf(key) * 40}px`;

        draggableContainer.appendChild(element);

        // Custom drag logic for all elements, including the additional image
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
                const x = event.clientX - offsetX;
                const y = event.clientY - offsetY;

                element.style.left = `${x}px`;
                element.style.top = `${y}px`;
            }
        });

        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                document.body.style.cursor = 'default';

                const rect = displayImage.getBoundingClientRect();
                const x = element.getBoundingClientRect().left - rect.left;
                const y = element.getBoundingClientRect().top - rect.top;

                data[key].x = x;
                data[key].y = y;

                console.log(data);
            }
        });
    });
}


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

        console.log(data);
    }
});
