export class Gui {
    elements = new Map();

    createElement(id, className, textContent, x, y, event) {
        const element = document.createElement("div");

        element.id = id;
        element.classList.add("gui", className);
        element.textContent = textContent;
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;

        document.body.appendChild(element);  
        this.elements.set(id, element);

        if (event) {
            element.addEventListener("click", event);
        }
    }

    deleteElement(id) {
        document.getElementById(id).remove();
        this.elements.delete(id);
    }

    hideElement(id) {
        document.getElementById(id).hidden = true;
    }

    showElement(id) {
        document.getElementById(id).hidden = false;
    }

    updateTextContent(id, textContent) {
        document.getElementById(id).textContent = textContent;
    }

    disableElement(id) {
        document.getElementById(id).classList.add("disabled");
    }

    enableElement(id) {
        document.getElementById(id).classList.remove("disabled");
    }
}
