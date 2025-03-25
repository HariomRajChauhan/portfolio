document.addEventListener("DOMContentLoaded", function () {
    const displayTop = document.getElementById("display-top");
    const displayBottom = document.getElementById("display-bottom");
    const buttons = document.querySelectorAll(".btn");

    buttons.forEach(button => {
        const normalSrc = button.src;
        const clickedSrc = normalSrc.replace(".png", "_clicked.png");

        button.addEventListener("mousedown", function () {
            button.src = clickedSrc;
        });

        button.addEventListener("mouseup", function () {
            button.src = normalSrc;
            handleInput(button.dataset.value);
        });

        button.addEventListener("mouseleave", function () {
            button.src = normalSrc;
        });
    });

    function handleInput(value) {
        let currentText = displayTop.innerText;

        if (value === "exit") {
            window.close();
        } else if (value === "DEL") {
            displayTop.innerText = currentText.slice(0, -1);
        } else if (value === "AC") {
            displayTop.innerText = "";
            displayBottom.innerText = "";
        } else if (value === "=") {
            try {
                let result = eval(currentText);
                if (result % 1 !== 0) {
                    result = result.toFixed(8); // Round if it's a float
                }
                displayBottom.innerText = result;
            } catch (error) {
                displayTop.innerText = "";
                displayBottom.innerText = "Error";
            }
        } else {
            displayTop.innerText += value;
        }
    }
});
